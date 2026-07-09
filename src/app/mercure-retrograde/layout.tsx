import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mercure rétrograde : dates à venir, signification et conseils | Natalune',
  description:
    'Quand est la prochaine Mercure rétrograde ? Dates calculées en direct, ce que ça signifie vraiment (sans panique), et comment traverser la période — communication, contrats, voyages.',
  alternates: { canonical: 'https://natalune.com/mercure-retrograde' },
  openGraph: {
    title: 'Mercure rétrograde — dates et signification | Natalune',
    description:
      "Les prochaines dates de Mercure rétrograde, calculées en direct, et ce qu'elles signifient vraiment.",
    url: 'https://natalune.com/mercure-retrograde',
    siteName: 'Natalune',
    locale: 'fr_FR',
    type: 'website',
  },
}

// FAQ structured data — mirrors the on-page FAQ so Google can show rich results.
const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: "C'est quoi, Mercure rétrograde ?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Trois à quatre fois par année, Mercure semble reculer dans le ciel vu de la Terre — une illusion d'optique due aux vitesses orbitales différentes. En astrologie psychologique, c'est une invitation à ralentir tout ce que Mercure gouverne : la communication, les échanges, les déplacements et la technologie.",
      },
    },
    {
      '@type': 'Question',
      name: 'Faut-il avoir peur de Mercure rétrograde ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Non. Rien ne « casse » à cause d'une planète. La période est simplement propice aux malentendus et aux retards — et excellente pour tout ce qui commence par « re » : relire, réviser, reprendre contact, se reposer.",
      },
    },
    {
      '@type': 'Question',
      name: 'Que vaut-il mieux éviter pendant Mercure rétrograde ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Par prudence : signer un contrat important sans le relire deux fois, lancer un projet de communication majeur, ou acheter du matériel électronique sans garantie. Et sauvegarde tes fichiers — c'est toujours une bonne idée.",
      },
    },
    {
      '@type': 'Question',
      name: 'Suis-je né·e pendant Mercure rétrograde ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Environ une personne sur cinq est née pendant une rétrogradation de Mercure. Calcule ta carte natale gratuite sur Natalune : si c'est ton cas, un badge ℞ apparaît à côté de Mercure — un mental plus intérieur et réfléchi, qui mûrit ses idées avant de les partager.",
      },
    },
  ],
}

export default function MercureRetrogradeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
      />
      {children}
    </>
  )
}
