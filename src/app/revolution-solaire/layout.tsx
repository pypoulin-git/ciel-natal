import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Révolution solaire : ton année astrologique | Natalune",
  description:
    "Ta révolution solaire calculée à la minute : l'Ascendant de ton année, les domaines qu'elle active, son maître et le calendrier de tes éclipses et rétrogrades.",
  alternates: { canonical: "https://natalune.com/revolution-solaire" },
  openGraph: {
    title: "Révolution solaire : ton année, d'un anniversaire à l'autre",
    description: "L'Ascendant de ton année, les domaines qu'elle active et le calendrier de tes douze mois.",
    url: "https://natalune.com/revolution-solaire",
    siteName: "Natalune",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RevolutionSolaireLayout({ children }: { children: React.ReactNode }) {
  return children;
}
