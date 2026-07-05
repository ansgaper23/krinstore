import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { MessageCircle, ShieldCheck, Clock, CreditCard, Check, Zap, Crown, Sparkles, TrendingUp, AlertTriangle, Gift } from "lucide-react";

export const Route = createFileRoute("/dashboard/membership")({ component: MembershipPage });

const PLAN_META: Record<string, { name: string; price: number; icon: any; color: string; features: string[]; limits: { products: number | null } }> = {
  free_mayorista: { name: "Free Mayorista", price: 0, icon: Gift, color: "text-purple-600", features: ["Catálogo Krincesa completo", "Tienda ilimitada", "Comisión por venta", "Soporte por WhatsApp"], limits: { products: null } },
  basic: { name: "Basic", price: 39.90, icon: Zap, color: "text-blue-600", features: ["Hasta 50 productos propios", "Analytics básico", "Diseños premium", "Soporte por WhatsApp"], limits: { products: 50 } },
  pro: { name: "Pro", price: 89.90, icon: Crown, color: "text-rose-deep", features: ["Productos ilimitados", "Analytics avanzado", "Sin marca KrinStore", "Soporte prioritario 24/7", "Dominio personalizado"], limits: { products: null } },
};

function MembershipPage() {
  const { user } = useAuth();
  const [sub, setSub] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [store, setStore] = useState<any>(null);
  const [productCount, setProductCount] = useState(0);
  const [supportPhone, setSupportPhone] = useState("51987654321");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: s }, { data: p }, { data: st }, { data: settings }] = await Promise.all([
        supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("mayorista_purchases").select("*").eq("user_id", user.id).order("purchase_date", { ascending: false }),
        supabase.from("stores").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("system_settings").select("value").eq("key", "support_whatsapp").maybeSingle(),
      ]);
      setSub(s); setPurchases(p ?? []); setStore(st);
      setSupportPhone(String(settings?.value ?? "").replace(/\D/g, "") || "51987654321");

      if (st?.id) {
        const { count } = await supabase.from("custom_products").select("id", { count: "exact", head: true }).eq("store_id", st.id);
        setProductCount(count ?? 0);
      }
      setLoading(false);
    })();
  }, [user]);

  const daysLeft = useMemo(() => {
    if (!sub?.next_billing_date) return null;
    return Math.ceil((new Date(sub.next_billing_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }, [sub]);

  const totalMayorista = purchases.filter((p) => p.verified).reduce((a, b) => a + Number(b.amount), 0);
  const meta = sub ? PLAN_META[sub.plan] : null;

  const waLink = (msg: string) =>
    `https://wa.me/${supportPhone}?text=${encodeURIComponent(`¡Hola! Soy ${user?.user_metadata?.full_name || user?.email}.\n\n${msg}\n\nTienda: ${store?.subdomain || "N/A"}\nEmail: ${user?.email}`)}`;

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando membresía...</div>;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Mi Membresía</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestiona tu plan y beneficios.</p>
      </div>

      {!sub ? (
        <NoSubscriptionCTA user={user} supportPhone={supportPhone} onActivated={() => window.location.reload()} />
      ) : (
        <>
          {/* Urgency banner */}
          {daysLeft !== null && daysLeft <= 3 && daysLeft >= 0 && sub.status === "active" && (
            <div className="bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-2xl p-4 flex items-center gap-4 shadow-lg animate-in slide-in-from-top-2">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-bold">⚠️ Tu licencia vence en {daysLeft} {daysLeft === 1 ? "día" : "días"}</div>
                <div className="text-sm opacity-90">Renová hoy para no perder acceso a tu tienda.</div>
              </div>
              <a href={waLink("Quiero renovar mi plan.")} target="_blank" rel="noopener noreferrer" className="bg-white text-red-600 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap hover:scale-105 transition">
                Renovar
              </a>
            </div>
          )}

          {sub.status === "suspended" && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              <div className="flex-1 text-sm">
                <b>Tu suscripción está suspendida.</b> Renová para reactivar tu tienda.
              </div>
              <a href={waLink("Necesito reactivar mi suscripción suspendida.")} target="_blank" rel="noopener noreferrer" className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold">Reactivar</a>
            </div>
          )}

          {/* Current plan card */}
          {meta && (
            <div className="bg-gradient-to-br from-card to-secondary/30 border border-border rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center ${meta.color}`}>
                      <meta.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Plan actual</div>
                      <div className="font-display text-2xl text-ink">{meta.name}</div>
                      <div className="text-sm text-muted-foreground">S/ {meta.price.toFixed(2)}{meta.price > 0 ? "/mes" : ""}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    sub.status === "active" ? "bg-green-100 text-green-700" :
                    sub.status === "grace" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>{sub.status}</span>
                </div>

                {/* Usage bar */}
                {meta.limits.products !== null && (
                  <div className="mt-6 p-3 bg-white/60 rounded-xl">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground">Productos usados</span>
                      <span className="font-bold text-ink">{productCount} / {meta.limits.products}</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${productCount / meta.limits.products >= 0.9 ? "bg-red-500" : productCount / meta.limits.products >= 0.7 ? "bg-amber-500" : "bg-green-500"}`}
                        style={{ width: `${Math.min(100, (productCount / meta.limits.products) * 100)}%` }}
                      />
                    </div>
                    {productCount / meta.limits.products >= 0.8 && (
                      <div className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Te acercás al límite. Considerá el plan Pro.
                      </div>
                    )}
                  </div>
                )}

                {/* Next billing */}
                <div className="mt-4 flex flex-col sm:flex-row gap-3 text-sm">
                  {sub.next_billing_date && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Próxima renovación: <b className="text-ink">{new Date(sub.next_billing_date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</b>
                    </div>
                  )}
                </div>

                {/* Included features */}
                <div className="mt-5 pt-5 border-t border-border">
                  <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-3">Incluye</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {meta.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-ink">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-2">
                  <a href={waLink("Quiero renovar o cambiar mi plan.")} target="_blank" rel="noopener noreferrer" className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold text-sm text-center hover:scale-[1.02] transition-all shadow-lg shadow-primary/20">
                    Renovar / Cambiar Plan
                  </a>
                  <a href={waLink("Tengo una consulta sobre mi membresía.")} target="_blank" rel="noopener noreferrer" className="flex-1 px-4 py-3 bg-white border border-border text-ink rounded-xl font-medium text-sm text-center hover:bg-secondary transition flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Contactar soporte
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Upgrade CTA */}
          {sub.plan === "basic" && (
            <div className="bg-gradient-to-br from-rose-deep to-primary text-white rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-4 shadow-xl shadow-primary/20">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <Crown className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="font-display text-xl">¿Vendes mucho? Pasate a Pro</div>
                <div className="text-sm opacity-90 mt-1">Productos ilimitados, analytics avanzado, sin marca KrinStore y soporte prioritario.</div>
              </div>
              <a href={waLink("Quiero upgrade al plan Pro.")} target="_blank" rel="noopener noreferrer" className="bg-white text-rose-deep px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap hover:scale-105 transition">
                Upgrade a Pro
              </a>
            </div>
          )}

          {/* Compare plans */}
          <div>
            <h2 className="font-display text-xl text-ink mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Comparar planes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(PLAN_META).map(([id, p]) => {
                const isCurrent = sub.plan === id;
                return (
                  <div key={id} className={`rounded-2xl p-5 border-2 transition ${isCurrent ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <p.icon className={`w-6 h-6 ${p.color}`} />
                      {isCurrent && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold uppercase">Actual</span>}
                    </div>
                    <div className="font-display text-lg text-ink">{p.name}</div>
                    <div className="text-2xl font-bold text-ink mt-1">S/ {p.price.toFixed(2)}<span className="text-xs text-muted-foreground font-normal">{p.price > 0 ? "/mes" : ""}</span></div>
                    <ul className="mt-4 space-y-2">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    {!isCurrent && (
                      <a href={waLink(`Quiero cambiar al plan ${p.name}.`)} target="_blank" rel="noopener noreferrer" className="mt-4 block w-full text-center py-2 border border-border rounded-full text-xs font-medium hover:bg-secondary transition">
                        Cambiar a {p.name}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mayorista purchases */}
          {sub.plan === "free_mayorista" && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl text-ink flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-600" /> Compras mayoristas verificadas
                </h3>
                <div className="text-sm">
                  Acumulado: <strong className="text-rose-deep">S/ {totalMayorista.toLocaleString()}</strong>
                </div>
              </div>
              {purchases.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">Sin compras registradas todavía.</div>
              ) : (
                <ul className="space-y-1">
                  {purchases.map((p) => (
                    <li key={p.id} className="flex justify-between items-center text-sm py-2 border-b border-border last:border-0">
                      <span className="text-muted-foreground">{new Date(p.purchase_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
                      <span className={p.verified ? "font-medium text-ink flex items-center gap-1.5" : "text-muted-foreground italic"}>
                        S/ {Number(p.amount).toLocaleString()}
                        {p.verified ? <Check className="w-3.5 h-3.5 text-green-600" /> : " (pendiente)"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NoSubscriptionCTA({ user, supportPhone, onActivated }: any) {
  const [activating, setActivating] = useState(false);
  const activate = async () => {
    setActivating(true);
    const nextBilling = new Date(); nextBilling.setDate(nextBilling.getDate() + 7);
    const { error } = await supabase.from("subscriptions").insert({
      user_id: user!.id, plan: "basic", status: "active", amount: 0,
      next_billing_date: nextBilling.toISOString(),
    });
    setActivating(false);
    if (error) alert(error.message);
    else onActivated();
  };

  return (
    <div className="p-8 md:p-10 bg-gradient-to-br from-primary/10 via-card to-secondary/30 border border-primary/20 rounded-3xl text-center shadow-xl shadow-primary/5">
      <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
        <Gift className="w-10 h-10" />
      </div>
      <h2 className="font-display text-3xl font-bold text-ink mb-2">¡Empezá con 7 días gratis!</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">Activá tu prueba gratuita del Plan Basic. Sin tarjeta, sin compromiso.</p>
      <div className="grid gap-3 max-w-md mx-auto">
        <button
          onClick={activate}
          disabled={activating}
          className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition disabled:opacity-50"
        >
          {activating ? "Activando..." : "Activar 7 días gratis ✨"}
        </button>
        <a
          href={`https://wa.me/${supportPhone}?text=${encodeURIComponent(`¡Hola! Soy ${user?.user_metadata?.full_name || user?.email}, quiero activar mi Plan Pro en KrinStore.`)}`}
          target="_blank" rel="noopener noreferrer"
          className="w-full py-4 bg-white border border-border text-ink rounded-2xl font-medium hover:bg-secondary transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" /> Solicitar Plan Pro por WhatsApp
        </a>
      </div>
    </div>
  );
}
