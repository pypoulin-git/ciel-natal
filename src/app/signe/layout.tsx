import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Les 12 signes du zodiaque — Ciel Natal",
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
  openGraph: {
    title: "Les 12 signes du zodiaque — Ciel Natal",
    description:
      "Explorez les 12 signes du zodiaque : personnalité, forces, défis, amour et travail.",
  },
};

export default function SigneLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
