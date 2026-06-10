import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'utilisation · Natalune",
  description:
    "Les conditions d'utilisation de Natalune : usage du service, propriété, limitation de responsabilité et nature divertissante des interprétations astrologiques.",
  alternates: { canonical: "https://natalune.com/conditions" },
  robots: { index: true, follow: true },
};

export default function ConditionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
