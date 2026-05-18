import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchKrincesaProducts, type KrincesaProduct } from "@/lib/krincesa";
import { StoreRenderer } from "@/components/StoreRenderer";
import { DEFAULT_SECTIONS, type Section } from "@/lib/store-sections";

export const Route = createFileRoute("/s/$subdomain")({ component: PublicStore });

function PublicStore() {
  const { subdomain } = Route.useParams();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<Array<KrincesaProduct & { custom_price: number | null; image_url_2: string | null }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.from("stores").select("*").eq("subdomain", subdomain).maybeSingle();
      if (!s) { setLoading(false); return; }
      setStore(s);
      supabase.from("store_analytics").insert({ store_id: s.id, event_type: "view" });

      if (s.is_active && s.status === "active") {
        const [{ data: sp }, list] = await Promise.all([
          supabase.from("store_products").select("*").eq("store_id", s.id).eq("is_visible", true).order("display_order"),
          fetchKrincesaProducts(),
        ]);
        const map = new Map(list.map((p) => [p.id, p]));
        const merged = (sp ?? []).map((row: any) => {
          const base = map.get(row.product_api_id); if (!base) return null;
          return {
            ...base,
            name: row.custom_name || base.name,
            description: row.custom_description || base.description,
            image_url_2: row.image_url_2 ?? null,
            custom_price: row.custom_price,
          };
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

  const sections: Section[] = (store as any).sections ?? DEFAULT_SECTIONS;
  const wa = (store.custom_links ?? []).find((l: any) => /whats|wa/i.test(l.label ?? ""))?.url as string | undefined;

  const handleBuy = (p: any) => {
    supabase.from("store_analytics").insert({ store_id: store.id, event_type: "click", product_id: p.id });
    const price = p.custom_price ?? p.price;
    if (wa) {
      const msg = encodeURIComponent(`¡Hola! Me interesa "${p.name}" ($${Number(price).toLocaleString()}) de tu tienda ${store.store_name}.`);
      const sep = wa.includes("?") ? "&" : "?";
      window.open(`${wa}${sep}text=${msg}`, "_blank");
    } else {
      alert("Esta tienda aún no configuró un canal de contacto.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <StoreRenderer store={store} sections={sections} products={products} onBuy={handleBuy} />
      <div className="text-center text-[10px] text-gray-400 py-3">
        powered by <Link to="/" className="text-rose-deep">KrinStore</Link>
      </div>
    </div>
  );
}
