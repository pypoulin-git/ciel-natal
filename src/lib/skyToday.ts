// "Ciel du jour" — current sky snapshot. Pure client-side compute (no network,
// no cron). Returns language-agnostic data; copy lives in
// src/data/skyInterpretations.ts and is composed by the SkyToday component.
//
// Moon phase reuses the natal ephemeris (src/lib/astro.ts). Everything that
// depends on *geocentric* motion — retrogrades, planet-to-planet aspects,
// configurations — uses src/lib/ephemeris.ts, because astro.ts's mean
// longitudes can't reproduce retrograde motion.

import { calculateNatalChart, SIGNS } from './astro'
import { geocentricChart } from './ephemeris'

const RETRO_CANDIDATES = ['Mercure', 'Venus', 'Mars', 'Jupiter', 'Saturne', 'Uranus', 'Neptune']

// Sun + planets considered for aspects / configurations (no Moon, no Node).
const PATTERN_PLANETS = [
  'Soleil',
  'Mercure',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturne',
  'Uranus',
  'Neptune',
]

const PLANET_SYMBOL: Record<string, string> = {
  Soleil: '☉',
  Mercure: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturne: '♄',
  Uranus: '♅',
  Neptune: '♆',
}

const ASPECTS = [
  { type: 'Conjonction', angle: 0, orb: 8 },
  { type: 'Sextile', angle: 60, orb: 6 },
  { type: 'Carre', angle: 90, orb: 7 },
  { type: 'Trigone', angle: 120, orb: 7 },
  { type: 'Opposition', angle: 180, orb: 8 },
]

const RETRO_HORIZON_DAYS = 200 // far enough to always catch the next Mercury Rx
const DAY_MS = 86400000

function normalize360(a: number): number {
  return ((a % 360) + 360) % 360
}
function signedDelta(a: number, b: number): number {
  let d = normalize360(b - a)
  if (d > 180) d -= 360
  return d
}
function separation(a: number, b: number): number {
  const d = Math.abs(normalize360(a - b))
  return d > 180 ? 360 - d : d
}
function signKeyOf(lon: number): string {
  return SIGNS[Math.floor(normalize360(lon) / 30)]
}

export interface SkyMoon {
  phaseIndex: number // 0..7 (0 = New, 4 = Full)
  angle: number // Sun→Moon elongation, 0..360 (drives the glyph)
  illumination: number // 0..100
  signKey: string
  monthIndex: number // 0..11 — traditional monthly Moon name
}
export interface SkyRetro {
  planetKey: string
  symbol: string
  status: 'current' | 'upcoming'
  startISO?: string
  endISO?: string
}
export interface SkyAlignment {
  planet1: string
  symbol1: string
  planet2: string
  symbol2: string
  type: string
  orb: number
}
export interface SkyConfig {
  kind: 'stellium' | 'grand-trine' | 't-square'
  signKey?: string
  planets: { name: string; symbol: string }[]
}
export interface SkyToday {
  date: string // yyyy-mm-dd (UTC)
  moon: SkyMoon
  retrogrades: SkyRetro[]
  alignments: SkyAlignment[]
  configs: SkyConfig[]
}

