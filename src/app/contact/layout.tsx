import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact · Natalune",
  description:
    "Une question, une suggestion ou un souci avec votre carte du ciel ? Contactez l'équipe Natalune, nous vous répondons rapidement.",
  alternates: { canonical: "https://natalune.com/contact" },
  openGraph: {
    // A child openGraph replaces the parent one wholesale, image included:
    // without this line the page was shared with no image (QA 2026-11).
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    title: "Contact · Natalune",
    description: "Une question ou une suggestion ? Contactez l'équipe Natalune.",
    url: "https://natalune.com/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
