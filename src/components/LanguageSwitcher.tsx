"use client";

import { useLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

const locales: Locale[] = ["fr", "en"];

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className="fixed top-4 right-4 z-50 flex items-center gap-0.5 rounded-full px-1 py-0.5"
      style={{
        background: "var(--color-glass-bg)",
        border: "1px solid var(--color-glass-border)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className="rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200"
          style={{
            background:
              locale === l ? "var(--color-accent-lavender)" : "transparent",
            color:
              locale === l
                ? "var(--color-space-deep)"
                : "var(--color-text-secondary)",
          }}
          aria-label={`Switch to ${l === "fr" ? "French" : "English"}`}
          aria-pressed={locale === l}
        >
          {t(`lang.${l}`)}
        </button>
      ))}
    </div>
  );
}
