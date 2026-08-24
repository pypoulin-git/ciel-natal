import { describe, it, expect } from 'vitest'
import { computeCalendar, type CalEvent } from '@/lib/skyCalendar'

// Eclipses are computed from the Moon's ecliptic latitude at the exact syzygy
// (see skyCalendar.ts), not tabulated — so they must be pinned against the real
// 2026 eclipses. Reference: NASA eclipse catalogue.
//
//   2026-02-17  annular solar
//   2026-03-03  total lunar
//   2026-08-12  total solar   (Iceland / Spain — the big European one)
//   2026-08-28  partial lunar (the "Vogue" Full Moon eclipse)

function eclipsesIn(from: Date, months: number): CalEvent[] {
  return computeCalendar(from, months)
    .flatMap((m) => m.events)
    .filter((e) => e.type === 'eclipse-lunar' || e.type === 'eclipse-solar')
}

describe('eclipse detection — 2026', () => {
  const found = eclipsesIn(new Date(Date.UTC(2026, 0, 15, 12)), 12)

  const byDate = (iso: string) => found.find((e) => e.dateISO === iso)

  it('finds the four 2026 eclipses and nothing spurious', () => {
    const dates = found.map((e) => e.dateISO).sort()
    expect(dates).toEqual(['2026-02-17', '2026-03-03', '2026-08-12', '2026-08-28'])
  })

  it('classifies the 17 Feb 2026 annular solar eclipse', () => {
    const e = byDate('2026-02-17')!
    expect(e.type).toBe('eclipse-solar')
    expect(e.eclipseKind).toBe('annular')
  })

  it('classifies the 3 Mar 2026 total lunar eclipse', () => {
    const e = byDate('2026-03-03')!
    expect(e.type).toBe('eclipse-lunar')
    expect(e.eclipseKind).toBe('total')
  })

  it('classifies the 12 Aug 2026 total solar eclipse', () => {
    const e = byDate('2026-08-12')!
    expect(e.type).toBe('eclipse-solar')
    expect(e.eclipseKind).toBe('total')
  })

  it('classifies the 28 Aug 2026 partial lunar eclipse, in Pisces', () => {
    const e = byDate('2026-08-28')!
    expect(e.type).toBe('eclipse-lunar')
    expect(e.eclipseKind).toBe('partial')
    // The Moon is in Pisces, opposite the Virgo Sun.
    expect(e.signKey).toBe('Poissons')
  })

  it('gives an exact instant of maximum within ~30 min of the real one', () => {
    // NASA greatest eclipse: 2026-08-28 04:12 UT.
    const e = byDate('2026-08-28')!
    expect(e.atISO).toBeTruthy()
    const drift = Math.abs(
      new Date(e.atISO!).getTime() - Date.UTC(2026, 7, 28, 4, 12),
    )
    expect(drift).toBeLessThan(30 * 60 * 1000)
  })

  it('every eclipse doubles a New or Full Moon on the same day', () => {
    const all = computeCalendar(new Date(Date.UTC(2026, 0, 15, 12)), 12).flatMap((m) => m.events)
    for (const e of found) {
      const partner = e.type === 'eclipse-solar' ? 'new-moon' : 'full-moon'
      // The syzygy can tip over midnight relative to the noon-scan day, so
      // allow the paired lunation to sit on the adjacent day.
      const near = all.filter((x) => {
        if (x.type !== partner) return false
        const gap = Math.abs(
          new Date(x.dateISO + 'T12:00:00Z').getTime() -
            new Date(e.dateISO + 'T12:00:00Z').getTime(),
        )
        return gap <= 24 * 3600 * 1000
      })
      expect(near.length).toBeGreaterThan(0)
    }
  })
})

describe('eclipse detection — no false positives', () => {
  it('an ordinary lunation year keeps eclipses rare (2 to 7 a year)', () => {
    const found = eclipsesIn(new Date(Date.UTC(2027, 0, 15, 12)), 12)
    expect(found.length).toBeGreaterThanOrEqual(2)
    expect(found.length).toBeLessThanOrEqual(7)
  })
})
