import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/use-auth";

const searchSchema = z.object({
  mode: z.enum(["login", "signup"]).optional(),
  next: z.string().optional(),
});

function safeNext(next: string | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

export const Route = createFileRoute("/auth")({
  component: Auth,
  validateSearch: searchSchema,
});

function Auth() {
  const { mode: initialMode, next } = Route.useSearch();
  const [mode, setMode] = useState<"login" | "signup">(initialMode === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const nextPath = safeNext(next);

  useEffect(() => {
    if (!authLoading && user) {
      if (nextPath) {
        window.location.href = nextPath;
        return;
      }
      supabase.from("stores").select("id").eq("user_id", user.id).maybeSingle().then(({ data }) => {
        navigate({ to: data ? "/dashboard" : "/onboarding" });
      });
    }
  }, [user, authLoading, navigate, nextPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}${nextPath ?? "/onboarding"}`,
          },
        });
        if (error) throw error;
        // Si auto-confirm está off, mostrar mensaje
        const { data: sess } = await supabase.auth.getSession();
        if (sess.session) navigate({ to: "/onboarding" });
        else setError("Revisa tu email para confirmar la cuenta.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: any) {
      setError(e.message ?? "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    const authReturn = `${window.location.origin}/auth${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`;
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: authReturn,
    });
    if (result.error) setError("No se pudo iniciar con Google");
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary via-accent to-blush items-center justify-center p-12">
        <div className="max-w-md">
          <Logo />
          <h2 className="mt-12 font-display text-4xl text-ink leading-tight">
            Tu marca.<br />Tu estilo.<br /><span className="italic text-rose-deep">Tu tienda.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Únete a cientos de revendedoras que ya venden con KrinStore.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8"><Logo /></div>
          <h1 className="font-display text-3xl text-ink">{mode === "signup" ? "Crear cuenta" : "Bienvenida de nuevo"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signup" ? "Tu tienda a un paso de existir." : "Iniciá sesión para gestionar tu tienda."}
          </p>

          <button
            onClick={handleGoogle}
            type="button"
            className="mt-8 w-full px-4 py-3 border border-border bg-card rounded-full font-medium hover:bg-muted transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuar con Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> o con email <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <input
                required
                placeholder="Nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
            <input
              required
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              required
              type="password"
              minLength={6}
              placeholder="Contraseña (mín. 6)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? "Cargando..." : mode === "signup" ? "Crear cuenta" : "Iniciar sesión"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-muted-foreground">
            {mode === "signup" ? "¿Ya tenés cuenta?" : "¿Sos nueva acá?"}{" "}
            <button onClick={() => setMode(mode === "signup" ? "login" : "signup")} className="text-rose-deep font-medium hover:underline">
              {mode === "signup" ? "Iniciá sesión" : "Creá tu tienda"}
            </button>
          </p>
          <p className="mt-4 text-center"><Link to="/" className="text-xs text-muted-foreground hover:underline">← Volver al inicio</Link></p>
        </div>
      </div>
    </div>
  );
}
