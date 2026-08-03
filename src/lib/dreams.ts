/**
 * Dream journal — shared types, the emotion taxonomy, and small helpers.
 *
 * The eight emotions come from the Reverie prototype, re-tinted onto
 * Natalune's palette. Their colours live as CSS variables in globals.css so
 * the light theme can override them (a hex that reads on #0a0a16 is unusable
 * on #e9f1fb). Accessibility rule inherited from Reverie and kept here:
 * ALWAYS render icon + colour, never colour alone.
 */

export const EMOTION_KEYS = [
  'joy',
  'anxiety',
  'wonder',
  'sadness',
  'fear',
  'peace',
  'love',
  'anger',
] as const

export type EmotionKey = (typeof EMOTION_KEYS)[number]

export interface EmotionMeta {
  key: EmotionKey
  /** CSS custom property — theme-aware, defined in globals.css */
  color: string
  icon: string
  fr: string
  en: string
}

export const EMOTIONS: Record<EmotionKey, EmotionMeta> = {
  joy: { key: 'joy', color: 'var(--color-emotion-joy)', icon: '☀️', fr: 'Joie', en: 'Joy' },
  anxiety: {
    key: 'anxiety',
    color: 'var(--color-emotion-anxiety)',
    icon: '⚡',
    fr: 'Anxiété',
    en: 'Anxiety',
  },
  wonder: {
    key: 'wonder',
    color: 'var(--color-emotion-wonder)',
    icon: '✨',
    fr: 'Émerveillement',
    en: 'Wonder',
  },
  sadness: {
    key: 'sadness',
    color: 'var(--color-emotion-sadness)',
    icon: '💧',
    fr: 'Tristesse',
    en: 'Sadness',
  },
  fear: { key: 'fear', color: 'var(--color-emotion-fear)', icon: '👁', fr: 'Peur', en: 'Fear' },
  peace: { key: 'peace', color: 'var(--color-emotion-peace)', icon: '🍃', fr: 'Paix', en: 'Peace' },
  love: { key: 'love', color: 'var(--color-emotion-love)', icon: '💜', fr: 'Amour', en: 'Love' },
  anger: {
    key: 'anger',
    color: 'var(--color-emotion-anger)',
    icon: '🔥',
    fr: 'Colère',
    en: 'Anger',
  },
}

export function isEmotionKey(value: unknown): value is EmotionKey {
  return typeof value === 'string' && (EMOTION_KEYS as readonly string[]).includes(value)
}

/** Drop anything the model invented outside the eight canonical keys. */
export function sanitizeEmotions(input: unknown): EmotionKey[] {
  if (!Array.isArray(input)) return []
  const seen = new Set<EmotionKey>()
  for (const item of input) {
    if (isEmotionKey(item)) seen.add(item)
  }
  return [...seen]
}

export function emotionLabel(key: EmotionKey, locale: string): string {
  return locale === 'en' ? EMOTIONS[key].en : EMOTIONS[key].fr
}

// ── Types ──

export interface Dream {
  id: string
  user_id: string
  raw_text: string
  title: string | null
  structured_text: string | null
  dream_date: string
  emotional_intensity: number | null
  lucidity_level: number | null
  sleep_quality: number | null
  tags: string[]
  emotions: EmotionKey[]
  characters: string[]
  places: string[]
  gauge_value: number
  created_at: string
  updated_at: string
}

/** The three readings of a single dream, generated together in one call. */
export interface DreamInterpretationContent {
  factual: string
  spiritual: string
  blended: string
}

export interface DreamStructure {
  title: string
  structured_text: string
  tags: string[]
  emotions: EmotionKey[]
  characters: string[]
  places: string[]
  clarification_questions: string[]
}

/** Natal placements that colour the spiritual reading. All optional. */
export interface DreamAstroContext {
  moonSign?: string
  sunSign?: string
  ascendant?: string
}

// ── Helpers ──

/**
 * The emotion to show as the calendar dot for a given day: the most frequent
 * one across that day's dreams. Ties break on the canonical EMOTION_KEYS
 * order so the dot never flickers between renders.
 */
export function dominantEmotion(dreams: Pick<Dream, 'emotions'>[]): EmotionKey | null {
  const counts = new Map<EmotionKey, number>()
  for (const dream of dreams) {
    for (const emotion of dream.emotions ?? []) {
      if (!isEmotionKey(emotion)) continue
      counts.set(emotion, (counts.get(emotion) ?? 0) + 1)
    }
  }
  if (counts.size === 0) return null

  let best: EmotionKey | null = null
  let bestCount = 0
  for (const key of EMOTION_KEYS) {
    const count = counts.get(key) ?? 0
    if (count > bestCount) {
      best = key
      bestCount = count
    }
  }
  return best
}

/**
 * Which of the three readings the gauge is pointing at. Same thresholds as
 * the Reverie prototype: below a third is factual, above two thirds is
 * spiritual, the middle band is the blend.
 */
export function readingForGauge(gauge: number): keyof DreamInterpretationContent {
  if (gauge < 0.33) return 'factual'
  if (gauge > 0.66) return 'spiritual'
  return 'blended'
}

/**
 * Seed a new dream's gauge from the reader's saved "Angle" preference
 * (1 = concrete/psychological … 10 = archetypal/symbolic), so the dream
 * journal opens in the register they already chose for the rest of the site.
 */
export function gaugeFromFocus(focus: number | undefined): number {
  if (typeof focus !== 'number' || !Number.isFinite(focus)) return 0.5
  const clamped = Math.min(10, Math.max(1, focus))
  return Math.round(((clamped - 1) / 9) * 100) / 100
}
