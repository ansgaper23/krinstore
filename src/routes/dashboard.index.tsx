import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingCart, Paintbrush, Eye, Share2, ExternalLink, Ticket, CheckCircle2, Circle, BarChart3, Trophy, ShoppingBag, ChevronRight, AlertTriangle, Clock } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({ component: DashboardHome });

function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<any>(null);
  const [sub, setSub] = useState<any>(null);
  const [productCount, setProductCount] = useState(0);
  const [views, setViews] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Trigger automatic expiration check
      await supabase.rpc('handle_expired_subscriptions');

      const { data: s } = await supabase.from("stores").select("*").eq("user_id", user.id).maybeSingle();
      const { data: subData } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      
      setStore(s);
      setSub(subData);

      if (s) {
        const [{ count: pc }, { count: vc }, { count: oc }, { data: ro }] = await Promise.all([
          supabase.from("store_products").select("*", { count: "exact", head: true }).eq("store_id", s.id).eq("is_visible", true),
          supabase.from("store_analytics").select("*", { count: "exact", head: true }).eq("store_id", s.id).eq("event_type", "view"),
          supabase.from("orders").select("*", { count: "exact", head: true }).eq("store_id", s.id),
          supabase.from("orders").select("*").eq("store_id", s.id).order("created_at", { ascending: false }).limit(3),
        ]);
        setProductCount(pc ?? 0);
        setViews(vc ?? 0);
        setOrderCount(oc ?? 0);
        setRecentOrders(ro ?? []);
      }
    })();
  }, [user]);

  if (!store) return <div className="p-10 text-muted-foreground">Cargando...</div>;

  const tasks = [
    { done: !!store.store_name && store.store_name !== "Mi tienda", label: "Ponele un nombre a tu tienda", to: "/dashboard/settings" as const },
    { done: !!store.logo_url, label: "Subí tu logo", to: "/dashboard/settings" as const },
    { done: productCount > 0, label: "Agregá tu primer producto", to: "/dashboard/products" as const },
    { done: (store.custom_links ?? []).length > 0, label: "Configurá tu WhatsApp", to: "/dashboard/settings" as const },
  ];
  const completed = tasks.filter((t) => t.done).length;

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/s/${store.subdomain}`;
  const handleShare = async () => {
    if (navigator.share) { try { await navigator.share({ title: store.store_name, url: shareUrl }); } catch {} }
    else { await navigator.clipboard.writeText(shareUrl); setMsg({ kind: "ok", text: "Link copiado" }); }
  };

  const redeem = async () => {
    if (!user || !code.trim()) return;
    setRedeeming(true); setMsg(null);
    const clean = code.trim().toUpperCase();
    const { data: ticket } = await supabase.from("free_plan_tickets").select("*").eq("code", clean).maybeSingle();
    if (!ticket) { setMsg({ kind: "err", text: "Código inválido" }); setRedeeming(false); return; }
    if (ticket.used_by) { setMsg({ kind: "err", text: "Este código ya fue usado" }); setRedeeming(false); return; }
    const next = new Date(); next.setDate(next.getDate() + ticket.duration_days);
    const { error: upErr } = await supabase.from("free_plan_tickets").update({ used_by: user.id, used_at: new Date().toISOString() }).eq("id", ticket.id);
    if (upErr) { setMsg({ kind: "err", text: upErr.message }); setRedeeming(false); return; }
    await supabase.from("subscriptions").insert({
      user_id: user.id, plan: ticket.plan, status: "active", amount: 0,
      payment_method: "ticket", next_billing_date: next.toISOString(),
    });
    setMsg({ kind: "ok", text: `¡Plan ${ticket.plan} activado por ${ticket.duration_days} días!` });
    setCode("");
    setRedeeming(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24 lg:pb-6">
      {/* Header móvil */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 min-w-0">
          {store.logo_url ? <img src={store.logo_url} alt="" className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-primary/20" />}
          <div className="min-w-0">
            <h1 className="font-display text-xl text-ink truncate">{store.store_name}</h1>
            <div className="text-xs text-muted-foreground truncate">/s/{store.subdomain}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <a href={`/s/${store.subdomain}`} target="_blank" rel="noopener" className="px-3 py-2 border border-border rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-muted">
            <Eye className="w-3.5 h-3.5" /><span className="hidden sm:inline">Ver tienda</span>
          </a>
          <button onClick={handleShare} className="px-3 py-2 border border-border rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-muted">
            <Share2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Compartir</span>
          </button>
        </div>
      </header>
2
      {/* Subscription Alert */}
      {sub && (sub.status !== 'active' || (sub.next_billing_date && new Date(sub.next_billing_date) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))) && (
        <div className={`mb-6 p-5 rounded-[2rem] border flex items-start gap-4 transition-all animate-in fade-in slide-in-from-top-4 duration-500 ${
          sub.status === 'active' 
          ? 'bg-amber-50 border-amber-200' 
          : 'bg-rose-50 border-rose-200'
        }`}>
          <div className={`p-3 rounded-2xl ${
            sub.status === 'active' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
          }`}>
            {sub.status === 'active' ? <Clock className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div className="flex-1">
            <h4 className={`font-black uppercase tracking-tighter text-sm ${
              sub.status === 'active' ? 'text-amber-700' : 'text-rose-700'
            }`}>
              {sub.status === 'active' ? '¡Tu suscripción vence pronto!' : 'Suscripción Suspendida'}
            </h4>
            <p className="text-xs mt-1 text-muted-foreground font-medium">
              {sub.status === 'active' 
                ? `Te quedan menos de 3 días (vence el ${new Date(sub.next_billing_date).toLocaleDateString()}). Renueva para evitar que tu tienda se desactive.`
                : 'Tu acceso ha sido limitado. Por favor contacta con soporte para reactivar tu tienda y seguir vendiendo.'}
            </p>
            <div className="mt-4">
              <Link 
                to="/dashboard/membership" 
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  sub.status === 'active' ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-rose-600 text-white hover:bg-rose-700'
                }`}
              >
                {sub.status === 'active' ? 'RENOVAR AHORA' : 'VER MI MEMBRESÍA'}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding tasks */}
      {completed < tasks.length && (
        <section className="bg-card border border-border rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg text-ink">Prepárate para vender</h2>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-500" /> {completed}/{tasks.length}
            </div>
          </div>
          <ul className="space-y-2">
            {tasks.filter((t) => !t.done).slice(0, 2).map((t) => (
              <li key={t.label}>
                <Link to={t.to} className="flex items-center gap-3 p-3 -mx-2 rounded-xl hover:bg-muted transition">
                  <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                  <span className="text-sm flex-1">{t.label}</span>
                  <span className="text-muted-foreground">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Action cards */}
      <section className="grid grid-cols-3 gap-3 mb-5">
        <ActionCard icon={ShoppingCart} label="Productos" onClick={() => navigate({ to: "/dashboard/products" })} color="bg-rose-50 text-rose-500" />
        <ActionCard icon={Paintbrush} label="Diseño" onClick={() => navigate({ to: "/dashboard/settings" })} color="bg-purple-50 text-purple-500" />
        <ActionCard icon={BarChart3} label="Métricas" onClick={() => navigate({ to: "/dashboard/analytics" })} color="bg-blue-50 text-blue-500" />
      </section>

      {/* Mini stats */}
      <section className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Productos</div>
          <div className="font-display text-2xl mt-1 text-ink">{productCount}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Visitas</div>
          <div className="font-display text-2xl mt-1 text-ink">{views}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 border-rose-deep/20 bg-rose-deep/[0.02]">
          <div className="text-[10px] text-rose-deep uppercase tracking-wider font-semibold">Pedidos</div>
          <div className="font-display text-2xl mt-1 text-rose-deep">{orderCount}</div>
        </div>
      </section>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <section className="bg-card border border-border rounded-2xl p-5 mb-5">
           <div className="flex items-center justify-between mb-4">
             <h3 className="font-display text-lg text-ink">Pedidos recientes</h3>
             <Link to="/dashboard/orders" className="text-xs text-rose-deep hover:underline">Ver todos</Link>
           </div>
           <div className="divide-y divide-border -mx-2">
             {recentOrders.map((o) => (
               <Link key={o.id} to="/dashboard/orders" className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                     <ShoppingBag className="w-5 h-5 text-rose-deep" />
                   </div>
                   <div>
                     <div className="text-sm font-medium text-ink">{o.customer_name}</div>
                     <div className="text-[10px] text-muted-foreground">S/ {Number(o.total).toLocaleString()} • {new Date(o.created_at).toLocaleDateString()}</div>
                   </div>
                 </div>
                 <ChevronRight className="w-4 h-4 text-muted-foreground" />
               </Link>
             ))}
           </div>
        </section>
      )}

      {/* Redeem ticket */}
      <section className="bg-gradient-to-br from-secondary to-accent border border-border rounded-2xl p-5 mb-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-card rounded-xl"><Ticket className="w-5 h-5 text-rose-deep" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg text-ink">¿Tenés un código de Krincesa?</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Canjealo por un plan gratis</p>
            <div className="mt-3 flex gap-2">
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="KRIN-XXXX" className="flex-1 min-w-0 px-3 py-2 text-sm rounded-full border border-input bg-card uppercase" />
              <button onClick={redeem} disabled={redeeming || !code.trim()} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium disabled:opacity-50 whitespace-nowrap">
                {redeeming ? "..." : "Canjear"}
              </button>
            </div>
            {msg && <p className={`mt-2 text-xs ${msg.kind === "ok" ? "text-emerald-700" : "text-destructive"}`}>{msg.text}</p>}
          </div>
        </div>
      </section>

      {/* Share link */}
      <section className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-medium mb-2">Link de tu tienda</h3>
        <div className="flex items-center gap-2 p-2 bg-muted rounded-xl">
          <code className="text-xs flex-1 truncate text-ink">{shareUrl}</code>
          <a href={shareUrl} target="_blank" rel="noopener" className="p-1.5 hover:bg-card rounded-lg"><ExternalLink className="w-4 h-4 text-rose-deep" /></a>
        </div>
      </section>
    </div>
  );
}

function ActionCard({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="bg-card border border-border rounded-2xl p-4 hover:border-primary hover:shadow-md transition flex flex-col items-center text-center gap-2 active:scale-95">
      <div className="p-2.5 rounded-xl bg-secondary"><Icon className="w-5 h-5 text-rose-deep" /></div>
      <span className="text-xs md:text-sm font-medium leading-tight">{label}</span>
    </button>
  );
}
