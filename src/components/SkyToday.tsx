'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n'
import { translateSign } from '@/lib/astro'
import { SignIcon } from '@/components/AstroIcons'
import MoonGlyph from '@/components/MoonGlyph'
import { computeSkyToday, type SkyToday as SkyData } from '@/lib/skyToday'
import {
  MOON_PHASES,
  MONTHLY_MOON,
  PLANET_LABEL,
  ASPECT_INFO,
  NATURE_COLOR,
  CONFIG_INFO,
} from '@/data/skyInterpretations'

// Compact aspect glyphs + one-word nature, for the dense alignment rows.
const ASPECT_GLYPH: Record<string, string> = {
  Conjonction: '☌',
  Sextile: '⚹',
  Carre: '□',
  Trigone: '△',
  Opposition: '☍',
}
const NATURE_LABEL: Record<string, { fr: string; en: string }> = {
  fusion: { fr: 'fusion', en: 'fusion' },
  harmonie: { fr: 'harmonie', en: 'harmony' },
  tension: { fr: 'tension', en: 'tension' },
}

export default function SkyToday() {
  const { locale } = useLocale()
  const fr = locale === 'fr'
  // Computed after mount only — the result depends on "today", so rendering it
  // on the server would risk a hydration mismatch.
  const [sky, setSky] = useState<SkyData | null>(null)

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
  const label = (key: string) => (fr ? PLANET_LABEL[key]?.fr : PLANET_LABEL[key]?.en)
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

  const retros = sky.retrogrades.slice(0, 3)

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

      <div className="grid md:grid-cols-3 gap-4 items-start">
        {/* ── Lune du mois + phase ── */}
        <div
          className="glass p-5 flex flex-col items-center text-center"
          style={{ borderColor: 'rgba(224,169,78,0.28)' }}
        >
          <MoonGlyph angle={sky.moon.angle} size={88} idSuffix="today" />
          <h3 className="font-cinzel text-xl text-[var(--color-accent-gold)] mt-4">
            {fr ? monthly.name.fr : monthly.name.en}
          </h3>
          <p className="text-[11px] italic text-[var(--color-text-muted)] mt-0.5">
            {fr ? monthly.poem.fr : monthly.poem.en}
          </p>
          <div className="my-3 h-px w-12 bg-[var(--color-glass-border)]" />
          <p className="flex items-center justify-center gap-1.5 text-sm text-[var(--color-text-primary)]">
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

        {/* ── Rétrogrades (en cours + à venir) ── */}
        <div className="glass p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)]/80 mb-3">
            {fr ? 'Rétrogrades' : 'Retrogrades'}
          </p>
          {retros.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {fr
                ? 'Toutes les planètes avancent — un ciel direct, sans détour.'
                : 'Every planet is direct — a clear, forward sky.'}
            </p>
          ) : (
            <ul className="space-y-3">
              {retros.map((rx) => {
                const current = rx.status === 'current'
                const tint = current ? '#dba3b8' : 'var(--color-accent-lavender)'
                const when = current
                  ? fr
                    ? `jusqu'au ${fmt(rx.endISO)}`
                    : `until ${fmt(rx.endISO)}`
                  : `${fmt(rx.startISO)} → ${fmt(rx.endISO)}`
                return (
                  <li key={rx.planetKey} className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm shrink-0"
                      style={{ background: `${tint}22`, color: tint }}
                    >
                      {rx.symbol}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-[var(--color-text-primary)] font-medium leading-tight">
                        {label(rx.planetKey)} ℞{' '}
                        <span className="font-normal text-[var(--color-text-muted)]">
                          {current ? (fr ? 'en cours' : 'now') : fr ? 'à venir' : 'soon'}
                        </span>
                      </p>
                      <p className="text-xs leading-tight mt-0.5" style={{ color: tint }}>
                        {when}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* ── Alignements ── */}
        <div className="glass p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)]/80 mb-3">
            {fr ? 'Alignements du jour' : "Today's alignments"}
          </p>
          {sky.alignments.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {fr
                ? 'Un ciel calme, sans aspect marquant entre les planètes.'
                : 'A calm sky, with no notable aspect between the planets.'}
            </p>
          ) : (
            <ul className="space-y-2.5">
              {sky.alignments.slice(0, 4).map((al, i) => {
                const info = ASPECT_INFO[al.type]
                const color = info ? NATURE_COLOR[info.nature] : 'var(--color-accent-lavender)'
                return (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span
                      aria-hidden="true"
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: color }}
                    />
                    <span className="text-[var(--color-text-primary)] truncate">
                      <span aria-hidden="true" className="text-[var(--color-text-secondary)]">
                        {al.symbol1}
                      </span>{' '}
                      {label(al.planet1)}{' '}
                      <span aria-hidden="true" style={{ color }}>
                        {ASPECT_GLYPH[al.type]}
                      </span>{' '}
                      {label(al.planet2)}{' '}
                      <span aria-hidden="true" className="text-[var(--color-text-secondary)]">
                        {al.symbol2}
                      </span>
                    </span>
                    <span className="ml-auto text-[10px] shrink-0" style={{ color }}>
                      {info
                        ? fr
                          ? NATURE_LABEL[info.nature].fr
                          : NATURE_LABEL[info.nature].en
                        : ''}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── Configurations marquantes (puces fines) ── */}
      {sky.configs.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mt-5">
          {sky.configs.map((cfg, i) => {
            const info = CONFIG_INFO[cfg.kind]
            return (
              <span
                key={i}
                title={fr ? info.text.fr : info.text.en}
                className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[var(--color-glass-border)]"
                style={{
                  background: 'color-mix(in srgb, var(--color-accent-lavender) 10%, transparent)',
                }}
              >
                <span
                  aria-hidden="true"
                  className="text-[var(--color-accent-lavender)] tracking-tight"
                >
                  {cfg.planets.map((p) => p.symbol).join(' ')}
                </span>
                <span className="text-[var(--color-text-primary)] font-medium">
                  {fr ? info.name.fr : info.name.en}
                  {cfg.signKey ? ` · ${translateSign(cfg.signKey, locale)}` : ''}
                </span>
              </span>
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
