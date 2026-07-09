'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'

export interface PersonalEvent {
  id: string
  title: string
  event_date: string // yyyy-mm-dd
  recurring: boolean
  kind: 'perso' | 'anniversaire'
}

// Premium block on /calendrier: add private events (birthdays, appointments…)
// that get woven into the celestial months. Reads work for any signed-in user;
// creation is Premium (the API enforces it too).
export default function PersonalEvents({
  onEventsChange,
}: {
  onEventsChange: (events: PersonalEvent[]) => void
}) {
  const { user, isPremium, getAccessToken } = useAuth()
  const { locale } = useLocale()
  const fr = locale === 'fr'

  const [events, setEvents] = useState<PersonalEvent[]>([])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [recurring, setRecurring] = useState(true)
  const [kind, setKind] = useState<'perso' | 'anniversaire'>('anniversaire')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!user) return
    const token = await getAccessToken()
    if (!token) return
    try {
      const res = await fetch('/api/calendar-events', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const { events: list } = await res.json()
      setEvents(list ?? [])
      onEventsChange(list ?? [])
    } catch {
      /* silent — the celestial calendar still works */
    }
  }, [user, getAccessToken, onEventsChange])

  useEffect(() => {
    load()
  }, [load])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!title.trim() || !date) return
    setBusy(true)
    try {
      const token = await getAccessToken()
      const res = await fetch('/api/calendar-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: title.trim(), eventDate: date, recurring, kind }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(
          body?.error === 'PREMIUM_REQUIRED'
            ? fr
              ? 'Cette fonctionnalité est réservée aux membres Premium.'
              : 'This feature is for Premium members.'
            : fr
              ? "Impossible d'ajouter l'événement. Réessaie."
              : "Couldn't add the event. Try again.",
        )
        return
      }
      setTitle('')
      setDate('')
      await load()
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: string) => {
    const token = await getAccessToken()
    await fetch('/api/calendar-events', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ eventId: id }),
    }).catch(() => {})
    await load()
  }

  const fmt = (iso: string) =>
    new Date(iso + 'T12:00:00Z').toLocaleDateString(fr ? 'fr-CA' : 'en-CA', {
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    })

  // ── Teaser (logged out or free) ──
  if (!user || !isPremium) {
    return (
      <div
        className="glass p-5 mt-5 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{
          borderColor: 'rgba(224,169,78,0.3)',
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--color-accent-gold) 8%, transparent), transparent)',
        }}
      >
        <div className="flex-1">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent-gold)]/85 mb-1.5">
            ✦ Premium
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {fr
              ? 'Ajoute tes anniversaires et tes rendez-vous personnels au calendrier céleste — privés, visibles par toi seul·e, tissés parmi les lunes et les rétrogrades.'
              : 'Add your birthdays and personal dates to the celestial calendar — private, visible only to you, woven among the moons and retrogrades.'}
          </p>
        </div>
        <Link
          href={user ? '/premium' : '/connexion?next=/calendrier'}
          className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium shrink-0"
        >
          <span aria-hidden="true">✦</span>
          {user ? (fr ? 'Passer Premium' : 'Go Premium') : fr ? 'Se connecter' : 'Sign in'}
        </Link>
      </div>
    )
  }

  // ── Premium: form + list ──
  return (
    <div className="glass p-5 mt-5" style={{ borderColor: 'rgba(224,169,78,0.3)' }}>
      <p className="text-xs uppercase tracking-widest text-[var(--color-accent-gold)]/85 mb-3">
        ✦ {fr ? 'Mes dates personnelles' : 'My personal dates'}
      </p>

      <form onSubmit={add} className="grid sm:grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          placeholder={fr ? 'Ex. Anniversaire de Léa' : "E.g. Lea's birthday"}
          className="px-3 py-2 rounded-lg bg-white/5 border border-[var(--color-glass-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-lavender)]/50"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/5 border border-[var(--color-glass-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-lavender)]/50"
        />
        <select
          value={`${kind}|${recurring ? 1 : 0}`}
          onChange={(e) => {
            const [k, r] = e.target.value.split('|')
            setKind(k as 'perso' | 'anniversaire')
            setRecurring(r === '1')
          }}
          className="px-3 py-2 rounded-lg bg-white/5 border border-[var(--color-glass-border)] text-sm text-[var(--color-text-primary)] focus:outline-none"
        >
          <option value="anniversaire|1">
            {fr ? 'Anniversaire (chaque année)' : 'Birthday (yearly)'}
          </option>
          <option value="perso|1">{fr ? 'Perso — chaque année' : 'Personal — yearly'}</option>
          <option value="perso|0">{fr ? 'Perso — une seule fois' : 'Personal — one time'}</option>
        </select>
        <button
          type="submit"
          disabled={busy || !title.trim() || !date}
          className="btn-primary px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-30"
        >
          {fr ? 'Ajouter' : 'Add'}
        </button>
      </form>
      {error && <p className="text-xs text-[var(--color-accent-rose)] mt-2">{error}</p>}

      {events.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {events.map((ev) => (
            <li key={ev.id} className="flex items-center gap-2.5 text-sm">
              <span
                aria-hidden="true"
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  background:
                    ev.kind === 'anniversaire'
                      ? 'var(--color-accent-gold)'
                      : 'var(--color-accent-rose)',
                }}
              />
              <span className="text-[var(--color-text-primary)] truncate">{ev.title}</span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {fmt(ev.event_date)}
                {ev.recurring ? (fr ? ' · chaque année' : ' · yearly') : ''}
              </span>
              <button
                onClick={() => remove(ev.id)}
                aria-label={fr ? 'Supprimer' : 'Delete'}
                className="ml-auto text-[var(--color-text-muted)] hover:text-[var(--color-accent-rose)] transition text-lg leading-none px-1"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-[11px] text-[var(--color-text-muted)] mt-3">
        {fr
          ? 'Privé — visible par toi seul·e, tissé dans les mois ci-dessus.'
          : 'Private — visible only to you, woven into the months above.'}
      </p>
    </div>
  )
}
