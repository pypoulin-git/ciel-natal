import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'utilisation · Natalune",
  description:
    "Conditions d'utilisation de Natalune : le service, Premium et remboursement, responsabilité, propriété intellectuelle.",
  alternates: { canonical: "https://natalune.com/conditions" },
  robots: { index: true, follow: true },
};

export default function ConditionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
