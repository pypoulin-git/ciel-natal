"use client";

import { useLocale } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  const nextLocale = locale === "fr" ? "en" : "fr";

  return (
    <button
      onClick={() => setLocale(nextLocale)}
      className="flex items-center gap-0 rounded-full overflow-hidden text-xs font-semibold"
      style={{
        background: "var(--color-space-deep)",
        border: "1px solid var(--color-glass-border)",
      }}
      aria-label={locale === "fr" ? "Switch to English" : "Passer en français"}
    >
      <span
        className="px-2.5 py-1.5 transition-all duration-200"
        style={{
          background:
            locale === "fr" ? "var(--color-accent-lavender)" : "transparent",
          color:
            locale === "fr"
              ? "var(--color-space-deep)"
              : "var(--color-text-primary)",
        }}
      >
        FR
      </span>
      <span
        className="px-2.5 py-1.5 transition-all duration-200"
        style={{
          background:
            locale === "en" ? "var(--color-accent-lavender)" : "transparent",
          color:
            locale === "en"
              ? "var(--color-space-deep)"
              : "var(--color-text-primary)",
        }}
      >
        EN
      </span>
    </button>
  );
}
