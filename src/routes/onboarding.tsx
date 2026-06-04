import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { THEMES, DEFAULT_SECTIONS } from "@/lib/store-sections";
import { Logo } from "@/components/Logo";
import { Check } from "lucide-react";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const templates = [
  { id: "paris", name: "París", colors: ["#C45C7C", "#FEF0F5", "#FFFFFF"] },
  { id: "rio", name: "Rio", colors: ["#E85D3A", "#FAF8F5", "#FFFFFF"] },
  { id: "newyork", name: "New York", colors: ["#0D0D0D", "#FFFFFF", "#F0F0F0"] },
  { id: "seul", name: "Seúl", colors: ["#73C088", "#F5F8F0", "#FFFFFF"] },
  { id: "madrid", name: "Madrid", colors: ["#9B4423", "#F0EBE3", "#FFFFFF"] },
  { id: "standard", name: "Standard", colors: ["#1A1A2E", "#F5F3EE", "#FFFFFF"] },
];

const plans = [
  { id: "free_mayorista", name: "Free Mayorista", price: "$0", note: "Necesitás código de mayorista" },
  { id: "basic", name: "Basic", price: "$9.990/mes", note: "Hasta 50 productos" },
  { id: "pro", name: "Pro", price: "$24.990/mes", note: "Catálogo completo + analytics" },
];

function Onboarding() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [storeName, setStoreName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [template, setTemplate] = useState("paris");
  const [plan, setPlan] = useState<"free_mayorista" | "basic" | "pro">("basic");
  const [mayoristaCode, setMayoristaCode] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  // Auto-suggest subdomain
  useEffect(() => {
    if (storeName && !subdomain) {
      setSubdomain(storeName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20));
    }
  }, [storeName, subdomain]);

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, "");

  const finish = async () => {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      // Update profile phone
      await supabase.from("profiles").update({ phone, full_name: user.user_metadata?.full_name ?? null }).eq("id", user.id);

      // Mayorista code validation (mock simple para demo: KRIN-XXXX)
      const isMayorista = plan === "free_mayorista";
      if (isMayorista && !/^KRIN-/i.test(mayoristaCode)) {
        throw new Error("Código de mayorista inválido. Debe empezar con KRIN-");
      }
      if (isMayorista) {
        await supabase.from("profiles").update({ is_mayorista: true }).eq("id", user.id);
      }

      // Obtener configuración de la plantilla elegida
      const theme = THEMES.find(t => t.id === template) || THEMES[0];

      // Crear tienda
      const { error: storeErr } = await supabase.from("stores").insert({
        user_id: user.id,
        store_name: storeName,
        subdomain: slugify(subdomain),
        template,
        primary_color: theme.primary,
        secondary_color: theme.secondary,
        font_family: theme.font,
        button_style: theme.button,
        sections: DEFAULT_SECTIONS
      });
      if (storeErr) throw storeErr;

      // Crear suscripción
      const next = new Date();
      next.setMonth(next.getMonth() + 1);
      await supabase.from("subscriptions").insert({
        user_id: user.id,
        plan,
        status: "active",
        next_billing_date: next.toISOString(),
        amount: plan === "free_mayorista" ? 0 : plan === "basic" ? 9990 : 24990,
      });

      navigate({ to: "/dashboard" });
    } catch (e: any) {
      setError(e.message ?? "Error al crear la tienda");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <Logo />
        <div className="mt-8 mb-10">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div className={`h-1.5 rounded-full ${s <= step ? "bg-primary" : "bg-border"}`} />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Paso {step} de 3</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-xl shadow-primary/5">
          {step === 1 && (
            <>
              <h1 className="font-display text-3xl text-ink">Contanos un poco de vos</h1>
              <p className="text-sm text-muted-foreground mt-1">Esto solo lo vemos nosotros.</p>
              <div className="mt-6 space-y-3">
                <input
                  placeholder="Teléfono / WhatsApp"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background"
                />
                <p className="text-xs text-muted-foreground">Usaremos tu nombre <strong>{user?.user_metadata?.full_name ?? user?.email}</strong>.</p>
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!phone}
                className="mt-6 w-full px-4 py-3 bg-primary text-primary-foreground rounded-full font-medium disabled:opacity-50"
              >Continuar</button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="font-display text-3xl text-ink">Configurá tu tienda</h1>
              <p className="text-sm text-muted-foreground mt-1">Esto van a verlo tus clientas.</p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium">Nombre de la tienda</label>
                  <input
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="María Cosmetics"
                    className="mt-1 w-full px-4 py-3 rounded-xl border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Subdominio</label>
                  <div className="mt-1 flex items-center rounded-xl border border-input bg-background overflow-hidden">
                    <input
                      value={subdomain}
                      onChange={(e) => setSubdomain(slugify(e.target.value))}
                      className="flex-1 px-4 py-3 bg-transparent focus:outline-none"
                    />
                    <span className="px-4 text-sm text-muted-foreground">.krinstore.com</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Plantilla base</label>
                  <div className="grid grid-cols-3 gap-3">
                    {templates.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTemplate(t.id)}
                        className={`p-3 rounded-xl border text-left transition ${template === t.id ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                      >
                        <div className="flex gap-1 mb-2">
                          {t.colors.map((c) => <div key={c} className="w-4 h-4 rounded-full" style={{ background: c }} />)}
                        </div>
                        <div className="text-sm font-medium">{t.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep(1)} className="px-4 py-3 border border-border rounded-full">Atrás</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!storeName || !subdomain}
                  className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-full font-medium disabled:opacity-50"
                >Continuar</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="font-display text-3xl text-ink">Elegí tu plan</h1>
              <p className="text-sm text-muted-foreground mt-1">Podés cambiarlo cuando quieras.</p>
              <div className="mt-6 space-y-3">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlan(p.id as any)}
                    className={`w-full p-4 rounded-xl border text-left transition flex items-center justify-between ${plan === p.id ? "border-primary ring-2 ring-primary/30 bg-secondary" : "border-border"}`}
                  >
                    <div>
                      <div className="font-medium">{p.name} <span className="text-rose-deep ml-2 text-sm">{p.price}</span></div>
                      <div className="text-xs text-muted-foreground mt-0.5">{p.note}</div>
                    </div>
                    {plan === p.id && <Check className="w-5 h-5 text-primary" />}
                  </button>
                ))}
                {plan === "free_mayorista" && (
                  <input
                    placeholder="Código mayorista (ej: KRIN-1234)"
                    value={mayoristaCode}
                    onChange={(e) => setMayoristaCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background"
                  />
                )}
              </div>
              {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep(2)} className="px-4 py-3 border border-border rounded-full">Atrás</button>
                <button
                  onClick={finish}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-full font-medium disabled:opacity-50"
                >
                  {submitting ? "Creando tu tienda..." : "Crear mi tienda"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
