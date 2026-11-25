import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bienvenue dans Premium | Natalune",
  alternates: { canonical: "https://natalune.com/premium/succes" },
  robots: { index: false, follow: true },
};

export default function PremiumSuccesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
