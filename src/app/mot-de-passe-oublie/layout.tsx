import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mot de passe oublié | Natalune",
  alternates: { canonical: "https://natalune.com/mot-de-passe-oublie" },
  robots: { index: false, follow: true },
};

export default function MotDePasseOublieLayout({ children }: { children: React.ReactNode }) {
  return children;
}
