import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export const Route = createFileRoute("/dashboard/analytics")({ component: AnalyticsPage });

function AnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({ views: 0, clicks: 0, purchases: 0, byDay: [], topProducts: [] });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: store } = await supabase.from("stores").select("id").eq("user_id", user.id).maybeSingle();
      if (!store) return;
      const since = new Date(); since.setDate(since.getDate() - 30);
      const { data: events } = await supabase.from("store_analytics")
        .select("event_type, product_id, created_at")
        .eq("store_id", store.id)
        .gte("created_at", since.toISOString());

      const list = events ?? [];
      const views = list.filter((e: any) => e.event_type === "view").length;
      const clicks = list.filter((e: any) => e.event_type === "click").length;
      const purchases = list.filter((e: any) => e.event_type === "purchase").length;

      const byDayMap: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        byDayMap[d.toISOString().slice(0, 10)] = 0;
      }
      list.forEach((e: any) => {
        if (e.event_type !== "view") return;
        const k = e.created_at.slice(0, 10);
        if (k in byDayMap) byDayMap[k]++;
      });
      const byDay = Object.entries(byDayMap).map(([date, views]) => ({ date: date.slice(5), views }));

      const productCount: Record<string, number> = {};
      list.forEach((e: any) => { if (e.product_id) productCount[e.product_id] = (productCount[e.product_id] ?? 0) + 1; });
      const topProducts = Object.entries(productCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

      setStats({ views, clicks, purchases, byDay, topProducts });
    })();
  }, [user]);

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="font-display text-3xl text-ink">Estadísticas</h1>
      <p className="text-sm text-muted-foreground mt-1">Últimos 30 días.</p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <Stat label="Visitas" value={stats.views} />
        <Stat label="Clicks" value={stats.clicks} />
        <Stat label="Ventas" value={stats.purchases} />
      </div>

      <div className="mt-6 bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-medium mb-4">Visitas por día</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={stats.byDay}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="views" stroke="#D4547A" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-medium mb-4">Productos más vistos</h3>
        {stats.topProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay datos. Compartí tu tienda para empezar a ver estadísticas.</p>
        ) : (
          <ul className="space-y-2">
            {stats.topProducts.map(([id, count]: any) => (
              <li key={id} className="flex justify-between text-sm border-b border-border last:border-0 py-2">
                <span className="text-muted-foreground">Producto #{id}</span>
                <span className="font-medium">{count} vistas</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="font-display text-3xl mt-1 text-ink">{value}</div>
    </div>
  );
}
