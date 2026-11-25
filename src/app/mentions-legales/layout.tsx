import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales | Natalune",
  description:
    "Éditeur, hébergement, propriété intellectuelle et contact du site Natalune.",
  alternates: { canonical: "https://natalune.com/mentions-legales" },
};

export default function MentionsLegalesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
