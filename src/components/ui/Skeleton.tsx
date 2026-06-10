/**
 * Lightweight loading skeleton — pulsing placeholder lines.
 * Pure Tailwind (animate-pulse), no dependency. Use while AI text streams in
 * so the wait reads as "content arriving" rather than a bare spinner.
 */
export default function Skeleton({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div
      className={`space-y-2.5 animate-pulse ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3.5 rounded bg-[var(--color-text-secondary)]/15"
          // Last line is shorter, like a real paragraph ending.
          style={{ width: i === lines - 1 ? "70%" : "100%" }}
        />
      ))}
      <span className="sr-only">Chargement…</span>
    </div>
  );
}
