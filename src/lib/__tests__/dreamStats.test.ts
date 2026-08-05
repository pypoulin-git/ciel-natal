import { describe, it, expect } from 'vitest'
import {
  computeDreamStats,
  emotionCounts,
  grainFor,
  periodDelta,
  pointsAttr,
  radarPoints,
  streaks,
  topItems,
  trendBuckets,
  windowStart,
  type StatDream,
} from '../dreamStats'

const dream = (overrides: Partial<StatDream> & { dream_date: string }): StatDream => ({
  emotional_intensity: null,
  lucidity_level: null,
  sleep_quality: null,
  tags: [],
  emotions: [],
  characters: [],
  places: [],
  ...overrides,
})

describe('windowStart', () => {
  it('spans exactly `days` dates, today included', () => {
    // 30 days ending 2026-08-05 starts on 2026-07-07, not 07-06.
    expect(windowStart('2026-08-05', 30)).toBe('2026-07-07')
    expect(windowStart('2026-08-05', 1)).toBe('2026-08-05')
  })

  it('crosses a leap day without losing one', () => {
    expect(windowStart('2024-03-01', 2)).toBe('2024-02-29')
  })
})

describe('emotionCounts', () => {
  it('always returns the eight keys in canonical order, so the radar axes never move', () => {
    const counts = emotionCounts([dream({ dream_date: '2026-08-01', emotions: ['joy'] })])
    expect(counts).toHaveLength(8)
    expect(counts[0].key).toBe('joy')
    expect(counts.map((c) => c.key)).toEqual([
      'joy',
      'anxiety',
      'wonder',
      'sadness',
      'fear',
      'peace',
      'love',
      'anger',
    ])
  })

  it('counts a dream once per emotion even if the list repeats it', () => {
    const counts = emotionCounts([
      dream({ dream_date: '2026-08-01', emotions: ['fear', 'fear', 'joy'] }),
    ])
    expect(counts.find((c) => c.key === 'fear')?.count).toBe(1)
  })

  it('computes share against the number of dreams, not the number of tags', () => {
    const counts = emotionCounts([
      dream({ dream_date: '2026-08-01', emotions: ['joy', 'peace'] }),
      dream({ dream_date: '2026-08-02', emotions: ['joy'] }),
    ])
    expect(counts.find((c) => c.key === 'joy')?.share).toBe(1)
    expect(counts.find((c) => c.key === 'peace')?.share).toBe(0.5)
  })
})

describe('topItems', () => {
  it('groups case-insensitively but keeps the first spelling seen', () => {
    const items = topItems(
      [
        dream({ dream_date: '2026-08-01', tags: ['Eau'] }),
        dream({ dream_date: '2026-08-02', tags: ['eau'] }),
        dream({ dream_date: '2026-08-03', tags: ['maison'] }),
      ],
      'tags',
    )
    expect(items[0]).toEqual({ label: 'Eau', count: 2 })
  })

  it('counts one dream once even when it repeats a tag', () => {
    const items = topItems([dream({ dream_date: '2026-08-01', tags: ['eau', 'eau'] })], 'tags')
    expect(items[0].count).toBe(1)
  })
})

describe('streaks', () => {
  it('is zero on an empty journal', () => {
    expect(streaks([], '2026-08-05')).toEqual({ current: 0, longest: 0 })
  })

  it('counts consecutive nights and ignores duplicates within a night', () => {
    const dates = ['2026-08-03', '2026-08-04', '2026-08-04', '2026-08-05']
    expect(streaks(dates, '2026-08-05')).toEqual({ current: 3, longest: 3 })
  })

  it("tolerates a missing today — you haven't necessarily written this morning's yet", () => {
    expect(streaks(['2026-08-03', '2026-08-04'], '2026-08-05').current).toBe(2)
  })

  it('breaks once two days have passed', () => {
    expect(streaks(['2026-08-03', '2026-08-04'], '2026-08-06').current).toBe(0)
  })

  it('remembers the longest run even after it ends', () => {
    const dates = ['2026-07-01', '2026-07-02', '2026-07-03', '2026-08-05']
    expect(streaks(dates, '2026-08-05')).toEqual({ current: 1, longest: 3 })
  })
})

describe('grainFor', () => {
  it('never leaves the trend as 365 hairlines or four lonely bars', () => {
    expect(grainFor(30)).toBe('day')
    expect(grainFor(90)).toBe('week')
    expect(grainFor(365)).toBe('month')
  })
})

