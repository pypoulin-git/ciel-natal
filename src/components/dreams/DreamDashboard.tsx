'use client'

import { useMemo, useState } from 'react'
import { EMOTIONS, emotionLabel } from '@/lib/dreams'
import {
  computeDreamStats,
  periodDelta,
  windowStart,
  type LabelCount,
  type StatDream,
} from '@/lib/dreamStats'
import DreamRadar from './DreamRadar'
import DreamTrend, { bucketLabel } from './DreamTrend'

/**
 * The dashboard half of the journal: what the nights add up to.
 *
 * Free for any signed-in member. Every number here is computed in the browser
 * from rows they already own — no model, no extra round-trip — so putting it
 * behind Premium would charge for arithmetic. It also gives the free tier a
 * reason to keep writing, which is what eventually makes the AI worth buying.
 */

const RANGES = [30, 90, 365] as const
type Range = (typeof RANGES)[number]

export default function DreamDashboard({
  dreams,
  locale,
}: {
  dreams: StatDream[]
  locale: string
}) {
  const fr = locale !== 'en'
  const label = (frText: string, enText: string) => (fr ? frText : enText)

  const [range, setRange] = useState<Range>(30)
  const [showTable, setShowTable] = useState(false)

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const fromIso = useMemo(() => windowStart(todayIso, range), [todayIso, range])

  const stats = useMemo(
    () => computeDreamStats(dreams, fromIso, todayIso, todayIso),
    [dreams, fromIso, todayIso],
  )
  const delta = useMemo(() => periodDelta(dreams, fromIso, todayIso), [dreams, fromIso, todayIso])

  const ranked = useMemo(
    () => [...stats.emotions].sort((a, b) => b.count - a.count).filter((e) => e.count > 0),
    [stats.emotions],
  )
  const rangeLabel = (value: Range) =>
    value === 365 ? label('12 mois', '12 months') : label(`${value} jours`, `${value} days`)

  return (
    <section aria-labelledby="dream-dashboard-title">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2
          id="dream-dashboard-title"
          className="font-cinzel text-lg text-[var(--color-text-primary)]"
        >
          {label('Le portrait de tes nuits', 'The portrait of your nights')}
        </h2>
        {/* One filter row above everything it scopes — the radar, the trend and
            the tiles all read the same slice. */}
        <div
          className="flex gap-1 rounded-xl border border-[var(--color-glass-border)] p-0.5"
          role="group"
          aria-label={label('Période', 'Period')}
        >
          {RANGES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              aria-pressed={range === value}
              className={`rounded-lg px-3 py-1.5 text-xs transition ${
                range === value
                  ? 'bg-[var(--color-accent-lavender)]/18 text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              {rangeLabel(value)}
            </button>
          ))}
        </div>
      </div>

      {stats.total === 0 ? (
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {label(
              'Aucun rêve sur cette période. Le portrait se dessine à partir de trois ou quatre nuits.',
              'No dreams in this period. The portrait starts to take shape after three or four nights.',
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Tiles — the numbers you read first. */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Tile
              label={label('Rêves consignés', 'Dreams recorded')}
              value={String(stats.total)}
              hint={
                delta
                  ? `${delta.delta > 0 ? '+' : ''}${delta.delta} ${label('vs période précédente', 'vs previous period')}`
                  : label(`sur ${stats.nights} nuits`, `across ${stats.nights} nights`)
              }
              accent
            />
            <Tile
              label={label('Série en cours', 'Current streak')}
              value={`${stats.currentStreak}`}
              hint={label(
                `record : ${stats.longestStreak} nuits`,
                `best: ${stats.longestStreak} nights`,
              )}
            />
            <Tile
              label={label('Intensité moyenne', 'Average intensity')}
              value={stats.avgIntensity != null ? `${stats.avgIntensity}` : '—'}
              hint={label('sur 10', 'out of 10')}
            />
            <Tile
              label={label('Sommeil moyen', 'Average sleep')}
              value={stats.avgSleep != null ? `${stats.avgSleep}` : '—'}
              hint={label('sur 5', 'out of 5')}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Radar */}
            <div className="glass rounded-2xl p-4 sm:p-5">
              <h3 className="mb-1 text-xs tracking-widest text-[var(--color-text-muted)] uppercase">
                {label('Climat émotionnel', 'Emotional climate')}
              </h3>
              <p className="mb-2 text-sm text-[var(--color-text-secondary)]">
                {stats.dominant ? (
                  <>
                    {label('Ce qui revient le plus :', 'What comes back most:')}{' '}
                    <span aria-hidden="true">{EMOTIONS[stats.dominant].icon}</span>{' '}
                    <span className="text-[var(--color-text-primary)]">
                      {emotionLabel(stats.dominant, locale)}
                    </span>
                  </>
                ) : (
                  label('Aucune émotion notée.', 'No emotions noted.')
                )}
              </p>
              <DreamRadar emotions={stats.emotions} total={stats.total} locale={locale} />
            </div>

            {/* Trend + ranked emotions */}
            <div className="space-y-4">
              <div className="glass rounded-2xl p-4 sm:p-5">
                <h3 className="mb-1 text-xs tracking-widest text-[var(--color-text-muted)] uppercase">
                  {label('Tendance', 'Trend')}
                </h3>
                <p className="mb-3 text-sm text-[var(--color-text-secondary)]">
                  {stats.grain === 'day'
                    ? label('Rêves par nuit', 'Dreams per night')
                    : stats.grain === 'week'
                      ? label('Rêves par semaine', 'Dreams per week')
                      : label('Rêves par mois', 'Dreams per month')}
                </p>
                <DreamTrend buckets={stats.trend} grain={stats.grain} locale={locale} />
              </div>

              <div className="glass rounded-2xl p-4 sm:p-5">
                <h3 className="mb-3 text-xs tracking-widest text-[var(--color-text-muted)] uppercase">
                  {label('Par émotion', 'By emotion')}
                </h3>
                {ranked.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {label('Rien de noté.', 'Nothing noted.')}
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {ranked.map((emotion) => {
                      const meta = EMOTIONS[emotion.key]
                      const width = Math.round(emotion.share * 100)
                      return (
                        <li key={emotion.key} className="flex items-center gap-2.5">
                          <span aria-hidden="true" className="w-4 shrink-0 text-sm">
                            {meta.icon}
                          </span>
                          <span className="w-24 shrink-0 truncate text-xs text-[var(--color-text-secondary)]">
                            {emotionLabel(emotion.key, locale)}
                          </span>
                          <span className="h-2 flex-1 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text-muted)_20%,transparent)]">
                            <span
                              className="block h-full rounded-full"
                              style={{ width: `${width}%`, background: meta.color }}
                            />
                          </span>
                          <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-[var(--color-text-muted)]">
                            {width} %
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* What the dreams are made of */}
          {(stats.topTags.length > 0 ||
            stats.topPlaces.length > 0 ||
            stats.topCharacters.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-3">
              <RankList
                title={label('Thèmes récurrents', 'Recurring themes')}
                items={stats.topTags}
                empty={label('Aucun thème noté.', 'No themes noted.')}
              />
              <RankList
                title={label('Lieux récurrents', 'Recurring places')}
                items={stats.topPlaces}
                empty={label('Aucun lieu noté.', 'No places noted.')}
              />
              <RankList
                title={label('Personnages récurrents', 'Recurring characters')}
                items={stats.topCharacters}
                empty={label('Personne de récurrent.', 'Nobody recurring.')}
              />
            </div>
          )}

          {/* The table twin: every value above, reachable without a hover. */}
          <div>
            <button
              type="button"
              onClick={() => setShowTable((v) => !v)}
              aria-expanded={showTable}
              className="btn-ghost rounded-xl px-4 py-2 text-xs"
            >
              {showTable
                ? label('Masquer les chiffres', 'Hide the numbers')
                : label('Voir les chiffres', 'See the numbers')}
            </button>

            {showTable && (
              <div className="glass mt-3 overflow-x-auto rounded-2xl p-4">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">
                    {label(
                      'Répartition des émotions et des rêves par période',
                      'Emotion spread and dreams per period',
                    )}
                  </caption>
                  <thead>
                    <tr className="text-xs text-[var(--color-text-muted)]">
                      <th scope="col" className="pb-2 font-normal">
                        {label('Émotion', 'Emotion')}
                      </th>
                      <th scope="col" className="pb-2 text-right font-normal">
                        {label('Rêves', 'Dreams')}
                      </th>
                      <th scope="col" className="pb-2 text-right font-normal">
                        {label('Part', 'Share')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--color-text-secondary)]">
                    {stats.emotions.map((emotion) => (
                      <tr key={emotion.key} className="border-t border-[var(--color-glass-border)]">
                        <th scope="row" className="py-1.5 font-normal">
                          <span aria-hidden="true">{EMOTIONS[emotion.key].icon}</span>{' '}
                          {emotionLabel(emotion.key, locale)}
                        </th>
                        <td className="py-1.5 text-right font-mono tabular-nums">
                          {emotion.count}
                        </td>
                        <td className="py-1.5 text-right font-mono tabular-nums">
                          {Math.round(emotion.share * 100)} %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <table className="mt-5 w-full text-left text-sm">
                  <caption className="sr-only">
                    {label('Rêves par période', 'Dreams per period')}
                  </caption>
                  <thead>
                    <tr className="text-xs text-[var(--color-text-muted)]">
                      <th scope="col" className="pb-2 font-normal">
                        {label('Période', 'Period')}
                      </th>
                      <th scope="col" className="pb-2 text-right font-normal">
                        {label('Rêves', 'Dreams')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--color-text-secondary)]">
                    {stats.trend.map((bucket) => (
                      <tr
                        key={bucket.start}
                        className="border-t border-[var(--color-glass-border)]"
                      >
                        <th scope="row" className="py-1.5 font-normal">
                          {bucketLabel(bucket.start, stats.grain, locale)}
                        </th>
                        <td className="py-1.5 text-right font-mono tabular-nums">{bucket.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

function Tile({
  label: title,
  value,
  hint,
  accent,
}: {
  label: string
  value: string
  hint: string
  accent?: boolean
}) {
  return (
    <div className="glass rounded-2xl px-3.5 py-3">
      <div className="text-[11px] leading-tight text-[var(--color-text-muted)]">{title}</div>
      <div
        className={`mt-0.5 text-2xl leading-none ${
          accent ? 'text-[var(--color-accent-lavender)]' : 'text-[var(--color-text-primary)]'
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] leading-tight text-[var(--color-text-muted)]">{hint}</div>
    </div>
  )
}

function RankList({ title, items, empty }: { title: string; items: LabelCount[]; empty: string }) {
  const max = Math.max(1, ...items.map((i) => i.count))
  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="mb-2.5 text-xs tracking-widest text-[var(--color-text-muted)] uppercase">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-2">
              <span className="w-24 flex-1 truncate text-xs text-[var(--color-text-secondary)]">
                {item.label}
              </span>
              <span className="h-1.5 w-14 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text-muted)_20%,transparent)]">
                <span
                  className="block h-full rounded-full bg-[var(--color-accent-lavender)]"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </span>
              <span className="w-5 shrink-0 text-right font-mono text-xs tabular-nums text-[var(--color-text-muted)]">
                {item.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
