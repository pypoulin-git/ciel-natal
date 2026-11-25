import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calendrier céleste — pleines lunes, rétrogrades & passages | Natalune',
  description:
    'Le calendrier astrologique des 12 prochains mois : lunes, éclipses, Mercure et autres rétrogrades, étoiles filantes et planètes visibles.',
  alternates: { canonical: 'https://natalune.com/calendrier' },
  openGraph: {
    // A child openGraph replaces the parent one wholesale, image included:
    // without this line the page was shared with no image (QA 2026-11).
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    title: 'Calendrier céleste — Natalune',
    description:
      'Pleines lunes, Mercure rétrograde et passages planétaires sur les 12 prochains mois.',
    url: 'https://natalune.com/calendrier',
    siteName: 'Natalune',
    locale: 'fr_CA',
    type: 'website',
  },
}

export default function CalendrierLayout({ children }: { children: React.ReactNode }) {
  return children
}
