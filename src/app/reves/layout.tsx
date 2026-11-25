import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Journal de rêves gratuit — interprétation par ta Lune natale · Natalune',
  description:
    "Note tes rêves gratuitement. Avec Premium, l'IA en donne trois lectures (neurosciences, archétypes, synthèse) colorées par ta Lune natale.",
  alternates: { canonical: 'https://natalune.com/reves' },
  openGraph: {
    // A child openGraph replaces the parent one wholesale, image included:
    // without this line the page was shared with no image (QA 2026-11).
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    title: 'Journal de rêves · Natalune',
    description:
      'Noter tes rêves est gratuit. Premium en donne trois lectures, colorées par ta Lune natale.',
    url: 'https://natalune.com/reves',
  },
}

export default function RevesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
