"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import QuickChartForm from "@/components/QuickChartForm";
import HeroWheel, { type HeroWheelInput } from "@/components/HeroWheel";
import { encodeChartPayload } from "@/lib/chartLink";
import Starfield from "@/components/Starfield";
import SiteFooter from "@/components/SiteFooter";
import TitleSparkles from "@/components/TitleSparkles";
import SkyToday from "@/components/SkyToday";
import ExploreSections from "@/components/ExploreSections";
import LatestArticles from "@/components/LatestArticles";
import { useLocale } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import OffreComparatif from "@/components/OffreComparatif";

// ─── Home ───
// The promise, the birth form and a live wheel come first (QA 2026-11: the
// chart used to sit behind a second landing page and a three-step wizard).
// Then today's sky, all products, the free/premium model, the blog and FAQ.
export default function HomePortal() {
  const { locale } = useLocale();
  const { user, isPremium } = useAuth();
  const fr = locale === "fr";
  const router = useRouter();
  const [preview, setPreview] = useState<HeroWheelInput>({ date: "", heure: "12:00", hasTime: true, latitude: null, longitude: null });

  return (
    <main className="relative">
      <Starfield />
      <div className="relative z-10">
        {/* ═══ HERO — the promise, the form and the live wheel on one screen ═══ */}
        <section id="carte" className="relative overflow-hidden px-4 pt-10 pb-12 sm:pt-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] max-w-[95vw] rounded-full blur-3xl opacity-50"
            style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--color-accent-lavender) 55%, transparent), transparent 70%)" }}
          />
          <div className="relative mx-auto max-w-6xl">
            <div className="text-center animate-fade-in-up">
              <div
                className="text-4xl md:text-5xl mb-4 text-[var(--color-accent-gold)] animate-pulse-glow"
                style={{ filter: "drop-shadow(0 0 18px color-mix(in srgb, var(--color-accent-gold) 55%, transparent))" }}
                aria-hidden="true"
              >
                &#10022;
              </div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-accent-gold)]/90 mb-3">Natalune</p>
              <h1 className="font-cinzel text-3xl sm:text-5xl md:text-6xl leading-[1.08] text-[var(--color-text-primary)] max-w-4xl mx-auto">
                {fr ? "Ta carte du ciel, lue comme un portrait psychologique" : "Your birth chart, read as a psychological portrait"}
              </h1>
              <TitleSparkles id="portal-sparkles" className="h-16 max-w-xl mx-auto -z-0" />
              <p className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto -mt-8 relative z-10">
                {fr
                  ? "Des positions calculées pour de vrai, à la minute près, et une lecture inspirée de Jung. Pas un horoscope de magazine."
                  : "Positions truly calculated, to the minute, and a reading inspired by Jung. Not a magazine horoscope."}
              </p>
            </div>

            <div className="mt-10 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
              <div className="glass glow-lavender mx-auto w-full max-w-lg p-6 sm:p-8">
                <QuickChartForm
                  locale={fr ? "fr" : "en"}
                  idPrefix="accueil"
                  onChange={setPreview}
                  onSubmit={(d) => {
                    const c = encodeChartPayload({
                      n: d.prenom, g: d.genre, j: d.jour, m: d.mois, a: d.annee,
                      h: d.heure, mn: d.minute, ht: d.hasTime ? 1 : 0,
                      l: d.lieu, la: d.latitude, lo: d.longitude, v: d.voice,
                    });
                    router.push(`/carte-natale?c=${encodeURIComponent(c)}`);
                  }}
                />
              </div>
              <HeroWheel input={preview} locale={fr ? "fr" : "en"} />
            </div>

            <p className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
              {fr ? "Pas de date sous la main ? " : "No birth date handy? "}
              <Link href="/calendrier" className="text-[var(--color-accent-lavender)] underline underline-offset-4 hover:text-[var(--color-text-primary)]">
                {fr ? "Voir le ciel de la semaine" : "See this week's sky"}
              </Link>
            </p>
          </div>
        </section>

        {/* ═══ LE CIEL AUJOURD'HUI — actualité céleste (ancre du bandeau lunaire) ═══ */}
        <SkyToday />

        {/* ═══ EXPLORE — tous les produits du site ═══ */}
        <ExploreSections />

        {/* ═══ GRATUIT + PREMIUM ═══ */}
        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-9">
            <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)]/70 mb-2">
              {fr ? "Gratuit, et un peu plus" : "Free, and a little more"}
            </p>
            <h2 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-3">
              {fr ? "Gratuit pour tous — Premium pour aller plus loin" : "Free for everyone — Premium to go further"}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed">
              {fr
                ? "Le cœur de Natalune est gratuit, sans compte ni courriel. La passe Premium — un paiement unique — soutient ce projet indépendant et débloque les lectures les plus riches."
                : "The heart of Natalune is free, no account or email. The Premium pass — a one-time payment — supports this independent project and unlocks the richest readings."}
            </p>
          </div>
          {/* Same source of truth as /premium: the rows people decide on. */}
          <OffreComparatif locale={fr ? "fr" : "en"} compact />
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            {!isPremium && (
              <a
                href={user ? "/premium" : "/inscription?intent=premium"}
                className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium"
                style={{ background: "linear-gradient(135deg, var(--color-accent-gold), #b8863f)" }}
              >
                <span aria-hidden="true">✦</span>
                {fr
                  ? user ? "Débloquer Premium, 9,99 $" : "Créer mon compte Premium, 9,99 $"
                  : user ? "Unlock Premium, $9.99" : "Create my Premium account, $9.99"}
              </a>
            )}
            <a href="/premium" className="inline-flex items-center min-h-11 px-3 text-sm text-[var(--color-text-secondary)] underline underline-offset-4 hover:text-[var(--color-text-primary)]">
              {fr ? "Voir tout le comparatif" : "See the full comparison"}
            </a>
          </div>
        </section>

        {/* ═══ DERNIERS ARTICLES ═══ */}
        <LatestArticles />

        {/* ═══ FAQ GÉNÉRALE ═══ */}
        <section className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
          <div className="text-center mb-8">
            <h2 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-3">
              {fr ? "Les questions qu'on se pose" : "The questions you might have"}
            </h2>
          </div>
          <div className="space-y-3">
            {[
              {
                fr: { q: "Mes données sont-elles en sécurité ?", a: "Sans compte : rien n'est enregistré, ta carte est calculée dans ton navigateur (seul le nom de ville tapé part vers la recherche OpenStreetMap). Avec un compte : on stocke uniquement ce qui est nécessaire (courriel, prénom, cartes sauvegardées), et tu peux tout effacer en un clic. Détails sur la page Confidentialité." },
                en: { q: "Is my data safe?", a: "Without an account: nothing is saved, your chart is calculated in your browser (only the city name you type goes to OpenStreetMap search). With an account: we store only what's needed (email, name, saved charts), and you can erase everything in one click. See the Privacy page for details." },
              },
              {
                fr: { q: "C'est de l'astrologie « sérieuse » ou un horoscope de magazine ?", a: "Astrologie psychologique inspirée de Carl Jung, Liz Greene et Howard Sasportas. Pas de prédictions, pas de fatalité. C'est un outil de réflexion sur soi, basé sur des calculs astronomiques réels." },
                en: { q: "Is this serious astrology or magazine horoscopes?", a: "Psychological astrology inspired by Carl Jung, Liz Greene and Howard Sasportas. No predictions, no fate. It's a tool for self-reflection grounded in real astronomical calculations." },
              },
              {
                fr: { q: "Comment passer à Premium et puis-je annuler ?", a: "9,99 $ CAD une seule fois, paiement sécurisé via Stripe. C'est un achat unique, pas un abonnement — il n'y a donc rien à annuler. Et si tu changes d'avis dans les 14 jours, on te rembourse simplement." },
                en: { q: "How do I go Premium and can I cancel?", a: "$9.99 CAD once, secure payment through Stripe. It's a one-time purchase, not a subscription — so there's nothing to cancel. If you change your mind within 14 days, we'll refund you simply." },
              },
              {
                fr: { q: "Le journal de rêves, c'est gratuit ?", a: "Noter tes rêves l'est, oui — il suffit d'un compte. Tu écris ton récit, tu choisis les émotions qui restent au réveil, et le calendrier du mois se colore nuit après nuit. Le Premium ajoute l'IA par-dessus : elle met ton récit au clair et en donne trois lectures, une factuelle appuyée sur les neurosciences du sommeil, une symbolique inspirée de Jung, et la synthèse des deux. C'est là que ta Lune natale entre en jeu — elle colore la lecture symbolique, ce qu'aucun autre journal de rêves ne peut faire." },
                en: { q: "Is the dream journal free?", a: "Recording your dreams is, yes — you just need an account. You write your account, pick the emotions that linger on waking, and the month calendar colours in night after night. Premium adds the AI on top: it tidies your account and gives three readings of it — a factual one grounded in sleep neuroscience, a symbolic one inspired by Jung, and the synthesis of both. That's where your natal Moon comes in — it colours the symbolic reading, which no other dream journal can do." },
              },
            ].map((item, i) => (
              <details key={i} className="glass p-4 group">
                <summary className="cursor-pointer flex items-center justify-between text-sm font-medium text-[var(--color-text-primary)]">
                  <span>{fr ? item.fr.q : item.en.q}</span>
                  <span className="text-[var(--color-accent-lavender)] text-lg transition-transform group-open:rotate-45 ml-3">+</span>
                </summary>
                <p className="mt-3 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {fr ? item.fr.a : item.en.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ═══ CTA FINAL ═══ */}
        <section className="max-w-2xl mx-auto px-4 pb-20 text-center">
          <p className="text-sm text-[var(--color-text-secondary)] mb-5">
            {fr ? "Prêt·e à voir ce que ton ciel disait le jour de ta naissance ?" : "Ready to see what your sky was saying the day you were born?"}
          </p>
          <a href="#carte" className="btn-primary inline-block px-8 py-4 rounded-full font-medium text-base">
            {fr ? "Lire ma carte natale" : "Read my natal chart"}
          </a>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
