import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Synastrie — compatibilité amoureuse en astrologie · Natalune",
  description:
    "Comparez deux thèmes astraux et découvrez votre compatibilité : aspects entre planètes, forces et défis de la relation, interprétés sur Natalune.",
  alternates: { canonical: "https://natalune.com/synastrie" },
  openGraph: {
    title: "Synastrie — compatibilité amoureuse en astrologie · Natalune",
    description:
      "Comparez deux thèmes astraux : aspects, forces et défis de votre relation.",
    url: "https://natalune.com/synastrie",
  },
};

export default function SynastrieLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
