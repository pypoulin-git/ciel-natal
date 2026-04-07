"use client";

import { useLocale } from "@/lib/i18n";

interface Props {
  small?: boolean;
}

export default function PremiumBadge({ small = false }: Props) {
  const { locale } = useLocale();

  if (small) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[9px] text-[var(--color-accent-rose)] opacity-70">
        <span>✦</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/20 text-[var(--color-accent-rose)]">
      <span>✦</span> Premium
    </span>
  );
}
