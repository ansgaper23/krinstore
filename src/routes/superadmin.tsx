import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, signOut } from "@/hooks/use-auth";
import { Logo } from "@/components/Logo";
import { LogOut, Users, CreditCard, RefreshCw, BarChart3, Ticket, Copy, Check, Plus, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/superadmin")({ component: SuperAdmin });

type Tab = "users" | "subs" | "tickets" | "sync" | "analytics";

function SuperAdmin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("users");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    
    const checkAdmin = async () => {
      // Hardcoded check for the owner email as a fallback
      if (user.email === 'jorge968122@gmail.com') {
        setAllowed(true);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      
      if (error) {
        console.error("Error checking superadmin role:", error);
        setAllowed(false);
        return;
      }
      
      const isSuperadmin = data?.some(r => (r as any).role === "superadmin");
      setAllowed(isSuperadmin);
    };

    checkAdmin();
  }, [user, authLoading, navigate]);

  if (authLoading || allowed === null) return <div className="min-h-screen flex items-center justify-center">Verificando permisos...</div>;
  if (!allowed) return (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Acceso denegado</h1>
        <p className="mt-2 text-muted-foreground">Esta sección es solo para administradores.</p>
        <Link to="/dashboard" className="mt-4 inline-block text-rose-deep hover:underline">Ir al dashboard →</Link>
      </div>
    </div>
  );

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "users", label: "Usuarios", icon: Users },
    { id: "subs", label: "Suscripciones", icon: CreditCard },
    { id: "tickets", label: "Tickets", icon: Ticket },
    { id: "sync", label: "Sync API", icon: RefreshCw },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/dashboard" className="p-1.5 -ml-1.5 rounded-lg hover:bg-muted lg:hidden"><ArrowLeft className="w-5 h-5" /></Link>
          <Logo />
          <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-ink text-blush text-[10px] uppercase tracking-wider font-medium">Super Admin</span>
        </div>
        <button onClick={signOut} className="text-sm text-muted-foreground flex items-center gap-2"><LogOut className="w-4 h-4" /><span className="hidden sm:inline">Salir</span></button>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-3 md:px-4 py-3 text-sm flex items-center gap-2 border-b-2 -mb-px transition whitespace-nowrap ${tab === t.id ? "border-primary text-rose-deep" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "users" && <UsersTab />}
        {tab === "subs" && <SubsTab />}
        {tab === "tickets" && <TicketsTab userId={user!.id} />}
        {tab === "sync" && <SyncTab />}
        {tab === "analytics" && <GlobalAnalytics />}
      </div>
    </div>
  );
}

