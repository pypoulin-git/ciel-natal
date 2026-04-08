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
    title: `${sign.nameFr} (${sign.glyph}) — ${sign.nameEn} | Ciel Natal`,
    description: `Discover the ${sign.nameEn} zodiac sign in psychological astrology: deep personality, strengths, challenges, love compatibility and career. ${sign.datesEn}. / Découvrez le signe ${sign.nameFr} : personnalité profonde, forces et défis, amour et travail. ${sign.datesFr}.`,
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
      title: `${sign.glyph} ${sign.nameFr} / ${sign.nameEn} — Ciel Natal`,
      description: `Portrait astrologique du signe ${sign.nameFr}. ${sign.datesFr}. / Astrological portrait of ${sign.nameEn}. ${sign.datesEn}.`,
      images: [`/api/og?sign=${sign.slug}`],
    },
    alternates: {
      canonical: `https://ciel-natal.vercel.app/signe/${slug}`,
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
