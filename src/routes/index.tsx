import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Check, Sparkles, Store, Palette, BarChart3, ArrowRight, Lightbulb, HeartHandshake, Award, Menu, X, Star, TrendingUp, ShoppingBag, Heart, Globe } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "KrinStore — Crea tu tienda virtual de cosmética en Perú | Revendedoras Krincesa" },
      { name: "description", content: "Plataforma #1 para revendedoras Krincesa en Perú. Crea tu tienda online en minutos, catálogo automático, ventas por WhatsApp. Planes desde S/ 0/mes." },
      { property: "og:title", content: "KrinStore — Crea tu tienda virtual de cosmética en Perú" },
      { property: "og:description", content: "Plataforma #1 para revendedoras Krincesa. Tienda profesional, catálogo automático y ventas por WhatsApp. Desde S/ 0/mes." },
      { property: "og:url", content: "https://krinstore.lovable.app/" },
      { property: "og:image", content: "https://krinstore.lovable.app/og-image.png" },
      { name: "twitter:image", content: "https://krinstore.lovable.app/og-image.png" },
      { name: "theme-color", content: "#FF4D8D" },
    ],
    links: [
      { rel: "canonical", href: "https://krinstore.lovable.app/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "KrinStore",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description: "Plataforma para crear tiendas virtuales de cosmética sincronizadas con el catálogo Krincesa, ideal para revendedoras en Perú.",
          offers: [
            { "@type": "Offer", name: "Free Mayorista", price: "0", priceCurrency: "PEN" },
            { "@type": "Offer", name: "Basic", price: "39.90", priceCurrency: "PEN" },
            { "@type": "Offer", name: "Pro", price: "89.90", priceCurrency: "PEN" },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "KrinStore",
          url: "https://krinstore.lovable.app",
          areaServed: "PE",
        }),
      },
    ],
  }),
});

const navLinks = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#ejemplos", label: "Ejemplos" },
  { href: "#planes", label: "Planes" },
  { href: "#preguntas", label: "Preguntas" },
];

