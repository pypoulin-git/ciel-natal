"use client";

import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";

interface Props {
  children: React.ReactNode;
  /** Short preview text to show free users (if not using blur) */
  preview?: React.ReactNode;
  /** Use blur effect instead of hiding content entirely */
  blur?: boolean;
  /** Compact variant (inline CTA) */
  compact?: boolean;
}

export default function PremiumGate({ children, preview, blur = true, compact = false }: Props) {
  const { isPremium, user, loading } = useAuth();
  const { locale } = useLocale();

  if (loading) return null;
  if (isPremium) return <>{children}</>;

  if (compact) {
    return (
      <div className="relative">
        {preview || (blur && (
          <div className="pointer-events-none select-none" style={{ maskImage: "linear-gradient(to bottom, black 20%, transparent 90%)", WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent 90%)" }}>
            {children}
          </div>
        ))}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-[var(--color-accent-rose)]">✦</span>
          <a
            href={user ? "/premium" : "/connexion"}
            className="text-xs text-[var(--color-accent-rose)] hover:underline transition"
          >
            {locale === "fr" ? "Débloque avec Premium" : "Unlock with Premium"}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Blurred/faded preview */}
      {(preview || blur) && (
        <div
          className="pointer-events-none select-none"
          style={blur ? {
            maskImage: "linear-gradient(to bottom, black 30%, transparent 95%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 95%)",
          } : undefined}
        >
          {preview || children}
        </div>
      )}

      {/* CTA overlay */}
      <div className="relative -mt-16 pt-8 pb-2 flex flex-col items-center justify-center text-center">
        <div className="glass p-5 sm:p-6 max-w-xs mx-auto glow-rose">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/20 flex items-center justify-center">
            <svg width="18" height="18" fill="none" stroke="var(--color-accent-rose)" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
            {locale === "fr" ? "Contenu Premium" : "Premium Content"}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mb-4">
            {locale === "fr"
              ? "Débloque les interprétations complètes pour 9,99$ CAD."
              : "Unlock full interpretations for $9.99 CAD."}
          </p>
          <a
            href={user ? "/premium" : "/connexion"}
            className="inline-block btn-primary px-6 py-2.5 rounded-xl text-xs"
            style={{ background: "linear-gradient(135deg, var(--color-accent-rose), #a06080)" }}
          >
            {user
              ? (locale === "fr" ? "Passer Premium ✦" : "Go Premium ✦")
              : (locale === "fr" ? "Connecte-toi" : "Sign in")}
          </a>
        </div>
      </div>
    </div>
  );
}
