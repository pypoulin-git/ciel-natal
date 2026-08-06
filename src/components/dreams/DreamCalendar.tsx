'use client'

import { useMemo } from 'react'
import { EMOTIONS, dominantEmotion, emotionLabel, type Dream } from '@/lib/dreams'

const WEEKDAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const WEEKDAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]
const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/**
 * Month grid, one cell per night.
 *
 * The first version put a 6px coloured dot under the day number. Two problems:
 * a dot that small is invisible at arm's length, so a month of dreams looked
 * like an empty calendar — and colour was the ONLY channel carrying the
 * emotion, with the name hidden in a `title` attribute no touch device shows.
 * That contradicts the accessibility rule this feature inherited from the
 * prototype: always icon AND colour, never colour alone.
 *
 * Now a night with a dream is a filled tile: its dominant emotion's icon,
 * on a wash of that emotion's colour, deepening with the number of dreams.
 * The month reads as a mosaic — you see at a glance which weeks you wrote and
 * which you lost.
 */
export default function DreamCalendar({
  year,
  month, // 1-12
  dreams,
  selectedDate,
  onSelectDate,
  onNavigate,
  locale,
}: {
  year: number
  month: number
  dreams: Dream[]
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
  onNavigate: (year: number, month: number) => void
  locale: string
}) {
  const fr = locale !== 'en'
  const weekdays = fr ? WEEKDAYS_FR : WEEKDAYS_EN
  const monthName = (fr ? MONTHS_FR : MONTHS_EN)[month - 1]

  const byDay = useMemo(() => {
    const map = new Map<string, Dream[]>()
    for (const dream of dreams) {
      const list = map.get(dream.dream_date) ?? []
      list.push(dream)
      map.set(dream.dream_date, list)
    }
    return map
  }, [dreams])

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  // getUTCDay is Sunday-first (0); shift so Monday is 0.
  const firstWeekday = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7
  const today = new Date().toISOString().slice(0, 10)
  const monthDominant = dominantEmotion(dreams)

  const go = (delta: number) => {
    const next = new Date(Date.UTC(year, month - 1 + delta, 1))
    onNavigate(next.getUTCFullYear(), next.getUTCMonth() + 1)
  }

  const pad = (n: number) => String(n).padStart(2, '0')
  const nights = byDay.size

  return (
    <div className="glass rounded-2xl p-4 sm:p-5">
      <div className="mb-1 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(-1)}
          className="btn-ghost rounded-lg px-3 py-1.5 text-sm"
          aria-label={fr ? 'Mois précédent' : 'Previous month'}
        >
          ←
        </button>
        <h3 className="font-cinzel text-lg text-[var(--color-text-primary)] capitalize">
          {monthName} {year}
        </h3>
        <button
          type="button"
          onClick={() => go(1)}
          className="btn-ghost rounded-lg px-3 py-1.5 text-sm"
          aria-label={fr ? 'Mois suivant' : 'Next month'}
        >
          →
        </button>
      </div>

      {/* The month in one line, so the grid never has to be counted by eye. */}
      <p className="mb-4 text-center text-xs text-[var(--color-text-muted)]">
        {dreams.length === 0 ? (
          fr ? (
            'Aucun rêve consigné ce mois-ci'
          ) : (
            'No dreams recorded this month'
          )
        ) : (
          <>
            <span className="text-[var(--color-text-secondary)]">
              {dreams.length}{' '}
              {fr ? (dreams.length > 1 ? 'rêves' : 'rêve') : `dream${dreams.length > 1 ? 's' : ''}`}
            </span>
            {' · '}
            {nights} {fr ? (nights > 1 ? 'nuits' : 'nuit') : `night${nights > 1 ? 's' : ''}`}
            {monthDominant && (
              <>
                {' · '}
                <span aria-hidden="true">{EMOTIONS[monthDominant].icon}</span>{' '}
                {emotionLabel(monthDominant, locale)}
              </>
            )}
          </>
        )}
      </p>

      {/* Capped: seven square cells across a wide card would be 130px each —
          a calendar you scroll rather than read. */}
      <div className="mx-auto grid w-full max-w-[380px] grid-cols-7 gap-1 text-center sm:gap-1.5">
        {weekdays.map((day) => (
          <div key={day} className="pb-1 text-[11px] text-[var(--color-text-muted)]">
            {day}
          </div>
        ))}

        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`blank-${i}`} aria-hidden="true" />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const date = `${year}-${pad(month)}-${pad(day)}`
          const dayDreams = byDay.get(date) ?? []
          const emotion = dominantEmotion(dayDreams)
          const meta = emotion ? EMOTIONS[emotion] : null
          const isToday = date === today
          const isSelected = date === selectedDate
          const hasDreams = dayDreams.length > 0
          // Wash deepens with the number of dreams: a busy night should look
          // busier than a quiet one without needing a second channel.
          const wash = hasDreams ? Math.min(34, 15 + (dayDreams.length - 1) * 9) : 0

          const emotionName = emotion ? emotionLabel(emotion, locale) : null
          const aria = hasDreams
            ? `${day} ${monthName} — ${dayDreams.length} ${
                fr
                  ? dayDreams.length > 1
                    ? 'rêves'
                    : 'rêve'
                  : `dream${dayDreams.length > 1 ? 's' : ''}`
              }${emotionName ? `, ${emotionName}` : ''}`
            : `${day} ${monthName} — ${fr ? 'aucun rêve' : 'no dream'}`

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(isSelected ? null : date)}
              aria-pressed={isSelected}
              aria-label={aria}
              title={hasDreams && emotionName ? `${meta?.icon} ${emotionName}` : undefined}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border transition ${
                hasDreams ? '' : 'hover:bg-white/[0.04]'
              }`}
              style={{
                background:
                  meta && hasDreams
                    ? `color-mix(in srgb, ${meta.color} ${wash}%, transparent)`
                    : hasDreams
                      ? 'rgba(255,255,255,0.05)'
                      : 'transparent',
                borderColor: isSelected
                  ? 'var(--color-accent-lavender)'
                  : meta && hasDreams
                    ? `color-mix(in srgb, ${meta.color} 40%, transparent)`
                    : 'transparent',
                boxShadow: isSelected
                  ? '0 0 0 1px var(--color-accent-lavender)'
                  : isToday
                    ? '0 0 0 1px color-mix(in srgb, var(--color-accent-lavender) 45%, transparent)'
                    : undefined,
              }}
            >
              <span
                className={`absolute top-0.5 left-1 text-[10px] leading-none ${
                  isToday
                    ? 'font-semibold text-[var(--color-accent-lavender)]'
                    : hasDreams
                      ? 'text-[var(--color-text-secondary)]'
                      : 'text-[var(--color-text-muted)]'
                }`}
              >
                {day}
              </span>

              {meta && (
                <span aria-hidden="true" className="text-base leading-none sm:text-lg">
                  {meta.icon}
                </span>
              )}
              {hasDreams && !meta && (
                <span
                  aria-hidden="true"
                  className="text-sm leading-none text-[var(--color-text-muted)]"
                >
                  ✦
                </span>
              )}

              {dayDreams.length > 1 && (
                <span
                  aria-hidden="true"
                  className="absolute right-1 bottom-0.5 font-mono text-[10px] leading-none text-[var(--color-text-secondary)]"
                >
                  ×{dayDreams.length}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
