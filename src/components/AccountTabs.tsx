"use client";

import Link from "next/link";

export type AccountTab = "home" | "lectures" | "preferences" | "settings";

// "Paramètres" a été fusionné dans "Mon compte" — plus d'onglet dédié.
const TABS: { key: AccountTab; fr: string; en: string; href: string }[] = [
  { key: "home", fr: "Mon compte", en: "My account", href: "/mon-compte" },
  { key: "lectures", fr: "Mes cartes natales", en: "My natal charts", href: "/mon-compte/lectures" },
  { key: "preferences", fr: "Préférences", en: "Preferences", href: "/mon-compte/preferences" },
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
