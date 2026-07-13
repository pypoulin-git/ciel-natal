// SVG Moon-phase glyph. The lit disc is masked by a same-radius shadow circle
// whose horizontal offset tracks the Sun→Moon elongation (`angle`, 0..360),
// yielding correct crescent / quarter / gibbous shapes. Shared by the homepage
// "sky today" panel and the celestial calendar.
export default function MoonGlyph({
  angle,
  size = 88,
  idSuffix = '',
}: {
  angle: number
  size?: number
  idSuffix?: string
}) {
  const r = size / 2
  const a = ((angle % 360) + 360) % 360
  const k = (1 - Math.cos((a * Math.PI) / 180)) / 2 // illuminated fraction 0..1
  const waxing = a <= 180
  const cx = r + (waxing ? -1 : 1) * 2 * r * k
  const gid = `moon-lit-${idSuffix}`
  const cid = `moon-disc-${idSuffix}`

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <defs>
        <radialGradient id={gid} cx="38%" cy="34%" r="78%">
          {/* Theme vars (globals.css): near-white moon in dark mode, golden
              moon in light mode so it stays visible on the pale sky. */}
          <stop offset="0%" stopColor="var(--moon-lit-core)" />
          <stop offset="60%" stopColor="var(--moon-lit-mid)" />
          <stop offset="100%" stopColor="var(--moon-lit-edge)" />
        </radialGradient>
        <clipPath id={cid}>
          <circle cx={r} cy={r} r={r} />
        </clipPath>
      </defs>
      <circle cx={r} cy={r} r={r} fill={`url(#${gid})`} />
      <circle cx={cx} cy={r} r={r} fill="var(--moon-shadow)" clipPath={`url(#${cid})`} />
      <circle cx={r} cy={r} r={r - 0.5} fill="none" stroke="var(--moon-ring)" />
    </svg>
  )
}
