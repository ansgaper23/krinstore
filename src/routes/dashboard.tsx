import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, signOut } from "@/hooks/use-auth";
import { Logo } from "@/components/Logo";
import { LayoutDashboard, Package, BarChart3, CreditCard, LogOut, ExternalLink, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: DashboardLayout });

function DashboardLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<any>(null);
  const [sub, setSub] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    (async () => {
      const [{ data: s }, { data: sb }, { data: r }] = await Promise.all([
        supabase.from("stores").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      if (!s) { navigate({ to: "/onboarding" }); return; }
      setStore(s);
      setSub(sb);
      setRole(r?.find((x: any) => x.role === "superadmin")?.role ?? "seller");
      setReady(true);
    })();
  }, [user, loading, navigate]);

  if (loading || !ready) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Cargando...</div>;

  if (sub?.status === "suspended") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary px-6">
        <div className="max-w-md text-center bg-card p-10 rounded-2xl border border-border shadow-xl">
          <AlertCircle className="w-12 h-12 text-rose-deep mx-auto mb-4" />
          <h1 className="font-display text-3xl text-ink">Tu acceso está pausado</h1>
          <p className="mt-3 text-muted-foreground">Renová tu membresía para volver a vender.</p>
          <button className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium">Renovar membresía</button>
          <button onClick={signOut} className="mt-3 block mx-auto text-sm text-muted-foreground hover:underline">Cerrar sesión</button>
        </div>
      </div>
    );
  }

  const nav = [
    { to: "/dashboard", label: "Mi Tienda", icon: LayoutDashboard, exact: true },
    { to: "/dashboard/products", label: "Productos", icon: Package },
    { to: "/dashboard/analytics", label: "Estadísticas", icon: BarChart3 },
    { to: "/dashboard/membership", label: "Membresía", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6"><Logo /></div>
        <nav className="flex-1 px-3 space-y-1">
          {nav.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${active ? "bg-secondary text-rose-deep font-medium" : "text-muted-foreground hover:bg-secondary/50"}`}
              >
                <n.icon className="w-4 h-4" />{n.label}
              </Link>
            );
          })}
          {role === "superadmin" && (
            <Link to="/superadmin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary/50">
              <LayoutDashboard className="w-4 h-4" /> Super Admin
            </Link>
          )}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <a href={`/s/${store.subdomain}`} target="_blank" rel="noopener" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary/50">
            <ExternalLink className="w-4 h-4" /> Ver mi tienda
          </a>
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary/50">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {sub?.status === "grace" && (
          <div className="bg-rose-deep/10 border-b border-rose-deep/20 px-6 py-3 text-sm text-rose-deep">
            ⚠️ Tu membresía está en período de gracia. Renová pronto para no perder tu tienda.
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
