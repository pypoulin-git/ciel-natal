'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Starfield from '@/components/Starfield'
import SiteFooter from '@/components/SiteFooter'
import MoonGlyph from '@/components/MoonGlyph'
import { SignIcon } from '@/components/AstroIcons'
import PersonalEvents, { type PersonalEvent } from '@/components/PersonalEvents'
import { useLocale } from '@/lib/i18n'
import { translateSign } from '@/lib/astro'
import { computeCalendar, type CalEvent, type CalMonth } from '@/lib/skyCalendar'
import { computeSkyToday, type SkyToday } from '@/lib/skyToday'
import { MONTHLY_MOON, MOON_PHASES, PLANET_LABEL } from '@/data/skyInterpretations'

const TYPE_COLOR: Record<CalEvent['type'], string> = {
  'new-moon': 'var(--color-text-muted)',
  'full-moon': 'var(--color-accent-gold)',
  'retro-begin': 'var(--color-accent-lavender)',
  'retro-end': '#86d9b9',
  'sun-ingress': '#9fc8e8',
}

const PLANET_GLYPH: Record<string, string> = {
  Mercure: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturne: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluton: '⯓',
}

// French article for "Saison ___" so the season label reads naturally.
const SEASON_ART: Record<string, string> = {
  Belier: 'du',
  Taureau: 'du',
  Gemeaux: 'des',
  Cancer: 'du',
  Lion: 'du',
  Vierge: 'de la',
  Balance: 'de la',
  Scorpion: 'du',
  Sagittaire: 'du',
  Capricorne: 'du',
  Verseau: 'du',
  Poissons: 'des',
}

