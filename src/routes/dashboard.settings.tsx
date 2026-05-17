import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Save, Plus, X, Upload, Loader2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({ component: StoreEditor });

const FONT_OPTIONS = ["Playfair Display", "DM Sans", "Inter", "Cormorant", "Bebas Neue"];

function StoreEditor() {
  const { user } = useAuth();
  const [store, setStore] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("stores").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => setStore(data));
  }, [user]);

  if (!store) return <div className="p-10 text-muted-foreground">Cargando editor...</div>;

  const update = (patch: any) => setStore({ ...store, ...patch });
  const save = async () => {
    setSaving(true);
    const { id, user_id, created_at, updated_at, ...rest } = store;
    await supabase.from("stores").update(rest).eq("id", id);
    setSaving(false);
    setSavedAt(new Date());
  };

  const links: Array<{ label: string; url: string }> = store.custom_links ?? [];
  const setLinks = (v: any[]) => update({ custom_links: v });

  return (
    <div className="lg:grid lg:grid-cols-[420px_1fr] min-h-full">
      <div className="border-b lg:border-b-0 lg:border-r border-border p-5 md:p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="lg:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-muted"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="font-display text-2xl text-ink">Personalizar tienda</h1>
          </div>
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium flex items-center gap-2 disabled:opacity-50">
            <Save className="w-3.5 h-3.5" /> {saving ? "..." : "Guardar"}
          </button>
        </div>
        {savedAt && <p className="-mt-3 mb-4 text-xs text-rose-deep">Guardado a las {savedAt.toLocaleTimeString()}</p>}

        <div className={`mb-6 p-4 rounded-xl border ${store.is_active ? "bg-emerald-50 border-emerald-200" : "bg-muted border-border"}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium">{store.is_active ? "🟢 Publicada" : "⚪ Despublicada"}</div>
              <div className="text-xs text-muted-foreground mt-0.5 truncate">{store.is_active ? "/s/" + store.subdomain : "Solo vos la podés ver"}</div>
            </div>
            <button
              onClick={async () => {
                const next = !store.is_active;
                update({ is_active: next });
                await supabase.from("stores").update({ is_active: next }).eq("id", store.id);
                setSavedAt(new Date());
              }}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap ${store.is_active ? "bg-card border border-border" : "bg-primary text-primary-foreground"}`}
            >
              {store.is_active ? "Despublicar" : "Publicar"}
            </button>
          </div>
        </div>

        <Section title="Identidad">
          <Field label="Nombre"><input value={store.store_name} onChange={(e) => update({ store_name: e.target.value })} className="input" /></Field>
          <Field label="Logo"><ImageUpload userId={user!.id} kind="logo" value={store.logo_url} onChange={(url) => update({ logo_url: url })} /></Field>
          <Field label="Banner"><ImageUpload userId={user!.id} kind="banner" value={store.banner_url} onChange={(url) => update({ banner_url: url })} /></Field>
          <Field label="Descripción"><textarea value={store.description ?? ""} onChange={(e) => update({ description: e.target.value })} rows={2} className="input" /></Field>
        </Section>

        <Section title="Estilo">
          <Field label="Color principal">
            <div className="flex gap-2">
              <input type="color" value={store.primary_color} onChange={(e) => update({ primary_color: e.target.value })} className="w-12 h-10 rounded border border-input" />
              <input value={store.primary_color} onChange={(e) => update({ primary_color: e.target.value })} className="input flex-1" />
            </div>
          </Field>
          <Field label="Color secundario">
            <div className="flex gap-2">
              <input type="color" value={store.secondary_color ?? "#FFF0F5"} onChange={(e) => update({ secondary_color: e.target.value })} className="w-12 h-10 rounded border border-input" />
              <input value={store.secondary_color ?? ""} onChange={(e) => update({ secondary_color: e.target.value })} className="input flex-1" />
            </div>
          </Field>
          <Field label="Tipografía">
            <select value={store.font_family} onChange={(e) => update({ font_family: e.target.value })} className="input">
              {FONT_OPTIONS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Estilo de botones">
            <div className="grid grid-cols-3 gap-2">
              {(["rounded", "sharp", "pill"] as const).map((s) => (
                <button key={s} onClick={() => update({ button_style: s })} className={`py-2 text-sm border ${store.button_style === s ? "border-primary bg-secondary" : "border-border"} ${s === "rounded" ? "rounded-lg" : s === "sharp" ? "rounded-none" : "rounded-full"}`}>{s}</button>
              ))}
            </div>
          </Field>
        </Section>

        <Section title="Links de contacto">
          {links.map((l, i) => (
            <div key={i} className="flex gap-2">
              <input placeholder="WhatsApp" value={l.label} onChange={(e) => { const c = [...links]; c[i] = { ...c[i], label: e.target.value }; setLinks(c); }} className="input flex-1 min-w-0" />
              <input placeholder="https://..." value={l.url} onChange={(e) => { const c = [...links]; c[i] = { ...c[i], url: e.target.value }; setLinks(c); }} className="input flex-[2] min-w-0" />
              <button onClick={() => setLinks(links.filter((_, j) => j !== i))} className="p-2 text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
            </div>
          ))}
          <button onClick={() => setLinks([...links, { label: "", url: "" }])} className="text-sm text-rose-deep flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Agregar link</button>
        </Section>
      </div>

      <div className="hidden lg:block bg-muted/30 p-6 overflow-y-auto">
        <p className="text-xs text-muted-foreground mb-3">Vista previa · <span className="text-rose-deep">/s/{store.subdomain}</span></p>
        <div className="rounded-2xl overflow-hidden border border-border bg-white shadow-xl">
          <StorePreview store={store} />
        </div>
      </div>
    </div>
  );
}

