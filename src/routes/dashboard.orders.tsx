import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format, isToday, isYesterday, subDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  ShoppingBag, ChevronRight, User, Phone, MapPin, Package, CheckCircle2,
  XCircle, CreditCard, Search, Download, MessageCircle, Bell, TrendingUp,
  Clock, Truck, DollarSign, Filter, Copy, Printer, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/orders")({ component: OrdersPage });

type OrderStatus = "pending" | "processing" | "shipped" | "completed" | "cancelled";

const STATUS_META: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  pending: { label: "Pendiente", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  processing: { label: "En proceso", color: "bg-blue-100 text-blue-700 border-blue-200", icon: RefreshCw },
  shipped: { label: "Enviado", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Truck },
  completed: { label: "Completado", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const knownIds = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchOrders(true);
  }, [user]);

  // Realtime new order notifications
  useEffect(() => {
    if (!store?.id) return;
    const ch = supabase
      .channel(`orders-${store.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders", filter: `store_id=eq.${store.id}` }, (payload) => {
        const o: any = payload.new;
        setOrders((prev) => [o, ...prev]);
        toast.success(`🔔 Nuevo pedido de ${o.customer_name}`, {
          description: `S/ ${Number(o.total).toLocaleString()} • ${(o.items || []).length} producto(s)`,
          action: { label: "Ver", onClick: () => setSelectedOrder(o) },
        });
        audioRef.current?.play().catch(() => {});
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [store?.id]);

  async function fetchOrders(withLoading = false) {
    if (withLoading) setLoading(true);
    const { data: s } = await supabase.from("stores").select("id, store_name, checkout_whatsapp, subdomain").eq("user_id", user!.id).single();
    if (!s) { setLoading(false); return; }
    setStore(s);
    const { data } = await supabase.from("orders").select("*").eq("store_id", s.id).order("created_at", { ascending: false });
    if (data) {
      setOrders(data);
      knownIds.current = new Set(data.map((d: any) => d.id));
    }
    setLoading(false);
  }

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, status });
      toast.success(`Pedido actualizado a "${STATUS_META[status as OrderStatus]?.label ?? status}"`);
    } else {
      toast.error("Error al actualizar");
    }
  };

  const bulkUpdate = async (status: string) => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    const { error } = await supabase.from("orders").update({ status }).in("id", ids);
    if (!error) {
      setOrders(orders.map(o => selected.has(o.id) ? { ...o, status } : o));
      toast.success(`${ids.length} pedido(s) actualizados`);
      setSelected(new Set());
    }
  };

  // Filters
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (dateFilter !== "all") {
        const d = new Date(o.created_at);
        if (dateFilter === "today" && !isToday(d)) return false;
        if (dateFilter === "week" && d < subDays(new Date(), 7)) return false;
        if (dateFilter === "month" && d < subDays(new Date(), 30)) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          o.customer_name?.toLowerCase().includes(q) ||
          o.customer_phone?.includes(q) ||
          o.id.toLowerCase().includes(q) ||
          (o.items || []).some((it: any) => it.name?.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [orders, statusFilter, dateFilter, search]);

  // Stats
  const stats = useMemo(() => {
    const revenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
    const pending = orders.filter(o => o.status === "pending").length;
    const today = orders.filter(o => isToday(new Date(o.created_at))).length;
    const avg = orders.length ? revenue / orders.filter(o => o.status !== "cancelled").length : 0;
    return { revenue, pending, today, avg: avg || 0, total: orders.length };
  }, [orders]);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const k of Object.keys(STATUS_META)) c[k] = 0;
    orders.forEach(o => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }, [orders]);

  // WhatsApp messages
  const sendWhatsApp = (order: any, kind: "confirm" | "shipped" | "ready" | "custom") => {
    const phone = order.customer_phone?.replace(/\D/g, "");
    if (!phone) { toast.error("El cliente no tiene teléfono"); return; }
    const itemsList = (order.items || []).map((i: any) => `• ${i.name} x${i.qty} — S/ ${(i.price * i.qty).toLocaleString()}`).join("\n");
    const templates: Record<string, string> = {
      confirm: `¡Hola ${order.customer_name}! 👋\n\nRecibimos tu pedido en *${store?.name}* ✨\n\n${itemsList}\n\n*Total: S/ ${Number(order.total).toLocaleString()}*\n\nTe confirmo cuando esté listo. ¡Gracias por tu compra! 💖`,
      shipped: `¡Hola ${order.customer_name}! 🚚\n\nTu pedido de *${store?.name}* ya está en camino.\n\nPronto lo recibirás. ¡Gracias por confiar en nosotros! 💖`,
      ready: `¡Hola ${order.customer_name}! ✅\n\nTu pedido de *${store?.name}* ya está listo para recoger.\n\n¡Te esperamos! 💖`,
      custom: `Hola ${order.customer_name}, te contactamos de *${store?.name}* respecto a tu pedido #${order.id.slice(0, 8)}.`,
    };
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(templates[kind])}`;
    window.open(url, "_blank");
  };

  const copyOrderInfo = (order: any) => {
    const text = `Pedido #${order.id.slice(0, 8)}\nCliente: ${order.customer_name}\nTel: ${order.customer_phone || "—"}\nDirección: ${order.customer_address || "—"}\nTotal: S/ ${Number(order.total).toLocaleString()}\n\nProductos:\n${(order.items || []).map((i: any) => `- ${i.name} x${i.qty}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const exportCSV = () => {
    const rows = [
      ["ID", "Fecha", "Cliente", "Teléfono", "Dirección", "Ciudad", "Total", "Estado", "Método de pago", "Productos"],
      ...filtered.map(o => [
        o.id.slice(0, 8),
        format(new Date(o.created_at), "yyyy-MM-dd HH:mm"),
        o.customer_name || "",
        o.customer_phone || "",
        o.customer_address || "",
        o.customer_city || "",
        Number(o.total).toFixed(2),
        STATUS_META[o.status as OrderStatus]?.label ?? o.status,
        o.payment_method || "",
        (o.items || []).map((i: any) => `${i.name} x${i.qty}`).join(" | "),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedidos-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filtered.length} pedidos exportados`);
  };

  const printOrder = (order: any) => {
    const w = window.open("", "_blank");
    if (!w) return;
    const itemsHtml = (order.items || []).map((i: any) => `<tr><td>${i.name}</td><td style="text-align:center">${i.qty}</td><td style="text-align:right">S/ ${(i.price * i.qty).toLocaleString()}</td></tr>`).join("");
    w.document.write(`
      <html><head><title>Pedido #${order.id.slice(0, 8)}</title>
      <style>body{font-family:system-ui;padding:32px;max-width:600px;margin:auto}h1{border-bottom:2px solid #000;padding-bottom:8px}table{width:100%;border-collapse:collapse;margin:16px 0}td,th{padding:8px;border-bottom:1px solid #eee}.total{font-size:20px;font-weight:bold;text-align:right;margin-top:16px}</style>
      </head><body>
      <h1>${store?.name || "Tienda"}</h1>
      <p><strong>Pedido:</strong> #${order.id.slice(0, 8)}<br/>
      <strong>Fecha:</strong> ${format(new Date(order.created_at), "d MMM yyyy HH:mm", { locale: es })}</p>
      <hr/>
      <p><strong>Cliente:</strong> ${order.customer_name}<br/>
      <strong>Tel:</strong> ${order.customer_phone || "—"}<br/>
      <strong>Dirección:</strong> ${order.customer_address || "—"} ${order.customer_city || ""}</p>
      <table><thead><tr><th style="text-align:left">Producto</th><th>Cant.</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>${itemsHtml}</tbody></table>
      <div class="total">TOTAL: S/ ${Number(order.total).toLocaleString()}</div>
      <script>window.print()</script>
      </body></html>
    `);
    w.document.close();
  };

  const toggleSelect = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando pedidos...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display text-ink flex items-center gap-3">
            Pedidos
            {stats.pending > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium animate-pulse">
                {stats.pending} pendientes
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">Gestiona las ventas de tu tienda.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchOrders()} className="px-4 py-2 border border-border rounded-xl hover:bg-secondary text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>
          <button onClick={exportCSV} disabled={filtered.length === 0} className="px-4 py-2 bg-ink text-white rounded-xl hover:bg-ink/90 text-sm flex items-center gap-2 disabled:opacity-40">
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={DollarSign} label="Ingresos totales" value={`S/ ${stats.revenue.toLocaleString()}`} color="text-green-600" />
        <StatCard icon={ShoppingBag} label="Pedidos hoy" value={stats.today} color="text-blue-600" />
        <StatCard icon={Clock} label="Pendientes" value={stats.pending} color="text-amber-600" pulse={stats.pending > 0} />
        <StatCard icon={TrendingUp} label="Ticket promedio" value={`S/ ${stats.avg.toFixed(0)}`} color="text-rose-deep" />
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cliente, teléfono, ID o producto..."
              className="w-full pl-10 pr-3 py-2.5 bg-secondary border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-deep/20"
            />
          </div>
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as any)} className="bg-secondary border-none rounded-xl px-3 py-2.5 text-sm outline-none">
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Últimos 7 días</option>
            <option value="month">Últimos 30 días</option>
          </select>
        </div>
        {/* Status tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <StatusTab active={statusFilter === "all"} onClick={() => setStatusFilter("all")} label="Todos" count={statusCounts.all} />
          {(Object.keys(STATUS_META) as OrderStatus[]).map((k) => (
            <StatusTab key={k} active={statusFilter === k} onClick={() => setStatusFilter(k)} label={STATUS_META[k].label} count={statusCounts[k] || 0} color={STATUS_META[k].color} />
          ))}
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="sticky top-4 z-20 bg-ink text-white rounded-2xl p-3 mb-4 flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
          <div className="text-sm font-medium">{selected.size} seleccionados</div>
          <div className="flex gap-2">
            <button onClick={() => bulkUpdate("processing")} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">En proceso</button>
            <button onClick={() => bulkUpdate("shipped")} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">Enviados</button>
            <button onClick={() => bulkUpdate("completed")} className="text-xs bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-lg">Completar</button>
            <button onClick={() => setSelected(new Set())} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">Limpiar</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium text-ink">{orders.length === 0 ? "No hay pedidos todavía" : "Sin resultados"}</h2>
          <p className="text-muted-foreground mt-2">
            {orders.length === 0 ? "Cuando un cliente realice una compra aparecerá aquí." : "Prueba con otros filtros."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="divide-y divide-border max-h-[70vh] overflow-y-auto">
                {filtered.map((order) => {
                  const meta = STATUS_META[order.status as OrderStatus] || STATUS_META.pending;
                  const d = new Date(order.created_at);
                  const dateLabel = isToday(d) ? `Hoy, ${format(d, "HH:mm")}` : isYesterday(d) ? `Ayer, ${format(d, "HH:mm")}` : format(d, "d MMM, HH:mm", { locale: es });
                  return (
                    <div
                      key={order.id}
                      className={`flex items-start gap-2 p-3 hover:bg-secondary/50 transition ${selectedOrder?.id === order.id ? "bg-secondary" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(order.id)}
                        onChange={() => toggleSelect(order.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1.5 accent-rose-deep"
                      />
                      <button onClick={() => setSelectedOrder(order)} className="flex-1 text-left flex items-center justify-between gap-2 min-w-0">
                        <div className="min-w-0">
                          <div className="font-medium text-ink flex items-center gap-2 text-sm truncate">
                            #{order.id.slice(0, 8)}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${meta.color} flex-shrink-0`}>
                              {meta.label}
                            </span>
                          </div>
                          <div className="text-sm text-ink mt-0.5 truncate">{order.customer_name}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">{dateLabel} • {(order.items || []).length} item(s)</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-semibold text-rose-deep text-sm">S/ {Number(order.total).toLocaleString()}</div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto mt-1" />
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detail */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <OrderDetail
                order={selectedOrder}
                onStatusChange={(s) => updateOrderStatus(selectedOrder.id, s)}
                onWhatsApp={(k) => sendWhatsApp(selectedOrder, k)}
                onCopy={() => copyOrderInfo(selectedOrder)}
                onPrint={() => printOrder(selectedOrder)}
              />
            ) : (
              <div className="h-full min-h-[300px] flex items-center justify-center border-2 border-dashed border-border rounded-2xl text-muted-foreground">
                Selecciona un pedido para ver los detalles
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, pulse }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`w-4 h-4 ${color} ${pulse ? "animate-pulse" : ""}`} />
      </div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function StatusTab({ active, onClick, label, count, color }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
        active ? "bg-ink text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
      }`}
    >
      {label}
      <span className={`px-1.5 py-0.5 rounded ${active ? "bg-white/20" : "bg-white"} text-[10px]`}>{count}</span>
    </button>
  );
}

function OrderDetail({ order, onStatusChange, onWhatsApp, onCopy, onPrint }: any) {
  const meta = STATUS_META[order.status as OrderStatus] || STATUS_META.pending;
  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-display text-ink">#{order.id.slice(0, 8)}</h2>
            <span className={`text-xs px-2.5 py-1 rounded-full border ${meta.color}`}>{meta.label}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(order.created_at), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={onCopy} title="Copiar info" className="p-2 border border-border rounded-lg hover:bg-secondary"><Copy className="w-4 h-4" /></button>
          <button onClick={onPrint} title="Imprimir" className="p-2 border border-border rounded-lg hover:bg-secondary"><Printer className="w-4 h-4" /></button>
          <select
            value={order.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="bg-secondary border-none rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-rose-deep/20"
          >
            {Object.entries(STATUS_META).map(([k, m]) => (
              <option key={k} value={k}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* WhatsApp templates */}
      {order.customer_phone && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-3">
          <div className="text-xs font-semibold text-green-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" /> Contactar por WhatsApp
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onWhatsApp("confirm")} className="text-xs bg-white border border-green-200 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg">✓ Confirmar pedido</button>
            <button onClick={() => onWhatsApp("shipped")} className="text-xs bg-white border border-green-200 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg">🚚 En camino</button>
            <button onClick={() => onWhatsApp("ready")} className="text-xs bg-white border border-green-200 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg">📦 Listo para recoger</button>
            <button onClick={() => onWhatsApp("custom")} className="text-xs bg-white border border-green-200 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg">💬 Mensaje libre</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Cliente
          </h3>
          <div className="text-ink font-medium">{order.customer_name}</div>
          {order.customer_email && <div className="text-sm text-muted-foreground">{order.customer_email}</div>}
          {order.customer_phone && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" /> {order.customer_phone}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> Envío
          </h3>
          <div className="text-sm">
            {order.customer_address ? (
              <>
                <div className="text-ink">{order.customer_address}</div>
                {order.customer_city && <div className="text-muted-foreground">{order.customer_city}</div>}
              </>
            ) : (
              <span className="italic text-muted-foreground">Sin dirección</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-secondary/30 p-3 rounded-xl flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CreditCard className="w-4 h-4" /> Método de pago:
        </div>
        <div className="font-semibold text-ink uppercase tracking-wider text-xs">
          {order.payment_method === "whatsapp" ? "WhatsApp" :
           order.payment_method === "payment_link" ? "Pago en tienda" :
           order.payment_method || "No especificado"}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Package className="w-3.5 h-3.5" /> Productos ({(order.items || []).length})
        </h3>
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-3 font-medium">Producto</th>
                <th className="text-center p-3 font-medium">Cant.</th>
                <th className="text-right p-3 font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(order.items || []).map((item: any, i: number) => (
                <tr key={i}>
                  <td className="p-3 text-ink">{item.name}</td>
                  <td className="p-3 text-center text-muted-foreground">{item.qty}</td>
                  <td className="p-3 text-right font-medium">S/ {(item.price * item.qty).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-secondary/30">
              <tr>
                <td colSpan={2} className="p-3 text-right font-medium text-muted-foreground">Total</td>
                <td className="p-3 text-right font-bold text-rose-deep text-lg">S/ {Number(order.total).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {order.notes && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notas del cliente</h3>
          <p className="text-sm text-ink bg-amber-50 border border-amber-100 p-3 rounded-xl italic">"{order.notes}"</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
        <button
          onClick={() => onStatusChange("completed")}
          disabled={order.status === "completed"}
          className="flex-1 bg-green-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <CheckCircle2 className="w-4 h-4" /> Marcar completado
        </button>
        <button
          onClick={() => onStatusChange("cancelled")}
          disabled={order.status === "cancelled"}
          className="flex-1 bg-white border border-border text-red-600 rounded-xl py-2.5 text-sm font-medium hover:bg-red-50 transition flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <XCircle className="w-4 h-4" /> Cancelar pedido
        </button>
      </div>
    </div>
  );
}
