import Link from "next/link";
import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

const signs = [
  { slug: "belier", name: "Bélier", glyph: "♈", dates: "21 mars – 19 avril", element: "Feu" },
  { slug: "taureau", name: "Taureau", glyph: "♉", dates: "20 avril – 20 mai", element: "Terre" },
  { slug: "gemeaux", name: "Gémeaux", glyph: "♊", dates: "21 mai – 20 juin", element: "Air" },
  { slug: "cancer", name: "Cancer", glyph: "♋", dates: "21 juin – 22 juillet", element: "Eau" },
  { slug: "lion", name: "Lion", glyph: "♌", dates: "23 juillet – 22 août", element: "Feu" },
  { slug: "vierge", name: "Vierge", glyph: "♍", dates: "23 août – 22 septembre", element: "Terre" },
  { slug: "balance", name: "Balance", glyph: "♎", dates: "23 septembre – 22 octobre", element: "Air" },
  { slug: "scorpion", name: "Scorpion", glyph: "♏", dates: "23 octobre – 21 novembre", element: "Eau" },
  { slug: "sagittaire", name: "Sagittaire", glyph: "♐", dates: "22 novembre – 21 décembre", element: "Feu" },
  { slug: "capricorne", name: "Capricorne", glyph: "♑", dates: "22 décembre – 19 janvier", element: "Terre" },
  { slug: "verseau", name: "Verseau", glyph: "♒", dates: "20 janvier – 18 février", element: "Air" },
  { slug: "poissons", name: "Poissons", glyph: "♓", dates: "19 février – 20 mars", element: "Eau" },
];

const elementColor: Record<string, string> = {
  Feu: "#ef4444",
  Terre: "#22c55e",
  Air: "#60a5fa",
  Eau: "#a78bfa",
};

export const metadata: Metadata = {
  title: "Les 12 signes du zodiaque — Ciel Natal",
  description:
    "Explorez les 12 signes du zodiaque : personnalité, forces, défis, amour et travail. Astrologie psychologique inspirée de Jung et Liz Greene.",
  keywords: [
    "signes du zodiaque",
    "astrologie",
    "horoscope",
    "thème astral",
    "personnalité astrologique",
  ],
  openGraph: {
    title: "Les 12 signes du zodiaque — Ciel Natal",
    description:
      "Explorez les 12 signes du zodiaque : personnalité, forces, défis, amour et travail.",
  },
};

export default function SignesIndex() {
  return (
    <PageShell title="Les 12 signes du zodiaque">
      <p className="text-[var(--color-text-secondary)] mb-6">
        Chaque signe du zodiaque porte en lui un archétype psychologique unique.
        Explorez les douze visages de la roue zodiacale pour mieux comprendre
        les dynamiques profondes qui animent votre personnalité, vos relations
        et votre chemin de vie.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {signs.map((s) => (
          <Link
            key={s.slug}
            href={`/signe/${s.slug}`}
            className="glass p-4 flex flex-col items-center gap-2 hover:border-[var(--color-accent-lavender)] transition group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">
              {s.glyph}
            </span>
            <span className="font-cinzel text-sm text-[var(--color-text-primary)]">
              {s.name}
            </span>
            <span className="text-[10px] text-[var(--color-text-secondary)]">
              {s.dates}
            </span>
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full"
              style={{
                color: elementColor[s.element],
                border: `1px solid ${elementColor[s.element]}40`,
              }}
            >
              {s.element}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-lg bg-[var(--color-accent-lavender)] text-white font-cinzel text-sm hover:opacity-90 transition"
        >
          Calcule ta carte du ciel gratuitement
        </Link>
      </div>
    </PageShell>
  );
}
