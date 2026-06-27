import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calendrier céleste — pleines lunes, rétrogrades & passages | Natalune',
  description:
    'Le calendrier astrologique des 12 prochains mois : nouvelles et pleines lunes, dates de Mercure rétrograde et des autres rétrogrades, passages du Soleil en signe.',
  alternates: { canonical: 'https://natalune.com/calendrier' },
  openGraph: {
    title: 'Calendrier céleste — Natalune',
    description:
      'Pleines lunes, Mercure rétrograde et passages planétaires sur les 12 prochains mois.',
    url: 'https://natalune.com/calendrier',
    siteName: 'Natalune',
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function CalendrierLayout({ children }: { children: React.ReactNode }) {
  return children
}
