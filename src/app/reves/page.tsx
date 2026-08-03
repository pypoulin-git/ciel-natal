'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'
import Starfield from '@/components/Starfield'
import SiteFooter from '@/components/SiteFooter'
import PremiumGate from '@/components/PremiumGate'
import Skeleton from '@/components/ui/Skeleton'
import DreamCalendar from '@/components/dreams/DreamCalendar'
import DreamCapture from '@/components/dreams/DreamCapture'
import DreamCard from '@/components/dreams/DreamCard'
import EmotionChip from '@/components/dreams/EmotionChip'
import { listDreams } from '@/lib/dreamClient'
import { EMOTIONS, type Dream } from '@/lib/dreams'

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
  const [dreamsLoading, setDreamsLoading] = useState(true)

  const monthKey = `${year}-${String(month).padStart(2, '0')}`

  const load = useCallback(async () => {
    if (!user || !isPremium) {
      setDreamsLoading(false)
      return
    }
    setDreamsLoading(true)
    try {
      const [monthResult, recentResult] = await Promise.all([
        listDreams(getAccessToken, monthKey),
        listDreams(getAccessToken),
      ])
      setMonthDreams(monthResult.dreams ?? [])
      setRecent(recentResult.dreams ?? [])
    } catch {
      /* the page still works without the list */
    } finally {
      setDreamsLoading(false)
    }
  }, [user, isPremium, getAccessToken, monthKey])

  useEffect(() => {
    load()
  }, [load])

  const selectedDreams = selectedDate
    ? monthDreams.filter((dream) => dream.dream_date === selectedDate)
    : []

  return (
    <>
      <Starfield />
      <main className="relative mx-auto max-w-4xl px-4 pt-10 pb-16 sm:px-6">
        <header className="mb-8 text-center">
          <h1 className="font-cinzel mb-2 text-3xl text-[var(--color-text-primary)] sm:text-4xl">
            {label('Journal de rêves', 'Dream journal')}
          </h1>
          <p className="mx-auto max-w-xl text-sm text-[var(--color-text-secondary)]">
            {label(
              'Consigne ce dont tu te souviens au réveil. On le met au clair, puis on te le rend en trois lectures — et ta carte natale colore la plus symbolique des trois.',
              'Write down whatever you remember on waking. We tidy it up, then hand it back as three readings — and your natal chart colours the most symbolic of the three.',
            )}
          </p>
        </header>

        {loading ? (
          <Skeleton lines={4} />
        ) : !user ? (
          <SignedOutTeaser locale={locale} />
        ) : !isPremium ? (
          <PremiumGate>
            <SampleDream locale={locale} />
          </PremiumGate>
        ) : (
          <div className="space-y-8">
            <DreamCapture onSaved={() => load()} />

            <section>
              <h2 className="font-cinzel mb-3 text-lg text-[var(--color-text-primary)]">
                {label('Ton mois', 'Your month')}
              </h2>
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

              {selectedDate && (
                <div className="mt-4 space-y-3">
                  {selectedDreams.length > 0 ? (
                    selectedDreams.map((dream) => (
                      <DreamCard key={dream.id} dream={dream} locale={locale} />
                    ))
                  ) : (
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {label('Aucun rêve consigné ce jour-là.', 'No dream recorded that day.')}
                    </p>
                  )}
                </div>
              )}
            </section>

            <section>
              <h2 className="font-cinzel mb-3 text-lg text-[var(--color-text-primary)]">
                {label('Rêves récents', 'Recent dreams')}
              </h2>
              {dreamsLoading ? (
                <Skeleton lines={3} />
              ) : recent.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">
                  {label(
                    "Ton journal est vide. Le premier rêve est toujours le plus difficile à attraper — écris-le avant d'ouvrir les yeux tout à fait.",
                    'Your journal is empty. The first dream is always the hardest to catch — write it down before you fully open your eyes.',
                  )}
                </p>
              ) : (
                <div className="space-y-3">
                  {recent.slice(0, 8).map((dream) => (
                    <DreamCard key={dream.id} dream={dream} locale={locale} />
                  ))}
                </div>
              )}
            </section>

            <EmotionLegend locale={locale} />
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}

/** What a visitor sees before signing in — the pitch, not a login wall. */
function SignedOutTeaser({ locale }: { locale: string }) {
  const fr = locale !== 'en'
  const label = (frText: string, enText: string) => (fr ? frText : enText)

  const features = fr
    ? [
        [
          '✍️',
          'Capture au réveil',
          "Tu écris en vrac. L'IA en tire un titre, un récit clair, les thèmes, les émotions, les personnages et les lieux.",
        ],
        [
          '🔬',
          'Trois lectures, un curseur',
          'Neurosciences du sommeil, archétypes jungiens, ou le mélange des deux. Tu doses.',
        ],
        [
          '🌙',
          'Ta Lune natale, dedans',
          "C'est ce que personne d'autre ne peut faire : Natalune connaît déjà ta carte, et elle colore la lecture symbolique.",
        ],
        [
          '🎨',
          'Une aquarelle par rêve',
          'Palette de nuit, contours flous. Ton journal devient une galerie.',
        ],
        [
          '📅',
          'Le calendrier des émotions',
          'Une pastille colorée par nuit. Les motifs apparaissent tout seuls.',
        ],
      ]
    : [
        [
          '✍️',
          'Capture on waking',
          'You write it messy. The AI pulls out a title, a clear account, themes, emotions, characters and places.',
        ],
        [
          '🔬',
          'Three readings, one slider',
          'Sleep neuroscience, Jungian archetypes, or the blend. You set the dose.',
        ],
        [
          '🌙',
          'Your natal Moon, inside',
          'This is what nobody else can do: Natalune already knows your chart, and it colours the symbolic reading.',
        ],
        [
          '🎨',
          'A watercolour per dream',
          'Night palette, soft edges. Your journal becomes a gallery.',
        ],
        [
          '📅',
          'The emotion calendar',
          'One coloured dot per night. The patterns surface on their own.',
        ],
      ]

  return (
    <div className="space-y-6">
      <SampleDream locale={locale} />

      <div className="grid gap-3 sm:grid-cols-2">
        {features.map(([icon, title, desc]) => (
          <div key={title} className="glass rounded-2xl p-4">
            <div className="mb-1.5 text-xl opacity-80">{icon}</div>
            <h3 className="mb-1 text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
            <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">{desc}</p>
          </div>
        ))}
      </div>

      <div className="glass glow-rose rounded-2xl p-6 text-center">
        <p className="mb-1 text-sm text-[var(--color-text-primary)]">
          {label(
            'Le journal de rêves fait partie de Natalune Premium.',
            'The dream journal is part of Natalune Premium.',
          )}
        </p>
        <p className="mb-4 text-xs text-[var(--color-text-secondary)]">
          {label(
            'Paiement unique de 9,99 $ — accès à vie, avec tout le reste du Premium.',
            'One-time 9.99 CAD — lifetime access, together with everything else in Premium.',
          )}
        </p>
        <Link
          href="/inscription?intent=premium"
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
          Example
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
        Exemple
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
