import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, signOut } from "@/hooks/use-auth";
import { Logo } from "@/components/Logo";
import { Home, Package, BarChart3, CreditCard, Paintbrush, LogOut, ExternalLink, AlertCircle, Shield, ShoppingCart, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: DashboardLayout });

function DashboardLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<any>(null);
  const [sub, setSub] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [supportWhatsapp, setSupportWhatsapp] = useState("51987654321");
  const [ready, setReady] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    
    let isMounted = true;

    (async () => {
      try {
        // Use RPC to ensure subscription logic runs on server-side criteria
        // Fix potential error if RPC is missing
        try {
          await supabase.rpc('handle_expired_subscriptions');
        } catch (e) {
          console.warn("RPC handle_expired_subscriptions not available");
        }

        const [{ data: s }, { data: sb }, { data: r }, { data: settings }] = await Promise.all([
          supabase.from("stores").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", user.id),
          supabase.from("system_settings").select("value").eq("key", "support_whatsapp").maybeSingle()
        ]);

        if (!isMounted) return;
        if (!s) { navigate({ to: "/onboarding" }); return; }

        if (settings) setSupportWhatsapp(settings.value);

        setStore(s); 
        setSub(sb);
        setRole(r?.find((x: any) => x.role === "superadmin")?.role ?? "seller");
        setReady(true);
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    })();

    return () => { isMounted = false; };
  }, [user, loading, navigate]);

  if (loading || !ready) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Cargando...</div>;

  // User can still access the panel but actions will be restricted in child components
  const isRestricted = sub?.status === "suspended" || sub?.status === "cancelled" || sub?.status === "expired";

  const nav = [
    { to: "/dashboard", label: "Inicio", icon: Home, exact: true },
    { to: "/dashboard/products", label: "Productos", icon: Package },
    { to: "/dashboard/orders", label: "Pedidos", icon: ShoppingCart },
    { to: "/dashboard/settings", label: "Tienda", icon: Paintbrush },
    { to: "/dashboard/analytics", label: "Stats", icon: BarChart3 },
    { to: "/dashboard/membership", label: "Plan", icon: CreditCard },
  ];

  

  // The settings editor manages its own full-screen layout (own bottom nav + sheets),
  // so we hide the layout's mobile nav and remove bottom padding there.
  const isEditor = path.startsWith("/dashboard/settings");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-72 border-r border-border bg-white flex-col">
        <div className="p-8"><Logo /></div>
        <nav className="flex-1 px-4 space-y-2">
          {nav.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-secondary hover:text-primary"}`}>
                <n.icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />{n.label}
              </Link>
            );
          })}
          {role === "superadmin" && (
            <div className="pt-4 mt-4 border-t border-border/50">
              <Link to="/superadmin" className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-primary transition-all`}>
                <Shield className="w-5 h-5" /> Super Admin
              </Link>
            </div>
          )}
        </nav>
        <div className="p-4 m-4 bg-secondary/50 rounded-[2rem] space-y-2">
          <a href={`/s/${store.subdomain}`} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-sm font-bold text-ink shadow-sm border border-border hover:shadow-md transition-all">
            <ExternalLink className="w-4 h-4 text-primary" /> Mi tienda
          </a>
          <button onClick={signOut} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <LogOut className="w-4 h-4" /> Salir
          </button>
          
          <div className="pt-2 border-t border-border/50">
            <a 
              href={`https://wa.me/${supportWhatsapp}?text=Hola! Necesito soporte con mi tienda en KrinStore.`}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary/5 text-xs font-bold text-primary hover:bg-primary/10 transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Ayuda y Soporte
            </a>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className={`flex-1 ${isEditor ? "" : "overflow-y-auto pb-16 lg:pb-0"}`}>
        {isRestricted && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 md:px-6 py-3 text-sm text-amber-700 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Tu tienda está en pausa. Activa un plan para habilitar ventas y cambios.</span>
            </div>
            <Link to="/dashboard/membership" className="text-xs font-bold underline whitespace-nowrap">Ver Planes</Link>
          </div>
        )}
        {sub?.status === "grace" && !isRestricted && (
          <div className="bg-rose-deep/10 border-b border-rose-deep/20 px-4 md:px-6 py-3 text-sm text-rose-deep flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Tu membresía está en período de gracia. Renová pronto.</span>
          </div>
        )}
        <Outlet />
      </main>

      {/* Mobile bottom nav — hidden inside the visual editor */}
      {!isEditor && (
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-card border-t border-border z-40 grid grid-cols-5 safe-area-bottom">
          {nav.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={`flex flex-col items-center justify-center py-2.5 gap-0.5 ${active ? "text-rose-deep" : "text-muted-foreground"}`}>
                <n.icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
                <span className="text-[10px] font-medium">{n.label}</span>
              </Link>
            );
          })}
          <a 
            href={`https://wa.me/${supportWhatsapp}?text=Hola! Necesito soporte con mi tienda en KrinStore.`}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-2.5 gap-0.5 text-muted-foreground"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium">Soporte</span>
          </a>
        </nav>
      )}
    </div>
  );
}
