'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { SIGNS, translateSign } from '@/lib/astro'
import { geocentricLongitudes, daysSince2000At } from '@/lib/ephemeris'
import { computeSkyToday } from '@/lib/skyToday'
import { computeCalendar } from '@/lib/skyCalendar'
import { MOON_PHASES, PLANET_LABEL } from '@/data/skyInterpretations'

// A slim horizontal "market ticker" under the Moon strip: the energies of the
// moment (Moon phase, Sun season, retrogrades, a key alignment) followed by the
// astronomical/astrological events of the coming days. Scrolls continuously
// like a financial tape. Computed client-side after mount (no network).

interface TickItem {
  glyph: string
  text: string
  color: string
}

const PLANET_GLYPH: Record<string, string> = {
  Mercure: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃',
  Saturne: '♄', Uranus: '♅', Neptune: '♆', Pluton: '⯓',
}

const GOLD = 'var(--color-accent-gold)'
const LAV = 'var(--color-accent-lavender)'
const ROSE = 'var(--color-accent-rose)'
const BLUE = '#9fc8e8'
const MUTED = 'var(--color-text-muted)'

const HORIZON_DAYS = 16 // how far ahead the "this week / coming days" events reach

function buildItems(now: Date, fr: boolean, locale: string): TickItem[] {
  const items: TickItem[] = []
  const sky = computeSkyToday(now)

  // ── Energies of the moment ──
  const phase = MOON_PHASES[sky.moon.phaseIndex]
  items.push({
    glyph: '☾',
    color: LAV,
    text: `${fr ? phase.name.fr : phase.name.en} · ${fr ? 'Lune en' : 'Moon in'} ${translateSign(sky.moon.signKey, locale)}`,
  })

  const sunLon = geocentricLongitudes(daysSince2000At(now)).Soleil
  const sunSign = SIGNS[Math.floor((((sunLon % 360) + 360) % 360) / 30)]
  items.push({
    glyph: '☉',
    color: GOLD,
    text: `${fr ? 'Saison — Soleil en' : 'Season — Sun in'} ${translateSign(sunSign, locale)}`,
  })

  for (const r of sky.retrogrades.filter((x) => x.status === 'current')) {
    const label = fr ? PLANET_LABEL[r.planetKey]?.fr : PLANET_LABEL[r.planetKey]?.en
    items.push({
      glyph: PLANET_GLYPH[r.planetKey] ?? '℞',
      color: ROSE,
      text: `${label} ${fr ? 'rétrograde' : 'retrograde'} ℞`,
    })
  }

  const al = sky.alignments[0]
  if (al) {
    const p1 = fr ? PLANET_LABEL[al.planet1]?.fr : PLANET_LABEL[al.planet1]?.en
    const p2 = fr ? PLANET_LABEL[al.planet2]?.fr : PLANET_LABEL[al.planet2]?.en
    items.push({ glyph: '✷', color: LAV, text: `${p1} · ${p2} — ${al.type}` })
  }

  // ── Events of the coming days ──
  const months = computeCalendar(now, 2)
  const todayMs = now.getTime()
  const horizonMs = todayMs + HORIZON_DAYS * 86400000
  const upcoming = months
    .flatMap((m) => m.events)
    .filter((e) => {
      const t = new Date(e.dateISO + 'T12:00:00Z').getTime()
      return t >= todayMs - 86400000 && t <= horizonMs
    })

  const dayLabel = (iso: string) =>
    new Date(iso + 'T12:00:00Z').toLocaleDateString(fr ? 'fr-CA' : 'en-CA', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    })

  for (const e of upcoming) {
    const sign = translateSign(e.signKey, locale)
    const planet = e.planetKey ? (fr ? PLANET_LABEL[e.planetKey]?.fr : PLANET_LABEL[e.planetKey]?.en) : ''
    let glyph = '✦'
    let color = LAV
    let text = ''
    switch (e.type) {
      case 'new-moon':
        glyph = '●'; color = MUTED
        text = fr ? `Nouvelle Lune en ${sign}` : `New Moon in ${sign}`
        break
      case 'full-moon':
        glyph = '○'; color = GOLD
        text = fr ? `Pleine Lune en ${sign}` : `Full Moon in ${sign}`
        break
      case 'retro-begin':
        glyph = PLANET_GLYPH[e.planetKey ?? ''] ?? '℞'; color = ROSE
        text = fr ? `${planet} entre en rétrograde ℞` : `${planet} turns retrograde ℞`
        break
      case 'retro-end':
        glyph = PLANET_GLYPH[e.planetKey ?? ''] ?? '℞'; color = '#86d9b9'
        text = fr ? `${planet} redevient direct` : `${planet} turns direct`
        break
      case 'sun-ingress':
        glyph = '☉'; color = BLUE
        text = fr ? `Le Soleil entre en ${sign}` : `Sun enters ${sign}`
        break
    }
    items.push({ glyph, color, text: `${text} · ${dayLabel(e.dateISO)}` })
  }

  return items
}

function Tape({ items }: { items: TickItem[] }) {
  return (
    <div className="flex items-center shrink-0" aria-hidden="true">
      {items.map((it, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className="mx-3 opacity-30 text-[var(--color-text-muted)]">•</span>
          <span className="text-[11px]" style={{ color: it.color }}>{it.glyph}</span>
          <span className="ml-1.5 text-[11px] text-[var(--color-text-secondary)]">{it.text}</span>
        </span>
      ))}
    </div>
  )
}

export default function SkyTicker() {
  const [locale, setLocale] = useState<'fr' | 'en'>('fr')
  const [items, setItems] = useState<TickItem[] | null>(null)

  useEffect(() => {
    let loc: 'fr' | 'en' = 'fr'
    try {
      const stored = localStorage.getItem('ciel-natal-locale')
      if (stored === 'en' || stored === 'fr') loc = stored
    } catch { /* default fr */ }
    setLocale(loc)
    try {
      setItems(buildItems(new Date(), loc === 'fr', loc))
    } catch {
      /* leave hidden — the site works without the tape */
    }
  }, [])

  // Duration scales with the number of items so density stays readable.
  const duration = useMemo(() => (items ? Math.max(28, items.length * 5) : 40), [items])

  if (!items || items.length === 0) return null

  return (
    <Link
      href="/calendrier"
      aria-label={locale === 'fr' ? 'Les énergies et rendez-vous du ciel' : 'Sky energies and upcoming events'}
      className="group block w-full border-b overflow-hidden backdrop-blur-xl transition hover:bg-white/[0.03]"
      style={{ borderColor: 'var(--nav-border)', background: 'color-mix(in srgb, var(--color-space-card) 25%, transparent)' }}
    >
      <div className="relative flex items-center py-[3px]">
        {/* Static leading tag */}
        <span
          className="z-10 shrink-0 pl-4 pr-3 text-[9px] uppercase tracking-widest font-semibold"
          style={{ color: 'var(--color-accent-gold)' }}
        >
          ✦ {locale === 'fr' ? 'Le ciel' : 'The sky'}
        </span>
        {/* Fade masks on the edges */}
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]">
          <div
            className="flex w-max animate-sky-ticker group-hover:[animation-play-state:paused] motion-reduce:animate-none"
            style={{ animationDuration: `${duration}s` }}
          >
            {/* Duplicated for a seamless loop (translateX(-50%)). */}
            <Tape items={items} />
            <Tape items={items} />
          </div>
        </div>
      </div>
    </Link>
  )
}
