import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte | Natalune",
  alternates: { canonical: "https://natalune.com/inscription" },
  robots: { index: false, follow: true },
};

export default function InscriptionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
