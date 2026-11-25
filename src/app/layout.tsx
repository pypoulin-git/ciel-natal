import type { Metadata } from 'next'
import { ViewTransition } from 'react'
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { LocaleProvider } from '@/lib/i18n'
import { ThemeProvider } from '@/lib/theme'
import { AuthProvider } from '@/lib/auth-context'
import TopNav from '@/components/TopNav'
import MoonBanner from '@/components/MoonBanner'
import SkyTicker from '@/components/SkyTicker'
import CookieBanner from '@/components/CookieBanner'
import ConsentedAnalytics from '@/components/ConsentedAnalytics'
import MarketingPixels from '@/components/MarketingPixels'

// Self-hosted through next/font: preloaded, no render-blocking stylesheet,
// no visitor IP sent to Google (the external stylesheet was the main cause of
// the 5 s mobile LCP measured in the 2026-11 QA).
const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-fraunces',
})
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], display: 'swap', variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'Natalune — Découvre ta carte du ciel',
  description:
    'Calcule ton thème natal gratuitement et découvre ce que le ciel racontait au moment de ta naissance. Interprétations psychologiques profondes, pas un horoscope de magazine.',
  keywords:
    'carte du ciel, thème natal, astrologie, horoscope, signe ascendant, thème astral gratuit',
  metadataBase: new URL('https://natalune.com'),
  openGraph: {
    title: 'Natalune — Découvre ta carte du ciel',
    description:
      'Calcule ton thème natal gratuitement. Interprétations psychologiques profondes inspirées de Jung.',
    url: 'https://natalune.com',
    siteName: 'Natalune',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Natalune — Découvre ta carte du ciel',
    description: 'Calcule ton thème natal gratuitement. Interprétations psychologiques profondes.',
  },
  alternates: {
    canonical: 'https://natalune.com',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${fraunces.variable} ${inter.variable} ${mono.variable}`}>
      <head>
        {/* Sync lang attribute with user locale preference */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var l=localStorage.getItem("ciel-natal-locale");if(l)document.documentElement.lang=l}catch(e){}`,
          }}
        />
        {/* Apply saved theme BEFORE paint to avoid a flash of the wrong palette. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("ciel-natal-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
        <link rel="alternate" hrefLang="fr" href="https://natalune.com" />
        <link rel="alternate" hrefLang="en" href="https://natalune.com" />
        <link rel="alternate" hrefLang="x-default" href="https://natalune.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Natalune',
              url: 'https://natalune.com',
              description:
                'Calcule ton thème natal gratuitement. Astrologie psychologique inspirée de Jung.',
              inLanguage: ['fr', 'en'],
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://natalune.com/signe/{search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          <LocaleProvider>
            <AuthProvider>
              <a href="#main-content" className="skip-link">
                Skip to content
              </a>
              <TopNav />
              <MoonBanner />
              <SkyTicker />
              <ViewTransition>
                <main id="main-content" role="main">
                  {children}
                </main>
              </ViewTransition>
              <CookieBanner />
              <ConsentedAnalytics />
              <MarketingPixels />
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