export default function CalendrierPage() {
  const { locale } = useLocale()
  const fr = locale === 'fr'
  const [months, setMonths] = useState<CalMonth[] | null>(null)
  const [sky, setSky] = useState<SkyToday | null>(null)
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([])
  const onEventsChange = useCallback((evts: PersonalEvent[]) => setPersonalEvents(evts), [])

  // Personal events belonging to a given displayed month (exact date, or
  // month+day match for yearly recurring ones like birthdays).
  const personalFor = (m: CalMonth): { day: number; ev: PersonalEvent }[] =>
    personalEvents
      .filter((ev) => {
        const d = new Date(ev.event_date + 'T12:00:00Z')
        const sameMonth = d.getUTCMonth() + 1 === m.month
        if (!sameMonth) return false
        return ev.recurring ? true : d.getUTCFullYear() === m.year
      })
      .map((ev) => ({ day: new Date(ev.event_date + 'T12:00:00Z').getUTCDate(), ev }))
      .sort((a, b) => a.day - b.day)

  useEffect(() => {
    try {
      const now = new Date()
      setSky(computeSkyToday(now))
      setMonths(computeCalendar(now, 12))
    } catch {
      /* leave null — page shows a gentle loading state */
    }
  }, [])

  const monthLabel = (m: CalMonth) =>
    new Date(Date.UTC(m.year, m.month - 1, 1)).toLocaleDateString(fr ? 'fr-CA' : 'en-CA', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    })

  const dayOf = (iso: string) =>
    new Date(iso + 'T12:00:00Z').toLocaleDateString(fr ? 'fr-CA' : 'en-CA', {
      day: 'numeric',
      timeZone: 'UTC',
    })

  const eventLabel = (e: CalEvent) => {
    const sign = translateSign(e.signKey, locale)
    const planet = e.planetKey
      ? fr
        ? PLANET_LABEL[e.planetKey]?.fr
        : PLANET_LABEL[e.planetKey]?.en
      : ''
    switch (e.type) {
      case 'new-moon':
        return fr ? `Nouvelle Lune en ${sign}` : `New Moon in ${sign}`
      case 'full-moon':
        return fr ? `Pleine Lune en ${sign}` : `Full Moon in ${sign}`
      case 'retro-begin':
        return fr ? `${planet} entre en rétrograde ℞` : `${planet} turns retrograde ℞`
      case 'retro-end':
        return fr ? `${planet} redevient direct` : `${planet} turns direct`
      case 'sun-ingress':
        return fr ? `Saison ${SEASON_ART[e.signKey] ?? 'du'} ${sign}` : `${sign} season begins`
    }
  }

  const EventIcon = ({ e }: { e: CalEvent }) =>
    e.planetKey ? (
      <span
        aria-hidden="true"
        className="w-4 text-center text-sm shrink-0"
        style={{ color: TYPE_COLOR[e.type] }}
      >
        {PLANET_GLYPH[e.planetKey]}
      </span>
    ) : (
      <span className="w-4 shrink-0 flex justify-center">
        <SignIcon name={e.signKey} size={14} color={TYPE_COLOR[e.type]} />
      </span>
    )

  const EventRow = ({ e }: { e: CalEvent }) => (
    <li className="flex items-center gap-2">
      <span
        className="text-xs tabular-nums w-5 shrink-0 text-right"
        style={{ color: TYPE_COLOR[e.type] }}
      >
        {dayOf(e.dateISO)}
      </span>
      <EventIcon e={e} />
      <span className="text-sm text-[var(--color-text-secondary)] leading-snug">
        {eventLabel(e)}
      </span>
    </li>
  )

  // Personal (Premium) events, woven among the celestial ones with a warm tint.
  const PersoRow = ({ day, ev }: { day: number; ev: PersonalEvent }) => {
    const tint =
      ev.kind === 'anniversaire' ? 'var(--color-accent-gold)' : 'var(--color-accent-rose)'
    return (
      <li className="flex items-center gap-2">
        <span className="text-xs tabular-nums w-5 shrink-0 text-right" style={{ color: tint }}>
          {day}
        </span>
        <span aria-hidden="true" className="w-4 shrink-0 flex justify-center">
          <span className="w-2 h-2 rounded-full" style={{ background: tint }} />
        </span>
        <span className="text-sm leading-snug truncate" style={{ color: tint }}>
          {ev.title}
        </span>
      </li>
    )
  }

  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-10 pb-8">
        <Link
          href="/"
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-lavender)] transition"
        >
          ← {fr ? 'Accueil' : 'Home'}
        </Link>

        <div className="text-center mt-6 mb-8">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent-gold)]/80 mb-3">
            ✦ {fr ? 'Calendrier céleste' : 'Celestial calendar'}
          </p>
          <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl text-[var(--color-text-primary)]">
            {fr ? 'Les rendez-vous du ciel' : "The sky's appointments"}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-3 max-w-xl mx-auto">
            {fr
              ? 'Nouvelles et pleines lunes, rétrogrades et passages du Soleil — sur les douze prochains mois.'
              : "New and full moons, retrogrades and the Sun's ingresses — over the next twelve months."}
          </p>
        </div>

        {!months || !sky ? (
          <p className="text-center text-sm text-[var(--color-text-muted)] py-16">
            {fr ? 'Calcul du ciel…' : 'Computing the sky…'}
          </p>
        ) : (
          <>
            {/* ── Mois en cours, en vedette ── */}
            <div
              className="glass p-6 sm:p-8 grid sm:grid-cols-[auto_1fr] gap-6 sm:gap-8 items-center"
              style={{ borderColor: 'rgba(224,169,78,0.28)' }}
            >
              <div className="flex flex-col items-center text-center">
                <MoonGlyph angle={sky.moon.angle} size={116} idSuffix="feat" />
                <h2 className="font-cinzel text-2xl text-[var(--color-accent-gold)] mt-4">
                  {fr
                    ? MONTHLY_MOON[months[0].monthIndex].name.fr
                    : MONTHLY_MOON[months[0].monthIndex].name.en}
                </h2>
                <p className="text-[11px] italic text-[var(--color-text-muted)] mt-0.5">
                  {fr
                    ? MONTHLY_MOON[months[0].monthIndex].poem.fr
                    : MONTHLY_MOON[months[0].monthIndex].poem.en}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                  {fr
                    ? MOON_PHASES[sky.moon.phaseIndex].name.fr
                    : MOON_PHASES[sky.moon.phaseIndex].name.en}{' '}
                  · {sky.moon.illumination}%
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)]/80 mb-3">
                  {monthLabel(months[0])} · {fr ? 'ce mois-ci' : 'this month'}
                </p>
                {months[0].events.length === 0 && personalFor(months[0]).length === 0 ? (
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {fr ? 'Un mois paisible.' : 'A quiet month.'}
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {months[0].events.map((e, i) => (
                      <EventRow key={i} e={e} />
                    ))}
                    {personalFor(months[0]).map(({ day, ev }) => (
                      <PersoRow key={ev.id} day={day} ev={ev} />
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* ── 11 mois suivants ── */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {months.slice(1).map((m, idx) => (
                <div key={idx} className="glass p-4">
                  <div className="flex items-center gap-3 mb-2.5">
                    <MoonGlyph angle={180} size={34} idSuffix={`m${idx}`} />
                    <div>
                      <p className="text-sm text-[var(--color-text-primary)] capitalize leading-tight">
                        {monthLabel(m)}
                      </p>
                      <p className="text-xs text-[var(--color-accent-gold)] leading-tight">
                        {fr
                          ? MONTHLY_MOON[m.monthIndex].name.fr
                          : MONTHLY_MOON[m.monthIndex].name.en}
                      </p>
                    </div>
                  </div>
                  {m.events.length === 0 && personalFor(m).length === 0 ? (
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {fr ? 'Un mois paisible.' : 'A quiet month.'}
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {m.events.map((e, i) => (
                        <EventRow key={i} e={e} />
                      ))}
                      {personalFor(m).map(({ day, ev }) => (
                        <PersoRow key={ev.id} day={day} ev={ev} />
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* ── Dates personnelles (Premium) ── */}
            <PersonalEvents onEventsChange={onEventsChange} />

            <p className="text-center text-[11px] text-[var(--color-text-muted)] mt-8">
              {fr
                ? 'Dates calculées en direct — à titre indicatif (± un jour pour les planètes lentes).'
                : 'Dates computed live — for guidance only (± a day for the slow planets).'}
            </p>
          </>
        )}
      </div>
      <SiteFooter />
    </main>
  )
}
