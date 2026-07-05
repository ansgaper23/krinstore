import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { err, supabaseForUser, unauth } from "../supabase";

export default defineTool({
  name: "list_store_orders",
  title: "List store orders",
  description: "List recent orders for one of the signed-in user's stores.",
  inputSchema: {
    store_id: z.string().uuid().describe("The store ID."),
    status: z.string().optional().describe("Filter by order status (e.g. pending, paid, shipped)."),
    limit: z.number().int().min(1).max(200).optional(),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ store_id, status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("orders")
      .select("id, customer_name, customer_phone, total, status, payment_status, payment_method, created_at")
      .eq("store_id", store_id)
      .order("created_at", { ascending: false })
      .limit(limit ?? 50);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return err(error.message);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { orders: data ?? [] },
    };
  },
});
