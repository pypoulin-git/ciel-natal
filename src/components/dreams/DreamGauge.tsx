'use client'

import { useState } from 'react'
import { readingForGauge, type DreamInterpretationContent } from '@/lib/dreams'

/**
 * The factual ↔ spiritual gauge.
 *
 * All three readings were generated in one call and are already in memory, so
 * moving this slider costs nothing: it just switches which paragraph shows.
 * The prototype fired a fresh model call on every release — the single most
 * expensive thing it did.
 *
 * The position is persisted on release only (`onCommit`), so dragging doesn't
 * spray PATCHes at the API.
 */
export default function DreamGauge({
  content,
  initialValue,
  onCommit,
  locale,
}: {
  content: DreamInterpretationContent
  initialValue: number
  onCommit: (value: number) => void
  locale: string
}) {
  const [value, setValue] = useState(initialValue)
  const fr = locale !== 'en'
  const mode = readingForGauge(value)

  const modeLabel = fr
    ? { factual: 'Lecture factuelle', spiritual: 'Lecture spirituelle', blended: 'Lecture mixte' }
    : { factual: 'Factual reading', spiritual: 'Spiritual reading', blended: 'Blended reading' }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
        <span>🔬 {fr ? 'Factuel' : 'Factual'}</span>
        <span className="text-[var(--color-accent-lavender)]">{modeLabel[mode]}</span>
        <span>{fr ? 'Spirituel' : 'Spiritual'} ✦</span>
      </div>

      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        onMouseUp={() => onCommit(value)}
        onTouchEnd={() => onCommit(value)}
        onKeyUp={() => onCommit(value)}
        className="w-full accent-[var(--color-accent-lavender)]"
        aria-label={
          fr
            ? "Doser l'interprétation entre factuel et spirituel"
            : 'Balance the interpretation between factual and spiritual'
        }
        aria-valuetext={modeLabel[mode]}
      />

      <p
        className="mt-4 text-sm leading-relaxed text-[var(--color-text-secondary)]"
        aria-live="polite"
      >
        {content[mode]}
      </p>
    </div>
  )
}
