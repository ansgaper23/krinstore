import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { err, supabaseForUser, unauth } from "../supabase";

export default defineTool({
  name: "update_product_visibility",
  title: "Show or hide a product",
  description: "Toggle whether a product in the user's store is visible to shoppers.",
  inputSchema: {
    product_id: z.string().uuid().describe("The store_products row ID."),
    is_visible: z.boolean().describe("true to show the product, false to hide it."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ product_id, is_visible }, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const { data, error } = await supabaseForUser(ctx)
      .from("store_products")
      .update({ is_visible })
      .eq("id", product_id)
      .select("id, is_visible, custom_name")
      .maybeSingle();
    if (error) return err(error.message);
    if (!data) return err("Product not found or you don't have access.");
    return {
      content: [{ type: "text", text: `Product ${data.id} is now ${data.is_visible ? "visible" : "hidden"}.` }],
      structuredContent: { product: data },
    };
  },
});
