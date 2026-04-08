"use client";

import PageShell from "@/components/PageShell";
import { useLocale } from "@/lib/i18n";

export default function Confidentialite() {
  const { locale } = useLocale();
  const fr = locale === "fr";

  return (
    <PageShell title={fr ? "Politique de confidentialité" : "Privacy Policy"}>
      <p className="text-[var(--color-text-secondary)] italic text-xs">
        {fr ? "Dernière mise à jour : 31 mars 2026" : "Last updated: March 31, 2026"}
      </p>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "1. Données collectées" : "1. Data collected"}
        </h2>
        <p>
          {fr
            ? <>Ciel Natal est conçu dans le respect de votre vie privée. <strong className="text-[var(--color-text-primary)]">Aucune donnée personnelle n&apos;est envoyée à nos serveurs.</strong> Tous les calculs sont effectués localement dans votre navigateur.</>
            : <>Ciel Natal is designed with your privacy in mind. <strong className="text-[var(--color-text-primary)]">No personal data is sent to our servers.</strong> All calculations are performed locally in your browser.</>}
        </p>
        <p className="mt-3">
          {fr ? "Les données saisies (prénom, date, heure et lieu de naissance) :" : "The data you enter (first name, date, time and place of birth):"}
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-[var(--color-text-secondary)]">
          <li>{fr ? "Restent exclusivement dans votre navigateur" : "Stay exclusively in your browser"}</li>
          <li>{fr ? "Ne sont jamais transmises à un serveur tiers" : "Are never sent to any third-party server"}</li>
          <li>{fr ? "Ne sont pas stockées après fermeture de la page" : "Are not stored after you close the page"}</li>
          <li>{fr ? "Peuvent apparaître dans l'URL si vous utilisez la fonction de partage" : "May appear in the URL if you use the share feature"}</li>
        </ul>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "2. Services tiers" : "2. Third-party services"}
        </h2>
        <p>{fr ? "Ciel Natal utilise les services externes suivants :" : "Ciel Natal uses the following external services:"}</p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-[var(--color-text-secondary)]">
          <li>
            <strong className="text-[var(--color-text-primary)]">Nominatim (OpenStreetMap)</strong> —{" "}
            {fr ? "pour la recherche de ville. Seul le nom de la ville saisi est transmis." : "for city lookup. Only the city name you type is transmitted."}
          </li>
          <li>
            <strong className="text-[var(--color-text-primary)]">GeoNames</strong> —{" "}
            {fr ? "service de secours pour la géolocalisation des villes." : "fallback service for city geolocation."}
          </li>
          <li>
            <strong className="text-[var(--color-text-primary)]">Vercel Analytics</strong> —{" "}
            {fr ? "statistiques anonymes de fréquentation (aucune donnée personnelle)." : "anonymous traffic statistics (no personal data)."}
          </li>
          <li>
            <strong className="text-[var(--color-text-primary)]">Google Fonts</strong> —{" "}
            {fr ? "chargement des polices d'écriture." : "font loading."}
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "3. Cookies" : "3. Cookies"}
        </h2>
        <p>
          {fr
            ? "Ciel Natal n'utilise aucun cookie de suivi ou publicitaire. Seuls des cookies techniques essentiels au fonctionnement de l'hébergement (Vercel) peuvent être déposés."
            : "Ciel Natal does not use any tracking or advertising cookies. Only essential technical cookies required by the hosting platform (Vercel) may be set."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "4. Liens de partage" : "4. Share links"}
        </h2>
        <p>
          {fr
            ? "Lorsque vous utilisez la fonction de partage, vos données de naissance sont encodées dans l'URL. Toute personne possédant ce lien pourra voir votre carte du ciel. Partagez-le uniquement avec des personnes de confiance."
            : "When you use the share feature, your birth data is encoded in the URL. Anyone with this link can view your natal chart. Only share it with people you trust."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "5. Vos droits" : "5. Your rights"}
        </h2>
        <p>
          {fr
            ? <>Puisqu&apos;aucune donnée personnelle n&apos;est stockée sur nos serveurs, les droits d&apos;accès, de rectification et de suppression s&apos;exercent naturellement : il suffit de fermer votre navigateur. Pour toute question, contactez-nous via la page <a href="/contact" className="text-[var(--color-accent-lavender)] hover:underline">Contact</a>.</>
            : <>Since no personal data is stored on our servers, your rights of access, rectification and deletion are naturally exercised: simply close your browser. For any questions, reach out via our <a href="/contact" className="text-[var(--color-accent-lavender)] hover:underline">Contact</a> page.</>}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "6. Conformité" : "6. Compliance"}
        </h2>
        <p>
          {fr
            ? "Ce site respecte les principes de la Loi 25 (Québec), du RGPD (Europe) et de la LPRPDE/PIPEDA (Canada). Le responsable du traitement est joignable via la page Contact."
            : "This site complies with Quebec's Law 25, the GDPR (Europe) and PIPEDA (Canada). The data controller can be reached via the Contact page."}
        </p>
      </section>
    </PageShell>
  );
}
