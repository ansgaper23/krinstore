// Cliente para la API de Krincesa (con fallback al cache de Supabase)
import { supabase } from "@/integrations/supabase/client";

const KRINCESA_API = "https://vownudchcmjjypztutun.supabase.co/functions/v1/products-api";

export type KrincesaProduct = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description?: string;
  category?: string;
};

function normalize(p: any): KrincesaProduct {
  return {
    id: String(p.id ?? p.product_id ?? p.sku ?? ""),
    name: p.name ?? p.title ?? "Producto",
    price: Number(p.price ?? p.precio ?? 0),
    image_url: p.image_url ?? p.image ?? p.imagen ?? "",
    description: p.description ?? p.descripcion ?? "",
    category: p.category ?? p.categoria ?? "",
  };
}

/** Lee primero del cache local (rápido). Si está vacío, golpea la API y devuelve el live. */
export async function fetchKrincesaProducts(): Promise<KrincesaProduct[]> {
  try {
    const { data: cached } = await supabase
      .from("krincesa_products_cache")
      .select("id, name, price, image_url, description, category")
      .order("name");
    if (cached && cached.length > 0) return cached.map(normalize);
  } catch (e) {
    console.warn("cache read failed", e);
  }
  // Fallback live
  try {
    const res = await fetch(KRINCESA_API);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.products ?? data.data ?? []);
    return list.map(normalize).filter((p: KrincesaProduct) => p.id);
  } catch (e) {
    console.error("Krincesa API error:", e);
    return [];
  }
}

