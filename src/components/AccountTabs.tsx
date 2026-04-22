"use client";

import Link from "next/link";

export type AccountTab = "home" | "lectures" | "preferences" | "settings";

const TABS: { key: AccountTab; fr: string; en: string; href: string }[] = [
  { key: "home", fr: "Aperçu", en: "Overview", href: "/mon-compte" },
  { key: "lectures", fr: "Mes lectures", en: "My readings", href: "/mon-compte/lectures" },
  { key: "preferences", fr: "Préférences", en: "Preferences", href: "/mon-compte/preferences" },
  { key: "settings", fr: "Paramètres", en: "Settings", href: "/mon-compte/settings" },
];

export default function AccountTabs({
  current,
  locale,
}: {
  current: AccountTab;
  locale: string;
}) {
  return (
    <nav
      className="flex flex-wrap gap-1 mb-8 border-b border-[var(--color-glass-border)] -mx-1"
      aria-label="Account tabs"
    >
      {TABS.map((t) => {
        const active = t.key === current;
        return (
          <Link
            key={t.key}
            href={t.href}
            className={`px-3 py-2 text-xs rounded-t-lg transition-all ${
              active
                ? "text-[var(--color-accent-lavender)] border-b-2 border-[var(--color-accent-lavender)] -mb-px"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border-b-2 border-transparent"
            }`}
          >
            {locale === "fr" ? t.fr : t.en}
          </Link>
        );
      })}
    </nav>
  );
}
