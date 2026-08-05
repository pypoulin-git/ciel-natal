'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'
import Starfield from '@/components/Starfield'
import SiteFooter from '@/components/SiteFooter'
import Skeleton from '@/components/ui/Skeleton'
import DreamCalendar from '@/components/dreams/DreamCalendar'
import DreamCapture from '@/components/dreams/DreamCapture'
import DreamDashboard from '@/components/dreams/DreamDashboard'
import DreamManualForm from '@/components/dreams/DreamManualForm'
import DreamCard from '@/components/dreams/DreamCard'
import EmotionChip from '@/components/dreams/EmotionChip'
import { listDreamStats, listDreams } from '@/lib/dreamClient'
import { EMOTIONS, type Dream } from '@/lib/dreams'
import { windowStart, type StatDream } from '@/lib/dreamStats'

const SAMPLE_DREAM_FR = `Je marchais sur une plage la nuit, et l'eau montait sans jamais me toucher. Quelqu'un que je connaissais m'appelait depuis la dune, mais chaque fois que je me retournais, la voix venait d'ailleurs.`

const SAMPLE_READING_FR = `Cette eau qui monte sans t'atteindre dit quelque chose d'une inquiétude que tu tiens à distance — présente, montante, mais jamais tout à fait au contact. Ta Lune natale colore ce paysage : elle a besoin que les choses soient nommées avant d'être ressenties, et le rêve te propose l'inverse. La voix qui se déplace, elle, ressemble moins à quelqu'un qu'à une part de toi qui refuse d'être localisée. Le rêve ne te met pas en garde. Il te montre où tu regardes.`

