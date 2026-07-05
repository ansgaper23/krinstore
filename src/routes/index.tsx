import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import {
  Check, Sparkles, Store, Palette, BarChart3, ArrowRight, Lightbulb, HeartHandshake, Award,
  Menu, Star, ShoppingBag, MessageCircle, X as XIcon, Play, TrendingUp, Zap, ShieldCheck,
  Calculator, Quote,
} from "lucide-react";
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
    links: [{ rel: "canonical", href: "https://krinstore.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "KrinStore",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "127" },
          offers: [
            { "@type": "Offer", name: "Free Mayorista", price: "0", priceCurrency: "PEN" },
            { "@type": "Offer", name: "Basic", price: "39.90", priceCurrency: "PEN" },
            { "@type": "Offer", name: "Pro", price: "89.90", priceCurrency: "PEN" },
          ],
        }),
      },
    ],
  }),
});

const navLinks = [
  { href: "#demo", label: "Demo" },
  { href: "#ejemplos", label: "Ejemplos" },
  { href: "#testimonios", label: "Testimonios" },
  { href: "#planes", label: "Planes" },
  { href: "#preguntas", label: "Preguntas" },
];

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// Planes con features detalladas para tabla comparativa
const plans = [
  {
    name: "Free Mayorista", price: "S/ 0", period: "/mes",
    desc: "Para revendedoras que ya compran al por mayor en Krincesa.",
    features: ["Acceso completo gratis", "Catálogo ilimitado", "Sin tarjeta de crédito", "Requiere compras mensuales mínimas"],
    cta: "Activar con código", highlight: false,
  },
  {
    name: "Basic", price: "S/ 39.90", period: "/mes",
    desc: "Ideal para empezar tu tienda virtual.",
    features: ["Hasta 50 productos visibles", "1 tienda personalizada", "Subdominio gratis", "Soporte por chat"],
    cta: "Empezar gratis 7 días", highlight: true,
  },
  {
    name: "Pro", price: "S/ 89.90", period: "/mes",
    desc: "Para revendedoras serias que quieren escalar.",
    features: ["Catálogo completo ilimitado", "Analytics avanzados", "Dominio propio", "Soporte prioritario"],
    cta: "Quiero Pro", highlight: false,
  },
];

const compareRows = [
  { label: "Productos visibles", values: ["Ilimitados", "Hasta 50", "Ilimitados"] },
  { label: "Subdominio gratis (tutienda.krinstore)", values: [true, true, true] },
  { label: "Dominio propio (.com)", values: [false, false, true] },
  { label: "Personalización de colores y logo", values: [true, true, true] },
  { label: "Catálogo Krincesa sincronizado", values: [true, true, true] },
  { label: "Pedidos por WhatsApp", values: [true, true, true] },
  { label: "Analytics de visitas y ventas", values: ["Básico", "Básico", "Avanzado"] },
  { label: "Cupones y descuentos", values: [false, true, true] },
  { label: "Soporte", values: ["Comunidad", "Chat", "Prioritario 24h"] },
  { label: "Requiere compras mayoristas", values: [true, false, false] },
];