function isoOf(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
    d.getUTCDate(),
  ).padStart(2, '0')}`
}
function phaseIndex(angle: number): number {
  return Math.floor((normalize360(angle) + 22.5) / 45) % 8
}

function classifyAspect(sep: number): { type: string; orb: number } | null {
  for (const a of ASPECTS) {
    const orb = Math.abs(sep - a.angle)
    if (orb <= a.orb) return { type: a.type, orb: Math.round(orb * 10) / 10 }
  }
  return null
}

// From a daily series of geocentric longitudes, return the current retrograde
// window or the next upcoming one (null if neither within horizon).
function retrogradeFor(
  name: string,
  lon: number[],
  dates: Date[],
  todayIdx: number,
): SkyRetro | null {
  const motion: number[] = []
  for (let i = 0; i < lon.length - 1; i++) motion.push(signedDelta(lon[i], lon[i + 1]))

  if (motion[todayIdx] < 0) {
    let end = todayIdx
    while (end < motion.length && motion[end] < 0) end++
    return {
      planetKey: name,
      symbol: PLANET_SYMBOL[name],
      status: 'current',
      endISO: end < motion.length ? isoOf(dates[end]) : undefined,
    }
  }
  for (let i = todayIdx; i < motion.length - 1; i++) {
    if (motion[i] >= 0 && motion[i + 1] < 0) {
      const start = i + 1
      let end = start
      while (end < motion.length && motion[end] < 0) end++
      return {
        planetKey: name,
        symbol: PLANET_SYMBOL[name],
        status: 'upcoming',
        startISO: isoOf(dates[start]),
        endISO: end < motion.length ? isoOf(dates[end]) : undefined,
      }
    }
  }
  return null
}

function detectConfigs(lonByName: Record<string, number>): SkyConfig[] {
  const pts = PATTERN_PLANETS.map((name) => ({
    name,
    symbol: PLANET_SYMBOL[name],
    lon: lonByName[name],
  }))
  const configs: SkyConfig[] = []

  // Stellium: 3+ planets sharing a sign.
  const bySign: Record<string, typeof pts> = {}
  for (const p of pts) (bySign[signKeyOf(p.lon)] ??= []).push(p)
  for (const [sign, group] of Object.entries(bySign)) {
    if (group.length >= 3) {
      configs.push({
        kind: 'stellium',
        signKey: sign,
        planets: group.map((p) => ({ name: p.name, symbol: p.symbol })),
      })
    }
  }

  // Grand Trine: three planets each ~120° apart.
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++)
      for (let k = j + 1; k < pts.length; k++) {
        const t = (x: number) => Math.abs(x - 120) <= 7
        if (
          t(separation(pts[i].lon, pts[j].lon)) &&
          t(separation(pts[j].lon, pts[k].lon)) &&
          t(separation(pts[i].lon, pts[k].lon))
        ) {
          configs.push({
            kind: 'grand-trine',
            planets: [pts[i], pts[j], pts[k]].map((p) => ({ name: p.name, symbol: p.symbol })),
          })
        }
      }

  // T-Square: an opposition both ends of which square a third planet.
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++) {
      if (Math.abs(separation(pts[i].lon, pts[j].lon) - 180) > 7) continue
      for (let k = 0; k < pts.length; k++) {
        if (k === i || k === j) continue
        const sq = (x: number) => Math.abs(x - 90) <= 6
        if (sq(separation(pts[k].lon, pts[i].lon)) && sq(separation(pts[k].lon, pts[j].lon))) {
          configs.push({
            kind: 't-square',
            planets: [pts[i], pts[j], pts[k]].map((p) => ({ name: p.name, symbol: p.symbol })),
          })
        }
      }
    }

  const order = { stellium: 0, 'grand-trine': 1, 't-square': 2 } as const
  return configs.sort((x, y) => order[x.kind] - order[y.kind]).slice(0, 2)
}

export function computeSkyToday(now: Date): SkyToday {
  // ── Moon phase (from the natal ephemeris — validated, fine for phase) ──
  const natal = calculateNatalChart(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    now.getUTCDate(),
    12,
    0,
    0,
    0,
    false,
  )
  const sunLon = natal.planets[0].longitude
  const moonLon = natal.planets[1].longitude
  const gap = normalize360(moonLon - sunLon)
  const illumination = Math.round(((1 - Math.cos((gap * Math.PI) / 180)) / 2) * 100)

  // ── Geocentric planet positions for aspects / configurations ──
  const today = geocentricChart(now).lon

  const alignments: SkyAlignment[] = []
  for (let i = 0; i < PATTERN_PLANETS.length; i++) {
    for (let j = i + 1; j < PATTERN_PLANETS.length; j++) {
      const a = PATTERN_PLANETS[i]
      const b = PATTERN_PLANETS[j]
      const asp = classifyAspect(separation(today[a], today[b]))
      if (asp) {
        alignments.push({
          planet1: a,
          symbol1: PLANET_SYMBOL[a],
          planet2: b,
          symbol2: PLANET_SYMBOL[b],
          type: asp.type,
          orb: asp.orb,
        })
      }
    }
  }
  alignments.sort((x, y) => x.orb - y.orb)

  // ── Retrogrades: daily geocentric series over the horizon ──
  const startOffset = 3
  const dates: Date[] = []
  const series: Record<string, number>[] = []
  for (let off = -startOffset; off <= RETRO_HORIZON_DAYS; off++) {
    const d = new Date(now.getTime() + off * DAY_MS)
    dates.push(d)
    series.push(geocentricChart(d).lon)
  }
  const todayIdx = startOffset
  const retrogrades: SkyRetro[] = []
  for (const name of RETRO_CANDIDATES) {
    const rx = retrogradeFor(
      name,
      series.map((s) => s[name]),
      dates,
      todayIdx,
    )
    if (rx) retrogrades.push(rx)
  }
  retrogrades.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'current' ? -1 : 1
    return (a.startISO ?? '').localeCompare(b.startISO ?? '')
  })

  return {
    date: isoOf(now),
    moon: {
      phaseIndex: phaseIndex(gap),
      angle: gap,
      illumination,
      signKey: signKeyOf(moonLon),
      monthIndex: now.getUTCMonth(),
    },
    retrogrades,
    alignments: alignments.slice(0, 5),
    configs: detectConfigs(today),
  }
}
