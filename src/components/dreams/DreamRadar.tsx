'use client'

import { useId, useState } from 'react'
import { EMOTIONS, emotionLabel, type EmotionKey } from '@/lib/dreams'
import { pointsAttr, radarPoints, type EmotionCount } from '@/lib/dreamStats'

/**
 * The eight emotions as one closed shape.
 *
 * Deliberately a SINGLE series in a single colour: the eight emotions are told
 * apart by their position on the octagon and by the icon at each vertex, not
 * by eight hues. The emotion palette is semantic (joy is gold, anger is
 * orange) and was never built to survive as eight adjacent categorical fills —
 * sadness and wonder sit ~7 ΔE apart, which is below the threshold at which
 * full-colour vision can separate them reliably, let alone deuteranopic
 * vision. Position + icon + a readable value dodge the problem entirely.
 *
 * Every value is also in the table underneath, so nothing is gated behind a
 * hover.
 */

const SIZE = 260
const CX = SIZE / 2
const CY = SIZE / 2
const R = 88
const RINGS = [0.25, 0.5, 0.75, 1]

export default function DreamRadar({
  emotions,
  total,
  locale,
}: {
  emotions: EmotionCount[]
  total: number
  locale: string
}) {
  const fr = locale !== 'en'
  const labelId = useId()
  const [active, setActive] = useState<EmotionKey | null>(null)

  const max = Math.max(1, ...emotions.map((e) => e.count))
  const values = emotions.map((e) => e.count)
  const shape = radarPoints(values, max, R, CX, CY)
  const axisEnds = radarPoints(
    emotions.map(() => max),
    max,
    R,
    CX,
    CY,
  )
  const labelSpots = radarPoints(
    emotions.map(() => max),
    max,
    R + 26,
    CX,
    CY,
  )

  const shown = active ? emotions.find((e) => e.key === active) : null

  if (total === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
        {fr
          ? 'Rien à tracer pour cette période — note un rêve et la forme apparaîtra.'
          : 'Nothing to plot for this period — record a dream and the shape will appear.'}
      </p>
    )
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="mx-auto block h-auto w-full max-w-[340px]"
        role="img"
        aria-labelledby={labelId}
      >
        <title id={labelId}>
          {fr
            ? `Répartition des émotions sur ${total} rêve${total > 1 ? 's' : ''}`
            : `Emotion spread across ${total} dream${total > 1 ? 's' : ''}`}
        </title>

        {/* Rings and spokes: hairline, solid, one step off the surface. */}
        {RINGS.map((ring) => (
          <polygon
            key={ring}
            points={pointsAttr(
              radarPoints(
                emotions.map(() => 1),
                1,
                R * ring,
                CX,
                CY,
              ),
            )}
            fill="none"
            stroke="var(--color-glass-border)"
            strokeWidth={1}
          />
        ))}
        {axisEnds.map((end, i) => (
          <line
            key={emotions[i].key}
            x1={CX}
            y1={CY}
            x2={end.x}
            y2={end.y}
            stroke="var(--color-glass-border)"
            strokeWidth={1}
          />
        ))}

        {/* The shape: 10% wash, 2px outline. */}
        <polygon
          points={pointsAttr(shape)}
          fill="var(--color-accent-lavender)"
          fillOpacity={0.16}
          stroke="var(--color-accent-lavender)"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Vertices — 8px markers with a surface ring, and a hit area well
            beyond that so they can actually be pointed at. */}
        {shape.map((point, i) => {
          const emotion = emotions[i]
          const on = active === emotion.key
          return (
            <g key={emotion.key}>
              <circle
                cx={point.x}
                cy={point.y}
                r={on ? 5.5 : 4}
                fill="var(--color-accent-lavender)"
                stroke="var(--color-space-card)"
                strokeWidth={2}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={14}
                fill="transparent"
                onMouseEnter={() => setActive(emotion.key)}
                onMouseLeave={() => setActive(null)}
              />
            </g>
          )
        })}

        {/* Axis labels: the emotion icon, in its colour, never colour alone. */}
        {labelSpots.map((spot, i) => {
          const emotion = emotions[i]
          const meta = EMOTIONS[emotion.key]
          return (
            <g
              key={emotion.key}
              onMouseEnter={() => setActive(emotion.key)}
              onMouseLeave={() => setActive(null)}
              style={{ cursor: 'default' }}
            >
              <circle
                cx={spot.x}
                cy={spot.y}
                r={13}
                fill={`color-mix(in srgb, ${meta.color} 18%, transparent)`}
                stroke={
                  active === emotion.key
                    ? `color-mix(in srgb, ${meta.color} 70%, transparent)`
                    : 'transparent'
                }
                strokeWidth={1.5}
              />
              <text
                x={spot.x}
                y={spot.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                aria-hidden="true"
              >
                {meta.icon}
              </text>
            </g>
          )
        })}
      </svg>

      {/* A fixed readout rather than a floating tooltip: no layout jump, and
          it reads the same on a touch screen where there is no hover. */}
      <p
        className="mt-1 min-h-[1.5rem] text-center text-sm text-[var(--color-text-secondary)]"
        aria-live="polite"
      >
        {shown ? (
          <>
            <span aria-hidden="true">{EMOTIONS[shown.key].icon}</span>{' '}
            {emotionLabel(shown.key, locale)} —{' '}
            <span className="font-mono tabular-nums">{shown.count}</span> {fr ? 'rêve' : 'dream'}
            {shown.count > 1 ? 's' : ''}{' '}
            <span className="text-[var(--color-text-muted)]">
              ({Math.round(shown.share * 100)} %)
            </span>
          </>
        ) : (
          <span className="text-[var(--color-text-muted)]">
            {fr ? 'Survole un sommet pour le détail' : 'Hover a vertex for the detail'}
          </span>
        )}
      </p>
    </div>
  )
}
