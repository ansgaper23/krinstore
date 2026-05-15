import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { fetchKrincesaProducts, type KrincesaProduct } from "@/lib/krincesa";
import { Search } from "lucide-react";

export const Route = createFileRoute("/dashboard/products")({ component: ProductsPage });

function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<KrincesaProduct[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, { is_visible: boolean; custom_price: number | null }>>({});
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: store } = await supabase.from("stores").select("id").eq("user_id", user.id).maybeSingle();
      if (!store) return;
      setStoreId(store.id);
      const [list, { data: sp }] = await Promise.all([
        fetchKrincesaProducts(),
        supabase.from("store_products").select("*").eq("store_id", store.id),
      ]);
      setProducts(list);
      const sel: any = {};
      sp?.forEach((r: any) => { sel[r.product_api_id] = { is_visible: r.is_visible, custom_price: r.custom_price }; });
      setSelections(sel);
      setLoading(false);
    })();
  }, [user]);

  const toggle = async (id: string, visible: boolean) => {
    if (!storeId) return;
    const next = { ...selections, [id]: { ...(selections[id] ?? { custom_price: null }), is_visible: visible } };
    setSelections(next);
    await supabase.from("store_products").upsert({ store_id: storeId, product_api_id: id, is_visible: visible, custom_price: next[id].custom_price }, { onConflict: "store_id,product_api_id" });
  };

  const setPrice = async (id: string, price: number | null) => {
    if (!storeId) return;
    const next = { ...selections, [id]: { ...(selections[id] ?? { is_visible: true }), custom_price: price } };
    setSelections(next);
    await supabase.from("store_products").upsert({ store_id: storeId, product_api_id: id, is_visible: next[id].is_visible, custom_price: price }, { onConflict: "store_id,product_api_id" });
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="font-display text-3xl text-ink">Productos</h1>
      <p className="text-sm text-muted-foreground mt-1">Activá los que querés mostrar en tu tienda. Podés ponerles tu propio precio.</p>

      <div className="mt-6 relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar productos..." className="w-full pl-10 pr-4 py-2.5 rounded-full border border-input bg-card" />
      </div>

      {loading && <p className="mt-8 text-muted-foreground">Cargando catálogo de Krincesa...</p>}
      {!loading && products.length === 0 && (
        <div className="mt-8 p-8 bg-secondary rounded-2xl text-center">
          <p className="text-muted-foreground">No pudimos cargar el catálogo en este momento. Intentá de nuevo en un rato.</p>
        </div>
      )}

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const s = selections[p.id];
          const visible = s?.is_visible ?? false;
          return (
            <div key={p.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="aspect-square bg-muted">
                {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
              </div>
              <div className="p-4">
                <div className="font-medium text-sm line-clamp-1">{p.name}</div>
                <div className="text-xs text-muted-foreground">Precio Krincesa: ${p.price}</div>
                <div className="mt-3 flex items-center justify-between">
                  <label className="text-xs flex items-center gap-2">
                    <input type="checkbox" checked={visible} onChange={(e) => toggle(p.id, e.target.checked)} className="accent-primary" />
                    Mostrar
                  </label>
                  <input
                    type="number"
                    placeholder="Tu precio"
                    value={s?.custom_price ?? ""}
                    onChange={(e) => setPrice(p.id, e.target.value ? Number(e.target.value) : null)}
                    className="w-24 px-2 py-1 text-xs rounded border border-input bg-background"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
