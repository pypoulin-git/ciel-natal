"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";

export default function AuthButton() {
  const { user, isPremium, loading, signOut } = useAuth();
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) return null;

  if (!user) {
    return (
      <a
        href="/connexion"
        className="fixed top-3 right-14 z-50 text-xs px-4 py-2 rounded-full border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] backdrop-blur-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent-lavender)]/30 transition-all"
      >
        {locale === "fr" ? "Connexion" : "Sign in"}
      </a>
    );
  }

  const initial = (user.user_metadata?.display_name || user.email || "U").charAt(0).toUpperCase();

  return (
    <div ref={ref} className="fixed top-3 right-14 z-50">
      <button
        onClick={() => setOpen(!open)}
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all border ${
          isPremium
            ? "bg-[var(--color-accent-rose)]/20 border-[var(--color-accent-rose)]/40 text-[var(--color-accent-rose)]"
            : "bg-[var(--color-glass-bg)] border-[var(--color-glass-border)] text-[var(--color-text-secondary)]"
        } hover:scale-105`}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 glass-modal p-2 animate-scale-in">
          <div className="px-3 py-2 border-b border-white/5 mb-1">
            <p className="text-xs text-[var(--color-text-primary)] truncate">{user.email}</p>
            {isPremium && (
              <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-accent-rose)] mt-0.5">
                <span>✦</span> Premium
              </span>
            )}
          </div>

          <a href="/mon-compte" className="block w-full text-left px-3 py-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5 rounded-lg transition">
            {locale === "fr" ? "Mon compte" : "My account"}
          </a>

          {!isPremium && (
            <a href="/premium" className="block w-full text-left px-3 py-2 text-xs text-[var(--color-accent-rose)] hover:bg-[var(--color-accent-rose)]/5 rounded-lg transition">
              {locale === "fr" ? "Passer Premium ✦" : "Go Premium ✦"}
            </a>
          )}

          <button
            onClick={() => { signOut(); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-xs text-[var(--color-text-secondary)] hover:text-red-400 hover:bg-white/5 rounded-lg transition mt-1 border-t border-white/5 pt-2"
          >
            {locale === "fr" ? "Déconnexion" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
