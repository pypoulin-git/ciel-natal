"use client";

import Link from "next/link";
import Starfield from "@/components/Starfield";
import SiteFooter from "@/components/SiteFooter";
import { useLocale } from "@/lib/i18n";

/**
 * Page Révolution Solaire temporairement désactivée.
 *
 * Le retour utilisateur (PY, 2026-06-01) : « très pauvre comme page, trop
 * semblable à la carte du ciel, désactive complètement la page de
 * révolution solaire et garde dans notre backlog un todo de s'y repencher
 * un jour ». Suite à ça :
 *
 *   - les liens depuis SiteFooter, /premium et la FAQ home ont été retirés
 *   - l'URL est sortie du sitemap
 *   - le code original de calcul SR a été supprimé (voir l'historique git
 *     pour le récupérer le jour de la refonte)
 *   - la route reste en place pour servir un placeholder propre aux gens
 *     qui auraient la page en favori, plutôt qu'un 404 brutal
 *
 * Pistes de refonte : voir BACKLOG.md à la racine du projet.
 */
export default function RevolutionSolairePlaceholder() {
  const { locale } = useLocale();

  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10">
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="text-5xl mb-4 text-[var(--color-accent-rose)] opacity-30">
            ✦
          </div>
          <h1 className="font-cinzel text-3xl sm:text-4xl text-[var(--color-text-primary)] mb-4">
            {locale === "fr" ? "Révolution Solaire" : "Solar Return"}
          </h1>
          <p className="text-base text-[var(--color-text-secondary)] mb-8 leading-relaxed">
            {locale === "fr"
              ? "Cette section est en refonte. Elle reviendra bientôt, plus riche et plus distincte de ta carte natale."
              : "This section is being redesigned. It will return soon — richer and more distinct from your natal chart."}
          </p>
          <Link
            href="/"
            className="inline-block btn-primary px-8 py-3 rounded-xl text-sm font-medium"
          >
            {locale === "fr" ? "← Retour à l'accueil" : "← Back to home"}
          </Link>
        </div>
        <SiteFooter />
      </div>
    </main>
  );
}
