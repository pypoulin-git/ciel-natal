'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n'

// Icons — small, line-style, inherit currentColor.
const ico = {
  width: 22,
  height: 22,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  viewBox: '0 0 24 24',
} as const

function CalendarIcon() {
  return (
    <svg {...ico}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </svg>
  )
}
function SignsIcon() {
  return (
    <svg {...ico}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
    </svg>
  )
}
function SynastryIcon() {
  return (
    <svg {...ico}>
      <circle cx="9" cy="12" r="5.5" />
      <circle cx="15" cy="12" r="5.5" />
    </svg>
  )
}
function BlogIcon() {
  return (
    <svg {...ico}>
      <path d="M4 5a2 2 0 0 1 2-2h10l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M8 8h6M8 12h8M8 16h5" />
    </svg>
  )
}

export default function ExploreSections({ onStart }: { onStart?: () => void }) {
  const { locale } = useLocale()
  const fr = locale === 'fr'

  const secondary = [
    {
      href: '/calendrier',
      icon: <CalendarIcon />,
      title: fr ? 'Calendrier céleste' : 'Celestial calendar',
      desc: fr
        ? 'Pleines lunes, rétrogrades et passages du Soleil, sur 12 mois.'
        : "Full moons, retrogrades and the Sun's passages, over 12 months.",
      cta: fr ? 'Voir le calendrier' : 'See the calendar',
    },
    {
      href: '/signe',
      icon: <SignsIcon />,
      title: fr ? 'Les 12 signes' : 'The 12 signs',
      desc: fr
        ? 'Chaque signe du zodiaque exploré en profondeur.'
        : 'Each zodiac sign explored in depth.',
      cta: fr ? 'Explorer les signes' : 'Explore the signs',
    },
    {
      href: '/synastrie',
      icon: <SynastryIcon />,
      title: fr ? 'Synastrie' : 'Synastry',
      desc: fr
        ? 'Deux cartes du ciel superposées : l’alchimie de vos âmes, là où elles s’attirent et grandissent ensemble.'
        : 'Two birth charts overlaid: the alchemy of your souls — where they attract and grow together.',
      cta: fr ? 'Révéler votre lien' : 'Reveal your bond',
    },
    {
      href: '/blog',
      icon: <BlogIcon />,
      title: fr ? 'Le journal' : 'The journal',
      desc: fr
        ? "Comprendre l'astrologie, article après article."
        : 'Understanding astrology, one article at a time.',
      cta: fr ? 'Lire le journal' : 'Read the journal',
    },
  ]

  return (
    <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)]/70 mb-2">
          {fr ? 'Explore Natalune' : 'Explore Natalune'}
        </p>
        <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl text-[var(--color-text-primary)]">
          {fr ? "Bien plus qu'une carte natale" : 'Much more than a birth chart'}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-3 max-w-xl mx-auto">
          {fr
            ? 'La carte du ciel est notre cœur — mais le ciel se découvre de mille façons.'
            : 'The birth chart is our heart — but the sky reveals itself in countless ways.'}
        </p>
      </div>

      {/* Flagship — la carte natale */}
      <div
        className="glass p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 mb-4"
        style={{
          borderColor: 'rgba(224,169,78,0.3)',
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--color-accent-gold) 9%, transparent), transparent)',
        }}
      >
        <div className="flex-1">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent-gold)]/80 mb-2">
            ✦ {fr ? 'Produit phare' : 'Flagship'}
          </p>
          <h3 className="font-cinzel text-xl sm:text-2xl text-[var(--color-text-primary)] mb-2">
            {fr ? 'Ta carte natale' : 'Your natal chart'}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-2xl">
            {fr
              ? "Le cœur de Natalune : ta carte du ciel complète — Soleil, Lune, Ascendant, maisons, aspects — calculée et interprétée pour t'aider à mieux te comprendre."
              : 'The heart of Natalune: your complete birth chart — Sun, Moon, Ascendant, houses, aspects — calculated and interpreted to help you understand yourself.'}
          </p>
        </div>
        {onStart ? (
          <button
            onClick={onStart}
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium shrink-0 glow-lavender"
          >
            <span aria-hidden="true">✦</span>
            {fr ? 'Lire ma carte natale' : 'Read my natal chart'}
          </button>
        ) : (
          <Link
            href="/carte-natale"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium shrink-0 glow-lavender"
          >
            <span aria-hidden="true">✦</span>
            {fr ? 'Lire ma carte natale' : 'Read my natal chart'}
          </Link>
        )}
      </div>

      {/* Secondary sections */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {secondary.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="glass p-5 flex flex-col group hover:border-[var(--color-accent-lavender)]/40 transition"
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-accent-lavender)]/12 text-[var(--color-accent-lavender)] mb-3">
              {s.icon}
            </span>
            <h3 className="font-cinzel text-base text-[var(--color-text-primary)] mb-1.5">
              {s.title}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed flex-1">
              {s.desc}
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-[var(--color-accent-lavender)] mt-3 group-hover:gap-2 transition-all">
              {s.cta}
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
