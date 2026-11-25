import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium — lectures illimitées & chat IA · Natalune",
  description:
    "Passez à Natalune Premium : interprétations approfondies, chat IA illimité, narration audio, synastrie et export PDF de votre carte du ciel.",
  alternates: { canonical: "https://natalune.com/premium" },
  openGraph: {
    // A child openGraph replaces the parent one wholesale, image included:
    // without this line the page was shared with no image (QA 2026-11).
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    title: "Premium — lectures illimitées & chat IA · Natalune",
    description:
      "Interprétations approfondies, chat IA illimité, narration audio, synastrie et export PDF.",
    url: "https://natalune.com/premium",
  },
};

export default function PremiumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
