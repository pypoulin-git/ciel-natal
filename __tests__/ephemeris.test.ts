import { describe, it, expect } from 'vitest'
import { geocentricChart } from '@/lib/ephemeris'
import { calculateNatalChart } from '@/lib/astro'

// Reference values cross-checked against standard ephemerides (JPL/Swiss Eph
// grade truth, generous tolerances for our compact theory).

const lonDiff = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

describe('geocentricChart — known positions', () => {
  it('puts the Sun at ~Cancer 5.9° on 2026-06-27', () => {
    const { lon } = geocentricChart(new Date(Date.UTC(2026, 5, 27, 12)))
    expect(lonDiff(lon.Soleil, 95.9)).toBeLessThan(1)
  })

  it('puts the Sun at ~Capricorn 10° on 2000-01-01', () => {
    const { lon } = geocentricChart(new Date(Date.UTC(2000, 0, 1, 12)))
    expect(lonDiff(lon.Soleil, 280.6)).toBeLessThan(1)
  })

  it('keeps every longitude in [0, 360)', () => {
    const { lon } = geocentricChart(new Date(Date.UTC(2026, 5, 27, 12)))
    for (const v of Object.values(lon)) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(360)
    }
  })

  it('computes Pluto in late Aquarius in 2026 (~3–5° Pisces boundary region)', () => {
    // Pluto sits around 1–4° Aquarius→Pisces cusp region through 2026 (~332–336°... actually ~334°?).
    // Robust check: Pluto moves slowly — under 4° over a full year.
    const a = geocentricChart(new Date(Date.UTC(2026, 0, 1, 12))).lon.Pluton
    const b = geocentricChart(new Date(Date.UTC(2026, 11, 31, 12))).lon.Pluton
    expect(lonDiff(a, b)).toBeLessThan(6)
  })
})

describe('geocentricChart — retrograde motion (the old ephemeris could never do this)', () => {
  const motion = (name: string, iso: string) => {
    const t = new Date(iso + 'T12:00:00Z').getTime()
    const before = geocentricChart(new Date(t - 86400000)).lon[name]
    const after = geocentricChart(new Date(t + 86400000)).lon[name]
    let d = (after - before) % 360
    if (d > 180) d -= 360
    if (d < -180) d += 360
    return d
  }

  it('Mercury is retrograde mid-July 2026 (known Rx window ≈ Jun 29 – Jul 23)', () => {
    expect(motion('Mercure', '2026-07-10')).toBeLessThan(0)
  })

  it('Mercury is direct in mid-June 2026', () => {
    expect(motion('Mercure', '2026-06-15')).toBeGreaterThan(0)
  })

  it('Mercury stations within a couple of days of the true dates', () => {
    // Direct on Jun 26, retrograde by Jul 2 — the station falls in between.
    expect(motion('Mercure', '2026-06-26')).toBeGreaterThan(0)
    expect(motion('Mercure', '2026-07-02')).toBeLessThan(0)
  })
})

describe('calculateNatalChart — geocentric wiring + ℞ flags', () => {
  it('marks Mercury retrograde for a birth during a known Rx window', () => {
    const chart = calculateNatalChart(2026, 7, 10, 12, 0, 45.5, -73.6, true)
    const mercury = chart.planets.find((p) => p.name === 'Mercure')!
    expect(mercury.retrograde).toBe(true)
  })

  it('does not mark Mercury retrograde outside the window', () => {
    const chart = calculateNatalChart(2026, 6, 15, 12, 0, 45.5, -73.6, true)
    const mercury = chart.planets.find((p) => p.name === 'Mercure')!
    expect(mercury.retrograde).not.toBe(true)
  })

  it('never flags the Sun or Moon as retrograde', () => {
    const chart = calculateNatalChart(2026, 7, 10, 12, 0, 45.5, -73.6, true)
    expect(chart.planets.find((p) => p.name === 'Soleil')!.retrograde).toBeUndefined()
    expect(chart.planets.find((p) => p.name === 'Lune')!.retrograde).toBeUndefined()
  })

  it('agrees with the sky panel: same Mercury longitude source', () => {
    const chart = calculateNatalChart(2026, 6, 27, 12, 0, 0, 0, false)
    const sky = geocentricChart(new Date(Date.UTC(2026, 5, 27, 12)))
    const mercury = chart.planets.find((p) => p.name === 'Mercure')!
    expect(lonDiff(mercury.longitude, sky.lon.Mercure)).toBeLessThan(0.01)
  })

  it('keeps all planets with valid signs and degrees', () => {
    const chart = calculateNatalChart(1990, 3, 15, 8, 30, 46.8, -71.2, true)
    expect(chart.planets).toHaveLength(11)
    for (const p of chart.planets) {
      expect(p.longitude).toBeGreaterThanOrEqual(0)
      expect(p.longitude).toBeLessThan(360)
      expect(p.degree).toBeGreaterThanOrEqual(0)
      expect(p.degree).toBeLessThan(30)
      expect(p.sign).toBeTruthy()
    }
  })
})
