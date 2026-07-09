'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Starfield from '@/components/Starfield'
import SiteFooter from '@/components/SiteFooter'
import { useLocale } from '@/lib/i18n'
import { computeCalendar } from '@/lib/skyCalendar'

interface RxWindow {
  startISO: string
  endISO?: string
  current: boolean
}

// Pair up Mercury's retro-begin / retro-end events. The scan starts one month
// in the past so a window that is already ongoing keeps its true start date.
function mercuryWindows(now: Date): RxWindow[] {
  const scanFrom = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 15))
  const todayISO = now.toISOString().slice(0, 10)
  const events = computeCalendar(scanFrom, 16)
    .flatMap((m) => m.events)
    .filter((e) => e.planetKey === 'Mercure')
  const windows: RxWindow[] = []
  let open: RxWindow | null = null

  for (const e of events) {
    if (e.type === 'retro-begin') {
      open = { startISO: e.dateISO, current: false }
      windows.push(open)
    } else if (e.type === 'retro-end') {
      if (open && !open.endISO) open.endISO = e.dateISO
      open = null
    }
  }
  for (const w of windows) {
    if (w.startISO <= todayISO && (!w.endISO || w.endISO >= todayISO)) w.current = true
  }
  // Keep the ongoing window (if any) + the upcoming ones; drop fully past ones.
  return windows.filter((w) => w.current || w.startISO > todayISO).slice(0, 3)
}

