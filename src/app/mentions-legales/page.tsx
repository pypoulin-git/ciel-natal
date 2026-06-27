'use client'

import Link from 'next/link'
import PageShell from '@/components/PageShell'
import { useLocale } from '@/lib/i18n'

// Éditeur : PY Poulin, travailleur autonome (Québec). Version allégée adaptée au
// Québec — pas d'adresse de rue publique ; le contact passe par le formulaire.
// Si tu vises la France un jour, la LCEN demandera en plus une adresse postale.
const PUBLISHER_NAME = 'PY Poulin'
const PUBLISHER_LOCATION_FR = 'Québec, Canada'
const PUBLISHER_LOCATION_EN = 'Quebec, Canada'

export default function MentionsLegales() {
  const { locale } = useLocale()
  const fr = locale === 'fr'
  const location = fr ? PUBLISHER_LOCATION_FR : PUBLISHER_LOCATION_EN

  return (
    <PageShell title={fr ? 'Mentions légales' : 'Legal notice'}>
      <p className="text-[var(--color-text-secondary)] italic text-xs">
        {fr ? 'Dernière mise à jour : 26 juin 2026' : 'Last updated: June 26, 2026'}
      </p>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? 'Éditeur du site' : 'Site publisher'}
        </h2>
        <p>
          {fr
            ? `Natalune (natalune.com) est un service édité par ${PUBLISHER_NAME}, travailleur autonome basé à ${location}.`
            : `Natalune (natalune.com) is a service published by ${PUBLISHER_NAME}, a self-employed individual based in ${location}.`}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? 'Contact' : 'Contact'}
        </h2>
        <p>
          {fr
            ? 'Pour toute question, écris-nous via le '
            : 'For any question, reach us through the '}
          <Link href="/contact" className="text-[var(--color-accent-lavender)] hover:underline">
            {fr ? 'formulaire de contact' : 'contact form'}
          </Link>
          {fr ? '.' : '.'}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? 'Directeur de la publication' : 'Publication director'}
        </h2>
        <p>{PUBLISHER_NAME}</p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? 'Hébergement' : 'Hosting'}
        </h2>
        <p>
          {fr
            ? 'Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis (vercel.com), avec une région de calcul située à Montréal, Canada.'
            : 'The site is hosted by Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA (vercel.com), with a compute region located in Montreal, Canada.'}
        </p>
        <p className="mt-3">
          {fr
            ? 'Les données de compte sont stockées via Supabase. La liste complète des sous-traitants figure dans la politique de confidentialité.'
            : 'Account data is stored via Supabase. The full list of subprocessors is in the privacy policy.'}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? 'Propriété intellectuelle' : 'Intellectual property'}
        </h2>
        <p>
          {fr
            ? "L'ensemble des contenus présents sur Natalune (textes, interprétations, visuels, code et design) est protégé par le droit d'auteur. Toute reproduction ou réutilisation sans autorisation est interdite."
            : 'All content on Natalune (text, interpretations, visuals, code and design) is protected by copyright. Any reproduction or reuse without authorisation is prohibited.'}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? 'Données personnelles' : 'Personal data'}
        </h2>
        <p>
          {fr
            ? 'Le traitement de tes données personnelles est décrit en détail dans la politique de confidentialité (conforme à la Loi 25, au RGPD et à la PIPEDA), accessible depuis le pied de page.'
            : 'The processing of your personal data is described in detail in the privacy policy (compliant with Law 25, GDPR and PIPEDA), accessible from the footer.'}
        </p>
      </section>
    </PageShell>
  )
}
