'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SIGNS, translateSign } from '@/lib/astro'
import { geocentricLongitudes, daysSince2000At } from '@/lib/ephemeris'
import { computeSkyToday } from '@/lib/skyToday'
import { computeCalendar } from '@/lib/skyCalendar'
import { METEOR_BY_KEY } from '@/data/meteorShowers'
import {
  MOON_PHASES,
  MOON_IN_SIGN,
  PLANET_LABEL,
  PLANET_THEME,
  SIGN_THEME,
  ASPECT_INFO,
  NATURE_FRAMING,
  NATURE_COLOR,
  CONFIG_INFO,
  RETRO_HEADLINE,
} from '@/data/skyInterpretations'

// A slim horizontal "market ticker" under the Moon strip. It reads the same
// live sky the homepage "Le ciel aujourd'hui" section shows — Moon, Sun
// season, a featured retrograde, aspects, rare configurations — plus the
// notable events of the coming days, and pairs EACH with a succinct
// interpretation (what effect it can have). Scrolls continuously; you can also
// drag it left/right by hand, and a plain tap opens the calendar.

interface TickItem {
  glyph: string
  color: string
  label: string
  effect: string
}

const PLANET_GLYPH: Record<string, string> = {
  Mercure: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃',
  Saturne: '♄', Uranus: '♅', Neptune: '♆', Pluton: '⯓',
}
const ASPECT_GLYPH: Record<string, string> = {
  Conjonction: '☌', Sextile: '⚹', Carre: '□', Trigone: '△', Opposition: '☍',
}

const GOLD = 'var(--color-accent-gold)'
const LAV = 'var(--color-accent-lavender)'
const ROSE = 'var(--color-accent-rose)'
const BLUE = '#9fc8e8'
const GREEN = '#86d9b9'
const MUTED = 'var(--color-text-muted)'

const HORIZON_DAYS = 14 // "coming days" reach — short term
const MAX_EVENTS = 6

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

