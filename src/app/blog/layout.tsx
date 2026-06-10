import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — explorations en astrologie psychologique · Natalune",
  description:
    "Articles d'astrologie psychologique : signes, planètes, maisons, transits et synastrie expliqués simplement, dans l'esprit de Jung et Liz Greene.",
  alternates: { canonical: "https://natalune.com/blog" },
  openGraph: {
    title: "Blog — explorations en astrologie psychologique · Natalune",
    description:
      "Signes, planètes, maisons, transits et synastrie expliqués simplement.",
    url: "https://natalune.com/blog",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
