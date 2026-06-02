import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, signOut } from "@/hooks/use-auth";
import { Logo } from "@/components/Logo";
import { LogOut, Users, CreditCard, RefreshCw, BarChart3, Ticket, Copy, Check, Plus, ArrowLeft, ExternalLink, Loader2, UserPlus, Zap, Search } from "lucide-react";

export const Route = createFileRoute("/superadmin")({ component: SuperAdmin });

type Tab = "users" | "subs" | "tickets" | "sync" | "analytics";

function SuperAdmin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("analytics");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    
    const checkAdmin = async () => {
      // Hardcoded check for the owner email as a fallback
      if (user.email === 'jorge968122@gmail.com') {
        setAllowed(true);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      
      if (error) {
        console.error("Error checking superadmin role:", error);
        setAllowed(false);
        return;
      }
      
      const isSuperadmin = data?.some(r => (r as any).role === "superadmin");
      setAllowed(isSuperadmin);
    };

    checkAdmin();
  }, [user, authLoading, navigate]);

  const statsData = [
    { label: "Visitas Hoy", value: "1,204", color: "text-primary", icon: Zap },
    { label: "Ventas Totales", value: "S/ 12,450", color: "text-emerald-600", icon: CreditCard },
    { label: "Tiendas Activas", value: "48", color: "text-ink", icon: Users },
  ];

  if (authLoading || allowed === null) return <div className="min-h-screen flex items-center justify-center">Verificando permisos...</div>;
  if (!allowed) return (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Acceso denegado</h1>
        <p className="mt-2 text-muted-foreground">Esta sección es solo para administradores.</p>
        <Link to="/dashboard" className="mt-4 inline-block text-rose-deep hover:underline">Ir al dashboard →</Link>
      </div>
    </div>
  );

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "analytics", label: "Dashboard", icon: BarChart3 },
    { id: "users", label: "Vendedores", icon: Users },
    { id: "subs", label: "Facturación", icon: CreditCard },
    { id: "tickets", label: "Tickets", icon: Ticket },
    { id: "sync", label: "Sincronización", icon: RefreshCw },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFD]">
      <header className="border-b border-border bg-white/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4 flex items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="p-2.5 rounded-2xl hover:bg-secondary text-muted-foreground transition-all"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="flex items-center gap-3">
            <Logo />
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="hidden sm:inline px-3 py-1 rounded-full bg-ink text-blush text-[10px] uppercase tracking-[0.2em] font-black">Control Central</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          {statsData.map((s, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{s.label}</span>
              <span className={`text-sm font-black ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>

        <button onClick={signOut} className="p-2.5 rounded-2xl hover:bg-rose-50 text-rose-500 transition-all flex items-center gap-2 font-bold text-xs">
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </header>

      <div className="max-w-6xl mx-auto p-6 md:p-10">
        <div className="flex gap-2 p-1.5 bg-white border border-border rounded-[2rem] mb-12 overflow-x-auto shadow-sm w-fit mx-auto lg:mx-0">
          {tabs.map((t) => (
            <button 
              key={t.id} 
              onClick={() => setTab(t.id)} 
              className={`px-6 py-3 text-xs flex items-center gap-3 rounded-[1.5rem] font-black uppercase tracking-widest transition-all ${tab === t.id ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "text-muted-foreground hover:bg-secondary hover:text-ink"}`}
            >
              <t.icon className={`w-4 h-4 ${tab === t.id ? "stroke-[3]" : ""}`} /> 
              {t.label}
            </button>
          ))}
        </div>

        <div key={tab} className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[400px]">
          {tab === "analytics" && <GlobalAnalytics />}
          {tab === "users" && <UsersTab />}
          {tab === "subs" && <SubsTab />}
          {tab === "tickets" && <TicketsTab userId={user!.id} />}
          {tab === "sync" && <SyncTab />}
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  const reload = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*, stores(id, subdomain, status, is_active), subscriptions(id, status, plan), user_roles(role)");
    
    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setRows(data ?? []);
    }
    setLoading(false);
  };
  
  useEffect(() => { reload(); }, []);

  const filtered = rows.filter(r => 
    r.email?.toLowerCase().includes(search.toLowerCase()) || 
    r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    (r.stores && r.stores[0]?.subdomain?.toLowerCase().includes(search.toLowerCase()))
  );




  const toggleAdmin = async (userId: string, isAdmin: boolean) => {
    if (isAdmin) {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "superadmin");
    } else {
      await supabase.from("user_roles").insert({ user_id: userId, role: "superadmin" });
    }
    reload();
  };

  const deleteStore = async (storeId: string) => {
    if (!confirm("¿Seguro que querés eliminar esta tienda? Esta acción es irreversible.")) return;
    await supabase.from("stores").delete().eq("id", storeId);
    reload();
  };

  const toggleStoreStatus = async (storeId: string, current: string) => {
    const next = current === "active" ? "suspended" : "active";
    await supabase.from("stores").update({ status: next as any }).eq("id", storeId);
    reload();
  };

  if (loading && rows.length === 0) return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
        <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
      </div>
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] animate-pulse">CARGANDO BASE DE DATOS...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-ink font-bold">Gestión de Usuarios</h2>
          <p className="text-sm text-muted-foreground">Administra vendedores y permisos de acceso.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar vendedores..." 
              className="pl-11 pr-4 py-3 bg-white border border-border rounded-2xl text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none w-72 transition-all shadow-sm"
            />
          </div>
          <button onClick={reload} className="p-3 bg-white border border-border text-ink rounded-2xl hover:bg-secondary hover:text-primary transition-all shadow-sm active:scale-95">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
              <Th>Usuario</Th><Th>Tienda / Subdominio</Th><Th>Plan</Th><Th>Estado</Th><Th>Rol</Th><Th className="text-right">Acciones</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => {
                const isAdmin = (r.user_roles ?? []).some((x: any) => x.role === "superadmin");
                return (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-ink">{r.full_name || "Sin nombre"}</div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{(r.stores && r.stores[0]?.subdomain) ?? "-"}</td>
                    <td className="px-6 py-4 capitalize">{(r.subscriptions && r.subscriptions[0]?.plan) ?? "-"}</td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${r.subscriptions && r.subscriptions[0]?.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                         {(r.subscriptions && r.subscriptions[0]?.status) ?? "N/A"}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      {isAdmin ? <span className="px-2 py-1 bg-ink text-blush text-[10px] font-bold uppercase rounded-full">admin</span> : <span className="text-muted-foreground text-xs uppercase">vendedor</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => toggleAdmin(r.id, isAdmin)} className="text-xs font-bold text-primary hover:underline">
                          {isAdmin ? "Quitar admin" : "Hacer admin"}
                        </button>
                        {r.stores && r.stores[0] && (
                          <button onClick={() => toggleStoreStatus(r.stores[0].id, r.stores[0].status)} className="text-xs font-bold text-muted-foreground hover:underline">
                            {r.stores[0].status === "active" ? "Pausar" : "Activar"}
                          </button>
                        )}
                        {r.stores && r.stores[0] && (
                          <button onClick={() => deleteStore(r.stores[0].id)} className="text-xs font-bold text-destructive hover:underline">
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SubsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  const fetchSubs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*, profiles(email, full_name)")
      .order("created_at", { ascending: false });
    
    if (error) {
      const { data: simpleData } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });
      setRows(simpleData ?? []);
    } else {
      setRows(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSubs(); }, []);

  const filtered = rows.filter(r => 
    r.profiles?.email?.toLowerCase().includes(search.toLowerCase()) || 
    r.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  );


  if (loading && rows.length === 0) return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
        <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
      </div>
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] animate-pulse">CARGANDO BASE DE DATOS...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-ink font-bold">Suscripciones y Pagos</h2>
          <p className="text-sm text-muted-foreground">Gestiona la facturación y estados de licencia.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar facturación..." 
              className="pl-11 pr-4 py-3 bg-white border border-border rounded-2xl text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none w-72 transition-all shadow-sm"
            />
          </div>
          <button onClick={fetchSubs} className="p-3 bg-white border border-border text-ink rounded-2xl hover:bg-secondary hover:text-primary transition-all shadow-sm active:scale-95">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
              <Th>Usuario</Th><Th>Plan Actual</Th><Th>Estado Pago</Th><Th>Billing</Th><Th>Monto</Th><Th className="text-right">Gestión</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-ink">{r.profiles?.full_name || "Usuario"}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{r.profiles?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={r.plan} 
                      onChange={async (e) => {
                        const { error } = await supabase.from("subscriptions").update({ plan: e.target.value as any }).eq("id", r.id);
                        if (error) alert("Error: " + error.message);
                        else fetchSubs();
                      }}
                      className="bg-muted/50 border-none rounded-lg text-xs font-bold px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="free_mayorista">Free Mayorista</option>
                      <option value="basic">Plan Basic</option>
                      <option value="pro">Plan Pro</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={r.status} 
                      onChange={async (e) => {
                        const { error } = await supabase.from("subscriptions").update({ status: e.target.value as any }).eq("id", r.id);
                        if (error) alert("Error: " + error.message);
                        else fetchSubs();
                      }}
                      className={`border-none rounded-lg text-[10px] font-black uppercase px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 ${r.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                    >
                      <option value="active">ACTIVE</option>
                      <option value="grace">GRACE</option>
                      <option value="suspended">SUSPENDED</option>
                      <option value="cancelled">CANCELLED</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs font-medium">
                    {r.next_billing_date ? new Date(r.next_billing_date).toLocaleDateString() : "No programado"}
                  </td>
                  <td className="px-6 py-4 font-bold text-ink">S/ {Number(r.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground"><ExternalLink className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TicketsTab({ userId }: { userId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [plan, setPlan] = useState<"basic" | "pro" | "free_mayorista">("basic");
  const [days, setDays] = useState(30);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const reload = () => supabase.from("free_plan_tickets").select("*, used_profile:profiles!free_plan_tickets_used_by_fkey(email)").order("created_at", { ascending: false }).limit(50).then(({ data }) => setRows(data ?? []));
  useEffect(() => { reload(); }, []);

  const genCode = () => "KRIN-" + Math.random().toString(36).slice(2, 8).toUpperCase();

  const create = async () => {
    setCreating(true);
    const items = Array.from({ length: qty }, () => ({
      code: genCode(), plan, duration_days: days, notes: notes || null, created_by: userId,
    }));
    const { error } = await supabase.from("free_plan_tickets").insert(items);
    if (error) alert(error.message);
    setCreating(false);
    reload();
  };

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2rem] border border-border p-8 shadow-sm">
        <h3 className="font-display text-2xl text-ink mb-6 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl"><Plus className="w-6 h-6 text-primary" /></div>
          Generar Tickets de Acceso
        </h3>
        <div className="grid sm:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest pl-1">Plan</label>
            <select value={plan} onChange={(e) => setPlan(e.target.value as any)} className="w-full bg-muted/30 border-none rounded-xl text-sm font-bold p-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all">
              <option value="basic">Plan Basic</option>
              <option value="pro">Plan Pro</option>
              <option value="free_mayorista">Free Mayorista</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest pl-1">Días</label>
            <input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full bg-muted/30 border-none rounded-xl text-sm font-bold p-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest pl-1">Cantidad</label>
            <input type="number" min={1} max={50} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-full bg-muted/30 border-none rounded-xl text-sm font-bold p-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div className="flex items-end">
            <button onClick={create} disabled={creating} className="w-full py-3.5 bg-primary text-white rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all">
              {creating ? "Generando..." : "GENERAR CÓDIGOS"}
            </button>
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest pl-1">Nota Interna</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: Influencer Promo / Black Friday" className="w-full bg-muted/30 border-none rounded-xl text-sm font-bold p-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-6 py-4 text-left font-black">CÓDIGO</th>
                <th className="px-6 py-4 text-left font-black">PLAN</th>
                <th className="px-6 py-4 text-left font-black">DURACIÓN</th>
                <th className="px-6 py-4 text-left font-black">ESTADO</th>
                <th className="px-6 py-4 text-left font-black">CANJEADO POR</th>
                <th className="px-6 py-4 text-right font-black">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-muted-foreground font-medium">No hay tickets generados todavía.</td></tr>}
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <button onClick={() => copy(r.code)} className="font-mono text-xs flex items-center gap-2 font-black text-ink hover:text-primary group transition-colors">
                      {r.code}
                      {copied === r.code ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-ink/20 group-hover:text-primary" />}
                    </button>
                  </td>
                  <td className="px-6 py-4 uppercase text-[10px] font-black tracking-tighter">{r.plan.replace('_', ' ')}</td>
                  <td className="px-6 py-4 font-bold text-muted-foreground">{r.duration_days} días</td>
                  <td className="px-6 py-4">
                    {r.used_by ? 
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-[10px] font-bold uppercase rounded-full">Canjeado</span> : 
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-full border border-emerald-100">Disponible</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-muted-foreground">{r.used_profile?.email ?? "-"}</td>
                  <td className="px-6 py-4 text-right">
                    {!r.used_by && (
                      <button 
                        onClick={async () => {
                          if (confirm("¿Eliminar este ticket?")) {
                            await supabase.from("free_plan_tickets").delete().eq("id", r.id);
                            reload();
                          }
                        }}
                        className="text-xs font-bold text-destructive hover:underline"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SyncTab() {
  const [last, setLast] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = () => {
    supabase.from("krincesa_products_cache").select("last_synced_at", { count: "exact" }).order("last_synced_at", { ascending: false }).limit(1)
      .then(({ data, count }) => { setLast(data?.[0]?.last_synced_at ?? null); setCount(count ?? 0); });
  };
  useEffect(reload, []);

  const forceSync = async () => {
    setSyncing(true); setMsg(null);
    try {
      const res = await fetch("/api/public/sync-krincesa", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      setMsg(res.ok ? `Sincronización exitosa: ${data.count ?? "?"} productos.` : `Fallo: ${data.error ?? res.statusText}`);
      reload();
    } catch (e: any) {
      setMsg("Error de red: " + e.message);
    }
    setSyncing(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 text-center space-y-8">
      <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
        <RefreshCw className={`w-10 h-10 text-primary ${syncing ? "animate-spin" : ""}`} />
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-3xl text-ink font-bold">Catálogo Maestro</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">Sincroniza los productos oficiales de Krincesa con las tiendas de tus vendedoras.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
          <div className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">Caché Total</div>
          <div className="text-3xl font-display text-ink font-bold">{count}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
          <div className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">Última Sync</div>
          <div className="text-sm font-bold text-ink truncate px-2">{last ? new Date(last).toLocaleTimeString() : "Nunca"}</div>
        </div>
      </div>

      <button onClick={forceSync} disabled={syncing} className="w-full py-5 bg-ink text-white rounded-[2rem] font-bold text-lg shadow-2xl shadow-ink/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
        {syncing ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCw className="w-6 h-6" />}
        FORZAR SINCRONIZACIÓN MAESTRA
      </button>

      {msg && <div className={`p-4 rounded-2xl text-sm font-bold ${msg.includes('exitosa') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{msg}</div>}
      <p className="text-xs text-muted-foreground italic font-medium">El sistema se sincroniza automáticamente cada 60 minutos.</p>
    </div>
  );
}

function GlobalAnalytics() {
  const [data, setData] = useState({ 
    stores: 0, 
    events: 0, 
    activeStores: 0,
    recentEvents: [] as any[],
    topStores: [] as any[] 
  });
  
  useEffect(() => {
    (async () => {
      const [{ count: stores }, { count: events }, { count: active }, { data: recent }, { data: top }] = await Promise.all([
        supabase.from("stores").select("*", { count: "exact", head: true }),
        supabase.from("store_analytics").select("*", { count: "exact", head: true }),
        supabase.from("stores").select("*", { count: "exact", head: true }).eq('status', 'active'),
        supabase.from("store_analytics").select("*, stores(store_name)").order("created_at", { ascending: false }).limit(8),
        supabase.from("stores").select("subdomain, store_name, created_at").order("created_at", { ascending: false }).limit(10),
      ]);
      setData({ 
        stores: stores ?? 0, 
        events: events ?? 0, 
        activeStores: active ?? 0,
        recentEvents: recent ?? [],
        topStores: top ?? [] 
      });
    })();
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm group hover:border-primary/20 transition-all">
          <div className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em] mb-2 group-hover:text-primary transition-colors">Tiendas Totales</div>
          <div className="font-display text-5xl text-ink font-black">{data.stores}</div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
            <span className="p-1 bg-emerald-50 rounded-lg">↑ 12%</span>
            <span className="text-muted-foreground/60 font-medium">este mes</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm group hover:border-primary/20 transition-all">
          <div className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em] mb-2 group-hover:text-primary transition-colors">Eventos / Tráfico</div>
          <div className="font-display text-5xl text-ink font-black">{data.events}</div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-primary">
            <BarChart3 className="w-4 h-4" />
            <span className="font-medium">actividad en vivo</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm group hover:border-primary/20 transition-all">
          <div className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em] mb-2 group-hover:text-primary transition-colors">Estado Sistema</div>
          <div className="font-display text-2xl text-ink font-black uppercase">{data.activeStores} Activas</div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-medium uppercase tracking-widest">Sincronizado</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-ink">Actividad Reciente</h3>
            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg">Live</span>
          </div>
          <div className="divide-y divide-border">
            {data.recentEvents.map((e: any) => (
              <div key={e.id} className="p-4 hover:bg-muted/10 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${e.event_type === 'view' ? 'bg-primary' : 'bg-emerald-500'}`} />
                  <div>
                    <div className="text-xs font-bold text-ink uppercase tracking-tighter">
                      {e.event_type === 'view' ? 'Nueva Visita' : 'Intento Compra'}
                    </div>
                    <div className="text-[10px] font-medium text-muted-foreground">
                      en {e.stores?.store_name || "Tienda"}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-black text-muted-foreground group-hover:text-ink transition-colors">
                  {new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-ink">Nuevas Tiendas</h3>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="divide-y divide-border">
            {data.topStores.map((s: any) => (
              <div key={s.subdomain} className="p-4 hover:bg-muted/10 transition-colors flex items-center justify-between group">
                <div>
                  <div className="text-xs font-bold text-ink uppercase tracking-tighter">{s.store_name}</div>
                  <div className="text-[10px] font-medium text-primary underline">/s/{s.subdomain}</div>
                </div>
                <div className="text-[10px] font-black text-muted-foreground">
                  {new Date(s.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: any) { return <th className="px-6 py-4 text-left font-black text-muted-foreground uppercase tracking-widest text-[10px]">{children}</th>; }
function Td({ children, className = "" }: any) { return <td className={`px-6 py-4 ${className}`}>{children}</td>; }
