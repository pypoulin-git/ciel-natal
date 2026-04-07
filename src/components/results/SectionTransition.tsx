"use client";

interface Props {
  text: string;
  symbol?: string;
}

export default function SectionTransition({ text, symbol = "✦" }: Props) {
  return (
    <div className="flex items-center gap-4 py-6 px-2">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--color-accent-lavender)]/15 to-transparent" />
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[var(--color-accent-lavender)] opacity-30 text-sm">{symbol}</span>
        <p className="text-sm text-[var(--color-text-secondary)] italic max-w-xs text-center leading-relaxed opacity-70">
          {text}
        </p>
        <span className="text-[var(--color-accent-lavender)] opacity-30 text-sm">{symbol}</span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--color-accent-lavender)]/15 to-transparent" />
    </div>
  );
}
