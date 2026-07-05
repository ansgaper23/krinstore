import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { err, supabaseForUser, unauth } from "../supabase";

export default defineTool({
  name: "list_my_stores",
  title: "List my stores",
  description: "List all stores owned by the signed-in KrinStore user.",
  inputSchema: {},
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const { data, error } = await supabaseForUser(ctx)
      .from("stores")
      .select("id, store_name, subdomain, status, is_active, theme, template, created_at")
      .eq("user_id", ctx.getUserId());
    if (error) return err(error.message);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { stores: data ?? [] },
    };
  },
});
