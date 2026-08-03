import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Journal de rêves gratuit — interprétation par ta Lune natale · Natalune',
  description:
    "Note tes rêves gratuitement : récit, émotions, calendrier du mois. Avec Premium, l'IA les structure et en donne trois lectures — neurosciences, archétypes jungiens, ou l'équilibre des deux — colorées par ta Lune natale.",
  alternates: { canonical: 'https://natalune.com/reves' },
  openGraph: {
    title: 'Journal de rêves · Natalune',
    description:
      'Noter tes rêves est gratuit. Premium en donne trois lectures, colorées par ta Lune natale.',
    url: 'https://natalune.com/reves',
  },
}

export default function RevesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
