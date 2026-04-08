"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";
import Starfield from "@/components/Starfield";

export default function PremiumSuccessPage() {
  const { locale } = useLocale();
  const { refreshProfile, isPremium } = useAuth();

  // Refresh the auth context to pick up the premium status
  useEffect(() => {
    const timer = setTimeout(() => refreshProfile(), 1500);
    return () => clearTimeout(timer);
  }, [refreshProfile]);

  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="glass p-8 sm:p-10 max-w-sm text-center glow-rose animate-scale-in">
          <div className="text-4xl mb-4">✦</div>
          <h1 className="font-cinzel text-2xl text-[var(--color-text-primary)] mb-3">
            {locale === "fr" ? "Bienvenue dans Premium !" : "Welcome to Premium!"}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
            {locale === "fr"
              ? "Toutes les fonctionnalités sont maintenant débloquées. Profite de ta carte du ciel dans toute sa richesse."
              : "All features are now unlocked. Enjoy your birth chart in all its richness."}
          </p>

          {isPremium && (
            <span className="inline-flex items-center gap-1 text-sm text-[var(--color-accent-rose)] mb-4">
              <span>✦</span> Premium {locale === "fr" ? "activé" : "activated"}
            </span>
          )}

          <div className="flex flex-col gap-3 mt-4">
            <a
              href="/"
              className="btn-primary py-3 rounded-xl text-sm text-center"
              style={{ background: "linear-gradient(135deg, var(--color-accent-rose), #a06080)" }}
            >
              {locale === "fr" ? "Explorer ma carte ✦" : "Explore my chart ✦"}
            </a>
            <a
              href="/premium"
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent-lavender)] transition"
            >
              {locale === "fr" ? "Voir les fonctionnalités premium" : "See premium features"}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
