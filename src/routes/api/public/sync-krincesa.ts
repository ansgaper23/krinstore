import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const KRINCESA_API = "https://vownudchcmjjypztutun.supabase.co/functions/v1/products-api";

export const Route = createFileRoute("/api/public/sync-krincesa")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const res = await fetch(KRINCESA_API);
          if (!res.ok) throw new Error(`Krincesa API ${res.status}`);
          const json = await res.json();
          const list: any[] = Array.isArray(json) ? json : (json.products ?? json.data ?? []);

          const rows = list.map((p) => ({
            id: String(p.id ?? p.product_id ?? p.sku),
            name: p.name ?? p.title ?? "Producto",
            price: Number(p.price ?? p.precio ?? 0),
            image_url: p.image_url ?? p.image ?? p.imagen ?? null,
            description: p.description ?? p.descripcion ?? null,
            category: p.category ?? p.categoria ?? null,
            raw: p,
            last_synced_at: new Date().toISOString(),
          })).filter((r) => r.id && r.id !== "undefined");

          if (rows.length === 0) {
            return Response.json({ success: false, error: "Empty payload from Krincesa" }, { status: 502 });
          }

          const { error } = await supabaseAdmin
            .from("krincesa_products_cache")
            .upsert(rows, { onConflict: "id" });

          if (error) throw error;
          return Response.json({ success: true, synced: rows.length, at: new Date().toISOString() });
        } catch (e: any) {
          console.error("sync-krincesa error", e);
          return Response.json({ success: false, error: e.message }, { status: 500 });
        }
      },
      GET: async () => Response.json({ ok: true, hint: "POST to trigger sync" }),
    },
  },
});
