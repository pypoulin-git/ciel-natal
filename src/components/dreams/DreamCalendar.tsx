'use client'

import { useMemo } from 'react'
import { EMOTIONS, dominantEmotion, type Dream } from '@/lib/dreams'

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
 * Month grid with one dot per day, coloured by that day's dominant emotion.
 * Monday-first (French convention). The dot carries a title attribute naming
 * the emotion, so it is never colour-only information.
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
  onSelectDate: (date: string) => void
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

  const go = (delta: number) => {
    const next = new Date(Date.UTC(year, month - 1 + delta, 1))
    onNavigate(next.getUTCFullYear(), next.getUTCMonth() + 1)
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="glass rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(-1)}
          className="btn-ghost rounded-lg px-3 py-1.5 text-sm"
          aria-label={fr ? 'Mois précédent' : 'Previous month'}
        >
          ←
        </button>
        <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] capitalize">
          {monthName} {year}
        </h2>
        <button
          type="button"
          onClick={() => go(1)}
          className="btn-ghost rounded-lg px-3 py-1.5 text-sm"
          aria-label={fr ? 'Mois suivant' : 'Next month'}
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
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

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              aria-pressed={isSelected}
              aria-label={
                dayDreams.length > 0
                  ? `${day} — ${dayDreams.length} ${fr ? 'rêve(s)' : 'dream(s)'}`
                  : String(day)
              }
              className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition ${
                isSelected
                  ? 'bg-[var(--color-accent-lavender)]/18 text-[var(--color-text-primary)]'
                  : 'hover:bg-white/5'
              } ${
                isToday
                  ? 'font-semibold text-[var(--color-accent-lavender)]'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              <span>{day}</span>
              {meta && (
                <span
                  className="mt-0.5 block h-1.5 w-1.5 rounded-full"
                  style={{ background: meta.color }}
                  title={`${meta.icon} ${locale === 'en' ? meta.en : meta.fr}`}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
