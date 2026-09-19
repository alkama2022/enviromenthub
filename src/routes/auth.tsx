import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { ReadAloud } from "@/components/voice-input";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in | TerraLens" },
      { name: "description", content: "Sign in to TerraLens to sync saved locations and reports." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    return (
      <div id="main-content" className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">{t("auth.signedInAs", { email: user.email ?? "" })}</p>
        <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">{t("auth.signOut")}</button>
        <Link to="/" className="ml-2 text-sm text-primary hover:underline">{t("auth.goHome")}</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg("Check your email to confirm your account. Then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="main-content" className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold">{mode === "signin" ? t("auth.signIn") : t("auth.createAccount")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("auth.subtitle")}</p>
      <div className="mt-2"><ReadAloud text={`${mode === "signin" ? t("auth.signIn") : t("auth.createAccount")} ${t("auth.subtitle")}`} /></div>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <label className="block text-xs font-medium text-muted-foreground">
          {t("auth.email")}
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="you@example.com" />
        </label>
        <label className="block text-xs font-medium text-muted-foreground">
          {t("auth.password")}
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="••••••••" minLength={6} />
        </label>
        {msg && <p className="rounded-md bg-muted px-3 py-2 text-xs text-foreground">{msg}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 hover:bg-primary/90">
          {loading ? t("auth.pleaseWait") : mode === "signin" ? t("auth.signIn") : t("auth.createAccount")}
        </button>
        <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="w-full text-xs text-primary hover:underline">
          {mode === "signin" ? t("auth.needAccount") : t("auth.haveAccount")}
        </button>
      </form>
    </div>
  );
}
