"use client";

import PageShell from "@/components/PageShell";
import { useLocale } from "@/lib/i18n";

export default function APropos() {
  const { locale } = useLocale();
  const fr = locale === "fr";

  return (
    <PageShell title={fr ? "À propos" : "About"}>
      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">Ciel Natal</h2>
        <p>
          {fr
            ? "Ciel Natal est un outil gratuit de calcul et d'interprétation de thèmes astraux. Notre approche s'inspire de l'astrologie psychologique — celle de Carl Jung, Liz Greene et Howard Sasportas — pour proposer des lectures profondes, nuancées et respectueuses de chaque individualité."
            : "Ciel Natal is a free natal chart calculator and interpretation tool. Our approach draws from psychological astrology — the tradition of Carl Jung, Liz Greene and Howard Sasportas — to offer deep, nuanced readings that honour each person's individuality."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "Notre philosophie" : "Our philosophy"}
        </h2>
        <p>
          {fr
            ? "Nous croyons que l'astrologie, lorsqu'elle est pratiquée avec intelligence, est un formidable outil de connaissance de soi. Pas de prédictions sensationnelles, pas de déterminisme. Le ciel propose, l'être humain dispose."
            : "We believe that astrology, when practised thoughtfully, is a powerful tool for self-knowledge. No sensational predictions, no determinism. The sky suggests; the individual decides."}
        </p>
        <p className="mt-3">
          {fr
            ? "Les calculs astronomiques utilisent des algorithmes basés sur les travaux de Jean Meeus (théorie VSOP87 simplifiée). Toutes les positions sont calculées en temps réel dans votre navigateur — aucune donnée n'est envoyée à un serveur."
            : "Astronomical calculations use algorithms based on Jean Meeus's work (simplified VSOP87 theory). All positions are computed in real time in your browser — no data is sent to any server."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "Avertissement" : "Disclaimer"}
        </h2>
        <p>
          {fr
            ? "L'astrologie est un outil de réflexion personnelle inspiré de traditions millénaires. Elle ne remplace en aucun cas un avis médical, psychologique, financier ou juridique. Consultez toujours un professionnel qualifié pour vos décisions importantes."
            : "Astrology is a personal reflection tool rooted in ancient traditions. It is not a substitute for medical, psychological, financial or legal advice. Always consult a qualified professional for important decisions."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "Crédits" : "Credits"}
        </h2>
        <ul className="list-disc list-inside space-y-1 text-[var(--color-text-secondary)]">
          <li>{fr ? "Calculs astronomiques : algorithmes VSOP87 (Jean Meeus)" : "Astronomical calculations: VSOP87 algorithms (Jean Meeus)"}</li>
          <li>{fr ? "Géocodage : OpenStreetMap Nominatim + GeoNames" : "Geocoding: OpenStreetMap Nominatim + GeoNames"}</li>
          <li>{fr ? "Typographie : Cinzel, Inter, JetBrains Mono" : "Typography: Cinzel, Inter, JetBrains Mono"}</li>
        </ul>
      </section>
    </PageShell>
  );
}
