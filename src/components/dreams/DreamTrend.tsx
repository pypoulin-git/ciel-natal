'use client'

import { useState } from 'react'
import type { TrendBucket, TrendGrain } from '@/lib/dreamStats'

/**
 * Dreams recorded per bucket. One series, one colour, thin columns with a 2px
 * surface gap; the bucket size adapts to the window so this is never 365
 * hairlines nor four lonely bars.
 *
 * Only the busiest bucket is labelled — a number on every column is noise, and
 * the readout line plus the table view carry the rest.
 */

const MONTHS_FR = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
]
const MONTHS_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function bucketLabel(start: string, grain: TrendGrain, locale: string): string {
  const fr = locale !== 'en'
  const months = fr ? MONTHS_FR : MONTHS_EN
  const [, month, day] = start.split('-').map(Number)
  const name = months[(month ?? 1) - 1]
  if (grain === 'month') return name
  if (grain === 'week') return fr ? `sem. du ${day} ${name}` : `week of ${name} ${day}`
  return fr ? `${day} ${name}` : `${name} ${day}`
}

export default function DreamTrend({
  buckets,
  grain,
  locale,
}: {
  buckets: TrendBucket[]
  grain: TrendGrain
  locale: string
}) {
  const fr = locale !== 'en'
  const [active, setActive] = useState<number | null>(null)

  if (buckets.length === 0) return null

  const counts = (n: number) =>
    `${n} ${fr ? (n > 1 ? 'rêves' : 'rêve') : `dream${n > 1 ? 's' : ''}`}`

  const max = Math.max(1, ...buckets.map((b) => b.count))
  const peakIndex = buckets.reduce((best, b, i) => (b.count > buckets[best].count ? i : best), 0)
  // Highlighting "the peak" when every bucket ties singles out an arbitrary
  // bar and invents a story. Only mark it when it really stands alone.
  const peak = buckets.filter((b) => b.count === max).length === 1 ? peakIndex : -1
  const shown = active !== null ? buckets[active] : null

  return (
    <div>
      <div className="flex h-28 items-end gap-[2px]" role="group">
        {buckets.map((bucket, i) => {
          const height = (bucket.count / max) * 100
          const on = active === i
          return (
            <button
              key={bucket.start}
              type="button"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              // The hit area is the full column height, so a zero bucket is
              // still pointable — an empty week is information too.
              className="group relative flex h-full flex-1 cursor-default items-end"
              aria-label={`${bucketLabel(bucket.start, grain, locale)} — ${counts(bucket.count)}`}
            >
              <span
                className="block w-full rounded-t transition-[height,background-color]"
                style={{
                  height: `${Math.max(bucket.count > 0 ? 6 : 2, height)}%`,
                  background:
                    bucket.count === 0
                      ? 'var(--color-glass-border)'
                      : on || i === peak
                        ? 'var(--color-accent-lavender)'
                        : 'color-mix(in srgb, var(--color-accent-lavender) 45%, transparent)',
                }}
              />
            </button>
          )
        })}
      </div>

      <div className="mt-1.5 flex items-baseline justify-between text-[11px] text-[var(--color-text-muted)]">
        <span>{bucketLabel(buckets[0].start, grain, locale)}</span>
        <span aria-live="polite" className="text-[var(--color-text-secondary)]">
          {shown
            ? `${bucketLabel(shown.start, grain, locale)} · ${counts(shown.count)}`
            : peak >= 0
              ? `${fr ? 'pic' : 'peak'} : ${counts(max)}`
              : `${fr ? 'jusqu’à' : 'up to'} ${counts(max)}`}
        </span>
        <span>{bucketLabel(buckets[buckets.length - 1].start, grain, locale)}</span>
      </div>
    </div>
  )
}
