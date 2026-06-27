'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/lib/i18n'
import { translateSign } from '@/lib/astro'
import { SignIcon } from '@/components/AstroIcons'
import { computeSkyToday, type SkyToday as SkyData } from '@/lib/skyToday'
import {
  MOON_PHASES,
  MONTHLY_MOON,
  PLANET_LABEL,
  RETRO_HEADLINE,
  RETRO_TEXT,
  ASPECT_INFO,
  NATURE_COLOR,
  CONFIG_INFO,
} from '@/data/skyInterpretations'

// SVG Moon-phase glyph. The lit disc is masked by a same-radius shadow circle
// whose horizontal offset tracks the Sun→Moon elongation, yielding correct
// crescent / quarter / gibbous shapes.
function MoonGlyph({ angle, size = 88 }: { angle: number; size?: number }) {
  const r = size / 2
  const a = ((angle % 360) + 360) % 360
  const k = (1 - Math.cos((a * Math.PI) / 180)) / 2 // illuminated fraction 0..1
  const waxing = a <= 180
  const cx = r + (waxing ? -1 : 1) * 2 * r * k // shadow centre x

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <defs>
        <radialGradient id="moon-lit" cx="38%" cy="34%" r="78%">
          <stop offset="0%" stopColor="#fffdf6" />
          <stop offset="60%" stopColor="#f0e9ff" />
          <stop offset="100%" stopColor="#cdc1ee" />
        </radialGradient>
        <clipPath id="moon-disc">
          <circle cx={r} cy={r} r={r} />
        </clipPath>
      </defs>
      <circle cx={r} cy={r} r={r} fill="url(#moon-lit)" />
      <circle cx={cx} cy={r} r={r} fill="var(--color-space-deep)" clipPath="url(#moon-disc)" />
      <circle cx={r} cy={r} r={r - 0.5} fill="none" stroke="rgba(224,169,78,0.45)" />
    </svg>
  )
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

  const retros = sky.retrogrades.slice(0, 4)

  return (
    <section id="ciel-du-jour" className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-widest text-[var(--color-accent-gold)]/80 mb-3">
          ✦ {fr ? "Le ciel aujourd'hui" : 'The sky today'} · {dateLabel}
        </p>
        <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl text-[var(--color-text-primary)]">
          {fr ? 'Ce que racontent les astres en ce moment' : 'What the stars are saying right now'}
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-5 items-start">
        {/* ── Lune du mois + phase ── */}
        <div
          className="glass p-6 flex flex-col items-center text-center"
          style={{ borderColor: 'rgba(224,169,78,0.28)' }}
        >
          <MoonGlyph angle={sky.moon.angle} size={88} />
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
        <div className="glass p-6">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)]/80 mb-4">
            {fr ? 'Rétrogrades' : 'Retrogrades'}
          </p>
          {retros.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {fr
                ? 'Toutes les planètes avancent — un ciel direct, sans détour.'
                : 'Every planet is direct — a clear, forward sky.'}
            </p>
          ) : (
            <ul className="space-y-4">
              {retros.map((rx) => {
                const current = rx.status === 'current'
                const tint = current ? '#dba3b8' : 'var(--color-accent-lavender)'
                const when = current
                  ? fr
                    ? `En cours${rx.endISO ? ` · jusqu'au ${fmt(rx.endISO)}` : ''}`
                    : `Ongoing${rx.endISO ? ` · until ${fmt(rx.endISO)}` : ''}`
                  : fr
                    ? `À venir · ${fmt(rx.startISO)} → ${fmt(rx.endISO)}`
                    : `Upcoming · ${fmt(rx.startISO)} → ${fmt(rx.endISO)}`
                return (
                  <li key={rx.planetKey}>
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm shrink-0"
                        style={{ background: `${tint}22`, color: tint }}
                      >
                        {rx.symbol}
                      </span>
                      <span className="text-sm text-[var(--color-text-primary)] font-medium">
                        {label(rx.planetKey)} ℞
                      </span>
                      <span
                        className="ml-auto text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ background: `${tint}1f`, color: tint }}
                      >
                        {when}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-1.5">
                      <span className="text-[var(--color-text-primary)]">
                        {fr ? RETRO_HEADLINE[rx.planetKey]?.fr : RETRO_HEADLINE[rx.planetKey]?.en}
                      </span>{' '}
                      — {fr ? RETRO_TEXT[rx.planetKey]?.fr : RETRO_TEXT[rx.planetKey]?.en}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* ── Alignements ── */}
        <div className="glass p-6">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)]/80 mb-4">
            {fr ? 'Alignements du jour' : "Today's alignments"}
          </p>
          {sky.alignments.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {fr
                ? 'Un ciel calme, sans aspect marquant entre les planètes.'
                : 'A calm sky, with no notable aspect between the planets.'}
            </p>
          ) : (
            <ul className="space-y-3.5">
              {sky.alignments.map((al, i) => {
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
                      <p className="text-sm text-[var(--color-text-primary)]">
                        <span aria-hidden="true" style={{ color }}>
                          {al.symbol1}
                        </span>{' '}
                        {label(al.planet1)}{' '}
                        <span className="text-[var(--color-text-secondary)] text-xs">
                          {fr ? info?.name.fr : info?.name.en}
                        </span>{' '}
                        {label(al.planet2)}{' '}
                        <span aria-hidden="true" style={{ color }}>
                          {al.symbol2}
                        </span>
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-0.5">
                        {fr ? info?.text.fr : info?.text.en}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── Configurations marquantes (pleine largeur) ── */}
      {sky.configs.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 mt-4 sm:mt-5">
          {sky.configs.map((cfg, i) => {
            const info = CONFIG_INFO[cfg.kind]
            return (
              <div
                key={i}
                className="glass p-5 flex items-start gap-4"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in srgb, var(--color-accent-lavender) 12%, transparent), transparent)',
                }}
              >
                <div className="flex -space-x-1 shrink-0 pt-0.5">
                  {cfg.planets.map((p) => (
                    <span
                      key={p.name}
                      aria-hidden="true"
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm border border-[var(--color-glass-border)] bg-[var(--color-space-card)] text-[var(--color-accent-lavender)]"
                    >
                      {p.symbol}
                    </span>
                  ))}
                </div>
                <div>
                  <p className="font-cinzel text-base text-[var(--color-text-primary)]">
                    {fr ? info.name.fr : info.name.en}
                    {cfg.signKey ? (
                      <span className="text-[var(--color-accent-lavender)]">
                        {' '}
                        · {translateSign(cfg.signKey, locale)}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-1">
                    {fr ? info.text.fr : info.text.en}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-center text-[11px] text-[var(--color-text-muted)] mt-6">
        {fr
          ? "Positions calculées en direct pour aujourd'hui — à titre indicatif."
          : 'Positions computed live for today — for guidance only.'}
      </p>
    </section>
  )
}