export default function RevesPage() {
  const { user, isPremium, loading, getAccessToken } = useAuth()
  const { locale } = useLocale()
  const fr = locale !== 'en'
  const label = (frText: string, enText: string) => (fr ? frText : enText)

  const today = useMemo(() => new Date(), [])
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [monthDreams, setMonthDreams] = useState<Dream[]>([])
  const [recent, setRecent] = useState<Dream[]>([])
  const [statDreams, setStatDreams] = useState<StatDream[]>([])
  const [dreamsLoading, setDreamsLoading] = useState(true)

  const monthKey = `${year}-${String(month).padStart(2, '0')}`
  // Two years: the widest dashboard window is 12 months, and it compares
  // itself against the 12 before it.
  const statsSince = useMemo(() => windowStart(new Date().toISOString().slice(0, 10), 760), [])

  // The journal itself is free — this runs for every signed-in member.
  const load = useCallback(async () => {
    if (!user) {
      setDreamsLoading(false)
      return
    }
    setDreamsLoading(true)
    try {
      const [monthResult, recentResult, statsResult] = await Promise.all([
        listDreams(getAccessToken, monthKey),
        listDreams(getAccessToken),
        listDreamStats(getAccessToken, statsSince),
      ])
      setMonthDreams(monthResult.dreams ?? [])
      setRecent(recentResult.dreams ?? [])
      setStatDreams(statsResult.dreams ?? [])
    } catch {
      /* the page still works without the list */
    } finally {
      setDreamsLoading(false)
    }
  }, [user, getAccessToken, monthKey, statsSince])

  useEffect(() => {
    load()
  }, [load])

  // The list under the calendar: the selected night, or the whole month.
  const listedDreams = selectedDate
    ? monthDreams.filter((dream) => dream.dream_date === selectedDate)
    : monthDreams

  return (
    <>
      <Starfield />
      <main className="relative mx-auto max-w-5xl px-4 pt-10 pb-16 sm:px-6">
        <header className="mb-8 text-center">
          <h1 className="font-cinzel mb-2 text-3xl text-[var(--color-text-primary)] sm:text-4xl">
            {label('Journal de rêves', 'Dream journal')}
          </h1>
          <p className="mx-auto max-w-xl text-sm text-[var(--color-text-secondary)]">
            {label(
              'Consigner tes rêves est gratuit. Avec Premium, ils sont mis au clair puis rendus en trois lectures — et ta carte natale colore la plus symbolique des trois.',
              'Recording your dreams is free. With Premium they get tidied up and handed back as three readings — and your natal chart colours the most symbolic of the three.',
            )}
          </p>
        </header>

        {loading ? (
          <Skeleton lines={4} />
        ) : !user ? (
          <SignedOutTeaser locale={locale} />
        ) : (
          <div className="space-y-8">
            {isPremium ? (
              <DreamCapture onSaved={() => load()} />
            ) : (
              <>
                <DreamManualForm onSaved={() => load()} />
                <PremiumUpsell locale={locale} />
              </>
            )}

            {dreamsLoading ? (
              <Skeleton lines={5} />
            ) : (
              <DreamDashboard dreams={statDreams} locale={locale} />
            )}

            <section>
              <h2 className="font-cinzel mb-3 text-lg text-[var(--color-text-primary)]">
                {label('Ton mois, nuit par nuit', 'Your month, night by night')}
              </h2>
              {/* Calendar and list side by side once there's room: pick a
                  night on the left, read it on the right without scrolling. */}
              <div className="grid gap-4 lg:grid-cols-[minmax(0,26rem)_1fr] lg:items-start">
                <DreamCalendar
                  year={year}
                  month={month}
                  dreams={monthDreams}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  onNavigate={(y, m) => {
                    setYear(y)
                    setMonth(m)
                    setSelectedDate(null)
                  }}
                  locale={locale}
                />

                {/* The month's dreams are listed whether or not a day is picked —
                    the old page showed nothing until you clicked a cell, which
                    made a full month look like an empty one. */}
                <div>
                  {selectedDate && (
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {listedDreams.length > 0
                          ? label(
                              `${listedDreams.length} rêve${listedDreams.length > 1 ? 's' : ''} cette nuit-là`,
                              `${listedDreams.length} dream${listedDreams.length > 1 ? 's' : ''} that night`,
                            )
                          : label('Aucun rêve consigné ce jour-là.', 'No dream recorded that day.')}
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedDate(null)}
                        className="btn-ghost rounded-xl px-3 py-1.5 text-xs"
                      >
                        {label('Voir tout le mois', 'See the whole month')}
                      </button>
                    </div>
                  )}

                  {listedDreams.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {listedDreams.map((dream) => (
                        <DreamCard key={dream.id} dream={dream} locale={locale} />
                      ))}
                    </div>
                  ) : (
                    !selectedDate && (
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {recent.length === 0
                          ? label(
                              "Ton journal est vide. Le premier rêve est toujours le plus difficile à attraper — écris-le avant d'ouvrir les yeux tout à fait.",
                              'Your journal is empty. The first dream is always the hardest to catch — write it down before you fully open your eyes.',
                            )
                          : label(
                              'Rien pour ce mois-ci. Navigue vers un autre mois, ou consigne le rêve de cette nuit.',
                              'Nothing this month. Move to another month, or record last night’s dream.',
                            )}
                      </p>
                    )
                  )}
                </div>
              </div>
            </section>

            {recent.length > 0 && (
              <section>
                <h2 className="font-cinzel mb-1 text-lg text-[var(--color-text-primary)]">
                  {label('Tes derniers rêves', 'Your latest dreams')}
                </h2>
                <p className="mb-3 text-xs text-[var(--color-text-muted)]">
                  {label('Tous mois confondus.', 'Across every month.')}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {recent.slice(0, 6).map((dream) => (
                    <DreamCard key={dream.id} dream={dream} locale={locale} />
                  ))}
                </div>
              </section>
            )}

            <EmotionLegend locale={locale} />
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}

/** Shown to a free member under their form: what the AI would add. */
function PremiumUpsell({ locale }: { locale: string }) {
  const fr = locale !== 'en'
  const label = (frText: string, enText: string) => (fr ? frText : enText)

  const perks = fr
    ? [
        [
          '✍️',
          "L'IA met ton récit au clair — titre, thèmes, émotions, personnages et lieux, extraits tout seuls.",
        ],
        [
          '🔬',
          'Trois lectures du même rêve, et un curseur pour doser entre neurosciences et archétypes.',
        ],
        ['🌙', 'Ta Lune natale colore la lecture symbolique. Personne d’autre ne peut faire ça.'],
        ['🎨', 'Une aquarelle onirique par rêve.'],
      ]
    : [
        [
          '✍️',
          'The AI tidies your account — title, themes, emotions, characters and places, pulled out on their own.',
        ],
        [
          '🔬',
          'Three readings of the same dream, and a slider to set the dose between neuroscience and archetypes.',
        ],
        ['🌙', 'Your natal Moon colours the symbolic reading. Nobody else can do that.'],
        ['🎨', 'One dreamlike watercolour per dream.'],
      ]

  return (
    <div
      className="glass rounded-2xl p-5 sm:p-6"
      style={{
        borderColor: 'rgba(224,169,78,0.3)',
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--color-accent-gold) 8%, transparent), transparent)',
      }}
    >
      <p className="mb-2 text-xs tracking-widest text-[var(--color-accent-gold)]/85 uppercase">
        ✦ {label('Avec Premium', 'With Premium')}
      </p>
      <h2 className="font-cinzel mb-3 text-lg text-[var(--color-text-primary)]">
        {label('Ce que l’IA ajoute à ton journal', 'What the AI adds to your journal')}
      </h2>
      <ul className="mb-4 space-y-2">
        {perks.map(([icon, text]) => (
          <li key={text} className="flex gap-2.5 text-sm text-[var(--color-text-secondary)]">
            <span aria-hidden="true" className="shrink-0">
              {icon}
            </span>
            <span className="leading-relaxed">{text}</span>
          </li>
        ))}
      </ul>
      <p className="mb-4 text-xs text-[var(--color-text-muted)]">
        {label(
          'Ton registre reste gratuit, quoi qu’il arrive. Le Premium est un paiement unique de 9,99 $ qui débloque aussi tout le reste du site.',
          'Your registry stays free, whatever happens. Premium is a one-time 9.99 CAD that also unlocks everything else on the site.',
        )}
      </p>
      <Link
        href="/premium"
        className="btn-primary inline-block rounded-xl px-6 py-2.5 text-sm"
        style={{ background: 'linear-gradient(135deg, var(--color-accent-gold), #b8863f)' }}
      >
        {label('Débloquer Premium — 9,99 $ ✦', 'Unlock Premium — $9.99 ✦')}
      </Link>
    </div>
  )
}

