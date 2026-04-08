"use client";

import Link from "next/link";
import { SignIcon } from "@/components/AstroIcons";
import { useLocale } from "@/lib/i18n";
import type { SignDataBilingual } from "@/data/signs-data";
import { elementColor } from "@/data/signs-data";

// Best / challenging pairings per element (traditional compatibility)
const COMPAT: Record<string, { best: string[]; challenge: string[] }> = {
  Feu: { best: ["Belier", "Lion", "Sagittaire", "Gemeaux", "Balance", "Verseau"], challenge: ["Cancer", "Capricorne"] },
  Terre: { best: ["Taureau", "Vierge", "Capricorne", "Cancer", "Scorpion", "Poissons"], challenge: ["Sagittaire", "Gemeaux"] },
  Air: { best: ["Gemeaux", "Balance", "Verseau", "Belier", "Lion", "Sagittaire"], challenge: ["Cancer", "Vierge"] },
  Eau: { best: ["Cancer", "Scorpion", "Poissons", "Taureau", "Vierge", "Capricorne"], challenge: ["Belier", "Verseau"] },
};

const SIGN_SLUG: Record<string, string> = {
  Belier: "belier", Taureau: "taureau", Gemeaux: "gemeaux", Cancer: "cancer",
  Lion: "lion", Vierge: "vierge", Balance: "balance", Scorpion: "scorpion",
  Sagittaire: "sagittaire", Capricorne: "capricorne", Verseau: "verseau", Poissons: "poissons",
};

const SIGN_LABEL_EN: Record<string, string> = {
  Belier: "Aries", Taureau: "Taurus", Gemeaux: "Gemini", Cancer: "Cancer",
  Lion: "Leo", Vierge: "Virgo", Balance: "Libra", Scorpion: "Scorpio",
  Sagittaire: "Sagittarius", Capricorne: "Capricorn", Verseau: "Aquarius", Poissons: "Pisces",
};

