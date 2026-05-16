import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Período de gracia: 7 días después del next_billing_date
const GRACE_DAYS = 7;

export const Route = createFileRoute("/api/public/check-subscriptions")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const now = new Date();
          const graceCutoff = new Date(now.getTime() - GRACE_DAYS * 86400000).toISOString();

          // 1) active -> grace si pasó next_billing_date
          const { data: toGrace, error: e1 } = await supabaseAdmin
            .from("subscriptions")
            .update({ status: "grace", grace_until: new Date(now.getTime() + GRACE_DAYS * 86400000).toISOString() })
            .eq("status", "active")
            .lt("next_billing_date", now.toISOString())
            .select("id");
          if (e1) throw e1;

          // 2) grace -> suspended si ya pasó la ventana de gracia
          const { data: toSuspend, error: e2 } = await supabaseAdmin
            .from("subscriptions")
            .update({ status: "suspended" })
            .eq("status", "grace")
            .lt("next_billing_date", graceCutoff)
            .select("id, user_id");
          if (e2) throw e2;

          // 3) Desactivar tiendas de usuarios suspendidos
          if (toSuspend && toSuspend.length > 0) {
            const userIds = toSuspend.map((s: any) => s.user_id);
            await supabaseAdmin.from("stores").update({ is_active: false, status: "suspended" }).in("user_id", userIds);
          }

          return Response.json({
            success: true,
            moved_to_grace: toGrace?.length ?? 0,
            suspended: toSuspend?.length ?? 0,
            at: now.toISOString(),
          });
        } catch (e: any) {
          console.error("check-subscriptions error", e);
          return Response.json({ success: false, error: e.message }, { status: 500 });
        }
      },
      GET: async () => Response.json({ ok: true, hint: "POST to run subscription check" }),
    },
  },
});
