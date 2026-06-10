import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité · Natalune",
  description:
    "Comment Natalune protège vos données : sous-traitants, durées de conservation, droits d'accès et de suppression, conformité Loi 25 (Québec) et RGPD.",
  alternates: { canonical: "https://natalune.com/confidentialite" },
  robots: { index: true, follow: true },
};

export default function ConfidentialiteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
