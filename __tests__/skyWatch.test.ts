import { describe, it, expect } from 'vitest'
import { computeCalendar, type CalEvent } from '@/lib/skyCalendar'

// Oppositions and greatest elongations are computed from the geocentric
// ephemeris, so they can be pinned against physics rather than a table:
//   • a superior planet opposes the Sun once per synodic period
//   • Venus never strays beyond ~47° from the Sun, Mercury beyond ~28°
// Those bounds are textbook constants — a strong, date-independent check.

function eventsOver(from: Date, months: number): CalEvent[] {
  return computeCalendar(from, months).flatMap((m) => m.events)
}

const YEAR_2026 = new Date(Date.UTC(2026, 0, 1, 12))

describe('oppositions', () => {
  const opp = eventsOver(YEAR_2026, 24).filter((e) => e.type === 'opposition')

  it('never reports Mercury or Venus (they cannot oppose the Sun)', () => {
    const inner = opp.filter((e) => e.planetKey === 'Mercure' || e.planetKey === 'Venus')
    expect(inner).toHaveLength(0)
  })

  it('gives Jupiter one opposition per synodic period (~399 days)', () => {
    const jup = opp
      .filter((e) => e.planetKey === 'Jupiter')
      .map((e) => new Date(e.dateISO + 'T12:00:00Z').getTime())
      .sort((a, b) => a - b)
    expect(jup.length).toBeGreaterThanOrEqual(2)
    const gapDays = (jup[1] - jup[0]) / 86400000
    expect(gapDays).toBeGreaterThan(380)
    expect(gapDays).toBeLessThan(420)
  })

  it('finds the Mars opposition of February 2027', () => {
    // Mars opposes the Sun only every ~26 months; the next one is 19 Feb 2027.
    const mars = opp.filter((e) => e.planetKey === 'Mars')
    expect(mars).toHaveLength(1)
    const d = new Date(mars[0].dateISO + 'T12:00:00Z')
    const drift = Math.abs(d.getTime() - Date.UTC(2027, 1, 19, 12)) / 86400000
    expect(drift).toBeLessThanOrEqual(2)
  })

  it('gives the slow outer planets exactly one opposition a year', () => {
    for (const p of ['Saturne', 'Uranus', 'Neptune']) {
      const n = opp.filter((e) => e.planetKey === p).length
      expect(n, `${p} oppositions over 24 months`).toBe(2)
    }
  })
})

describe('greatest elongations', () => {
  const elong = eventsOver(YEAR_2026, 24).filter((e) => e.type === 'elongation')

  it('only ever reports Mercury and Venus', () => {
    const others = elong.filter((e) => e.planetKey !== 'Mercure' && e.planetKey !== 'Venus')
    expect(others).toHaveLength(0)
  })

  it("keeps Venus within its real 45-47° swing", () => {
    const venus = elong.filter((e) => e.planetKey === 'Venus')
    expect(venus.length).toBeGreaterThanOrEqual(2)
    for (const e of venus) {
      expect(Math.abs(e.elongDeg!)).toBeGreaterThan(44)
      expect(Math.abs(e.elongDeg!)).toBeLessThan(48)
    }
  })

  it('keeps Mercury within its real 18-28° swing', () => {
    const merc = elong.filter((e) => e.planetKey === 'Mercure')
    expect(merc.length).toBeGreaterThanOrEqual(6)
    for (const e of merc) {
      expect(Math.abs(e.elongDeg!)).toBeGreaterThan(17)
      expect(Math.abs(e.elongDeg!)).toBeLessThan(29)
    }
  })

  it('alternates evening (east) and morning (west) apparitions', () => {
    const merc = elong
      .filter((e) => e.planetKey === 'Mercure')
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
    // Mercury swings from one side of the Sun to the other each time.
    for (let i = 1; i < merc.length; i++) {
      expect(merc[i].elongDeg! > 0).not.toBe(merc[i - 1].elongDeg! > 0)
    }
  })
})
