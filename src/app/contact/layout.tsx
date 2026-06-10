import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact · Natalune",
  description:
    "Une question, une suggestion ou un souci avec votre carte du ciel ? Contactez l'équipe Natalune, nous vous répondons rapidement.",
  alternates: { canonical: "https://natalune.com/contact" },
  openGraph: {
    title: "Contact · Natalune",
    description: "Une question ou une suggestion ? Contactez l'équipe Natalune.",
    url: "https://natalune.com/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
