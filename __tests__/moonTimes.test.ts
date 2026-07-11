import { describe, it, expect } from 'vitest'
import { moonEcliptic, daysSince2000At } from '@/lib/ephemeris'
import { computeMoonDay, moonAltitude, coordsForTimezone } from '@/lib/moonTimes'

// Schlyter's worked example (1990 Apr 19, 00:00 UT — d = −3543) gives the
// Moon at ecliptic lon 306.9484°, lat −0.5883°, r ≈ 60.68 Earth radii after
// perturbations. Everything else is self-consistency: the maths must agree
// with itself (altitude ≈ threshold at the computed rise/set instants, sane
// pass durations, progression bounded 0..1).

const MTL = { lat: 45.5, lon: -73.6 }
const TZ = 'America/Montreal'
const H0 = -0.583

describe('moonEcliptic — reference position', () => {
  it("reproduces Schlyter's 1990-04-19 worked example", () => {
    const d = daysSince2000At(new Date(Date.UTC(1990, 3, 19, 0, 0, 0)))
    expect(d).toBeCloseTo(-3543, 3)
    const m = moonEcliptic(d)
    expect(Math.abs(m.lon - 306.9484)).toBeLessThan(0.05)
    expect(Math.abs(m.lat - -0.5883)).toBeLessThan(0.05)
    expect(Math.abs(m.r - 60.68)).toBeLessThan(0.1)
  })

  it('moves ~11–15°/day (the lunar mean motion, perturbations included)', () => {
    const d0 = daysSince2000At(new Date(Date.UTC(2026, 6, 11, 12)))
    for (let k = 0; k < 30; k++) {
      const a = moonEcliptic(d0 + k).lon
      const b = moonEcliptic(d0 + k + 1).lon
      const step = (((b - a) % 360) + 360) % 360
      expect(step).toBeGreaterThan(10)
      expect(step).toBeLessThan(16)
    }
  })

  it('stays within ±5.4° ecliptic latitude and 55–64 Earth radii', () => {
    const d0 = daysSince2000At(new Date(Date.UTC(2026, 0, 1, 0)))
    for (let k = 0; k < 60; k++) {
      const m = moonEcliptic(d0 + k * 0.5)
      expect(Math.abs(m.lat)).toBeLessThan(5.4)
      expect(m.r).toBeGreaterThan(55)
      expect(m.r).toBeLessThan(64)
    }
  })
})

describe('computeMoonDay — self-consistency at mid-latitudes', () => {
  // A handful of dates spread across phases and seasons.
  const dates = [
    new Date(Date.UTC(2026, 6, 11, 18, 0, 0)),
    new Date(Date.UTC(2026, 0, 15, 6, 0, 0)),
    new Date(Date.UTC(2026, 3, 2, 23, 30, 0)),
    new Date(Date.UTC(2026, 9, 20, 12, 0, 0)),
  ]

  it('altitude sits at the rise/set threshold at each computed event', () => {
    for (const now of dates) {
      const day = computeMoonDay(now, TZ, MTL)
      for (const t of [day.rise, day.set]) {
        if (!t) continue
        // 10-min scan + linear interpolation: the Moon moves < 0.2°/10 min
        // vertically near the horizon at 45°N, so 0.25° is a fair bound.
        expect(Math.abs(moonAltitude(t, MTL.lat, MTL.lon) - H0)).toBeLessThan(0.25)
      }
    }
  })

  it('never reports always-up or always-down in Montréal', () => {
    for (const now of dates) {
      const day = computeMoonDay(now, TZ, MTL)
      expect(day.alwaysUp).toBe(false)
      expect(day.alwaysDown).toBe(false)
    }
  })

  it('keeps the progression within [0, 1] and only while the Moon is up', () => {
    for (let h = 0; h < 48; h += 3) {
      const now = new Date(Date.UTC(2026, 6, 10, h, 0, 0))
      const day = computeMoonDay(now, TZ, MTL)
      expect(day.up).toBe(moonAltitude(now, MTL.lat, MTL.lon) >= H0)
      if (day.progress !== null) {
        expect(day.up).toBe(true)
        expect(day.progress).toBeGreaterThanOrEqual(0)
        expect(day.progress).toBeLessThanOrEqual(1)
      }
    }
  })

  it('rise-to-set pass lasts a plausible 6–18 hours', () => {
    // When today's set follows today's rise, that's a complete pass.
    for (const now of dates) {
      const day = computeMoonDay(now, TZ, MTL)
      if (day.rise && day.set && day.set.getTime() > day.rise.getTime()) {
        const hours = (day.set.getTime() - day.rise.getTime()) / 3600000
        expect(hours).toBeGreaterThan(6)
        expect(hours).toBeLessThan(18)
      }
    }
  })
})

describe('coordsForTimezone', () => {
  it('maps known zones and falls back to Montréal', () => {
    expect(coordsForTimezone('Europe/Paris').lat).toBeCloseTo(48.9, 1)
    expect(coordsForTimezone('America/Vancouver').lon).toBeCloseTo(-123.1, 1)
    const fallback = coordsForTimezone('Antarctica/McMurdo')
    expect(fallback.lat).toBeCloseTo(45.5, 1)
    expect(fallback.lon).toBeCloseTo(-73.6, 1)
  })
})