// Testimonios reales (fotos de mujeres emprendedoras)
const testimonials = [
  {
    name: "Andrea Vásquez", store: "Belle Perú", city: "Lima",
    text: "En 3 semanas ya había recuperado el plan Pro. Mis clientas me dicen que se ve súper profesional y confían más para comprar.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces",
    metric: "+38 pedidos/mes", rating: 5,
  },
  {
    name: "Karla Mendoza", store: "Rosé Cosmetics", city: "Arequipa",
    text: "Antes perdía horas mandando fotos por WhatsApp una por una. Ahora comparto un solo link y ellas eligen todo.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces",
    metric: "5h ahorradas/semana", rating: 5,
  },
  {
    name: "Diana Palacios", store: "Glow by Diana", city: "Trujillo",
    text: "Lo instalé en una noche. Al día siguiente mi hermana me hizo el primer pedido desde la tienda. Emocionante.",
    avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&h=200&fit=crop&crop=faces",
    metric: "1° venta en 24h", rating: 5,
  },
];

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const navigate = useNavigate();

  // Sticky CTA aparece después de 500px de scroll (mobile)
  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleCreateStore = () => navigate({ to: "/auth", search: { mode: "signup" } });

  return (
    <div className="min-h-dvh bg-background selection:bg-primary/20">
      {/* Skip to content */}
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-full focus:font-bold">
        Saltar al contenido
      </a>

      {/* Nav */}
      <nav aria-label="Principal" className="border-b border-border/40 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 sm:h-24 flex items-center justify-between gap-4">
          <Logo />
          <div className="hidden lg:flex items-center gap-8 mr-auto ml-12">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className={`text-sm font-bold text-ink/70 hover:text-primary transition-colors relative group rounded-md px-1 py-1 ${focusRing}`}>
                {l.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </a>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <Link to="/auth" className={`px-6 py-3 text-sm font-bold text-ink hover:text-primary transition-colors rounded-full ${focusRing}`}>
              Acceso
            </Link>
            <button onClick={handleCreateStore} className={`px-8 py-3.5 text-sm font-black bg-ink text-white rounded-full hover:bg-primary hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 cursor-pointer ${focusRing}`}>
              Crear Tienda
            </button>
          </div>

          {/* Mobile menu */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button aria-label="Abrir menú" className={`sm:hidden inline-flex items-center justify-center w-11 h-11 rounded-full border border-border bg-white text-ink ${focusRing}`}>
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] max-w-sm p-0 bg-white">
              <SheetHeader className="p-6 border-b border-border/50 text-left">
                <SheetTitle><Logo /></SheetTitle>
              </SheetHeader>
              <nav aria-label="Móvil" className="flex flex-col p-6 gap-1">
                {navLinks.map((l) => (
                  <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className={`px-4 py-4 rounded-2xl text-base font-semibold text-foreground hover:bg-secondary hover:text-primary transition-colors ${focusRing}`}>
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
        {/* HERO con mockup de celular real */}
        <section className="relative pt-10 sm:pt-16 lg:pt-24 pb-16 sm:pb-24 lg:pb-32 overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] -mr-96 -mt-96 pointer-events-none" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/40 rounded-full blur-[120px] -ml-40 -mb-40 pointer-events-none" aria-hidden="true" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center relative">
            <div className="text-left animate-in fade-in slide-in-from-left-8 duration-1000 ease-out">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 backdrop-blur-sm text-primary text-[10px] font-black tracking-widest uppercase mb-6 shadow-sm border border-primary/20">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" /> PLATAFORMA #1 PARA REVENDEDORAS EN PERÚ
              </div>
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter text-ink">
                Vende Belleza <br />
                <span className="text-primary italic relative">
                  Profesionalmente
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                </span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
                La única plataforma sincronizada al 100% con el catálogo de <span className="font-bold text-ink">Krincesa</span>. Crea tu tienda hoy y recibe pedidos directo a tu WhatsApp.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/auth" search={{ mode: "signup" }} className={`px-8 py-5 bg-primary text-primary-foreground rounded-full font-bold text-base sm:text-lg hover:shadow-[0_20px_40px_-10px_rgba(255,77,141,0.5)] hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 group ${focusRing}`}>
                  Empezar gratis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
                <a href="#demo" className={`px-8 py-5 bg-white border-2 border-border/80 text-foreground rounded-full font-bold text-base sm:text-lg hover:bg-muted/50 hover:border-primary/40 transition-all flex items-center justify-center gap-2 ${focusRing}`}>
                  <Play className="w-4 h-4 text-primary fill-primary" aria-hidden="true" /> Probar demo
                </a>
              </div>

              <div className="mt-10 flex items-center gap-6 border-t border-border/40 pt-8">
                <div className="flex -space-x-3" aria-hidden="true">
                  {testimonials.map((t, i) => (
                    <img key={i} src={t.avatar} alt="" className="w-11 h-11 rounded-full border-[3px] border-white object-cover shadow-sm" loading="lazy" />
                  ))}
                  <div className="w-11 h-11 rounded-full border-[3px] border-white bg-primary flex items-center justify-center text-[10px] font-black text-white shadow-sm">+1k</div>
                </div>
                <div>
                  <div className="flex gap-0.5 text-amber-400 mb-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    4.9/5 · +1,000 revendedoras
                  </p>
                </div>
              </div>
            </div>

            {/* Mockup celular real (visible también en mobile ahora) */}
            <div className="relative animate-in fade-in zoom-in slide-in-from-right-12 duration-1000 ease-out flex justify-center">
              <PhoneMockup />
              {/* Floaties */}
              <div className="hidden md:flex absolute -left-8 top-16 bg-white p-4 rounded-2xl shadow-2xl border border-border/50 items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-700 delay-500">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">NUEVO PEDIDO</div>
                  <div className="text-base font-black text-ink">S/ 142.50</div>
                </div>
              </div>
              <div className="hidden md:flex absolute -right-6 bottom-20 bg-white p-4 rounded-2xl shadow-2xl border border-border/50 items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700 delay-700">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">CARRITO</div>
                  <div className="text-sm font-bold text-ink">3 productos añadidos</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Brands */}
        <section className="py-12 sm:py-16 border-y border-border/50 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-8">CON EL RESPALDO OFICIAL DE</p>
            <div className="flex flex-wrap justify-center gap-8 sm:gap-16 md:gap-24 opacity-50">
              {["KRINCESA", "BEAUTYPRO", "COSMETICS", "GLAMOUR"].map((b) => (
                <span key={b} className="font-display text-xl sm:text-2xl font-black italic tracking-tighter hover:text-primary transition-colors">{b}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ANTES / DESPUÉS */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase mb-4">
                LA DIFERENCIA
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-ink leading-tight">
                De caos en WhatsApp <br /> a <span className="text-primary italic">marca profesional</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {/* ANTES */}
              <div className="rounded-[2rem] bg-muted/50 border-2 border-dashed border-border p-8 relative">
                <span className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-white border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground">ANTES</span>
                <h3 className="font-display text-xl font-black text-ink mb-6">Sin KrinStore 😩</h3>
                <ul className="space-y-4">
                  {[
                    "Mandas 50 fotos por WhatsApp una por una",
                    "Anotas pedidos en un cuaderno o en notas del cel",
                    "Actualizas precios manualmente cada semana",
                    "Tus clientas no saben qué stock tienes",
                    "Te ven como 'informal'",
                  ].map((t) => (
                    <li key={t} className="flex gap-3 items-start text-sm text-muted-foreground">
                      <XIcon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* DESPUÉS */}
              <div className="rounded-[2rem] bg-gradient-to-br from-primary/5 via-white to-secondary/30 border-2 border-primary/30 p-8 relative shadow-xl shadow-primary/5">
                <span className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest">DESPUÉS</span>
                <h3 className="font-display text-xl font-black text-ink mb-6">Con KrinStore ✨</h3>
                <ul className="space-y-4">
                  {[
                    "Compartes UN link y ellas ven todo el catálogo",
                    "Los pedidos llegan ordenados a tu WhatsApp",
                    "Precios y stock se actualizan solos",
                    "Tienes analytics de qué buscan tus clientas",
                    "Te ven como una marca de verdad",
                  ].map((t) => (
                    <li key={t} className="flex gap-3 items-start text-sm font-medium text-ink">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" aria-hidden="true" />
                      </div>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* DEMO INTERACTIVA — cambiá colores y ve el preview */}
        <section id="demo" className="py-20 sm:py-28 bg-gradient-to-b from-muted/20 to-white scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase mb-4">
                <Zap className="w-3.5 h-3.5" /> PRUEBA EN VIVO
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-ink leading-tight">
                Cambiá los colores. <br className="sm:hidden" /> Ve la magia.
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Elegí una paleta y mirá cómo se transforma tu tienda en tiempo real. Así de fácil es personalizarla dentro de la plataforma.
              </p>
            </div>
            <InteractiveDemo />
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="py-20 sm:py-28 lg:py-32">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-20">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-ink tracking-tight">Tu camino al éxito en 3 pasos</h2>
              <p className="mt-4 text-muted-foreground text-base sm:text-lg">Diseñamos todo para que solo te preocupes por crecer.</p>
            </div>
            <ol className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 sm:gap-12">
              {[
                { step: "01", title: "Creá tu cuenta", desc: "Elegí el nombre de tu tienda y personalizá los colores con tu marca personal.", icon: Store },
                { step: "02", title: "Catálogo automático", desc: "Sincronizamos todos los productos de Krincesa con un solo clic. Sin subir fotos manuales.", icon: Palette },
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

        {/* EJEMPLOS (bug del grid duplicado ARREGLADO) */}
        <section id="ejemplos" className="py-20 sm:py-28 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase mb-4">
                  INSPIRACIÓN
                </div>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-ink leading-tight">
                  Tiendas que <br className="hidden sm:block" /> <span className="text-primary">inspiran confianza.</span>
                </h2>
                <p className="mt-4 text-base sm:text-lg text-muted-foreground">
                  Mirá cómo otras revendedoras personalizaron su espacio.
                </p>
              </div>
              <Link to="/auth" search={{ mode: "signup" }} className={`group inline-flex items-center gap-3 font-black text-xs uppercase tracking-widest text-primary hover:text-rose-deep transition-colors rounded-md py-2 ${focusRing}`}>
                VER TODAS LAS PLANTILLAS <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                { name: "Luna Beauty", subdomain: "luna-beauty", author: "Marta R.", location: "Lima", img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop", tag: "PREMIUM", stats: { products: "120+", sales: "+2.4k", rating: "4.9" } },
                { name: "PINKRIS Store", subdomain: "pinkris", author: "Sofía G.", location: "Trujillo", img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop", tag: "EXCLUSIVA", stats: { products: "85+", sales: "+1.8k", rating: "5.0" } },
                { name: "Aela Family", subdomain: "aelafamily", author: "Elena M.", location: "Arequipa", img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop", tag: "MODERNA", stats: { products: "200+", sales: "+3.1k", rating: "4.8" } },
              ].map((ex, idx) => (
                <Link key={idx} to="/s/$subdomain" params={{ subdomain: ex.subdomain }} target="_blank" rel="noopener noreferrer" className={`group relative block rounded-[2.5rem] ${focusRing}`}>
                  <article className="relative rounded-[2.5rem] overflow-hidden bg-white border border-border/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_40px_100px_-20px_rgba(255,77,141,0.25)] group-hover:-translate-y-2 transition-all duration-500">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img src={ex.img} alt={`Tienda virtual ${ex.name}`} className="w-full h-full object-cover transition-transform duration-[1500ms] scale-105 group-hover:scale-110" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" aria-hidden="true" />
                      <div className="absolute top-6 left-6 right-6 flex items-start justify-between">
                        <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black tracking-widest rounded-full">{ex.tag}</span>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 text-ink text-[11px] font-black rounded-full shadow-xl">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {ex.stats.rating}
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
                        <h3 className="font-display text-2xl sm:text-3xl font-black mb-2 leading-none">{ex.name}</h3>
                        <p className="text-xs text-white/80 mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" /> por {ex.author} · {ex.location}
                        </p>
                        <div className="flex items-center gap-4 border-t border-white/20 pt-4">
                          <div className="flex-1">
                            <div className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-0.5">VENTAS</div>
                            <div className="text-base font-black">{ex.stats.sales}</div>
                          </div>
                          <div className="flex-1 border-l border-white/20 pl-4">
                            <div className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-0.5">CATÁLOGO</div>
                            <div className="text-base font-black">{ex.stats.products}</div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIOS REALES */}
        <section id="testimonios" className="py-20 sm:py-28 bg-gradient-to-b from-secondary/20 to-white scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase mb-4">
                HISTORIAS REALES
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-ink leading-tight">
                Lo dicen las que <span className="text-primary italic">ya venden con nosotros</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              {testimonials.map((t) => (
                <figure key={t.name} className="bg-white border border-border/60 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all">
                  <Quote className="w-8 h-8 text-primary/30 mb-4" aria-hidden="true" />
                  <div className="flex gap-0.5 text-amber-400 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <blockquote className="text-ink leading-relaxed font-medium mb-6">
                    "{t.text}"
                  </blockquote>
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest mb-6">
                    <TrendingUp className="w-3 h-3 inline mr-1" /> {t.metric}
                  </div>
                  <figcaption className="flex items-center gap-3 pt-6 border-t border-border/50">
                    <img src={t.avatar} alt="" className="w-12 h-12 rounded-full object-cover" loading="lazy" />
                    <div>
                      <div className="font-black text-ink text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.store} · {t.city}</div>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* CALCULADORA DE GANANCIAS */}
        <section className="py-20 sm:py-28 bg-ink text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 -skew-x-12 translate-x-1/2 pointer-events-none" aria-hidden="true" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
            <div className="text-center mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-primary text-[10px] font-black tracking-widest uppercase mb-4 border border-white/10">
                <Calculator className="w-3.5 h-3.5" /> CALCULA TUS GANANCIAS
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
                ¿Cuánto podés ganar <br /> <span className="text-primary italic">este mes?</span>
              </h2>
            </div>
            <EarningsCalculator />
          </div>
        </section>

        {/* PLANES */}
        <section id="planes" className="py-20 sm:py-28 bg-secondary/30 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-ink">Inversión para tu futuro</h2>
              <p className="mt-4 text-muted-foreground text-base sm:text-lg">Planes diseñados para cada etapa de tu negocio.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
              {plans.map((p) => (
                <div key={p.name} className={`relative p-8 sm:p-10 rounded-[2rem] border-2 transition-all flex flex-col ${p.highlight ? "bg-white border-primary shadow-[0_32px_64px_-16px_rgba(255,77,141,0.15)] lg:scale-105 lg:z-10" : "bg-white border-border/50 hover:border-primary/20"}`}>
                  {p.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">Más Popular</div>
                  )}
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">{p.name}</div>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="font-display text-4xl sm:text-5xl font-black text-ink">{p.price}</span>
                    <span className="text-muted-foreground font-medium">{p.period}</span>
                  </div>
                  <p className="text-muted-foreground mb-8 text-sm leading-relaxed">{p.desc}</p>
                  <ul className="space-y-3 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm font-medium">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" aria-hidden="true" />
                        </div>
                        <span className="text-foreground/80">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth" search={{ mode: "signup" }} className={`mt-8 block text-center px-6 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all ${p.highlight ? "bg-primary text-primary-foreground hover:shadow-xl hover:shadow-primary/30" : "bg-ink text-white hover:bg-primary"} ${focusRing}`}>
                    {p.cta}
                  </Link>
                </div>
              ))}
            </div>

            {/* TABLA COMPARATIVA */}
            <div className="bg-white rounded-[2rem] border border-border/60 overflow-hidden shadow-sm">
              <div className="px-6 sm:px-8 py-6 border-b border-border/60">
                <h3 className="font-display text-xl sm:text-2xl font-black text-ink">Compará plan por plan</h3>
                <p className="text-sm text-muted-foreground mt-1">Todo lo que incluye cada opción</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="bg-muted/40">
                      <th className="text-left font-black text-ink px-6 py-4 text-xs uppercase tracking-widest">Característica</th>
                      {plans.map((p) => (
                        <th key={p.name} className={`px-4 py-4 text-center text-xs font-black uppercase tracking-widest ${p.highlight ? "bg-primary/10 text-primary" : "text-ink"}`}>
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compareRows.map((row, i) => (
                      <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                        <td className="px-6 py-4 font-medium text-ink text-sm">{row.label}</td>
                        {row.values.map((v, j) => (
                          <td key={j} className={`px-4 py-4 text-center ${plans[j].highlight ? "bg-primary/5" : ""}`}>
                            {typeof v === "boolean" ? (
                              v ? <Check className="w-5 h-5 text-primary inline" /> : <XIcon className="w-4 h-4 text-muted-foreground/40 inline" />
                            ) : (
                              <span className="text-sm font-semibold text-ink">{v}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="preguntas" className="py-20 sm:py-28 bg-white scroll-mt-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-ink">Preguntas frecuentes</h2>
              <p className="mt-4 text-muted-foreground">Todo lo que necesitás saber para empezar.</p>
            </div>
            <Accordion type="single" collapsible className="w-full space-y-3 sm:space-y-4">
              {[
                { q: "¿Necesito tener conocimientos técnicos?", a: "Para nada. KrinStore está diseñada para ser extremadamente fácil. Si sabés usar WhatsApp o Facebook, sabés usar nuestra plataforma." },
                { q: "¿Cómo recibo los pagos?", a: "Los pedidos llegan directamente a tu WhatsApp con todos los datos de la clienta (Nombre, Dirección, Teléfono). Vos acordás el método de pago (transferencia, efectivo, Yape, etc.) directamente con tu clienta, sin intermediarios ni comisiones." },
                { q: "¿Los productos se actualizan solos?", a: "Sí. Cada vez que Krincesa agrega productos nuevos o cambia precios, tu tienda se actualiza automáticamente. No tenés que cargar nada manualmente." },
                { q: "¿Puedo usar mi propio dominio?", a: "¡Claro! En el plan Pro podés conectar tu propio dominio (ej: www.tutienda.com). En los demás planes tenés un subdominio profesional gratis." },
                { q: "¿Puedo cancelar cuando quiera?", a: "Sí. No hay contratos ni permanencia. Cancelás desde tu panel en un clic y no te cobramos más." },
                { q: "¿Cómo funciona el plan Free Mayorista?", a: "Si comprás al por mayor a Krincesa cada mes, activás con un código gratis por ese período. Sin límite de productos." },
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
              7 días gratis. Sin tarjeta. Cancelás cuando quieras.
            </p>
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link to="/auth" search={{ mode: "signup" }} className={`px-10 sm:px-12 py-5 bg-white text-primary rounded-full font-black text-base sm:text-lg hover:shadow-2xl hover:bg-secondary transition-all active:scale-95 ${focusRing}`}>
                CREAR MI TIENDA AHORA
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-white/80 text-xs font-bold uppercase tracking-widest relative z-10">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Sin tarjeta</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> Lista en 5 min</span>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky CTA mobile (aparece al hacer scroll) */}
      <div className={`sm:hidden fixed bottom-4 left-4 right-4 z-40 transition-all duration-500 ${showStickyCta ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"}`}>
        <Link to="/auth" search={{ mode: "signup" }} className="flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-full font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/40">
          Empezar gratis <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

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
              <h2 className="font-black text-xs uppercase tracking-[0.2em] mb-5">Plataforma</h2>
              <ul className="space-y-3 text-sm font-medium text-muted-foreground">
                <li><a href="#demo" className={`hover:text-primary transition-colors ${focusRing}`}>Demo</a></li>
                <li><a href="#planes" className={`hover:text-primary transition-colors ${focusRing}`}>Planes y precios</a></li>
                <li><a href="#preguntas" className={`hover:text-primary transition-colors ${focusRing}`}>Preguntas frecuentes</a></li>
              </ul>
            </div>
            <div>
              <h2 className="font-black text-xs uppercase tracking-[0.2em] mb-5">Legal</h2>
              <ul className="space-y-3 text-sm font-medium text-muted-foreground">
                <li><Link to="/auth" className={`hover:text-primary transition-colors ${focusRing}`}>Términos y condiciones</Link></li>
                <li><Link to="/auth" className={`hover:text-primary transition-colors ${focusRing}`}>Privacidad</Link></li>
                <li><Link to="/auth" className={`hover:text-primary transition-colors ${focusRing}`}>Soporte</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground text-center">
              © {new Date().getFullYear()} KrinStore. Desarrollado con 💖 para Krincesa.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ============= Componentes internos ============= */

function PhoneMockup({ primary = "#FF4D8D", name = "Blossom Beauty" }: { primary?: string; name?: string }) {
  return (
    <div className="relative w-[280px] sm:w-[320px] aspect-[9/19] rounded-[3rem] bg-ink p-3 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.35)] ring-1 ring-black/10">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-ink rounded-b-2xl z-10" aria-hidden="true" />
      <div className="w-full h-full rounded-[2.3rem] overflow-hidden bg-white relative">
        {/* Header tienda */}
        <div className="p-5 pt-8" style={{ backgroundColor: primary }}>
          <div className="flex items-center justify-between mb-6 pt-4">
            <div className="w-10 h-10 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center text-white font-black">
              {name[0]}
            </div>
            <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
          </div>
          <h4 className="font-display text-white text-2xl font-black leading-tight">{name}</h4>
          <p className="text-white/80 text-[10px] mt-1">Cosmética y cuidado personal</p>
        </div>
        {/* Grid productos */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {[
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&q=80",
            "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80",
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&q=80",
            "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&q=80",
          ].map((src, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-muted aspect-square relative">
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute bottom-1 left-1 right-1 bg-white/95 rounded-lg px-2 py-1 text-[8px] font-bold text-ink">
                S/ {(24 + i * 6).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        {/* WhatsApp CTA */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 rounded-full py-2.5 px-4 shadow-lg" style={{ backgroundColor: primary }}>
          <MessageCircle className="w-4 h-4 text-white" />
          <span className="text-white text-[11px] font-black uppercase tracking-widest">Pedir por WhatsApp</span>
        </div>
      </div>
    </div>
  );
}

function InteractiveDemo() {
  const palettes = [
    { name: "Rosé", color: "#FF4D8D" },
    { name: "Nude", color: "#C2956B" },
    { name: "Violeta", color: "#9B72CF" },
    { name: "Oliva", color: "#87A878" },
    { name: "Ink", color: "#1A1A1A" },
  ];
  const names = ["Blossom Beauty", "Rosé Store", "Glow Studio", "Belle Perú", "Luxe Cosmetics"];
  const [colorIdx, setColorIdx] = useState(0);
  const [nameIdx, setNameIdx] = useState(0);

  return (
    <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-center">
      {/* Controles */}
      <div className="order-2 lg:order-1 space-y-8 max-w-md mx-auto lg:mx-0 w-full">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block">1. Elegí un color</label>
          <div className="flex flex-wrap gap-3">
            {palettes.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setColorIdx(i)}
                aria-label={p.name}
                className={`group flex flex-col items-center gap-1.5 transition-all ${focusRing} rounded-2xl p-1`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl transition-all ${colorIdx === i ? "ring-4 ring-offset-2 ring-ink scale-110" : "hover:scale-105"}`}
                  style={{ backgroundColor: p.color }}
                />
                <span className={`text-[10px] font-black uppercase tracking-widest ${colorIdx === i ? "text-ink" : "text-muted-foreground"}`}>{p.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block">2. Nombre de la tienda</label>
          <div className="flex flex-wrap gap-2">
            {names.map((n, i) => (
              <button
                key={n}
                onClick={() => setNameIdx(i)}
                className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all ${focusRing} ${nameIdx === i ? "bg-ink text-white" : "bg-white border border-border text-ink hover:border-primary/40"}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-border/60 p-5">
          <p className="text-sm text-muted-foreground mb-4">
            ¿Te gusta cómo se ve? Dentro de la plataforma tenés <span className="font-bold text-ink">30+ paletas</span>, tipografías, secciones drag & drop y muchísimo más.
          </p>
          <Link to="/auth" search={{ mode: "signup" }} className={`inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-primary/30 transition-all ${focusRing}`}>
            Crear la mía <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      {/* Preview */}
      <div className="order-1 lg:order-2 flex justify-center transition-all duration-500" key={`${colorIdx}-${nameIdx}`}>
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <PhoneMockup primary={palettes[colorIdx].color} name={names[nameIdx]} />
        </div>
      </div>
    </div>
  );
}

function EarningsCalculator() {
  const [orders, setOrders] = useState(15);
  const [ticket, setTicket] = useState(80);
  const [margin, setMargin] = useState(35);

  const { monthly, yearly } = useMemo(() => {
    const revenue = orders * ticket;
    const profit = revenue * (margin / 100);
    return { monthly: profit, yearly: profit * 12 };
  }, [orders, ticket, margin]);

  const fmt = (n: number) => `S/ ${n.toLocaleString("es-PE", { maximumFractionDigits: 0 })}`;

  const inputs: Array<{ label: string; value: number; setter: (n: number) => void; min: number; max: number; step: number; suffix: string }> = [
    { label: "Ventas al mes", value: orders, setter: setOrders, min: 1, max: 100, step: 1, suffix: "pedidos" },
    { label: "Ticket promedio", value: ticket, setter: setTicket, min: 20, max: 300, step: 5, suffix: "S/" },
    { label: "Tu margen", value: margin, setter: setMargin, min: 10, max: 60, step: 5, suffix: "%" },
  ];

  return (
    <div className="grid md:grid-cols-[1fr_1.1fr] gap-8 items-center bg-white/5 border border-white/10 rounded-[2.5rem] p-8 sm:p-10 backdrop-blur-sm">
      <div className="space-y-6">
        {inputs.map((i) => (
          <div key={i.label}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/70">{i.label}</label>
              <span className="text-lg font-black text-white">
                {i.suffix === "S/" ? `S/ ${i.value}` : `${i.value} ${i.suffix}`}
              </span>
            </div>
            <input
              type="range"
              min={i.min}
              max={i.max}
              step={i.step}
              value={i.value}
              onChange={(e) => i.setter(Number(e.target.value))}
              className="w-full accent-primary h-2 cursor-pointer"
            />
          </div>
        ))}
      </div>
      <div className="text-center bg-primary/10 border border-primary/30 rounded-[2rem] p-8">
        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-3">Ganancia estimada</div>
        <div className="font-display text-5xl sm:text-6xl font-black text-white leading-none mb-1">{fmt(monthly)}</div>
        <div className="text-white/60 text-sm font-medium mb-6">al mes</div>
        <div className="pt-6 border-t border-white/10">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Proyección anual</div>
          <div className="font-display text-2xl font-black text-primary">{fmt(yearly)}</div>
        </div>
        <Link to="/auth" search={{ mode: "signup" }} className={`mt-6 inline-block w-full py-3.5 bg-white text-ink rounded-full font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all ${focusRing}`}>
          Empezar a ganar
        </Link>
      </div>
    </div>
  );
}
