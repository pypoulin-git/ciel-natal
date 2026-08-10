import { describe, it, expect } from 'vitest'
import {
  DREAM_IMAGE_MONTHLY_LIMIT,
  DREAM_LIFETIME_LIMIT,
  DREAM_MONTHLY_LIMIT,
  quotaMessage,
} from '../dreamLimits'

describe('dream quotas', () => {
  it('keeps images far tighter than text — they cost ~20× more each', () => {
    expect(DREAM_IMAGE_MONTHLY_LIMIT).toBeLessThan(DREAM_MONTHLY_LIMIT)
    expect(DREAM_LIFETIME_LIMIT).toBeGreaterThan(DREAM_MONTHLY_LIMIT)
  })
})

describe('quotaMessage', () => {
  it('tells someone out of images about IMAGES, not interpretations', () => {
    const fr = quotaMessage('image', 'MONTHLY', 'fr')
    expect(fr).toContain('images de rêve')
    expect(fr).not.toContain('interprétations')

    const en = quotaMessage('image', 'MONTHLY', 'en')
    expect(en).toContain('dream images')
    expect(en).not.toContain('interpretations')
  })

  it('quotes the real limit, so the copy cannot drift from the constant', () => {
    expect(quotaMessage('image', 'MONTHLY', 'fr')).toContain(String(DREAM_IMAGE_MONTHLY_LIMIT))
    expect(quotaMessage('image', 'MONTHLY', 'en')).toContain(String(DREAM_IMAGE_MONTHLY_LIMIT))
  })

  it('keeps the interpretation wording for interpretations', () => {
    expect(quotaMessage('interpretation', 'MONTHLY', 'fr')).toContain('interprétations')
    expect(quotaMessage('interpretation', 'MONTHLY', 'en')).toContain('interpretations')
  })

  it('sends a lifetime ceiling to a human rather than to next month', () => {
    expect(quotaMessage('interpretation', 'LIFETIME', 'fr')).toContain('Écris-nous')
    expect(quotaMessage('image', 'LIFETIME', 'en')).toContain('Get in touch')
  })
})
