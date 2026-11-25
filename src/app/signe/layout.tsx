import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Les 12 signes du zodiaque — Natalune",
  description:
    "Explorez les 12 signes du zodiaque : personnalité, forces, défis, amour et travail. Astrologie psychologique inspirée de Jung et Liz Greene.",
  keywords: [
    "signes du zodiaque",
    "zodiac signs",
    "astrologie",
    "astrology",
    "horoscope",
    "thème astral",
    "natal chart",
  ],
  alternates: { canonical: "https://natalune.com/signe" },
  openGraph: {
    // A child openGraph replaces the parent one wholesale, image included:
    // without this line the page was shared with no image (QA 2026-11).
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    title: "Les 12 signes du zodiaque — Natalune",
    description:
      "Explorez les 12 signes du zodiaque : personnalité, forces, défis, amour et travail.",
  },
};

export default function SigneLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
