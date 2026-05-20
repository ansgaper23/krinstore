import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, ArrowUp, ArrowDown, ChevronRight, ChevronDown, Layout, Palette, Type, MousePointer2, Layers, Image as ImageIcon, Eye, EyeOff, Upload, Loader2, X, Plus, Check, Smartphone, Monitor, CreditCard, MessageCircle } from "lucide-react";
import { StoreRenderer } from "@/components/StoreRenderer";
import { DEFAULT_SECTIONS, FONT_OPTIONS, SECTION_LABELS, THEMES, type Section, type SectionType } from "@/lib/store-sections";
import { fetchKrincesaProducts } from "@/lib/krincesa";

export const Route = createFileRoute("/dashboard/settings")({ component: StoreEditor });

type Tab = "themes" | "sections" | "checkout" | "colors" | "typography" | "buttons";

function StoreEditor() {
  const { user } = useAuth();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab | null>("sections");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: s } = await supabase.from("stores").select("*").eq("user_id", user.id).maybeSingle();
      if (s) {
        if (!(s as any).sections || (s as any).sections.length === 0) (s as any).sections = DEFAULT_SECTIONS;
        setStore(s);
        const [{ data: sp }, list, { data: cp }] = await Promise.all([
          supabase.from("store_products").select("*").eq("store_id", s.id).eq("is_visible", true),
          fetchKrincesaProducts().catch(() => []),
          (supabase as any).from("custom_products").select("*").eq("store_id", s.id).eq("is_visible", true).order("display_order"),
        ]);
        const map = new Map(list.map((p) => [p.id, p]));
        const merged = (sp ?? []).map((r: any) => {
          const base = map.get(r.product_api_id); if (!base) return null;
          return { ...base, name: r.custom_name || base.name, image_url_2: r.image_url_2, custom_price: r.custom_price };
        }).filter(Boolean);
        const customs = (cp ?? []).map((c: any) => ({ id: `custom-${c.id}`, name: c.name, description: c.description, price: c.price, image_url: c.image_url, image_url_2: c.image_url_2, category: c.category, custom_price: null }));
        setProducts([...merged, ...customs] as any);
      }
    })();
  }, [user]);

  if (!store) return <div className="p-10 text-muted-foreground">Cargando editor...</div>;

  const sections: Section[] = (store as any).sections ?? DEFAULT_SECTIONS;
  const update = (patch: any) => setStore({ ...store, ...patch });
  const updateSections = (next: Section[]) => update({ sections: next });

  const save = async () => {
    setSaving(true);
    const { id, user_id, created_at, updated_at, ...rest } = store;
    const { error } = await supabase.from("stores").update(rest as any).eq("id", id);
    setSaving(false);
    if (error) alert(error.message);
  };

  const editing = editingSection ? sections.find((s) => s.id === editingSection) : null;

  const moveSection = (id: string, dir: -1 | 1) => {
    const i = sections.findIndex((s) => s.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= sections.length) return;
    const next = [...sections];
    [next[i], next[j]] = [next[j], next[i]];
    updateSections(next);
  };

  return (
    <div className="flex flex-col h-[100dvh] lg:h-screen bg-gray-100 overflow-hidden">
      {/* Top bar */}
      <header className="bg-white border-b border-border px-3 md:px-6 py-3 flex items-center justify-between gap-3 shrink-0">
        <Link to="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-muted"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="font-display text-base md:text-lg text-ink truncate flex-1">Diseña tu página web</h1>
        <div className="hidden sm:flex items-center gap-0.5 bg-gray-100 rounded-full p-0.5">
          <button onClick={() => setDevice("mobile")} className={`p-1.5 rounded-full ${device === "mobile" ? "bg-white shadow-sm text-ink" : "text-gray-500"}`} title="Móvil"><Smartphone className="w-4 h-4" /></button>
          <button onClick={() => setDevice("desktop")} className={`p-1.5 rounded-full ${device === "desktop" ? "bg-white shadow-sm text-ink" : "text-gray-500"}`} title="Escritorio"><Monitor className="w-4 h-4" /></button>
        </div>
        <button onClick={save} disabled={saving} className="px-5 py-2 bg-ink text-white rounded-full text-sm font-medium disabled:opacity-50">
          {saving ? "..." : "Guardar"}
        </button>
      </header>

      {/* Mobile device switcher (visible only on small screens) */}
      <div className="sm:hidden flex items-center justify-center gap-0.5 bg-white border-b border-border py-1.5 shrink-0">
        <button onClick={() => setDevice("mobile")} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${device === "mobile" ? "bg-gray-100 text-ink font-medium" : "text-gray-500"}`}><Smartphone className="w-3.5 h-3.5" /> Móvil</button>
        <button onClick={() => setDevice("desktop")} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${device === "desktop" ? "bg-gray-100 text-ink font-medium" : "text-gray-500"}`}><Monitor className="w-3.5 h-3.5" /> Escritorio</button>
      </div>

      {/* Live preview */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className={`mx-auto bg-white shadow-sm ${device === "mobile" ? "max-w-md" : "max-w-full"}`}>
          <StoreRenderer store={store} sections={sections} products={products} compact={device === "mobile"} />
        </div>
      </div>

      {/* Bottom sheet for active tab */}
      {tab && !editingSection && (
        <BottomSheet title={TAB_LABELS[tab]} onClose={() => setTab(null)}>
          {tab === "themes" && <ThemesPanel store={store} update={update} />}
          {tab === "sections" && (
            <SectionsPanel
              sections={sections}
              onToggle={(id) => updateSections(sections.map((s) => s.id === id ? { ...s, visible: !s.visible } : s))}
              onEdit={(id) => {
                // Auto-mostrar la sección al editarla para que no quede oculta
                updateSections(sections.map((s) => s.id === id ? { ...s, visible: true } : s));
                setEditingSection(id);
              }}
              onMove={moveSection}
            />
          )}
          {tab === "checkout" && <CheckoutPanel store={store} update={update} />}
          {tab === "colors" && <ColorsPanel store={store} update={update} />}
          {tab === "typography" && <TypographyPanel store={store} update={update} />}
          {tab === "buttons" && <ButtonsPanel store={store} update={update} />}
        </BottomSheet>
      )}

      {/* Sheet for editing a specific section */}
      {editing && (
        <BottomSheet title={SECTION_LABELS[editing.type]} onClose={() => setEditingSection(null)} large>
          <SectionEditor
            section={editing}
            userId={user!.id}
            onChange={(next) => updateSections(sections.map((s) => s.id === next.id ? next : s))}
          />
        </BottomSheet>
      )}

      {/* Bottom nav tabs */}
      <nav className="bg-white border-t border-border grid grid-cols-6 shrink-0">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => {
          const Ico = TAB_ICONS[t];
          const active = tab === t;
          return (
            <button key={t} onClick={() => { setTab(active ? null : t); setEditingSection(null); }} className={`flex flex-col items-center justify-center py-2.5 gap-0.5 ${active ? "text-rose-deep" : "text-gray-600"}`}>
              <Ico className="w-5 h-5" />
              <span className="text-[10px] font-medium">{TAB_LABELS[t]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

const TAB_LABELS: Record<Tab, string> = { themes: "Temas", sections: "Secciones", checkout: "Pago", colors: "Colores", typography: "Tipografía", buttons: "Botones" };
const TAB_ICONS: Record<Tab, any> = { themes: Layers, sections: Layout, checkout: CreditCard, colors: Palette, typography: Type, buttons: MousePointer2 };

function BottomSheet({ title, children, onClose, large }: { title: string; children: React.ReactNode; onClose: () => void; large?: boolean }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} />
      <div className={`fixed bottom-[60px] inset-x-0 z-40 bg-white rounded-t-2xl shadow-2xl ${large ? "max-h-[75vh]" : "max-h-[60vh]"} flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <h3 className="font-medium">{title}</h3>
          <button onClick={onClose} className="text-gray-500"><ChevronDown className="w-5 h-5" /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-3">{children}</div>
      </div>
    </>
  );
}

function SectionsPanel({ sections, onToggle, onEdit, onMove }: { sections: Section[]; onToggle: (id: string) => void; onEdit: (id: string) => void; onMove: (id: string, dir: -1 | 1) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 px-1">Usá las flechas para reordenar las secciones.</p>
      {sections.map((s, i) => (
        <div key={s.id} className="flex items-center gap-1 bg-white border border-border rounded-xl">
          <div className="flex flex-col">
            <button onClick={() => onMove(s.id, -1)} disabled={i === 0} className="px-2 py-1 text-gray-500 disabled:opacity-20"><ArrowUp className="w-3.5 h-3.5" /></button>
            <button onClick={() => onMove(s.id, 1)} disabled={i === sections.length - 1} className="px-2 py-1 text-gray-500 disabled:opacity-20"><ArrowDown className="w-3.5 h-3.5" /></button>
          </div>
          <button onClick={() => onEdit(s.id)} className="flex-1 flex items-center gap-3 p-3 text-left">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              {SECTION_ICONS[s.type]}
            </div>
            <span className="flex-1 text-sm">{SECTION_LABELS[s.type]}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={() => onToggle(s.id)} className="px-3 py-3 text-gray-500" title={s.visible ? "Ocultar" : "Mostrar"}>
            {s.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 opacity-50" />}
          </button>
        </div>
      ))}
    </div>
  );
}

const SECTION_ICONS: Record<SectionType, React.ReactNode> = {
  logo: <span className="text-xs">®</span>,
  hero: <ImageIcon className="w-4 h-4" />,
  benefits: <Check className="w-4 h-4" />,
  categories: <Layout className="w-4 h-4" />,
  promo: <span className="text-pink-500">♡</span>,
  products: <Layers className="w-4 h-4" />,
  footer: <span className="text-xs">≡</span>,
};

function ThemesPanel({ store, update }: any) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {THEMES.map((t) => {
        const active = store.theme === t.id;
        return (
          <button key={t.id} onClick={() => update({ theme: t.id, primary_color: t.primary, secondary_color: t.secondary, font_family: t.font, button_style: t.button })} className={`relative rounded-xl overflow-hidden border-2 ${active ? "border-ink" : "border-transparent"}`}>
            <div className="aspect-[3/4] flex flex-col" style={{ background: t.secondary }}>
              <div className="flex-1" />
              <div className="h-1/3" style={{ background: t.primary }} />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-white/90 text-xs py-1 text-center">{t.name}</div>
            {active && <div className="absolute top-2 right-2 w-5 h-5 bg-ink text-white rounded-full flex items-center justify-center"><Check className="w-3 h-3" /></div>}
          </button>
        );
      })}
    </div>
  );
}

function ColorsPanel({ store, update }: any) {
  return (
    <div className="space-y-4">
      <ColorRow label="Color principal" value={store.primary_color} onChange={(v: string) => update({ primary_color: v })} />
      <ColorRow label="Color de fondo" value={store.secondary_color ?? "#FFF0F5"} onChange={(v: string) => update({ secondary_color: v })} />
    </div>
  );
}
function ColorRow({ label, value, onChange }: any) {
  return (
    <div className="flex items-center gap-3 bg-white border border-border rounded-xl p-3">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-12 h-12 rounded-lg border border-input" />
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <input value={value} onChange={(e) => onChange(e.target.value)} className="text-xs text-gray-500 bg-transparent w-full mt-0.5" />
      </div>
    </div>
  );
}

function TypographyPanel({ store, update }: any) {
  return (
    <div className="space-y-2">
      {FONT_OPTIONS.map((f) => (
        <button key={f} onClick={() => update({ font_family: f })} className={`w-full p-4 rounded-xl border-2 text-left flex items-center justify-between ${store.font_family === f ? "border-ink bg-secondary" : "border-border bg-white"}`}>
          <span style={{ fontFamily: `'${f}', serif` }} className="text-lg">{f}</span>
          {store.font_family === f && <Check className="w-4 h-4 text-rose-deep" />}
        </button>
      ))}
    </div>
  );
}

function ButtonsPanel({ store, update }: any) {
  const opts: Array<{ id: "rounded" | "sharp" | "pill"; label: string; sample: string }> = [
    { id: "rounded", label: "Redondeado", sample: "rounded-lg" },
    { id: "sharp", label: "Cuadrado", sample: "rounded-none" },
    { id: "pill", label: "Píldora", sample: "rounded-full" },
  ];
  return (
    <div className="space-y-3">
      {opts.map((o) => (
        <button key={o.id} onClick={() => update({ button_style: o.id })} className={`w-full p-4 rounded-xl border-2 flex items-center justify-between ${store.button_style === o.id ? "border-ink bg-secondary" : "border-border bg-white"}`}>
          <span className="text-sm font-medium">{o.label}</span>
          <span style={{ background: store.primary_color }} className={`px-5 py-2 text-white text-xs ${o.sample}`}>Botón</span>
        </button>
      ))}
    </div>
  );
}

function SectionEditor({ section, userId, onChange }: { section: Section; userId: string; onChange: (s: Section) => void }) {
  const set = (data: any) => onChange({ ...section, data: { ...section.data, ...data } });

  switch (section.type) {
    case "logo":
      return <LogoEditor userId={userId} />;
    case "hero":
      return (
        <div className="space-y-3">
          <Field label="Título"><input className="input" value={section.data.title ?? ""} onChange={(e) => set({ title: e.target.value })} /></Field>
          <Field label="Subtítulo"><input className="input" value={section.data.subtitle ?? ""} onChange={(e) => set({ subtitle: e.target.value })} /></Field>
          <Field label="Texto del botón"><input className="input" value={section.data.cta ?? ""} onChange={(e) => set({ cta: e.target.value })} /></Field>
        </div>
      );
    case "benefits":
      return (
        <div className="space-y-3">
          {(section.data.items ?? []).map((it: any, i: number) => (
            <div key={i} className="bg-white border border-border rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <select value={it.icon} onChange={(e) => {
                  const items = [...section.data.items]; items[i] = { ...it, icon: e.target.value }; set({ items });
                }} className="input w-auto">
                  <option value="truck">🚚 Envío</option>
                  <option value="shield">🛡 Seguridad</option>
                  <option value="clock">⏰ 24/7</option>
                  <option value="sparkles">✨ Calidad</option>
                  <option value="heart">♥ Cuidado</option>
                  <option value="tag">🏷 Oferta</option>
                </select>
                <button onClick={() => {
                  const items = section.data.items.filter((_: any, j: number) => j !== i); set({ items });
                }} className="text-gray-400"><X className="w-4 h-4" /></button>
              </div>
              <input className="input" placeholder="Título" value={it.title} onChange={(e) => { const items = [...section.data.items]; items[i] = { ...it, title: e.target.value }; set({ items }); }} />
              <textarea className="input" placeholder="Descripción" value={it.text} onChange={(e) => { const items = [...section.data.items]; items[i] = { ...it, text: e.target.value }; set({ items }); }} rows={2} />
            </div>
          ))}
          <button onClick={() => set({ items: [...(section.data.items ?? []), { icon: "sparkles", title: "Nuevo", text: "" }] })} className="w-full py-2.5 border-2 border-dashed border-border rounded-xl text-sm text-gray-500 flex items-center justify-center gap-1"><Plus className="w-4 h-4" /> Agregar beneficio</button>
        </div>
      );
    case "categories":
    case "products":
      return <Field label="Título"><input className="input" value={section.data.title ?? ""} onChange={(e) => set({ title: e.target.value })} /></Field>;
    case "promo":
      return (
        <div className="space-y-3">
          <Field label="Título"><input className="input" value={section.data.title ?? ""} onChange={(e) => set({ title: e.target.value })} /></Field>
          <Field label="Texto del botón"><input className="input" value={section.data.cta ?? ""} onChange={(e) => set({ cta: e.target.value })} /></Field>
          <Field label="Imagen de fondo">
            <ImageInput userId={userId} kind="promo" value={section.data.image_url} onChange={(url) => set({ image_url: url })} />
          </Field>
        </div>
      );
    case "footer":
      return <Field label="Texto"><input className="input" value={section.data.text ?? ""} onChange={(e) => set({ text: e.target.value })} /></Field>;
    default:
      return null;
  }
}

function LogoEditor({ userId }: { userId: string }) {
  const [store, setStore] = useState<any>(null);
  useEffect(() => { supabase.from("stores").select("*").eq("user_id", userId).maybeSingle().then(({ data }) => setStore(data)); }, [userId]);
  if (!store) return <div className="p-4">Cargando...</div>;
  const update = async (patch: any) => {
    setStore({ ...store, ...patch });
    await supabase.from("stores").update(patch).eq("id", store.id);
  };
  return (
    <div className="space-y-3">
      <Field label="Nombre de la tienda"><input className="input" value={store.store_name} onChange={(e) => update({ store_name: e.target.value })} /></Field>
      <Field label="Logo">
        <ImageInput userId={userId} kind="logo" value={store.logo_url} onChange={(url) => update({ logo_url: url })} />
      </Field>
      <Field label="Descripción corta"><textarea className="input" rows={2} value={store.description ?? ""} onChange={(e) => update({ description: e.target.value })} /></Field>
    </div>
  );
}

function ImageInput({ userId, kind, value, onChange }: { userId: string; kind: string; value: string | null; onChange: (url: string | null) => void }) {
  const [uploading, setUploading] = useState(false);
  const handleFile = async (file: File) => {
    if (file.size > 4 * 1024 * 1024) { alert("Máximo 4MB"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${kind}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("store-assets").upload(path, file, { upsert: true, contentType: file.type });
    if (error) { alert(error.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("store-assets").getPublicUrl(path);
    onChange(publicUrl); setUploading(false);
  };
  return (
    <div className="flex items-center gap-3">
      {value ? <img src={value} alt="" className="w-16 h-16 rounded-lg object-cover" /> : <div className="w-16 h-16 rounded-lg bg-muted" />}
      <label className="flex-1 cursor-pointer px-3 py-2 border border-dashed border-input rounded-lg text-sm text-center flex items-center justify-center gap-2">
        {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</> : <><Upload className="w-4 h-4" /> {value ? "Cambiar" : "Subir"}</>}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </label>
      {value && <button onClick={() => onChange(null)} className="text-gray-400"><X className="w-4 h-4" /></button>}
    </div>
  );
}

function Field({ label, children }: any) {
  return <div><label className="text-xs font-medium block mb-1.5 text-gray-700">{label}</label>{children}</div>;
}
