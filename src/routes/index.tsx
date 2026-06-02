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
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Nav */}
      <nav className="border-b border-border/40 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8 mr-auto ml-12">
            <a href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Cómo funciona</a>
            <a href="#planes" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Planes</a>
            <a href="#preguntas" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Preguntas</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="px-4 py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors">
              Iniciar sesión
            </Link>
            <Link to="/auth" search={{ mode: "signup" }} className="px-6 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95">
              Crear mi tienda
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -mr-96 -mt-96 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/30 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary text-[10px] font-black tracking-widest uppercase mb-6 shadow-sm border border-primary/10">
              <Sparkles className="w-3 h-3" /> LA PLATAFORMA #1 PARA REVENDEDORAS
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tighter text-ink">
              Emprendé con <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-primary">confianza.</span>
                <span className="absolute bottom-2 left-0 w-full h-4 bg-primary/10 -rotate-1 z-0" />
              </span>
            </h1>
            <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Transformá tu negocio de belleza hoy. Una tienda profesional que se actualiza sola con el catálogo de Krincesa. Sin complicaciones técnicas.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/auth" search={{ mode: "signup" }} className="px-10 py-5 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group">
                Empezar gratis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#como-funciona" className="px-10 py-5 bg-white border-2 border-border/50 text-foreground rounded-full font-bold text-lg hover:bg-muted hover:border-primary/20 transition-all flex items-center justify-center">
                Ver demostración
              </a>
            </div>
            
            <div className="mt-12 flex items-center gap-6 grayscale opacity-60">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-muted" />
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-secondary flex items-center justify-center text-[10px] font-bold text-primary">+500</div>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Más de 500 emprendedoras <br />ya confían en nosotros</p>
            </div>
          </div>

          <div className="relative animate-in fade-in zoom-in duration-1000 delay-200">
            <div className="absolute -inset-10 bg-primary/10 rounded-full blur-[80px] opacity-50" />
            <div className="relative rounded-[2.5rem] border-4 border-white bg-white p-2 shadow-[0_32px_64px_-16px_rgba(255,77,141,0.2)]">
              <div className="rounded-[1.8rem] overflow-hidden bg-muted relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5]">
                {/* Mockup content */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFF0F5] to-white" />
                <div className="relative h-full flex flex-col">
                  <div className="p-6 flex justify-between items-center">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold">K</div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px]">🛒</div>
                      <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px]">👤</div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center px-10 text-center">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl bg-white mb-6 flex items-center justify-center text-5xl">✨</div>
                    <h3 className="font-display text-4xl font-bold text-ink">Beauty Shop</h3>
                    <p className="text-muted-foreground mt-2 italic">Colección Exclusiva 2024</p>
                    <div className="mt-8 flex gap-3">
                      <div className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-full">Ver Productos</div>
                      <div className="px-6 py-2 bg-white border border-border text-sm font-bold rounded-full">Contacto</div>
                    </div>
                  </div>
                  <div className="p-6 mt-auto">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-32 bg-white/50 rounded-2xl border border-white" />
                      <div className="h-32 bg-white/50 rounded-2xl border border-white" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -right-8 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-border animate-bounce duration-[3s]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">✓</div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nueva Venta</div>
                    <div className="text-sm font-bold text-ink">$24.990</div>
                  </div>
                </div>
              </div>
              <div className="absolute -left-12 bottom-1/4 bg-white p-4 rounded-2xl shadow-xl border border-border animate-pulse duration-[4s]">
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

      {/* Trust Badges */}
      <section className="py-12 border-y border-border/50 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale">
          <div className="flex items-center gap-2 font-display text-xl font-black italic">KRINCESA</div>
          <div className="flex items-center gap-2 font-display text-xl font-black italic">BEAUTYPRO</div>
          <div className="flex items-center gap-2 font-display text-xl font-black italic">COSMETICS</div>
          <div className="flex items-center gap-2 font-display text-xl font-black italic">GLAMOUR</div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-32 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-ink tracking-tight">Tu camino al éxito en 3 pasos</h2>
            <p className="mt-4 text-muted-foreground text-lg">Diseñamos todo para que solo te preocupes por crecer.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                step: "01", 
                title: "Creá tu cuenta", 
                desc: "Elegí el nombre de tu tienda y personalizá los colores con tu marca personal.",
                icon: Store 
              },
              { 
                step: "02", 
                title: "Catálogo Automático", 
                desc: "Sincronizamos todos los productos de Krincesa con un solo clic. Sin subir fotos manuales.",
                icon: Palette 
              },
              { 
                step: "03", 
                title: "Vendé por WhatsApp", 
                desc: "Tus clientas arman el carrito y te envían el pedido directo a tu celular para cerrar la venta.",
                icon: HeartHandshake 
              },
            ].map((s, idx) => (
              <div key={s.title} className="relative group">
                <div className="absolute -top-6 -left-6 text-8xl font-black text-primary/5 select-none">{s.step}</div>
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <s.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-3">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-32 bg-ink text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 -skew-x-12 translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-8">
                Construido para la <span className="text-primary">emprendedora moderna.</span>
              </h2>
              <div className="space-y-8">
                {[
                  { icon: Award, title: "Respaldo Oficial", desc: "Plataforma oficial para revendedoras Krincesa." },
                  { icon: BarChart3, title: "Control Total", desc: "Estadísticas de visitas y pedidos para que sepas qué productos gustan más." },
                  { icon: Lightbulb, title: "Sin Experiencia", desc: "No necesitás saber de diseño ni programación. Es tan fácil como usar Instagram." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-6">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl mb-1">{item.title}</h4>
                      <p className="text-white/60">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-primary/20 to-transparent border border-white/10 flex items-center justify-center overflow-hidden">
                {/* Visual elements */}
                <div className="grid grid-cols-2 gap-4 p-8 w-full">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/10 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="planes" className="py-32 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-6xl font-black text-ink">Inversión para tu futuro</h2>
            <p className="mt-4 text-muted-foreground text-lg">Planes diseñados para cada etapa de tu negocio.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((p) => (
              <div key={p.name} className={`relative p-10 rounded-[2.5rem] border-2 transition-all flex flex-col ${p.highlight ? "bg-white border-primary shadow-[0_32px_64px_-16px_rgba(255,77,141,0.15)] scale-105 z-10" : "bg-white border-border/50 hover:border-primary/20"}`}>
                {p.highlight && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">Más Popular</div>
                )}
                <div className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">{p.name}</div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display text-5xl font-black text-ink">{p.price}</span>
                  <span className="text-muted-foreground font-medium">{p.period}</span>
                </div>
                <p className="text-muted-foreground mb-8 text-sm leading-relaxed">{p.desc}</p>
                <div className="space-y-4 flex-1">
                  {p.features.map((f) => (
                    <div key={f} className="flex items-start gap-3 text-sm font-medium">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-foreground/80">{f}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className={`mt-10 block text-center px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all ${p.highlight ? "bg-primary text-primary-foreground hover:shadow-xl hover:shadow-primary/30" : "bg-ink text-white hover:bg-primary"}`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="preguntas" className="py-32 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-ink">Preguntas frecuentes</h2>
            <p className="mt-4 text-muted-foreground">Todo lo que necesitás saber para empezar.</p>
          </div>
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            {[
              { q: "¿Necesito tener conocimientos técnicos?", a: "Para nada. KrinStore está diseñada para ser extremadamente fácil. Si sabés usar WhatsApp o Facebook, sabés usar nuestra plataforma." },
              { q: "¿Cómo recibo los pagos?", a: "Los pedidos llegan directamente a tu WhatsApp. Vos acordás el método de pago (transferencia, efectivo, etc.) directamente con tu clienta, sin intermediarios ni comisiones." },
              { q: "¿Los productos se actualizan solos?", a: "Sí. Cada vez que Krincesa agrega productos nuevos o cambia precios, tu tienda se actualiza automáticamente. No tenés que cargar nada manualmente." },
              { q: "¿Puedo usar mi propio dominio?", a: "¡Claro! En el plan Pro podés conectar tu propio dominio (ej: www.tutienda.com). En los demás planes tenés un subdominio profesional gratis." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-2 border-border/50 rounded-2xl px-6 data-[state=open]:border-primary/30 data-[state=open]:bg-secondary/10 transition-all">
                <AccordionTrigger className="font-bold text-lg hover:no-underline">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-primary to-rose-400 p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent)]" />
          <h2 className="font-display text-4xl md:text-6xl font-black text-white relative z-10 leading-tight">
            Empezá tu tienda <br className="hidden md:block" /> gratis hoy mismo
          </h2>
          <p className="mt-6 text-white/90 text-lg md:text-xl max-w-2xl mx-auto relative z-10 font-medium">
            No pierdas más tiempo cargando fotos manualmente. Unite a la comunidad de revendedoras con más éxito.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6 relative z-10">
            <Link to="/auth" search={{ mode: "signup" }} className="px-12 py-5 bg-white text-primary rounded-full font-black text-lg hover:shadow-2xl hover:bg-secondary transition-all active:scale-95">
              CREAR MI TIENDA AHORA
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <Logo />
              <p className="mt-6 text-muted-foreground max-w-xs leading-relaxed">
                La solución definitiva para revendedoras de Krincesa que buscan profesionalizar su negocio digital.
              </p>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6">Plataforma</h4>
              <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                <li><a href="#como-funciona" className="hover:text-primary transition-colors">Cómo funciona</a></li>
                <li><a href="#planes" className="hover:text-primary transition-colors">Planes y precios</a></li>
                <li><a href="#preguntas" className="hover:text-primary transition-colors">Preguntas frecuentes</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6">Legal</h4>
              <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                <li><Link to="/auth" className="hover:text-primary transition-colors">Términos y condiciones</Link></li>
                <li><Link to="/auth" className="hover:text-primary transition-colors">Privacidad</Link></li>
                <li><Link to="/auth" className="hover:text-primary transition-colors">Soporte</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm font-medium text-muted-foreground text-center">
              © {new Date().getFullYear()} KrinStore. Desarrollado con 💖 para Krincesa.
            </p>
            <div className="flex gap-6 grayscale opacity-50">
              <div className="w-6 h-6 bg-muted-foreground rounded" />
              <div className="w-6 h-6 bg-muted-foreground rounded" />
              <div className="w-6 h-6 bg-muted-foreground rounded" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