function UsersTab() {
  const [rows, setRows] = useState<any[]>([]);
  const reload = () => supabase.from("profiles").select("*, stores(subdomain, status, is_active), subscriptions(status, plan), user_roles(role)").then(({ data }) => setRows(data ?? []));
  useEffect(() => { reload(); }, []);

  const toggleAdmin = async (userId: string, isAdmin: boolean) => {
    if (isAdmin) {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "superadmin");
    } else {
      await supabase.from("user_roles").insert({ user_id: userId, role: "superadmin" });
    }
    reload();
  };

  const deleteStore = async (storeId: string) => {
    if (!confirm("¿Seguro que querés eliminar esta tienda? Esta acción es irreversible.")) return;
    await supabase.from("stores").delete().eq("id", storeId);
    reload();
  };

  const toggleStoreStatus = async (storeId: string, current: string) => {
    const next = current === "active" ? "suspended" : "active";
    await supabase.from("stores").update({ status: next as any }).eq("id", storeId);
    reload();
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
          <tr><Th>Usuario</Th><Th>Tienda</Th><Th>Plan</Th><Th>Estado</Th><Th>Rol</Th><Th>Acción</Th></tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isAdmin = (r.user_roles ?? []).some((x: any) => x.role === "superadmin");
            return (
              <tr key={r.id} className="border-t border-border">
                <Td>{r.full_name || r.email}<div className="text-xs text-muted-foreground">{r.email}</div></Td>
                <Td>{r.stores?.[0]?.subdomain ?? "-"}</Td>
                <Td>{r.subscriptions?.[0]?.plan ?? "-"}</Td>
                <Td>{r.subscriptions?.[0]?.status ?? "-"}</Td>
                <Td>{isAdmin ? <span className="px-2 py-0.5 bg-ink text-blush text-xs rounded-full">admin</span> : "seller"}</Td>
                <Td>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => toggleAdmin(r.id, isAdmin)} className="text-xs text-rose-deep hover:underline">
                      {isAdmin ? "Quitar admin" : "Hacer admin"}
                    </button>
                    {r.stores?.[0] && (
                      <>
                        <button onClick={() => toggleStoreStatus(r.stores[0].id, r.stores[0].status)} className="text-xs text-muted-foreground hover:underline">
                          {r.stores[0].status === "active" ? "Pausar tienda" : "Activar tienda"}
                        </button>
                        <button onClick={() => deleteStore(r.stores[0].id)} className="text-xs text-destructive hover:underline">
                          Eliminar tienda
                        </button>
                      </>
                    )}
                  </div>
                </Td>
              </tr>
            );
          })}
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
    <div className="bg-card rounded-2xl border border-border overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
          <tr><Th>Usuario</Th><Th>Plan</Th><Th>Estado</Th><Th>Próximo cobro</Th><Th>Monto</Th><Th>Gestionar Estado</Th><Th>Cambiar Plan</Th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border">
              <Td>{r.profiles?.email ?? r.user_id.slice(0, 8)}</Td>
              <Td>{r.plan}</Td>
              <Td><span className={`px-2 py-0.5 rounded text-xs ${r.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{r.status}</span></Td>
              <Td>{r.next_billing_date ? new Date(r.next_billing_date).toLocaleDateString() : "-"}</Td>
              <Td>${Number(r.amount).toLocaleString()}</Td>
              <Td>
                <select 
                  value={r.status} 
                  onChange={async (e) => {
                    await supabase.from("subscriptions").update({ status: e.target.value as any }).eq("id", r.id);
                    window.location.reload();
                  }}
                  className="text-xs border border-border rounded p-1"
                >
                  <option value="active">active</option>
                  <option value="grace">grace</option>
                  <option value="canceled">canceled</option>
                  <option value="expired">expired</option>
                </select>
              </Td>
              <Td>
                <select 
                  value={r.plan} 
                  onChange={async (e) => {
                    await supabase.from("subscriptions").update({ plan: e.target.value as any }).eq("id", r.id);
                    window.location.reload();
                  }}
                  className="text-xs border border-border rounded p-1"
                >
                  <option value="free_mayorista">free_mayorista</option>
                  <option value="basic">basic</option>
                  <option value="pro">pro</option>
                </select>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TicketsTab({ userId }: { userId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [plan, setPlan] = useState<"basic" | "pro" | "free_mayorista">("basic");
  const [days, setDays] = useState(30);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const reload = () => supabase.from("free_plan_tickets").select("*, used_profile:profiles!free_plan_tickets_used_by_fkey(email)").order("created_at", { ascending: false }).limit(50).then(({ data }) => setRows(data ?? []));
  useEffect(() => { reload(); }, []);

  const genCode = () => "KRIN-" + Math.random().toString(36).slice(2, 8).toUpperCase();

  const create = async () => {
    setCreating(true);
    const items = Array.from({ length: qty }, () => ({
      code: genCode(), plan, duration_days: days, notes: notes || null, created_by: userId,
    }));
    const { error } = await supabase.from("free_plan_tickets").insert(items);
    if (error) alert(error.message);
    setCreating(false);
    reload();
  };

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
        <h3 className="font-display text-xl text-ink flex items-center gap-2"><Plus className="w-5 h-5" /> Generar tickets</h3>
        <p className="text-sm text-muted-foreground mt-1">Códigos canjeables por planes gratuitos. Útil para promociones Krincesa.</p>
        <div className="grid sm:grid-cols-4 gap-3 mt-4">
          <div>
            <label className="text-xs font-medium block mb-1">Plan</label>
            <select value={plan} onChange={(e) => setPlan(e.target.value as any)} className="input">
              <option value="basic">basic</option>
              <option value="pro">pro</option>
              <option value="free_mayorista">free_mayorista</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Días</label>
            <input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} className="input" />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Cantidad</label>
            <input type="number" min={1} max={50} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="input" />
          </div>
          <div className="flex items-end">
            <button onClick={create} disabled={creating} className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium disabled:opacity-50">
              {creating ? "Creando..." : "Generar"}
            </button>
          </div>
        </div>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas (opcional, ej: Promo Black Friday)" className="input mt-3" />
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><Th>Código</Th><Th>Plan</Th><Th>Días</Th><Th>Estado</Th><Th>Usado por</Th><Th>Notas</Th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">Sin tickets todavía</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <Td>
                  <button onClick={() => copy(r.code)} className="font-mono text-xs flex items-center gap-1.5 hover:text-rose-deep">
                    {r.code}
                    {copied === r.code ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </Td>
                <Td>{r.plan}</Td>
                <Td>{r.duration_days}</Td>
                <Td>{r.used_by ? <span className="px-2 py-0.5 bg-muted text-xs rounded">usado</span> : <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded">disponible</span>}</Td>
                <Td className="text-xs text-muted-foreground">{r.used_profile?.email ?? "-"}</Td>
                <Td className="text-xs text-muted-foreground">{r.notes ?? "-"}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SyncTab() {
  const [last, setLast] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = () => {
    supabase.from("krincesa_products_cache").select("last_synced_at", { count: "exact" }).order("last_synced_at", { ascending: false }).limit(1)
      .then(({ data, count }) => { setLast(data?.[0]?.last_synced_at ?? null); setCount(count ?? 0); });
  };
  useEffect(reload, []);

  const forceSync = async () => {
    setSyncing(true); setMsg(null);
    try {
      const res = await fetch("/api/public/sync-krincesa", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      setMsg(res.ok ? `✓ Sincronizado: ${data.count ?? "?"} productos` : `Error: ${data.error ?? res.statusText}`);
      reload();
    } catch (e: any) {
      setMsg("Error: " + e.message);
    }
    setSyncing(false);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
      <h3 className="font-display text-2xl text-ink">Sincronización catálogo Krincesa</h3>
      <div className="mt-4 text-sm text-muted-foreground space-y-1">
        <div>Productos en caché: <strong className="text-foreground">{count}</strong></div>
        <div>Último sync: <strong className="text-foreground">{last ? new Date(last).toLocaleString() : "Nunca"}</strong></div>
      </div>
      <button onClick={forceSync} disabled={syncing} className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium disabled:opacity-50 inline-flex items-center gap-2">
        <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} /> {syncing ? "Sincronizando..." : "Forzar sincronización"}
      </button>
      {msg && <p className="mt-3 text-sm">{msg}</p>}
      <p className="mt-3 text-xs text-muted-foreground">Sync automático programado cada hora vía cron.</p>
    </div>
  );
}

function GlobalAnalytics() {
  const [data, setData] = useState({ 
    stores: 0, 
    events: 0, 
    recentEvents: [] as any[],
    topStores: [] as any[] 
  });
  
  useEffect(() => {
    (async () => {
      const [{ count: stores }, { count: events }, { data: recent }, { data: top }] = await Promise.all([
        supabase.from("stores").select("*", { count: "exact", head: true }),
        supabase.from("store_analytics").select("*", { count: "exact", head: true }),
        supabase.from("store_analytics").select("*, stores(store_name)").order("created_at", { ascending: false }).limit(5),
        supabase.from("stores").select("subdomain, store_name").order("created_at", { ascending: false }).limit(10),
      ]);
      setData({ 
        stores: stores ?? 0, 
        events: events ?? 0, 
        recentEvents: recent ?? [],
        topStores: top ?? [] 
      });
    })();
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="text-xs uppercase text-muted-foreground font-medium tracking-wider">Tiendas totales</div>
        <div className="font-display text-4xl mt-1 text-rose-deep">{data.stores}</div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="text-xs uppercase text-muted-foreground font-medium tracking-wider">Eventos totales</div>
        <div className="font-display text-4xl mt-1 text-rose-deep">{data.events}</div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Actividad reciente</h3>
        <div className="space-y-3">
          {data.recentEvents.map((e: any) => (
            <div key={e.id} className="text-xs flex justify-between items-center border-b border-border/50 pb-2 last:border-0">
              <div className="min-w-0">
                <span className="font-medium capitalize">{e.event_type}</span> en <span className="text-rose-deep">{e.stores?.store_name || "Tienda"}</span>
              </div>
              <div className="text-muted-foreground whitespace-nowrap ml-2">
                {new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          {data.recentEvents.length === 0 && <p className="text-xs text-muted-foreground">Sin actividad reciente</p>}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> Nuevas tiendas</h3>
        <ul className="space-y-3">
          {data.topStores.map((s: any) => (
            <li key={s.subdomain} className="flex justify-between items-center text-xs border-b border-border/50 pb-2 last:border-0">
              <span className="font-medium truncate mr-2">{s.store_name}</span>
              <a href={`/s/${s.subdomain}`} target="_blank" rel="noopener" className="text-rose-deep hover:underline truncate">/s/{s.subdomain}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Th({ children }: any) { return <th className="text-left px-4 py-3 font-medium">{children}</th>; }
function Td({ children, className = "" }: any) { return <td className={`px-4 py-3 ${className}`}>{children}</td>; }
