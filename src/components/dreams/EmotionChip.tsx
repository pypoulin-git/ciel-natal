'use client'

import { EMOTIONS, emotionLabel, type EmotionKey } from '@/lib/dreams'

/**
 * An emotion, always as icon + label + colour. Never colour alone — the
 * accessibility rule the dream journal was designed around, so the tags stay
 * readable for colour-blind users.
 */
export default function EmotionChip({
  emotion,
  locale,
  compact = false,
}: {
  emotion: EmotionKey
  locale: string
  compact?: boolean
}) {
  const meta = EMOTIONS[emotion]
  if (!meta) return null

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${
        compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
      style={{
        color: meta.color,
        borderColor: `color-mix(in srgb, ${meta.color} 35%, transparent)`,
        background: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
      }}
    >
      <span aria-hidden="true">{meta.icon}</span>
      {emotionLabel(emotion, locale)}
    </span>
  )
}
