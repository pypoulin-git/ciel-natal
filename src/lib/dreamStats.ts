/**
 * Everything the dream dashboard shows, computed from rows the member already
 * owns. No model call, no server round-trip beyond the one fetch — which is
 * why this panel is free for any signed-in member and not behind Premium.
 *
 * Dates are plain YYYY-MM-DD strings (a dream belongs to a night, not to an
 * instant), so every calculation here is UTC-anchored. Doing it with local
 * Date objects drifts by a day for anyone west of Greenwich, which in this
 * product means every single user.
 */

import { EMOTION_KEYS, isEmotionKey, type Dream, type EmotionKey } from './dreams'

/**
 * What the dashboard actually reads. The API sends only these columns for the
 * `?since=` window — the aggregates never touch the account text, and shipping
 * two years of it to count emotions would be megabytes for a few integers.
 */
export type StatDream = Pick<
  Dream,
  | 'dream_date'
  | 'emotional_intensity'
  | 'lucidity_level'
  | 'sleep_quality'
  | 'tags'
  | 'emotions'
  | 'characters'
  | 'places'
>

export interface EmotionCount {
  key: EmotionKey
  count: number
  /** Share of the period's dreams that carried this emotion, 0-1. */
  share: number
}

export interface LabelCount {
  label: string
  count: number
}

export interface TrendBucket {
  /** First day of the bucket, YYYY-MM-DD. */
  start: string
  count: number
}

export type TrendGrain = 'day' | 'week' | 'month'

export interface DreamStats {
  total: number
  /** Distinct nights with at least one dream. Two dreams in one night is one night. */
  nights: number
  emotions: EmotionCount[]
  dominant: EmotionKey | null
  avgIntensity: number | null
  avgLucidity: number | null
  avgSleep: number | null
  currentStreak: number
  longestStreak: number
  topTags: LabelCount[]
  topCharacters: LabelCount[]
  topPlaces: LabelCount[]
  trend: TrendBucket[]
  grain: TrendGrain
}

// ── Date helpers ──────────────────────────────────────────────────────────

const DAY_MS = 86_400_000

/** Midnight UTC of a YYYY-MM-DD string, or NaN if it isn't one. */
export function dayMs(iso: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return NaN
  return Date.parse(`${iso}T00:00:00Z`)
}

