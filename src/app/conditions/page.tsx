"use client";

import PageShell from "@/components/PageShell";
import { useLocale } from "@/lib/i18n";

export default function Conditions() {
  const { locale } = useLocale();
  const fr = locale === "fr";

  return (
    <PageShell title={fr ? "Conditions d'utilisation" : "Terms of Use"}>
      <p className="text-[var(--color-text-secondary)] italic text-xs">
        {fr ? "Dernière mise à jour : 31 mars 2026" : "Last updated: March 31, 2026"}
      </p>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "1. Acceptation" : "1. Acceptance"}
        </h2>
        <p>
          {fr
            ? "En utilisant Ciel Natal, vous acceptez les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser ce site."
            : "By using Ciel Natal, you agree to these terms of use. If you do not accept these terms, please do not use this site."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "2. Description du service" : "2. Service description"}
        </h2>
        <p>
          {fr
            ? "Ciel Natal est un outil gratuit de calcul et d'interprétation de thèmes astraux. Les calculs sont basés sur des algorithmes astronomiques (VSOP87 simplifiée) et les interprétations s'inspirent de l'astrologie psychologique."
            : "Ciel Natal is a free natal chart calculator and interpretation tool. Calculations are based on astronomical algorithms (simplified VSOP87) and interpretations draw from psychological astrology."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "3. Limitation de responsabilité" : "3. Limitation of liability"}
        </h2>
        <p>
          {fr
            ? "Les informations fournies par Ciel Natal sont à titre de réflexion personnelle uniquement. Elles ne constituent en aucun cas :"
            : "The information provided by Ciel Natal is for personal reflection only. It does not constitute:"}
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-[var(--color-text-secondary)]">
          <li>{fr ? "Un avis médical ou psychologique" : "Medical or psychological advice"}</li>
          <li>{fr ? "Un conseil financier ou juridique" : "Financial or legal advice"}</li>
          <li>{fr ? "Une prédiction de l'avenir" : "A prediction of the future"}</li>
          <li>{fr ? "Un diagnostic de quelque nature que ce soit" : "A diagnosis of any kind"}</li>
        </ul>
        <p className="mt-3">
          {fr
            ? "Nous déclinons toute responsabilité quant aux décisions prises sur la base des interprétations fournies."
            : "We disclaim all liability for decisions made on the basis of the interpretations provided."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "4. Précision des calculs" : "4. Calculation accuracy"}
        </h2>
        <p>
          {fr
            ? "Les positions planétaires sont calculées à l'aide d'algorithmes simplifiés. Bien que suffisamment précis pour une lecture générale, ils peuvent présenter de légères variations par rapport aux éphémérides professionnelles (Swiss Ephemeris)."
            : "Planetary positions are calculated using simplified algorithms. While accurate enough for a general reading, they may show slight variations compared to professional ephemerides (Swiss Ephemeris)."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "5. Propriété intellectuelle" : "5. Intellectual property"}
        </h2>
        <p>
          {fr
            ? "Le code source, le design, les textes d'interprétation et le contenu de Ciel Natal sont protégés par le droit d'auteur. Toute reproduction non autorisée est interdite."
            : "The source code, design, interpretation texts and content of Ciel Natal are protected by copyright. Unauthorized reproduction is prohibited."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "6. Modifications" : "6. Changes"}
        </h2>
        <p>
          {fr
            ? "Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prennent effet dès leur publication sur cette page."
            : "We reserve the right to modify these terms at any time. Changes take effect as soon as they are published on this page."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "7. Contact" : "7. Contact"}
        </h2>
        <p>
          {fr
            ? <>Pour toute question relative aux présentes conditions, contactez-nous via la page <a href="/contact" className="text-[var(--color-accent-lavender)] hover:underline">Contact</a>.</>
            : <>For any questions about these terms, please reach out via our <a href="/contact" className="text-[var(--color-accent-lavender)] hover:underline">Contact</a> page.</>}
        </p>
      </section>
    </PageShell>
  );
}