export default function MercureRetrogradePage() {
  const { locale } = useLocale()
  const fr = locale === 'fr'
  const [windows, setWindows] = useState<RxWindow[] | null>(null)

  useEffect(() => {
    try {
      setWindows(mercuryWindows(new Date()))
    } catch {
      setWindows([])
    }
  }, [])

  const fmt = (iso?: string) =>
    iso
      ? new Date(iso + 'T12:00:00Z').toLocaleDateString(fr ? 'fr-CA' : 'en-CA', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        })
      : '…'

  const currentWindow = windows?.find((w) => w.current) ?? null

  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-10 pb-8">
        <Link
          href="/"
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-lavender)] transition"
        >
          ← {fr ? 'Accueil' : 'Home'}
        </Link>

        {/* ── Hero ── */}
        <div className="text-center mt-6 mb-8">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)]/80 mb-3">
            ☿ {fr ? 'Le guide sans panique' : 'The no-panic guide'}
          </p>
          <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl text-[var(--color-text-primary)]">
            {fr ? 'Mercure rétrograde' : 'Mercury retrograde'}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-3 max-w-xl mx-auto leading-relaxed">
            {fr
              ? 'Les dates à venir — calculées en direct — et ce que cette période signifie vraiment pour ta communication, tes contrats et tes déplacements.'
              : 'The upcoming dates — computed live — and what this period really means for your communication, contracts and travel.'}
          </p>
        </div>

        {/* ── Dates (live) ── */}
        <div
          className="glass p-6 mb-8"
          style={{
            borderColor: currentWindow ? 'rgba(219,163,184,0.4)' : 'rgba(179,167,224,0.25)',
          }}
        >
          {windows === null ? (
            <p className="text-center text-sm text-[var(--color-text-muted)]">
              {fr ? 'Calcul des dates…' : 'Computing dates…'}
            </p>
          ) : (
            <>
              {currentWindow ? (
                <div className="text-center mb-4">
                  <span className="inline-flex items-center gap-2 text-sm px-4 py-1.5 rounded-full bg-[var(--color-accent-rose)]/15 text-[var(--color-accent-rose)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-accent-rose)] animate-pulse" />
                    {fr
                      ? `Mercure est rétrograde en ce moment — jusqu'au ${fmt(currentWindow.endISO)}`
                      : `Mercury is retrograde right now — until ${fmt(currentWindow.endISO)}`}
                  </span>
                </div>
              ) : (
                <p className="text-center text-sm text-[var(--color-text-secondary)] mb-4">
                  {fr
                    ? 'Mercure avance en ce moment. Prochaines rétrogradations :'
                    : 'Mercury is direct right now. Next retrogrades:'}
                </p>
              )}
              <ul className="space-y-2 max-w-md mx-auto">
                {windows.map((w, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 text-sm px-4 py-2.5 rounded-xl bg-white/[0.04] border border-[var(--color-glass-border)]"
                  >
                    <span className="text-[var(--color-text-primary)]">
                      ☿℞ {fmt(w.startISO)} → {fmt(w.endISO)}
                    </span>
                    {w.current && (
                      <span className="text-[11px] text-[var(--color-accent-rose)] shrink-0">
                        {fr ? 'en cours' : 'now'}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="text-center text-[11px] text-[var(--color-text-muted)] mt-4">
                {fr
                  ? 'Dates calculées en direct par notre éphéméride — à un jour près.'
                  : 'Dates computed live by our ephemeris — accurate to about a day.'}
              </p>
            </>
          )}
        </div>

        {/* ── Contenu SEO ── */}
        <div className="glass p-6 sm:p-8 text-sm leading-relaxed space-y-6 text-[var(--color-text-secondary)]">
          <section>
            <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
              {fr ? "C'est quoi, au juste ?" : 'What is it, exactly?'}
            </h2>
            <p>
              {fr
                ? "Trois à quatre fois par année, Mercure semble reculer dans le ciel vu de la Terre. C'est une illusion d'optique — la Terre et Mercure orbitent à des vitesses différentes, comme deux trains qui se dépassent. Rien ne recule vraiment. Mais en astrologie psychologique, cette apparence a un sens : tout ce que Mercure gouverne — la communication, le mental, les échanges, les trajets — est invité à se retourner vers l'intérieur."
                : "Three to four times a year, Mercury appears to move backwards in the sky as seen from Earth. It's an optical illusion — Earth and Mercury orbit at different speeds, like two trains overtaking each other. Nothing actually reverses. But in psychological astrology, the appearance carries meaning: everything Mercury governs — communication, the mind, exchanges, travel — is invited to turn inward."}
            </p>
          </section>

          <section>
            <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
              {fr ? 'Ce que ça ne veut pas dire' : "What it doesn't mean"}
            </h2>
            <p>
              {fr
                ? "Ta vie ne va pas s'effondrer. Ton téléphone ne va pas exploser. Mercure rétrograde n'est ni une malédiction ni une excuse — c'est un rythme. Les malentendus et les retards sont simplement un peu plus probables, comme la pluie en novembre. On ne panique pas : on prend un parapluie."
                : "Your life won't fall apart. Your phone won't explode. Mercury retrograde is neither a curse nor an excuse — it's a rhythm. Misunderstandings and delays are simply a bit more likely, like rain in November. You don't panic: you bring an umbrella."}
            </p>
          </section>

          <section>
            <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
              {fr ? "Les bons réflexes : l'art du « re »" : "The right reflexes: the art of 're'"}
            </h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>
                {fr
                  ? 'Relire — les contrats, les courriels importants, deux fois.'
                  : 'Re-read — contracts and important emails, twice.'}
              </li>
              <li>
                {fr
                  ? "Réviser — les projets en cours plutôt qu'en lancer de nouveaux."
                  : 'Revise — ongoing projects rather than launching new ones.'}
              </li>
              <li>
                {fr
                  ? "Reprendre contact — les personnes du passé qui ressurgissent, c'est classique."
                  : 'Reconnect — people from the past resurfacing is classic.'}
              </li>
              <li>
                {fr
                  ? 'Ralentir — prévoir de la marge dans les déplacements.'
                  : 'Slow down — leave margin in your travel plans.'}
              </li>
              <li>
                {fr ? 'Sauvegarder — tes fichiers. Vraiment.' : 'Back up — your files. Really.'}
              </li>
            </ul>
          </section>

          <section
            className="rounded-xl p-5"
            style={{
              background:
                'linear-gradient(135deg, color-mix(in srgb, var(--color-accent-gold) 10%, transparent), transparent)',
              border: '1px solid rgba(224,169,78,0.3)',
            }}
          >
            <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-2">
              {fr
                ? 'Es-tu né·e pendant Mercure rétrograde ?'
                : 'Were you born during Mercury retrograde?'}
            </h2>
            <p className="mb-4">
              {fr
                ? "Environ une personne sur cinq. Si c'est ton cas, ton Mercure natal porte le badge ℞ : un mental plus intérieur, qui mûrit ses idées avant de les partager — souvent un grand talent d'écriture ou d'écoute. Vérifie en deux minutes :"
                : "About one person in five. If that's you, your natal Mercury carries the ℞ badge: a more inward mind that ripens ideas before sharing them — often a gift for writing or listening. Check in two minutes:"}
            </p>
            <Link
              href="/"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium glow-lavender"
            >
              <span aria-hidden="true">✦</span>
              {fr ? 'Lire ma carte natale gratuite' : 'Read my free natal chart'}
            </Link>
          </section>

          <section>
            <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">FAQ</h2>
            <div className="space-y-3">
              {[
                {
                  q: fr
                    ? 'Combien de temps dure une rétrogradation de Mercure ?'
                    : 'How long does a Mercury retrograde last?',
                  a: fr
                    ? 'Environ trois semaines, trois à quatre fois par année. Les dates exactes ci-dessus sont calculées en direct par notre éphéméride.'
                    : 'About three weeks, three to four times a year. The exact dates above are computed live by our ephemeris.',
                },
                {
                  q: fr
                    ? 'Est-ce que ça affecte tout le monde pareil ?'
                    : 'Does it affect everyone the same way?',
                  a: fr
                    ? "Non. L'effet ressenti dépend de ta carte natale — notamment du signe et de la maison où transite Mercure par rapport à ton thème. C'est justement ce que montre une lecture personnalisée."
                    : "No. How it lands depends on your natal chart — especially the sign and house Mercury transits relative to your chart. That's exactly what a personal reading shows.",
                },
                {
                  q: fr
                    ? "Où voir toutes les rétrogradations de l'année ?"
                    : "Where can I see all the year's retrogrades?",
                  a: fr
                    ? 'Notre calendrier céleste liste les 12 prochains mois : rétrogradations de toutes les planètes, pleines lunes et saisons zodiacales.'
                    : 'Our celestial calendar lists the next 12 months: all planetary retrogrades, full moons and zodiac seasons.',
                },
              ].map((item, i) => (
                <details key={i} className="glass p-4 group">
                  <summary className="cursor-pointer flex items-center justify-between text-sm font-medium text-[var(--color-text-primary)]">
                    <span>{item.q}</span>
                    <span className="text-[var(--color-accent-lavender)] text-lg transition-transform group-open:rotate-45 ml-3">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <p className="text-center pt-2">
            <Link
              href="/calendrier"
              className="inline-flex items-center gap-2 text-sm text-[var(--color-accent-lavender)] hover:text-[var(--color-text-primary)] transition"
            >
              {fr
                ? 'Voir le calendrier céleste des 12 prochains mois'
                : 'See the 12-month celestial calendar'}
              <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}
