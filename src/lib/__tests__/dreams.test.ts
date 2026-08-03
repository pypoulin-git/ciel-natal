import { describe, it, expect } from 'vitest'
import {
  dominantEmotion,
  gaugeFromFocus,
  readingForGauge,
  sanitizeEmotions,
  type Dream,
} from '../dreams'
import {
  buildImagePrompt,
  buildInterpretDreamPrompt,
  interpretDreamSystem,
  parseModelJson,
  type InterpretDreamOptions,
} from '../dreamPrompts'

const dream = (emotions: string[]) => ({ emotions }) as unknown as Pick<Dream, 'emotions'>

describe('dominantEmotion', () => {
  it('returns null when there is nothing to show', () => {
    expect(dominantEmotion([])).toBeNull()
    expect(dominantEmotion([dream([])])).toBeNull()
  })

  it('picks the most frequent emotion of the day', () => {
    const dreams = [dream(['joy', 'peace']), dream(['peace']), dream(['anger'])]
    expect(dominantEmotion(dreams)).toBe('peace')
  })

  it('breaks ties deterministically, so the calendar dot never flickers', () => {
    const dreams = [dream(['anger']), dream(['joy'])]
    // 'joy' comes first in EMOTION_KEYS, so it wins a tie every time.
    expect(dominantEmotion(dreams)).toBe('joy')
    expect(dominantEmotion([...dreams].reverse())).toBe('joy')
  })

  it('ignores emotions the model invented outside the taxonomy', () => {
    expect(dominantEmotion([dream(['nostalgie', 'nostalgie', 'joy'])])).toBe('joy')
  })
})

describe('sanitizeEmotions', () => {
  it('keeps only canonical keys and de-duplicates', () => {
    expect(sanitizeEmotions(['joy', 'joy', 'bogus', 42, null, 'fear'])).toEqual(['joy', 'fear'])
  })

  it('tolerates a non-array', () => {
    expect(sanitizeEmotions('joy')).toEqual([])
    expect(sanitizeEmotions(undefined)).toEqual([])
  })
})

describe('readingForGauge', () => {
  it('maps the slider onto the three readings', () => {
    expect(readingForGauge(0)).toBe('factual')
    expect(readingForGauge(0.32)).toBe('factual')
    expect(readingForGauge(0.5)).toBe('blended')
    expect(readingForGauge(0.66)).toBe('blended')
    expect(readingForGauge(0.67)).toBe('spiritual')
    expect(readingForGauge(1)).toBe('spiritual')
  })
})

describe('gaugeFromFocus', () => {
  it('centres the gauge when no preference is saved', () => {
    expect(gaugeFromFocus(undefined)).toBe(0.5)
    expect(gaugeFromFocus(NaN)).toBe(0.5)
  })

  it('maps the 1-10 focus slider onto 0-1', () => {
    expect(gaugeFromFocus(1)).toBe(0)
    expect(gaugeFromFocus(10)).toBe(1)
    expect(gaugeFromFocus(5.5)).toBe(0.5)
  })

  it('clamps out-of-range values', () => {
    expect(gaugeFromFocus(-3)).toBe(0)
    expect(gaugeFromFocus(99)).toBe(1)
  })
})

describe('parseModelJson', () => {
  it('parses clean JSON', () => {
    expect(parseModelJson<{ a: number }>('{"a":1}')).toEqual({ a: 1 })
  })

  it('survives a markdown fence — the failure that cost the prototype whole generations', () => {
    expect(parseModelJson<{ a: number }>('```json\n{"a":1}\n```')).toEqual({ a: 1 })
    expect(parseModelJson<{ a: number }>('```\n{"a":1}\n```')).toEqual({ a: 1 })
  })

  it('survives prose wrapped around the object', () => {
    expect(parseModelJson<{ a: number }>('Voici le JSON :\n{"a":1}\nVoilà.')).toEqual({ a: 1 })
  })

  it('returns null rather than throwing on junk', () => {
    expect(parseModelJson('not json at all')).toBeNull()
    expect(parseModelJson('')).toBeNull()
  })
})

const baseOptions: InterpretDreamOptions = {
  structuredText: 'Je marchais sur une plage la nuit.',
  tags: ['eau', 'nuit'],
  emotions: ['anxiety'],
  characters: [],
  places: ['plage'],
  gaugeValue: 0.5,
  locale: 'fr',
  voice: 'sensible',
  genre: 'femme',
}

