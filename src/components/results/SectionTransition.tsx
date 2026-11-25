"use client";

interface Props {
  text: string;
  symbol?: string;
}

export default function SectionTransition({ text, symbol = "✦" }: Props) {
  return (
    <div className="flex items-center gap-4 py-6 px-2">
      <div className="flex-1 min-w-4 h-px bg-gradient-to-r from-transparent via-[var(--color-accent-lavender)]/15 to-transparent" />
      {/* min-w-0 (not flex-shrink-0): the text wraps instead of pushing the
          page 28 px wider than a 390 px screen (QA 2026-11). */}
      <div className="flex items-center gap-2 min-w-0 shrink">
        <span className="text-[var(--color-accent-lavender)] opacity-30 text-sm">{symbol}</span>
        <p className="text-sm text-[var(--color-text-secondary)] italic max-w-xs min-w-0 text-center leading-relaxed opacity-80">
          {text}
        </p>
        <span className="text-[var(--color-accent-lavender)] opacity-30 text-sm">{symbol}</span>
      </div>
      <div className="flex-1 min-w-4 h-px bg-gradient-to-r from-transparent via-[var(--color-accent-lavender)]/15 to-transparent" />
    </div>
  );
}
