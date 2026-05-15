import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchKrincesaProducts, type KrincesaProduct } from "@/lib/krincesa";

export const Route = createFileRoute("/s/$subdomain")({ component: PublicStore });

function PublicStore() {
  const { subdomain } = Route.useParams();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<Array<KrincesaProduct & { custom_price: number | null }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.from("stores").select("*").eq("subdomain", subdomain).maybeSingle();
      if (!s) { setLoading(false); return; }
      setStore(s);

      // Track view
      supabase.from("store_analytics").insert({ store_id: s.id, event_type: "view" });

      if (s.is_active && s.status === "active") {
        const [{ data: sp }, list] = await Promise.all([
          supabase.from("store_products").select("*").eq("store_id", s.id).eq("is_visible", true).order("display_order"),
          fetchKrincesaProducts(),
        ]);
        const map = new Map(list.map((p) => [p.id, p]));
        const merged = (sp ?? []).map((row: any) => {
          const base = map.get(row.product_api_id);
          if (!base) return null;
          return { ...base, custom_price: row.custom_price };
        }).filter(Boolean) as any;
        setProducts(merged);
      }
      setLoading(false);
    })();
  }, [subdomain]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando tienda...</div>;
  if (!store) return (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <div>
        <h1 className="font-display text-4xl text-ink">Tienda no encontrada</h1>
        <p className="mt-2 text-muted-foreground">No existe una tienda con ese nombre.</p>
        <Link to="/" className="mt-4 inline-block text-rose-deep hover:underline">Crear tu propia tienda →</Link>
      </div>
    </div>
  );

  if (!store.is_active || store.status !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6 bg-secondary">
        <div className="max-w-md p-10 bg-card rounded-2xl border border-border shadow-xl">
          <h1 className="font-display text-3xl text-ink">Esta tienda está temporalmente inactiva</h1>
          <p className="mt-2 text-muted-foreground">Vuelve a visitarla pronto.</p>
        </div>
      </div>
    );
  }

  const radius = store.button_style === "sharp" ? "0px" : store.button_style === "pill" ? "999px" : "12px";
  const fontStack = `'${store.font_family}', serif`;

  return (
    <div style={{ fontFamily: fontStack, color: "#1A1A2E", background: "#fff", minHeight: "100vh" }}>
      {store.banner_url && <img src={store.banner_url} alt="" className="w-full h-48 md:h-64 object-cover" />}

      <header className="text-center py-10 px-6" style={{ background: store.secondary_color }}>
        {store.logo_url ? (
          <img src={store.logo_url} alt={store.store_name} className="w-20 h-20 mx-auto rounded-full object-cover" />
        ) : (
          <div className="w-20 h-20 mx-auto rounded-full" style={{ background: store.primary_color }} />
        )}
        <h1 className="text-4xl md:text-5xl mt-4">{store.store_name}</h1>
        {store.description && <p className="mt-2 text-gray-600 max-w-md mx-auto">{store.description}</p>}
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {products.length === 0 ? (
          <p className="text-center text-gray-500 py-20">Esta tienda aún no tiene productos publicados.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} store={store} radius={radius} />
            ))}
          </div>
        )}

        {(store.custom_links ?? []).length > 0 && (
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {store.custom_links.filter((l: any) => l.url && l.label).map((l: any, i: number) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener"
                style={{ background: store.primary_color, borderRadius: radius, color: "#fff" }}
                className="px-5 py-2.5 text-sm font-medium hover:opacity-90 transition"
                onClick={() => supabase.from("store_analytics").insert({ store_id: store.id, event_type: "click", metadata: { link: l.label } })}
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 mt-10 py-6 text-center text-xs text-gray-400">
        {store.store_name} · powered by <Link to="/" className="text-rose-deep">KrinStore</Link>
      </footer>
    </div>
  );
}

function ProductCard({ product, store, radius }: any) {
  const price = product.custom_price ?? product.price;
  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 bg-white hover:shadow-lg transition group">
      <div className="aspect-square bg-gray-50 overflow-hidden">
        {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition" /> : null}
      </div>
      <div className="p-3">
        <div className="text-sm font-medium line-clamp-2 min-h-[2.5em]">{product.name}</div>
        <div className="mt-1 text-base font-semibold" style={{ color: store.primary_color }}>${Number(price).toLocaleString()}</div>
        <button
          style={{ background: store.primary_color, borderRadius: radius, color: "#fff" }}
          className="mt-3 w-full py-2 text-sm font-medium hover:opacity-90 transition"
          onClick={() => supabase.from("store_analytics").insert({ store_id: store.id, event_type: "click", product_id: product.id })}
        >
          Comprar
        </button>
      </div>
    </div>
  );
}
