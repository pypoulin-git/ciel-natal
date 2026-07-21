"use client";

import Link from "next/link";
import Starfield from "@/components/Starfield";
import SiteFooter from "@/components/SiteFooter";
import TitleSparkles from "@/components/TitleSparkles";
import SkyToday from "@/components/SkyToday";
import ExploreSections from "@/components/ExploreSections";
import LatestArticles from "@/components/LatestArticles";
import { useLocale } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";

// ─── Home = global portal ───
// Distinct from the natal-chart experience (which lives at /carte-natale).
// This page presents the brand, today's sky, all products, the free/premium
// model and the latest journal — a doorway, not the calculator.
export default function HomePortal() {
  const { locale } = useLocale();
  const { user, isPremium } = useAuth();
  const fr = locale === "fr";

  return (
    <main className="relative">
      <Starfield />
      <div className="relative z-10">
        {/* ═══ HERO ═══ */}
        <section className="relative overflow-hidden min-h-[58vh] flex flex-col items-center justify-center px-4 text-center pt-10 pb-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] max-w-[90vw] rounded-full blur-3xl opacity-50"
            style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--color-accent-lavender) 55%, transparent), transparent 70%)" }}
          />
          <div className="relative animate-fade-in-up">
            <div
              className="text-5xl md:text-6xl mb-6 text-[var(--color-accent-gold)] animate-pulse-glow"
              style={{ filter: "drop-shadow(0 0 18px color-mix(in srgb, var(--color-accent-gold) 55%, transparent))" }}
            >
              &#10022;
            </div>
            <h1 className="font-cinzel text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-accent-lavender)] bg-clip-text text-transparent leading-tight">
              Natalune
            </h1>
            <TitleSparkles id="portal-sparkles" className="h-20 max-w-xl mx-auto mt-1 mb-2 -z-0" />
            <p className="text-lg sm:text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-lg mx-auto mb-8 font-light -mt-12 relative z-10">
              {fr
                ? "Ta carte du ciel, le ciel du jour, et l'astrologie qui a du sens."
                : "Your birth chart, today's sky, and astrology that means something."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/carte-natale"
                className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-medium text-lg glow-lavender"
              >
                <span aria-hidden="true">&#10022;</span>
                {fr ? "Lire ma carte natale" : "Read my natal chart"}
              </Link>
              <Link
                href="/calendrier"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-full text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-glass-border)] hover:border-[var(--color-accent-lavender)]/40 transition"
              >
                {fr ? "Le ciel de la semaine" : "This week's sky"}
              </Link>
            </div>
            <p className="mt-4 text-xs sm:text-sm text-[var(--color-text-secondary)] opacity-70 tracking-wide">
              {fr ? "Gratuit · Aucun compte requis · 3 minutes" : "Free · No account needed · 3 minutes"}
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
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="glass p-5">
              <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)]/70 mb-3">
                {fr ? "Gratuit · sans compte" : "Free · no account"}
              </p>
              <ul className="text-sm text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                <li>✦ {fr ? "Ta carte natale complète : roue, planètes, ascendant" : "Your full birth chart: wheel, planets, ascendant"}</li>
                <li>✦ {fr ? "Portrait Soleil · Lune · Ascendant" : "Sun · Moon · Ascendant portrait"}</li>
                <li>✦ {fr ? "Maisons, aspects et éléments" : "Houses, aspects and elements"}</li>
                <li>✦ {fr ? "Le ciel du jour, le calendrier et les signes" : "The daily sky, the calendar and the signs"}</li>
              </ul>
            </div>
            <div
              className="glass p-5"
              style={{ borderColor: "rgba(224,169,78,0.32)", background: "linear-gradient(135deg, color-mix(in srgb, var(--color-accent-gold) 8%, transparent), transparent)" }}
            >
              <p className="text-xs uppercase tracking-widest text-[var(--color-accent-gold)]/85 mb-3">
                {fr ? "✦ Passe Premium · 9,99 $ une fois" : "✦ Premium pass · $9.99 one-time"}
              </p>
              <ul className="text-sm text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                <li>✦ {fr ? "Interprétations complètes et détaillées" : "Full, detailed interpretations"}</li>
                <li>✦ {fr ? "Chat avec un astrologue IA bienveillant" : "Chat with a caring AI astrologer"}</li>
                <li>✦ {fr ? "Synastrie — l'alchimie de deux âmes" : "Synastry — the alchemy of two souls"}</li>
                <li>✦ {fr ? "Tes anniversaires et dates perso dans le calendrier céleste" : "Your birthdays and personal dates in the celestial calendar"}</li>
                <li>✦ {fr ? "Narration audio de ta lecture" : "Audio narration of your reading"}</li>
                <li>✦ {fr ? "Sauvegarde de tes cartes + PDF par courriel" : "Save your charts + PDF by email"}</li>
              </ul>
              <p className="mt-3 text-xs text-[var(--color-text-secondary)]/70 italic">
                {fr ? "Paiement unique, à vie — et tu soutiens un projet indépendant. 💛" : "One-time, forever — and you support an independent project. 💛"}
              </p>
              {!isPremium && (
                <a
                  href={user ? "/premium" : "/inscription?intent=premium"}
                  className="btn-primary mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-white text-sm font-medium glow-lavender"
                  style={{ background: "linear-gradient(135deg, var(--color-accent-gold), #b8863f)" }}
                >
                  <span aria-hidden="true">✦</span>
                  {fr
                    ? user ? "Débloquer Premium — 9,99 $" : "Créer mon compte Premium — 9,99 $"
                    : user ? "Unlock Premium — $9.99" : "Create my Premium account — $9.99"}
                </a>
              )}
            </div>
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
                fr: { q: "Mes données sont-elles en sécurité ?", a: "Sans compte : tout reste dans ton navigateur, rien n'est envoyé ailleurs. Avec un compte : on stocke uniquement ce qui est nécessaire (email, prénom, cartes sauvegardées), et tu peux tout effacer en un clic. Détails sur la page Confidentialité." },
                en: { q: "Is my data safe?", a: "Without an account: everything stays in your browser, nothing is sent elsewhere. With an account: we store only what's needed (email, name, saved charts), and you can erase everything in one click. See the Privacy page for details." },
              },
              {
                fr: { q: "C'est de l'astrologie « sérieuse » ou un horoscope de magazine ?", a: "Astrologie psychologique inspirée de Carl Jung, Liz Greene et Howard Sasportas. Pas de prédictions, pas de fatalité. C'est un outil de réflexion sur soi, basé sur des calculs astronomiques réels." },
                en: { q: "Is this serious astrology or magazine horoscopes?", a: "Psychological astrology inspired by Carl Jung, Liz Greene and Howard Sasportas. No predictions, no fate. It's a tool for self-reflection grounded in real astronomical calculations." },
              },
              {
                fr: { q: "Comment passer à Premium et puis-je annuler ?", a: "9,99 $ CAD une seule fois, paiement sécurisé via Stripe. C'est un achat unique, pas un abonnement — il n'y a donc rien à annuler. Et si tu changes d'avis dans les 14 jours, on te rembourse simplement." },
                en: { q: "How do I go Premium and can I cancel?", a: "$9.99 CAD once, secure payment through Stripe. It's a one-time purchase, not a subscription — so there's nothing to cancel. If you change your mind within 14 days, we'll refund you simply." },
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
          <Link href="/carte-natale" className="btn-primary inline-block px-8 py-4 rounded-full text-white font-medium text-base">
            {fr ? "Lire ma carte natale" : "Read my natal chart"}
          </Link>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
