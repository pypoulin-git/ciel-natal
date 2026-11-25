import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos — notre approche de l'astrologie · Natalune",
  description:
    "Découvrez Natalune : une astrologie psychologique fondée sur des calculs astronomiques précis (VSOP87, Jean Meeus) et des interprétations bienveillantes.",
  alternates: { canonical: "https://natalune.com/a-propos" },
  openGraph: {
    // A child openGraph replaces the parent one wholesale, image included:
    // without this line the page was shared with no image (QA 2026-11).
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    title: "À propos — notre approche de l'astrologie · Natalune",
    description:
      "Calculs astronomiques précis et interprétations psychologiques bienveillantes.",
    url: "https://natalune.com/a-propos",
  },
};

export default function AProposLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
