import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ciel Natal — Découvre ta carte du ciel",
  description:
    "Calcule ton thème natal gratuitement et découvre ce que le ciel racontait au moment de ta naissance. Interprétations psychologiques profondes, pas un horoscope de magazine.",
  keywords:
    "carte du ciel, thème natal, astrologie, horoscope, signe ascendant, thème astral gratuit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