describe('buildInterpretDreamPrompt', () => {
  it('omits the natal block entirely when there is no chart', () => {
    const prompt = buildInterpretDreamPrompt(baseOptions)
    expect(prompt).not.toContain('CONTEXTE NATAL')
    expect(prompt).toContain('plage')
  })

  it('adds the natal block when the dreamer has a chart', () => {
    const prompt = buildInterpretDreamPrompt({
      ...baseOptions,
      astro: { moonSign: 'Scorpion', sunSign: 'Vierge', ascendant: 'Balance' },
    })
    expect(prompt).toContain('CONTEXTE NATAL')
    expect(prompt).toContain('Lune natale en Scorpion')
    expect(prompt).toContain('Soleil en Vierge')
    expect(prompt).toContain('Ascendant en Balance')
    // The natal colouring belongs to the spiritual reading only.
    expect(prompt).toContain('lecture SPIRITUELLE')
  })

  it('includes only the placements we actually have', () => {
    const prompt = buildInterpretDreamPrompt({ ...baseOptions, astro: { moonSign: 'Cancer' } })
    expect(prompt).toContain('Lune natale en Cancer')
    expect(prompt).not.toContain('Soleil en')
    expect(prompt).not.toContain('Ascendant en')
  })

  it('reports empty metadata as "aucun" rather than leaving a dangling label', () => {
    const prompt = buildInterpretDreamPrompt({ ...baseOptions, characters: [], tags: [] })
    expect(prompt).toContain('Personnages : aucun')
    expect(prompt).toContain('Tags : aucun')
  })

  it('translates the gauge into a stated leaning', () => {
    expect(buildInterpretDreamPrompt({ ...baseOptions, gaugeValue: 0.1 })).toContain('factuel')
    expect(buildInterpretDreamPrompt({ ...baseOptions, gaugeValue: 0.9 })).toContain('spirituel')
    expect(buildInterpretDreamPrompt({ ...baseOptions, gaugeValue: 0.5 })).toContain('équilibré')
  })
})

describe('interpretDreamSystem', () => {
  it('demands all three readings and forbids markdown', () => {
    const system = interpretDreamSystem(baseOptions)
    expect(system).toContain('trois lectures distinctes')
    expect(system).toContain('pas de backticks')
    expect(system).toContain('"factual"')
    expect(system).toContain('"spiritual"')
    expect(system).toContain('"blended"')
  })

  it('carries the safety guardrails that make this shippable', () => {
    const system = interpretDreamSystem(baseOptions)
    expect(system).toContain('Ne pose jamais de diagnostic')
    expect(system).toContain('jamais anxiogène')
  })

  it('applies the reader gender agreement', () => {
    expect(interpretDreamSystem({ ...baseOptions, genre: 'femme' })).toContain('Accords féminins')
    expect(interpretDreamSystem({ ...baseOptions, genre: 'homme' })).toContain('Accords masculins')
  })

  it('switches language wholesale', () => {
    const system = interpretDreamSystem({ ...baseOptions, locale: 'en' })
    expect(system).toContain('three distinct readings')
    expect(system).toContain('no backticks')
  })
})

describe('buildImagePrompt', () => {
  it('folds places, emotion moods and tags into the watercolour style', () => {
    const { prompt, negativePrompt } = buildImagePrompt(
      'Une plage la nuit',
      ['eau'],
      ['anxiety'],
      ['plage'],
    )
    expect(prompt).toContain('dreamy watercolor painting')
    expect(prompt).toContain('plage')
    expect(prompt).toContain('swirling shadows, tension') // the anxiety mood
    expect(negativePrompt).toContain('watermark')
  })

  it('stays within the 500-character prompt budget', () => {
    const { prompt } = buildImagePrompt('x'.repeat(4000), ['a', 'b', 'c', 'd'], ['joy'], ['ici'])
    expect(prompt.length).toBeLessThanOrEqual(500)
  })

  it('ignores emotions with no visual mapping', () => {
    const { prompt } = buildImagePrompt('Un rêve', [], ['inventée'], [])
    expect(prompt).toContain('dreamy watercolor painting')
  })
})
