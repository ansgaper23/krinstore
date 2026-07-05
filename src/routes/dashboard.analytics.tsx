import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, AreaChart, Area, CartesianGrid,
} from "recharts";
import {
  BarChart3, TrendingUp, TrendingDown, Eye, MousePointerClick, ShoppingCart,
  DollarSign, Download, Sparkles, Calendar, Target, Clock,
} from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/analytics")({ component: AnalyticsPage });

type Range = 7 | 30 | 90;

function AnalyticsPage() {
  const { user } = useAuth();
  const [range, setRange] = useState<Range>(30);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [prevEvents, setPrevEvents] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [productNames, setProductNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    load();
  }, [user, range]);

  async function load() {
    setLoading(true);
    const { data: s } = await supabase.from("stores").select("id, store_name, subdomain").eq("user_id", user!.id).maybeSingle();
    if (!s) { setLoading(false); return; }
    setStore(s);

    const now = new Date();
    const since = subDays(now, range);
    const prevSince = subDays(now, range * 2);

    const [{ data: ev }, { data: ords }] = await Promise.all([
      supabase.from("store_analytics").select("event_type, product_id, created_at").eq("store_id", s.id).gte("created_at", prevSince.toISOString()),
      supabase.from("orders").select("id, total, status, items, created_at").eq("store_id", s.id).gte("created_at", prevSince.toISOString()),
    ]);

    const all = ev ?? [];
    setEvents(all.filter((e: any) => new Date(e.created_at) >= since));
    setPrevEvents(all.filter((e: any) => new Date(e.created_at) < since));
    setOrders(ords ?? []);

    // Resolve product names
    const ids = new Set<string>();
    (all as any[]).forEach(e => e.product_id && ids.add(e.product_id));
    (ords as any[])?.forEach(o => (o.items || []).forEach((it: any) => it.id && ids.add(it.id)));

    const names: Record<string, string> = {};
    const customIds = [...ids].filter(id => id.startsWith("custom-")).map(id => id.replace("custom-", ""));
    const apiIds = [...ids].filter(id => !id.startsWith("custom-"));

    if (customIds.length) {
      const { data } = await supabase.from("custom_products").select("id, name").in("id", customIds);
      data?.forEach((p: any) => { names[`custom-${p.id}`] = p.name; });
    }
    if (apiIds.length) {
      const { data } = await supabase.from("store_products").select("product_api_id, custom_name").eq("store_id", s.id).in("product_api_id", apiIds);
      data?.forEach((p: any) => { if (p.custom_name) names[p.product_api_id] = p.custom_name; });
    }
    // Names from order items
    (ords as any[])?.forEach(o => (o.items || []).forEach((it: any) => { if (it.id && it.name) names[it.id] = names[it.id] || it.name; }));
    setProductNames(names);
    setLoading(false);
  }

  const stats = useMemo(() => {
    const count = (list: any[], t: string) => list.filter(e => e.event_type === t).length;
    const cur = {
      views: count(events, "view"),
      clicks: count(events, "click"),
      checkouts: count(events, "checkout") + count(events, "purchase"),
    };
    const prev = {
      views: count(prevEvents, "view"),
      clicks: count(prevEvents, "click"),
      checkouts: count(prevEvents, "checkout") + count(prevEvents, "purchase"),
    };
    const pct = (a: number, b: number) => b === 0 ? (a > 0 ? 100 : 0) : Math.round(((a - b) / b) * 100);

    const now = new Date();
    const since = subDays(now, range);
    const prevSince = subDays(now, range * 2);
    const curOrders = orders.filter(o => new Date(o.created_at) >= since && o.status !== "cancelled");
    const prevOrders = orders.filter(o => new Date(o.created_at) >= prevSince && new Date(o.created_at) < since && o.status !== "cancelled");
    const revenue = curOrders.reduce((s, o) => s + Number(o.total), 0);
    const prevRevenue = prevOrders.reduce((s, o) => s + Number(o.total), 0);

    return {
      views: cur.views, viewsDelta: pct(cur.views, prev.views),
      clicks: cur.clicks, clicksDelta: pct(cur.clicks, prev.clicks),
      checkouts: cur.checkouts, checkoutsDelta: pct(cur.checkouts, prev.checkouts),
      revenue, revenueDelta: pct(revenue, prevRevenue),
      orderCount: curOrders.length,
      conversion: cur.views > 0 ? (cur.checkouts / cur.views) * 100 : 0,
      ctr: cur.views > 0 ? (cur.clicks / cur.views) * 100 : 0,
    };
  }, [events, prevEvents, orders, range]);

  const byDay = useMemo(() => {
    const map: Record<string, { views: number; clicks: number; revenue: number }> = {};
    for (let i = range - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      map[d] = { views: 0, clicks: 0, revenue: 0 };
    }
    events.forEach(e => {
      const k = e.created_at.slice(0, 10);
      if (!map[k]) return;
      if (e.event_type === "view") map[k].views++;
      else if (e.event_type === "click") map[k].clicks++;
    });
    orders.filter(o => o.status !== "cancelled").forEach(o => {
      const k = o.created_at.slice(0, 10);
      if (map[k]) map[k].revenue += Number(o.total);
    });
    return Object.entries(map).map(([date, v]) => ({
      date: format(new Date(date), range > 30 ? "d MMM" : "d MMM", { locale: es }),
      fullDate: date,
      ...v,
    }));
  }, [events, orders, range]);

  const hourlyHeatmap = useMemo(() => {
    const hours: number[] = Array(24).fill(0);
    events.forEach(e => {
      if (e.event_type !== "view") return;
      hours[new Date(e.created_at).getHours()]++;
    });
    return hours.map((count, hour) => ({ hour: `${hour}h`, count }));
  }, [events]);

  const topProducts = useMemo(() => {
    const counter: Record<string, { clicks: number; sold: number; revenue: number }> = {};
    events.forEach(e => {
      if (!e.product_id) return;
      counter[e.product_id] = counter[e.product_id] || { clicks: 0, sold: 0, revenue: 0 };
      if (e.event_type === "click") counter[e.product_id].clicks++;
    });
    orders.filter(o => o.status !== "cancelled").forEach(o => {
      (o.items || []).forEach((it: any) => {
        if (!it.id) return;
        counter[it.id] = counter[it.id] || { clicks: 0, sold: 0, revenue: 0 };
        counter[it.id].sold += Number(it.qty || 0);
        counter[it.id].revenue += Number(it.price || 0) * Number(it.qty || 0);
      });
    });
    return Object.entries(counter)
      .map(([id, v]) => ({ id, name: productNames[id] || `#${id.slice(-6)}`, ...v }))
      .sort((a, b) => b.revenue - a.revenue || b.clicks - a.clicks)
      .slice(0, 8);
  }, [events, orders, productNames]);

  const bestDay = useMemo(() => {
    if (!byDay.length) return null;
    const best = [...byDay].sort((a, b) => b.revenue - a.revenue || b.views - a.views)[0];
    return best.views > 0 || best.revenue > 0 ? best : null;
  }, [byDay]);

  const bestHour = useMemo(() => {
    const max = Math.max(...hourlyHeatmap.map(h => h.count));
    if (max === 0) return null;
    return hourlyHeatmap.findIndex(h => h.count === max);
  }, [hourlyHeatmap]);

  const exportCSV = () => {
    const rows = [
      ["Fecha", "Visitas", "Clicks", "Ingresos (S/)"],
      ...byDay.map(d => [d.fullDate, d.views, d.clicks, d.revenue.toFixed(2)]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Analytics exportados");
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando estadísticas...</div>;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Estadísticas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Rendimiento comparado con los {range} días anteriores.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-secondary rounded-xl p-1">
            {([7, 30, 90] as Range[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${range === r ? "bg-white shadow-sm text-ink" : "text-muted-foreground"}`}
              >
                {r}d
              </button>
            ))}
          </div>
          <button onClick={exportCSV} className="p-2 border border-border rounded-xl hover:bg-secondary" title="Exportar CSV">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Insights */}
      {(bestDay || bestHour !== null) && (
        <div className="bg-gradient-to-r from-rose-deep/5 to-primary/5 border border-rose-deep/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-deep/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-rose-deep" />
          </div>
          <div className="flex-1 text-sm">
            <div className="font-semibold text-ink">Insights de tu tienda</div>
            <div className="text-muted-foreground mt-0.5">
              {bestDay && <>Tu mejor día fue <b className="text-ink">{bestDay.date}</b> con {bestDay.views} visitas y S/ {bestDay.revenue.toLocaleString()}. </>}
              {bestHour !== null && <>La hora con más tráfico es <b className="text-ink">{bestHour}:00</b> — publicá tus stories cerca de esa hora.</>}
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={DollarSign} label="Ingresos" value={`S/ ${stats.revenue.toLocaleString()}`} delta={stats.revenueDelta} color="text-green-600" />
        <KpiCard icon={ShoppingCart} label="Pedidos" value={stats.orderCount} delta={stats.checkoutsDelta} color="text-rose-deep" />
        <KpiCard icon={Eye} label="Visitas" value={stats.views} delta={stats.viewsDelta} color="text-blue-600" />
        <KpiCard icon={MousePointerClick} label="Clicks" value={stats.clicks} delta={stats.clicksDelta} color="text-purple-600" />
      </div>

      {/* Funnel */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-rose-deep" />
          <h3 className="text-sm font-semibold">Embudo de conversión</h3>
        </div>
        <div className="space-y-3">
          <FunnelBar label="Visitas" value={stats.views} max={stats.views || 1} color="bg-blue-500" />
          <FunnelBar
            label="Clicks en productos"
            value={stats.clicks}
            max={stats.views || 1}
            color="bg-purple-500"
            rate={stats.ctr}
            rateLabel="CTR"
          />
          <FunnelBar
            label="Intenciones de compra"
            value={stats.checkouts}
            max={stats.views || 1}
            color="bg-rose-deep"
            rate={stats.conversion}
            rateLabel="Conversión"
          />
          <FunnelBar
            label="Pedidos confirmados"
            value={stats.orderCount}
            max={stats.views || 1}
            color="bg-green-500"
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-deep" /> Tráfico e ingresos
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={byDay}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4547A" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#D4547A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontSize: "12px" }} />
              <Area type="monotone" dataKey="views" stroke="#D4547A" strokeWidth={2.5} fill="url(#viewsGrad)" name="Visitas" />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} name="Ingresos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-deep" /> Horario con más tráfico
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={hourlyHeatmap}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontSize: "12px" }} />
              <Bar dataKey="count" fill="#D4547A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top products */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-rose-deep" /> Productos con mejor rendimiento
        </h3>
        {topProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
              <BarChart3 className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Aún no hay datos. Compartí tu tienda para empezar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">Producto</th>
                  <th className="pb-2 font-medium text-right">Clicks</th>
                  <th className="pb-2 font-medium text-right">Vendidos</th>
                  <th className="pb-2 font-medium text-right">Ingresos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topProducts.map((p, i) => (
                  <tr key={p.id} className="hover:bg-secondary/40">
                    <td className="py-2.5">
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-rose-deep">{i + 1}</div>
                    </td>
                    <td className="py-2.5 font-medium text-ink">{p.name}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{p.clicks}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{p.sold}</td>
                    <td className="py-2.5 text-right font-semibold text-green-600">S/ {p.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, delta, color }: any) {
  const isUp = delta >= 0;
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="font-display text-2xl text-ink">{value}</div>
      <div className={`text-[11px] font-medium mt-1 flex items-center gap-1 ${isUp ? "text-green-600" : "text-red-500"}`}>
        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {isUp ? "+" : ""}{delta}% vs período anterior
      </div>
    </div>
  );
}

function FunnelBar({ label, value, max, color, rate, rateLabel }: any) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-medium text-ink">{label}</span>
        <div className="flex items-center gap-3">
          {rate !== undefined && (
            <span className="text-muted-foreground">{rateLabel}: <b className="text-ink">{rate.toFixed(1)}%</b></span>
          )}
          <span className="font-bold text-ink">{value.toLocaleString()}</span>
        </div>
      </div>
      <div className="w-full bg-muted h-6 rounded-lg overflow-hidden">
        <div className={`${color} h-full rounded-lg transition-all duration-700`} style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
    </div>
  );
}