/** What a visitor sees before signing in — the pitch, not a login wall. */
function SignedOutTeaser({ locale }: { locale: string }) {
  const fr = locale !== 'en'
  const label = (frText: string, enText: string) => (fr ? frText : enText)

  const free = fr
    ? [
        'Note tes rêves à la main, autant que tu veux',
        'Choisis tes émotions parmi huit, ajoute tes propres thèmes',
        'Le calendrier du mois avec une pastille colorée par nuit',
        'Relis, corrige et supprime quand tu veux',
      ]
    : [
        'Write your dreams by hand, as many as you like',
        'Pick your emotions from eight, add your own themes',
        'The month calendar with one coloured dot per night',
        'Reread, correct and delete whenever you want',
      ]

  const premium = fr
    ? [
        "L'IA structure ton récit : titre, thèmes, émotions, personnages, lieux",
        'Trois lectures du même rêve — factuelle, spirituelle, mixte — avec un curseur',
        'Ta Lune natale, ton Soleil et ton Ascendant colorent la lecture symbolique',
        'Une aquarelle onirique générée pour chaque rêve',
      ]
    : [
        'The AI structures your account: title, themes, emotions, characters, places',
        'Three readings of the same dream — factual, spiritual, blended — with a slider',
        'Your natal Moon, Sun and Ascendant colour the symbolic reading',
        'A dreamlike watercolour generated for each dream',
      ]

  return (
    <div className="space-y-6">
      <SampleDream locale={locale} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <p className="mb-3 text-xs tracking-widest text-[var(--color-accent-lavender)]/70 uppercase">
            {label('Gratuit · avec un compte', 'Free · with an account')}
          </p>
          <ul className="space-y-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {free.map((item) => (
              <li key={item}>✦ {item}</li>
            ))}
          </ul>
        </div>
        <div
          className="glass rounded-2xl p-5"
          style={{
            borderColor: 'rgba(224,169,78,0.32)',
            background:
              'linear-gradient(135deg, color-mix(in srgb, var(--color-accent-gold) 8%, transparent), transparent)',
          }}
        >
          <p className="mb-3 text-xs tracking-widest text-[var(--color-accent-gold)]/85 uppercase">
            {label('✦ Passe Premium · 9,99 $ une fois', '✦ Premium pass · $9.99 one-time')}
          </p>
          <ul className="space-y-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {premium.map((item) => (
              <li key={item}>✦ {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass glow-rose rounded-2xl p-6 text-center">
        <p className="mb-1 text-sm text-[var(--color-text-primary)]">
          {label(
            'Crée ton compte : le registre de rêves est gratuit.',
            'Create your account: the dream registry is free.',
          )}
        </p>
        <p className="mb-4 text-xs text-[var(--color-text-secondary)]">
          {label(
            'Tu passeras Premium quand tu voudras que l’IA les interprète.',
            'Go Premium whenever you want the AI to interpret them.',
          )}
        </p>
        <Link
          href="/inscription"
          className="btn-primary inline-block rounded-xl px-6 py-2.5 text-sm"
        >
          {label('Créer mon compte ✦', 'Create my account ✦')}
        </Link>
      </div>
    </div>
  )
}

