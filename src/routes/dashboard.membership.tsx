import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { MessageCircle, ShieldCheck, Clock, CreditCard } from "lucide-react";

export const Route = createFileRoute("/dashboard/membership")({ component: MembershipPage });

function MembershipPage() {
  const { user } = useAuth();
  const [sub, setSub] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [store, setStore] = useState<any>(null);
  const [supportPhone, setSupportPhone] = useState("51987654321");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: s }, { data: p }, { data: st }, { data: settings }] = await Promise.all([
        supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("mayorista_purchases").select("*").eq("user_id", user.id).order("purchase_date", { ascending: false }),
        supabase.from("stores").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("system_settings").select("value").eq("key", "support_whatsapp").maybeSingle(),
      ]);
      setSub(s); 
      setPurchases(p ?? []); 
      setStore(st);
      setSupportPhone(settings?.value || "51987654321");
    })();
  }, [user]);

  const total = purchases.filter((p) => p.verified).reduce((a, b) => a + Number(b.amount), 0);

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="font-display text-3xl text-ink">Mi Membresía</h1>

      {!sub ? (
        <div className="mt-8 p-10 bg-white border border-border rounded-[2.5rem] text-center shadow-xl shadow-black/5">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink mb-2">¡Bienvenida a KrinStore!</h2>
          <p className="text-muted-foreground mb-8">Para empezar a vender, activa tu prueba gratuita de 7 días del Plan Basic o contacta con nosotros para el Plan Pro.</p>
          
          <div className="grid gap-4">
            <button 
              onClick={async () => {
                const nextBilling = new Date();
                nextBilling.setDate(nextBilling.getDate() + 7);
                const { error } = await supabase.from("subscriptions").insert({
                  user_id: user!.id,
                  plan: "basic",
                  status: "active",
                  amount: 0,
                  next_billing_date: nextBilling.toISOString()
                });
                if (error) alert(error.message);
                else window.location.reload();
              }}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
            >
              Activar 7 días gratis (Plan Basic)
            </button>
            <a 
              href={`https://wa.me/${supportPhone}?text=${encodeURIComponent(`¡Hola! Soy ${user?.user_metadata?.full_name || user?.email}, quiero activar mi Plan Pro en KrinStore.\n\nTienda: ${store?.subdomain || 'N/A'}\nEmail: ${user?.email}`)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-4 bg-white border border-border text-ink rounded-2xl font-bold hover:bg-muted transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" /> Solicitar Plan Pro por WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-6 p-6 bg-card border border-border rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Plan actual</div>
              <div className="font-display text-2xl mt-1 capitalize">{sub.plan.replace("_", " ")}</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${sub.status === "active" ? "bg-emerald-100 text-emerald-700" : sub.status === "grace" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
              {sub.status}
            </span>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            {sub.next_billing_date && <>Próximo cobro: {new Date(sub.next_billing_date).toLocaleDateString()}<br /></>}
            Monto: ${sub.amount}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a 
              href={`https://wa.me/${supportPhone}?text=${encodeURIComponent(`¡Hola! Soy ${user?.user_metadata?.full_name || user?.email}, quiero renovar o cambiar mi plan en KrinStore.\n\nTienda: ${store?.subdomain || 'N/A'}\nPlan Actual: ${sub.plan}\nEmail: ${user?.email}`)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all text-center"
            >
              Renovar / Cambiar Plan
            </a>
            <a 
              href={`https://wa.me/${supportPhone}?text=${encodeURIComponent(`¡Hola! Soy ${user?.user_metadata?.full_name || user?.email}, quiero renovar mi membresía en KrinStore.\n\nTienda: ${store?.subdomain || 'N/A'}\nPlan Actual: ${sub.plan}\nEmail: ${user?.email}`)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white border border-border text-ink rounded-full font-medium flex items-center justify-center gap-2 hover:bg-muted transition-all"
            >
              <MessageCircle className="w-4 h-4" /> Hablar con Soporte
            </a>
          </div>
        </div>
      )}

      {sub?.plan === "free_mayorista" && (
        <div className="mt-6 p-6 bg-secondary border border-border rounded-2xl">
          <h3 className="font-display text-xl text-ink">Compras mayoristas verificadas</h3>
          <div className="mt-2 text-sm text-muted-foreground">Acumulado este período: <strong className="text-rose-deep">${total.toLocaleString()}</strong></div>
          <ul className="mt-4 space-y-2">
            {purchases.length === 0 && <li className="text-sm text-muted-foreground">Sin compras registradas todavía.</li>}
            {purchases.map((p) => (
              <li key={p.id} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                <span>{new Date(p.purchase_date).toLocaleDateString()}</span>
                <span className={p.verified ? "text-foreground" : "text-muted-foreground"}>${Number(p.amount).toLocaleString()} {!p.verified && "(pendiente)"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {sub && (
        <div className={`mt-6 p-6 border rounded-2xl flex items-start gap-4 shadow-sm transition-all ${
          new Date(sub.next_billing_date) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && sub.status === 'active' 
          ? 'bg-rose-50 border-rose-200 animate-pulse' 
          : 'bg-white border-border'
        }`}>
          <div className={`p-3 rounded-xl ${sub.status === 'active' ? (new Date(sub.next_billing_date) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) ? 'bg-rose-100 text-rose-600' : 'bg-emerald-50 text-emerald-600') : 'bg-rose-50 text-rose-600'}`}>
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-ink">Estado de la Licencia</h4>
            {new Date(sub.next_billing_date) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && sub.status === 'active' ? (
              <div className="mt-2">
                <p className="text-sm font-black text-rose-600 uppercase tracking-tighter">⚠️ ¡ATENCIÓN! TU LICENCIA VENCE PRONTO</p>
                <p className="text-xs text-rose-500 mt-1 font-medium">Quedan menos de 3 días. Renueva hoy para evitar que tu tienda sea desactivada automáticamente.</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                Tu licencia es gestionada manualmente. Si necesitas renovar o tienes dudas, contacta directamente con nuestro equipo de soporte.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
