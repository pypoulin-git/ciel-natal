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
          <stop offset="0%" stopColor="#fffdf6" />
          <stop offset="60%" stopColor="#f0e9ff" />
          <stop offset="100%" stopColor="#cdc1ee" />
        </radialGradient>
        <clipPath id={cid}>
          <circle cx={r} cy={r} r={r} />
        </clipPath>
      </defs>
      <circle cx={r} cy={r} r={r} fill={`url(#${gid})`} />
      <circle cx={cx} cy={r} r={r} fill="var(--color-space-deep)" clipPath={`url(#${cid})`} />
      <circle cx={r} cy={r} r={r - 0.5} fill="none" stroke="rgba(224,169,78,0.45)" />
    </svg>
  )
}