function buildItems(now: Date, fr: boolean, locale: string): TickItem[] {
  const items: TickItem[] = []
  const sky = computeSkyToday(now)
  const L = (b?: { fr: string; en: string }) => (b ? (fr ? b.fr : b.en) : '')
  const theme = (sign: string) => L(SIGN_THEME[sign])

  // ── Moon ──
  const phase = MOON_PHASES[sky.moon.phaseIndex]
  items.push({
    glyph: '☾',
    color: LAV,
    label: `${L(phase.name)} · ${fr ? 'Lune en' : 'Moon in'} ${translateSign(sky.moon.signKey, locale)}`,
    effect: L(MOON_IN_SIGN[sky.moon.signKey]),
  })

  // ── Sun season ──
  const sunLon = geocentricLongitudes(daysSince2000At(now)).Soleil
  const sunSign = SIGNS[Math.floor((((sunLon % 360) + 360) % 360) / 30)]
  items.push({
    glyph: '☉',
    color: GOLD,
    label: `${fr ? 'Saison — Soleil en' : 'Season — Sun in'} ${translateSign(sunSign, locale)}`,
    effect: theme(sunSign),
  })

  // ── One featured retrograde (Mercury first) — no exhaustive list ──
  const current = sky.retrogrades.filter((r) => r.status === 'current')
  const featured = current.find((r) => r.planetKey === 'Mercure') ?? current[0]
  if (featured) {
    items.push({
      glyph: PLANET_GLYPH[featured.planetKey] ?? '℞',
      color: ROSE,
      label: `${L(PLANET_LABEL[featured.planetKey])} ${fr ? 'rétrograde' : 'retrograde'} ℞`,
      effect: L(RETRO_HEADLINE[featured.planetKey]),
    })
  }

  // ── Aspects of the day, interpreted (top 2) ──
  for (const al of sky.alignments.slice(0, 2)) {
    const info = ASPECT_INFO[al.type]
    const t1 = L(PLANET_THEME[al.planet1])
    const t2 = L(PLANET_THEME[al.planet2])
    const framing = info ? L(NATURE_FRAMING[info.nature]) : ''
    if (!t1 || !t2 || !framing) continue
    items.push({
      glyph: ASPECT_GLYPH[al.type] ?? '✷',
      color: info ? NATURE_COLOR[info.nature] : LAV,
      label: `${L(PLANET_LABEL[al.planet1])} ${ASPECT_GLYPH[al.type] ?? ''} ${L(PLANET_LABEL[al.planet2])}`,
      effect: cap(fr ? `${t1} et ${t2} ${framing}` : `${t1} and ${t2} ${framing}`),
    })
  }

  // ── Rare configuration (stellium / grand trine / t-square) ──
  const cfg = sky.configs[0]
  if (cfg) {
    const info = CONFIG_INFO[cfg.kind]
    items.push({
      glyph: '✧',
      color: LAV,
      label: `${L(info.name)}${cfg.signKey ? ` · ${translateSign(cfg.signKey, locale)}` : ''}`,
      effect: L(info.text),
    })
  }

  // ── Notable events of the coming days, dated + interpreted ──
  const months = computeCalendar(now, 2)
  const todayMs = now.getTime()
  const horizonMs = todayMs + HORIZON_DAYS * 86400000
  const upcoming = months
    .flatMap((m) => m.events)
    .filter((e) => {
      const t = new Date(e.dateISO + 'T12:00:00Z').getTime()
      return t >= todayMs - 43200000 && t <= horizonMs
    })
    .slice(0, MAX_EVENTS)

  const dayLabel = (iso: string) =>
    new Date(iso + 'T12:00:00Z').toLocaleDateString(fr ? 'fr-CA' : 'en-CA', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    })

  for (const e of upcoming) {
    const sign = translateSign(e.signKey, locale)
    const planet = e.planetKey ? L(PLANET_LABEL[e.planetKey]) : ''
    const th = theme(e.signKey)
    let glyph = '✦', color = LAV, label = '', effect = ''
    switch (e.type) {
      case 'new-moon':
        glyph = '●'; color = MUTED
        label = fr ? `Nouvelle Lune en ${sign}` : `New Moon in ${sign}`
        effect = fr ? `nouveau cycle — on sème de nouvelles intentions · ${th}` : `a new cycle: plant intentions around ${th}`
        break
      case 'full-moon':
        glyph = '○'; color = GOLD
        label = fr ? `Pleine Lune en ${sign}` : `Full Moon in ${sign}`
        effect = fr ? `culmination : ${th} au sommet, émotions vives` : `culmination: ${th} peaks, emotions run high`
        break
      case 'retro-begin':
        glyph = PLANET_GLYPH[e.planetKey ?? ''] ?? '℞'; color = ROSE
        label = fr ? `${planet} passe rétrograde ℞` : `${planet} turns retrograde ℞`
        effect = L(RETRO_HEADLINE[e.planetKey ?? '']) || (fr ? 'on relit, on ralentit' : 'review and slow down')
        break
      case 'retro-end':
        glyph = PLANET_GLYPH[e.planetKey ?? ''] ?? '℞'; color = GREEN
        label = fr ? `${planet} redevient direct` : `${planet} turns direct`
        effect = fr ? 'le mouvement repart, on avance' : 'momentum returns, move ahead'
        break
      case 'sun-ingress':
        glyph = '☉'; color = BLUE
        label = fr ? `Le Soleil entre en ${sign}` : `Sun enters ${sign}`
        effect = fr ? `nouvelle saison — ${th}` : `a new season — ${th}`
        break
      case 'meteor-shower': {
        const s = e.meteorKey ? METEOR_BY_KEY[e.meteorKey] : undefined
        glyph = '☄'; color = GOLD
        label = s ? (fr ? s.fr : s.en) : (fr ? 'Étoiles filantes' : 'Meteor shower')
        effect = s ? (fr ? `pic ~${s.zhr}/h · ${s.whenFr}` : `peak ~${s.zhr}/h · ${s.whenEn}`) : ''
        break
      }
    }
    items.push({ glyph, color, label, effect })
  }

  return items
}

