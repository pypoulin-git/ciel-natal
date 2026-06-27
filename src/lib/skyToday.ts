// "Ciel du jour" — current sky snapshot computed from the same simplified
// ephemeris used for natal charts (src/lib/astro.ts). Pure client-side compute:
// no network, no cron. Returns language-agnostic data; copy lives in
// src/data/skyInterpretations.ts and is composed by the SkyToday component.

import { calculateNatalChart, type NatalChart } from './astro'

// Planets that can appear retrograde (Sun, Moon and the Node are excluded).
const RETRO_CANDIDATES = [
  'Mercure',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturne',
  'Uranus',
  'Neptune',
  'Pluton',
]

function normalize360(a: number): number {
  return ((a % 360) + 360) % 360
}

// Shortest signed difference b - a, in [-180, 180].
function signedDelta(a: number, b: number): number {
  let d = normalize360(b - a)
  if (d > 180) d -= 360
  return d
}

export interface SkyMoon {
  phaseIndex: number // 0..7 (0 = New, 4 = Full)
  angle: number // Sun→Moon elongation, 0..360 (drives the glyph)
  illumination: number // 0..100 (approx. illuminated fraction)
  signKey: string // internal French sign key (e.g. "Scorpion")
}

export interface SkyRetrograde {
  planetKey: string // internal name (e.g. "Mercure")
  symbol: string // astrological glyph
}

export interface SkyAlignment {
  planet1: string
  symbol1: string
  planet2: string
  symbol2: string
  type: string // "Conjonction" | "Sextile" | "Carre" | "Trigone" | "Opposition"
  orb: number
}

export interface SkyToday {
  date: string // yyyy-mm-dd (UTC)
  moon: SkyMoon
  sunSignKey: string
  retrogrades: SkyRetrograde[]
  alignments: SkyAlignment[]
}

// Positions at midday UTC, no birth time (planets only, no ascendant/houses).
function chartFor(d: Date): NatalChart {
  return calculateNatalChart(
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    12,
    0,
    0,
    0,
    false,
  )
}

// 8 phase sectors centred on the canonical phase points (New at 0°, Full at 180°).
function phaseIndex(angle: number): number {
  return Math.floor((normalize360(angle) + 22.5) / 45) % 8
}

export function computeSkyToday(now: Date): SkyToday {
  const today = chartFor(now)
  const sun = today.planets[0]
  const moon = today.planets[1]

  const gap = normalize360(moon.longitude - sun.longitude)
  const illumination = Math.round(((1 - Math.cos((gap * Math.PI) / 180)) / 2) * 100)

  // Retrograde detection: compare each planet's longitude ±2 days. A 4-day
  // baseline is wide enough to read the direction of motion even for the slow
  // outer planets, while the simplified theory stays smooth.
  const before = chartFor(new Date(now.getTime() - 2 * 86400000))
  const after = chartFor(new Date(now.getTime() + 2 * 86400000))
  const lonOf = (c: NatalChart, name: string) => c.planets.find((p) => p.name === name)!.longitude

  const retrogrades: SkyRetrograde[] = []
  for (const name of RETRO_CANDIDATES) {
    const motion = signedDelta(lonOf(before, name), lonOf(after, name))
    if (motion < 0) {
      const p = today.planets.find((pl) => pl.name === name)!
      retrogrades.push({ planetKey: name, symbol: p.symbol })
    }
  }

  // Notable alignments: tightest transiting aspects, excluding the fast Moon
  // (its phase is shown separately) and the North Node. Top 3 by orb.
  const alignments: SkyAlignment[] = today.aspects
    .filter((a) => ![a.planet1, a.planet2].some((n) => n === 'Lune' || n === 'Noeud Nord'))
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 3)
    .map((a) => ({
      planet1: a.planet1,
      symbol1: a.symbol1,
      planet2: a.planet2,
      symbol2: a.symbol2,
      type: a.type,
      orb: a.orb,
    }))

  const iso = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`

  return {
    date: iso,
    moon: { phaseIndex: phaseIndex(gap), angle: gap, illumination, signKey: moon.sign },
    sunSignKey: sun.sign,
    retrogrades,
    alignments,
  }
}
