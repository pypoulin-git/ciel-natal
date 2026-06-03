"use client";

import { useTheme } from "@/lib/theme";
import { useLocale } from "@/lib/i18n";

/**
 * Dark / light theme toggle. Renders a sun (in dark mode → "switch to light")
 * or a moon (in light mode → "switch to dark"). Used in TopNav and Settings.
 *
 * `variant="icon"` = compact round button for the nav bar.
 * `variant="row"`  = full-width labelled row for the Settings page.
 */
export default function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "row" }) {
  const { theme, toggleTheme } = useTheme();
  const { locale } = useLocale();
  const isDark = theme === "dark";
  const label = (fr: string, en: string) => (locale === "fr" ? fr : en);

  const nextLabel = isDark
    ? label("Passer en mode clair", "Switch to light mode")
    : label("Passer en mode sombre", "Switch to dark mode");

  const SunIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.9" y1="4.9" x2="7" y2="7" />
      <line x1="17" y1="17" x2="19.1" y2="19.1" />
      <line x1="4.9" y1="19.1" x2="7" y2="17" />
      <line x1="17" y1="7" x2="19.1" y2="4.9" />
    </svg>
  );

  const MoonIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );

  if (variant === "row") {
    return (
      <button
        onClick={toggleTheme}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[var(--color-glass-border)] bg-white/[0.02] hover:bg-white/5 transition text-left"
        aria-label={nextLabel}
      >
        <span className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--color-accent-lavender)]/12 text-[var(--color-accent-lavender)]">
            {isDark ? MoonIcon : SunIcon}
          </span>
          <span>
            <span className="block text-sm text-[var(--color-text-primary)]">
              {label("Apparence", "Appearance")}
            </span>
            <span className="block text-xs text-[var(--color-text-secondary)]">
              {isDark ? label("Mode sombre", "Dark mode") : label("Mode clair", "Light mode")}
            </span>
          </span>
        </span>
        {/* Pill switch */}
        <span
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isDark ? "bg-[var(--color-accent-lavender)]/25" : "bg-[var(--color-accent-gold)]/35"
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-[var(--color-accent-lavender)] transition-transform ${
              isDark ? "translate-x-0.5" : "translate-x-[26px]"
            }`}
          />
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-accent-lavender)] hover:bg-white/5 transition"
      aria-label={nextLabel}
      title={nextLabel}
    >
      {isDark ? SunIcon : MoonIcon}
    </button>
  );
}
