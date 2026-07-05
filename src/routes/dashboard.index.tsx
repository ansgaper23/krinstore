import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  ShoppingCart, Paintbrush, Eye, Share2, ExternalLink, Ticket, Circle, BarChart3, Trophy,
  ShoppingBag, ChevronRight, AlertTriangle, Clock, Sparkles, TrendingUp, MessageCircle,
  Copy, QrCode, X, Rocket, Sun, Moon, Coffee, Bell, CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/")({ component: DashboardHome });

function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<any>(null);
  const [sub, setSub] = useState<any>(null);
  const [productCount, setProductCount] = useState(0);
  const [views, setViews] = useState(0);
  const [viewsPrev, setViewsPrev] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [ordersWeek, setOrdersWeek] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      await supabase.rpc('handle_expired_subscriptions');
      const { data: s } = await supabase.from("stores").select("*").eq("user_id", user.id).maybeSingle();
      const { data: subData } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      setStore(s); setSub(subData);

      if (s) {
        const now = new Date();
        const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const twoWeeks = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
        const [{ count: pc }, { count: vc }, { count: vcPrev }, { count: oc }, { count: ow }, { data: ro }, { count: pend }] = await Promise.all([
          supabase.from("store_products").select("*", { count: "exact", head: true }).eq("store_id", s.id).eq("is_visible", true),
          supabase.from("store_analytics").select("*", { count: "exact", head: true }).eq("store_id", s.id).eq("event_type", "view").gte("created_at", week),
          supabase.from("store_analytics").select("*", { count: "exact", head: true }).eq("store_id", s.id).eq("event_type", "view").gte("created_at", twoWeeks).lt("created_at", week),
          supabase.from("orders").select("*", { count: "exact", head: true }).eq("store_id", s.id),
          supabase.from("orders").select("*", { count: "exact", head: true }).eq("store_id", s.id).gte("created_at", week),
          supabase.from("orders").select("*").eq("store_id", s.id).order("created_at", { ascending: false }).limit(3),
          supabase.from("orders").select("*", { count: "exact", head: true }).eq("store_id", s.id).eq("status", "pending"),
        ]);
        setProductCount(pc ?? 0); setViews(vc ?? 0); setViewsPrev(vcPrev ?? 0);
        setOrderCount(oc ?? 0); setOrdersWeek(ow ?? 0); setRecentOrders(ro ?? []); setPendingOrders(pend ?? 0);
      }
    })();
  }, [user]);

  // Realtime new orders → toast + badge refresh
  useEffect(() => {
    if (!store?.id) return;
    const ch = supabase
      .channel(`orders-${store.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders", filter: `store_id=eq.${store.id}` }, (payload: any) => {
        setMsg({ kind: "ok", text: `🎉 ¡Nuevo pedido de ${payload.new?.customer_name ?? "un cliente"}!` });
        setOrderCount((c) => c + 1); setOrdersWeek((c) => c + 1); setPendingOrders((c) => c + 1);
        setRecentOrders((prev) => [payload.new, ...prev].slice(0, 3));
        try { new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=").play().catch(() => {}); } catch {}
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [store?.id]);

  const shareUrl = useMemo(() => `${typeof window !== "undefined" ? window.location.origin : ""}/s/${store?.subdomain ?? ""}`, [store?.subdomain]);
  const qrUrl = useMemo(() => `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(shareUrl)}`, [shareUrl]);

  if (!store) return <div className="p-10 text-muted-foreground">Cargando...</div>;

  const tasks = [
    { done: !!store.store_name && store.store_name !== "Mi tienda", label: "Ponele un nombre a tu tienda", to: "/dashboard/settings" as const },
    { done: !!store.logo_url, label: "Subí tu logo", to: "/dashboard/settings" as const },
    { done: productCount > 0, label: "Agregá tu primer producto", to: "/dashboard/products" as const },
    { done: (store.custom_links ?? []).length > 0, label: "Configurá tu WhatsApp", to: "/dashboard/settings" as const },
  ];
  const completed = tasks.filter((t) => t.done).length;
  const progressPct = Math.round((completed / tasks.length) * 100);

  // Greeting
  const hour = new Date().getHours();
  const greetIcon = hour < 12 ? Coffee : hour < 19 ? Sun : Moon;
  const GreetIcon = greetIcon;
  const greetText = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  const firstName = (user?.user_metadata?.full_name ?? user?.email ?? "").split(/[\s@]/)[0];

  // Views trend
  const viewsDelta = viewsPrev === 0 ? (views > 0 ? 100 : 0) : Math.round(((views - viewsPrev) / viewsPrev) * 100);

  // Acción del día (contextual)
  const dailyAction = (() => {
    if (pendingOrders > 0) return { icon: Bell, text: `Tenés ${pendingOrders} pedido${pendingOrders > 1 ? "s" : ""} pendiente${pendingOrders > 1 ? "s" : ""} de atender`, cta: "Ver pedidos", to: "/dashboard/orders" as const, tone: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    if (productCount === 0) return { icon: Rocket, text: "Agregá tu primer producto y empezá a vender hoy", cta: "Agregar producto", to: "/dashboard/products" as const, tone: "bg-rose-50 text-rose-700 border-rose-200" };
    if (completed < tasks.length) return { icon: Sparkles, text: `Completá tu tienda (${completed}/${tasks.length}) para vender más`, cta: "Continuar", to: tasks.find(t => !t.done)!.to, tone: "bg-amber-50 text-amber-700 border-amber-200" };
    if (views < 10) return { icon: Share2, text: "Compartí tu tienda en WhatsApp e Instagram para traer visitas", cta: "Compartir", to: null, onClick: () => setShareOpen(true), tone: "bg-purple-50 text-purple-700 border-purple-200" };
    if (orderCount === 0 && views >= 10) return { icon: Paintbrush, text: "Tenés visitas pero no ventas. Revisá precios y fotos", cta: "Revisar productos", to: "/dashboard/products" as const, tone: "bg-blue-50 text-blue-700 border-blue-200" };
    return { icon: TrendingUp, text: "Tu tienda está lista. Analizá tus métricas para crecer", cta: "Ver métricas", to: "/dashboard/analytics" as const, tone: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  })();

  const waMsg = encodeURIComponent(`Hola! Te invito a ver mi tienda ${store.store_name} 💖\n${shareUrl}`);
  const igMsg = `¡Nueva tienda online! ${store.store_name} 💖 Link en bio: ${shareUrl}`;
  const doCopy = async (text: string, key: string) => { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 1500); };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try { await (navigator as any).share({ title: store.store_name, url: shareUrl }); return; } catch {}
    }
    setShareOpen(true);
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
    setCode(""); setRedeeming(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24 lg:pb-6">
      {/* Header con saludo personalizado */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 min-w-0">
          {store.logo_url ? <img src={store.logo_url} alt="" className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-primary/20" />}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <GreetIcon className="w-3.5 h-3.5" /> <span>{greetText}{firstName ? `, ${firstName}` : ""}</span>
            </div>
            <h1 className="font-display text-xl text-ink truncate">{store.store_name}</h1>
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

      {/* Toast realtime */}
      {msg && (
        <div className={`mb-4 p-4 rounded-2xl border flex items-center gap-3 animate-in slide-in-from-top-2 ${msg.kind === "ok" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
          <span className="text-sm font-medium flex-1">{msg.text}</span>
          <button onClick={() => setMsg(null)} className="opacity-60 hover:opacity-100"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Subscription Alert */}
      {sub && (sub.status !== 'active' || (sub.next_billing_date && new Date(sub.next_billing_date) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))) && (
        <div className={`mb-6 p-5 rounded-[2rem] border flex items-start gap-4 ${sub.status === 'active' ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'}`}>
          <div className={`p-3 rounded-2xl ${sub.status === 'active' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
            {sub.status === 'active' ? <Clock className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div className="flex-1">
            <h4 className={`font-black uppercase tracking-tighter text-sm ${sub.status === 'active' ? 'text-amber-700' : 'text-rose-700'}`}>
              {sub.status === 'active' ? '¡Tu suscripción vence pronto!' : 'Suscripción Suspendida'}
            </h4>
            <p className="text-xs mt-1 text-muted-foreground font-medium">
              {sub.status === 'active' ? `Te quedan menos de 3 días (vence el ${new Date(sub.next_billing_date).toLocaleDateString()}). Renueva para evitar que tu tienda se desactive.` : 'Tu acceso ha sido limitado. Por favor contacta con soporte para reactivar tu tienda.'}
            </p>
            <div className="mt-4">
              <Link to="/dashboard/membership" className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${sub.status === 'active' ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-rose-600 text-white hover:bg-rose-700'}`}>
                {sub.status === 'active' ? 'RENOVAR AHORA' : 'VER MI MEMBRESÍA'}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Acción del día */}
      <section className={`mb-5 p-4 rounded-2xl border flex items-center gap-3 ${dailyAction.tone}`}>
        <div className="p-2.5 rounded-xl bg-white/70 shrink-0"><dailyAction.icon className="w-5 h-5" /></div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest font-black opacity-70">Acción del día</div>
          <div className="text-sm font-semibold truncate">{dailyAction.text}</div>
        </div>
        {dailyAction.to ? (
          <Link to={dailyAction.to} className="px-3 py-2 bg-white rounded-xl text-xs font-bold whitespace-nowrap shadow-sm hover:shadow">{dailyAction.cta}</Link>
        ) : (
          <button onClick={dailyAction.onClick} className="px-3 py-2 bg-white rounded-xl text-xs font-bold whitespace-nowrap shadow-sm hover:shadow">{dailyAction.cta}</button>
        )}
      </section>

      {/* Onboarding gamificado */}
      {completed < tasks.length && (
        <section className="bg-gradient-to-br from-white to-primary/5 border border-border rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display text-lg text-ink">Prepárate para vender</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{completed === tasks.length - 1 ? "¡Casi lo lográs! Solo falta 1 paso" : `${tasks.length - completed} pasos para tu tienda perfecta`}</p>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1 shrink-0">
              <Trophy className="w-4 h-4 text-amber-500" /> {completed}/{tasks.length}
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
            <div className="h-full bg-gradient-to-r from-primary to-rose-deep transition-all duration-700" style={{ width: `${progressPct}%` }} />
          </div>
          <ul className="space-y-1.5">
            {tasks.map((t) => (
              <li key={t.label}>
                <Link to={t.to} className={`flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition ${t.done ? "opacity-50" : ""}`}>
                  {t.done ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <Circle className="w-5 h-5 text-muted-foreground shrink-0" />}
                  <span className={`text-sm flex-1 ${t.done ? "line-through" : ""}`}>{t.label}</span>
                  {!t.done && <span className="text-muted-foreground">›</span>}
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

      {/* Mini stats con contexto */}
      <section className="grid grid-cols-3 gap-3 mb-8">
        <StatCard label="Productos" value={productCount} color="rose" hint={productCount === 0 ? "Agregá el 1º" : productCount < 5 ? "Sumá más" : "¡Buen catálogo!"} />
        <StatCard label="Visitas 7d" value={views} color="blue" trend={viewsDelta} />
        <StatCard label="Pedidos 7d" value={ordersWeek} color="emerald" hint={pendingOrders > 0 ? `${pendingOrders} pendiente${pendingOrders > 1 ? "s" : ""}` : orderCount > 0 ? `${orderCount} total` : "Aún ninguno"} />
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
      <section className="bg-white border border-border rounded-[2.5rem] p-8 mb-8 relative overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500">
        <div className="absolute top-0 right-0 p-12 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="p-5 bg-primary/10 rounded-3xl text-primary transform group-hover:rotate-12 transition-transform duration-500">
            <Ticket className="w-8 h-8" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-display text-2xl text-ink font-black uppercase tracking-tighter">¿Tienes un código de Krincesa?</h3>
            <p className="text-sm text-muted-foreground mt-1 font-medium italic">¡Canjealo por un plan de venta gratis ahora mismo!</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="KRIN-XXXX" className="flex-1 px-6 py-4 rounded-2xl border border-border bg-muted/30 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-black uppercase tracking-widest transition-all" />
              <button onClick={redeem} disabled={redeeming || !code.trim()} className="px-8 py-4 bg-ink text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-ink/20 hover:scale-[1.05] active:scale-95 disabled:opacity-50 transition-all">
                {redeeming ? "..." : "Canjear Regalo"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Share link */}
      <section className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-medium mb-2">Link de tu tienda</h3>
        <div className="flex items-center gap-2 p-2 bg-muted rounded-xl">
          <code className="text-xs flex-1 truncate text-ink">{shareUrl}</code>
          <button onClick={() => doCopy(shareUrl, "link")} className="p-1.5 hover:bg-card rounded-lg" title="Copiar"><Copy className="w-4 h-4 text-rose-deep" /></button>
          <button onClick={() => setShareOpen(true)} className="p-1.5 hover:bg-card rounded-lg" title="Compartir"><Share2 className="w-4 h-4 text-rose-deep" /></button>
          <a href={shareUrl} target="_blank" rel="noopener" className="p-1.5 hover:bg-card rounded-lg"><ExternalLink className="w-4 h-4 text-rose-deep" /></a>
        </div>
        {copied === "link" && <p className="text-[10px] text-emerald-600 mt-2 font-bold">✓ Link copiado</p>}
      </section>

      {/* Share modal */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200" onClick={() => setShareOpen(false)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl text-ink">Compartir tienda</h3>
              <button onClick={() => setShareOpen(false)} className="p-2 hover:bg-muted rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex flex-col items-center mb-5 p-4 bg-muted/40 rounded-2xl">
              <img src={qrUrl} alt="QR" className="w-40 h-40 rounded-xl bg-white p-2" />
              <p className="text-xs text-muted-foreground mt-2">Escaneá para abrir la tienda</p>
            </div>

            <div className="space-y-2">
              <a href={`https://wa.me/?text=${waMsg}`} target="_blank" rel="noopener" className="flex items-center gap-3 p-3 rounded-2xl border border-border hover:bg-muted">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><MessageCircle className="w-5 h-5" /></div>
                <div className="flex-1"><div className="text-sm font-bold">WhatsApp</div><div className="text-[10px] text-muted-foreground">Enviar con mensaje pre-armado</div></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </a>
              <button onClick={() => doCopy(igMsg, "ig")} className="w-full flex items-center gap-3 p-3 rounded-2xl border border-border hover:bg-muted text-left">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><Sparkles className="w-5 h-5" /></div>
                <div className="flex-1"><div className="text-sm font-bold">Instagram / TikTok</div><div className="text-[10px] text-muted-foreground">{copied === "ig" ? "✓ Copiado — pegá en tu bio o historia" : "Copiar mensaje para bio o historia"}</div></div>
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => doCopy(shareUrl, "url")} className="w-full flex items-center gap-3 p-3 rounded-2xl border border-border hover:bg-muted text-left">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Copy className="w-5 h-5" /></div>
                <div className="flex-1"><div className="text-sm font-bold">Copiar link</div><div className="text-[10px] text-muted-foreground">{copied === "url" ? "✓ Copiado" : shareUrl}</div></div>
              </button>
              <a href={qrUrl} download={`${store.subdomain}-qr.png`} className="w-full flex items-center gap-3 p-3 rounded-2xl border border-border hover:bg-muted">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><QrCode className="w-5 h-5" /></div>
                <div className="flex-1"><div className="text-sm font-bold">Descargar QR</div><div className="text-[10px] text-muted-foreground">Para imprimir en tarjetas o packaging</div></div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionCard({ icon: Icon, label, onClick, color }: { icon: any; label: string; onClick: () => void; color?: string }) {
  return (
    <button onClick={onClick} className="bg-card border border-border rounded-3xl p-4 hover:border-primary hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col items-center text-center gap-2 active:scale-95 group">
      <div className={`p-3 rounded-2xl transition-all group-hover:scale-110 ${color || "bg-secondary text-rose-deep"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[10px] uppercase font-black tracking-widest leading-tight">{label}</span>
    </button>
  );
}

function StatCard({ label, value, color, hint, trend }: { label: string; value: number; color: "rose" | "blue" | "emerald"; hint?: string; trend?: number }) {
  const dot = color === "rose" ? "bg-rose-400" : color === "blue" ? "bg-blue-400" : "bg-emerald-400";
  const trendPos = (trend ?? 0) > 0;
  const trendNeg = (trend ?? 0) < 0;
  return (
    <div className="bg-white border border-border rounded-[2rem] p-4 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all group">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-1.5 h-1.5 rounded-full ${dot} group-hover:animate-ping`} />
        <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">{label}</div>
      </div>
      <div className="font-display text-3xl text-ink font-black leading-none">{value}</div>
      {trend !== undefined ? (
        <div className={`mt-2 text-[10px] font-bold flex items-center gap-1 ${trendPos ? "text-emerald-600" : trendNeg ? "text-rose-600" : "text-muted-foreground"}`}>
          <TrendingUp className={`w-3 h-3 ${trendNeg ? "rotate-180" : ""}`} />
          {trend > 0 ? "+" : ""}{trend}% vs semana previa
        </div>
      ) : hint ? (
        <div className="mt-2 text-[10px] font-bold text-muted-foreground truncate">{hint}</div>
      ) : null}
    </div>
  );
}
