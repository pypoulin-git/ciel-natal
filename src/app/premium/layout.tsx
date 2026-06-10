import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium — lectures illimitées & chat IA · Natalune",
  description:
    "Passez à Natalune Premium : interprétations approfondies, chat IA illimité, narration audio, synastrie et export PDF de votre carte du ciel.",
  alternates: { canonical: "https://natalune.com/premium" },
  openGraph: {
    title: "Premium — lectures illimitées & chat IA · Natalune",
    description:
      "Interprétations approfondies, chat IA illimité, narration audio, synastrie et export PDF.",
    url: "https://natalune.com/premium",
  },
};

export default function PremiumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