function StorePreview({ store }: { store: any }) {
  const radius = store.button_style === "sharp" ? "0" : store.button_style === "pill" ? "999px" : "12px";
  return (
    <div style={{ fontFamily: `'${store.font_family}', serif`, color: "#1A1A2E" }}>
      {store.banner_url && <img src={store.banner_url} alt="" className="w-full h-32 object-cover" />}
      <div className="p-6 text-center" style={{ background: store.secondary_color }}>
        {store.logo_url ? <img src={store.logo_url} alt="" className="w-16 h-16 mx-auto rounded-full object-cover" /> : <div className="w-16 h-16 mx-auto rounded-full" style={{ background: store.primary_color }} />}
        <h1 className="text-2xl mt-3">{store.store_name}</h1>
        {store.description && <p className="text-sm text-gray-600 mt-1">{store.description}</p>}
      </div>
      <div className="p-6 grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="aspect-square bg-gray-100" />
            <div className="p-3">
              <div className="text-sm font-medium">Producto {i}</div>
              <div className="text-xs text-gray-500">$1.990</div>
              <button style={{ background: store.primary_color, borderRadius: radius, color: "white" }} className="mt-2 w-full py-1.5 text-xs">Comprar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 pb-6 border-b border-border last:border-0">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ImageUpload({ userId, kind, value, onChange }: { userId: string; kind: "logo" | "banner"; value: string | null; onChange: (url: string | null) => void }) {
  const [uploading, setUploading] = useState(false);
  const handleFile = async (file: File) => {
    if (file.size > 4 * 1024 * 1024) { alert("Máximo 4MB"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${kind}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("store-assets").upload(path, file, { upsert: true, contentType: file.type });
    if (error) { alert(error.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("store-assets").getPublicUrl(path);
    onChange(publicUrl);
    setUploading(false);
  };
  return (
    <div className="flex items-center gap-3">
      {value ? (
        <img src={value} alt="" className={kind === "banner" ? "w-24 h-12 rounded object-cover" : "w-12 h-12 rounded-full object-cover"} />
      ) : (
        <div className={`bg-muted ${kind === "banner" ? "w-24 h-12 rounded" : "w-12 h-12 rounded-full"}`} />
      )}
      <label className="flex-1 cursor-pointer px-3 py-2 border border-dashed border-input rounded-lg text-sm text-center hover:bg-muted/50 transition flex items-center justify-center gap-2">
        {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo...</> : <><Upload className="w-3.5 h-3.5" /> {value ? "Cambiar" : "Subir"}</>}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </label>
      {value && <button onClick={() => onChange(null)} className="text-xs text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>}
    </div>
  );
}
