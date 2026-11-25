import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium — lectures complètes & chat IA · Natalune",
  description:
    "Natalune Premium, 9,99 $ une seule fois : interprétations complètes, chat IA, narration audio, synastrie et export PDF de ta carte du ciel.",
  alternates: { canonical: "https://natalune.com/premium" },
  openGraph: {
    // A child openGraph replaces the parent one wholesale, image included:
    // without this line the page was shared with no image (QA 2026-11).
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    title: "Premium — lectures complètes & chat IA · Natalune",
    description:
      "Interprétations complètes, chat IA, narration audio, synastrie et export PDF. Paiement unique.",
    url: "https://natalune.com/premium",
  },
};

export default function PremiumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
