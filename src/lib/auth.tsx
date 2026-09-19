import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({ user: null, session: null, loading: true, signOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (cancelled) return;
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Sync favorites to DB when user logs in: merge localStorage into saved_locations
  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    const raw = localStorage.getItem("terralens:favorites");
    if (!raw) return;
    try {
      const slugs: string[] = JSON.parse(raw);
      if (!Array.isArray(slugs) || slugs.length === 0) return;
      // Fire-and-forget upsert, ignore errors (table may not exist yet)
      (async () => {
        for (const slug of slugs) {
          try {
            await supabase.from("saved_locations" as never).upsert({ user_id: user.id, slug } as never);
          } catch {
            // ignore
          }
        }
      })();
    } catch {
      // ignore
    }
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return <Ctx.Provider value={{ user, session, loading, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
