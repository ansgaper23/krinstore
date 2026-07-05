import { defineTool } from "@lovable.dev/mcp-js";
import { err, supabaseForUser, unauth } from "../supabase";

export default defineTool({
  name: "get_subscription_status",
  title: "Get subscription status",
  description: "Get the signed-in user's current KrinStore subscription plan and status.",
  inputSchema: {},
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const { data, error } = await supabaseForUser(ctx)
      .from("subscriptions")
      .select("plan, status, started_at, next_billing_date, grace_until, amount, payment_method")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return err(error.message);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { subscription: data },
    };
  },
});
