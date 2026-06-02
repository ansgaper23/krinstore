import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ShoppingBag, ChevronRight, User, Phone, MapPin, Package, Clock, CheckCircle2, XCircle, CreditCard } from "lucide-react";

export const Route = createFileRoute("/dashboard/orders")({ component: OrdersPage });

function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    fetchOrders();
  }, [user]);

  async function fetchOrders() {
    setLoading(true);
    const { data: store } = await supabase.from("stores").select("id").eq("user_id", user!.id).single();
    if (!store) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  }

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, status });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700";
      case "processing": return "bg-blue-100 text-blue-700";
      case "completed": return "bg-green-100 text-green-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Pendiente";
      case "processing": return "En proceso";
      case "completed": return "Completado";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando pedidos...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-ink">Pedidos</h1>
          <p className="text-muted-foreground">Gestiona las ventas de tu tienda.</p>
        </div>
        <div className="bg-rose-deep/10 px-4 py-2 rounded-full text-rose-deep text-sm font-medium">
          {orders.length} pedidos
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium text-ink">No hay pedidos todavía</h2>
          <p className="text-muted-foreground mt-2">Cuando un cliente realice una compra aparecerá aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="divide-y divide-border">
                {orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full text-left p-4 hover:bg-secondary/50 transition flex items-center justify-between ${selectedOrder?.id === order.id ? "bg-secondary" : ""}`}
                  >
                    <div>
                      <div className="font-medium text-ink flex items-center gap-2 text-sm">
                        #{order.id.slice(0, 8)}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className="text-sm text-ink mt-0.5">{order.customer_name}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {format(new Date(order.created_at), "d MMM, HH:mm", { locale: es })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-rose-deep">S/ {Number(order.total).toLocaleString()}</div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedOrder ? (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-display text-ink">Pedido #{selectedOrder.id.slice(0, 8)}</h2>
                    <p className="text-sm text-muted-foreground">
                      Realizado el {format(new Date(selectedOrder.created_at), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                      className="bg-secondary border-none rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-rose-deep/20"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="processing">En proceso</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4" /> Cliente
                    </h3>
                    <div className="space-y-2">
                      <div className="text-ink font-medium">{selectedOrder.customer_name}</div>
                      {selectedOrder.customer_email && (
                        <div className="text-sm text-muted-foreground">{selectedOrder.customer_email}</div>
                      )}
                      {selectedOrder.customer_phone && (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5" /> {selectedOrder.customer_phone}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Envío
                    </h3>
                    <div className="text-sm text-muted-foreground">
                      {selectedOrder.customer_address ? (
                        <>
                          <div className="text-ink">{selectedOrder.customer_address}</div>
                          {selectedOrder.customer_city && <div>{selectedOrder.customer_city}</div>}
                        </>
                      ) : (
                        <span className="italic">No se proporcionó dirección</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/30 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="w-4 h-4" /> Método de pago:
                  </div>
                  <div className="font-semibold text-ink uppercase tracking-wider text-sm">
                    {selectedOrder.payment_method === 'whatsapp' ? 'WhatsApp' : 
                     selectedOrder.payment_method === 'payment_link' ? 'Pago en tienda' : 
                     selectedOrder.payment_method || 'No especificado'}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4" /> Productos
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
                        {(selectedOrder.items || []).map((item: any, i: number) => (
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
                          <td className="p-3 text-right font-bold text-rose-deep text-lg">S/ {Number(selectedOrder.total).toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Notas</h3>
                    <p className="text-sm text-ink bg-secondary/50 p-4 rounded-xl italic">
                      "{selectedOrder.notes}"
                    </p>
                  </div>
                )}
                
                <div className="flex gap-3">
                   <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                    className="flex-1 bg-green-600 text-white rounded-xl py-3 text-sm font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                   >
                     <CheckCircle2 className="w-4 h-4" /> Marcar como completado
                   </button>
                   <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                    className="flex-1 bg-white border border-border text-red-600 rounded-xl py-3 text-sm font-medium hover:bg-red-50 transition flex items-center justify-center gap-2"
                   >
                     <XCircle className="w-4 h-4" /> Cancelar pedido
                   </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-2xl text-muted-foreground">
                Selecciona un pedido para ver los detalles
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}