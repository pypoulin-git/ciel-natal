"use client";

import PageShell from "@/components/PageShell";

export default function Conditions() {
  return (
    <PageShell title="Conditions d'utilisation">
      <p className="text-[var(--color-text-secondary)] italic text-xs">Dernière mise à jour : 31 mars 2026</p>

      <section>
        <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-3">1. Acceptation</h2>
        <p>
          En utilisant Ciel Natal, vous acceptez les présentes conditions d&apos;utilisation.
          Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser ce site.
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-3">2. Description du service</h2>
        <p>
          Ciel Natal est un outil gratuit de calcul et d&apos;interprétation de thèmes astraux.
          Les calculs sont basés sur des algorithmes astronomiques (VSOP87 simplifiée) et les
          interprétations s&apos;inspirent de l&apos;astrologie psychologique.
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-3">3. Limitation de responsabilité</h2>
        <p>
          Les informations fournies par Ciel Natal sont à titre de réflexion personnelle uniquement.
          Elles ne constituent en aucun cas :
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-[var(--color-text-secondary)]">
          <li>Un avis médical ou psychologique</li>
          <li>Un conseil financier ou juridique</li>
          <li>Une prédiction de l&apos;avenir</li>
          <li>Un diagnostic de quelque nature que ce soit</li>
        </ul>
        <p className="mt-3">
          Nous déclinons toute responsabilité quant aux décisions prises sur la base des
          interprétations fournies.
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-3">4. Précision des calculs</h2>
        <p>
          Les positions planétaires sont calculées à l&apos;aide d&apos;algorithmes simplifiés. Bien que
          suffisamment précis pour une lecture générale, ils peuvent présenter de légères variations
          par rapport aux éphémérides professionnelles (Swiss Ephemeris).
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-3">5. Propriété intellectuelle</h2>
        <p>
          Le code source, le design, les textes d&apos;interprétation et le contenu de Ciel Natal
          sont protégés par le droit d&apos;auteur. Toute reproduction non autorisée est interdite.
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-3">6. Modifications</h2>
        <p>
          Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications
          prennent effet dès leur publication sur cette page.
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-3">7. Contact</h2>
        <p>
          Pour toute question relative aux présentes conditions, contactez-nous via la
          page <a href="/contact" className="text-[var(--color-accent-lavender)] hover:underline">Contact</a>.
        </p>
      </section>
    </PageShell>
  );
}
