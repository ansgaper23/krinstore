import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { err, supabaseForUser, unauth } from "../supabase";

export default defineTool({
  name: "list_store_products",
  title: "List store products",
  description: "List products for one of the signed-in user's stores.",
  inputSchema: {
    store_id: z.string().uuid().describe("The store ID (from list_my_stores)."),
    limit: z.number().int().min(1).max(200).optional().describe("Max results (default 50)."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ store_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const supabase = supabaseForUser(ctx);
    // Verify ownership via RLS
    const { data: store, error: storeErr } = await supabase
      .from("stores").select("id").eq("id", store_id).maybeSingle();
    if (storeErr) return err(storeErr.message);
    if (!store) return err("Store not found or not owned by you.");

    const { data, error } = await supabase
      .from("store_products")
      .select("id, product_api_id, custom_name, custom_price, original_price, is_visible, display_order")
      .eq("store_id", store_id)
      .order("display_order")
      .limit(limit ?? 50);
    if (error) return err(error.message);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { products: data ?? [] },
    };
  },
});