describe('trendBuckets', () => {
  it('emits every bucket in range, so a silent week renders as a gap', () => {
    const buckets = trendBuckets(
      [dream({ dream_date: '2026-08-01' }), dream({ dream_date: '2026-08-01' })],
      '2026-08-01',
      '2026-08-05',
      'day',
    )
    expect(buckets).toHaveLength(5)
    expect(buckets[0]).toEqual({ start: '2026-08-01', count: 2 })
    expect(buckets[1]).toEqual({ start: '2026-08-02', count: 0 })
  })

  it('anchors weeks on Monday, matching the calendar', () => {
    // 2026-08-05 is a Wednesday; its week starts Monday 2026-08-03.
    const buckets = trendBuckets(
      [dream({ dream_date: '2026-08-05' })],
      '2026-08-03',
      '2026-08-09',
      'week',
    )
    expect(buckets).toEqual([{ start: '2026-08-03', count: 1 }])
  })

  it('rolls months over a year boundary', () => {
    const buckets = trendBuckets(
      [dream({ dream_date: '2026-01-15' })],
      '2025-11-01',
      '2026-01-31',
      'month',
    )
    expect(buckets.map((b) => b.start)).toEqual(['2025-11-01', '2025-12-01', '2026-01-01'])
    expect(buckets[2].count).toBe(1)
  })

  it('drops dreams outside the window', () => {
    const buckets = trendBuckets(
      [dream({ dream_date: '2026-07-31' })],
      '2026-08-01',
      '2026-08-02',
      'day',
    )
    expect(buckets.every((b) => b.count === 0)).toBe(true)
  })
})

describe('computeDreamStats', () => {
  const dreams: StatDream[] = [
    dream({
      dream_date: '2026-08-05',
      emotions: ['anxiety', 'wonder'],
      emotional_intensity: 8,
      sleep_quality: 2,
      tags: ['eau'],
      places: ['plage'],
    }),
    dream({
      dream_date: '2026-08-05',
      emotions: ['anxiety'],
      emotional_intensity: 6,
      sleep_quality: 4,
      tags: ['eau'],
    }),
    dream({ dream_date: '2026-08-04', emotions: ['peace'], emotional_intensity: 3 }),
    dream({ dream_date: '2026-06-01', emotions: ['joy'] }), // outside the window
  ]

  const stats = computeDreamStats(dreams, '2026-07-07', '2026-08-05', '2026-08-05')

  it('counts dreams and nights separately', () => {
    expect(stats.total).toBe(3)
    expect(stats.nights).toBe(2)
  })

  it('picks the dominant emotion of the window', () => {
    expect(stats.dominant).toBe('anxiety')
  })

  it('averages only the values that exist', () => {
    expect(stats.avgIntensity).toBe(5.7) // (8 + 6 + 3) / 3
    expect(stats.avgSleep).toBe(3) // (2 + 4) / 2 — the third dream has none
    expect(stats.avgLucidity).toBeNull()
  })

  it('reports the streak', () => {
    expect(stats.currentStreak).toBe(2)
  })

  it('excludes dreams outside the window from every aggregate', () => {
    expect(stats.emotions.find((e) => e.key === 'joy')?.count).toBe(0)
  })

  it('returns an empty but well-formed shape when nothing is in range', () => {
    const empty = computeDreamStats(dreams, '2026-01-01', '2026-01-31', '2026-08-05')
    expect(empty.total).toBe(0)
    expect(empty.dominant).toBeNull()
    expect(empty.emotions).toHaveLength(8)
    expect(empty.avgIntensity).toBeNull()
  })
})

describe('periodDelta', () => {
  const dreams = [
    dream({ dream_date: '2026-08-05' }),
    dream({ dream_date: '2026-08-04' }),
    dream({ dream_date: '2026-08-01' }), // previous window
  ]

  it('compares against the window of the same length just before', () => {
    // Current: 08-03 → 08-05 (2 dreams). Previous: 07-31 → 08-02 (1 dream).
    expect(periodDelta(dreams, '2026-08-03', '2026-08-05')).toEqual({
      previous: 1,
      current: 2,
      delta: 1,
    })
  })

  it('stays silent rather than claiming +100% on a first week', () => {
    expect(periodDelta(dreams, '2026-08-04', '2026-08-05')).toBeNull()
  })
})

describe('radarPoints', () => {
  it('puts the first axis at twelve o’clock and goes clockwise', () => {
    const [top, right] = radarPoints([1, 1, 1, 1], 1, 10, 0, 0)
    expect(top.x).toBeCloseTo(0)
    expect(top.y).toBeCloseTo(-10)
    expect(right.x).toBeCloseTo(10)
    expect(right.y).toBeCloseTo(0)
  })

  it('collapses to the centre when there is nothing to plot, instead of dividing by zero', () => {
    const points = radarPoints([0, 0, 0], 0, 10, 5, 5)
    expect(points.every((p) => p.x === 5 && p.y === 5)).toBe(true)
  })

  it('clamps a value above the max to the outer ring', () => {
    const [point] = radarPoints([99], 10, 10, 0, 0)
    expect(point.y).toBeCloseTo(-10)
  })

  it('serialises to a points attribute', () => {
    expect(pointsAttr([{ x: 1.234, y: 2 }])).toBe('1.23,2')
  })
})
