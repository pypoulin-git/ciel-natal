// Celestial calendar — scans the next ~12 months and emits the notable events:
// New / Full Moons, planetary retrograde stations (begin + end) and the Sun's
// sign ingresses. Same engines as the homepage panel: the natal ephemeris
// (astro.ts) for the Moon & Sun, and the geocentric ephemeris (ephemeris.ts)
// for the planets (the only source that reproduces retrograde motion).

import { calculateNatalChart, SIGNS } from './astro'
import { geocentricChart, EPHEM_PLANETS } from './ephemeris'

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

export type CalEventType = 'new-moon' | 'full-moon' | 'retro-begin' | 'retro-end' | 'sun-ingress'

export interface CalEvent {
  dateISO: string
  type: CalEventType
  planetKey?: string // for retro-*
  signKey: string // moon sign / planet sign / new Sun sign
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
      }
      // ── Full Moon: elongation crosses 180 upward ──
      if (prevElong < 180 && elong >= 180) {
        events.push({ dateISO: isoOf(day), type: 'full-moon', signKey: SIGNS[signIndex(moon)] })
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
