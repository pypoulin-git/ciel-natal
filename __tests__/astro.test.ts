import { describe, it, expect } from 'vitest'
import { translateSign, translatePlanet } from '@/lib/astro'

describe('translateSign', () => {
  it('translates French sign keys to English', () => {
    expect(translateSign('Belier', 'en')).toBe('Aries')
    expect(translateSign('Cancer', 'en')).toBe('Cancer')
    expect(translateSign('Poissons', 'en')).toBe('Pisces')
  })

  it('adds accents when displaying in French', () => {
    expect(translateSign('Belier', 'fr')).toBe('Bélier')
    expect(translateSign('Gemeaux', 'fr')).toBe('Gémeaux')
  })

  it('returns original sign when locale not matched', () => {
    expect(translateSign('Lion', 'fr')).toBe('Lion')
  })
})

describe('translatePlanet', () => {
  it('translates French planets to English', () => {
    expect(translatePlanet('Soleil', 'en')).toBe('Sun')
    expect(translatePlanet('Lune', 'en')).toBe('Moon')
    expect(translatePlanet('Mars', 'en')).toBe('Mars')
    expect(translatePlanet('Noeud Nord', 'en')).toBe('North Node')
  })

  it('returns original name for French locale', () => {
    expect(translatePlanet('Soleil', 'fr')).toBe('Soleil')
  })

  it('falls back to original if planet not in map', () => {
    expect(translatePlanet('Unknown', 'en')).toBe('Unknown')
  })
})
