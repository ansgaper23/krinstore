import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { THEMES, DEFAULT_SECTIONS } from "@/lib/store-sections";
import { Logo } from "@/components/Logo";
import { Check, Sparkles, Store, Palette, CreditCard, ArrowRight, ArrowLeft, Loader2, CheckCircle2, XCircle, PartyPopper } from "lucide-react";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const templates = [
  { id: "paris", name: "París", tag: "Elegante", colors: ["#C45C7C", "#FEF0F5", "#FFFFFF"] },
  { id: "rio", name: "Rio", tag: "Vibrante", colors: ["#E85D3A", "#FAF8F5", "#FFFFFF"] },
  { id: "newyork", name: "New York", tag: "Minimalista", colors: ["#0D0D0D", "#FFFFFF", "#F0F0F0"] },
  { id: "seul", name: "Seúl", tag: "Fresco", colors: ["#73C088", "#F5F8F0", "#FFFFFF"] },
  { id: "madrid", name: "Madrid", tag: "Cálido", colors: ["#9B4423", "#F0EBE3", "#FFFFFF"] },
  { id: "standard", name: "Standard", tag: "Clásico", colors: ["#1A1A2E", "#F5F3EE", "#FFFFFF"] },
];

const plans = [
  { id: "free_mayorista", name: "Free Mayorista", price: "S/ 0", note: "Necesitás código de mayorista", features: ["Catálogo Krincesa", "Tienda ilimitada", "Comisión por venta"] },
  { id: "basic", name: "Basic", price: "S/ 39.90/mes", note: "Ideal para empezar", features: ["Hasta 50 productos", "Analytics básico", "Soporte por WhatsApp"], popular: true },
  { id: "pro", name: "Pro", price: "S/ 89.90/mes", note: "Todo lo que necesitás", features: ["Productos ilimitados", "Analytics avanzado", "Soporte prioritario", "Sin marca KrinStore"] },
];

const STEPS = [
  { n: 1, label: "Perfil", icon: Sparkles },
  { n: 2, label: "Tienda", icon: Store },
  { n: 3, label: "Diseño", icon: Palette },
  { n: 4, label: "Plan", icon: CreditCard },
];

