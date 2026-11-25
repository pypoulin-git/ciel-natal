"use client";

import PageShell from "@/components/PageShell";
import { useLocale } from "@/lib/i18n";
import { CARTES_PREMIUM, CHAT_PREMIUM_PAR_MOIS, REMBOURSEMENT_JOURS, prixAffiche } from "@/lib/offre";

export default function Conditions() {
  const { locale } = useLocale();
  const fr = locale === "fr";

  return (
    <PageShell title={fr ? "Conditions d'utilisation" : "Terms of Use"}>
      <p className="text-[var(--color-text-secondary)] italic text-xs">
        {fr
          ? "Dernière mise à jour : 24 novembre 2026. Ajout de la section 3 (paiement unique, remboursement sous 14 jours, plafonds d'usage) et correction : Premium est un achat unique, pas un abonnement."
          : "Last updated: November 24, 2026. Added section 3 (one-time payment, 14-day refund, usage caps) and corrected wording: Premium is a one-time purchase, not a subscription."}
      </p>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "1. Acceptation" : "1. Acceptance"}
        </h2>
        <p>
          {fr
            ? "En utilisant Natalune, vous acceptez les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser ce site."
            : "By using Natalune, you agree to these terms of use. If you do not accept these terms, please do not use this site."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "2. Description du service" : "2. Service description"}
        </h2>
        <p>
          {fr
            ? "Natalune est un outil gratuit de calcul et d'interprétation de thèmes astraux. Les calculs sont basés sur des algorithmes astronomiques (VSOP87 simplifiée) et les interprétations s'inspirent de l'astrologie psychologique."
            : "Natalune is a free natal chart calculator and interpretation tool. Calculations are based on astronomical algorithms (simplified VSOP87) and interpretations draw from psychological astrology."}
        </p>
        <p className="mt-3">
          {fr
            ? "Le journal de rêves est gratuit ; l'accès Premium (achat unique) y ajoute les interprétations par IA : une IA propose une structuration puis trois lectures — une factuelle inspirée des neurosciences du sommeil, une symbolique inspirée de la psychologie analytique, et une synthèse des deux. Ces lectures relèvent de la même logique de réflexion personnelle que le reste du site."
            : "The dream journal is free; Premium (a one-time purchase) adds AI readings: you record your dreams, and an AI proposes a structured version plus three readings — a factual one drawing on sleep neuroscience, a symbolic one drawing on analytical psychology, and a synthesis of the two. These readings fall under the same personal-reflection framing as the rest of the site."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "3. Premium : paiement et remboursement" : "3. Premium: payment and refunds"}
        </h2>
        <p>
          {fr
            ? `Natalune Premium coûte ${prixAffiche("fr")} CAD, payés une seule fois par Stripe. Ce n'est pas un abonnement : rien ne se renouvelle et il n'y a rien à annuler. L'accès est lié à ton compte, sans limite de durée tant que le service existe.`
            : `Natalune Premium costs ${prixAffiche("en")} CAD, paid once through Stripe. It is not a subscription: nothing renews and there is nothing to cancel. Access is tied to your account, with no time limit for as long as the service runs.`}
        </p>
        <p className="mt-3">
          {fr
            ? `Si tu changes d'avis, écris-nous dans les ${REMBOURSEMENT_JOURS} jours suivant l'achat et nous te remboursons en entier, sans justification.`
            : `If you change your mind, write to us within ${REMBOURSEMENT_JOURS} days of purchase and we will refund you in full, no questions asked.`}
        </p>
        <p className="mt-3">
          {fr
            ? `Les fonctions par IA ont des plafonds d'usage raisonnable : ${CHAT_PREMIUM_PAR_MOIS} messages de chat par période de 30 jours et jusqu'à ${CARTES_PREMIUM} cartes sauvegardées. Le journal de rêves a ses propres plafonds mensuels, affichés dans l'application.`
            : `AI features have fair-use caps: ${CHAT_PREMIUM_PAR_MOIS} chat messages per 30-day period and up to ${CARTES_PREMIUM} saved charts. The dream journal has its own monthly caps, shown in the app.`}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "4. Limitation de responsabilité" : "4. Limitation of liability"}
        </h2>
        <p>
          {fr
            ? "Les informations fournies par Natalune sont à titre de réflexion personnelle uniquement. Elles ne constituent en aucun cas :"
            : "The information provided by Natalune is for personal reflection only. It does not constitute:"}
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-[var(--color-text-secondary)]">
          <li>{fr ? "Un avis médical ou psychologique" : "Medical or psychological advice"}</li>
          <li>{fr ? "Un conseil financier ou juridique" : "Financial or legal advice"}</li>
          <li>{fr ? "Une prédiction de l'avenir" : "A prediction of the future"}</li>
          <li>{fr ? "Un diagnostic de quelque nature que ce soit" : "A diagnosis of any kind"}</li>
        </ul>
        <p className="mt-3">
          {fr
            ? "Les interprétations fournies — y compris celles du journal de rêves — ne constituent pas un diagnostic, un traitement ni un conseil psychologique, et ne remplacent pas l'accompagnement d'un professionnel de santé. Un rêve difficile ou récurrent n'est pas un symptôme à interpréter seul : si vous traversez une période de détresse, consultez un professionnel qualifié ou une ligne d'écoute."
            : "The interpretations provided — including those in the dream journal — are not a diagnosis, treatment or psychological advice, and are no substitute for the support of a health professional. A difficult or recurring dream is not a symptom to interpret alone: if you are going through a period of distress, please consult a qualified professional or a helpline."}
        </p>
        <p className="mt-3">
          {fr
            ? "Nous déclinons toute responsabilité quant aux décisions prises sur la base des interprétations fournies."
            : "We disclaim all liability for decisions made on the basis of the interpretations provided."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "5. Précision des calculs" : "5. Calculation accuracy"}
        </h2>
        <p>
          {fr
            ? "Les positions planétaires sont calculées à l'aide d'algorithmes simplifiés. Bien que suffisamment précis pour une lecture générale, ils peuvent présenter de légères variations par rapport aux éphémérides professionnelles (Swiss Ephemeris)."
            : "Planetary positions are calculated using simplified algorithms. While accurate enough for a general reading, they may show slight variations compared to professional ephemerides (Swiss Ephemeris)."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "6. Propriété intellectuelle" : "6. Intellectual property"}
        </h2>
        <p>
          {fr
            ? "Le code source, le design, les textes d'interprétation et le contenu de Natalune sont protégés par le droit d'auteur. Toute reproduction non autorisée est interdite."
            : "The source code, design, interpretation texts and content of Natalune are protected by copyright. Unauthorized reproduction is prohibited."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "7. Modifications" : "7. Changes"}
        </h2>
        <p>
          {fr
            ? "Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prennent effet dès leur publication sur cette page."
            : "We reserve the right to modify these terms at any time. Changes take effect as soon as they are published on this page."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "8. Contact" : "8. Contact"}
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
