'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n'
import { SIGNS, translateSign } from '@/lib/astro'
import MoonGlyph from '@/components/MoonGlyph'
import { geocentricLongitudes, moonEcliptic, daysSince2000At } from '@/lib/ephemeris'
import { computeMoonDay, type MoonDay } from '@/lib/moonTimes'
import { MOON_PHASES, MOON_SKY_ENERGY } from '@/data/skyInterpretations'

// Global lunar strip under the site menu: today's moonrise / moonset for the
// visitor's (timezone-approximated) location, the Moon's progression across
// the sky between the two, and a one-line reading of the current lunar energy.
// Everything is computed client-side after mount (hydration-safe, no network).

interface MoonNow {
  angle: number // Sun→Moon elongation (drives the phase glyph)
  phaseIndex: number // 0..7
  signKey: string
  day: MoonDay
}

const REFRESH_MS = 5 * 60 * 1000 // keep the progression dot honest

function computeMoonNow(now: Date): MoonNow {
  const d = daysSince2000At(now)
  const moon = moonEcliptic(d)
  const sunLon = geocentricLongitudes(d).Soleil
  const angle = (((moon.lon - sunLon) % 360) + 360) % 360
  return {
    angle,
    phaseIndex: Math.floor((angle + 22.5) / 45) % 8,
    signKey: SIGNS[Math.floor(moon.lon / 30)],
    day: computeMoonDay(now),
  }
}

// The Moon's path across the sky, as a shallow arc; the glowing dot sits at
// `progress` (0 = rise, 1 = set). Rendered dimmed when the Moon is down.
// Colors go through theme vars so the arc reads on both dark and pale skies.
function MoonArc({ progress, up }: { progress: number | null; up: boolean }) {
  const W = 104
  const H = 18
  const P0 = { x: 4, y: 14 }
  const P1 = { x: W / 2, y: -8 } // control point — arc peaks ~mid-sky
  const P2 = { x: W - 4, y: 14 }
  const t = progress ?? 0
  const mt = 1 - t
  const dot = {
    x: mt * mt * P0.x + 2 * mt * t * P1.x + t * t * P2.x,
    y: mt * mt * P0.y + 2 * mt * t * P1.y + t * t * P2.y,
  }
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      className="shrink-0"
      style={{ opacity: up ? 1 : 0.45 }}
    >
      <path
        d={`M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}`}
        fill="none"
        stroke="color-mix(in srgb, var(--color-accent-gold) 45%, transparent)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      {/* horizon line */}
      <line
        x1="0"
        y1={P0.y + 2.5}
        x2={W}
        y2={P0.y + 2.5}
        stroke="var(--color-glass-border)"
        strokeWidth="1"
      />
      {up && progress !== null && (
        <>
          <circle
            cx={dot.x}
            cy={dot.y}
            r="5.5"
            fill="color-mix(in srgb, var(--color-accent-gold) 22%, transparent)"
          />
          <circle
            cx={dot.x}
            cy={dot.y}
            r="2.6"
            fill="var(--moon-lit-mid)"
            stroke="var(--moon-ring)"
            strokeWidth="0.75"
          />
        </>
      )}
    </svg>
  )
}

export default function MoonBanner() {
  const { locale } = useLocale()
  const fr = locale === 'fr'
  const [moon, setMoon] = useState<MoonNow | null>(null)

  useEffect(() => {
    const tick = () => {
      try {
        setMoon(computeMoonNow(new Date()))
      } catch {
        /* leave hidden — the site works without the strip */
      }
    }
    tick()
    const id = setInterval(tick, REFRESH_MS)
    return () => clearInterval(id)
  }, [])

  const fmt = useMemo(
    () => (t: Date | null) =>
      t
        ? t.toLocaleTimeString(fr ? 'fr-CA' : 'en-CA', { hour: '2-digit', minute: '2-digit' })
        : '—',
    [fr],
  )

  if (!moon) return null

  const phase = MOON_PHASES[moon.phaseIndex]
  const energy = MOON_SKY_ENERGY[moon.phaseIndex][moon.day.up ? 'up' : 'down']
  const noEvents = !moon.day.rise && !moon.day.set

  return (
    <Link
      href="/#ciel-du-jour"
      aria-label={fr ? 'La Lune aujourd’hui' : 'The Moon today'}
      className="block w-full border-b backdrop-blur-xl transition hover:bg-white/[0.03]"
      style={{
        background:
          'linear-gradient(90deg, color-mix(in srgb, var(--color-accent-gold) 7%, transparent), transparent 30%, transparent 70%, color-mix(in srgb, var(--color-accent-lavender) 7%, transparent))',
        borderColor: 'var(--nav-border)',
      }}
    >
      {/* One slim row — the arc is the visual centerpiece. The energy line
          only joins on wider screens (truncated) to keep the strip thin. */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-1 flex items-center gap-x-3">
        {/* Phase + sign */}
        <span className="flex items-center gap-1.5 min-w-0">
          <span className="shrink-0 flex">
            <MoonGlyph angle={moon.angle} size={16} idSuffix="banner" />
          </span>
          <span className="text-[11px] text-[var(--color-text-primary)] truncate">
            {fr ? phase.name.fr : phase.name.en}
            <span className="text-[var(--color-text-muted)] hidden sm:inline">
              {' · '}
              {fr ? 'en ' : 'in '}
              {translateSign(moon.signKey, locale)}
            </span>
          </span>
        </span>

        {/* Rise → arc progression → set */}
        {noEvents ? (
          <span className="text-[10px] text-[var(--color-text-muted)] whitespace-nowrap">
            {moon.day.alwaysUp
              ? fr
                ? 'Lune visible toute la journée'
                : 'Moon up all day'
              : fr
                ? 'Lune sous l’horizon aujourd’hui'
                : 'Moon below the horizon today'}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] tabular-nums text-[var(--color-text-secondary)] whitespace-nowrap">
              <span aria-hidden="true" className="text-[var(--color-accent-gold)]">
                ↑
              </span>{' '}
              {fmt(moon.day.rise)}
            </span>
            <MoonArc progress={moon.day.progress} up={moon.day.up} />
            <span className="text-[10px] tabular-nums text-[var(--color-text-secondary)] whitespace-nowrap">
              <span aria-hidden="true" className="text-[var(--color-accent-lavender)]">
                ↓
              </span>{' '}
              {fmt(moon.day.set)}
            </span>
          </span>
        )}

        {/* Lunar energy microcopy — desktop only, one truncated line */}
        <span className="hidden md:block flex-1 min-w-0 text-[11px] italic leading-none text-[var(--color-text-muted)] truncate">
          {fr ? energy.fr : energy.en}
        </span>
      </div>
    </Link>
  )
}
