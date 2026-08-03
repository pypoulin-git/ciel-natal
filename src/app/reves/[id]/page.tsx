'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'
import Starfield from '@/components/Starfield'
import SiteFooter from '@/components/SiteFooter'
import Skeleton from '@/components/ui/Skeleton'
import DreamGauge from '@/components/dreams/DreamGauge'
import DreamManualForm from '@/components/dreams/DreamManualForm'
import EmotionChip from '@/components/dreams/EmotionChip'
import {
  DreamApiError,
  deleteDream,
  generateDreamImage,
  getDream,
  interpretDream,
  updateDream,
  type DreamDetail,
} from '@/lib/dreamClient'
import { isEmotionKey } from '@/lib/dreams'

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

function longDate(iso: string, locale: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return iso
  return locale === 'en'
    ? `${MONTHS_EN[month - 1]} ${day}, ${year}`
    : `${day} ${MONTHS_FR[month - 1]} ${year}`
}

export default function DreamDetailPage() {
  const params = useParams<{ id: string }>()
  const dreamId = params?.id
  const router = useRouter()
  const { user, isPremium, loading, getAccessToken } = useAuth()
  const { locale } = useLocale()
  const fr = locale !== 'en'
  const label = (frText: string, enText: string) => (fr ? frText : enText)

  const [detail, setDetail] = useState<DreamDetail | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [interpreting, setInterpreting] = useState(false)
  const [imaging, setImaging] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editing, setEditing] = useState(false)

  // Generation is attempted at most once per mount. Without this guard the
  // effect could re-fire on a re-render and pay for the same dream twice —
  // exactly the failure mode this rewrite exists to remove.
  const generationAttempted = useRef(false)

  const load = useCallback(async () => {
    if (!dreamId || !user) return
    setPageLoading(true)
    try {
      const data = await getDream(dreamId, getAccessToken)
      setDetail(data)
    } catch (err) {
      setError(
        err instanceof DreamApiError && err.status === 404
          ? label('Ce rêve est introuvable.', 'This dream cannot be found.')
          : label('Impossible de charger ce rêve.', 'Could not load this dream.'),
      )
    } finally {
      setPageLoading(false)
    }
  }, [dreamId, user, getAccessToken, locale]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load()
  }, [load])

  // Generate only what is genuinely missing, once.
  useEffect(() => {
    if (!detail || !dreamId || !isPremium || generationAttempted.current) return
    generationAttempted.current = true

    const run = async () => {
      if (!detail.interpretation) {
        setInterpreting(true)
        try {
          const result = await interpretDream(dreamId, locale, getAccessToken)
          setDetail((prev) => (prev ? { ...prev, interpretation: result } : prev))
        } catch (err) {
          if (err instanceof DreamApiError && err.code === 'QUOTA_EXCEEDED') {
            setNotice(err.message)
          } else {
            setError(label("L'interprétation a échoué.", 'The interpretation failed.'))
          }
        } finally {
          setInterpreting(false)
        }
      }

      if (!detail.image) {
        setImaging(true)
        try {
          const image = await generateDreamImage(dreamId, locale, getAccessToken)
          setDetail((prev) => (prev ? { ...prev, image } : prev))
        } catch {
          // An image is a bonus, never a blocker — stay quiet about it.
        } finally {
          setImaging(false)
        }
      }
    }
    run()
  }, [detail, dreamId, isPremium, locale, getAccessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  const commitGauge = useCallback(
    (value: number) => {
      if (!dreamId) return
      // Fire and forget: the reading has already switched on screen.
      void updateDream(dreamId, { gaugeValue: value }, getAccessToken).catch(() => undefined)
    },
    [dreamId, getAccessToken],
  )

  const remove = async () => {
    if (!dreamId) return
    if (!window.confirm(label('Supprimer ce rêve définitivement ?', 'Delete this dream for good?')))
      return
    try {
      await deleteDream(dreamId, getAccessToken)
      router.push('/reves')
    } catch {
      setError(label('La suppression a échoué.', 'Deletion failed.'))
    }
  }

  if (loading || pageLoading) {
    return (
      <>
        <Starfield />
        <main className="relative mx-auto max-w-2xl px-4 pt-10 pb-16 sm:px-6">
          <Skeleton lines={6} />
        </main>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Starfield />
        <main className="relative mx-auto max-w-2xl px-4 pt-16 pb-16 text-center sm:px-6">
          <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
            {label('Connecte-toi pour ouvrir ton journal.', 'Sign in to open your journal.')}
          </p>
          <Link
            href="/connexion"
            className="btn-primary inline-block rounded-xl px-6 py-2.5 text-sm"
          >
            {label('Connexion', 'Sign in')}
          </Link>
        </main>
        <SiteFooter />
      </>
    )
  }

  if (error && !detail) {
    return (
      <>
        <Starfield />
        <main className="relative mx-auto max-w-2xl px-4 pt-16 pb-16 text-center sm:px-6">
          <p className="mb-4 text-sm text-[var(--color-text-secondary)]">{error}</p>
          <Link href="/reves" className="btn-ghost inline-block rounded-xl px-6 py-2.5 text-sm">
            {label('← Retour au journal', '← Back to the journal')}
          </Link>
        </main>
        <SiteFooter />
      </>
    )
  }

  if (!detail) return null

  const { dream, interpretation, image } = detail
  const emotions = (dream.emotions ?? []).filter(isEmotionKey)

  return (
    <>
      <Starfield />
      <main className="relative mx-auto max-w-2xl px-4 pt-8 pb-16 sm:px-6">
        <Link
          href="/reves"
          className="mb-5 inline-block text-sm text-[var(--color-text-muted)] transition hover:text-[var(--color-text-secondary)]"
        >
          {label('← Journal', '← Journal')}
        </Link>

        {editing && (
          <div className="mb-6">
            <DreamManualForm
              initial={dream}
              onSaved={(updated) => {
                setDetail((prev) => (prev ? { ...prev, dream: updated } : prev))
                setEditing(false)
              }}
              onCancel={() => setEditing(false)}
            />
          </div>
        )}

        {/* Imagery */}
        {image?.url ? (
          <div className="relative mb-6 aspect-[3/4] w-full overflow-hidden rounded-2xl">
            <Image
              src={image.url}
              alt={
                dream.title ??
                label('Aquarelle générée pour ce rêve', 'Watercolour generated for this dream')
              }
              fill
              sizes="(max-width: 640px) 100vw, 640px"
              className="object-cover"
              unoptimized
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--color-space-deep)] to-transparent" />
          </div>
        ) : imaging ? (
          <div className="glass mb-6 flex aspect-[3/4] w-full items-center justify-center rounded-2xl">
            <p className="text-sm text-[var(--color-text-muted)]" role="status" aria-live="polite">
              {label('On peint ton rêve…', 'Painting your dream…')}
            </p>
          </div>
        ) : null}

        <h1 className="font-cinzel mb-1 text-2xl text-[var(--color-text-primary)] sm:text-3xl">
          {dream.title || label('Rêve sans titre', 'Untitled dream')}
        </h1>
        <p className="mb-4 text-sm text-[var(--color-text-muted)]">
          {longDate(dream.dream_date, locale)}
        </p>

        {(emotions.length > 0 || (dream.tags ?? []).length > 0) && (
          <div className="mb-5 flex flex-wrap gap-1.5">
            {emotions.map((emotion) => (
              <EmotionChip key={emotion} emotion={emotion} locale={locale} />
            ))}
            {(dream.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--color-glass-border)] px-2.5 py-1 text-xs text-[var(--color-text-muted)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="glass mb-5 rounded-2xl p-5">
          <p className="text-sm leading-relaxed whitespace-pre-line text-[var(--color-text-secondary)]">
            {dream.structured_text || dream.raw_text}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-2">
          <MetaChip
            label={label('Intensité', 'Intensity')}
            value={dream.emotional_intensity}
            max={10}
          />
          <MetaChip label={label('Lucidité', 'Lucidity')} value={dream.lucidity_level} max={5} />
          <MetaChip label={label('Sommeil', 'Sleep')} value={dream.sleep_quality} max={5} />
        </div>

        {/* Interpretation — Premium. Free members see what it would give them. */}
        <section className="glass mb-6 rounded-2xl p-5">
          <h2 className="font-cinzel mb-3 text-lg text-[var(--color-text-primary)]">
            {label('Interprétation', 'Interpretation')}
          </h2>

          {!isPremium ? (
            <div>
              <p className="mb-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {label(
                  'Ton rêve est bien consigné — ça, c’est gratuit et ça le restera. Le Premium ajoute trois lectures du même rêve : une factuelle appuyée sur les neurosciences du sommeil, une symbolique nourrie des archétypes jungiens, et la synthèse des deux. Ta Lune natale colore la symbolique.',
                  'Your dream is recorded — that part is free and stays free. Premium adds three readings of the same dream: a factual one grounded in sleep neuroscience, a symbolic one drawing on Jungian archetypes, and the synthesis of both. Your natal Moon colours the symbolic one.',
                )}
              </p>
              <Link
                href="/premium"
                className="btn-primary inline-block rounded-xl px-5 py-2.5 text-sm"
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent-gold), #b8863f)',
                }}
              >
                {label('Débloquer Premium — 9,99 $ ✦', 'Unlock Premium — $9.99 ✦')}
              </Link>
            </div>
          ) : interpreting ? (
            <Skeleton lines={4} />
          ) : interpretation ? (
            <>
              <DreamGauge
                content={interpretation.content}
                initialValue={dream.gauge_value ?? 0.5}
                onCommit={commitGauge}
                locale={locale}
              />
              <p className="mt-4 text-xs text-[var(--color-text-muted)]">
                {interpretation.astro_used
                  ? label('✦ Enrichie par ta carte natale.', '✦ Enriched by your natal chart.')
                  : label(
                      'Calcule ta carte natale pour que ta Lune colore la lecture spirituelle.',
                      'Calculate your natal chart so your Moon colours the spiritual reading.',
                    )}
                {!interpretation.astro_used && (
                  <>
                    {' '}
                    <Link
                      href="/carte-natale"
                      className="text-[var(--color-accent-lavender)] hover:underline"
                    >
                      {label('Ma carte natale →', 'My natal chart →')}
                    </Link>
                  </>
                )}
              </p>
            </>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">
              {notice ||
                label(
                  "L'interprétation n'est pas encore disponible.",
                  'The interpretation is not available yet.',
                )}
            </p>
          )}
        </section>

        {((dream.characters ?? []).length > 0 || (dream.places ?? []).length > 0) && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <ListBlock
              title={label('Personnages', 'Characters')}
              items={dream.characters ?? []}
              empty={label('Personne', 'Nobody')}
            />
            <ListBlock
              title={label('Lieux', 'Places')}
              items={dream.places ?? []}
              empty={label('Nulle part', 'Nowhere')}
            />
          </div>
        )}

        {error && <p className="mb-4 text-sm text-[var(--color-accent-rose)]">{error}</p>}

        <p className="mb-6 text-xs leading-relaxed text-[var(--color-text-muted)]">
          {label(
            'Ces lectures sont des pistes de réflexion, jamais un avis médical ou psychologique.',
            'These readings are avenues for reflection, never medical or psychological advice.',
          )}
        </p>

        <div className="flex flex-wrap gap-2">
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="btn-ghost rounded-xl px-4 py-2 text-xs"
            >
              {label('Corriger ce rêve', 'Correct this dream')}
            </button>
          )}
          <button
            type="button"
            onClick={remove}
            className="btn-ghost rounded-xl px-4 py-2 text-xs text-[var(--color-accent-rose)]"
          >
            {label('Supprimer ce rêve', 'Delete this dream')}
          </button>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

function MetaChip({ label, value, max }: { label: string; value: number | null; max: number }) {
  return (
    <div className="glass rounded-xl px-3 py-2 text-center">
      <div className="text-[11px] text-[var(--color-text-muted)]">{label}</div>
      <div className="font-mono text-sm text-[var(--color-accent-lavender)]">
        {value != null ? `${value}/${max}` : '—'}
      </div>
    </div>
  )
}

function ListBlock({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="mb-1 text-xs tracking-wide text-[var(--color-text-muted)] uppercase">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-secondary)]">
        {items.length > 0 ? items.join(', ') : empty}
      </p>
    </div>
  )
}
