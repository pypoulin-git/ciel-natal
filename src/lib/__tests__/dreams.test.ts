import { describe, it, expect } from 'vitest'
import {
  dominantEmotion,
  gaugeFromFocus,
  readingForGauge,
  sanitizeEmotions,
  type Dream,
} from '../dreams'
import {
  buildFallbackImagePrompt,
  buildImageBriefPrompt,
  buildInterpretDreamPrompt,
  composeImagePrompt,
  imageBriefSystem,
  interpretDreamSystem,
  parseModelJson,
  type ImageBriefOptions,
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

// ── Imagery ───────────────────────────────────────────────────────────────
// These tests exist because of a real defect: the first version put the style
// string first and the dream last, then truncated the whole thing to 500
// characters — so the cap ate the dream and left the boilerplate. The scene
// coming FIRST and surviving intact is the property worth guarding.

const briefOptions: ImageBriefOptions = {
  structuredText: "Je marchais dans une maison inondée, l'escalier disparaissait sous l'eau.",
  title: 'La maison inondée',
  tags: ['eau', 'maison'],
  emotions: ['anxiety'],
  characters: ['ma sœur'],
  places: ['une maison inondée'],
}

describe('buildImageBriefPrompt', () => {
  it('gives the model the whole dream, never a snippet', () => {
    const long = 'Une phrase du rêve. '.repeat(200)
    const prompt = buildImageBriefPrompt({ ...briefOptions, structuredText: long })
    expect(prompt).toContain(long)
  })

  it('carries the dreamer’s own places, characters and tags', () => {
    const prompt = buildImageBriefPrompt(briefOptions)
    expect(prompt).toContain('une maison inondée')
    expect(prompt).toContain('ma sœur')
    expect(prompt).toContain('eau, maison')
    expect(prompt).toContain('swirling shadows, tension') // the anxiety mood
  })

  it('adds the symbolic reading only when there is one', () => {
    expect(buildImageBriefPrompt(briefOptions)).not.toContain('SYMBOLIC READING')
    const withReading = buildImageBriefPrompt({
      ...briefOptions,
      spiritualReading: "L'eau qui monte est le seuil.",
    })
    expect(withReading).toContain('SYMBOLIC READING')
    expect(withReading).toContain("L'eau qui monte est le seuil.")
  })

  it('passes an adjustment and the brief it replaces', () => {
    const prompt = buildImageBriefPrompt({
      ...briefOptions,
      instruction: 'plus sombre, sans personnage',
      previousPrompt: 'A flooded staircase at dusk.',
    })
    expect(prompt).toContain('plus sombre, sans personnage')
    expect(prompt).toContain('A flooded staircase at dusk.')
  })

  it('omits the previous brief when nothing is being adjusted', () => {
    const prompt = buildImageBriefPrompt({
      ...briefOptions,
      previousPrompt: 'A flooded staircase at dusk.',
    })
    expect(prompt).not.toContain('A flooded staircase at dusk.')
  })

  it('ignores emotions with no visual mapping', () => {
    const prompt = buildImageBriefPrompt({ ...briefOptions, emotions: ['inventée'] })
    expect(prompt).toContain('none stated')
  })
})

describe('imageBriefSystem', () => {
  it('anchors the brief in what the dreamer actually described', () => {
    const system = imageBriefSystem()
    expect(system).toContain('ACTUALLY described')
    expect(system).toContain('Choose ONE moment')
    expect(system).toContain('Never a recognisable face')
  })
})

describe('composeImagePrompt', () => {
  it('puts the scene first and the style after it', () => {
    const composed = composeImagePrompt('A flooded staircase at dusk.')
    expect(composed.indexOf('A flooded staircase')).toBeLessThan(
      composed.indexOf('dreamy watercolour'),
    )
  })

  it('never truncates the scene', () => {
    const scene = 'A very long described scene. '.repeat(60).trim()
    expect(composeImagePrompt(scene)).toContain(scene)
  })

  it('carries the exclusions in prose, since Gemini takes no negative prompt', () => {
    expect(composeImagePrompt('A scene.')).toContain('watermarks')
  })
})

describe('buildFallbackImagePrompt', () => {
  it('still leads with the dream, not the boilerplate', () => {
    const prompt = buildFallbackImagePrompt(briefOptions)
    expect(prompt.indexOf('maison inondée')).toBeLessThan(prompt.indexOf('dreamy watercolour'))
    expect(prompt).toContain('swirling shadows, tension')
  })

  it('survives a dream with no places and no mapped emotions', () => {
    const prompt = buildFallbackImagePrompt({
      ...briefOptions,
      places: [],
      emotions: [],
    })
    expect(prompt).toContain('maison inondée')
  })
})
