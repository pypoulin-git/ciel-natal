import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon compte | Natalune",
  alternates: { canonical: "https://natalune.com/mon-compte" },
  robots: { index: false, follow: true },
};

export default function MonCompteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
