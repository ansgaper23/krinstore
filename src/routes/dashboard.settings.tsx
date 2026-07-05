import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Layout, Palette, Layers, Image as ImageIcon, Eye, EyeOff, Upload, Loader2, X, Plus, Check, Smartphone, Monitor, CreditCard, MessageCircle, Sparkles, Minus, User, Phone, MapPin, Mail, Undo2, Redo2, Share2, ExternalLink, GripVertical, Cloud, CloudOff, Copy, QrCode } from "lucide-react";
import { StoreRenderer } from "@/components/StoreRenderer";
import { DEFAULT_SECTIONS, FONT_OPTIONS, SECTION_LABELS, THEMES, type Section, type SectionType } from "@/lib/store-sections";
import { fetchKrincesaProducts } from "@/lib/krincesa";

export const Route = createFileRoute("/dashboard/settings")({ component: StoreEditor });

type Tab = "design" | "sections" | "checkout";

type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

function StoreEditor() {
  const { user } = useAuth();
  const [store, setStore] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHeaderMinimized, setIsHeaderMinimized] = useState(false);
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [noStore, setNoStore] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  // History for Undo/Redo
  const historyRef = useRef<any[]>([]);
  const indexRef = useRef(-1);
  const [historyLen, setHistoryLen] = useState(0);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const suppressHistory = useRef(false);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: s }, { data: sub }] = await Promise.all([
        supabase.from("stores").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (s) {
        if (!(s as any).sections || (s as any).sections.length === 0) (s as any).sections = DEFAULT_SECTIONS;
        setStore(s);
        setSubscription(sub);
        historyRef.current = [s];
        indexRef.current = 0;
        setHistoryLen(1);
        setHistoryIdx(0);
        const [{ data: sp }, list, { data: cp }] = await Promise.all([
          supabase.from("store_products").select("*").eq("store_id", s.id).eq("is_visible", true),
          fetchKrincesaProducts().catch(() => []),
          (supabase as any).from("custom_products").select("*").eq("store_id", s.id).eq("is_visible", true).order("display_order"),
        ]);
        const map = new Map(list.map((p) => [p.id, p]));
        const merged = (sp ?? []).map((r: any) => {
          const base = map.get(r.product_api_id); if (!base) return null;
          return { ...base, name: r.custom_name || base.name, image_url_2: r.image_url_2, custom_price: r.custom_price, original_price: r.original_price };
        }).filter(Boolean);
        const customs = (cp ?? []).map((c: any) => ({ id: `custom-${c.id}`, name: c.name, description: c.description, price: c.price, original_price: c.original_price, image_url: c.image_url, image_url_2: c.image_url_2, category: c.category, custom_price: null }));
        setProducts([...merged, ...customs] as any);
      } else {
        setNoStore(true);
      }
    })();
  }, [user]);

  const pushHistory = useCallback((next: any) => {
    if (suppressHistory.current) { suppressHistory.current = false; return; }
    const trimmed = historyRef.current.slice(0, indexRef.current + 1);
    trimmed.push(next);
    // cap at 40 entries
    while (trimmed.length > 40) trimmed.shift();
    historyRef.current = trimmed;
    indexRef.current = trimmed.length - 1;
    setHistoryLen(trimmed.length);
    setHistoryIdx(indexRef.current);
  }, []);

  const applyChange = useCallback((next: any) => {
    setStore(next);
    pushHistory(next);
    setStatus("dirty");
  }, [pushHistory]);

  const update = useCallback((patch: any) => {
    setStore((prev: any) => {
      const next = { ...prev, ...patch };
      pushHistory(next);
      setStatus("dirty");
      return next;
    });
  }, [pushHistory]);

  const updateSections = useCallback((next: Section[]) => update({ sections: next }), [update]);

  // Autosave debounced
  const doSave = useCallback(async () => {
    if (!store) return;
    if (subscription && subscription.status !== "active" && subscription.status !== "grace") {
      setStatus("dirty"); return;
    }
    setStatus("saving");
    const { id, user_id, created_at, updated_at, ...rest } = store;
    const { error } = await supabase.from("stores").update(rest as any).eq("id", id);
    setStatus(error ? "error" : "saved");
  }, [store, subscription]);

  useEffect(() => {
    if (status !== "dirty") return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => { void doSave(); }, 1500);
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current); };
  }, [store, status, doSave]);

  const undo = useCallback(() => {
    if (indexRef.current <= 0) return;
    indexRef.current -= 1;
    suppressHistory.current = true;
    setStore(historyRef.current[indexRef.current]);
    setHistoryIdx(indexRef.current);
    setStatus("dirty");
  }, []);

  const redo = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return;
    indexRef.current += 1;
    suppressHistory.current = true;
    setStore(historyRef.current[indexRef.current]);
    setHistoryIdx(indexRef.current);
    setStatus("dirty");
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (!meta) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((e.key === "z" && e.shiftKey) || e.key === "y") { e.preventDefault(); redo(); }
      else if (e.key === "s") { e.preventDefault(); void doSave(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, doSave]);

  // Warn before unloading with unsaved changes
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (status === "dirty" || status === "saving") { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [status]);

  const shareUrl = useMemo(() => `${typeof window !== "undefined" ? window.location.origin : ""}/s/${store?.subdomain ?? ""}`, [store?.subdomain]);
  const qrUrl = useMemo(() => `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(shareUrl)}`, [shareUrl]);

  if (noStore) return (
    <div className="p-10 max-w-md mx-auto text-center space-y-4">
      <h2 className="text-xl font-bold">No tienes una tienda creada</h2>
      <p className="text-muted-foreground text-sm">Este editor es para revendedoras. Si eres administrador, gestiona tiendas desde el panel Super Admin.</p>
      <Link to="/onboarding" className="inline-flex px-5 py-3 rounded-xl bg-primary text-white font-bold">Crear mi tienda</Link>
    </div>
  );
  if (!store) return <div className="p-10 text-muted-foreground">Cargando editor...</div>;

  const sections: Section[] = (store as any).sections ?? DEFAULT_SECTIONS;
  const editing = editingSection ? sections.find((s) => s.id === editingSection) : null;
  const canUndo = historyIdx > 0;
  const canRedo = historyIdx < historyLen - 1;

  const moveSection = (id: string, dir: -1 | 1) => {
    const i = sections.findIndex((s) => s.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= sections.length) return;
    const next = [...sections];
    [next[i], next[j]] = [next[j], next[i]];
    updateSections(next);
  };

  const reorderSections = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= sections.length || to >= sections.length) return;
    const next = [...sections];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    updateSections(next);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col h-[100dvh] lg:h-screen bg-muted/30 overflow-hidden">
      {/* Top bar */}
      <header className={`bg-white/80 backdrop-blur-xl border-b border-border/50 px-4 md:px-8 flex items-center justify-between gap-4 shrink-0 transition-all duration-500 overflow-hidden relative ${isHeaderMinimized ? "h-2 py-0" : "py-4 h-auto"}`}>
        {!isHeaderMinimized && (
          <>
            <div className="flex items-center gap-3 animate-in slide-in-from-top-4 duration-500 min-w-0">
              <Link to="/dashboard" className="p-2.5 rounded-2xl hover:bg-secondary text-muted-foreground transition-all shrink-0"><ArrowLeft className="w-5 h-5" /></Link>
              <div className="min-w-0">
                <h1 className="font-display text-xl font-bold text-ink text-nowrap">Editor de Tienda</h1>
                <SaveStatusBadge status={status} />
              </div>
            </div>

            <div className="flex items-center gap-2 animate-in slide-in-from-top-4 duration-500">
              {/* Undo / Redo */}
              <div className="hidden sm:flex items-center gap-0.5 bg-muted p-1 rounded-2xl">
                <button onClick={undo} disabled={!canUndo} title="Deshacer (Ctrl+Z)" className="p-2 rounded-xl text-ink/60 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"><Undo2 className="w-4 h-4" /></button>
                <button onClick={redo} disabled={!canRedo} title="Rehacer (Ctrl+Shift+Z)" className="p-2 rounded-xl text-ink/60 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"><Redo2 className="w-4 h-4" /></button>
              </div>

              <div className="hidden lg:flex items-center gap-1 bg-muted p-1 rounded-2xl">
                <button onClick={() => setDevice("mobile")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${device === "mobile" ? "bg-white shadow-sm text-primary" : "text-muted-foreground"}`}><Smartphone className="w-4 h-4" /> Móvil</button>
                <button onClick={() => setDevice("desktop")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${device === "desktop" ? "bg-white shadow-sm text-primary" : "text-muted-foreground"}`}><Monitor className="w-4 h-4" /> Escritorio</button>
              </div>

              {/* Ver como visitante */}
              <a href={shareUrl} target="_blank" rel="noopener" title="Ver como visitante" className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 border border-border rounded-2xl text-xs font-bold text-ink/70 hover:bg-muted transition-all">
                <ExternalLink className="w-4 h-4" /> <span className="hidden md:inline">Ver como visitante</span>
              </a>

              {/* Compartir */}
              <button onClick={() => setShareOpen(true)} className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-2xl text-xs font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all">
                <Share2 className="w-4 h-4" /> Compartir
              </button>
            </div>
          </>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setIsHeaderMinimized(!isHeaderMinimized)}
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-10 h-6 bg-white border border-border/50 rounded-full flex items-center justify-center text-muted-foreground shadow-sm hover:text-primary transition-all z-50 ${isHeaderMinimized ? "-translate-y-0" : ""}`}
        >
          {isHeaderMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </header>

      {/* Mobile device switcher */}
      <div className="sm:hidden flex items-center justify-between gap-2 bg-white border-b border-border px-3 py-1.5 shrink-0">
        <div className="flex items-center gap-0.5">
          <button onClick={undo} disabled={!canUndo} className="p-1.5 text-ink/60 disabled:opacity-30"><Undo2 className="w-4 h-4" /></button>
          <button onClick={redo} disabled={!canRedo} className="p-1.5 text-ink/60 disabled:opacity-30"><Redo2 className="w-4 h-4" /></button>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => setDevice("mobile")} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${device === "mobile" ? "bg-gray-100 text-ink font-medium" : "text-gray-500"}`}><Smartphone className="w-3.5 h-3.5" /> Móvil</button>
          <button onClick={() => setDevice("desktop")} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${device === "desktop" ? "bg-gray-100 text-ink font-medium" : "text-gray-500"}`}><Monitor className="w-3.5 h-3.5" /> Escritorio</button>
        </div>
        <a href={shareUrl} target="_blank" rel="noopener" className="p-1.5 text-ink/60"><ExternalLink className="w-4 h-4" /></a>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Navigation Sidebar */}
        <nav className="hidden lg:flex w-20 border-r border-border bg-white flex-col shrink-0 items-center py-8 gap-6 z-20">
          {(Object.keys(TAB_LABELS) as Tab[]).map((t) => {
            const Ico = TAB_ICONS[t];
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => { setTab(active ? null : t); setEditingSection(null); }}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 group relative ${active ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "text-ink/30 hover:bg-secondary hover:text-primary"}`}
                title={TAB_LABELS[t]}
              >
                <Ico className={`w-6 h-6 ${active ? "stroke-[2.5]" : ""}`} />
                <div className={`absolute left-full ml-4 px-3 py-1.5 bg-ink text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap`}>
                  {TAB_LABELS[t]}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Tools Panel */}
        {(tab || editingSection) && (
          <aside className="hidden lg:flex w-[380px] border-r border-border bg-[#FCFBFC] flex-col shrink-0 animate-in slide-in-from-left duration-500 z-10">
            <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-border/50 shrink-0">
              <h3 className="font-display text-lg font-bold text-ink tracking-tight">
                {editingSection ? SECTION_LABELS[editing?.type as SectionType] : tab ? TAB_LABELS[tab] : ""}
              </h3>
              <button onClick={() => { setTab(null); setEditingSection(null); }} className="p-2 hover:bg-secondary rounded-xl transition-all text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-8 custom-scrollbar">
              <div className="space-y-8 pb-10">
                {editingSection && editing ? (
                  <div className="animate-in fade-in duration-300">
                    <SectionEditor
                      section={editing}
                      userId={user!.id}
                      onChange={(next) => updateSections(sections.map((s) => s.id === next.id ? next : s))}
                    />
                  </div>
                ) : tab === "design" ? (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <ThemesPanel store={store} update={update} />
                    <ColorsPanel store={store} update={update} />
                    <TypographyPanel store={store} update={update} />
                    <ButtonsPanel store={store} update={update} />
                  </div>
                ) : tab === "sections" ? (
                  <SectionsPanel
                    sections={sections}
                    onToggle={(id) => updateSections(sections.map((s) => s.id === id ? { ...s, visible: !s.visible } : s))}
                    onEdit={(id) => {
                      updateSections(sections.map((s) => s.id === id ? { ...s, visible: true } : s));
                      setEditingSection(id);
                    }}
                    onMove={moveSection}
                    onReorder={reorderSections}
                    dragIndex={dragIndex}
                    setDragIndex={setDragIndex}
                    dragOver={dragOver}
                    setDragOver={setDragOver}
                  />
                ) : tab === "checkout" ? (
                  <CheckoutPanel store={store} update={update} />
                ) : null}
              </div>
            </div>
          </aside>
        )}

        {/* Live preview */}
        <div className="flex-1 overflow-y-auto bg-muted/30 p-4 lg:p-12 flex items-start justify-center min-h-0 transition-all duration-500 relative">
          {(subscription?.status === "suspended" || subscription?.status === "cancelled" || subscription?.status === "expired") && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 text-center">
              <div className="bg-white p-8 rounded-[2.5rem] max-w-sm shadow-2xl">
                <div className="w-16 h-16 bg-rose-100 text-rose-deep rounded-full flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-8 h-8" />
                </div>
                <h2 className="font-display text-2xl font-bold text-ink mb-2">Tienda Inactiva</h2>
                <p className="text-muted-foreground text-sm mb-6">Debes tener un plan activo para publicar tu tienda y recibir pedidos.</p>
                <Link to="/dashboard/membership" className="inline-block w-full py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                  Ver planes disponibles
                </Link>
              </div>
            </div>
          )}
          <div className={`mx-auto bg-white shadow-[0_32px_120px_-20px_rgba(0,0,0,0.15)] transition-all duration-700 ease-in-out ${device === "mobile" ? "max-w-[375px] rounded-[3.5rem] ring-[12px] ring-ink/5 overflow-hidden" : "w-full max-w-[1200px] rounded-[2.5rem] overflow-hidden"}`}>
            <div className="h-full overflow-y-auto no-scrollbar">
              <StoreRenderer store={store} sections={sections} products={products} compact={device === "mobile"} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom sheet for Mobile */}
      <div className="lg:hidden">
        {tab && !editingSection && (
          <BottomSheet
            title={TAB_LABELS[tab]}
            onClose={() => setTab(null)}
            onMinimize={() => setIsMinimized(!isMinimized)}
            isMinimized={isMinimized}
          >
            {tab === "design" && (
              <div className="space-y-4">
                <ThemesPanel store={store} update={update} />
                <ColorsPanel store={store} update={update} />
                <TypographyPanel store={store} update={update} />
                <ButtonsPanel store={store} update={update} />
              </div>
            )}
            {tab === "sections" && (
              <SectionsPanel
                sections={sections}
                onToggle={(id) => updateSections(sections.map((s) => s.id === id ? { ...s, visible: !s.visible } : s))}
                onEdit={(id) => {
                  updateSections(sections.map((s) => s.id === id ? { ...s, visible: true } : s));
                  setEditingSection(id);
                  setIsMinimized(false);
                }}
                onMove={moveSection}
                onReorder={reorderSections}
                dragIndex={dragIndex}
                setDragIndex={setDragIndex}
                dragOver={dragOver}
                setDragOver={setDragOver}
              />
            )}
            {tab === "checkout" && <CheckoutPanel store={store} update={update} />}
          </BottomSheet>
        )}

        {editing && (
          <BottomSheet
            title={SECTION_LABELS[editing.type]}
            onClose={() => setEditingSection(null)}
            onMinimize={() => setIsMinimized(!isMinimized)}
            isMinimized={isMinimized}
          >
            <SectionEditor
              section={editing}
              userId={user!.id}
              onChange={(next) => updateSections(sections.map((s) => s.id === next.id ? next : s))}
            />
          </BottomSheet>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="bg-white/10 backdrop-blur-xl border-t border-white/10 grid grid-cols-3 shrink-0 lg:hidden px-6">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => {
          const Ico = TAB_ICONS[t];
          const active = tab === t;
          return (
            <button key={t} onClick={() => { setTab(active ? null : t); setEditingSection(null); }} className={`flex flex-col items-center justify-center py-3 gap-1 ${active ? "text-primary" : "text-ink/30"}`}>
              <Ico className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
              <span className="text-[8px] font-bold uppercase tracking-[0.2em]">{TAB_LABELS[t]}</span>
            </button>
          );
        })}
      </nav>

      {/* Share modal */}
      {shareOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200" onClick={() => setShareOpen(false)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display text-xl text-ink">Compartir tienda</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Tu tienda se guarda automáticamente. Compartila para vender.</p>
              </div>
              <button onClick={() => setShareOpen(false)} className="p-2 hover:bg-muted rounded-full shrink-0"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex flex-col items-center mb-5 p-4 bg-muted/40 rounded-2xl">
              <img src={qrUrl} alt="QR" className="w-40 h-40 rounded-xl bg-white p-2" />
              <p className="text-xs text-muted-foreground mt-2">Escaneá para abrir la tienda</p>
            </div>

            <div className="space-y-2">
              <a href={`https://wa.me/?text=${encodeURIComponent(`Hola! Te invito a ver mi tienda ${store.store_name} 💖\n${shareUrl}`)}`} target="_blank" rel="noopener" className="flex items-center gap-3 p-3 rounded-2xl border border-border hover:bg-muted">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><MessageCircle className="w-5 h-5" /></div>
                <div className="flex-1"><div className="text-sm font-bold">WhatsApp</div><div className="text-[10px] text-muted-foreground">Enviar con mensaje pre-armado</div></div>
              </a>
              <button onClick={copyLink} className="w-full flex items-center gap-3 p-3 rounded-2xl border border-border hover:bg-muted text-left">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Copy className="w-5 h-5" /></div>
                <div className="flex-1"><div className="text-sm font-bold">{copied ? "✓ Copiado" : "Copiar link"}</div><div className="text-[10px] text-muted-foreground truncate">{shareUrl}</div></div>
              </button>
              <a href={qrUrl} download={`${store.subdomain}-qr.png`} className="w-full flex items-center gap-3 p-3 rounded-2xl border border-border hover:bg-muted">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><QrCode className="w-5 h-5" /></div>
                <div className="flex-1"><div className="text-sm font-bold">Descargar QR</div><div className="text-[10px] text-muted-foreground">Para tarjetas o packaging</div></div>
              </a>
              <a href={shareUrl} target="_blank" rel="noopener" className="w-full flex items-center gap-3 p-3 rounded-2xl border border-border hover:bg-muted">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><ExternalLink className="w-5 h-5" /></div>
                <div className="flex-1"><div className="text-sm font-bold">Ver como visitante</div><div className="text-[10px] text-muted-foreground">Probá cómo la ven tus clientas</div></div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SaveStatusBadge({ status }: { status: SaveStatus }) {
  if (status === "saving") return <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Guardando…</span>;
  if (status === "saved") return <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1"><Cloud className="w-3 h-3" /> Guardado</span>;
  if (status === "dirty") return <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1"><CloudOff className="w-3 h-3" /> Sin guardar…</span>;
  if (status === "error") return <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest flex items-center gap-1"><CloudOff className="w-3 h-3" /> Error al guardar</span>;
  return <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">Personaliza tu espacio</span>;
}

const TAB_LABELS: Record<Tab, string> = { design: "Diseño", sections: "Estructura", checkout: "Pagos" };
const TAB_ICONS: Record<Tab, any> = { design: Palette, sections: Layers, checkout: CreditCard };

function BottomSheet({ title, children, onClose, onMinimize, isMinimized }: { title: string; children: React.ReactNode; onClose: () => void; onMinimize: () => void; isMinimized: boolean }) {
  return (
    <div className={`fixed bottom-6 inset-x-6 z-40 transition-all duration-500 ease-in-out ${isMinimized ? "translate-y-[calc(100%-48px)]" : ""}`}>
      <div className={`bg-white/10 backdrop-blur-md rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] flex flex-col overflow-hidden border border-white/20 transition-all duration-500 ${isMinimized ? "h-12" : "max-h-[45vh]"}`}>
        <div className="flex items-center justify-between px-6 h-12 border-b border-white/10 shrink-0 cursor-pointer" onClick={onMinimize}>
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
             <h3 className="text-[10px] font-bold text-ink/40 uppercase tracking-[0.2em]">{title}</h3>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} className="p-1.5 hover:bg-white/20 rounded-full transition-all text-ink/40">
              {isMinimized ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1.5 hover:bg-white/20 rounded-full transition-all text-ink/40"><X className="w-4 h-4" /></button>
          </div>
        </div>
        {!isMinimized && (
          <div className="overflow-y-auto flex-1 p-4 custom-scrollbar animate-in fade-in duration-300">
            <div className="space-y-4 pb-4">
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionsPanel({ sections, onToggle, onEdit, onMove, onReorder, dragIndex, setDragIndex, dragOver, setDragOver }: { sections: Section[]; onToggle: (id: string) => void; onEdit: (id: string) => void; onMove: (id: string, dir: -1 | 1) => void; onReorder: (from: number, to: number) => void; dragIndex: number | null; setDragIndex: (n: number | null) => void; dragOver: number | null; setDragOver: (n: number | null) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold px-1 flex items-center gap-1.5">
        <GripVertical className="w-3 h-3" /> Arrastrá para reordenar
      </p>
      <div className="space-y-2">
        {sections.map((s, i) => {
          const isDragging = dragIndex === i;
          const isOver = dragOver === i && dragIndex !== null && dragIndex !== i;
          return (
            <div
              key={s.id}
              draggable
              onDragStart={(e) => { setDragIndex(i); e.dataTransfer.effectAllowed = "move"; }}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (dragOver !== i) setDragOver(i); }}
              onDragLeave={() => { if (dragOver === i) setDragOver(null); }}
              onDrop={(e) => { e.preventDefault(); if (dragIndex !== null) onReorder(dragIndex, i); setDragIndex(null); setDragOver(null); }}
              onDragEnd={() => { setDragIndex(null); setDragOver(null); }}
              className={`group flex items-center gap-2 bg-white/10 border backdrop-blur-md rounded-2xl p-1.5 transition-all duration-200 ${isDragging ? "opacity-40 scale-95" : "opacity-100"} ${isOver ? "border-primary border-2 bg-primary/10" : "border-white/10 hover:bg-white/20"}`}
            >
              <div className="cursor-grab active:cursor-grabbing p-1 text-ink/30 hover:text-primary" title="Arrastrar">
                <GripVertical className="w-4 h-4" />
              </div>
              <div className="flex flex-col gap-0.5 pr-1 border-r border-white/5">
                <button onClick={() => onMove(s.id, -1)} disabled={i === 0} className="p-1 text-ink/40 hover:text-primary disabled:opacity-5 transition-colors"><ArrowUp className="w-3 h-3" /></button>
                <button onClick={() => onMove(s.id, 1)} disabled={i === sections.length - 1} className="p-1 text-ink/40 hover:text-primary disabled:opacity-5 transition-colors"><ArrowDown className="w-3 h-3" /></button>
              </div>
              <button onClick={() => onEdit(s.id)} className="flex-1 flex items-center gap-3 p-1 text-left">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-primary/80 shadow-sm transition-transform duration-500">
                  {SECTION_ICONS[s.type]}
                </div>
                <div className="flex-1">
                  <span className="block text-[11px] font-bold text-ink/70">{SECTION_LABELS[s.type]}</span>
                </div>
              </button>
              <div className="flex items-center gap-1 pr-1">
                <button onClick={() => onToggle(s.id)} className={`p-2 rounded-lg transition-all ${s.visible ? "text-primary/60" : "text-ink/10"}`}>
                  {s.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SECTION_ICONS: Record<SectionType, React.ReactNode> = {
  logo: <span className="text-sm font-bold">Aa</span>,
  hero: <ImageIcon className="w-5 h-5" />,
  benefits: <Check className="w-5 h-5" />,
  categories: <Layout className="w-5 h-5" />,
  promo: <Sparkles className="w-5 h-5" />,
  products: <Layers className="w-5 h-5" />,
  footer: <div className="w-4 h-1 bg-current rounded-full" />,
};

function CheckoutPanel({ store, update }: any) {
  const method = store.checkout_method ?? "whatsapp";
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => update({ checkout_method: "whatsapp" })} className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-1 ${method === "whatsapp" ? "border-primary bg-primary/10" : "border-white/10 bg-white/5"}`}>
          <MessageCircle className="w-4 h-4 text-green-600/60" />
          <span className="text-[8px] font-bold uppercase tracking-wider">WhatsApp</span>
        </button>
        <button onClick={() => update({ checkout_method: "payment_link" })} className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-1 ${method === "payment_link" ? "border-primary bg-primary/10" : "border-white/10 bg-white/5"}`}>
          <CreditCard className="w-4 h-4 text-blue-600/60" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Tienda</span>
        </button>
        <button onClick={() => update({ checkout_method: "mixed" })} className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-1 ${method === "mixed" ? "border-primary bg-primary/10" : "border-white/10 bg-white/5"}`}>
          <Layers className="w-4 h-4 text-rose-deep/60" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Mixto</span>
        </button>
      </div>

      {(method === "whatsapp" || method === "mixed") && (
        <div className="space-y-4">
          <Field label="WhatsApp (con código de país)">
            <input className="input !py-2 text-xs font-bold" placeholder="+51987654321" value={store.checkout_whatsapp ?? ""} onChange={(e) => update({ checkout_whatsapp: e.target.value })} />
          </Field>
          
          <Field label="Plantilla del mensaje">
            <div className="bg-white/10 border border-white/10 rounded-xl p-2 mb-2">
              <div className="flex flex-wrap gap-1">
                {[
                  { label: "{resumen}", icon: Layers },
                  { label: "{total}", icon: CreditCard },
                  { label: "{nombre_tienda}", icon: Check },
                  { label: "{nombre_cliente}", icon: User },
                  { label: "{telefono_cliente}", icon: Phone },
                  { label: "{direccion_cliente}", icon: MapPin },
                  { label: "{email_cliente}", icon: Mail },
                  { label: "{notas_cliente}", icon: MessageCircle },
                  { label: "{instrucciones}", icon: Check },
                ].map((v) => (
                  <button
                    key={v.label}
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("whatsapp-template") as HTMLTextAreaElement;
                      if (!el) return;
                      const start = el.selectionStart;
                      const end = el.selectionEnd;
                      const val = store.whatsapp_message_template ?? "";
                      const next = val.substring(0, start) + v.label + val.substring(end);
                      update({ whatsapp_message_template: next });
                      setTimeout(() => {
                        el.focus();
                        el.setSelectionRange(start + v.label.length, start + v.label.length);
                      }, 0);
                    }}
                    className="flex items-center gap-1 px-1.5 py-1 bg-white/10 hover:bg-primary/20 border border-white/10 text-ink/60 rounded text-[8px] font-bold transition-all uppercase"
                  >
                    <v.icon className="w-2 h-2 opacity-60" />
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              id="whatsapp-template"
              className="input font-mono text-[10px] min-h-[100px] focus:ring-primary/20"
              placeholder="Ej: ¡Hola! Quiero hacer este pedido: {resumen} Total: {total}"
              value={store.whatsapp_message_template ?? ""}
              onChange={(e) => update({ whatsapp_message_template: e.target.value })}
            />

            <div className="mt-4">
              <div className="text-[9px] font-bold text-ink/30 uppercase tracking-widest mb-2 px-1 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Vista previa
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500/50" />
                <div className="text-[11px] text-ink/70 whitespace-pre-wrap leading-relaxed">
                  {(store.whatsapp_message_template || "¡Hola {nombre_tienda}! Quiero hacer este pedido:\n\n{resumen}\n\n{instrucciones}")
                    .replace(/{resumen}/g, "• Producto A x2 — S/ 20.00\n• Producto B x1 — S/ 15.00\n\n*Total: S/ 35.00*")
                    .replace(/{total}/g, "S/ 35.00")
                    .replace(/{nombre_tienda}/g, store.store_name || "Mi Tienda")
                    .replace(/{nombre_cliente}/g, "Juan Pérez")
                    .replace(/{telefono_cliente}/g, "987 654 321")
                    .replace(/{direccion_cliente}/g, "Av. Las Magnolias 123")
                    .replace(/{email_cliente}/g, "juan@email.com")
                    .replace(/{notas_cliente}/g, "Tocar timbre")
                    .replace(/{instrucciones}/g, store.checkout_instructions || "Por favor enviarme el comprobante.")}
                </div>
              </div>
            </div>
          </Field>
        </div>
      )}

      {(method === "payment_link" || method === "mixed") && (
        <div className="space-y-4 border-t border-white/5 pt-4">
          <Field label="URL de pago">
            <input className="input !py-2 text-xs" placeholder="https://mpago.la/..." value={store.checkout_payment_url ?? ""} onChange={(e) => update({ checkout_payment_url: e.target.value })} />
          </Field>
        </div>
      )}

      <Field label="Instrucciones finales">
        <textarea
          className="input !py-2 text-xs"
          rows={2}
          placeholder="Ej: Envía el comprobante..."
          value={store.checkout_instructions ?? ""}
          onChange={(e) => update({ checkout_instructions: e.target.value })}
        />
      </Field>
    </div>
  );
}

function ThemesPanel({ store, update }: any) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {THEMES.map((t) => {
        const active = store.theme === t.id;
        return (
          <button key={t.id} onClick={() => update({ theme: t.id, primary_color: t.primary, secondary_color: t.secondary, font_family: t.font, button_style: t.button })} className={`relative rounded-xl overflow-hidden border transition-all duration-300 ${active ? "border-primary ring-1 ring-primary/20" : "border-white/10 hover:border-white/30"}`}>
            <div className="aspect-square flex flex-col" style={{ background: t.secondary }}>
              <div className="flex-1 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full shadow-sm" style={{ background: t.primary }} />
              </div>
            </div>
            {active && <div className="absolute top-1 right-1 w-3 h-3 bg-primary text-white rounded-full flex items-center justify-center animate-in zoom-in"><Check className="w-2 h-2" /></div>}
          </button>
        );
      })}
    </div>
  );
}

function ColorsPanel({ store, update }: any) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <ColorRow label="Primario" value={store.primary_color} onChange={(v: string) => update({ primary_color: v })} />
      <ColorRow label="Fondo" value={store.secondary_color ?? "#FFF0F5"} onChange={(v: string) => update({ secondary_color: v })} />
    </div>
  );
}
function ColorRow({ label, value, onChange }: any) {
  return (
    <div className="flex items-center justify-between gap-2 bg-white/10 border border-white/10 backdrop-blur-md rounded-xl p-2 transition-all">
      <span className="text-[9px] font-bold text-ink/40 uppercase tracking-wider pl-1">{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-6 h-6 rounded-lg border-2 border-white/20 shadow-sm cursor-pointer overflow-hidden" />
    </div>
  );
}

function TypographyPanel({ store, update }: any) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {FONT_OPTIONS.map((f) => {
        const active = store.font_family === f;
        return (
          <button key={f} onClick={() => update({ font_family: f })} className={`p-2 rounded-xl border transition-all ${active ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 hover:border-white/30"}`}>
            <span style={{ fontFamily: `'${f}', serif` }} className="text-xs font-medium text-ink/70">{f}</span>
          </button>
        );
      })}
    </div>
  );
}

function ButtonsPanel({ store, update }: any) {
  const opts: Array<{ id: "rounded" | "sharp" | "pill"; label: string; radius: string }> = [
    { id: "rounded", label: "Suave", radius: "0.5rem" },
    { id: "sharp", label: "Recto", radius: "0px" },
    { id: "pill", label: "Cápsula", radius: "999px" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {opts.map((o) => {
        const active = store.button_style === o.id;
        return (
          <button key={o.id} onClick={() => update({ button_style: o.id })} className={`p-2 rounded-xl border transition-all ${active ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 hover:border-white/30"}`}>
            <div style={{ background: store.primary_color, borderRadius: o.radius }} className="h-4 w-full shadow-sm" />
            <span className="text-[9px] font-bold text-ink/40 mt-1 uppercase">{o.label}</span>
          </button>
        );
      })}
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
          <Field label="Imagen de fondo">
            <ImageInput userId={userId} kind="hero" value={section.data.image_url} onChange={(url) => set({ image_url: url })} />
          </Field>
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
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block px-1">{label}</label>
      <div className="animate-in fade-in slide-in-from-top-1 duration-300">
        {children}
      </div>
    </div>
  );
}
