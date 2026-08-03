'use client'

import Link from 'next/link'
import EmotionChip from './EmotionChip'
import { isEmotionKey, type Dream } from '@/lib/dreams'

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

export function shortDate(iso: string, locale: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return iso
  const names = locale === 'en' ? MONTHS_EN : MONTHS_FR
  return locale === 'en' ? `${names[month - 1]} ${day}` : `${day} ${names[month - 1]}`
}

export default function DreamCard({ dream, locale }: { dream: Dream; locale: string }) {
  const fr = locale !== 'en'
  const excerpt = (dream.structured_text || dream.raw_text || '').slice(0, 160)
  const emotions = (dream.emotions ?? []).filter(isEmotionKey).slice(0, 3)
  const tags = (dream.tags ?? []).slice(0, 2)

  return (
    <Link
      href={`/reves/${dream.id}`}
      className="glass btn-hover block rounded-2xl p-4 transition"
      aria-label={dream.title || (fr ? 'Rêve sans titre' : 'Untitled dream')}
    >
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <h3 className="font-cinzel text-base text-[var(--color-text-primary)]">
          {dream.title || (fr ? 'Rêve sans titre' : 'Untitled dream')}
        </h3>
        <span className="shrink-0 text-xs text-[var(--color-text-muted)]">
          {shortDate(dream.dream_date, locale)}
        </span>
      </div>

      <p className="mb-3 line-clamp-2 text-sm text-[var(--color-text-secondary)]">{excerpt}</p>

      <div className="flex flex-wrap items-center gap-1.5">
        {emotions.map((emotion) => (
          <EmotionChip key={emotion} emotion={emotion} locale={locale} compact />
        ))}
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[var(--color-glass-border)] px-2 py-0.5 text-[11px] text-[var(--color-text-muted)]"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  )
}
