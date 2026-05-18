import { Truck, ShieldCheck, Clock, Sparkles, Heart, Tag } from "lucide-react";
import type { Section } from "@/lib/store-sections";

const ICONS: Record<string, any> = { truck: Truck, shield: ShieldCheck, clock: Clock, sparkles: Sparkles, heart: Heart, tag: Tag };

export function StoreRenderer({
  store,
  sections,
  products,
  onBuy,
  compact = false,
}: {
  store: any;
  sections: Section[];
  products: any[];
  onBuy?: (p: any) => void;
  compact?: boolean;
}) {
  const radius = store.button_style === "sharp" ? "0px" : store.button_style === "pill" ? "999px" : "12px";
  const fontStack = `'${store.font_family}', serif`;
  const primary = store.primary_color;
  const secondary = store.secondary_color || "#FFF0F5";

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  ).slice(0, 6);

  return (
    <div style={{ fontFamily: fontStack, color: "#1A1A2E", background: "#fff" }}>
      {sections.filter((s) => s.visible).map((s) => {
        switch (s.type) {
          case "logo":
            return (
              <header key={s.id} className="px-4 py-3 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  {store.logo_url ? (
                    <img src={store.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg" style={{ background: primary }} />
                  )}
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <SearchIcon /> <CartIcon /> <MenuIcon />
                </div>
              </header>
            );
          case "hero":
            return (
              <section key={s.id} className="px-6 py-10 text-center" style={{ background: secondary }}>
                <h1 className={compact ? "text-2xl" : "text-3xl md:text-5xl"}>{s.data.title || store.store_name}</h1>
                {s.data.subtitle && <p className="mt-2 text-gray-600">{s.data.subtitle}</p>}
                {s.data.cta && (
                  <button style={{ background: primary, borderRadius: radius, color: "#fff" }} className="mt-4 px-5 py-2 text-sm">
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
                  {categories.map((c: string) => (
                    <div key={c} className="aspect-square rounded-xl flex items-center justify-center text-xs text-center p-2" style={{ background: secondary }}>
                      {c}
                    </div>
                  ))}
                </div>
              </section>
            );
          case "promo":
            return (
              <section key={s.id} className="relative px-6 py-10 text-center text-white" style={{ background: s.data.image_url ? `url(${s.data.image_url}) center/cover` : "#3a2540" }}>
                <h2 className={compact ? "text-xl" : "text-2xl md:text-3xl"}>{s.data.title}</h2>
                {s.data.cta && (
                  <button className="mt-3 px-5 py-2 text-sm border border-white" style={{ borderRadius: radius }}>
                    {s.data.cta}
                  </button>
                )}
              </section>
            );
          case "products":
            return (
              <section key={s.id} className="px-4 py-6">
                <h2 className="text-xl text-center mb-4">{s.data.title || "Productos"}</h2>
                {products.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-8">No hay productos publicados aún.</p>
                ) : (
                  <div className={`grid ${compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"} gap-3`}>
                    {products.map((p) => {
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
                              onClick={() => onBuy?.(p)}
                              style={{ background: primary, borderRadius: radius, color: "#fff" }}
                              className="mt-2 w-full py-1.5 text-xs"
                            >
                              Comprar
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
    </div>
  );
}

function SearchIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>; }
function CartIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>; }
function MenuIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>; }
