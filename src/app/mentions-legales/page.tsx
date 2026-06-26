'use client'

import PageShell from '@/components/PageShell'
import { useLocale } from '@/lib/i18n'

// NOTE pour l'éditeur : remplace les champs marqués [À COMPLÉTER] par les
// informations légales réelles (identité de l'éditeur, adresse, n° d'entreprise).
// Obligatoire pour un site visant la France (LCEN art. 6) ; recommandé au Québec.
const PUBLISHER_NAME = "[À COMPLÉTER — nom de l'éditeur / raison sociale]"
const PUBLISHER_ADDRESS = '[À COMPLÉTER — adresse postale]'
const PUBLISHER_CONTACT = '[À COMPLÉTER — courriel de contact]'

export default function MentionsLegales() {
  const { locale } = useLocale()
  const fr = locale === 'fr'

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
            ? 'Le site Natalune (natalune.com) est édité par :'
            : 'The Natalune website (natalune.com) is published by:'}
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-[var(--color-text-secondary)]">
          <li>{PUBLISHER_NAME}</li>
          <li>{PUBLISHER_ADDRESS}</li>
          <li>
            {fr ? 'Contact : ' : 'Contact: '}
            {PUBLISHER_CONTACT}
          </li>
        </ul>
        <p className="mt-3">
          {fr
            ? 'Vous pouvez également nous joindre via le formulaire de la page contact.'
            : 'You can also reach us through the contact page form.'}
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
