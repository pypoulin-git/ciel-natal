import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carte natale gratuite — calcule ton thème astral | Natalune",
  description:
    "Ta carte natale gratuite : Soleil, Lune, Ascendant, planètes, maisons et aspects, calculés pour de vrai et lus en astrologie psychologique.",
  keywords:
    "carte natale, thème natal, thème astral gratuit, calcul carte du ciel, ascendant, soleil lune ascendant, astrologie psychologique",
  alternates: { canonical: "https://natalune.com/carte-natale" },
  openGraph: {
    // A child openGraph replaces the parent one wholesale, image included:
    // without this line the page was shared with no image (QA 2026-11).
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    title: "Carte natale gratuite — calcule ton thème astral",
    description:
      "Ta carte du ciel complète, calculée et interprétée : Soleil, Lune, Ascendant, maisons et aspects.",
    url: "https://natalune.com/carte-natale",
    siteName: "Natalune",
    locale: "fr_CA",
    type: "website",
  },
};

export default function CarteNataleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
