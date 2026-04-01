"use client";

import PageShell from "@/components/PageShell";

export default function Confidentialite() {
  return (
    <PageShell title="Politique de confidentialité">
      <p className="text-[var(--color-text-secondary)] italic text-xs">Dernière mise à jour : 31 mars 2026</p>

      <section>
        <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-3">1. Données collectées</h2>
        <p>
          Ciel Natal est conçu dans le respect de votre vie privée. <strong className="text-[var(--color-text-primary)]">Aucune donnée personnelle
          n&apos;est envoyée à nos serveurs.</strong> Tous les calculs sont effectués localement dans votre navigateur.
        </p>
        <p className="mt-3">Les données saisies (prénom, date, heure et lieu de naissance) :</p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-[var(--color-text-secondary)]">
          <li>Restent exclusivement dans votre navigateur</li>
          <li>Ne sont jamais transmises à un serveur tiers</li>
          <li>Ne sont pas stockées après fermeture de la page</li>
          <li>Peuvent apparaître dans l&apos;URL si vous utilisez la fonction de partage</li>
        </ul>
      </section>

      <section>
        <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-3">2. Services tiers</h2>
        <p>Ciel Natal utilise les services externes suivants :</p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-[var(--color-text-secondary)]">
          <li><strong className="text-[var(--color-text-primary)]">Nominatim (OpenStreetMap)</strong> — pour la recherche de ville. Seul le nom de la ville saisi est transmis.</li>
          <li><strong className="text-[var(--color-text-primary)]">GeoNames</strong> — service de secours pour la géolocalisation des villes.</li>
          <li><strong className="text-[var(--color-text-primary)]">Vercel Analytics</strong> — statistiques anonymes de fréquentation (aucune donnée personnelle).</li>
          <li><strong className="text-[var(--color-text-primary)]">Google Fonts</strong> — chargement des polices d&apos;écriture.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-3">3. Cookies</h2>
        <p>
          Ciel Natal n&apos;utilise aucun cookie de suivi ou publicitaire. Seuls des cookies techniques
          essentiels au fonctionnement de l&apos;hébergement (Vercel) peuvent être déposés.
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-3">4. Liens de partage</h2>
        <p>
          Lorsque vous utilisez la fonction de partage, vos données de naissance sont encodées dans
          l&apos;URL. Toute personne possédant ce lien pourra voir votre carte du ciel. Partagez-le
          uniquement avec des personnes de confiance.
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-3">5. Vos droits</h2>
        <p>
          Puisqu&apos;aucune donnée personnelle n&apos;est stockée sur nos serveurs, les droits d&apos;accès,
          de rectification et de suppression s&apos;exercent naturellement : il suffit de fermer votre
          navigateur. Pour toute question, contactez-nous via la page <a href="/contact" className="text-[var(--color-accent-lavender)] hover:underline">Contact</a>.
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-3">6. Conformité</h2>
        <p>
          Ce site respecte les principes de la Loi 25 (Québec), du RGPD (Europe) et de la LPRPDE/PIPEDA (Canada).
          Le responsable du traitement est joignable via la page Contact.
        </p>
      </section>
    </PageShell>
  );
}
