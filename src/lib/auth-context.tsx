"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  isPremium: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isPremium: false,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  getAccessToken: async () => null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabaseReady = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  // Singleton-backed: this is safe to call anywhere.
  const supabase = supabaseReady ? createClient() : null;

  // Cache last user id to skip redundant profile fetches.
  const lastProfileFetchRef = useRef<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return;
    if (lastProfileFetchRef.current === userId) return;
    lastProfileFetchRef.current = userId;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", userId)
        .single();
      setIsPremium(data?.is_premium ?? false);
    } catch {
      // Profile row may not exist yet for a brand-new signup (trigger race)
      setIsPremium(false);
    }
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      lastProfileFetchRef.current = null; // force refetch
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let cancelled = false;

    // ── Safety: never keep `loading` true forever ──
    // If the auth lock or network misbehaves, unblock the UI after 4s
    // so /mon-compte and TopNav can at least render anonymous fallbacks.
    const safetyTimeout = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 4000);

    // Get initial session (getSession is cheaper than getUser — no JWT round-trip)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
      setLoading(false);
      clearTimeout(safetyTimeout);
    });

    // Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (cancelled) return;
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          fetchProfile(u.id);
        } else {
          setIsPremium(false);
          lastProfileFetchRef.current = null;
        }
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setIsPremium(false);
  }, [supabase]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token ?? null;
  }, [supabase]);

  const value = useMemo(
    () => ({ user, isPremium, loading, signOut, refreshProfile, getAccessToken }),
    [user, isPremium, loading, signOut, refreshProfile, getAccessToken]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
