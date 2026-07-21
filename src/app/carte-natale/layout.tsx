import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carte natale gratuite — calcule ton thème astral | Natalune",
  description:
    "Calcule ta carte natale (thème astral) gratuitement : Soleil, Lune, Ascendant, planètes, maisons et aspects, interprétés. Astrologie psychologique, calculs astronomiques réels.",
  keywords:
    "carte natale, thème natal, thème astral gratuit, calcul carte du ciel, ascendant, soleil lune ascendant, astrologie psychologique",
  alternates: { canonical: "https://natalune.com/carte-natale" },
  openGraph: {
    title: "Carte natale gratuite — calcule ton thème astral",
    description:
      "Ta carte du ciel complète, calculée et interprétée : Soleil, Lune, Ascendant, maisons et aspects.",
    url: "https://natalune.com/carte-natale",
    siteName: "Natalune",
    locale: "fr_FR",
    type: "website",
  },
};

export default function CarteNataleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
