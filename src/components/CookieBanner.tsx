"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/lib/i18n";

type ConsentPrefs = {
  essential: true;
  analytics: boolean;
  timestamp: number;
};

const STORAGE_KEY = "ciel-natal-cookie-consent-v2";

export function getConsent(): ConsentPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentPrefs;
  } catch {
    return null;
  }
}

export default function CookieBanner() {
  const { locale } = useLocale();
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    if (!getConsent()) setVisible(true);
  }, []);

  const save = (prefs: Omit<ConsentPrefs, "essential" | "timestamp">) => {
    const payload: ConsentPrefs = {
      essential: true,
      analytics: prefs.analytics,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setVisible(false);
  };

  const acceptAll = () => save({ analytics: true });
  const declineAll = () => save({ analytics: false });
  const savePrefs = () => save({ analytics });

  if (!visible) return null;

  const t = {
    title: locale === "fr" ? "Respect de ta vie privée" : "Your privacy matters",
    message: locale === "fr"
      ? "Nous utilisons des cookies essentiels pour le fonctionnement du site, et des cookies d'analyse anonyme pour l'améliorer."
      : "We use essential cookies to run the site, and anonymous analytics cookies to improve it.",
    essential: locale === "fr" ? "Essentiels" : "Essential",
    essentialDesc: locale === "fr" ? "Nécessaires (session, préférences)" : "Required (session, preferences)",
    always: locale === "fr" ? "Toujours actifs" : "Always on",
    analytics: locale === "fr" ? "Analyse anonyme" : "Anonymous analytics",
    analyticsDesc: locale === "fr" ? "Vercel Analytics, sans identifiant personnel" : "Vercel Analytics, no personal identifier",
    customize: locale === "fr" ? "Personnaliser" : "Customize",
    decline: locale === "fr" ? "Refuser" : "Decline",
    accept: locale === "fr" ? "Tout accepter" : "Accept all",
    save: locale === "fr" ? "Enregistrer mes choix" : "Save my choices",
  };

  return (
    <div
      role="dialog"
      aria-label={t.title}
      aria-modal="false"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up"
    >
      <div className="max-w-xl mx-auto glass px-5 py-4">
        {!showDetails ? (
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <p className="text-xs text-[var(--color-text-secondary)] flex-1 text-center sm:text-left">
              {t.message}
            </p>
            <div className="flex flex-wrap gap-2 shrink-0 justify-center">
              <button
                onClick={() => setShowDetails(true)}
                className="btn-ghost text-xs px-3 py-2 min-h-[40px]"
              >
                {t.customize}
              </button>
              <button
                onClick={declineAll}
                className="btn-ghost text-xs px-3 py-2 min-h-[40px]"
              >
                {t.decline}
              </button>
              <button
                onClick={acceptAll}
                className="btn-primary text-xs px-3 py-2 min-h-[40px]"
              >
                {t.accept}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-primary)]">{t.title}</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">{t.message}</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                aria-label={locale === "fr" ? "Fermer" : "Close"}
                className="flex-shrink-0 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] p-1"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="rounded-lg border border-[var(--color-glass-border)] p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--color-text-primary)]">{t.essential}</p>
                <p className="text-[11px] text-[var(--color-text-secondary)]">{t.essentialDesc}</p>
              </div>
              <span className="text-[11px] text-[var(--color-accent-lavender)] opacity-80 flex-shrink-0">
                {t.always}
              </span>
            </div>

            <label className="rounded-lg border border-[var(--color-glass-border)] p-3 flex items-center justify-between gap-3 cursor-pointer">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--color-text-primary)]">{t.analytics}</p>
                <p className="text-[11px] text-[var(--color-text-secondary)]">{t.analyticsDesc}</p>
              </div>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="w-5 h-5 flex-shrink-0 accent-[var(--color-accent-lavender)] cursor-pointer"
                aria-label={t.analytics}
              />
            </label>

            <div className="flex flex-wrap gap-2 justify-end pt-1">
              <button onClick={declineAll} className="btn-ghost text-xs px-3 py-2 min-h-[40px]">
                {t.decline}
              </button>
              <button onClick={savePrefs} className="btn-primary text-xs px-3 py-2 min-h-[40px]">
                {t.save}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
