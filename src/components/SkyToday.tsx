'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/lib/i18n'
import { translateSign } from '@/lib/astro'
import { SignIcon } from '@/components/AstroIcons'
import { computeSkyToday, type SkyToday as SkyData } from '@/lib/skyToday'
import { MOON_PHASES, PLANET_LABEL, RETRO_TEXT, ASPECT_INFO } from '@/data/skyInterpretations'

// SVG Moon-phase glyph. The lit disc is masked by a same-radius shadow circle
// whose horizontal offset tracks the Sun→Moon elongation, yielding correct
// crescent / quarter / gibbous shapes.
function MoonGlyph({ angle, size = 72 }: { angle: number; size?: number }) {
  const r = size / 2
  const a = ((angle % 360) + 360) % 360
  const k = (1 - Math.cos((a * Math.PI) / 180)) / 2 // illuminated fraction 0..1
  const waxing = a <= 180
  const cx = r + (waxing ? -1 : 1) * 2 * r * k // shadow centre x

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <defs>
        <radialGradient id="moon-lit" cx="38%" cy="36%" r="75%">
          <stop offset="0%" stopColor="#fbf8ff" />
          <stop offset="100%" stopColor="#d7cdf0" />
        </radialGradient>
        <clipPath id="moon-disc">
          <circle cx={r} cy={r} r={r} />
        </clipPath>
      </defs>
      <circle cx={r} cy={r} r={r} fill="url(#moon-lit)" />
      <circle cx={cx} cy={r} r={r} fill="var(--color-space-deep)" clipPath="url(#moon-disc)" />
      <circle cx={r} cy={r} r={r - 0.5} fill="none" stroke="rgba(179,167,224,0.35)" />
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
  const dateLabel = new Date(sky.date + 'T12:00:00Z').toLocaleDateString(fr ? 'fr-CA' : 'en-CA', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })

  return (
    <section className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)]/70 mb-3">
          {fr ? "Le ciel aujourd'hui" : 'The sky today'} · {dateLabel}
        </p>
        <h2 className="font-cinzel text-3xl sm:text-4xl text-[var(--color-text-primary)]">
          {fr ? 'Ce que racontent les astres en ce moment' : 'What the stars are saying right now'}
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* ── Phase de la Lune ── */}
        <div className="glass p-6 flex flex-col items-center text-center">
          <MoonGlyph angle={sky.moon.angle} size={76} />
          <h3 className="font-cinzel text-lg text-[var(--color-text-primary)] mt-4">
            {fr ? phase.name.fr : phase.name.en}
          </h3>
          <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-secondary)] mt-1">
            <SignIcon name={sky.moon.signKey} size={15} color="var(--color-accent-lavender)" />
            {fr ? 'Lune en ' : 'Moon in '}
            {translateSign(sky.moon.signKey, locale)} · {sky.moon.illumination}%
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mt-3">
            {fr ? phase.text.fr : phase.text.en}
          </p>
        </div>

        {/* ── Rétrogrades ── */}
        <div className="glass p-6">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)]/70 mb-4">
            {fr ? 'Rétrogrades' : 'Retrogrades'}
          </p>
          {sky.retrogrades.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {fr
                ? "Aucune planète rétrograde en ce moment — le ciel avance d'un pas franc."
                : 'No planets retrograde right now — the sky moves forward with a clear step.'}
            </p>
          ) : (
            <ul className="space-y-3">
              {sky.retrogrades.map((rx) => (
                <li key={rx.planetKey}>
                  <p className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                    <span aria-hidden="true" className="text-[var(--color-accent-lavender)]">
                      {rx.symbol}℞
                    </span>
                    <span className="font-medium">
                      {fr ? PLANET_LABEL[rx.planetKey]?.fr : PLANET_LABEL[rx.planetKey]?.en}
                    </span>
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-1">
                    {fr ? RETRO_TEXT[rx.planetKey]?.fr : RETRO_TEXT[rx.planetKey]?.en}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Alignements ── */}
        <div className="glass p-6">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)]/70 mb-4">
            {fr ? 'Alignements du jour' : "Today's alignments"}
          </p>
          {sky.alignments.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {fr
                ? 'Un ciel calme, sans aspect marquant entre les planètes.'
                : 'A calm sky, with no notable aspect between the planets.'}
            </p>
          ) : (
            <ul className="space-y-3">
              {sky.alignments.map((al, i) => {
                const info = ASPECT_INFO[al.type]
                const p1 = fr ? PLANET_LABEL[al.planet1]?.fr : PLANET_LABEL[al.planet1]?.en
                const p2 = fr ? PLANET_LABEL[al.planet2]?.fr : PLANET_LABEL[al.planet2]?.en
                return (
                  <li key={i}>
                    <p className="flex items-center gap-1.5 text-sm text-[var(--color-text-primary)]">
                      <span aria-hidden="true" className="text-[var(--color-accent-lavender)]">
                        {al.symbol1}
                      </span>
                      <span className="font-medium">{p1}</span>
                      <span className="text-[var(--color-text-secondary)] text-xs">
                        {fr ? info?.name.fr : info?.name.en}
                      </span>
                      <span className="font-medium">{p2}</span>
                      <span aria-hidden="true" className="text-[var(--color-accent-lavender)]">
                        {al.symbol2}
                      </span>
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-1">
                      {fr ? info?.text.fr : info?.text.en}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      <p className="text-center text-[11px] text-[var(--color-text-muted)] mt-6">
        {fr
          ? "Positions calculées pour aujourd'hui — à titre indicatif."
          : 'Positions computed for today — for guidance only.'}
      </p>
    </section>
  )
}
