import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion | Natalune",
  alternates: { canonical: "https://natalune.com/connexion" },
  robots: { index: false, follow: true },
};

export default function ConnexionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
