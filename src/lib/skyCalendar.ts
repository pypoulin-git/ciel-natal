// Celestial calendar — scans the next ~12 months and emits the notable events:
// New / Full Moons, planetary retrograde stations (begin + end) and the Sun's
// sign ingresses. Same engines as the homepage panel: the natal ephemeris
// (astro.ts) for the Moon & Sun, and the geocentric ephemeris (ephemeris.ts)
// for the planets (the only source that reproduces retrograde motion).

import { calculateNatalChart, SIGNS } from './astro'
import {
  geocentricChart,
  geocentricLongitudes,
  moonEcliptic,
  daysSince2000At,
  EPHEM_PLANETS,
} from './ephemeris'
import { METEOR_SHOWERS } from '@/data/meteorShowers'

const DAY_MS = 86400000

function norm(a: number): number {
  return ((a % 360) + 360) % 360
}
function signedDelta(a: number, b: number): number {
  let d = norm(b - a)
  if (d > 180) d -= 360
  return d
}
function signIndex(lon: number): number {
  return Math.floor(norm(lon) / 30)
}
function isoOf(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
    d.getUTCDate(),
  ).padStart(2, '0')}`
}

export type CalEventType =
  | 'new-moon'
  | 'full-moon'
  | 'retro-begin'
  | 'retro-end'
  | 'sun-ingress'
  | 'meteor-shower'
  | 'eclipse-lunar'
  | 'eclipse-solar'

/** Lunar: total > partial > penumbral. Solar: total / annular / partial. */
export type EclipseKind = 'total' | 'partial' | 'penumbral' | 'annular'

export interface CalEvent {
  dateISO: string
  type: CalEventType
  planetKey?: string // for retro-*
  signKey: string // moon sign / planet sign / new Sun sign ('' for meteor showers)
  // meteor-shower only: which shower, and how bright the Moon is at the peak
  // (moonPct 0–100 — a full Moon washes out faint meteors).
  meteorKey?: string
  moonPct?: number
  // eclipse-* only: severity and the exact instant of maximum (UTC, ISO), so
  // the UI can show it in the visitor's own local time.
  eclipseKind?: EclipseKind
  atISO?: string
}

export interface CalMonth {
  year: number
  month: number // 1..12
  monthIndex: number // 0..11 — for the traditional monthly Moon name
  events: CalEvent[]
}

function noonUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0))
}

// Sun + Moon ecliptic longitudes for a date (from the natal ephemeris).
function sunMoon(d: Date): { sun: number; moon: number } {
  const c = calculateNatalChart(
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    12,
    0,
    0,
    0,
    false,
  )
  return { sun: c.planets[0].longitude, moon: c.planets[1].longitude }
}

// ─── Eclipses ───────────────────────────────────────────────────────────────
// An eclipse is a syzygy (New/Full Moon) that happens close to a lunar node —
// i.e. when the Moon's ecliptic LATITUDE is near zero. Our Schlyter lunar
// theory gives that latitude, so eclipses are computed, not tabulated.
//
// Method: bisect the exact instant where the Moon–Sun elongation hits 0° (new)
// or 180° (full), then read the Moon's latitude and distance there.
// Validated against the real 2026–2027 eclipses (instants within minutes, and
// every type correctly classified).

const ECL_WINDOW_MS = 36 * 3600 * 1000

function elongationAt(t: Date): number {
  const d = daysSince2000At(t)
  return norm(moonEcliptic(d).lon - geocentricLongitudes(d).Soleil)
}

/** Signed offset from the target elongation, in (-180, 180]. */
function syzygyOffset(t: Date, target: number): number {
  let x = norm(elongationAt(t) - target)
  if (x > 180) x -= 360
  return x
}

/** Exact syzygy instant near `day`, or null if none in the ±36 h window. */
function refineSyzygy(day: Date, target: number): Date | null {
  let lo = new Date(day.getTime() - ECL_WINDOW_MS)
  let hi = new Date(day.getTime() + ECL_WINDOW_MS)
  let fLo = syzygyOffset(lo, target)
  const fHi = syzygyOffset(hi, target)
  if (fLo === 0) return lo
  // Bisection needs a sign change across the window.
  if (fLo < 0 === fHi < 0) return null
  for (let i = 0; i < 60; i++) {
    const mid = new Date((lo.getTime() + hi.getTime()) / 2)
    const fMid = syzygyOffset(mid, target)
    if (fLo < 0 === fMid < 0) {
      lo = mid
      fLo = fMid
    } else {
      hi = mid
    }
  }
  return new Date((lo.getTime() + hi.getTime()) / 2)
}

// Latitude limits (degrees). The Moon's horizontal parallax is ~0.95°, so an
// ecliptic latitude of ~0.95° puts the shadow axis about one Earth radius off
// centre — the classic limit for a central solar eclipse.
const LUNAR_TOTAL = 0.4
const LUNAR_PARTIAL = 1.0
const LUNAR_PENUMBRAL = 1.55
const SOLAR_CENTRAL = 0.94
const SOLAR_PARTIAL = 1.47
// Apparent-size crossover: nearer than this the Moon covers the Sun (total),
// farther away a ring of Sun remains (annular).
const ANNULAR_DISTANCE = 59.6 // Earth radii

/** Classify the eclipse at a syzygy instant, or null if the Moon misses. */
function classifyEclipse(
  at: Date,
  solar: boolean,
): { kind: EclipseKind; moonLon: number } | null {
  const m = moonEcliptic(daysSince2000At(at))
  const lat = Math.abs(m.lat)
  if (solar) {
    if (lat > SOLAR_PARTIAL) return null
    const kind: EclipseKind =
      lat <= SOLAR_CENTRAL ? (m.r < ANNULAR_DISTANCE ? 'total' : 'annular') : 'partial'
    return { kind, moonLon: m.lon }
  }
  if (lat > LUNAR_PENUMBRAL) return null
  const kind: EclipseKind =
    lat <= LUNAR_TOTAL ? 'total' : lat <= LUNAR_PARTIAL ? 'partial' : 'penumbral'
  return { kind, moonLon: m.lon }
}

/** Build the eclipse event for a detected New/Full Moon day, if any. */
function eclipseFor(day: Date, solar: boolean): CalEvent | null {
  const at = refineSyzygy(day, solar ? 0 : 180)
  if (!at) return null
  const hit = classifyEclipse(at, solar)
  if (!hit) return null
  return {
    dateISO: isoOf(at),
    type: solar ? 'eclipse-solar' : 'eclipse-lunar',
    signKey: SIGNS[signIndex(hit.moonLon)],
    eclipseKind: hit.kind,
    atISO: at.toISOString(),
  }
}

export function computeCalendar(now: Date, monthsCount = 12): CalMonth[] {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 12, 0, 0))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthsCount, 1, 12, 0, 0))

  const events: CalEvent[] = []

  // Previous-day state for crossing / station detection.
  let prevDay: Date | null = null
  let prevElong = 0
  let prevSunSign = -1
  const prevLon: Record<string, number> = {}
  const prevMotionSign: Record<string, number> = {} // +1 direct, -1 retro

  for (let t = start.getTime(); t <= end.getTime(); t += DAY_MS) {
    const day = noonUTC(new Date(t))
    const { sun, moon } = sunMoon(day)
    const elong = norm(moon - sun)
    const geo = geocentricChart(day).lon
    const sunSign = signIndex(sun)

    if (prevDay) {
      // ── New Moon: elongation wraps 360 → 0 (drops) ──
      if (elong < prevElong) {
        events.push({ dateISO: isoOf(day), type: 'new-moon', signKey: SIGNS[signIndex(moon)] })
        // A New Moon near a node eclipses the Sun.
        const ecl = eclipseFor(day, true)
        if (ecl) events.push(ecl)
      }
      // ── Full Moon: elongation crosses 180 upward ──
      if (prevElong < 180 && elong >= 180) {
        events.push({ dateISO: isoOf(day), type: 'full-moon', signKey: SIGNS[signIndex(moon)] })
        // A Full Moon near a node passes through Earth's shadow.
        const ecl = eclipseFor(day, false)
        if (ecl) events.push(ecl)
      }
      // ── Sun ingress: sign index advances ──
      if (sunSign !== prevSunSign) {
        events.push({ dateISO: isoOf(day), type: 'sun-ingress', signKey: SIGNS[sunSign] })
      }
      // ── Planetary retrograde / direct stations ──
      for (const name of EPHEM_PLANETS) {
        const motion = signedDelta(prevLon[name], geo[name])
        const sign = motion < 0 ? -1 : 1
        const prev = prevMotionSign[name]
        if (prev !== undefined && sign !== prev) {
          events.push({
            dateISO: isoOf(day),
            type: sign < 0 ? 'retro-begin' : 'retro-end',
            planetKey: name,
            signKey: SIGNS[signIndex(geo[name])],
          })
        }
        prevMotionSign[name] = sign
      }
    }

    prevDay = day
    prevElong = elong
    prevSunSign = sunSign
    for (const name of EPHEM_PLANETS) prevLon[name] = geo[name]
  }

  // ── Meteor showers ── curated annual peaks projected into the window, each
  // flagged with the Moon's illumination that year (moonlight is the main
  // spoiler for faint meteors).
  for (let y = start.getUTCFullYear(); y <= end.getUTCFullYear(); y++) {
    for (const s of METEOR_SHOWERS) {
      const peak = new Date(Date.UTC(y, s.peak.month - 1, s.peak.day, 12, 0, 0))
      if (peak.getTime() < start.getTime() || peak.getTime() > end.getTime()) continue
      const { sun, moon } = sunMoon(peak)
      const gap = norm(moon - sun)
      const moonPct = Math.round(((1 - Math.cos((gap * Math.PI) / 180)) / 2) * 100)
      events.push({
        dateISO: isoOf(peak),
        type: 'meteor-shower',
        signKey: '',
        meteorKey: s.key,
        moonPct,
      })
    }
  }

  // Group into months covering [current month, +11].
  const months: CalMonth[] = []
  for (let m = 0; m < monthsCount; m++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + m, 1))
    const year = d.getUTCFullYear()
    const month = d.getUTCMonth() + 1
    months.push({
      year,
      month,
      monthIndex: d.getUTCMonth(),
      events: events
        .filter((e) => {
          const ed = new Date(e.dateISO + 'T12:00:00Z')
          return ed.getUTCFullYear() === year && ed.getUTCMonth() + 1 === month
        })
        .sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
    })
  }
  return months
}
