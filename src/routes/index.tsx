import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Check, Sparkles, Store, Palette, BarChart3, ArrowRight } from "lucide-react";

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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary via-background to-background" />
        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-rose-deep text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Para revendedoras de Krincesa
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-semibold leading-tight tracking-tight text-ink">
            Crea tu tienda de cosméticos<br />
            <span className="italic text-rose-deep">en 2 minutos.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Tu propia tienda online, con tu marca, tus colores y el catálogo completo de Krincesa sincronizado automáticamente. Sin código, sin complicaciones.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/auth" search={{ mode: "signup" }} className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition inline-flex items-center gap-2">
              Crear mi tienda gratis <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#planes" className="px-6 py-3 border border-border bg-card rounded-full font-medium hover:bg-muted transition">
              Ver planes
            </a>
          </div>

          {/* Demo mockup */}
          <div className="mt-16 mx-auto max-w-3xl rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10 overflow-hidden">
            <div className="h-8 bg-muted flex items-center gap-1.5 px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-deep/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
              <div className="ml-3 text-[11px] text-muted-foreground">mariashop.krinstore.com</div>
            </div>
            <div className="aspect-[16/9] bg-gradient-to-br from-blush via-background to-accent flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 mb-3" />
                <div className="font-display text-2xl text-ink">María Cosmetics</div>
                <div className="text-xs text-muted-foreground mt-1">Tu tienda, tu estilo.</div>
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
