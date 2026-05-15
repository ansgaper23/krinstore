import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, signOut } from "@/hooks/use-auth";
import { Logo } from "@/components/Logo";
import { LogOut, Users, CreditCard, RefreshCw, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/superadmin")({ component: SuperAdmin });

function SuperAdmin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"users" | "subs" | "sync" | "analytics">("users");

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "superadmin").maybeSingle()
      .then(({ data }) => setAllowed(!!data));
  }, [user, loading, navigate]);

  if (loading || allowed === null) return <div className="min-h-screen flex items-center justify-center">Verificando permisos...</div>;
  if (!allowed) return (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Acceso denegado</h1>
        <p className="mt-2 text-muted-foreground">Esta sección es solo para administradores.</p>
        <Link to="/dashboard" className="mt-4 inline-block text-rose-deep hover:underline">Ir al dashboard →</Link>
      </div>
    </div>
  );

  const tabs = [
    { id: "users", label: "Usuarios", icon: Users },
    { id: "subs", label: "Suscripciones", icon: CreditCard },
    { id: "sync", label: "Sync API", icon: RefreshCw },
    { id: "analytics", label: "Analytics global", icon: BarChart3 },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="px-2 py-0.5 rounded-full bg-ink text-blush text-[10px] uppercase tracking-wider font-medium">Super Admin</span>
        </div>
        <button onClick={signOut} className="text-sm text-muted-foreground flex items-center gap-2"><LogOut className="w-4 h-4" /> Salir</button>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex gap-2 border-b border-border mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm flex items-center gap-2 border-b-2 -mb-px transition ${tab === t.id ? "border-primary text-rose-deep" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "users" && <UsersTab />}
        {tab === "subs" && <SubsTab />}
        {tab === "sync" && <SyncTab />}
        {tab === "analytics" && <GlobalAnalytics />}
      </div>
    </div>
  );
}

function UsersTab() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("profiles").select("*, stores(subdomain, status, is_active), subscriptions(status, plan)").then(({ data }) => setRows(data ?? []));
  }, []);
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
          <tr><Th>Usuario</Th><Th>Tienda</Th><Th>Plan</Th><Th>Estado</Th><Th>Mayorista</Th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border">
              <Td>{r.full_name || r.email}<div className="text-xs text-muted-foreground">{r.email}</div></Td>
              <Td>{r.stores?.[0]?.subdomain ?? "-"}</Td>
              <Td>{r.subscriptions?.[0]?.plan ?? "-"}</Td>
              <Td>{r.subscriptions?.[0]?.status ?? "-"}</Td>
              <Td>{r.is_mayorista ? "Sí" : "No"}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubsTab() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("subscriptions").select("*, profiles(email, full_name)").order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? []));
  }, []);
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
          <tr><Th>Usuario</Th><Th>Plan</Th><Th>Estado</Th><Th>Próximo cobro</Th><Th>Monto</Th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border">
              <Td>{r.profiles?.email ?? r.user_id.slice(0, 8)}</Td>
              <Td>{r.plan}</Td>
              <Td><span className={`px-2 py-0.5 rounded text-xs ${r.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{r.status}</span></Td>
              <Td>{r.next_billing_date ? new Date(r.next_billing_date).toLocaleDateString() : "-"}</Td>
              <Td>${Number(r.amount).toLocaleString()}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SyncTab() {
  const [last, setLast] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  useEffect(() => {
    supabase.from("krincesa_products_cache").select("last_synced_at", { count: "exact" }).order("last_synced_at", { ascending: false }).limit(1)
      .then(({ data, count }) => { setLast(data?.[0]?.last_synced_at ?? null); setCount(count ?? 0); });
  }, []);
  return (
    <div className="bg-card rounded-2xl border border-border p-8">
      <h3 className="font-display text-2xl text-ink">Sincronización de catálogo Krincesa</h3>
      <div className="mt-4 text-sm text-muted-foreground">
        <div>Productos en caché: <strong className="text-foreground">{count}</strong></div>
        <div>Último sync: <strong className="text-foreground">{last ? new Date(last).toLocaleString() : "Nunca"}</strong></div>
      </div>
      <button className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium">
        Forzar sincronización
      </button>
      <p className="mt-3 text-xs text-muted-foreground">Próximamente: sync automático cada 24h vía edge function programada.</p>
    </div>
  );
}

function GlobalAnalytics() {
  const [data, setData] = useState({ stores: 0, events: 0, topStores: [] as any[] });
  useEffect(() => {
    (async () => {
      const [{ count: stores }, { count: events }, { data: top }] = await Promise.all([
        supabase.from("stores").select("*", { count: "exact", head: true }),
        supabase.from("store_analytics").select("*", { count: "exact", head: true }),
        supabase.from("stores").select("subdomain, store_name").limit(10),
      ]);
      setData({ stores: stores ?? 0, events: events ?? 0, topStores: top ?? [] });
    })();
  }, []);
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="text-xs uppercase text-muted-foreground">Tiendas totales</div>
        <div className="font-display text-4xl mt-1">{data.stores}</div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="text-xs uppercase text-muted-foreground">Eventos registrados</div>
        <div className="font-display text-4xl mt-1">{data.events}</div>
      </div>
      <div className="md:col-span-2 bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-medium mb-3">Tiendas activas</h3>
        <ul className="space-y-2">
          {data.topStores.map((s: any) => (
            <li key={s.subdomain} className="flex justify-between text-sm border-b border-border last:border-0 py-2">
              <span>{s.store_name}</span>
              <a href={`/s/${s.subdomain}`} target="_blank" rel="noopener" className="text-rose-deep hover:underline">{s.subdomain}.krinstore.com</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Th({ children }: any) { return <th className="text-left px-4 py-3 font-medium">{children}</th>; }
function Td({ children }: any) { return <td className="px-4 py-3">{children}</td>; }
