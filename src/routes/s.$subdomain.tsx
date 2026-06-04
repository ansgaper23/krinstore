import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchKrincesaProducts, type KrincesaProduct } from "@/lib/krincesa";
import { StoreRenderer } from "@/components/StoreRenderer";
import { DEFAULT_SECTIONS, type Section } from "@/lib/store-sections";
import { CreditCard } from "lucide-react";

export const Route = createFileRoute("/s/$subdomain")({ component: PublicStore });

function PublicStore() {
  const { subdomain } = Route.useParams();
  const [store, setStore] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [products, setProducts] = useState<Array<KrincesaProduct & { custom_price: number | null; original_price: number | null; image_url_2: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: s, error: storeErr } = await supabase.from("stores").select("*").eq("subdomain", subdomain).maybeSingle();
        
        if (storeErr) throw storeErr;
        if (!active) return;
        if (!s) { setLoading(false); return; }
        setStore(s);

        const { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", s.user_id).order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (active) setSubscription(sub);

        supabase.from("store_analytics").insert({ store_id: s.id, event_type: "view" });

        if (s.is_active && s.status === "active") {
          const [{ data: sp }, list, { data: cp }] = await Promise.all([
            supabase.from("store_products").select("*").eq("store_id", s.id).eq("is_visible", true).order("display_order"),
            fetchKrincesaProducts(),
            (supabase as any).from("custom_products").select("*").eq("store_id", s.id).eq("is_visible", true).order("display_order"),
          ]);
          if (!active) return;
          const map = new Map(list.map((p) => [p.id, p]));
          const merged = (sp ?? []).map((row: any) => {
            const base = map.get(row.product_api_id); if (!base) return null;
            return {
              ...base,
              name: row.custom_name || base.name,
              description: row.custom_description || base.description,
              image_url_2: row.image_url_2 ?? null,
              custom_price: row.custom_price,
              original_price: row.original_price,
            };
          }).filter(Boolean) as any;
          const customs = (cp ?? []).map((c: any) => ({
            id: `custom-${c.id}`,
            name: c.name,
            description: c.description,
            price: c.price,
            original_price: c.original_price,
            image_url: c.image_url,
            image_url_2: c.image_url_2,
            category: c.category,
            custom_price: null,
          }));
          setProducts([...merged, ...customs]);
        }
      } catch (err: any) {
        console.error("Error in PublicStore fetch:", err);
        setError(err.message || "Error al cargar la tienda");
      }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [subdomain, supabase]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-center px-6 bg-white">
      <div>
        <h1 className="font-display text-4xl text-ink">Ups! Algo salió mal</h1>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-primary text-white rounded-full">Reintentar</button>
      </div>
    </div>
  );

  if (!store) return (
    <div className="min-h-screen flex items-center justify-center text-center px-6 bg-white">
      <div>
        <h1 className="font-display text-4xl text-ink">Tienda no encontrada</h1>
        <p className="mt-2 text-muted-foreground">No existe una tienda con ese nombre.</p>
        <Link to="/" className="mt-4 inline-block text-rose-deep hover:underline">Crear tu propia tienda →</Link>
      </div>
    </div>
  );
  if (!store.is_active || store.status !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6 bg-secondary">
        <div className="max-w-md p-10 bg-card rounded-2xl border border-border shadow-xl">
          <h1 className="font-display text-3xl text-ink">Esta tienda está temporalmente inactiva</h1>
          <p className="mt-2 text-muted-foreground">Vuelve a visitarla pronto.</p>
        </div>
      </div>
    );
  }

  const sections: Section[] = (store as any).sections ?? DEFAULT_SECTIONS;

  const buildWhatsappUrl = (phone: string, message: string) => {
    const clean = phone.replace(/[^\d]/g, "");
    return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
  };

  const handleCheckout = async (items: any[], total: number, customerData?: any) => {
    // Analytics
    items.forEach((it) =>
      supabase.from("store_analytics").insert({ store_id: store.id, event_type: "checkout", product_id: it.id })
    );

    const method = customerData?.payment_method || store.checkout_method || "whatsapp";
    const instructions = store.checkout_instructions ? `\n\n${store.checkout_instructions}` : "";
    const lines = items
      .map((i) => `• ${i.name} x${i.qty} — S/ ${(i.price * i.qty).toLocaleString()}`)
      .join("\n");
    const summary = `${lines}\n\n*Total: S/ ${total.toLocaleString()}*`;

    // If customer data is provided, save the order to DB
    let savedOrderId = null;
    if (customerData) {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          store_id: store.id,
          customer_name: customerData.name,
          customer_email: customerData.email,
          customer_phone: customerData.phone,
          customer_address: customerData.address,
          customer_city: customerData.city,
          items: items.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
          total: total,
          payment_method: method,
          notes: customerData.notes
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error saving order:", error);
        return { success: false, error: "No se pudo guardar el pedido" };
      }
      savedOrderId = order.id;
    }

    if (method === "payment_link" && store.checkout_payment_url) {
      const sep = store.checkout_payment_url.includes("?") ? "&" : "?";
      const meta = `total=${encodeURIComponent(String(total))}&items=${encodeURIComponent(
        items.map((i) => `${i.name} x${i.qty}`).join(", ")
      )}`;
      window.open(`${store.checkout_payment_url}${sep}${meta}`, "_blank");
      return { success: true, orderId: savedOrderId };
    }

    const rawPhone = store.checkout_whatsapp ||
      ((store.custom_links ?? []).find((l: any) => /whats|wa/i.test(String(l.label ?? "")))?.url ?? "");
    
    const phoneMatch = rawPhone.match(/\d+/g);
    const phone = phoneMatch ? phoneMatch.join("") : "";

    if (method === "whatsapp" && phone) {
      let msg = `¡Hola ${store.store_name}! Quiero hacer este pedido:\n\n${summary}${instructions}\n\n*Datos del cliente:*\n👤 ${customerData?.name || "No especificado"}\n📞 ${customerData?.phone || "No especificado"}\n📍 ${customerData?.address || ""}, ${customerData?.city || ""}\n📧 ${customerData?.email || ""}\n📝 ${customerData?.notes || ""}`;
      
      if (store.whatsapp_message_template) {
        msg = store.whatsapp_message_template
          .replace(/{resumen}/g, summary)
          .replace(/{total}/g, `S/ ${total.toLocaleString()}`)
          .replace(/{nombre_tienda}/g, store.store_name ?? "")
          .replace(/{nombre_cliente}/g, customerData?.name || items[0]?.customer_name || "")
          .replace(/{telefono_cliente}/g, customerData?.phone || "")
          .replace(/{direccion_cliente}/g, `${customerData?.address || ""}, ${customerData?.city || ""}`)
          .replace(/{email_cliente}/g, customerData?.email || "")
          .replace(/{notas_cliente}/g, customerData?.notes || "")
          .replace(/{instrucciones}/g, store.checkout_instructions ?? "");
      }

      window.open(buildWhatsappUrl(phone, msg), "_blank");
      return { success: true, orderId: savedOrderId };
    } else if (method === "payment_link" || method === "online" || store.checkout_instructions) {
      // If no phone or method is specifically not whatsapp, it's enough to just show the success message
      return { success: true, orderId: savedOrderId };
    } else {
      return { success: false, error: "Esta tienda aún no configuró un método de checkout." };
    }
  };

  const isSuspended = subscription?.status === "suspended" || subscription?.status === "cancelled";

  return (
    <div className={`min-h-screen bg-white relative ${isSuspended ? "overflow-hidden" : ""}`}>
      <div className={isSuspended ? "grayscale blur-[2px] opacity-60 pointer-events-none transition-all duration-1000" : ""}>
        <StoreRenderer store={store} sections={sections} products={products} onCheckout={handleCheckout} />
      </div>

      {isSuspended && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/10 backdrop-blur-[1px]">
          <div className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] max-w-sm shadow-2xl border border-white/20 text-center animate-in zoom-in duration-500">
             <div className="w-16 h-16 bg-rose-100 text-rose-deep rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8" />
              </div>
              <h2 className="font-display text-2xl font-bold text-ink mb-2">Tienda en Pausa</h2>
              <p className="text-muted-foreground text-sm mb-2">Esta tienda se encuentra pausada temporalmente.</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest italic">Vuelve a visitarnos pronto</p>
          </div>
        </div>
      )}

      <div className="text-center text-[10px] text-gray-400 py-3 relative z-10">
        powered by <Link to="/" className="text-rose-deep">KrinStore</Link>
      </div>
    </div>
  );
}
