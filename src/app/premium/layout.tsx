import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium — lectures complètes & chat IA · Natalune",
  description:
    "Natalune Premium, 9,99 $ une seule fois : interprétations complètes, chat IA, narration audio, synastrie et export PDF de ta carte du ciel.",
  alternates: { canonical: "https://natalune.com/premium" },
  openGraph: {
    title: "Premium — lectures complètes & chat IA · Natalune",
    description:
      "Interprétations complètes, chat IA, narration audio, synastrie et export PDF. Paiement unique.",
    url: "https://natalune.com/premium",
  },
};

export default function PremiumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
