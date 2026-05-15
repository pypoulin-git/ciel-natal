"use client";

import Link from "next/link";
import { SignIcon } from "@/components/AstroIcons";
import { useLocale } from "@/lib/i18n";

interface SignData {
  slug: string;
  nameFr: string;
  nameEn: string;
  glyph: string;
  datesFr: string;
  datesEn: string;
  elementFr: string;
  elementEn: string;
}

const signs: SignData[] = [
  { slug: "belier", nameFr: "Bélier", nameEn: "Aries", glyph: "\u2648", datesFr: "21 mars \u2013 19 avril", datesEn: "Mar 21 \u2013 Apr 19", elementFr: "Feu", elementEn: "Fire" },
  { slug: "taureau", nameFr: "Taureau", nameEn: "Taurus", glyph: "\u2649", datesFr: "20 avril \u2013 20 mai", datesEn: "Apr 20 \u2013 May 20", elementFr: "Terre", elementEn: "Earth" },
  { slug: "gemeaux", nameFr: "Gémeaux", nameEn: "Gemini", glyph: "\u264a", datesFr: "21 mai \u2013 20 juin", datesEn: "May 21 \u2013 Jun 20", elementFr: "Air", elementEn: "Air" },
  { slug: "cancer", nameFr: "Cancer", nameEn: "Cancer", glyph: "\u264b", datesFr: "21 juin \u2013 22 juillet", datesEn: "Jun 21 \u2013 Jul 22", elementFr: "Eau", elementEn: "Water" },
  { slug: "lion", nameFr: "Lion", nameEn: "Leo", glyph: "\u264c", datesFr: "23 juillet \u2013 22 août", datesEn: "Jul 23 \u2013 Aug 22", elementFr: "Feu", elementEn: "Fire" },
  { slug: "vierge", nameFr: "Vierge", nameEn: "Virgo", glyph: "\u264d", datesFr: "23 août \u2013 22 septembre", datesEn: "Aug 23 \u2013 Sep 22", elementFr: "Terre", elementEn: "Earth" },
  { slug: "balance", nameFr: "Balance", nameEn: "Libra", glyph: "\u264e", datesFr: "23 septembre \u2013 22 octobre", datesEn: "Sep 23 \u2013 Oct 22", elementFr: "Air", elementEn: "Air" },
  { slug: "scorpion", nameFr: "Scorpion", nameEn: "Scorpio", glyph: "\u264f", datesFr: "23 octobre \u2013 21 novembre", datesEn: "Oct 23 \u2013 Nov 21", elementFr: "Eau", elementEn: "Water" },
  { slug: "sagittaire", nameFr: "Sagittaire", nameEn: "Sagittarius", glyph: "\u2650", datesFr: "22 novembre \u2013 21 décembre", datesEn: "Nov 22 \u2013 Dec 21", elementFr: "Feu", elementEn: "Fire" },
  { slug: "capricorne", nameFr: "Capricorne", nameEn: "Capricorn", glyph: "\u2651", datesFr: "22 décembre \u2013 19 janvier", datesEn: "Dec 22 \u2013 Jan 19", elementFr: "Terre", elementEn: "Earth" },
  { slug: "verseau", nameFr: "Verseau", nameEn: "Aquarius", glyph: "\u2652", datesFr: "20 janvier \u2013 18 février", datesEn: "Jan 20 \u2013 Feb 18", elementFr: "Air", elementEn: "Air" },
  { slug: "poissons", nameFr: "Poissons", nameEn: "Pisces", glyph: "\u2653", datesFr: "19 février \u2013 20 mars", datesEn: "Feb 19 \u2013 Mar 20", elementFr: "Eau", elementEn: "Water" },
];

const elementColor: Record<string, string> = {
  Feu: "#ef4444",
  Fire: "#ef4444",
  Terre: "#22c55e",
  Earth: "#22c55e",
  Air: "#60a5fa",
  Eau: "#a78bfa",
  Water: "#a78bfa",
};

export default function SignesContent() {
  const { locale } = useLocale();
  const fr = locale === "fr";

  return (
    <>
      <p className="text-[var(--color-text-secondary)] mb-6">
        {fr
          ? "Chaque signe du zodiaque porte en lui un archétype psychologique unique. Explorez les douze visages de la roue zodiacale pour mieux comprendre les dynamiques profondes qui animent votre personnalité, vos relations et votre chemin de vie."
          : "Each zodiac sign carries a unique psychological archetype. Explore the twelve faces of the zodiac wheel to better understand the deep dynamics shaping your personality, relationships and life path."}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {signs.map((s) => {
          const name = fr ? s.nameFr : s.nameEn;
          const dates = fr ? s.datesFr : s.datesEn;
          const element = fr ? s.elementFr : s.elementEn;
          return (
            <Link
              key={s.slug}
              href={`/signe/${s.slug}`}
              aria-label={fr ? `Découvrir le signe ${name}` : `Explore the ${name} sign`}
              className="glass p-4 flex flex-col items-center gap-2 hover:border-[var(--color-accent-lavender)] hover:bg-white/[0.03] hover:-translate-y-0.5 transition group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-lavender)]"
            >
              <span className="group-hover:scale-110 transition-transform">
                <SignIcon name={s.nameFr} size={32} color="var(--color-accent-lavender)" glow />
              </span>
              <span className="font-cinzel text-base text-[var(--color-text-primary)]">
                {name}
              </span>
              <span className="text-sm text-[var(--color-text-secondary)]">
                {dates}
              </span>
              <span
                className="text-xs font-mono px-2 py-0.5 rounded-full"
                style={{
                  color: elementColor[element],
                  border: `1px solid ${elementColor[element]}40`,
                }}
              >
                {element}
              </span>
              <span className="mt-1 text-xs text-[var(--color-accent-lavender)] opacity-70 group-hover:opacity-100 transition">
                {fr ? "Voir le signe →" : "Explore →"}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-lg bg-[var(--color-accent-lavender)] text-white font-cinzel text-sm hover:opacity-90 transition"
        >
          {fr ? "Calcule ta carte du ciel gratuitement" : "Calculate your natal chart for free"}
        </Link>
      </div>
    </>
  );
}
