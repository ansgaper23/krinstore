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
      <nav aria-label="Principal" className="border-b border-border/40 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 sm:h-24 flex items-center justify-between gap-4">
          <Logo />
          <div className="hidden lg:flex items-center gap-10 mr-auto ml-16">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className={`text-sm font-bold text-ink/70 hover:text-primary transition-all relative group rounded-md px-1 py-1 ${focusRing}`}>
                {l.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </a>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <Link to="/auth" className={`px-6 py-3 text-sm font-bold text-ink hover:text-primary transition-colors rounded-full ${focusRing}`}>
              Acceso
            </Link>
            <Link to="/auth" search={{ mode: "signup" }} className={`px-8 py-3.5 text-sm font-black bg-ink text-white rounded-full hover:bg-primary hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 ${focusRing}`}>
              Crear Tienda
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
      <section className="relative pt-12 sm:pt-20 lg:pt-32 pb-20 sm:pb-32 lg:pb-40 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] -mr-96 -mt-96 pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/40 rounded-full blur-[120px] -ml-40 -mb-40 pointer-events-none" aria-hidden="true" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 lg:gap-24 items-center relative">
          <div className="text-left animate-in fade-in slide-in-from-left-8 duration-1000 ease-out">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 backdrop-blur-sm text-primary text-[10px] font-black tracking-widest uppercase mb-6 shadow-sm border border-primary/20">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" /> LA PLATAFORMA #1 PARA REVENDEDORAS EN PERÚ
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.9] tracking-tighter text-ink">
              Vende Belleza <br />
              <span className="text-primary italic relative">
                Profesionalmente
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
              </span>
            </h1>
            <p className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
              La única plataforma sincronizada al 100% con el catálogo de <span className="font-bold text-ink">Krincesa</span>. Crea tu tienda hoy y recibe pedidos directo a tu WhatsApp.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/auth" search={{ mode: "signup" }} className={`px-10 py-5 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:shadow-[0_20px_40px_-10px_rgba(255,77,141,0.5)] hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 group ${focusRing}`}>
                Empezar gratis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
              <a href="#ejemplos" className={`px-10 py-5 bg-white border-2 border-border/80 text-foreground rounded-full font-bold text-lg hover:bg-muted/50 hover:border-primary/40 transition-all flex items-center justify-center ${focusRing}`}>
                Ver tiendas reales
              </a>
            </div>

            <div className="mt-12 flex items-center gap-8 border-t border-border/40 pt-10">
              <div className="flex -space-x-4" aria-hidden="true">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-muted overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-white bg-primary flex items-center justify-center text-[10px] font-black text-white shadow-sm">+1k</div>
              </div>
              <div>
                <div className="flex gap-0.5 text-amber-400 mb-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  +1,000 EMPRENDEDORAS ACTIVAS
                </p>
              </div>
            </div>
          </div>

          <div className="relative animate-in fade-in zoom-in slide-in-from-right-12 duration-1000 ease-out hidden md:block">
            {/* Main store preview card */}
            <div className="relative rounded-[3rem] border-8 border-white bg-white p-2 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden">
               <div className="rounded-[2.5rem] overflow-hidden bg-muted relative aspect-[4/5]">
                <img 
                  src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop" 
                  alt="Store Preview" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                
                <div className="relative h-full flex flex-col p-8">
                  <div className="flex justify-between items-center mb-auto">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-black text-xl shadow-xl">B</div>
                    <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black uppercase tracking-widest">EN VIVO</div>
                  </div>
                  
                  <div className="text-white">
                    <h3 className="font-display text-5xl font-black mb-2 leading-none">Blossom Beauty</h3>
                    <p className="text-white/80 text-lg mb-6 italic">Tu aliada en belleza y cuidado personal</p>
                    <div className="flex gap-3">
                      <div className="px-6 py-3 bg-white text-ink text-sm font-black rounded-full shadow-xl">Ver Catálogo</div>
                      <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floaties */}
              <div className="absolute -right-12 top-1/4 bg-white p-5 rounded-3xl shadow-2xl border border-border/50 animate-bounce duration-[3s]" aria-hidden="true">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">NUEVO PEDIDO</div>
                    <div className="text-xl font-black text-ink">S/ 142.50</div>
                  </div>
                </div>
              </div>

              <div className="absolute -left-16 bottom-1/4 bg-white p-5 rounded-3xl shadow-2xl border border-border/50 animate-pulse duration-[4s]" aria-hidden="true">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Palette className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">PERSONALIZACIÓN</div>
                    <div className="text-sm font-bold text-ink">Colores de marca aplicados</div>
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
              {
                name: "Luna Beauty", subdomain: "luna-beauty", author: "Marta R.", location: "Buenos Aires",
                img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop",
                tag: "MINIMAL", accent: "from-rose-200 via-rose-100 to-amber-50",
                stats: { products: "120+", sales: "+2.4k", rating: "4.9" },
                quote: "Vendo 3x más desde que abrí mi tienda."
              },
              {
                name: "PINKRIS", subdomain: "pinkris", author: "Sofía G.", location: "Córdoba",
                img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop",
                tag: "VIBRANTE", accent: "from-fuchsia-200 via-pink-100 to-rose-50",
                stats: { products: "85+", sales: "+1.8k", rating: "5.0" },
                quote: "En 2 meses ya tenía clientas fijas."
              },
              {
                name: "Aela Family", subdomain: "aelafamily", author: "Elena M.", location: "Rosario",
                img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop",
                tag: "ELEGANTE", accent: "from-amber-200 via-orange-100 to-rose-50",
                stats: { products: "200+", sales: "+3.1k", rating: "4.8" },
                quote: "La diseñé en una tarde. Quedó increíble."
              },
            ].map((ex, idx) => (
              <Link
                key={idx}
                to="/s/$subdomain"
                params={{ subdomain: ex.subdomain }}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visitar tienda ${ex.name}`}
                className={`group relative block rounded-3xl ${focusRing}`}
              >
                {/* Glow */}
                <div className={`absolute -inset-0.5 rounded-3xl bg-gradient-to-br ${ex.accent} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`} aria-hidden="true" />

                <article className="relative rounded-3xl overflow-hidden bg-white border border-border/60 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] group-hover:shadow-[0_30px_80px_-20px_rgba(244,63,94,0.35)] group-hover:-translate-y-2 transition-all duration-500">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-b from-muted/40 to-muted/10 border-b border-border/50">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
                    </div>
                    <div className="flex-1 mx-2 flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/80 border border-border/40 text-[10px] text-muted-foreground font-mono truncate">
                      <Globe className="w-2.5 h-2.5 text-primary shrink-0" aria-hidden="true" />
                      krinstore.com/<span className="text-ink font-semibold">{ex.subdomain}</span>
                    </div>
                  </div>

                  {/* Preview image */}
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img src={ex.img} alt={`Tienda virtual ${ex.name}`} className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" aria-hidden="true" />

                    {/* Top badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                      <span className="px-2.5 py-1 bg-white/15 backdrop-blur-md border border-white/25 text-white text-[9px] font-black tracking-[0.2em] rounded-full">
                        {ex.tag}
                      </span>
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-white/95 text-ink text-[10px] font-black rounded-full shadow-lg">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                        {ex.stats.rating}
                      </span>
                    </div>

                    {/* Hover CTA */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-black tracking-widest rounded-full shadow-2xl translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        VISITAR TIENDA <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                    </div>

                    {/* Bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
                      <div className="flex items-end justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <h3 className="font-display text-2xl sm:text-3xl font-black leading-none mb-1.5 truncate">{ex.name}</h3>
                          <p className="text-[11px] text-white/80 truncate">por <span className="font-semibold">{ex.author}</span> · {ex.location}</p>
                        </div>
                      </div>
                      <p className="text-[11px] sm:text-xs italic text-white/90 border-l-2 border-primary pl-2.5 leading-snug">
                        "{ex.quote}"
                      </p>
                    </div>
                  </div>

                  {/* Stats bar */}
                  <div className="grid grid-cols-3 divide-x divide-border/50 bg-white">
                    <div className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-primary mb-0.5">
                        <ShoppingBag className="w-3 h-3" aria-hidden="true" />
                        <span className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">Productos</span>
                      </div>
                      <div className="font-display text-base font-black text-ink">{ex.stats.products}</div>
                    </div>
                    <div className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-primary mb-0.5">
                        <TrendingUp className="w-3 h-3" aria-hidden="true" />
                        <span className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">Ventas</span>
                      </div>
                      <div className="font-display text-base font-black text-ink">{ex.stats.sales}</div>
                    </div>
                    <div className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-primary mb-0.5">
                        <Heart className="w-3 h-3" aria-hidden="true" />
                        <span className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">Activa</span>
                      </div>
                      <div className="font-display text-base font-black text-ink">24/7</div>
                    </div>
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
      <section className="py-24 sm:py-32 lg:py-40 bg-ink text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 -skew-x-12 translate-x-1/2" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-primary text-[10px] font-black tracking-widest uppercase mb-8 border border-white/10">
                VENTAJA COMPETITIVA
              </div>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black leading-[0.95] mb-10 tracking-tighter">
                Diseñado para la <br />
                <span className="text-primary italic">emprendedora de élite.</span>
              </h2>
              <div className="grid gap-10">
                {[
                  { icon: Award, title: "Respaldo Oficial Krincesa", desc: "Somos la única plataforma recomendada oficialmente para digitalizar tu negocio de cosmética." },
                  { icon: BarChart3, title: "Inteligencia de Negocio", desc: "No solo vendes, aprendes. Analytics detallados de qué productos buscan tus clientas." },
                  { icon: Lightbulb, title: "Cero Curva de Aprendizaje", desc: "Si puedes enviar un mensaje de WhatsApp, puedes gestionar tu tienda. Así de simple." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-300">
                      <item.icon className="w-7 h-7 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-white/50 text-base leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative animate-in fade-in zoom-in duration-1000 delay-300">
              <div className="aspect-[4/5] rounded-[3rem] bg-gradient-to-br from-primary/30 via-white/5 to-transparent border border-white/10 p-1 flex items-center justify-center overflow-hidden relative shadow-2xl shadow-primary/20">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-8 shadow-2xl">
                    <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                  </div>
                  <h4 className="font-display text-3xl font-black mb-4">¿Lista para escalar?</h4>
                  <p className="text-white/70 mb-10 leading-relaxed max-w-sm">Únete a las cientos de revendedoras que ya duplicaron sus ventas en el primer mes.</p>
                  <Link to="/auth" search={{ mode: "signup" }} className="w-full py-5 bg-white text-ink rounded-full font-black text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl">
                    EMPEZAR MI TRANSFORMACIÓN
                  </Link>
                </div>
              </div>
              
              {/* Decorative badges */}
              <div className="absolute -top-6 -right-6 bg-primary px-6 py-4 rounded-2xl shadow-2xl rotate-6 border-4 border-white">
                <div className="text-xs font-black uppercase tracking-widest text-white/80">RESULTADO PROMEDIO</div>
                <div className="text-3xl font-black text-white">+240%</div>
                <div className="text-[10px] font-bold text-white/60 uppercase">EN VENTAS DIGITALES</div>
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
