"use client";

import PageShell from "@/components/PageShell";

export default function APropos() {
  return (
    <PageShell title="À propos">
      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">Ciel Natal</h2>
        <p>
          Ciel Natal est un outil gratuit de calcul et d&apos;interprétation de thèmes astraux.
          Notre approche s&apos;inspire de l&apos;astrologie psychologique — celle de Carl Jung,
          Liz Greene et Howard Sasportas — pour proposer des lectures profondes, nuancées et
          respectueuses de chaque individualité.
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">Notre philosophie</h2>
        <p>
          Nous croyons que l&apos;astrologie, lorsqu&apos;elle est pratiquée avec intelligence, est un
          formidable outil de connaissance de soi. Pas de prédictions sensationnelles, pas de
          déterminisme. Le ciel propose, l&apos;être humain dispose.
        </p>
        <p className="mt-3">
          Les calculs astronomiques utilisent des algorithmes basés sur les travaux de Jean Meeus
          (théorie VSOP87 simplifiée). Toutes les positions sont calculées en temps réel dans
          votre navigateur — aucune donnée n&apos;est envoyée à un serveur.
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">Avertissement</h2>
        <p>
          L&apos;astrologie est un outil de réflexion personnelle inspiré de traditions millénaires.
          Elle ne remplace en aucun cas un avis médical, psychologique, financier ou juridique.
          Consultez toujours un professionnel qualifié pour vos décisions importantes.
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">Crédits</h2>
        <ul className="list-disc list-inside space-y-1 text-[var(--color-text-secondary)]">
          <li>Calculs astronomiques : algorithmes VSOP87 (Jean Meeus)</li>
          <li>Géocodage : OpenStreetMap Nominatim + GeoNames</li>
          <li>Typographie : Cinzel, Inter, JetBrains Mono</li>
        </ul>
      </section>
    </PageShell>
  );
}
