// Self-contained SVG hero illustrations for blog articles — no external images
// (no CSP/hosting concerns), fully theme-aware via CSS vars. One variant per
// article theme. Used both as the wide banner on an article and as a thumbnail
// on the blog index.

export type HeroVariant =
  | 'moon'
  | 'orbits'
  | 'constellation'
  | 'saturn'
  | 'sun'
  | 'wheel'
  | 'aspects'

const GOLD = 'var(--color-accent-gold)'
const LAV = 'var(--color-accent-lavender)'

function Stars({ seed = 0 }: { seed?: number }) {
  // Deterministic pseudo-stars (no Math.random → stable SSR).
  const pts = Array.from({ length: 14 }, (_, i) => {
    const x = (((i * 53 + seed * 17) % 100) + ((i * 7) % 5)) % 100
    const y = (((i * 31 + seed * 29) % 60) + 6)
    const r = 0.4 + ((i * 13 + seed) % 3) * 0.3
    return { x, y, r, o: 0.3 + ((i * 11) % 5) * 0.12 }
  })
  return (
    <g>
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="var(--color-text-primary)" opacity={p.o} />
      ))}
    </g>
  )
}

function Scene({ variant }: { variant: HeroVariant }) {
  switch (variant) {
    case 'moon':
      return (
        <g>
          <Stars seed={1} />
          <defs>
            <radialGradient id="bh-moon" cx="42%" cy="38%" r="70%">
              <stop offset="0%" stopColor="#fff6de" />
              <stop offset="70%" stopColor={LAV} />
              <stop offset="100%" stopColor="color-mix(in srgb, var(--color-accent-lavender) 40%, transparent)" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="33" r="15" fill="url(#bh-moon)" />
          <circle cx="55" cy="30" r="14" fill="var(--color-space-deep)" />
        </g>
      )
    case 'saturn':
      return (
        <g>
          <Stars seed={2} />
          <circle cx="50" cy="32" r="11" fill={GOLD} opacity="0.9" />
          <ellipse cx="50" cy="32" rx="22" ry="6" fill="none" stroke={GOLD} strokeWidth="1.4" transform="rotate(-18 50 32)" />
          <ellipse cx="50" cy="32" rx="18" ry="4.6" fill="none" stroke={LAV} strokeWidth="0.8" opacity="0.7" transform="rotate(-18 50 32)" />
        </g>
      )
    case 'sun':
      return (
        <g>
          <Stars seed={3} />
          <circle cx="50" cy="33" r="10" fill={GOLD} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * 30 * Math.PI) / 180
            return (
              <line
                key={i}
                x1={50 + Math.cos(a) * 14}
                y1={33 + Math.sin(a) * 14}
                x2={50 + Math.cos(a) * 20}
                y2={33 + Math.sin(a) * 20}
                stroke={GOLD}
                strokeWidth="1.2"
                opacity="0.8"
                strokeLinecap="round"
              />
            )
          })}
        </g>
      )
    case 'orbits':
      return (
        <g>
          <Stars seed={4} />
          <circle cx="50" cy="33" r="4.5" fill={GOLD} />
          {[10, 17, 24].map((r, i) => (
            <ellipse key={i} cx="50" cy="33" rx={r} ry={r * 0.42} fill="none" stroke={i === 1 ? LAV : 'var(--color-glass-border)'} strokeWidth="0.8" />
          ))}
          <circle cx="67" cy="33" r="2.4" fill={LAV} />
          <circle cx="38" cy="28" r="1.8" fill={GOLD} opacity="0.8" />
        </g>
      )
    case 'constellation':
      return (
        <g>
          <Stars seed={5} />
          <polyline
            points="24,40 38,22 52,34 66,20 78,38"
            fill="none"
            stroke={LAV}
            strokeWidth="0.7"
            opacity="0.6"
          />
          {[[24, 40], [38, 22], [52, 34], [66, 20], [78, 38]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 2 ? 1.6 : 2.4} fill={i % 2 ? LAV : GOLD} />
          ))}
        </g>
      )
    case 'wheel':
      return (
        <g>
          <Stars seed={6} />
          <circle cx="50" cy="33" r="18" fill="none" stroke={LAV} strokeWidth="0.8" opacity="0.7" />
          <circle cx="50" cy="33" r="12" fill="none" stroke="var(--color-glass-border)" strokeWidth="0.6" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * 30 * Math.PI) / 180
            return (
              <line
                key={i}
                x1={50 + Math.cos(a) * 12}
                y1={33 + Math.sin(a) * 12}
                x2={50 + Math.cos(a) * 18}
                y2={33 + Math.sin(a) * 18}
                stroke={i % 3 === 0 ? GOLD : 'var(--color-glass-border)'}
                strokeWidth="0.7"
              />
            )
          })}
          <circle cx="50" cy="33" r="2.4" fill={GOLD} />
        </g>
      )
    case 'aspects':
      return (
        <g>
          <Stars seed={7} />
          <circle cx="50" cy="33" r="17" fill="none" stroke="var(--color-glass-border)" strokeWidth="0.7" />
          <polygon points="50,17 66,42 34,42" fill="none" stroke={LAV} strokeWidth="0.9" opacity="0.8" />
          <line x1="34" y1="24" x2="66" y2="24" stroke={GOLD} strokeWidth="0.8" opacity="0.7" />
          {[[50, 17], [66, 42], [34, 42], [34, 24], [66, 24]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2" fill={i < 3 ? LAV : GOLD} />
          ))}
        </g>
      )
  }
}

export default function ArticleHero({
  variant,
  className = '',
  rounded = 'rounded-2xl',
}: {
  variant: HeroVariant
  className?: string
  rounded?: string
}) {
  return (
    <div
      className={`relative overflow-hidden ${rounded} ${className}`}
      style={{
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--color-accent-lavender) 14%, transparent), transparent 60%), radial-gradient(ellipse at 70% 120%, color-mix(in srgb, var(--color-accent-gold) 12%, transparent), transparent 60%), var(--color-space-card)',
        borderBottom: '1px solid var(--color-glass-border)',
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 66" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
        <Scene variant={variant} />
      </svg>
    </div>
  )
}
