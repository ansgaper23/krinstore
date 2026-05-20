import { useMemo, useState } from "react";
import { Truck, ShieldCheck, Clock, Sparkles, Heart, Tag, Search, ShoppingBag, Menu, X, Plus, Minus, Trash2 } from "lucide-react";
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
  const radius = store.button_style === "sharp" ? "0px" : store.button_style === "pill" ? "999px" : "12px";
  const fontStack = `'${store.font_family}', serif`;
  const primary = store.primary_color;
  const secondary = store.secondary_color || "#FFF0F5";

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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
    setCart((prev) => {
      const found = prev.find((i) => i.id === String(p.id));
      if (found) return prev.map((i) => (i.id === String(p.id) ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: String(p.id), name: p.name, price, image_url: p.image_url, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (id: string, delta: number) =>
    setCart((prev) =>
      prev.flatMap((i) => (i.id === id ? (i.qty + delta <= 0 ? [] : [{ ...i, qty: i.qty + delta }]) : [i]))
    );
  const removeItem = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    onCheckout?.(cart, cartTotal);
  };

  const scrollToProducts = () => {
    document.getElementById("__products")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  return (
    <div style={{ fontFamily: fontStack, color: "#1A1A2E", background: "#fff" }} className="relative">
      {sections.filter((s) => s.visible).map((s) => {
        switch (s.type) {
          case "logo":
            return (
              <header key={s.id} className="px-4 py-3 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20">
                <button onClick={scrollToProducts} className="flex items-center gap-2">
                  {store.logo_url ? (
                    <img src={store.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg" style={{ background: primary }} />
                  )}
                  <span className="font-medium text-sm truncate max-w-[150px]">{store.store_name}</span>
                </button>
                <div className="flex items-center gap-3 text-gray-600">
                  <button onClick={() => setSearchOpen((v) => !v)} aria-label="Buscar"><Search className="w-5 h-5" /></button>
                  <button onClick={() => setCartOpen(true)} aria-label="Carrito" className="relative">
                    <ShoppingBag className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span style={{ background: primary }} className="absolute -top-2 -right-2 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </button>
                  <button onClick={() => setMenuOpen(true)} aria-label="Menú"><Menu className="w-5 h-5" /></button>
                </div>
              </header>
            );
          case "hero":
            return (
              <section key={s.id} className="px-6 py-10 text-center" style={{ background: secondary }}>
                <h1 className={compact ? "text-2xl" : "text-3xl md:text-5xl"}>{s.data.title || store.store_name}</h1>
                {s.data.subtitle && <p className="mt-2 text-gray-600">{s.data.subtitle}</p>}
                {s.data.cta && (
                  <button onClick={scrollToProducts} style={{ background: primary, borderRadius: radius, color: "#fff" }} className="mt-4 px-5 py-2 text-sm">
                    {s.data.cta}
                  </button>
                )}
              </section>
            );
          case "benefits":
            return (
              <section key={s.id} className="px-4 py-6 space-y-3" style={{ background: secondary }}>
                {(s.data.items ?? []).map((it: any, i: number) => {
                  const Ico = ICONS[it.icon] ?? Sparkles;
                  return (
                    <div key={i} className="bg-white rounded-2xl p-5 text-center shadow-sm">
                      <Ico className="w-8 h-8 mx-auto" />
                      <div className="font-medium mt-2">{it.title}</div>
                      <p className="text-sm text-gray-600 mt-1">{it.text}</p>
                    </div>
                  );
                })}
              </section>
            );
          case "categories":
            if (categories.length === 0) return null;
            return (
              <section key={s.id} className="px-4 py-6">
                <h2 className="text-xl text-center mb-4">{s.data.title || "Categorías destacadas"}</h2>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => { setActiveCategory(null); scrollToProducts(); }}
                    className={`aspect-square rounded-xl flex items-center justify-center text-xs text-center p-2 ${!activeCategory ? "ring-2" : ""}`}
                    style={{ background: secondary, ...(!activeCategory ? { borderColor: primary, boxShadow: `0 0 0 2px ${primary}` } : {}) }}
                  >
                    Todos
                  </button>
                  {categories.map((c: string) => (
                    <button
                      key={c}
                      onClick={() => { setActiveCategory(c); scrollToProducts(); }}
                      className="aspect-square rounded-xl flex items-center justify-center text-xs text-center p-2"
                      style={{ background: secondary, ...(activeCategory === c ? { boxShadow: `0 0 0 2px ${primary}` } : {}) }}
                    >
                      {c}
                    </button>
                  ))}
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
              <section key={s.id} id="__products" className="px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl">{s.data.title || "Productos"}</h2>
                  {activeCategory && (
                    <button onClick={() => setActiveCategory(null)} className="text-xs underline text-gray-500">
                      Limpiar filtro
                    </button>
                  )}
                </div>
                {filtered.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-8">
                    {products.length === 0 ? "No hay productos publicados aún." : "No se encontraron productos."}
                  </p>
                ) : (
                  <div className={`grid ${compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"} gap-3`}>
                    {filtered.map((p) => {
                      const price = p.custom_price ?? p.price;
                      return (
                        <div key={p.id} className="rounded-xl overflow-hidden border border-gray-100 bg-white group">
                          <div className="aspect-square bg-gray-50 relative overflow-hidden">
                            {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                            {p.image_url_2 && <img src={p.image_url_2} alt="" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition" />}
                          </div>
                          <div className="p-2.5">
                            <div className="text-xs font-medium line-clamp-2 min-h-[2.4em]">{p.name}</div>
                            <div className="text-sm font-semibold mt-1" style={{ color: primary }}>${Number(price).toLocaleString()}</div>
                            <button
                              onClick={() => addToCart(p)}
                              style={{ background: primary, borderRadius: radius, color: "#fff" }}
                              className="mt-2 w-full py-1.5 text-xs"
                            >
                              Agregar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          case "footer":
            return (
              <footer key={s.id} className="px-6 py-6 border-t border-gray-100 text-center text-xs text-gray-500">
                {s.data.text || `© ${store.store_name}`}
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
          <aside className="fixed right-0 top-0 bottom-0 w-72 bg-white z-40 p-5 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="font-medium">Menú</span>
              <button onClick={() => setMenuOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <nav className="space-y-1 text-sm">
              <button onClick={scrollToProducts} className="w-full text-left py-2 hover:text-gray-500">Productos</button>
              {categories.length > 0 && (
                <>
                  <div className="text-xs uppercase text-gray-400 mt-4 mb-2">Categorías</div>
                  {categories.map((c: string) => (
                    <button
                      key={c}
                      onClick={() => { setActiveCategory(c); scrollToProducts(); }}
                      className="w-full text-left py-2 hover:text-gray-500"
                    >
                      {c}
                    </button>
                  ))}
                </>
              )}
              {(store.custom_links ?? []).length > 0 && (
                <>
                  <div className="text-xs uppercase text-gray-400 mt-4 mb-2">Enlaces</div>
                  {(store.custom_links ?? []).map((l: any, i: number) => (
                    <a key={i} href={l.url} target="_blank" rel="noreferrer" className="block py-2 hover:text-gray-500">
                      {l.label}
                    </a>
                  ))}
                </>
              )}
            </nav>
          </aside>
        </>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setCartOpen(false)} />
          <aside className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white z-40 flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="font-medium">Tu carrito ({cartCount})</span>
              <button onClick={() => setCartOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-10">Tu carrito está vacío.</p>
              ) : (
                cart.map((i) => (
                  <div key={i.id} className="flex gap-3 items-center">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {i.image_url && <img src={i.image_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm line-clamp-2">{i.name}</div>
                      <div className="text-sm font-semibold" style={{ color: primary }}>${i.price.toLocaleString()}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => updateQty(i.id, -1)} className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                        <span className="text-xs w-6 text-center">{i.qty}</span>
                        <button onClick={() => updateQty(i.id, 1)} className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                        <button onClick={() => removeItem(i.id)} className="ml-auto text-gray-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-gray-100 p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="text-lg font-semibold" style={{ color: primary }}>${cartTotal.toLocaleString()}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  style={{ background: primary, borderRadius: radius, color: "#fff" }}
                  className="w-full py-3 text-sm font-medium"
                >
                  Finalizar compra
                </button>
              </div>
            )}
          </aside>
        </>
      )}
    </div>
  );
}
