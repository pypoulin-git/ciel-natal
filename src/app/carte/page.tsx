import type { Metadata } from 'next'
import { calculateNatalChart, translateSign } from '@/lib/astro'
import { decodeSharePayload } from '@/lib/shareParams'
import RedirectToChart from './RedirectToChart'

// Share landing: crawlers (Facebook, WhatsApp, iMessage…) read the per-chart
// metadata rendered here; humans are instantly forwarded to /?c= where the
// full experience lives. Kept noindex — each shared chart is personal.

type Props = { searchParams: Promise<{ c?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { c } = await searchParams
  const payload = decodeSharePayload(c)

  let title = 'Une carte du ciel à découvrir — Natalune'
  let description = 'Calcule ta carte natale gratuitement : Soleil, Lune, Ascendant et bien plus.'

  if (payload) {
    const hasTime = payload.ht !== 0
    const chart = calculateNatalChart(
      payload.a,
      payload.m,
      payload.j,
      hasTime ? (payload.h ?? 12) : 12,
      hasTime ? (payload.mn ?? 0) : 0,
      payload.la,
      payload.lo,
      hasTime,
    )
    const sun = translateSign(chart.planets[0].sign, 'fr')
    const moon = translateSign(chart.planets[1].sign, 'fr')
    const asc = chart.ascendant ? translateSign(chart.ascendant.sign, 'fr') : null
    const trio = `Soleil ${sun} · Lune ${moon}${asc ? ` · Ascendant ${asc}` : ''}`
    title = payload.n ? `Le ciel de ${payload.n} — ${trio}` : `${trio} — Natalune`
    description = `${trio}. Découvre ta propre carte natale gratuitement sur Natalune.`
  }

  const ogImage = `/api/og/chart${c ? `?c=${encodeURIComponent(c)}` : ''}`

  return {
    title,
    description,
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      siteName: 'Natalune',
      locale: 'fr_FR',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function CartePage({ searchParams }: Props) {
  const { c } = await searchParams
  return <RedirectToChart c={c ?? null} />
}
