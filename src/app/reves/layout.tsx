import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Journal de rêves — tes rêves lus à la lumière de ta carte natale · Natalune',
  description:
    "Consigne tes rêves, laisse l'IA les structurer et les interpréter selon trois lectures — neurosciences, archétypes jungiens, ou l'équilibre des deux — enrichies par ta Lune natale.",
  alternates: { canonical: 'https://natalune.com/reves' },
  openGraph: {
    title: 'Journal de rêves · Natalune',
    description:
      'Trois lectures du même rêve — factuelle, spirituelle, mixte — colorées par ta Lune natale.',
    url: 'https://natalune.com/reves',
  },
}

export default function RevesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
