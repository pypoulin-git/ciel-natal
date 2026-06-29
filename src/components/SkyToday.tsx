'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n'
import { translateSign } from '@/lib/astro'
import { cn } from '@/lib/utils'
import { SignIcon } from '@/components/AstroIcons'
import MoonGlyph from '@/components/MoonGlyph'
import { computeSkyToday, type SkyToday as SkyData } from '@/lib/skyToday'
import {
  MOON_PHASES,
  MONTHLY_MOON,
  PLANET_LABEL,
  PLANET_THEME,
  SIGN_THEME,
  RETRO_HEADLINE,
  RETRO_TEXT,
  ASPECT_INFO,
  NATURE_COLOR,
  NATURE_FRAMING,
  CONFIG_INFO,
  SKY_EXPLAINERS,
} from '@/data/skyInterpretations'

const ASPECT_GLYPH: Record<string, string> = {
  Conjonction: '☌',
  Sextile: '⚹',
  Carre: '□',
  Trigone: '△',
  Opposition: '☍',
}

export default function SkyToday() {
  const { locale } = useLocale()
  const fr = locale === 'fr'
  const [sky, setSky] = useState<SkyData | null>(null)

  // Carousel state (mobile scroll-snap). On desktop the cards are a grid.
  const railRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    try {
      setSky(computeSkyToday(new Date()))
    } catch {
      /* leave null — section quietly stays hidden */
    }
  }, [])

  if (!sky) return null

  const phase = MOON_PHASES[sky.moon.phaseIndex]
  const monthly = MONTHLY_MOON[sky.moon.monthIndex]
  const planet = (key: string) => (fr ? PLANET_LABEL[key]?.fr : PLANET_LABEL[key]?.en)
  const fmt = (iso?: string) =>
    iso
      ? new Date(iso + 'T12:00:00Z').toLocaleDateString(fr ? 'fr-CA' : 'en-CA', {
          day: 'numeric',
          month: 'short',
          timeZone: 'UTC',
        })
      : '…'
  const dateLabel = new Date(sky.date + 'T12:00:00Z').toLocaleDateString(fr ? 'fr-CA' : 'en-CA', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })

  // Plain-language reading of an alignment, e.g. "L'action et la chance s'accordent avec fluidité."
  const alignSentence = (a: SkyData['alignments'][number]) => {
    const t1 = fr ? PLANET_THEME[a.planet1]?.fr : PLANET_THEME[a.planet1]?.en
    const t2 = fr ? PLANET_THEME[a.planet2]?.fr : PLANET_THEME[a.planet2]?.en
    const nature = ASPECT_INFO[a.type]?.nature
    const framing = fr ? NATURE_FRAMING[nature]?.fr : NATURE_FRAMING[nature]?.en
    if (!t1 || !t2 || !framing) return ''
    const s = fr ? `${t1} et ${t2} ${framing}.` : `${t1} and ${t2} ${framing}.`
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  // Featured retrograde: the current one if any, otherwise the soonest upcoming.
  const featuredRetro =
    sky.retrogrades.find((r) => r.status === 'current') ?? sky.retrogrades[0] ?? null
  const otherRetros = sky.retrogrades.filter((r) => r !== featuredRetro).slice(0, 3)

  const onScroll = () => {
    const el = railRef.current
    if (!el) return
    const kids = Array.from(el.children) as HTMLElement[]
    if (!kids.length) return
    const base = kids[0].offsetLeft
    let best = 0
    let bestDist = Infinity
    kids.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - base - el.scrollLeft)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    setActive(best)
  }

  const goTo = (i: number) => {
    const el = railRef.current
    if (!el) return
    const kid = el.children[i] as HTMLElement | undefined
    kid?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  const Eyebrow = ({ children, color }: { children: React.ReactNode; color?: string }) => (
    <p
      className="text-xs uppercase tracking-widest mb-2"
      style={{ color: color ?? 'var(--color-accent-lavender)' }}
    >
      {children}
    </p>
  )

  // ── Card 1 — La Lune ──
  const moonCard = (
    <div
      className="glass p-5 h-full flex flex-col items-center text-center"
      style={{ borderColor: 'rgba(224,169,78,0.28)' }}
    >
      <Eyebrow color="var(--color-accent-gold)">{fr ? 'La Lune' : 'The Moon'}</Eyebrow>
      <MoonGlyph angle={sky.moon.angle} size={84} idSuffix="today" />
      <h3 className="font-cinzel text-lg text-[var(--color-accent-gold)] mt-3">
        {fr ? monthly.name.fr : monthly.name.en}
      </h3>
      <p className="text-[11px] italic text-[var(--color-text-muted)] mt-0.5">
        {fr ? monthly.poem.fr : monthly.poem.en}
      </p>
      <p className="flex items-center justify-center gap-1.5 text-sm text-[var(--color-text-primary)] mt-3">
        {fr ? phase.name.fr : phase.name.en} · {sky.moon.illumination}%
      </p>
      <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-secondary)] mt-1">
        <SignIcon name={sky.moon.signKey} size={14} color="var(--color-accent-lavender)" />
        {fr ? 'Lune en ' : 'Moon in '}
        {translateSign(sky.moon.signKey, locale)}
      </p>
      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mt-3">
        {fr ? phase.text.fr : phase.text.en}
      </p>
    </div>
  )

  // ── Card 2 — Rétrogrades (current one featured) ──
  const retroTint = featuredRetro?.status === 'current' ? '#dba3b8' : 'var(--color-accent-lavender)'
  const retroCard = (
    <div className="glass p-5 h-full flex flex-col">
      <Eyebrow>{fr ? 'Rétrogrades' : 'Retrogrades'}</Eyebrow>
      {!featuredRetro ? (
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {fr
            ? 'Toutes les planètes avancent — un ciel direct, sans détour.'
            : 'Every planet is direct — a clear, forward sky.'}
        </p>
      ) : (
        <>
          {/* Strong visual, echoing the Moon glyph */}
          <div className="flex flex-col items-center text-center">
            <div
              className="relative flex items-center justify-center w-[78px] h-[78px] rounded-full"
              style={{
                background: `${cssAlpha(retroTint, 0.12)}`,
                border: `1px solid ${cssAlpha(retroTint, 0.45)}`,
              }}
            >
              <span className="text-3xl" style={{ color: retroTint }}>
                {featuredRetro.symbol}
              </span>
              <span
                className="absolute right-2 top-2 text-sm font-bold"
                style={{ color: retroTint }}
              >
                ℞
              </span>
            </div>
            <h3 className="text-lg text-[var(--color-text-primary)] font-medium mt-3">
              {planet(featuredRetro.planetKey)} {fr ? 'rétrograde' : 'retrograde'}
            </h3>
            <span
              className="text-[11px] px-2.5 py-0.5 rounded-full mt-1.5"
              style={{ background: cssAlpha(retroTint, 0.14), color: retroTint }}
            >
              {featuredRetro.status === 'current'
                ? `${fr ? 'En cours' : 'Now'}${featuredRetro.endISO ? ` · ${fr ? "jusqu'au" : 'until'} ${fmt(featuredRetro.endISO)}` : ''}`
                : `${fr ? 'À venir' : 'Upcoming'} · ${fmt(featuredRetro.startISO)} → ${fmt(featuredRetro.endISO)}`}
            </span>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mt-3">
              <span className="text-[var(--color-text-primary)]">
                {fr
                  ? RETRO_HEADLINE[featuredRetro.planetKey]?.fr
                  : RETRO_HEADLINE[featuredRetro.planetKey]?.en}
              </span>{' '}
              —{' '}
              {fr
                ? RETRO_TEXT[featuredRetro.planetKey]?.fr
                : RETRO_TEXT[featuredRetro.planetKey]?.en}
            </p>
          </div>

          {otherRetros.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[var(--color-glass-border)]">
              <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)] mb-1.5">
                {fr ? 'Aussi à venir' : 'Also upcoming'}
              </p>
              <ul className="space-y-1">
                {otherRetros.map((r) => (
                  <li key={r.planetKey} className="text-xs text-[var(--color-text-secondary)]">
                    <span className="text-[var(--color-accent-lavender)]">{r.symbol}</span>{' '}
                    {planet(r.planetKey)} ℞ · {fmt(r.startISO)} → {fmt(r.endISO)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
      <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed mt-auto pt-4">
        {fr ? SKY_EXPLAINERS.retro.fr : SKY_EXPLAINERS.retro.en}
      </p>
    </div>
  )

  // ── Card 3 — Alignements (interpreted) ──
  const alignCard = (
    <div className="glass p-5 h-full flex flex-col">
      <Eyebrow>{fr ? 'Alignements du jour' : "Today's alignments"}</Eyebrow>
      {sky.alignments.length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {fr
            ? 'Un ciel calme, sans aspect marquant entre les planètes.'
            : 'A calm sky, with no notable aspect between the planets.'}
        </p>
      ) : (
        <ul className="space-y-3.5">
          {sky.alignments.slice(0, 3).map((al, i) => {
            const info = ASPECT_INFO[al.type]
            const color = info ? NATURE_COLOR[info.nature] : 'var(--color-accent-lavender)'
            return (
              <li key={i} className="flex gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <div>
                  <p className="text-sm text-[var(--color-text-primary)] flex items-center gap-1.5 flex-wrap">
                    <span aria-hidden="true" style={{ color }}>
                      {al.symbol1}
                    </span>
                    {planet(al.planet1)}
                    <span aria-hidden="true" style={{ color }}>
                      {ASPECT_GLYPH[al.type]}
                    </span>
                    {planet(al.planet2)}
                    <span aria-hidden="true" style={{ color }}>
                      {al.symbol2}
                    </span>
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-0.5">
                    {alignSentence(al)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed mt-auto pt-4">
        {fr ? SKY_EXPLAINERS.alignments.fr : SKY_EXPLAINERS.alignments.en}
      </p>
    </div>
  )

  const cards = [moonCard, retroCard, alignCard]

  return (
    <section id="ciel-du-jour" className="max-w-6xl mx-auto px-4 py-10 sm:py-12">
      <div className="text-center mb-6">
        <p className="text-xs uppercase tracking-widest text-[var(--color-accent-gold)]/80 mb-2">
          ✦ {fr ? "Le ciel aujourd'hui" : 'The sky today'} · {dateLabel}
        </p>
        <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl text-[var(--color-text-primary)]">
          {fr ? 'Ce que racontent les astres en ce moment' : 'What the stars are saying right now'}
        </h2>
      </div>

      {/* Mobile: swipeable scroll-snap carousel · Desktop: 3-col grid */}
      <div
        ref={railRef}
        onScroll={onScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-1 md:grid md:grid-cols-3 md:overflow-visible md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card, i) => (
          <div key={i} className="snap-center shrink-0 w-[86%] sm:w-[60%] md:w-auto">
            {card}
          </div>
        ))}
      </div>

      {/* Dots (mobile only) */}
      <div className="flex md:hidden justify-center gap-2 mt-4">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`${fr ? 'Carte' : 'Card'} ${i + 1}`}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === active
                ? 'w-5 bg-[var(--color-accent-lavender)]'
                : 'w-1.5 bg-[var(--color-glass-border)]',
            )}
          />
        ))}
      </div>

      {/* Configuration rare — explained (stellium / grand trine / t-square) */}
      {sky.configs.length > 0 && (
        <div className="mt-5 space-y-3">
          {sky.configs.map((cfg, i) => {
            const info = CONFIG_INFO[cfg.kind]
            const signTheme = cfg.signKey
              ? fr
                ? SIGN_THEME[cfg.signKey]?.fr
                : SIGN_THEME[cfg.signKey]?.en
              : null
            return (
              <div
                key={i}
                className="glass p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in srgb, var(--color-accent-lavender) 12%, transparent), transparent)',
                }}
              >
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex -space-x-1">
                    {cfg.planets.map((p) => (
                      <span
                        key={p.name}
                        aria-hidden="true"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-base border border-[var(--color-glass-border)] bg-[var(--color-space-card)] text-[var(--color-accent-lavender)]"
                      >
                        {p.symbol}
                      </span>
                    ))}
                  </div>
                  <p className="font-cinzel text-base text-[var(--color-text-primary)]">
                    {fr ? info.name.fr : info.name.en}
                    {cfg.signKey ? (
                      <span className="text-[var(--color-accent-lavender)]">
                        {' · '}
                        {translateSign(cfg.signKey, locale)}
                      </span>
                    ) : null}
                  </p>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  <span className="text-[var(--color-text-muted)]">
                    {fr ? SKY_EXPLAINERS.stellium.fr : SKY_EXPLAINERS.stellium.en}
                  </span>
                  {cfg.kind === 'stellium' && signTheme ? (
                    <>
                      {' '}
                      {fr
                        ? `Ici, le signe — ${signTheme} — est au premier plan ces jours-ci.`
                        : `Here, that sign — ${signTheme} — is in the spotlight these days.`}
                    </>
                  ) : (
                    <> {fr ? info.text.fr : info.text.en}</>
                  )}
                </p>
              </div>
            )
          })}
        </div>
      )}

      <div className="text-center mt-7">
        <Link
          href="/calendrier"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-accent-lavender)] hover:text-[var(--color-text-primary)] transition"
        >
          {fr ? 'Voir le calendrier des 12 prochains mois' : "See the next 12 months' calendar"}
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <p className="text-center text-[11px] text-[var(--color-text-muted)] mt-4">
        {fr
          ? "Positions calculées en direct pour aujourd'hui — à titre indicatif."
          : 'Positions computed live for today — for guidance only.'}
      </p>
    </section>
  )
}

// rgba-ish helper that works with hex or CSS var (falls back to color-mix for vars).
function cssAlpha(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    const a = Math.round(alpha * 255)
      .toString(16)
      .padStart(2, '0')
    return `${color}${a}`
  }
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`
}
