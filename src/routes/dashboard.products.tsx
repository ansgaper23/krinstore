import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { fetchKrincesaProducts, type KrincesaProduct } from "@/lib/krincesa";
import { Search, Pencil, X, Upload, Loader2, Check, Plus, Trash2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/dashboard/products")({ component: ProductsPage });

type CustomProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  image_url_2: string | null;
  category: string | null;
  is_visible: boolean;
};

type Selection = {
  is_visible: boolean;
  custom_price: number | null;
  custom_name: string | null;
  custom_description: string | null;
  image_url_2: string | null;
};

function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<KrincesaProduct[]>([]);
  const [customs, setCustoms] = useState<CustomProduct[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [tab, setTab] = useState<"krincesa" | "custom">("krincesa");
  const [editingCustom, setEditingCustom] = useState<CustomProduct | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: store } = await supabase.from("stores").select("id").eq("user_id", user.id).maybeSingle();
      if (!store) return;
      setStoreId(store.id);
      const [list, { data: sp }] = await Promise.all([
        fetchKrincesaProducts(),
        supabase.from("store_products").select("*").eq("store_id", store.id),
      ]);
      setProducts(list);
      const sel: Record<string, Selection> = {};
      sp?.forEach((r: any) => {
        sel[r.product_api_id] = {
          is_visible: r.is_visible,
          custom_price: r.custom_price,
          custom_name: r.custom_name ?? null,
          custom_description: r.custom_description ?? null,
          image_url_2: r.image_url_2 ?? null,
        };
      });
      setSelections(sel);
      setLoading(false);
    })();
  }, [user]);

  const persist = async (productId: string, patch: Partial<Selection>) => {
    if (!storeId) return;
    const current: Selection = selections[productId] ?? {
      is_visible: false, custom_price: null, custom_name: null, custom_description: null, image_url_2: null,
    };
    const next = { ...current, ...patch };
    setSelections({ ...selections, [productId]: next });
    const { error } = await supabase.from("store_products").upsert(
      {
        store_id: storeId,
        product_api_id: productId,
        is_visible: next.is_visible,
        custom_price: next.custom_price,
        custom_name: next.custom_name,
        custom_description: next.custom_description,
        image_url_2: next.image_url_2,
      },
      { onConflict: "store_id,product_api_id" },
    );
    if (error) alert("No se pudo guardar: " + error.message);
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="font-display text-3xl text-ink">Productos</h1>
      <p className="text-sm text-muted-foreground mt-1">Activá los que querés mostrar. Editá nombre, precio, descripción e imagen adicional.</p>

      <div className="mt-6 relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar productos..." className="w-full pl-10 pr-4 py-2.5 rounded-full border border-input bg-card" />
      </div>

      {loading && <p className="mt-8 text-muted-foreground">Cargando catálogo de Krincesa...</p>}
      {!loading && products.length === 0 && (
        <div className="mt-8 p-8 bg-secondary rounded-2xl text-center">
          <p className="text-muted-foreground">No pudimos cargar el catálogo en este momento. Intentá de nuevo en un rato.</p>
        </div>
      )}

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const s = selections[p.id];
          const visible = s?.is_visible ?? false;
          return (
            <div key={p.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="aspect-square bg-muted relative">
                {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                {visible && <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> Publicado</span>}
              </div>
              <div className="p-4">
                <div className="font-medium text-sm line-clamp-1">{s?.custom_name || p.name}</div>
                <div className="text-xs text-muted-foreground">Precio Krincesa: ${p.price}</div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <label className="text-xs flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={visible} onChange={(e) => persist(p.id, { is_visible: e.target.checked })} className="accent-primary" />
                    Mostrar
                  </label>
                  <input
                    type="number"
                    placeholder="Tu precio"
                    value={s?.custom_price ?? ""}
                    onChange={(e) => persist(p.id, { custom_price: e.target.value ? Number(e.target.value) : null })}
                    className="w-20 px-2 py-1 text-xs rounded border border-input bg-background"
                  />
                  <button onClick={() => setEditing(p.id)} className="p-1.5 rounded-md hover:bg-muted text-rose-deep" title="Personalizar">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editing && user && (
        <EditModal
          product={products.find((p) => p.id === editing)!}
          selection={selections[editing] ?? { is_visible: false, custom_price: null, custom_name: null, custom_description: null, image_url_2: null }}
          userId={user.id}
          onClose={() => setEditing(null)}
          onSave={(patch) => persist(editing, patch)}
        />
      )}
    </div>
  );
}

function EditModal({ product, selection, userId, onClose, onSave }: {
  product: KrincesaProduct;
  selection: Selection;
  userId: string;
  onClose: () => void;
  onSave: (patch: Partial<Selection>) => void;
}) {
  const [draft, setDraft] = useState<Selection>(selection);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (file.size > 4 * 1024 * 1024) { alert("Máximo 4MB"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/product-${product.id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("store-assets").upload(path, file, { upsert: true, contentType: file.type });
    if (error) { alert(error.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("store-assets").getPublicUrl(path);
    setDraft({ ...draft, image_url_2: publicUrl });
    setUploading(false);
  };

  const save = () => { onSave(draft); onClose(); };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-ink">Personalizar producto</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex gap-3 mb-4">
          <img src={product.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
          <div>
            <div className="text-sm font-medium">{product.name}</div>
            <div className="text-xs text-muted-foreground">Original: ${product.price}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium block mb-1">Nombre personalizado</label>
            <input value={draft.custom_name ?? ""} onChange={(e) => setDraft({ ...draft, custom_name: e.target.value || null })} placeholder={product.name} className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background" />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Precio personalizado</label>
            <input type="number" value={draft.custom_price ?? ""} onChange={(e) => setDraft({ ...draft, custom_price: e.target.value ? Number(e.target.value) : null })} placeholder={String(product.price)} className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background" />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Descripción</label>
            <textarea value={draft.custom_description ?? ""} onChange={(e) => setDraft({ ...draft, custom_description: e.target.value || null })} rows={3} className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background" />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Segunda imagen (opcional)</label>
            <div className="flex items-center gap-3">
              {draft.image_url_2 ? (
                <img src={draft.image_url_2} alt="" className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-muted" />
              )}
              <label className="flex-1 cursor-pointer px-3 py-2 border border-dashed border-input rounded-lg text-sm text-center hover:bg-muted/50 flex items-center justify-center gap-2">
                {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo...</> : <><Upload className="w-3.5 h-3.5" /> {draft.image_url_2 ? "Cambiar" : "Subir"}</>}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </label>
              {draft.image_url_2 && <button onClick={() => setDraft({ ...draft, image_url_2: null })} className="text-xs text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.is_visible} onChange={(e) => setDraft({ ...draft, is_visible: e.target.checked })} className="accent-primary" />
            Mostrar en mi tienda
          </label>
        </div>

        <div className="mt-6 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-sm rounded-full border border-border">Cancelar</button>
          <button onClick={save} className="flex-1 py-2 text-sm rounded-full bg-primary text-primary-foreground font-medium">Guardar</button>
        </div>
      </div>
    </div>
  );
}