function Tape({ items, innerRef }: { items: TickItem[]; innerRef?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={innerRef} className="flex items-center shrink-0" aria-hidden="true">
      {items.map((it, i) => (
        <span key={i} className="flex items-baseline whitespace-nowrap">
          <span className="mx-3 opacity-30 text-[var(--color-text-muted)]">•</span>
          <span className="text-[11px]" style={{ color: it.color }}>{it.glyph}</span>
          <span className="ml-1.5 text-[11px] text-[var(--color-text-secondary)]">{it.label}</span>
          {it.effect && (
            <span className="ml-1.5 text-[11px] italic text-[var(--color-text-muted)]">— {it.effect}</span>
          )}
        </span>
      ))}
    </div>
  )
}

export default function SkyTicker() {
  const router = useRouter()
  const [locale, setLocale] = useState<'fr' | 'en'>('fr')
  const [items, setItems] = useState<TickItem[] | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const tapeRef = useRef<HTMLDivElement>(null)
  const paused = useRef(false) // hover or active drag
  const drag = useRef<{ x: number; scroll: number; moved: number } | null>(null)

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

  // Continuous auto-advance via scrollLeft (so manual drag and auto-scroll
  // share the same mechanism). Seamlessly loops over one tape width.
  useEffect(() => {
    const el = scrollRef.current
    if (!el || !items) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const step = () => {
      if (!paused.current && !reduce) {
        el.scrollLeft += 0.4
        const w = tapeRef.current?.offsetWidth ?? 0
        if (w > 0 && el.scrollLeft >= w) el.scrollLeft -= w
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [items])

  const wrap = () => {
    const el = scrollRef.current
    const w = tapeRef.current?.offsetWidth ?? 0
    if (!el || w <= 0) return
    if (el.scrollLeft < 0) el.scrollLeft += w
    else if (el.scrollLeft >= w) el.scrollLeft -= w
  }

  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollRef.current
    if (!el) return
    paused.current = true
    drag.current = { x: e.clientX, scroll: el.scrollLeft, moved: 0 }
    el.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const el = scrollRef.current
    if (!el || !drag.current) return
    const dx = e.clientX - drag.current.x
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx))
    el.scrollLeft = drag.current.scroll - dx
    wrap()
  }
  const endDrag = (e: React.PointerEvent) => {
    const wasTap = !!drag.current && drag.current.moved < 6
    drag.current = null
    paused.current = false
    try { scrollRef.current?.releasePointerCapture(e.pointerId) } catch { /* noop */ }
    // A genuine tap (not a drag) opens the calendar.
    if (wasTap) router.push('/calendrier')
  }

  if (!items || items.length === 0) return null

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={locale === 'fr' ? 'Les énergies et rendez-vous du ciel — ouvrir le calendrier' : 'Sky energies and upcoming events — open the calendar'}
      onKeyDown={(e) => { if (e.key === 'Enter') router.push('/calendrier') }}
      className="group block w-full border-b overflow-hidden backdrop-blur-xl transition hover:bg-white/[0.03]"
      style={{ borderColor: 'var(--nav-border)', background: 'color-mix(in srgb, var(--color-space-card) 25%, transparent)' }}
    >
      <div className="relative flex items-center py-[3px]">
        {/* Static leading tag */}
        <span
          className="z-10 shrink-0 pl-4 pr-3 text-[9px] uppercase tracking-widest font-semibold select-none"
          style={{ color: 'var(--color-accent-gold)' }}
        >
          ✦ {locale === 'fr' ? 'Le ciel' : 'The sky'}
        </span>
        {/* Draggable scroll region with edge fades */}
        <div
          ref={scrollRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onMouseEnter={() => { paused.current = true }}
          onMouseLeave={() => { if (!drag.current) paused.current = false }}
          className="relative flex-1 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing touch-pan-y select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]"
        >
          <div className="flex w-max">
            {/* Duplicated for a seamless loop. */}
            <Tape items={items} innerRef={tapeRef} />
            <Tape items={items} />
          </div>
        </div>
      </div>
    </div>
  )
}