const plans = [
  {
    name: "Free Mayorista",
    price: "S/ 0",
    period: "/mes",
    desc: "Para revendedoras que ya compran al por mayor en Krincesa.",
    features: ["Acceso completo gratis", "Catálogo ilimitado", "Sin tarjeta de crédito", "Requiere compras mensuales mínimas"],
    cta: "Activar con código",
    highlight: false,
  },
  {
    name: "Basic",
    price: "S/ 39.90",
    period: "/mes",
    desc: "Ideal para empezar tu tienda virtual.",
    features: ["Hasta 50 productos visibles", "1 tienda personalizada", "Subdominio gratis", "Soporte por chat"],
    cta: "Empezar gratis 7 días",
    highlight: true,
  },
  {
    name: "Pro",
    price: "S/ 89.90",
    period: "/mes",
    desc: "Para revendedoras serias que quieren escalar.",
    features: ["Catálogo completo ilimitado", "Analytics avanzados", "Dominio propio", "Soporte prioritario"],
    cta: "Quiero Pro",
    highlight: false,
  },
];

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background selection:bg-primary/20">
      {/* Skip to content */}
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-full focus:font-bold">
        Saltar al contenido
      </a>

      {/* Nav */}
      <nav aria-label="Principal" className="border-b border-border/40 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          <Logo />
          <div className="hidden lg:flex items-center gap-8 mr-auto ml-12">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className={`text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-md px-1 py-1 ${focusRing}`}>{l.label}</a>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            <Link to="/auth" className={`px-3 sm:px-4 py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors rounded-full ${focusRing}`}>
              Iniciar sesión
            </Link>
            <Link to="/auth" search={{ mode: "signup" }} className={`px-5 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95 ${focusRing}`}>
              Crear mi tienda
            </Link>
          </div>

          {/* Mobile menu */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Abrir menú"
                className={`sm:hidden inline-flex items-center justify-center w-11 h-11 rounded-full border border-border bg-white text-ink ${focusRing}`}
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] max-w-sm p-0 bg-white">
              <SheetHeader className="p-6 border-b border-border/50 text-left">
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Móvil" className="flex flex-col p-6 gap-1">
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className={`px-4 py-4 rounded-2xl text-base font-semibold text-foreground hover:bg-secondary hover:text-primary transition-colors ${focusRing}`}
                  >
                    {l.label}
                  </a>
                ))}
                <div className="mt-6 flex flex-col gap-3">
                  <Link to="/auth" onClick={() => setMenuOpen(false)} className={`px-6 py-4 text-center text-sm font-semibold border-2 border-border rounded-full ${focusRing}`}>
                    Iniciar sesión
                  </Link>
                  <Link to="/auth" search={{ mode: "signup" }} onClick={() => setMenuOpen(false)} className={`px-6 py-4 text-center text-sm font-bold bg-primary text-primary-foreground rounded-full ${focusRing}`}>
                    Crear mi tienda
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <main id="main">
      {/* Hero */}
      <section className="relative pt-12 sm:pt-20 lg:pt-24 pb-20 sm:pb-28 lg:pb-32 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-72 -mt-72 pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary text-[10px] font-black tracking-widest uppercase mb-6 shadow-sm border border-primary/10">
              <Sparkles className="w-3 h-3" aria-hidden="true" /> LA PLATAFORMA #1 PARA REVENDEDORAS
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.02] sm:leading-[0.95] tracking-tighter text-ink">
              Tu <span className="text-primary">Tienda Virtual de Cosmética</span> en Perú
            </h1>
            <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Transformá tu negocio de belleza hoy. Una tienda profesional que se actualiza sola con el catálogo de Krincesa. Sin complicaciones técnicas.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/auth" search={{ mode: "signup" }} className={`px-8 sm:px-10 py-4 sm:py-5 bg-primary text-primary-foreground rounded-full font-bold text-base sm:text-lg hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group ${focusRing}`}>
                Empezar gratis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
              <a href="#ejemplos" className={`px-8 sm:px-10 py-4 sm:py-5 bg-white border-2 border-border/60 text-foreground rounded-full font-bold text-base sm:text-lg hover:bg-muted hover:border-primary/20 transition-all flex items-center justify-center ${focusRing}`}>
                Ver ejemplos
              </a>
            </div>

            <div className="mt-10 sm:mt-12 flex items-center gap-4 sm:gap-6">
              <div className="flex -space-x-3" aria-hidden="true">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-muted" />
                ))}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-secondary flex items-center justify-center text-[10px] font-bold text-primary">+500</div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Más de 500 emprendedoras<br className="hidden sm:inline" /> ya confían en nosotros
              </p>
            </div>
          </div>

          <div className="relative animate-in fade-in zoom-in duration-1000 delay-200 hidden md:block">
            <div className="absolute -inset-10 bg-primary/10 rounded-full blur-[80px] opacity-50" aria-hidden="true" />
            <div className="relative rounded-[2rem] sm:rounded-[2.5rem] border-4 border-white bg-white p-2 shadow-[0_32px_64px_-16px_rgba(255,77,141,0.2)]">
              <div className="rounded-[1.5rem] sm:rounded-[1.8rem] overflow-hidden bg-muted relative aspect-[4/5]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFF0F5] to-white" />
                <div className="relative h-full flex flex-col">
                  <div className="p-6 flex justify-between items-center">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold" aria-hidden="true">K</div>
                    <div className="flex gap-2" aria-hidden="true">
                      <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px]">🛒</div>
                      <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px]">👤</div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                    <div className="w-28 h-28 rounded-full border-4 border-white shadow-2xl bg-white mb-6 flex items-center justify-center text-5xl" aria-hidden="true">✨</div>
                    <p className="font-display text-3xl font-bold text-ink">Beauty Shop</p>
                    <p className="text-muted-foreground mt-2 italic">Colección Exclusiva 2024</p>
                    <div className="mt-6 flex gap-3" aria-hidden="true">
                      <div className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-full">Ver Productos</div>
                      <div className="px-6 py-2 bg-white border border-border text-sm font-bold rounded-full">Contacto</div>
                    </div>
                  </div>
                  <div className="p-6 mt-auto" aria-hidden="true">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-24 bg-white/50 rounded-2xl border border-white" />
                      <div className="h-24 bg-white/50 rounded-2xl border border-white" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 lg:-right-8 top-1/4 bg-white p-3 lg:p-4 rounded-2xl shadow-xl border border-border" aria-hidden="true">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">✓</div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nueva Venta</div>
                    <div className="text-sm font-bold text-ink">S/ 89.90</div>
                  </div>
                </div>
              </div>
              <div className="absolute -left-4 lg:-left-12 bottom-1/4 bg-white p-3 lg:p-4 rounded-2xl shadow-xl border border-border" aria-hidden="true">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">💖</div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Favorito</div>
                    <div className="text-sm font-bold text-ink">Labial Mate Red</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 sm:py-20 border-y border-border/50 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,var(--primary),transparent)]" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-10 sm:mb-12">CON EL RESPALDO DE LAS MEJORES MARCAS</p>
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12 md:gap-24 opacity-50">
            {["KRINCESA", "BEAUTYPRO", "COSMETICS", "GLAMOUR"].map((b) => (
              <span key={b} className="font-display text-xl sm:text-2xl font-black italic tracking-tighter hover:text-primary transition-colors">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Examples */}
      <section id="ejemplos" className="py-20 sm:py-28 lg:py-32 bg-white relative overflow-hidden scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 mb-12 sm:mb-20">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase mb-4">
                INSPIRACIÓN
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-ink leading-tight">
                Tiendas que <br className="hidden sm:block" /> <span className="text-primary">inspiran confianza.</span>
              </h2>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground">
                Mirá cómo otras revendedoras personalizaron su espacio. Desde estilos minimalistas hasta diseños vibrantes.
              </p>
            </div>
            <Link to="/auth" search={{ mode: "signup" }} className={`group inline-flex items-center gap-3 font-black text-xs uppercase tracking-widest text-primary hover:text-rose-deep transition-colors rounded-md py-2 ${focusRing}`}>
              VER TODAS LAS PLANTILLAS <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { name: "Luna Beauty", subdomain: "luna-beauty", author: "Marta R.", theme: "París", img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop", tag: "MINIMAL" },
              { name: "PINKRIS", subdomain: "pinkris", author: "Sofía G.", theme: "Rio", img: "https://images.unsplash.com/photo-1522335789183-b11407384352?q=80&w=800&auto=format&fit=crop", tag: "VIBRANTE" },
              { name: "Aela Family", subdomain: "aelafamily", author: "Elena M.", theme: "New York", img: "https://images.unsplash.com/photo-1512496011951-a99b83f7dfb1?q=80&w=800&auto=format&fit=crop", tag: "ELEGANTE" },
            ].map((ex, idx) => (
              <Link
                key={idx}
                to="/s/$subdomain"
                params={{ subdomain: ex.subdomain }}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visitar tienda ${ex.name}`}
                className={`group relative block rounded-[2rem] sm:rounded-[2.5rem] ${focusRing}`}
              >
                <article className="aspect-[4/5] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-border/50 shadow-sm group-hover:shadow-2xl group-hover:shadow-primary/20 transition-all duration-500 relative">
                  <img src={ex.img} alt={`Ejemplo de tienda virtual cosmética ${ex.name}`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" aria-hidden="true" />

                  <div className="absolute top-5 left-5 sm:top-6 sm:left-6">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black tracking-widest rounded-full">
                      {ex.tag}
                    </span>
                  </div>

                  <div className="absolute top-5 right-5 sm:top-6 sm:right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-black tracking-widest rounded-full shadow-lg">
                      VISITAR <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    </span>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 text-white">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">PROYECTO REAL</div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold mb-1">{ex.name}</h3>
                    <p className="text-xs sm:text-sm text-white/70">por {ex.author} • Estilo {ex.theme}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 sm:py-28 lg:py-32 relative scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-ink tracking-tight">Tu camino al éxito en 3 pasos</h2>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg">Diseñamos todo para que solo te preocupes por crecer.</p>
          </div>

          <ol className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 sm:gap-12">
            {[
              { step: "01", title: "Creá tu cuenta", desc: "Elegí el nombre de tu tienda y personalizá los colores con tu marca personal.", icon: Store },
              { step: "02", title: "Catálogo Automático", desc: "Sincronizamos todos los productos de Krincesa con un solo clic. Sin subir fotos manuales.", icon: Palette },
              { step: "03", title: "Vendé por WhatsApp", desc: "Tus clientas arman el carrito y te envían el pedido directo a tu celular para cerrar la venta.", icon: HeartHandshake },
            ].map((s) => (
              <li key={s.title} className="relative group">
                <div className="absolute -top-6 -left-2 text-7xl sm:text-8xl font-black text-primary/5 select-none" aria-hidden="true">{s.step}</div>
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <s.icon className="w-8 h-8" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold mb-3">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 sm:py-28 lg:py-32 bg-ink text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 -skew-x-12 translate-x-1/2" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-8">
                Construido para la <span className="text-primary">emprendedora moderna.</span>
              </h2>
              <div className="space-y-6 sm:space-y-8">
                {[
                  { icon: Award, title: "Respaldo Oficial", desc: "Plataforma oficial para revendedoras Krincesa." },
                  { icon: BarChart3, title: "Control Total", desc: "Estadísticas de visitas y pedidos para que sepas qué productos gustan más." },
                  { icon: Lightbulb, title: "Sin Experiencia", desc: "No necesitás saber de diseño ni programación. Es tan fácil como usar Instagram." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-5 sm:gap-6">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg sm:text-xl mb-1">{item.title}</h3>
                      <p className="text-white/60">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-br from-primary/20 to-transparent border border-white/10 flex items-center justify-center overflow-hidden">
                <div className="grid grid-cols-2 gap-4 p-6 sm:p-8 w-full">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/10 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} aria-hidden="true" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="planes" className="py-20 sm:py-28 lg:py-32 bg-secondary/30 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-ink">Inversión para tu futuro</h2>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg">Planes diseñados para cada etapa de tu negocio.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {plans.map((p) => (
              <div key={p.name} className={`relative p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border-2 transition-all flex flex-col ${p.highlight ? "bg-white border-primary shadow-[0_32px_64px_-16px_rgba(255,77,141,0.15)] lg:scale-105 lg:z-10" : "bg-white border-border/50 hover:border-primary/20"}`}>
                {p.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">Más Popular</div>
                )}
                <div className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">{p.name}</div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display text-4xl sm:text-5xl font-black text-ink">{p.price}</span>
                  <span className="text-muted-foreground font-medium">{p.period}</span>
                </div>
                <p className="text-muted-foreground mb-8 text-sm leading-relaxed">{p.desc}</p>
                <ul className="space-y-3 sm:space-y-4 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm font-medium">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" aria-hidden="true" />
                      </div>
                      <span className="text-foreground/80">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className={`mt-8 sm:mt-10 block text-center px-6 sm:px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all ${p.highlight ? "bg-primary text-primary-foreground hover:shadow-xl hover:shadow-primary/30" : "bg-ink text-white hover:bg-primary"} ${focusRing}`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="preguntas" className="py-20 sm:py-28 lg:py-32 bg-white scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-ink">Preguntas frecuentes</h2>
            <p className="mt-4 text-muted-foreground">Todo lo que necesitás saber para empezar.</p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3 sm:space-y-4">
            {[
              { q: "¿Necesito tener conocimientos técnicos?", a: "Para nada. KrinStore está diseñada para ser extremadamente fácil. Si sabés usar WhatsApp o Facebook, sabés usar nuestra plataforma." },
              { q: "¿Cómo recibo los pagos?", a: "Los pedidos llegan directamente a tu WhatsApp con todos los datos de la clienta (Nombre, Dirección, Teléfono). Vos acordás el método de pago (transferencia, efectivo, etc.) directamente con tu clienta, sin intermediarios ni comisiones." },
              { q: "¿Los productos se actualizan solos?", a: "Sí. Cada vez que Krincesa agrega productos nuevos o cambia precios, tu tienda se actualiza automáticamente. No tenés que cargar nada manualmente." },
              { q: "¿Puedo usar mi propio dominio?", a: "¡Claro! En el plan Pro podés conectar tu propio dominio (ej: www.tutienda.com). En los demás planes tenés un subdominio profesional gratis." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-2 border-border/50 rounded-2xl px-5 sm:px-6 data-[state=open]:border-primary/30 data-[state=open]:bg-secondary/10 transition-all">
                <AccordionTrigger className="font-bold text-base sm:text-lg hover:no-underline text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-br from-primary to-rose-400 p-10 sm:p-16 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent)]" aria-hidden="true" />
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white relative z-10 leading-tight">
            Empezá tu tienda <br className="hidden md:block" /> gratis hoy mismo
          </h2>
          <p className="mt-5 sm:mt-6 text-white/90 text-base sm:text-lg md:text-xl max-w-2xl mx-auto relative z-10 font-medium">
            No pierdas más tiempo cargando fotos manualmente. Unite a la comunidad de revendedoras con más éxito.
          </p>
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 relative z-10">
            <Link to="/auth" search={{ mode: "signup" }} className={`px-10 sm:px-12 py-5 bg-white text-primary rounded-full font-black text-base sm:text-lg hover:shadow-2xl hover:bg-secondary transition-all active:scale-95 ${focusRing}`}>
              CREAR MI TIENDA AHORA
            </Link>
          </div>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30 pt-16 sm:pt-20 pb-8 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-12 mb-12 sm:mb-16">
            <div className="sm:col-span-2">
              <Logo />
              <p className="mt-6 text-muted-foreground max-w-xs leading-relaxed">
                La solución definitiva para revendedoras de Krincesa que buscan profesionalizar su negocio digital.
              </p>
            </div>
            <div>
              <h2 className="font-black text-xs uppercase tracking-[0.2em] mb-5 sm:mb-6">Plataforma</h2>
              <ul className="space-y-3 sm:space-y-4 text-sm font-medium text-muted-foreground">
                <li><a href="#como-funciona" className={`hover:text-primary transition-colors rounded-sm ${focusRing}`}>Cómo funciona</a></li>
                <li><a href="#planes" className={`hover:text-primary transition-colors rounded-sm ${focusRing}`}>Planes y precios</a></li>
                <li><a href="#preguntas" className={`hover:text-primary transition-colors rounded-sm ${focusRing}`}>Preguntas frecuentes</a></li>
              </ul>
            </div>
            <div>
              <h2 className="font-black text-xs uppercase tracking-[0.2em] mb-5 sm:mb-6">Legal</h2>
              <ul className="space-y-3 sm:space-y-4 text-sm font-medium text-muted-foreground">
                <li><Link to="/auth" className={`hover:text-primary transition-colors rounded-sm ${focusRing}`}>Términos y condiciones</Link></li>
                <li><Link to="/auth" className={`hover:text-primary transition-colors rounded-sm ${focusRing}`}>Privacidad</Link></li>
                <li><Link to="/auth" className={`hover:text-primary transition-colors rounded-sm ${focusRing}`}>Soporte</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 sm:pt-10 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground text-center">
              © {new Date().getFullYear()} KrinStore. Desarrollado con 💖 para Krincesa.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
