import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Check, Sparkles, Store, Palette, BarChart3, ArrowRight, Lightbulb, HeartHandshake, Award } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({ component: Landing });

const plans = [
  {
    name: "Free Mayorista",
    price: "$0",
    period: "/mes",
    desc: "Para revendedoras que ya compran al por mayor en Krincesa.",
    features: ["Acceso completo gratis", "Catálogo ilimitado", "Sin tarjeta de crédito", "Requiere compras mensuales mínimas"],
    cta: "Activar con código",
    highlight: false,
  },
  {
    name: "Basic",
    price: "$9.990",
    period: "/mes",
    desc: "Ideal para empezar tu tienda virtual.",
    features: ["Hasta 50 productos visibles", "1 tienda personalizada", "Subdominio gratis", "Soporte por chat"],
    cta: "Empezar gratis 7 días",
    highlight: true,
  },
  {
    name: "Pro",
    price: "$24.990",
    period: "/mes",
    desc: "Para revendedoras serias que quieren escalar.",
    features: ["Catálogo completo ilimitado", "Analytics avanzados", "Dominio propio", "Soporte prioritario"],
    cta: "Quiero Pro",
    highlight: false,
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Link to="/auth" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition">Iniciar sesión</Link>
            <Link to="/auth" search={{ mode: "signup" }} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90 transition">
              Crear tienda
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,107,157,0.1),transparent_50%)]" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/30 -skew-x-12 translate-x-1/4 pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide uppercase mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Sparkles className="w-4 h-4" /> Para revendedoras de Krincesa
            </div>
            <h1 className="font-display text-6xl md:text-8xl font-bold leading-[1.1] tracking-tight text-ink animate-in fade-in slide-in-from-bottom-6 duration-700">
              Tu marca de <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">belleza</span> online.
            </h1>
            <p className="mt-8 text-xl text-muted-foreground max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Crea una tienda profesional en minutos. Catálogo de Krincesa sincronizado, pagos por WhatsApp y diseño premium.
            </p>
            <div className="mt-12 flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <Link to="/auth" search={{ mode: "signup" }} className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 transition-all flex items-center gap-2">
                Empezar gratis <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#planes" className="px-8 py-4 bg-white border border-border rounded-full font-bold text-lg hover:bg-muted transition-all">
                Ver planes
              </a>
            </div>
          </div>

          <div className="relative lg:block animate-in fade-in zoom-in duration-1000">
            <div className="absolute -inset-4 bg-primary/5 rounded-[2.5rem] blur-3xl" />
            <div className="relative rounded-[2rem] border-8 border-white bg-card shadow-2xl shadow-primary/10 overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="h-10 bg-white border-b border-border flex items-center justify-between px-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[11px] font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">mariashop.krinstore.app</div>
              </div>
              <div className="aspect-[4/5] bg-gradient-to-br from-secondary to-accent flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display text-3xl font-bold">M</div>
                </div>
                <h3 className="font-display text-4xl text-ink font-bold">María Beauty</h3>
                <p className="text-muted-foreground mt-4 italic font-display">"Donde la belleza encuentra su hogar"</p>
                <div className="mt-8 w-full h-1 bg-primary/20 rounded-full" />
                <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                  <div className="aspect-square bg-white rounded-2xl shadow-sm" />
                  <div className="aspect-square bg-white rounded-2xl shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Store, title: "Tienda lista en minutos", desc: "Subdominio propio, catálogo sincronizado, lista para vender." },
            { icon: Palette, title: "Personalización total", desc: "Logo, colores, fuentes y plantillas. Sin tocar código." },
            { icon: BarChart3, title: "Estadísticas claras", desc: "Visitas, productos top y ventas en tiempo real." },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition">
              <f.icon className="w-8 h-8 text-rose-deep mb-4" />
              <h3 className="font-display text-xl mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section id="planes" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl text-ink">Planes simples, sin sorpresas.</h2>
          <p className="mt-3 text-muted-foreground">Elegí el que mejor se adapte a tu emprendimiento.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.name} className={`p-8 rounded-2xl border transition ${p.highlight ? "bg-ink text-blush border-ink shadow-2xl shadow-primary/20 scale-105" : "bg-card border-border"}`}>
              <div className="text-xs uppercase tracking-wider opacity-70 mb-2">{p.name}</div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl">{p.price}</span>
                <span className="text-sm opacity-60">{p.period}</span>
              </div>
              <p className={`mt-3 text-sm ${p.highlight ? "opacity-80" : "text-muted-foreground"}`}>{p.desc}</p>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${p.highlight ? "text-primary" : "text-rose-deep"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className={`mt-8 block text-center px-4 py-3 rounded-full font-medium transition ${p.highlight ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-secondary text-foreground hover:bg-accent"}`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Camila R.", text: "Monté mi tienda en una tarde. Mis clientas me piden el link todo el día.", store: "camicosmetics" },
            { name: "Lucía M.", text: "Lo mejor: el catálogo se actualiza solo. Yo me dedico a vender.", store: "luciabeauty" },
            { name: "Sofía T.", text: "El plan de mayorista me sale gratis. Increíble.", store: "sofiashop" },
          ].map((t) => (
            <div key={t.name} className="p-6 rounded-2xl bg-secondary border border-border">
              <p className="font-display italic text-lg leading-snug">"{t.text}"</p>
              <div className="mt-4 text-sm">
                <div className="font-medium">{t.name}</div>
                <div className="text-rose-deep">{t.store}.krinstore.com</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-wrap justify-between items-center gap-4">
          <Logo />
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} KrinStore. Powered by Krincesa.</p>
        </div>
      </footer>
    </div>
  );
}
