// Cliente para la API de Krincesa
const KRINCESA_API = "https://vownudchcmjjypztutun.supabase.co/functions/v1/products-api";

export type KrincesaProduct = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description?: string;
  category?: string;
};

export async function fetchKrincesaProducts(): Promise<KrincesaProduct[]> {
  try {
    const res = await fetch(KRINCESA_API);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    // Normalizamos múltiples shapes posibles
    const list = Array.isArray(data) ? data : (data.products ?? data.data ?? []);
    return list.map((p: any) => ({
      id: String(p.id ?? p.product_id ?? p.sku ?? crypto.randomUUID()),
      name: p.name ?? p.title ?? "Producto",
      price: Number(p.price ?? p.precio ?? 0),
      image_url: p.image_url ?? p.image ?? p.imagen ?? "",
      description: p.description ?? p.descripcion ?? "",
      category: p.category ?? p.categoria ?? "",
    }));
  } catch (e) {
    console.error("Krincesa API error:", e);
    return [];
  }
}
