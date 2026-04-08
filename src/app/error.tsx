"use client";

import Starfield from "@/components/Starfield";
import { useLocale } from "@/lib/i18n";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useLocale();

  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="glass p-8 sm:p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[var(--color-accent-lavender)]/10 border border-[var(--color-accent-lavender)]/20 flex items-center justify-center">
            <svg width="24" height="24" fill="none" stroke="var(--color-accent-lavender)" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="font-cinzel text-2xl text-[var(--color-text-primary)] mb-3">
            {locale === "fr" ? "Oups, une erreur" : "Oops, an error"}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
            {locale === "fr"
              ? "Quelque chose ne s'est pas passe comme prevu. Les etoiles se realigneront bientot."
              : "Something didn't go as planned. The stars will realign soon."}
          </p>
          {error.digest && (
            <p className="text-xs text-[var(--color-text-secondary)] opacity-40 font-mono mb-4">
              {error.digest}
            </p>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={reset}
              className="btn-primary px-6 py-3 rounded-xl text-sm"
            >
              {locale === "fr" ? "Reessayer" : "Try again"}
            </button>
            <a href="/" className="btn-ghost px-6 py-3 rounded-xl text-sm">
              {locale === "fr" ? "Retour a l'accueil" : "Back to home"}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