/** A worked example, so the value is visible before paying. */
function SampleDream({ locale }: { locale: string }) {
  const fr = locale !== 'en'
  if (!fr) {
    return (
      <div className="glass rounded-2xl p-5 sm:p-6">
        <div className="mb-2 text-xs tracking-wide text-[var(--color-text-muted)] uppercase">
          Example of a Premium reading
        </div>
        <h2 className="font-cinzel mb-3 text-lg text-[var(--color-text-primary)]">
          The tide that never arrives
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-secondary)] italic">
          I was walking on a beach at night, and the water kept rising without ever touching me.
          Someone I knew was calling me from the dune, but every time I turned, the voice came from
          somewhere else.
        </p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          <EmotionChip emotion="anxiety" locale={locale} compact />
          <EmotionChip emotion="wonder" locale={locale} compact />
        </div>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          That rising water dying just short of you says something about a worry you keep at
          arm&apos;s length — present, mounting, never quite in contact. Your natal Moon colours
          this landscape: it needs things named before they can be felt, and the dream offers the
          reverse. The voice that keeps moving looks less like a person than like a part of you
          refusing to be located. The dream is not warning you. It is showing you where you look.
        </p>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <div className="mb-2 text-xs tracking-wide text-[var(--color-text-muted)] uppercase">
        Exemple d&apos;une lecture Premium
      </div>
      <h2 className="font-cinzel mb-3 text-lg text-[var(--color-text-primary)]">
        La marée qui n&apos;arrive jamais
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-secondary)] italic">
        {SAMPLE_DREAM_FR}
      </p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        <EmotionChip emotion="anxiety" locale={locale} compact />
        <EmotionChip emotion="wonder" locale={locale} compact />
      </div>
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {SAMPLE_READING_FR}
      </p>
    </div>
  )
}

function EmotionLegend({ locale }: { locale: string }) {
  const fr = locale !== 'en'
  return (
    <section>
      <h2 className="font-cinzel mb-3 text-lg text-[var(--color-text-primary)]">
        {fr ? 'Les huit émotions' : 'The eight emotions'}
      </h2>
      <div className="flex flex-wrap gap-1.5">
        {Object.keys(EMOTIONS).map((key) => (
          <EmotionChip key={key} emotion={key as keyof typeof EMOTIONS} locale={locale} />
        ))}
      </div>
    </section>
  )
}
