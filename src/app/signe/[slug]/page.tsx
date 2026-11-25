import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { signs } from "@/data/signs-data";
import SignContent from "./SignContent";

/* ------------------------------------------------------------------ */
/*  Static generation                                                  */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return Object.keys(signs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const sign = signs[slug];
  if (!sign) return {};
  return {
    title: `${sign.nameFr} (${sign.glyph}) : personnalité, amour et travail | Natalune`,
    description: `Le signe ${sign.nameFr} (${sign.datesFr}) en astrologie psychologique : personnalité profonde, forces, défis, amour et travail.`,
    keywords: [
      sign.nameFr,
      sign.nameEn,
      "signe du zodiaque",
      "zodiac sign",
      "astrologie",
      "astrology",
      `${sign.nameFr} personnalité`,
      `${sign.nameEn} personality`,
      sign.elementFr,
      sign.elementEn,
    ],
    openGraph: {
      title: `${sign.glyph} ${sign.nameFr} / ${sign.nameEn} — Natalune`,
      description: `Portrait astrologique du signe ${sign.nameFr}. ${sign.datesFr}. / Astrological portrait of ${sign.nameEn}. ${sign.datesEn}.`,
      images: [`/api/og?sign=${sign.slug}`],
    },
    alternates: {
      canonical: `https://natalune.com/signe/${slug}`,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default async function SignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sign = signs[slug];
  if (!sign) return notFound();

  return (
    <PageShell title={sign.nameFr}>
      <SignContent sign={sign} />
    </PageShell>
  );
}
