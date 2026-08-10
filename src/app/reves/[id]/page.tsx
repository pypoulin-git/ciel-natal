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

/** Written in the last few minutes — i.e. the dreamer is still in the flow. */
function isFresh(createdAt: string | null | undefined): boolean {
  if (!createdAt) return false
  const age = Date.now() - new Date(createdAt).getTime()
  return Number.isFinite(age) && age >= 0 && age < 10 * 60 * 1000
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
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [instruction, setInstruction] = useState('')
  const [imageNotice, setImageNotice] = useState('')
  const [zoom, setZoom] = useState(false)

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

      // The painting happens by itself on a freshly written dream — that's the
      // moment it delights. On an older dream that still has none, it failed or
      // the quota ran out, and retrying silently on every visit would keep
      // spending images nobody asked for. There's a button for that below.
      if (!detail.image && isFresh(detail.dream.created_at)) {
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

  // Re-paint the dream, optionally following an adjustment typed by the
  // dreamer. Costs one image from the monthly quota either way, so it is only
  // ever triggered by an explicit click — never by the effect above.
  const repaint = useCallback(
    async (text: string) => {
      if (!dreamId || imaging) return
      setImaging(true)
      setImageNotice('')
      try {
        const image = await generateDreamImage(dreamId, locale, getAccessToken, true, text)
        setDetail((prev) => (prev ? { ...prev, image } : prev))
        setInstruction('')
        setAdjustOpen(false)
      } catch (err) {
        setImageNotice(
          err instanceof DreamApiError && err.code === 'QUOTA_EXCEEDED'
            ? err.message
            : label('La nouvelle image a échoué. Réessaie.', 'The new image failed. Try again.'),
        )
      } finally {
        setImaging(false)
      }
    },
    [dreamId, imaging, locale, getAccessToken], // eslint-disable-line react-hooks/exhaustive-deps
  )

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
      <main className="relative mx-auto max-w-5xl px-4 pt-8 pb-16 sm:px-6">
        <Link
          href="/reves"
          className="mb-4 inline-block text-sm text-[var(--color-text-muted)] transition hover:text-[var(--color-text-secondary)]"
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

        {/* The watercolour, opened. A 3:4 image at full page width was taller
            than a phone screen on its own, so the whole dream lived below the
            fold. It is a thumbnail now, and this is the way to see it big. */}
        {zoom && image?.url && (
          <div className="mb-5">
            <div className="relative mx-auto aspect-[3/4] h-[min(68vh,32rem)] overflow-hidden rounded-2xl">
              <Image
                src={image.url}
                alt={
                  dream.title ??
                  label('Aquarelle générée pour ce rêve', 'Watercolour generated for this dream')
                }
                fill
                sizes="384px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={() => setZoom(false)}
                className="btn-ghost rounded-xl px-4 py-2 text-xs"
              >
                {label("Réduire l'image", 'Shrink the image')}
              </button>
            </div>
          </div>
        )}

        {/* Identity: the picture beside the title, not above the whole page. */}
        <header className="mb-5 flex items-start gap-4">
          {((image?.url && !zoom) || imaging) && (
            <div className="w-24 shrink-0 sm:w-32 lg:w-40">
              {image?.url ? (
                <button
                  type="button"
                  onClick={() => setZoom(true)}
                  aria-label={label("Agrandir l'image", 'Enlarge the image')}
                  className="relative block aspect-[3/4] w-full overflow-hidden rounded-xl transition hover:opacity-90"
                >
                  <Image
                    src={image.url}
                    alt={
                      dream.title ??
                      label(
                        'Aquarelle générée pour ce rêve',
                        'Watercolour generated for this dream',
                      )
                    }
                    fill
                    sizes="160px"
                    className={`object-cover transition-opacity ${imaging ? 'opacity-25' : ''}`}
                    unoptimized
                  />
                  {imaging && (
                    <span
                      className="absolute inset-0 flex items-center justify-center px-1 text-center text-[11px] leading-tight text-[var(--color-text-secondary)]"
                      role="status"
                      aria-live="polite"
                    >
                      {label('On repeint…', 'Repainting…')}
                    </span>
                  )}
                </button>
              ) : (
                <div className="glass flex aspect-[3/4] w-full items-center justify-center rounded-xl">
                  <p
                    className="px-2 text-center text-[11px] leading-tight text-[var(--color-text-muted)]"
                    role="status"
                    aria-live="polite"
                  >
                    {label('On peint ton rêve…', 'Painting your dream…')}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="font-cinzel mb-1 text-2xl text-[var(--color-text-primary)] sm:text-3xl">
              {dream.title || label('Rêve sans titre', 'Untitled dream')}
            </h1>
            <p className="mb-3 text-sm text-[var(--color-text-muted)]">
              {longDate(dream.dream_date, locale)}
            </p>

            {(emotions.length > 0 || (dream.tags ?? []).length > 0) && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {emotions.map((emotion) => (
                  <EmotionChip key={emotion} emotion={emotion} locale={locale} compact />
                ))}
                {(dream.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--color-glass-border)] px-2 py-0.5 text-[11px] text-[var(--color-text-muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Three numbers on one line rather than three cards on three —
                they are context, not headlines. */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)]">
              <Meta
                label={label('Intensité', 'Intensity')}
                value={dream.emotional_intensity}
                max={10}
              />
              <Meta label={label('Lucidité', 'Lucidity')} value={dream.lucidity_level} max={5} />
              <Meta label={label('Sommeil', 'Sleep')} value={dream.sleep_quality} max={5} />
            </div>

            {isPremium && !imaging && !adjustOpen && (
              <button
                type="button"
                onClick={() => setAdjustOpen(true)}
                className="btn-ghost mt-3 rounded-xl px-3 py-1.5 text-xs"
              >
                {image?.url
                  ? label("Ajuster l'image ✦", 'Adjust the image ✦')
                  : label('Peindre ce rêve ✦', 'Paint this dream ✦')}
              </button>
            )}
          </div>
        </header>

        {/* Adjusting the image. An image is a reading too — and the first one
            is rarely the one the dreamer saw. Also the way back in when the
            first attempt failed silently, which it is allowed to do. */}
        {isPremium && !imaging && (adjustOpen || imageNotice) && (
          <div className="mb-5">
            {adjustOpen && (
              <div className="glass rounded-2xl p-4">
                <label
                  htmlFor="image-instruction"
                  className="mb-1 block text-xs text-[var(--color-text-muted)]"
                >
                  {image?.url
                    ? label(
                        "Qu'est-ce qui ne colle pas ? Dis-le dans tes mots.",
                        "What isn't right? Say it in your own words.",
                      )
                    : label(
                        'Une précision à donner au peintre ? (optionnel)',
                        'Anything to tell the painter? (optional)',
                      )}
                </label>
                <input
                  id="image-instruction"
                  type="text"
                  value={instruction}
                  maxLength={300}
                  onChange={(e) => setInstruction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return
                    if (image?.url && instruction.trim().length < 3) return
                    void repaint(instruction.trim())
                  }}
                  placeholder={label(
                    'La maison devrait être en ruine, vue de loin…',
                    'The house should be a ruin, seen from far away…',
                  )}
                  className="glass-input w-full rounded-xl px-3 py-2 text-sm"
                />
                <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">
                  {label(
                    'Chaque nouvelle image compte dans ton quota mensuel (10 par mois).',
                    'Each new image counts against your monthly quota (10 per month).',
                  )}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void repaint(instruction.trim())}
                    disabled={Boolean(image?.url) && instruction.trim().length < 3}
                    className="btn-primary rounded-xl px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {image?.url
                      ? label('Nouvelle version', 'New version')
                      : label('Peindre ✦', 'Paint ✦')}
                  </button>
                  {image?.url && (
                    <button
                      type="button"
                      onClick={() => void repaint('')}
                      className="btn-ghost rounded-xl px-4 py-2 text-xs"
                    >
                      {label('Simplement réessayer', 'Just try again')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustOpen(false)
                      setImageNotice('')
                    }}
                    className="btn-ghost rounded-xl px-4 py-2 text-xs"
                  >
                    {label('Annuler', 'Cancel')}
                  </button>
                </div>
              </div>
            )}
            {imageNotice && (
              <p className="mt-2 text-sm text-[var(--color-accent-rose)]" role="status">
                {imageNotice}
              </p>
            )}
          </div>
        )}

        {/* The account and the reading side by side once there is room: the two
            things you came to read, both on screen at once. */}
        <div className="mb-5 grid gap-5 lg:grid-cols-2 lg:items-start">
          <div className="space-y-5">
            <div className="glass rounded-2xl p-5">
              <p className="text-sm leading-relaxed whitespace-pre-line text-[var(--color-text-secondary)]">
                {dream.structured_text || dream.raw_text}
              </p>
            </div>

            {((dream.characters ?? []).length > 0 || (dream.places ?? []).length > 0) && (
              <div className="grid gap-4 sm:grid-cols-2">
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
          </div>

          {/* Interpretation — Premium. Free members see what it would give them. */}
          <section className="glass rounded-2xl p-5">
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
        </div>

        {error && <p className="mb-4 text-sm text-[var(--color-accent-rose)]">{error}</p>}

        <div className="flex flex-wrap items-center gap-2">
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

        <p className="mt-4 text-xs leading-relaxed text-[var(--color-text-muted)]">
          {label(
            'Ces lectures sont des pistes de réflexion, jamais un avis médical ou psychologique.',
            'These readings are avenues for reflection, never medical or psychological advice.',
          )}
        </p>
      </main>
      <SiteFooter />
    </>
  )
}

function Meta({ label, value, max }: { label: string; value: number | null; max: number }) {
  return (
    <span>
      {label}{' '}
      <span className="font-mono tabular-nums text-[var(--color-accent-lavender)]">
        {value != null ? `${value}/${max}` : '—'}
      </span>
    </span>
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
