"use client";

import Link from "next/link";
import { SignIcon, ElementGlyph, ModalityGlyph } from "@/components/AstroIcons";
import { useLocale } from "@/lib/i18n";
import { signMeta } from "@/lib/signMeta";
import type { SignDataBilingual } from "@/data/signs-data";
import { elementColor } from "@/data/signs-data";

// Zodiac order for prev/next navigation + canonical (accent-free) keys for signMeta.
const ORDER = ["belier", "taureau", "gemeaux", "cancer", "lion", "vierge", "balance", "scorpion", "sagittaire", "capricorne", "verseau", "poissons"];
const SLUG_TO_KEY: Record<string, string> = {
  belier: "Belier", taureau: "Taureau", gemeaux: "Gemeaux", cancer: "Cancer",
  lion: "Lion", vierge: "Vierge", balance: "Balance", scorpion: "Scorpion",
  sagittaire: "Sagittaire", capricorne: "Capricorne", verseau: "Verseau", poissons: "Poissons",
};
const SLUG_NAME_FR: Record<string, string> = {
  belier: "Bélier", taureau: "Taureau", gemeaux: "Gémeaux", cancer: "Cancer",
  lion: "Lion", vierge: "Vierge", balance: "Balance", scorpion: "Scorpion",
  sagittaire: "Sagittaire", capricorne: "Capricorne", verseau: "Verseau", poissons: "Poissons",
};
const SLUG_NAME_EN: Record<string, string> = {
  belier: "Aries", taureau: "Taurus", gemeaux: "Gemini", cancer: "Cancer",
  lion: "Leo", vierge: "Virgo", balance: "Libra", scorpion: "Scorpio",
  sagittaire: "Sagittarius", capricorne: "Capricorn", verseau: "Aquarius", poissons: "Pisces",
};

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
  const keyword = signMeta(SLUG_TO_KEY[sign.slug] ?? "", locale)?.keyword ?? "";

  return (
    <>
      {/* Hero — element-themed */}
      <div
        className="glass p-6 sm:p-8 mb-8 flex flex-col items-center text-center"
        style={{ boxShadow: `0 0 36px ${elColor}1f, 0 0 72px ${elColor}12` }}
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: `${elColor}1a`, boxShadow: `0 0 28px ${elColor}30` }}
        >
          <SignIcon name={sign.nameFr} size={46} color={elColor} glow />
        </div>
        {keyword && (
          <p className="text-base text-[var(--color-text-secondary)] italic mb-5">{keyword}</p>
        )}
        <div className="flex flex-wrap gap-2.5 justify-center">
          <span className="inline-flex items-center text-xs font-mono px-3 py-1.5 rounded-full border border-[var(--color-glass-border)] text-[var(--color-text-secondary)]">
            {dates}
          </span>
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ color: elColor, border: `1px solid ${elColor}55`, background: `${elColor}12` }}
          >
            <ElementGlyph element={sign.elementFr} size={14} color={elColor} />
            {element}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-[var(--color-accent-lavender)]/30 text-[var(--color-accent-lavender)] bg-[var(--color-accent-lavender)]/8">
            <ModalityGlyph modality={sign.modalityFr} size={14} color="var(--color-accent-lavender)" />
            {modality}
          </span>
          <span className="inline-flex items-center text-xs font-mono px-3 py-1.5 rounded-full border border-[var(--color-glass-border)] text-[var(--color-text-secondary)]">
            {fr ? "Régi par " : "Ruled by "}{planet}
          </span>
        </div>
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
          href="/carte-natale"
          className="inline-block px-6 py-3 min-h-[48px] rounded-lg bg-[var(--color-accent-lavender)] text-white font-cinzel text-sm hover:opacity-90 transition"
        >
          {fr ? `Calcule ton thème natal complet` : `Calculate your full birth chart`}
        </Link>
      </div>

      {/* Prev / next sign navigation (circular) */}
      {(() => {
        const idx = ORDER.indexOf(sign.slug);
        if (idx === -1) return null;
        const prev = ORDER[(idx - 1 + ORDER.length) % ORDER.length];
        const next = ORDER[(idx + 1) % ORDER.length];
        const name = (s: string) => (fr ? SLUG_NAME_FR[s] : SLUG_NAME_EN[s]);
        return (
          <div className="grid grid-cols-2 gap-3 mt-8">
            <Link
              href={`/signe/${prev}`}
              className="group flex items-center gap-3 rounded-xl border border-[var(--color-glass-border)] bg-white/[0.02] p-4 hover:border-[var(--color-accent-lavender)]/40 hover:bg-white/[0.04] transition"
            >
              <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-lavender)] transition">←</span>
              <SignIcon name={SLUG_NAME_FR[prev]} size={22} color="var(--color-accent-lavender)" />
              <span>
                <span className="block text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] opacity-60">{fr ? "Précédent" : "Previous"}</span>
                <span className="block text-sm text-[var(--color-text-primary)]">{name(prev)}</span>
              </span>
            </Link>
            <Link
              href={`/signe/${next}`}
              className="group flex items-center justify-end gap-3 text-right rounded-xl border border-[var(--color-glass-border)] bg-white/[0.02] p-4 hover:border-[var(--color-accent-lavender)]/40 hover:bg-white/[0.04] transition"
            >
              <span>
                <span className="block text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] opacity-60">{fr ? "Suivant" : "Next"}</span>
                <span className="block text-sm text-[var(--color-text-primary)]">{name(next)}</span>
              </span>
              <SignIcon name={SLUG_NAME_FR[next]} size={22} color="var(--color-accent-lavender)" />
              <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-lavender)] transition">→</span>
            </Link>
          </div>
        );
      })()}

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
