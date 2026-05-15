"use client";

import PageShell from "@/components/PageShell";
import { useLocale } from "@/lib/i18n";

export default function Confidentialite() {
  const { locale } = useLocale();
  const fr = locale === "fr";

  return (
    <PageShell title={fr ? "Politique de confidentialité" : "Privacy Policy"}>
      <p className="text-[var(--color-text-secondary)] italic text-xs">
        {fr ? "Dernière mise à jour : 14 mai 2026" : "Last updated: May 14, 2026"}
      </p>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "1. Qui sommes-nous" : "1. Who we are"}
        </h2>
        <p>
          {fr
            ? <>Ciel Natal est un outil d&apos;astrologie psychologique opéré par <strong className="text-[var(--color-text-primary)]">Pier-Yves Poulin</strong>, basé au Québec (Canada). Pour toute question relative à tes données ou pour exercer tes droits (accès, suppression, portabilité), écris-nous via la <a href="/contact" className="text-[var(--color-accent-lavender)] hover:underline">page Contact</a>. Le responsable de la protection des renseignements personnels (équivalent du « DPO » au Québec) est PY Poulin lui-même, joignable à la même adresse.</>
            : <>Ciel Natal is a psychological astrology tool operated by <strong className="text-[var(--color-text-primary)]">Pier-Yves Poulin</strong>, based in Quebec, Canada. For any question regarding your data or to exercise your rights (access, deletion, portability), reach us via the <a href="/contact" className="text-[var(--color-accent-lavender)] hover:underline">Contact page</a>. The privacy officer (Quebec equivalent of a DPO) is PY Poulin himself, reachable at the same address.</>}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "2. Ce qu'on collecte et pourquoi" : "2. What we collect and why"}
        </h2>
        <p>
          {fr
            ? "On distingue deux modes d'utilisation :"
            : "There are two ways to use the site:"}
        </p>
        <h3 className="font-cinzel text-base text-[var(--color-text-primary)] mt-4 mb-2">
          {fr ? "A. Sans compte (anonyme)" : "A. Without an account (anonymous)"}
        </h3>
        <p>
          {fr
            ? "Tu peux calculer ta carte du ciel sans créer de compte. Dans ce cas, les données saisies (prénom, date, heure et lieu de naissance) restent dans la mémoire de ton navigateur. Aucune donnée n'est enregistrée sur nos serveurs. La carte disparaît dès que tu fermes l'onglet."
            : "You can calculate your chart without creating an account. In that case the data you enter (first name, date, time, place of birth) stays in your browser. Nothing is saved on our servers. The chart disappears the moment you close the tab."}
        </p>
        <h3 className="font-cinzel text-base text-[var(--color-text-primary)] mt-4 mb-2">
          {fr ? "B. Avec un compte" : "B. With an account"}
        </h3>
        <p>
          {fr
            ? "Si tu crées un compte (par email ou via Google), nous stockons :"
            : "If you create an account (by email or via Google), we store:"}
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-[var(--color-text-secondary)]">
          <li>{fr ? "Ton adresse courriel et ton prénom d'affichage (pour la connexion)." : "Your email address and display name (for sign-in)."}</li>
          <li>{fr ? "Les cartes que tu choisis de sauvegarder : prénom, genre, date, heure, lieu, coordonnées GPS de naissance, et le PDF généré." : "The charts you choose to save: name, gender, date, time, place, GPS coordinates of birth, and the generated PDF."}</li>
          <li>{fr ? "Tes préférences de lecture (ton, profondeur, voix narrative)." : "Your reading preferences (tone, depth, narrator voice)."}</li>
          <li>{fr ? "Si tu passes Premium : la confirmation de paiement Stripe (pas le numéro de carte — voir section 3)." : "If you go Premium: the Stripe payment confirmation (no card number — see section 3)."}</li>
          <li>{fr ? "Des compteurs anonymisés : nombre de messages utilisés avec l'IA, date du dernier accès." : "Anonymized counters: number of AI messages used, last login date."}</li>
        </ul>
        <p className="mt-3">
          {fr
            ? <><strong className="text-[var(--color-text-primary)]">Base légale :</strong> exécution du contrat (Loi 25 art. 12, RGPD art. 6.1.b). Tu peux supprimer ton compte à tout moment dans <a href="/mon-compte/settings" className="text-[var(--color-accent-lavender)] hover:underline">Paramètres</a> — toutes tes données sont alors effacées sous 30 jours (sauf obligation comptable Stripe : 7 ans).</>
            : <><strong className="text-[var(--color-text-primary)]">Legal basis:</strong> contract performance (Quebec Law 25 art. 12, GDPR art. 6.1.b). You can delete your account at any time in <a href="/mon-compte/settings" className="text-[var(--color-accent-lavender)] hover:underline">Settings</a> — all your data is then erased within 30 days (except Stripe accounting records: 7 years).</>}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "3. Sous-traitants et où sont tes données" : "3. Subprocessors and where your data lives"}
        </h2>
        <p>
          {fr
            ? "Nous utilisons les services suivants. Chacun a son propre engagement de confidentialité. Quand des données quittent le Canada, c'est mentionné explicitement."
            : "We use the following services. Each has its own privacy commitment. Whenever data leaves Canada, it is explicitly mentioned."}
        </p>
        <ul className="list-disc list-inside space-y-2 mt-2 text-[var(--color-text-secondary)]">
          <li>
            <strong className="text-[var(--color-text-primary)]">Supabase</strong> —{" "}
            {fr
              ? "Base de données et fichiers PDF. Hébergement AWS (région \"us-east-1\", États-Unis). Reçoit : email, prénom, données de naissance, PDF, préférences. Lien : "
              : "Database and PDF storage. Hosted on AWS (\"us-east-1\", USA). Receives: email, first name, birth data, PDF, preferences. Link: "}
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-lavender)] hover:underline">supabase.com/privacy</a>
          </li>
          <li>
            <strong className="text-[var(--color-text-primary)]">Vercel</strong> —{" "}
            {fr
              ? "Hébergement du site et journaux serveur. Région de calcul principale : Montréal (Canada). Reçoit : adresse IP, métadonnées HTTP. Lien : "
              : "Site hosting and server logs. Primary compute region: Montreal (Canada). Receives: IP address, HTTP metadata. Link: "}
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-lavender)] hover:underline">vercel.com/legal/privacy-policy</a>
          </li>
          <li>
            <strong className="text-[var(--color-text-primary)]">Stripe</strong> —{" "}
            {fr
              ? "Paiement Premium (9,99 $ CAD). Hébergement États-Unis et Irlande. Reçoit : email, montant, identifiant de session. Nous ne voyons jamais ton numéro de carte. Lien : "
              : "Premium payment ($9.99 CAD). Hosted in USA + Ireland. Receives: email, amount, session ID. We never see your card number. Link: "}
            <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-lavender)] hover:underline">stripe.com/privacy</a>
          </li>
          <li>
            <strong className="text-[var(--color-text-primary)]">Anthropic (Claude)</strong> —{" "}
            {fr
              ? "Génère les interprétations astrologiques et le chat IA. Hébergement États-Unis. Reçoit : ta carte natale (positions planétaires, prénom, genre) et tes messages dans le chat. Anthropic s'engage à ne pas utiliser ces données pour entraîner ses modèles. Lien : "
              : "Generates the astrological interpretations and AI chat. Hosted in USA. Receives: your natal chart (planet positions, first name, gender) and your chat messages. Anthropic commits not to use this data for training. Link: "}
            <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-lavender)] hover:underline">anthropic.com/legal/privacy</a>
          </li>
          <li>
            <strong className="text-[var(--color-text-primary)]">Resend</strong> —{" "}
            {fr
              ? "Envoi du PDF par email et formulaire de contact. Hébergement États-Unis. Reçoit : ton email, ton prénom, le lien signé vers ton PDF (valide 7 jours). Lien : "
              : "Sends your PDF by email and powers the contact form. Hosted in USA. Receives: your email, first name, and signed PDF link (7-day validity). Link: "}
            <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-lavender)] hover:underline">resend.com/legal/privacy-policy</a>
          </li>
          <li>
            <strong className="text-[var(--color-text-primary)]">Upstash (Redis)</strong> —{" "}
            {fr
              ? "Limite de débit (anti-abus). Stocke ton adresse IP ou ton identifiant utilisateur 1 heure max. Hébergement AWS multi-régions. Lien : "
              : "Rate limiting (abuse prevention). Stores your IP or user ID for up to 1 hour. Hosted on AWS multi-region. Link: "}
            <a href="https://upstash.com/trust/privacy.pdf" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-lavender)] hover:underline">upstash.com/trust</a>
          </li>
          <li>
            <strong className="text-[var(--color-text-primary)]">Sentry</strong> —{" "}
            {fr
              ? "Suivi des erreurs techniques. Hébergement Europe (Allemagne) ou États-Unis selon la région. Reçoit : pile d'appel, URL, navigateur, parfois ton identifiant utilisateur si l'erreur survient pendant que tu es connecté. Pas de données de naissance. Lien : "
              : "Technical error tracking. Hosted in Europe (Germany) or USA. Receives: stack trace, URL, browser, and sometimes your user ID if the error happens while signed in. No birth data. Link: "}
            <a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-lavender)] hover:underline">sentry.io/privacy</a>
          </li>
          <li>
            <strong className="text-[var(--color-text-primary)]">Vercel Analytics + Speed Insights</strong> —{" "}
            {fr
              ? "Statistiques anonymes (pages visitées, performance). Désactivé par défaut : ne s'active que si tu cliques « Tout accepter » dans la bannière de consentement. Aucune donnée personnelle, aucun cookie publicitaire."
              : "Anonymous statistics (visited pages, performance). Off by default: only loads if you click \"Accept all\" in the consent banner. No personal data, no advertising cookies."}
          </li>
          <li>
            <strong className="text-[var(--color-text-primary)]">Nominatim (OpenStreetMap)</strong> —{" "}
            {fr
              ? "Recherche de ville (pour obtenir tes coordonnées GPS). Reçoit uniquement le nom de la ville que tu tapes."
              : "City search (to get GPS coordinates). Receives only the city name you type."}
          </li>
          <li>
            <strong className="text-[var(--color-text-primary)]">Google Fonts</strong> —{" "}
            {fr
              ? "Chargement des polices. Reçoit ton adresse IP technique (comme n'importe quelle requête web)."
              : "Font loading. Receives your technical IP address (like any web request)."}
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "4. Cookies et stockage local" : "4. Cookies and local storage"}
        </h2>
        <p>
          {fr
            ? "On utilise trois types de stockage dans ton navigateur :"
            : "We use three kinds of storage in your browser:"}
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-[var(--color-text-secondary)]">
          <li>{fr ? "Cookies de session Supabase — strictement nécessaires si tu es connecté. Sans eux la connexion ne fonctionne pas." : "Supabase session cookies — strictly necessary if you are signed in. Without them sign-in does not work."}</li>
          <li>{fr ? "localStorage — pour mémoriser ta langue préférée et ton choix de consentement cookies." : "localStorage — to remember your preferred language and your cookie consent choice."}</li>
          <li>{fr ? "IndexedDB — pour transférer ton PDF entre la page anonyme et la page d'inscription (effacé après envoi)." : "IndexedDB — to hand over your PDF between the anonymous page and the signup page (cleared after upload)."}</li>
        </ul>
        <p className="mt-3">
          {fr
            ? "Aucun cookie publicitaire, aucun tracker tiers, aucun pixel Meta/Google/TikTok."
            : "No advertising cookies, no third-party trackers, no Meta/Google/TikTok pixels."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "5. Liens de partage" : "5. Share links"}
        </h2>
        <p>
          {fr
            ? "Quand tu utilises la fonction « partager », tes données de naissance sont encodées dans l'URL. La page est configurée pour ne pas être indexée par les moteurs de recherche et ne pas envoyer de référent vers les liens externes. Toute personne possédant ce lien pourra toutefois voir la carte. Partage-le uniquement avec des personnes de confiance."
            : "When you use the share feature, your birth data is encoded in the URL. The page is configured not to be indexed by search engines and not to send any referrer to external links. Anyone with the link can still see the chart, however. Only share with people you trust."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "6. Tes droits" : "6. Your rights"}
        </h2>
        <p>
          {fr
            ? "Sous la Loi 25 (Québec), le RGPD (Europe) et la LPRPDE (Canada), tu as les droits suivants :"
            : "Under Quebec Law 25, the GDPR (Europe) and PIPEDA (Canada), you have the following rights:"}
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-[var(--color-text-secondary)]">
          <li>{fr ? "Accès — obtenir une copie de toutes les données que nous détenons sur toi." : "Access — get a copy of all the data we hold about you."}</li>
          <li>{fr ? "Rectification — corriger toute donnée inexacte." : "Rectification — correct any inaccurate data."}</li>
          <li>{fr ? "Suppression — demander l'effacement de ton compte et de tes données (bouton dans Paramètres, ou par courriel)." : "Deletion — request your account and data be erased (button in Settings, or by email)."}</li>
          <li>{fr ? "Portabilité — récupérer tes données dans un format lisible par machine (JSON)." : "Portability — receive your data in a machine-readable format (JSON)."}</li>
          <li>{fr ? "Opposition — refuser certains traitements (par exemple : analytics)." : "Objection — refuse certain processing (e.g. analytics)."}</li>
          <li>{fr ? "Retrait du consentement — à tout moment, sans justification." : "Withdrawal of consent — anytime, no reason needed."}</li>
        </ul>
        <p className="mt-3">
          {fr
            ? <>Pour exercer un droit, écris-nous via la <a href="/contact" className="text-[var(--color-accent-lavender)] hover:underline">page Contact</a>. Nous répondons sous 30 jours (délai légal Loi 25). En cas de différend, tu peux aussi porter plainte auprès de la <a href="https://www.cai.gouv.qc.ca/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-lavender)] hover:underline">Commission d&apos;accès à l&apos;information du Québec</a> ou de ton autorité de protection des données.</>
            : <>To exercise a right, write to us via the <a href="/contact" className="text-[var(--color-accent-lavender)] hover:underline">Contact page</a>. We respond within 30 days (Law 25 deadline). If a dispute arises, you can file a complaint with the <a href="https://www.cai.gouv.qc.ca/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-lavender)] hover:underline">Quebec Access to Information Commission</a> or your local data protection authority.</>}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "7. Durée de conservation" : "7. Retention"}
        </h2>
        <ul className="list-disc list-inside space-y-1 mt-2 text-[var(--color-text-secondary)]">
          <li>{fr ? "Compte et cartes sauvegardées : conservés tant que ton compte est actif. Effacés sous 30 jours après ta demande de suppression." : "Account and saved charts: kept while your account is active. Erased within 30 days of your deletion request."}</li>
          <li>{fr ? "PDFs dans le stockage : effacés en même temps que ton compte." : "PDFs in storage: erased at the same time as your account."}</li>
          <li>{fr ? "Logs serveur Vercel : 30 jours puis rotation automatique." : "Vercel server logs: 30 days then automatic rotation."}</li>
          <li>{fr ? "Données de paiement Stripe : 7 ans (obligation comptable / fiscale)." : "Stripe payment records: 7 years (accounting / tax obligation)."}</li>
          <li>{fr ? "Compteurs IA (rate limit) : 1 heure max." : "AI counters (rate limit): up to 1 hour."}</li>
        </ul>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "8. Mineurs" : "8. Minors"}
        </h2>
        <p>
          {fr
            ? "Le service est destiné aux personnes de 16 ans et plus. Si tu as moins de 16 ans, ne crée pas de compte sans l'accord d'un parent ou tuteur."
            : "The service is for users aged 16 and over. If you are under 16, please do not create an account without parental or guardian consent."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "9. Sécurité" : "9. Security"}
        </h2>
        <p>
          {fr
            ? "Connexions chiffrées (HTTPS partout, HSTS), mots de passe stockés sous forme hachée par Supabase, contrôle d'accès par RLS Postgres pour que chaque utilisateur ne voie que ses propres données, signatures HMAC sur les webhooks Stripe. Nous limitons l'accès aux données aux seules personnes qui en ont strictement besoin."
            : "Encrypted connections (HTTPS everywhere, HSTS), passwords hashed by Supabase, Postgres RLS access control so each user sees only their own data, HMAC signatures on Stripe webhooks. We restrict data access to people who strictly need it."}
        </p>
      </section>

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "10. Modifications" : "10. Updates"}
        </h2>
        <p>
          {fr
            ? "Cette politique peut être mise à jour. La date de dernière mise à jour est affichée en haut de la page. Les changements importants te seront notifiés par email ou par bannière sur le site."
            : "This policy may be updated. The last-updated date is shown at the top. Material changes will be notified by email or by an in-site banner."}
        </p>
      </section>
    </PageShell>
  );
}
