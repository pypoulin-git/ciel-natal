import type { Metadata } from 'next'
import { ViewTransition } from 'react'
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

export const metadata: Metadata = {
  title: 'Natalune — Découvre ta carte du ciel',
  description:
    'Ta carte du ciel gratuite, lue comme un portrait psychologique, le ciel du jour et ton journal de rêves. Pas un horoscope de magazine.',
  keywords:
    'carte du ciel, thème natal, astrologie, horoscope, signe ascendant, thème astral gratuit',
  metadataBase: new URL('https://natalune.com'),
  openGraph: {
    // A child openGraph replaces the parent one wholesale, image included:
    // without this line the page was shared with no image (QA 2026-11).
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    title: 'Natalune — Découvre ta carte du ciel',
    description:
      'Calcule ton thème natal gratuitement. Interprétations psychologiques profondes inspirées de Jung.',
    url: 'https://natalune.com',
    siteName: 'Natalune',
    locale: 'fr_CA',
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
    <html lang="fr" suppressHydrationWarning>
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          <LocaleProvider>
            <AuthProvider>
              <a href="#main-content" className="skip-link">
                Aller au contenu
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
