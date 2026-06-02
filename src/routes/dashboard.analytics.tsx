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
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Estadísticas</h1>
          <p className="text-sm text-muted-foreground mt-1">Tu rendimiento en los últimos 30 días.</p>
        </div>
        <div className="bg-card border border-border rounded-full px-4 py-2 text-xs font-medium text-muted-foreground">
          Sincronizado: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Visitas" value={stats.views} description="Personas que entraron" />
        <Stat label="Interacciones" value={stats.clicks} description="Clicks en productos" />
        <Stat label="Intenciones" value={stats.purchases} description="Clicks en comprar" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold">Tráfico de la tienda</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Visitas</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.byDay}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#D4547A', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="views" stroke="#D4547A" strokeWidth={3} dot={{ r: 4, fill: '#D4547A', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-6">Lo más buscado</h3>
          {stats.topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[260px] text-center px-4">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                <BarChart3 className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Aún no hay datos suficientes. Compartí tu tienda para empezar a ver resultados.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {stats.topProducts.map(([id, count]: any, idx: number) => (
                <li key={id} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-rose-deep shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">Producto ID: {id}</div>
                    <div className="w-full bg-muted h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.min(100, (count / (stats.topProducts[0][1] || 1)) * 100)}%` }} 
                      />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, description }: { label: string; value: number; description: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary transition group">
      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{label}</div>
      <div className="font-display text-4xl mt-1 text-ink group-hover:text-rose-deep transition-colors">{value.toLocaleString()}</div>
      <div className="text-[11px] text-muted-foreground mt-2">{description}</div>
    </div>
  );
}
