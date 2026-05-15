import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/dashboard/membership")({ component: MembershipPage });

function MembershipPage() {
  const { user } = useAuth();
  const [sub, setSub] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("mayorista_purchases").select("*").eq("user_id", user.id).order("purchase_date", { ascending: false }),
      ]);
      setSub(s); setPurchases(p ?? []);
    })();
  }, [user]);

  const total = purchases.filter((p) => p.verified).reduce((a, b) => a + Number(b.amount), 0);

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="font-display text-3xl text-ink">Mi Membresía</h1>

      {sub && (
        <div className="mt-6 p-6 bg-card border border-border rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Plan actual</div>
              <div className="font-display text-2xl mt-1 capitalize">{sub.plan.replace("_", " ")}</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${sub.status === "active" ? "bg-emerald-100 text-emerald-700" : sub.status === "grace" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
              {sub.status}
            </span>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            {sub.next_billing_date && <>Próximo cobro: {new Date(sub.next_billing_date).toLocaleDateString()}<br /></>}
            Monto: ${sub.amount}
          </div>
          <button className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium">
            Renovar / cambiar plan
          </button>
        </div>
      )}

      {sub?.plan === "free_mayorista" && (
        <div className="mt-6 p-6 bg-secondary border border-border rounded-2xl">
          <h3 className="font-display text-xl text-ink">Compras mayoristas verificadas</h3>
          <div className="mt-2 text-sm text-muted-foreground">Acumulado este período: <strong className="text-rose-deep">${total.toLocaleString()}</strong></div>
          <ul className="mt-4 space-y-2">
            {purchases.length === 0 && <li className="text-sm text-muted-foreground">Sin compras registradas todavía.</li>}
            {purchases.map((p) => (
              <li key={p.id} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                <span>{new Date(p.purchase_date).toLocaleDateString()}</span>
                <span className={p.verified ? "text-foreground" : "text-muted-foreground"}>${Number(p.amount).toLocaleString()} {!p.verified && "(pendiente)"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
