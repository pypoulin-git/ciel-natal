"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";
import Starfield from "@/components/Starfield";
import SiteFooter from "@/components/SiteFooter";
import OffreComparatif from "@/components/OffreComparatif";
import { planetInHouse as pihFr } from "@/data/interpretations";
import { planetInHouse as pihEn } from "@/data/interpretations-en";
import { CHAT_PREMIUM_PAR_MOIS, REMBOURSEMENT_JOURS } from "@/lib/offre";

const PRODUCT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Natalune Premium",
  description: `One-time purchase: houses read in full, daily transits, audio narration, AI chat (${CHAT_PREMIUM_PAR_MOIS} messages a month), full solar return, synastry reading, dream dictation and AI dream readings.`,
  brand: { "@type": "Brand", name: "Natalune" },
  offers: {
    "@type": "Offer",
    price: "9.99",
    priceCurrency: "CAD",
    availability: "https://schema.org/InStock",
    url: "https://natalune.com/premium",
  },
};

export default function PremiumPage() {
  const { user, isPremium, loading, getAccessToken } = useAuth();
  const { locale } = useLocale();
  const fr = locale !== "en";
  // Real sample, cut exactly like HousesMap cuts it for free accounts.
  const sampleFull = (fr ? pihFr : pihEn).Venus?.[7] ?? "";
  const sampleFree = sampleFull.match(/^[^.]+\./)?.[0] ?? sampleFull;
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);

  // Surfaces every failure mode to the user. Previously a silent
  // `if (data.url) window.location.href = data.url;` left the page frozen
  // when the API returned 401/500 or when Stripe live mode rejected the
  // request — the user clicked the button and nothing happened.
  const handleCheckout = async () => {
    setCheckoutError(null);
    if (!user) {
      window.location.href = "/connexion";
      return;
    }
    setCheckoutBusy(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        window.location.href = "/connexion";
        return;
      }
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      let data: { url?: string; error?: string; detail?: string; code?: string } = {};
      try {
        data = await res.json();
      } catch {
        /* non-JSON body — fall through to the !res.ok branch */
      }
      if (!res.ok || !data.url) {
        // Build the most informative message we can — include Stripe code+detail
        // so the user (or PY during the bring-up) can act without server logs.
        const parts: string[] = [];
        if (data.error) parts.push(data.error);
        if (data.code) parts.push(`code: ${data.code}`);
        if (data.detail) parts.push(data.detail);
        if (parts.length === 0) parts.push(`HTTP ${res.status}`);
        const msg = parts.join(" — ");
        console.error("[checkout] failed:", data);
        setCheckoutError(
          locale === "fr"
            ? `Le paiement n'a pas pu démarrer : ${msg}`
            : `Could not start payment: ${msg}`
        );
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error("[checkout] threw:", err);
      setCheckoutError(
        locale === "fr"
          ? "Erreur réseau. Vérifie ta connexion et réessaie."
          : "Network error. Check your connection and try again."
      );
    } finally {
      setCheckoutBusy(false);
    }
  };

  const CheckoutButton = () => (
    <button
      onClick={handleCheckout}
      disabled={loading || checkoutBusy}
      className="btn-primary w-full sm:w-auto px-10 py-4 min-h-12 rounded-full text-base font-semibold shadow-lg shadow-[var(--color-accent-rose)]/30 hover:shadow-xl hover:shadow-[var(--color-accent-rose)]/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: "linear-gradient(135deg, var(--color-accent-rose), #c87aa0)" }}
    >
      {loading || checkoutBusy
        ? fr ? "Préparation…" : "Preparing…"
        : user
          ? fr ? "Passer Premium ✦" : "Go Premium ✦"
          : fr ? "Se connecter et acheter ✦" : "Sign in and purchase ✦"}
    </button>
  );

  return (
    <main className="relative min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PRODUCT_JSON_LD) }} />
      <Starfield />
      <div className="relative z-10">
        <section className="max-w-3xl mx-auto px-4 pt-16 pb-20">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent-rose)] mb-3">Natalune Premium</p>
            <h1 className="font-cinzel text-3xl sm:text-5xl leading-tight text-[var(--color-text-primary)] mb-4">
              {fr ? "Va au bout de ta carte du ciel" : "Go all the way into your chart"}
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed">
              {fr
                ? "Le cœur du site reste gratuit. Premium ajoute la voix, l'IA et tout ce qui va en profondeur : tes maisons en entier, tes transits, ton année, tes rêves."
                : "The heart of the site stays free. Premium adds voice, AI and everything that goes deeper: your houses in full, your transits, your year, your dreams."}
            </p>
          </div>

          {/* Price card */}
          <div className="glass p-8 sm:p-10 text-center mb-4 glow-rose max-w-xl mx-auto">
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="font-cinzel text-5xl text-[var(--color-text-primary)]">9,99</span>
              <span className="text-lg text-[var(--color-text-secondary)]">$ CAD</span>
            </div>
            <p className="text-sm text-[var(--color-accent-rose)] mb-6">
              {fr ? "Une seule fois, accès à vie" : "Once, lifetime access"}
            </p>

            {isPremium ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/30 text-[var(--color-accent-rose)] text-sm">
                <span aria-hidden="true">✦</span>
                {fr ? "Tu es déjà Premium !" : "You're already Premium!"}
              </div>
            ) : (
              <>
                <CheckoutButton />
                {checkoutError && (
                  <div role="alert" className="mt-4 mx-auto max-w-md rounded-lg border border-[var(--color-accent-rose)]/40 bg-[var(--color-accent-rose)]/10 p-3 text-sm text-[var(--color-accent-rose)]">
                    {checkoutError}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Reassurance: the three questions people ask before paying */}
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[var(--color-text-secondary)] mb-14">
            <li>{fr ? "Pas d'abonnement, rien à annuler" : "No subscription, nothing to cancel"}</li>
            <li aria-hidden="true" className="text-[var(--color-text-muted)]">·</li>
            <li>{fr ? `Remboursé sur demande sous ${REMBOURSEMENT_JOURS} jours` : `Refunded on request within ${REMBOURSEMENT_JOURS} days`}</li>
            <li aria-hidden="true" className="text-[var(--color-text-muted)]">·</li>
            <li>{fr ? "Paiement sécurisé par Stripe" : "Secure payment by Stripe"}</li>
          </ul>

          {/* Comparison */}
          <h2 className="font-cinzel text-2xl text-[var(--color-text-primary)] text-center mb-2">
            {fr ? "Ce qui est gratuit, ce qu'ajoute Premium" : "What's free, what Premium adds"}
          </h2>
          <p className="text-sm text-center text-[var(--color-text-secondary)] mb-6">
            {fr ? "Exactement ce que le site fait, quotas compris." : "Exactly what the site does, limits included."}
          </p>
          <OffreComparatif locale={fr ? "fr" : "en"} />

          {/* Real preview */}
          {!isPremium && sampleFull && (
            <div className="mt-14">
              <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] text-center mb-2">
                {fr ? "Exemple réel : Vénus en maison 7" : "Real example: Venus in the 7th house"}
              </h2>
              <p className="text-xs text-center text-[var(--color-text-muted)] mb-6">
                {fr ? "Le même texte, tel qu'il s'affiche dans ta carte." : "The same text, as it shows in your chart."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass p-5">
                  <div className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)] mb-3">{fr ? "Gratuit" : "Free"}</div>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{sampleFree}</p>
                </div>
                <div className="glass p-5 border-[var(--color-accent-rose)]/25">
                  <div className="text-xs uppercase tracking-widest text-[var(--color-accent-rose)] mb-3">Premium</div>
                  <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{sampleFull}</p>
                  <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                    {fr
                      ? `Tu peux aussi l'écouter, et en parler avec ton astrologue IA (${CHAT_PREMIUM_PAR_MOIS} messages par mois).`
                      : `You can also listen to it, and discuss it with your AI astrologer (${CHAT_PREMIUM_PAR_MOIS} messages a month).`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isPremium && (
            <div className="text-center mt-12">
              <CheckoutButton />
            </div>
          )}

          {/* Back link */}
          <div className="text-center mt-10">
            <a href="/" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-lavender)] transition">
              {locale === "fr" ? "← Retour à l'accueil" : "← Back to home"}
            </a>
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