export default function SignContent({ sign }: { sign: SignDataBilingual }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const compat = COMPAT[sign.elementFr];
  const bestSigns = compat?.best.filter((s) => SIGN_SLUG[s] !== sign.slug).slice(0, 3) ?? [];
  const challengeSigns = compat?.challenge ?? [];

  const dates = fr ? sign.datesFr : sign.datesEn;
  const element = fr ? sign.elementFr : sign.elementEn;
  const modality = fr ? sign.modalityFr : sign.modalityEn;
  const planet = fr ? sign.planetFr : sign.planetEn;
  const personality = fr ? sign.personality.fr : sign.personality.en;
  const strengths = fr ? sign.strengths.fr : sign.strengths.en;
  const challenges = fr ? sign.challenges.fr : sign.challenges.en;
  const love = fr ? sign.love.fr : sign.love.en;
  const work = fr ? sign.work.fr : sign.work.en;

  const elColor = elementColor[element] ?? "#888";

  return (
    <>
      {/* Sign icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-inner">
          <SignIcon name={sign.nameFr} size={36} color="var(--color-accent-lavender)" glow />
        </div>
      </div>

      {/* Header badges */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        <span className="text-xs font-mono px-3 py-1 rounded-full border border-[var(--color-glass-border)] text-[var(--color-text-secondary)]">
          {dates}
        </span>
        <span
          className="text-xs font-mono px-3 py-1 rounded-full"
          style={{ color: elColor, border: `1px solid ${elColor}40` }}
        >
          {element}
        </span>
        <span className="text-xs font-mono px-3 py-1 rounded-full border border-[var(--color-glass-border)] text-[var(--color-text-secondary)]">
          {modality}
        </span>
        <span className="text-xs font-mono px-3 py-1 rounded-full border border-[var(--color-glass-border)] text-[var(--color-text-secondary)]">
          {planet}
        </span>
      </div>

      {/* Personality */}
      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "Personnalité" : "Personality"}
        </h2>
        {personality.map((p, i) => (
          <p key={i} className={i > 0 ? "mt-3" : ""}>{p}</p>
        ))}
      </section>

      {/* Strengths & Challenges */}
      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "Forces et défis" : "Strengths & Challenges"}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-accent-lavender)] mb-2">
              {fr ? "Forces" : "Strengths"}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-[var(--color-text-secondary)]">
              {strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-accent-rose)] mb-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 9v2m0 4h.01M4.93 19h14.14a2 2 0 001.73-3L13.73 4a2 2 0 00-3.46 0L3.2 16a2 2 0 001.73 3z" />
              </svg>
              {fr ? "Défis" : "Challenges"}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-[var(--color-text-secondary)]">
              {challenges.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Compatibility quick-grid */}
      {compat && (
        <section>
          <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
            {fr ? "Compatibilité rapide" : "Quick compatibility"}
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mb-4 opacity-70">
            {fr
              ? "Aperçu indicatif — la vraie compatibilité se lit dans la synastrie complète des deux thèmes."
              : "Indicative overview — true compatibility is read in the full synastry of both charts."}
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-[var(--color-accent-lavender)]/20 bg-[var(--color-accent-lavender)]/5 p-4">
              <h3 className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)] mb-2">
                {fr ? "Affinités naturelles" : "Natural affinities"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {bestSigns.map((s) => (
                  <Link
                    key={s}
                    href={`/signe/${SIGN_SLUG[s]}`}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/[0.03] border border-[var(--color-glass-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent-lavender)]/40 transition"
                  >
                    {fr ? s : SIGN_LABEL_EN[s]}
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--color-accent-rose)]/20 bg-[var(--color-accent-rose)]/5 p-4">
              <h3 className="text-xs uppercase tracking-widest text-[var(--color-accent-rose)] mb-2">
                {fr ? "Terrains de croissance" : "Growth ground"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {challengeSigns.map((s) => (
                  <Link
                    key={s}
                    href={`/signe/${SIGN_SLUG[s]}`}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/[0.03] border border-[var(--color-glass-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent-rose)]/40 transition"
                  >
                    {fr ? s : SIGN_LABEL_EN[s]}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/synastrie"
              className="text-xs text-[var(--color-accent-lavender)] hover:underline transition"
            >
              {fr ? "Explorer la synastrie complète →" : "Explore full synastry →"}
            </Link>
          </div>
        </section>
      )}

      {/* Love */}
      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "En amour" : "In Love"}
        </h2>
        {love.map((p, i) => (
          <p key={i} className={i > 0 ? "mt-3" : ""}>{p}</p>
        ))}
      </section>

      {/* Work */}
      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "Dans le travail" : "At Work"}
        </h2>
        {work.map((p, i) => (
          <p key={i} className={i > 0 ? "mt-3" : ""}>{p}</p>
        ))}
      </section>

      {/* Related reading */}
      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {fr ? "Pour aller plus loin" : "To go further"}
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            href="/blog/comment-lire-son-theme-natal"
            className="rounded-lg border border-[var(--color-glass-border)] bg-white/[0.02] p-4 hover:border-[var(--color-accent-lavender)]/30 transition"
          >
            <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)] mb-1">
              {fr ? "Guide" : "Guide"}
            </p>
            <p className="text-sm text-[var(--color-text-primary)]">
              {fr ? "Comment lire son thème natal" : "How to read your birth chart"}
            </p>
          </Link>
          <Link
            href="/blog/les-4-elements"
            className="rounded-lg border border-[var(--color-glass-border)] bg-white/[0.02] p-4 hover:border-[var(--color-accent-lavender)]/30 transition"
          >
            <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)] mb-1">
              {fr ? "Article" : "Article"}
            </p>
            <p className="text-sm text-[var(--color-text-primary)]">
              {fr ? `Les 4 éléments — ${sign.elementFr}` : `The 4 elements — ${sign.elementEn}`}
            </p>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="inline-block px-6 py-3 min-h-[48px] rounded-lg bg-[var(--color-accent-lavender)] text-white font-cinzel text-sm hover:opacity-90 transition"
        >
          {fr ? `Calcule ton thème natal complet` : `Calculate your full birth chart`}
        </Link>
      </div>

      {/* Navigation */}
      <div className="mt-6 text-center">
        <Link
          href="/signe"
          className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition"
        >
          {fr ? "Voir tous les signes du zodiaque" : "View all zodiac signs"}
        </Link>
      </div>
    </>
  );
}
