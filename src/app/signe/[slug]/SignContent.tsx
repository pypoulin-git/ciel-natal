"use client";

import Link from "next/link";
import { SignIcon } from "@/components/AstroIcons";
import { useLocale } from "@/lib/i18n";
import type { SignDataBilingual } from "@/data/signs-data";
import { elementColor } from "@/data/signs-data";

export default function SignContent({ sign }: { sign: SignDataBilingual }) {
  const { locale } = useLocale();
  const fr = locale === "fr";

  const name = fr ? sign.nameFr : sign.nameEn;
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
            <h3 className="text-sm font-semibold text-red-400 mb-2">
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

      {/* CTA */}
      <div className="mt-4 text-center">
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-lg bg-[var(--color-accent-lavender)] text-white font-cinzel text-sm hover:opacity-90 transition"
        >
          {fr ? "Calcule ta carte du ciel gratuitement" : "Calculate your natal chart for free"}
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
