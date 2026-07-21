import { describe, it, expect } from 'vitest'
import { encodeChartPayload, chartLinksFromFormData } from '@/lib/chartLink'

// The saved form_data schema evolves — these tests pin the defensive
// behaviours: legacy rows missing fields still produce working links, and
// non-Latin-1 characters never make btoa throw.

describe('encodeChartPayload', () => {
  it('encodes plain Latin-1 payloads round-trippably', () => {
    const payload = { n: 'Léa', l: 'Montréal, QC, Canada', j: 15 }
    const b64 = encodeChartPayload(payload)
    expect(b64).not.toBe('')
    expect(JSON.parse(atob(b64))).toEqual(payload)
  })

  it('survives non-Latin-1 characters (œ, typographic apostrophe, emoji)', () => {
    const payload = { n: 'Cœur d’Alène ✨', l: 'L’Île-des-Sœurs' }
    const b64 = encodeChartPayload(payload)
    expect(b64).not.toBe('')
    const decoded = JSON.parse(atob(b64)) as { n: string; l: string }
    // Transliterated, not crashed: œ→oe, ’→', emoji→?
    expect(decoded.n).toContain("Coeur d'Al")
    expect(decoded.l).toBe("L'Île-des-Soeurs") // Î is Latin-1, preserved
    expect(decoded.n).toContain('?') // the emoji
  })
})

describe('chartLinksFromFormData', () => {
  const full = {
    prenom: 'Léa', genre: 'femme', jour: 15, mois: 3, annee: 1990,
    heure: 8, minute: 30, hasTime: true, lieu: 'Québec, Canada',
    latitude: 46.8, longitude: -71.2, voice: 'sensible',
  }

  it('builds open + pdf links from a complete form_data', () => {
    const links = chartLinksFromFormData(full)
    expect(links).not.toBeNull()
    expect(links!.open).toMatch(/^\/carte-natale\?c=/)
    expect(links!.pdf).toBe(links!.open + '#pdf')
    const c = decodeURIComponent(links!.open.replace('/carte-natale?c=', ''))
    const payload = JSON.parse(atob(c))
    expect(payload.j).toBe(15)
    expect(payload.la).toBeCloseTo(46.8)
    expect(payload.v).toBe('sensible')
  })

  it('defaults missing legacy fields (voice, genre, hasTime, heure)', () => {
    const legacy = { jour: 2, mois: 7, annee: 1985, latitude: 45.5, longitude: -73.6 }
    const links = chartLinksFromFormData(legacy)
    expect(links).not.toBeNull()
    const payload = JSON.parse(atob(decodeURIComponent(links!.open.replace('/carte-natale?c=', ''))))
    expect(payload.v).toBe('sensible')
    expect(payload.g).toBe('femme')
    expect(payload.h).toBe(12)
    expect(payload.mn).toBe(0)
    expect(payload.ht).toBe(1)
    expect(payload.n).toBe('')
  })

  it('accepts a 0 longitude (Greenwich) — no truthiness trap', () => {
    const links = chartLinksFromFormData({ jour: 1, mois: 1, annee: 2000, latitude: 51.5, longitude: 0 })
    expect(links).not.toBeNull()
    const payload = JSON.parse(atob(decodeURIComponent(links!.open.replace('/carte-natale?c=', ''))))
    expect(payload.lo).toBe(0)
  })

  it('returns null when the birth data is unusable', () => {
    expect(chartLinksFromFormData(null)).toBeNull()
    expect(chartLinksFromFormData('junk')).toBeNull()
    expect(chartLinksFromFormData({ prenom: 'X' })).toBeNull()
    expect(chartLinksFromFormData({ jour: 1, mois: 1 })).toBeNull()
  })

  it('coerces stringly-typed numbers from old rows', () => {
    const links = chartLinksFromFormData({ jour: '15', mois: '3', annee: '1990', latitude: '46.8', longitude: '-71.2' })
    expect(links).not.toBeNull()
    const payload = JSON.parse(atob(decodeURIComponent(links!.open.replace('/carte-natale?c=', ''))))
    expect(payload.j).toBe(15)
    expect(payload.la).toBeCloseTo(46.8)
  })
})