function Onboarding() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [storeName, setStoreName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [subdomainStatus, setSubdomainStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [template, setTemplate] = useState("paris");
  const [plan, setPlan] = useState<"free_mayorista" | "basic" | "pro">("basic");
  const [mayoristaCode, setMayoristaCode] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { navigate({ to: "/auth" }); return; }
    if (user) {
      supabase.from("stores").select("id").eq("user_id", user.id).maybeSingle().then(({ data }) => {
        if (data) navigate({ to: "/dashboard" });
      });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (storeName && !subdomain) {
      setSubdomain(storeName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20));
    }
  }, [storeName]);

  // Async subdomain availability check
  useEffect(() => {
    if (!subdomain) { setSubdomainStatus("idle"); return; }
    if (!/^[a-z0-9-]{3,30}$/.test(subdomain)) { setSubdomainStatus("invalid"); return; }
    setSubdomainStatus("checking");
    const t = setTimeout(async () => {
      const { data } = await supabase.from("stores").select("id").eq("subdomain", subdomain).maybeSingle();
      setSubdomainStatus(data ? "taken" : "available");
    }, 500);
    return () => clearTimeout(t);
  }, [subdomain]);

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const selectedTemplate = useMemo(() => templates.find(t => t.id === template) || templates[0], [template]);

  const finish = async () => {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await supabase.from("profiles").update({ phone, full_name: user.user_metadata?.full_name ?? null }).eq("id", user.id);
      const { data: existing } = await supabase.from("stores").select("id").eq("subdomain", slugify(subdomain)).maybeSingle();
      if (existing) throw new Error("Este nombre de tienda ya está ocupado. Elige otro.");

      const isMayorista = plan === "free_mayorista";
      if (isMayorista && !/^KRIN-/i.test(mayoristaCode)) throw new Error("Código de mayorista inválido. Debe empezar con KRIN-");
      if (isMayorista) await supabase.from("profiles").update({ is_mayorista: true }).eq("id", user.id);

      const theme = THEMES.find(t => t.id === template) || THEMES[0];
      const { error: storeErr } = await supabase.from("stores").insert({
        user_id: user.id,
        store_name: storeName.trim(),
        subdomain: slugify(subdomain).trim(),
        template,
        primary_color: theme.primary,
        secondary_color: theme.secondary,
        font_family: theme.font,
        button_style: theme.button,
        sections: DEFAULT_SECTIONS,
        is_active: true,
        status: "active",
      });
      if (storeErr) throw storeErr;

      const next = new Date(); next.setMonth(next.getMonth() + 1);
      await supabase.from("subscriptions").insert({
        user_id: user.id, plan, status: "active",
        next_billing_date: next.toISOString(),
        amount: plan === "free_mayorista" ? 0 : plan === "basic" ? 39.90 : 89.90,
      });

      setDone(true);
      setTimeout(() => navigate({ to: "/dashboard" }), 2200);
    } catch (e: any) {
      setError(e.message ?? "Error al crear la tienda");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return null;

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary to-background flex items-center justify-center p-6">
        <div className="text-center max-w-md animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/30">
            <PartyPopper className="w-12 h-12 text-white" />
          </div>
          <h1 className="font-display text-4xl text-ink">¡Tu tienda está lista! 🎉</h1>
          <p className="text-muted-foreground mt-3">Te estamos llevando al dashboard para que empieces a vender...</p>
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mt-6" />
        </div>
      </div>
    );
  }

  const canContinue =
    (step === 1 && phone.length >= 6) ||
    (step === 2 && storeName && subdomain && subdomainStatus === "available") ||
    (step === 3 && template) ||
    (step === 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary to-background">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Logo />

        {/* Progress bar with labels */}
        <div className="mt-8 mb-8">
          <div className="flex items-center justify-between gap-2">
            {STEPS.map((s, i) => {
              const active = s.n === step;
              const done = s.n < step;
              const Icon = s.icon;
              return (
                <div key={s.n} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      active ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110" :
                      done ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {done ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={`text-[10px] font-medium uppercase tracking-wider ${active ? "text-ink" : "text-muted-foreground"}`}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 mb-6 bg-muted overflow-hidden rounded">
                      <div className={`h-full bg-primary transition-all duration-500`} style={{ width: done ? "100%" : "0%" }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form panel */}
          <div className="lg:col-span-3 bg-card rounded-3xl border border-border p-8 shadow-xl shadow-primary/5">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <div>
                  <h1 className="font-display text-3xl text-ink">¡Contanos un poco de vos! 👋</h1>
                  <p className="text-sm text-muted-foreground mt-2">Esto solo lo vemos nosotros para poder ayudarte cuando lo necesites.</p>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium">Teléfono / WhatsApp</label>
                  <input
                    placeholder="+51 987 654 321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Iniciás como <strong className="text-ink">{user?.user_metadata?.full_name ?? user?.email}</strong>.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <div>
                  <h1 className="font-display text-3xl text-ink">Configurá tu tienda</h1>
                  <p className="text-sm text-muted-foreground mt-2">Esto lo van a ver tus clientas.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nombre de la tienda</label>
                    <input
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="María Cosmetics"
                      className="mt-1.5 w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Dirección web</label>
                    <div className="mt-1.5 flex items-center rounded-xl border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                      <input
                        value={subdomain}
                        onChange={(e) => setSubdomain(slugify(e.target.value))}
                        placeholder="tu-tienda"
                        className="flex-1 px-4 py-3 bg-transparent focus:outline-none min-w-0"
                      />
                      <span className="px-4 text-sm text-muted-foreground border-l border-border">.krinstore.com</span>
                    </div>
                    <div className="mt-2 text-xs flex items-center gap-1.5 min-h-[1rem]">
                      {subdomainStatus === "checking" && (<><Loader2 className="w-3 h-3 animate-spin" /> Verificando...</>)}
                      {subdomainStatus === "available" && (<span className="text-green-600 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> ¡Disponible! Tu tienda estará en <b>{subdomain}.krinstore.com</b></span>)}
                      {subdomainStatus === "taken" && (<span className="text-red-500 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> Ese nombre ya está en uso. Prueba otro.</span>)}
                      {subdomainStatus === "invalid" && (<span className="text-amber-600 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> Solo letras, números y guiones (3-30 caracteres).</span>)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <div>
                  <h1 className="font-display text-3xl text-ink">Elegí un estilo</h1>
                  <p className="text-sm text-muted-foreground mt-2">Podés personalizarlo todo después.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTemplate(t.id)}
                      className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] ${template === t.id ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border"}`}
                    >
                      <div className="flex gap-1 mb-3">
                        {t.colors.map((c, i) => <div key={i} className="w-6 h-6 rounded-full border border-border" style={{ background: c }} />)}
                      </div>
                      <div className="text-sm font-semibold text-ink">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{t.tag}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <div>
                  <h1 className="font-display text-3xl text-ink">Elegí tu plan</h1>
                  <p className="text-sm text-muted-foreground mt-2">Podés cambiarlo o cancelar cuando quieras.</p>
                </div>
                <div className="space-y-3">
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlan(p.id as any)}
                      className={`relative w-full p-4 rounded-2xl border text-left transition-all ${plan === p.id ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border hover:border-primary/40"}`}
                    >
                      {p.popular && (
                        <span className="absolute -top-2 right-4 text-[10px] bg-rose-deep text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Recomendado</span>
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-ink">{p.name}</span>
                            <span className="text-rose-deep font-bold text-sm">{p.price}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{p.note}</div>
                          <ul className="mt-2 space-y-1">
                            {p.features.map((f, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-green-600" /> {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {plan === p.id && (
                          <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                  {plan === "free_mayorista" && (
                    <input
                      placeholder="Código mayorista (ej: KRIN-1234)"
                      value={mayoristaCode}
                      onChange={(e) => setMayoristaCode(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  )}
                </div>
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                    <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
                  </div>
                )}
              </div>
            )}

            {/* Nav */}
            <div className="mt-8 flex items-center justify-between">
              {step > 1 ? (
                <button onClick={() => setStep(step - 1)} className="px-4 py-2.5 text-sm text-muted-foreground hover:text-ink flex items-center gap-1.5 transition">
                  <ArrowLeft className="w-4 h-4" /> Atrás
                </button>
              ) : <div />}
              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canContinue}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium disabled:opacity-40 flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={finish}
                  disabled={submitting}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold disabled:opacity-40 flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</> : <>✨ Crear mi tienda</>}
                </button>
              )}
            </div>
          </div>

          {/* Live preview panel */}
          <div className="lg:col-span-2 hidden lg:block">
            <div className="sticky top-6">
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3">Vista previa</div>
              <div className="bg-ink rounded-[2rem] p-3 shadow-2xl">
                <div className="rounded-[1.5rem] overflow-hidden aspect-[9/16] flex flex-col" style={{ background: selectedTemplate.colors[1] }}>
                  <div className="px-4 py-3 flex items-center justify-between text-[10px]" style={{ color: selectedTemplate.colors[0] }}>
                    <div className="font-bold truncate">{storeName || "Tu tienda"}</div>
                    <div>•••</div>
                  </div>
                  <div className="px-4 py-6 text-center" style={{ background: selectedTemplate.colors[2] }}>
                    <div className="w-14 h-14 rounded-full mx-auto mb-2" style={{ background: selectedTemplate.colors[0] }} />
                    <div className="font-bold text-sm" style={{ color: selectedTemplate.colors[0] }}>{storeName || "Tu tienda"}</div>
                    <div className="text-[9px] mt-1 opacity-60">{subdomain || "tu-tienda"}.krinstore.com</div>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-2 gap-2 flex-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="rounded-lg p-2 bg-white/60 backdrop-blur">
                        <div className="aspect-square rounded-md mb-1.5" style={{ background: `${selectedTemplate.colors[0]}20` }} />
                        <div className="h-1.5 w-3/4 rounded mb-1" style={{ background: `${selectedTemplate.colors[0]}60` }} />
                        <div className="h-1.5 w-1/2 rounded" style={{ background: `${selectedTemplate.colors[0]}30` }} />
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3">
                    <div className="w-full rounded-full py-2 text-center text-[10px] font-bold text-white" style={{ background: selectedTemplate.colors[0] }}>
                      Comprar ahora
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">Así se verá tu tienda ✨</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
