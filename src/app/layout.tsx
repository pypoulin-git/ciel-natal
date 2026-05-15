import type { Metadata } from "next";
import { ViewTransition } from "react";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth-context";
import TopNav from "@/components/TopNav";
import CookieBanner from "@/components/CookieBanner";
import ConsentedAnalytics from "@/components/ConsentedAnalytics";

export const metadata: Metadata = {
  title: "Ciel Natal — Découvre ta carte du ciel",
  description:
    "Calcule ton thème natal gratuitement et découvre ce que le ciel racontait au moment de ta naissance. Interprétations psychologiques profondes, pas un horoscope de magazine.",
  keywords:
    "carte du ciel, thème natal, astrologie, horoscope, signe ascendant, thème astral gratuit",
  metadataBase: new URL("https://ciel-natal.vercel.app"),
  openGraph: {
    title: "Ciel Natal — Découvre ta carte du ciel",
    description: "Calcule ton thème natal gratuitement. Interprétations psychologiques profondes inspirées de Jung.",
    url: "https://ciel-natal.vercel.app",
    siteName: "Ciel Natal",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ciel Natal — Découvre ta carte du ciel",
    description: "Calcule ton thème natal gratuitement. Interprétations psychologiques profondes.",
  },
  alternates: {
    canonical: "https://ciel-natal.vercel.app",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Sync lang attribute with user locale preference */}
        <script dangerouslySetInnerHTML={{ __html: `try{var l=localStorage.getItem("ciel-natal-locale");if(l)document.documentElement.lang=l}catch(e){}` }} />
        <link rel="alternate" hrefLang="fr" href="https://ciel-natal.vercel.app" />
        <link rel="alternate" hrefLang="en" href="https://ciel-natal.vercel.app" />
        <link rel="alternate" hrefLang="x-default" href="https://ciel-natal.vercel.app" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Ciel Natal",
              url: "https://ciel-natal.vercel.app",
              description: "Calcule ton thème natal gratuitement. Astrologie psychologique inspirée de Jung.",
              inLanguage: ["fr", "en"],
              potentialAction: {
                "@type": "SearchAction",
                target: "https://ciel-natal.vercel.app/signe/{search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        <LocaleProvider>
          <AuthProvider>
            <a href="#main-content" className="skip-link">
              Skip to content
            </a>
            <TopNav />
            <ViewTransition>
              <main id="main-content" role="main">
                {children}
              </main>
            </ViewTransition>
            <CookieBanner />
            <ConsentedAnalytics />
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
