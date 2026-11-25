import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — explorations en astrologie psychologique · Natalune",
  description:
    "Articles d'astrologie psychologique : signes, planètes, maisons, transits et synastrie expliqués simplement, dans l'esprit de Jung et Liz Greene.",
  alternates: {
    canonical: "https://natalune.com/blog",
    types: { "application/rss+xml": [{ url: "/blog/rss.xml", title: "Natalune · le blogue" }] },
  },
  openGraph: {
    // A child openGraph replaces the parent one wholesale, image included:
    // without this line the page was shared with no image (QA 2026-11).
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    title: "Blog — explorations en astrologie psychologique · Natalune",
    description:
      "Signes, planètes, maisons, transits et synastrie expliqués simplement.",
    url: "https://natalune.com/blog",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