export function isoOf(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

/** `days` before `todayIso`, inclusive of today — a 30-day window spans 30 dates. */
export function windowStart(todayIso: string, days: number): string {
  return isoOf(dayMs(todayIso) - (days - 1) * DAY_MS)
}

function inWindow(date: string, fromIso: string, toIso: string): boolean {
  return date >= fromIso && date <= toIso
}

// ── Aggregations ──────────────────────────────────────────────────────────

/** How many dreams in the period carried each of the eight emotions. */
export function emotionCounts(dreams: Pick<Dream, 'emotions'>[]): EmotionCount[] {
  const counts = new Map<EmotionKey, number>()
  for (const dream of dreams) {
    // A dream counts once per emotion even if the list repeats it.
    const seen = new Set<EmotionKey>()
    for (const emotion of dream.emotions ?? []) {
      if (isEmotionKey(emotion)) seen.add(emotion)
    }
    for (const emotion of seen) counts.set(emotion, (counts.get(emotion) ?? 0) + 1)
  }
  const total = dreams.length || 1
  return EMOTION_KEYS.map((key) => ({
    key,
    count: counts.get(key) ?? 0,
    share: (counts.get(key) ?? 0) / total,
  }))
}

/** The most frequent items of a list-valued field, case-folded for grouping. */
export function topItems(
  dreams: Pick<Dream, 'tags' | 'characters' | 'places'>[],
  field: 'tags' | 'characters' | 'places',
  limit = 6,
): LabelCount[] {
  const counts = new Map<string, { label: string; count: number }>()
  for (const dream of dreams) {
    const seen = new Set<string>()
    for (const raw of dream[field] ?? []) {
      if (typeof raw !== 'string') continue
      const label = raw.trim()
      if (!label) continue
      const key = label.toLocaleLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      const entry = counts.get(key)
      if (entry) entry.count += 1
      else counts.set(key, { label, count: 1 })
    }
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit)
}

function average(values: (number | null | undefined)[]): number | null {
  const nums = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
  if (nums.length === 0) return null
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
}

/**
 * Consecutive nights with a dream. The current streak tolerates a missing
 * today — you haven't necessarily written this morning's yet, and telling
 * someone their streak broke at 7am would be both wrong and unkind.
 */
export function streaks(dates: string[], todayIso: string): { current: number; longest: number } {
  const unique = [...new Set(dates.filter((d) => !Number.isNaN(dayMs(d))))].sort()
  if (unique.length === 0) return { current: 0, longest: 0 }

  let longest = 1
  let run = 1
  for (let i = 1; i < unique.length; i += 1) {
    const gap = (dayMs(unique[i]) - dayMs(unique[i - 1])) / DAY_MS
    run = gap === 1 ? run + 1 : 1
    if (run > longest) longest = run
  }

  const today = dayMs(todayIso)
  const last = dayMs(unique[unique.length - 1])
  const sinceLast = (today - last) / DAY_MS
  let current = 0
  if (sinceLast === 0 || sinceLast === 1) {
    current = 1
    for (let i = unique.length - 1; i > 0; i -= 1) {
      if ((dayMs(unique[i]) - dayMs(unique[i - 1])) / DAY_MS !== 1) break
      current += 1
    }
  }
  return { current, longest }
}

/**
 * Bucket size follows the span: a 30-day window gets daily columns, a quarter
 * gets weeks, a year gets months. One rule so the trend chart is never 365
 * hairlines or 4 lonely bars.
 */
export function grainFor(days: number): TrendGrain {
  if (days <= 45) return 'day'
  if (days <= 130) return 'week'
  return 'month'
}

/** Counts per bucket across the whole window, including the empty buckets. */
export function trendBuckets(
  dreams: Pick<Dream, 'dream_date'>[],
  fromIso: string,
  toIso: string,
  grain: TrendGrain,
): TrendBucket[] {
  const from = dayMs(fromIso)
  const to = dayMs(toIso)
  if (Number.isNaN(from) || Number.isNaN(to) || to < from) return []

  const bucketStart = (iso: string): string => {
    const ms = dayMs(iso)
    if (grain === 'day') return iso
    if (grain === 'month') return `${iso.slice(0, 7)}-01`
    // Weeks run Monday-first, the French convention used by the calendar.
    const weekday = (new Date(ms).getUTCDay() + 6) % 7
    return isoOf(ms - weekday * DAY_MS)
  }

  const buckets = new Map<string, number>()
  // Seed every bucket in range so gaps render as gaps, not as missing bars.
  let cursor = bucketStart(fromIso)
  const guard = 400
  for (let i = 0; i < guard; i += 1) {
    buckets.set(cursor, 0)
    const ms = dayMs(cursor)
    const next =
      grain === 'day'
        ? isoOf(ms + DAY_MS)
        : grain === 'week'
          ? isoOf(ms + 7 * DAY_MS)
          : isoOf(Date.UTC(Number(cursor.slice(0, 4)), Number(cursor.slice(5, 7)), 1))
    if (dayMs(next) > to) break
    cursor = next
  }

  for (const dream of dreams) {
    if (!inWindow(dream.dream_date, fromIso, toIso)) continue
    const key = bucketStart(dream.dream_date)
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }

  return [...buckets.entries()]
    .map(([start, count]) => ({ start, count }))
    .sort((a, b) => a.start.localeCompare(b.start))
}

/** Everything the dashboard needs, for one window, in one pass. */
export function computeDreamStats(
  dreams: StatDream[],
  fromIso: string,
  toIso: string,
  todayIso: string = toIso,
): DreamStats {
  const scoped = dreams.filter((dream) => inWindow(dream.dream_date, fromIso, toIso))
  const emotions = emotionCounts(scoped)
  const ranked = [...emotions].sort((a, b) => b.count - a.count)
  const days = Math.round((dayMs(toIso) - dayMs(fromIso)) / DAY_MS) + 1
  const grain = grainFor(Number.isFinite(days) ? days : 30)
  const streakRun = streaks(
    scoped.map((d) => d.dream_date),
    todayIso,
  )

  return {
    total: scoped.length,
    nights: new Set(scoped.map((d) => d.dream_date)).size,
    emotions,
    dominant: ranked[0]?.count ? ranked[0].key : null,
    avgIntensity: average(scoped.map((d) => d.emotional_intensity)),
    avgLucidity: average(scoped.map((d) => d.lucidity_level)),
    avgSleep: average(scoped.map((d) => d.sleep_quality)),
    currentStreak: streakRun.current,
    longestStreak: streakRun.longest,
    topTags: topItems(scoped, 'tags'),
    topCharacters: topItems(scoped, 'characters', 5),
    topPlaces: topItems(scoped, 'places', 5),
    trend: trendBuckets(scoped, fromIso, toIso, grain),
    grain,
  }
}

/**
 * Change against the window of the same length immediately before this one.
 * Returns null when there is no prior data at all — "+100%" on a first week is
 * a meaningless number dressed up as a result.
 */
export function periodDelta(
  dreams: Pick<Dream, 'dream_date'>[],
  fromIso: string,
  toIso: string,
): { previous: number; current: number; delta: number } | null {
  const days = Math.round((dayMs(toIso) - dayMs(fromIso)) / DAY_MS) + 1
  if (!Number.isFinite(days) || days <= 0) return null
  const prevTo = isoOf(dayMs(fromIso) - DAY_MS)
  const prevFrom = isoOf(dayMs(fromIso) - days * DAY_MS)

  const current = dreams.filter((d) => inWindow(d.dream_date, fromIso, toIso)).length
  const previous = dreams.filter((d) => inWindow(d.dream_date, prevFrom, prevTo)).length
  if (previous === 0) return null
  return { previous, current, delta: current - previous }
}

// ── Radar geometry ────────────────────────────────────────────────────────

export interface RadarPoint {
  x: number
  y: number
}

/**
 * Vertices for one ring of the radar, first axis at 12 o'clock and going
 * clockwise. `max` is the value the outer ring represents; 0 collapses every
 * point to the centre rather than dividing by zero.
 */
export function radarPoints(
  values: number[],
  max: number,
  radius: number,
  cx: number,
  cy: number,
): RadarPoint[] {
  const n = values.length
  if (n === 0) return []
  return values.map((value, i) => {
    const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2
    return {
      x: cx + Math.cos(angle) * radius * ratio,
      y: cy + Math.sin(angle) * radius * ratio,
    }
  })
}

export function pointsAttr(points: RadarPoint[]): string {
  return points.map((p) => `${round(p.x)},${round(p.y)}`).join(' ')
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}
