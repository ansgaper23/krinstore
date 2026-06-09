import { useMemo, useState } from "react";
import { Truck, ShieldCheck, Clock, Sparkles, Heart, Tag, Search, ShoppingBag, Menu, X, Plus, Minus, Trash2, User, Mail, Phone, MapPin, CreditCard, ChevronLeft, Check, ChevronRight, MessageCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Section } from "@/lib/store-sections";

const ICONS: Record<string, any> = { truck: Truck, shield: ShieldCheck, clock: Clock, sparkles: Sparkles, heart: Heart, tag: Tag };

type CartItem = { id: string; name: string; price: number; image_url?: string; qty: number };

export function StoreRenderer({
  store,
  sections,
  products,
  onCheckout,
  compact = false,
}: {
  store: any;
  sections: Section[];
  products: any[];
  onCheckout?: (items: CartItem[], total: number) => void;
  compact?: boolean;
}) {
  const radius = store.button_style === "sharp" ? "0px" : store.button_style === "pill" ? "999px" : "1.25rem";
  const fontStack = `'${store.font_family}', serif`;
  const primary = store.primary_color;
  const secondary = store.secondary_color || "#FFF0F5";

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "info" | "shipping" | "payment" | "success">( "cart" );
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))).slice(0, 8),
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchQ = !q || p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
      const matchC = !activeCategory || p.category === activeCategory;
      return matchQ && matchC;
    });
  }, [products, search, activeCategory]);

  const addToCart = (p: any) => {
    const price = Number(p.custom_price ?? p.price ?? 0);
    if (isNaN(price)) {
      console.error("Invalid product price:", p);
      return;
    }
    setCart((prev) => {
      const found = prev.find((i) => i.id === String(p.id));
      if (found) return prev.map((i) => (i.id === String(p.id) ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: String(p.id), name: p.name, price, image_url: p.image_url, qty: 1 }];
    });
    setCartOpen(true);
    // Analytics: track click/interaction
    supabase.from("store_analytics").insert({ store_id: store.id, event_type: "click", product_id: String(p.id) });
  };

  const updateQty = (id: string, delta: number) =>
    setCart((prev) =>
      prev.flatMap((i) => (i.id === id ? (i.qty + delta <= 0 ? [] : [{ ...i, qty: i.qty + delta }]) : [i]))
    );
  const removeItem = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // Default the selected method if not mixed
    if (store.checkout_method !== "mixed") {
      setSelectedPaymentMethod(store.checkout_method || "whatsapp");
    }

    // Always go through the in-app checkout flow (info → shipping → payment)
    setCheckoutStep("info");
  };

  const completeCheckout = async () => {
    if (store.checkout_method === "mixed" && !selectedPaymentMethod) {
      alert("Por favor selecciona un método de pago");
      return;
    }

    setIsSubmitting(true);
    try {
      // Pass the selected method override if present
      const finalCustomerData = { 
        ...customerData, 
        payment_method: selectedPaymentMethod || store.checkout_method 
      };
      
      const result = await (onCheckout as any)?.(cart, cartTotal, finalCustomerData);
      if (result === true || result?.success) {
        setOrderId(result?.orderId || Math.random().toString(36).substr(2, 9));
        setCheckoutStep("success");
        setCart([]);
      } else {
        alert(result?.error || "Error al procesar el pedido");
      }
    } catch (e) {
      console.error(e);
      alert("Error al procesar el pedido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToProducts = () => {
    document.getElementById("__products")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  return (
    <div style={{ fontFamily: fontStack, color: "#1A1A2E", background: "#fff" }} className="relative selection:bg-rose-100">
      {sections.filter((s) => s.visible).map((s) => {
        switch (s.type) {
          case "logo":
            return (
              <header key={s.id} className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
                <button onClick={scrollToProducts} className="flex items-center gap-3 group">
                  {store.logo_url ? (
                    <img src={store.logo_url} alt="" className="w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-display font-bold text-white text-xl group-hover:rotate-6 transition-transform" style={{ background: primary }}>
                      {store.store_name?.charAt(0)}
                    </div>
                  )}
                  <span className="font-display font-bold text-lg tracking-tight truncate max-w-[180px] group-hover:text-primary transition-colors">{store.store_name}</span>
                </button>
                <div className="flex items-center gap-3 text-ink">
                  <button onClick={() => setSearchOpen((v) => !v)} className="p-2.5 hover:bg-secondary rounded-2xl transition-all active:scale-90" aria-label="Buscar"><Search className="w-5 h-5" /></button>
                  <button onClick={() => setCartOpen(true)} aria-label="Carrito" className="relative p-2.5 hover:bg-secondary rounded-2xl transition-all active:scale-90">
                    <ShoppingBag className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span style={{ background: primary }} className="absolute -top-1 -right-1 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                        {cartCount}
                      </span>
                    )}
                  </button>
                  <button onClick={() => setMenuOpen(true)} className="p-2.5 hover:bg-secondary rounded-2xl transition-all active:scale-90" aria-label="Menú"><Menu className="w-5 h-5" /></button>
                </div>
              </header>
            );
          case "hero":
            return (
              <section 
                key={s.id} 
                className={`px-6 py-20 text-center flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden ${s.data.image_url ? "text-white" : "text-ink"}`}
                style={{ 
                  background: s.data.image_url 
                    ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${s.data.image_url}) center/cover fixed` 
                    : secondary 
                }}
              >
                {!s.data.image_url && (
                   <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(circle at 20% 30%, ${primary}15, transparent), radial-gradient(circle at 80% 70%, ${primary}10, transparent)` }} />
                )}
                <div className="relative z-10 animate-in fade-in zoom-in slide-in-from-bottom-12 duration-1000">
                  <h1 className={`${compact ? "text-5xl" : "text-6xl md:text-8xl"} font-display font-black leading-[0.9] max-w-4xl tracking-tighter mb-8`}>
                    {s.data.title || store.store_name}
                  </h1>
                  {s.data.subtitle && (
                    <p className="text-lg md:text-2xl opacity-90 max-w-2xl mx-auto font-medium leading-relaxed mb-10 italic">
                      {s.data.subtitle}
                    </p>
                  )}
                  {s.data.cta && (
                    <button 
                      onClick={scrollToProducts} 
                      style={{ background: primary, borderRadius: radius, color: "#fff" }} 
                      className="px-12 py-5 text-sm font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 active:scale-95"
                    >
                      {s.data.cta}
                    </button>
                  )}
                </div>
              </section>
            );
          case "benefits":
            return (
              <section key={s.id} className="px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-8 relative overflow-hidden" style={{ background: secondary }}>
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[4px]" />
                {(s.data.items ?? []).map((it: any, i: number) => {
                  const Ico = ICONS[it.icon] ?? Sparkles;
                  return (
                    <div key={i} className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/50 relative z-10 hover:-translate-y-2 transition-all duration-500 group">
                      <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-500" style={{ background: `${primary}10`, color: primary }}>
                        <Ico className="w-8 h-8" />
                      </div>
                      <div className="font-display font-bold text-xl mb-3 tracking-tight">{it.title}</div>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">{it.text}</p>
                    </div>
                  );
                })}
              </section>
            );
          case "categories":
            if (categories.length === 0) return null;
            return (
              <section key={s.id} className="px-6 py-12 bg-white">
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                      <h2 className="font-display text-3xl md:text-4xl font-black tracking-tighter">{s.data.title || "Categorías destacadas"}</h2>
                      <div className="h-1 w-12 bg-primary mt-3 rounded-full" />
                    </div>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
                    <button
                      onClick={() => { setActiveCategory(null); scrollToProducts(); }}
                      className={`px-8 py-4 rounded-full flex items-center justify-center text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${!activeCategory ? "text-white shadow-xl" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                      style={!activeCategory ? { background: primary, boxShadow: `0 10px 25px ${primary}30` } : {}}
                    >
                      Ver Todo
                    </button>
                    {categories.map((c: string) => (
                      <button
                        key={c}
                        onClick={() => { setActiveCategory(c); scrollToProducts(); }}
                        className={`px-8 py-4 rounded-full flex items-center justify-center text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${activeCategory === c ? "text-white shadow-xl" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                        style={activeCategory === c ? { background: primary, boxShadow: `0 10px 25px ${primary}30` } : {}}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            );
          case "promo":
            return (
              <section key={s.id} className="relative px-6 py-10 text-center text-white" style={{ background: s.data.image_url ? `url(${s.data.image_url}) center/cover` : "#3a2540" }}>
                <h2 className={compact ? "text-xl" : "text-2xl md:text-3xl"}>{s.data.title}</h2>
                {s.data.cta && (
                  <button onClick={scrollToProducts} className="mt-3 px-5 py-2 text-sm border border-white" style={{ borderRadius: radius }}>
                    {s.data.cta}
                  </button>
                )}
              </section>
            );
          case "products":
            return (
              <section key={s.id} id="__products" className="px-6 py-20 bg-[#FCFBFC]">
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
                    <div>
                      <h2 className="font-display text-4xl md:text-6xl font-black tracking-tighter text-ink">{s.data.title || "Nuestros Productos"}</h2>
                      <p className="text-muted-foreground mt-4 font-medium italic text-lg">{activeCategory || "Calidad y estilo en cada detalle"}</p>
                    </div>
                    {activeCategory && (
                      <button 
                        onClick={() => setActiveCategory(null)} 
                        className="px-6 py-3 bg-white border border-border rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-muted transition-all flex items-center gap-2"
                      >
                        <X className="w-4 h-4" /> Limpiar filtro
                      </button>
                    )}
                  </div>

                  {filtered.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-[3rem] border border-border shadow-sm">
                      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                        <ShoppingBag className="w-10 h-10" />
                      </div>
                      <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
                        {products.length === 0 ? "No hay productos publicados aún." : "No se encontraron productos."}
                      </p>
                    </div>
                  ) : (
                    <div className={`grid ${compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"} gap-x-6 gap-y-12`}>
                      {filtered.map((p) => {
                        const price = p.custom_price ?? p.price;
                        return (
                          <div key={p.id} className="group flex flex-col">
                            <div className="aspect-[3/4] bg-white relative overflow-hidden rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-700">
                              {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />}
                              {p.image_url_2 && <img src={p.image_url_2} alt="" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" />}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              <button
                                onClick={() => addToCart(p)}
                                style={{ background: "#fff", borderRadius: "1.25rem", color: primary }}
                                className="absolute bottom-6 left-6 right-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-2xl hover:bg-secondary active:scale-95"
                              >
                                Agregar al carrito
                              </button>
                              
                              {p.original_price && Number(p.original_price) > Number(price) && (
                                <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                  OFF
                                </div>
                              )}
                            </div>
                            <div className="mt-6 px-2">
                              <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-2 opacity-60">{p.category || "General"}</div>
                              <div className="text-lg font-display font-bold text-ink line-clamp-2 min-h-[2.4em] leading-tight group-hover:text-primary transition-colors duration-300">{p.name}</div>
                              <div className="mt-4 flex items-center gap-3">
                                <div className="text-xl font-black tracking-tighter" style={{ color: primary }}>S/ {Number(price).toLocaleString()}</div>
                                {p.original_price && Number(p.original_price) > Number(price) && (
                                  <div className="text-xs text-gray-300 line-through font-medium">S/ {Number(p.original_price).toLocaleString()}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            );
          case "footer":
            return (
              <footer key={s.id} className="px-6 py-20 bg-white border-t border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <div className="max-w-7xl mx-auto flex flex-col items-center">
                  <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-display font-black text-white text-2xl mb-8 shadow-xl rotate-3" style={{ background: primary }}>
                    {store.store_name?.charAt(0)}
                  </div>
                  <h3 className="font-display text-2xl font-bold text-ink mb-4">{store.store_name}</h3>
                  <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed mb-10 italic">
                    {s.data.text || `Gracias por elegirnos. Belleza y confianza en cada pedido.`}
                  </p>
                  <div className="flex gap-6 mb-12">
                     {(store.custom_links ?? []).slice(0, 3).map((l: any, i: number) => (
                       <a key={i} href={l.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                         {/whats|wa/i.test(l.label) ? <MessageCircle className="w-5 h-5" /> : /inst/i.test(l.label) ? <span className="text-xs font-black">IG</span> : <span className="text-xs font-black uppercase tracking-widest">{l.label}</span>}
                       </a>
                     ))}
                  </div>
                  <div className="text-[10px] text-gray-300 font-black uppercase tracking-[0.3em]">
                    © {new Date().getFullYear()} {store.store_name} • TODOS LOS DERECHOS RESERVADOS
                  </div>
                </div>
              </footer>
            );
          default:
            return null;
        }
      })}

      {/* Search bar overlay */}
      {searchOpen && (
        <div className="fixed inset-x-0 top-0 z-30 bg-white border-b border-gray-200 p-3 flex items-center gap-2 shadow-md">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="flex-1 outline-none text-sm bg-transparent"
          />
          <button onClick={() => { setSearch(""); setSearchOpen(false); }} className="text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Side menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setMenuOpen(false)} />
          <aside className="fixed right-0 top-0 bottom-0 w-80 bg-white z-40 p-10 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between mb-12">
              <span className="font-display font-black text-xl tracking-tighter uppercase">Menú</span>
              <button onClick={() => setMenuOpen(false)} className="p-2 hover:bg-secondary rounded-xl transition-all"><X className="w-6 h-6" /></button>
            </div>
            <nav className="space-y-6">
              <button onClick={scrollToProducts} className="w-full text-left py-2 text-lg font-bold hover:text-primary transition-colors flex items-center justify-between group">
                Productos <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
              </button>
              {categories.length > 0 && (
                <div className="pt-6 border-t border-gray-100">
                  <div className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] mb-6">Categorías</div>
                  <div className="space-y-4">
                    {categories.map((c: string) => (
                      <button
                        key={c}
                        onClick={() => { setActiveCategory(c); scrollToProducts(); }}
                        className="w-full text-left py-1 text-sm font-medium hover:text-primary transition-colors flex items-center justify-between group"
                      >
                        {c} <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {(store.custom_links ?? []).length > 0 && (
                <div className="pt-6 border-t border-gray-100">
                  <div className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] mb-6">Social & Enlaces</div>
                  <div className="space-y-4">
                    {(store.custom_links ?? []).map((l: any, i: number) => (
                      <a key={i} href={l.url} target="_blank" rel="noreferrer" className="block py-1 text-sm font-medium hover:text-primary transition-colors flex items-center justify-between group">
                        {l.label} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </nav>
            <div className="mt-20 pt-10 border-t border-gray-100">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-white text-sm" style={{ background: primary }}>
                    {store.store_name?.charAt(0)}
                  </div>
                  <div className="text-xs font-bold">{store.store_name}</div>
               </div>
            </div>
          </aside>
        </>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-30" onClick={() => { if (checkoutStep === "cart" || checkoutStep === "success") setCartOpen(false); }} />
          <aside className="fixed right-0 top-0 bottom-0 w-full sm:w-[450px] bg-white z-40 flex flex-col shadow-xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {checkoutStep !== "cart" && checkoutStep !== "success" && (
                  <button 
                    onClick={() => setCheckoutStep(prev => prev === "info" ? "cart" : prev === "shipping" ? "info" : "shipping")}
                    className="p-1 hover:bg-gray-100 rounded-full transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <span className="font-semibold text-lg">
                  {checkoutStep === "cart" ? `Tu carrito (${cartCount})` : 
                   checkoutStep === "info" ? "Información de contacto" : 
                   checkoutStep === "shipping" ? "Envío" : 
                   checkoutStep === "payment" ? "Confirmar pedido" :
                   "¡Pedido realizado!"}
                </span>
              </div>
              <button onClick={() => { setCartOpen(false); setCheckoutStep("cart"); }} className="p-1 hover:bg-gray-100 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps Indicator (Shopify-like) */}
            {checkoutStep !== "cart" && checkoutStep !== "success" && (
              <div className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 border-b border-gray-100 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                <span className={checkoutStep === "info" ? "text-rose-deep" : "text-gray-600"}>Info</span>
                <ChevronRight className="w-3 h-3" />
                <span className={checkoutStep === "shipping" ? "text-rose-deep" : "text-gray-600"}>Envío</span>
                <ChevronRight className="w-3 h-3" />
                <span className={checkoutStep === "payment" ? "text-rose-deep" : ""}>Confirmar</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {checkoutStep === "cart" && (
                <div className="p-4 space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                        <ShoppingBag className="w-10 h-10" />
                      </div>
                      <p className="text-gray-500">Tu carrito está vacío.</p>
                      <button 
                        onClick={() => setCartOpen(false)}
                        style={{ background: primary, borderRadius: radius, color: "#fff" }}
                        className="px-6 py-2 text-sm font-medium"
                      >
                        Seguir comprando
                      </button>
                    </div>
                  ) : (
                    cart.map((i) => (
                      <div key={i.id} className="flex gap-4 items-center p-2 rounded-xl border border-gray-50 hover:border-gray-100 transition group">
                        <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                          {i.image_url && <img src={i.image_url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-ink line-clamp-2">{i.name}</div>
                          <div className="text-sm font-bold mt-1" style={{ color: primary }}>S/ {i.price.toLocaleString()}</div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                              <button onClick={() => updateQty(i.id, -1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-ink"><Minus className="w-3 h-3" /></button>
                              <span className="text-xs font-semibold w-4 text-center">{i.qty}</span>
                              <button onClick={() => updateQty(i.id, 1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-ink"><Plus className="w-3 h-3" /></button>
                            </div>
                            <button onClick={() => removeItem(i.id)} className="text-gray-300 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {checkoutStep === "info" && (
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2"><User className="w-3 h-3" /> Nombre completo</label>
                      <input 
                        value={customerData.name}
                        onChange={e => setCustomerData({...customerData, name: e.target.value})}
                        placeholder="Ej: Juan Pérez"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-rose-deep/20 transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2"><Mail className="w-3 h-3" /> Correo electrónico</label>
                      <input 
                        type="email"
                        value={customerData.email}
                        onChange={e => setCustomerData({...customerData, email: e.target.value})}
                        placeholder="tu@email.com"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-rose-deep/20 transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2"><Phone className="w-3 h-3" /> WhatsApp / Teléfono</label>
                      <input 
                        type="tel"
                        value={customerData.phone}
                        onChange={e => setCustomerData({...customerData, phone: e.target.value})}
                        placeholder="987 654 321"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-rose-deep/20 transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {checkoutStep === "shipping" && (
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2"><MapPin className="w-3 h-3" /> Dirección de entrega</label>
                      <input 
                        value={customerData.address}
                        onChange={e => setCustomerData({...customerData, address: e.target.value})}
                        placeholder="Av. Las Magnolias 123"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-rose-deep/20 transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2"><MapPin className="w-3 h-3" /> Distrito / Ciudad</label>
                      <input 
                        value={customerData.city}
                        onChange={e => setCustomerData({...customerData, city: e.target.value})}
                        placeholder="Miraflores, Lima"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-rose-deep/20 transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Notas del pedido (opcional)</label>
                      <textarea 
                        value={customerData.notes}
                        onChange={e => setCustomerData({...customerData, notes: e.target.value})}
                        placeholder="Ej: Tocar el timbre fuerte, dejar en portería..."
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-rose-deep/20 transition resize-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {checkoutStep === "payment" && (
                <div className="p-6 space-y-6">
                  {store.checkout_method === "mixed" && (
                    <div className="space-y-4">
                      <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                        <CreditCard className="w-3 h-3" /> Selecciona cómo quieres pedir
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setSelectedPaymentMethod("whatsapp")}
                          className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${selectedPaymentMethod === "whatsapp" ? "border-rose-deep bg-rose-deep/5" : "border-gray-100 bg-white"}`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedPaymentMethod === "whatsapp" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                            <MessageCircle className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider">WhatsApp</span>
                        </button>
                        <button
                          onClick={() => setSelectedPaymentMethod("payment_link")}
                          className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${selectedPaymentMethod === "payment_link" ? "border-rose-deep bg-rose-deep/5" : "border-gray-100 bg-white"}`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedPaymentMethod === "payment_link" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}`}>
                            <CreditCard className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider">Pago en tienda</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="bg-rose-deep/5 p-4 rounded-2xl border border-rose-deep/10 space-y-2">
                    <h3 className="text-sm font-bold text-rose-deep flex items-center gap-2">
                      <Check className="w-4 h-4" /> Instrucciones finales
                    </h3>
                    <div className="text-xs text-ink whitespace-pre-line leading-relaxed">
                      {selectedPaymentMethod === "whatsapp" 
                        ? "Tu pedido se enviará por WhatsApp para que coordines el pago y envío directamente."
                        : store.checkout_instructions || "Por favor, procede a confirmar el pedido para recibir las instrucciones finales."}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Resumen del pedido</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {cart.map(i => (
                        <div key={i.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{i.qty}x {i.name}</span>
                          <span className="font-medium">S/ {(i.price * i.qty).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {checkoutStep === "success" && (
                <div className="p-8 text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <Check className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display text-ink">¡Muchas gracias, {customerData.name}!</h2>
                    <p className="text-muted-foreground mt-2">Tu pedido #{orderId?.slice(0, 8)} ha sido recibido con éxito.</p>
                  </div>
                  
                  {store.checkout_instructions && (
                    <div className="bg-gray-50 p-6 rounded-2xl text-left space-y-3 border border-gray-100">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">Siguientes pasos:</h4>
                      <p className="text-sm text-ink leading-relaxed">{store.checkout_instructions}</p>
                    </div>
                  )}

                  <button 
                    onClick={() => { setCartOpen(false); setCheckoutStep("cart"); }}
                    style={{ background: primary, borderRadius: radius, color: "#fff" }}
                    className="w-full py-4 text-sm font-bold uppercase tracking-widest shadow-lg active:scale-95 transition"
                  >
                    Volver a la tienda
                  </button>
                </div>
              )}
            </div>

            {/* Footer actions */}
            {cart.length > 0 && checkoutStep !== "success" && (
              <div className="border-t border-gray-100 p-6 bg-white space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">S/ {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Envío</span>
                    <span className="text-green-600 font-medium">Gratis</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <span className="text-base font-bold text-ink">Total</span>
                    <span className="text-xl font-bold" style={{ color: primary }}>S/ {cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                {checkoutStep === "cart" && (
                  <button
                    onClick={handleCheckout}
                    style={{ background: primary, borderRadius: radius, color: "#fff" }}
                    className="w-full py-4 text-sm font-bold uppercase tracking-widest shadow-lg active:scale-95 transition"
                  >
                    Finalizar pedido
                  </button>
                )}

                {checkoutStep === "info" && (
                  <button
                    disabled={!customerData.name || !customerData.phone}
                    onClick={() => setCheckoutStep("shipping")}
                    style={{ background: primary, borderRadius: radius, color: "#fff" }}
                    className="w-full py-4 text-sm font-bold uppercase tracking-widest shadow-lg active:scale-95 transition disabled:opacity-50"
                  >
                    Continuar al envío
                  </button>
                )}

                {checkoutStep === "shipping" && (
                  <button
                    disabled={!customerData.address || !customerData.city}
                    onClick={() => setCheckoutStep("payment")}
                    style={{ background: primary, borderRadius: radius, color: "#fff" }}
                    className="w-full py-4 text-sm font-bold uppercase tracking-widest shadow-lg active:scale-95 transition disabled:opacity-50"
                  >
                    Continuar al pago
                  </button>
                )}

                {checkoutStep === "payment" && (
                  <button
                    disabled={isSubmitting || (store.checkout_method === "mixed" && !selectedPaymentMethod)}
                    onClick={completeCheckout}
                    style={{ background: primary, borderRadius: radius, color: "#fff" }}
                    className="w-full py-4 text-sm font-bold uppercase tracking-widest shadow-lg active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Procesando..." : selectedPaymentMethod === "whatsapp" ? "Pedir por WhatsApp" : "Confirmar pedido"}
                  </button>
                )}
              </div>
            )}
          </aside>
        </>
      )}
      {/* Floating WhatsApp button */}
      {(() => {
        const rawPhone = store.checkout_whatsapp || 
                         (store.custom_links ?? []).find((l: any) => /whats|wa/i.test(String(l.label ?? "")))?.url || "";
        const cleanedPhone = rawPhone.match(/\d+/g)?.join("");
        
        if (!cleanedPhone) return null;

        return (
          <a 
            href={`https://wa.me/${cleanedPhone}?text=${encodeURIComponent(`Hola! Vengo de tu tienda ${store.store_name} y tengo una consulta.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 p-4 bg-[#25D366] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 animate-in fade-in slide-in-from-bottom-10"
          >
            <MessageCircle className="w-7 h-7" />
          </a>
        );
      })()}
    </div>
  );
}
