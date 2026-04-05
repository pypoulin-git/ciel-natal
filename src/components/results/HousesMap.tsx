"use client";

import { useState } from "react";
import { PlanetPosition } from "@/lib/astro";
import { PlanetIcon } from "@/components/AstroIcons";
import { houseDescriptions as houseDescFr, planetInHouse as pihFr } from "@/data/interpretations";
import { houseDescriptions as houseDescEn, planetInHouse as pihEn } from "@/data/interpretations-en";
import { genderize, Genre } from "@/lib/chartHelpers";

interface Props {
  planets: PlanetPosition[];
  locale?: string;
  genre?: Genre;
}

export default function HousesMap({ planets, locale = "fr", genre = "femme" }: Props) {
  const houseDescriptions = locale === "en" ? houseDescEn : houseDescFr;
  const planetInHouse = locale === "en" ? pihEn : pihFr;
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Group planets by house
  const houseOccupants: Record<number, PlanetPosition[]> = {};
  for (let i = 1; i <= 12; i++) houseOccupants[i] = [];
  for (const p of planets) {
    if (p.house) houseOccupants[p.house].push(p);
  }

  const toggle = (house: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(house) ? next.delete(house) : next.add(house);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
          const desc = houseDescriptions[h];
          const occupants = houseOccupants[h];
          const hasOccupants = occupants.length > 0;
          const isOpen = expanded.has(h);

          return (
            <div
              key={h}
              className={`rounded-xl border transition-colors ${
                hasOccupants
                  ? "border-[var(--color-accent-lavender)]/30 bg-[var(--color-accent-lavender)]/5"
                  : "border-[var(--color-glass-border)] bg-white/[0.02]"
              }`}
              style={
                hasOccupants
                  ? { borderLeftWidth: "3px", borderLeftColor: "var(--color-accent-lavender)" }
                  : undefined
              }
            >
              {/* Header */}
              <button
                onClick={() => toggle(h)}
                className="w-full flex items-center gap-3 p-3 sm:p-4 text-left cursor-pointer select-none"
              >
                <span
                  className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-mono text-xs font-semibold ${
                    hasOccupants
                      ? "bg-[var(--color-accent-lavender)]/15 text-[var(--color-accent-lavender)]"
                      : "bg-white/5 text-[var(--color-text-secondary)]"
                  }`}
                >
                  M{h}
                </span>

                <div className="flex-1 min-w-0">
                  <span className="text-base font-medium text-[var(--color-text-primary)] truncate block">
                    {desc?.domain}
                  </span>
                  {desc?.name && (
                    <span className="text-xs text-[var(--color-text-secondary)] block mt-0.5">{desc.name}</span>
                  )}
                </div>

                {hasOccupants && (
                  <span className="flex gap-1.5 flex-shrink-0 mr-1">
                    {occupants.map((p) => (
                      <PlanetIcon key={p.name} name={p.name} size={16} color="var(--color-accent-gold)" />
                    ))}
                  </span>
                )}

                <svg
                  className={`w-4 h-4 flex-shrink-0 text-[var(--color-text-secondary)] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded content */}
              <div
                className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
                style={{ maxHeight: isOpen ? "2000px" : "0px" }}
              >
                <div className="px-3 sm:px-4 pb-4 pt-0 space-y-3">
                  {/* ── Step 1: EXPLAIN the house concept ── */}
                  {desc && (
                    <div className="rounded-lg bg-white/[0.04] border border-white/5 p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">
                          {locale === "en" ? "What is this house?" : "Qu'est-ce que cette maison ?"}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-[var(--color-text-primary)] opacity-85">
                        {genderize(desc.description, genre)}
                      </p>
                    </div>
                  )}

                  {/* ── Step 2: INTERPRET — personal planet placements ── */}
                  {hasOccupants && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-lavender)]">
                        {locale === "en" ? "For you" : "Pour toi"}
                      </span>
                      {occupants.map((p) => {
                        const interpretation = planetInHouse[p.name]?.[h];
                        if (!interpretation) return null;
                        return (
                          <div key={p.name} className="rounded-lg bg-[var(--color-accent-lavender)]/5 border border-[var(--color-accent-lavender)]/15 p-3 sm:p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <PlanetIcon name={p.name} size={16} color="var(--color-accent-lavender)" />
                              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                {p.name} {locale === "en" ? "in house" : "en maison"} {h}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed text-[var(--color-text-primary)] opacity-85">
                              {genderize(interpretation, genre)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Empty house */}
                  {!hasOccupants && (
                    <p className="text-xs text-[var(--color-text-secondary)] opacity-60 italic pb-1">
                      {locale === "en"
                        ? "No planet in this house — its themes express themselves more subtly through the sign on its cusp."
                        : "Aucune planète dans cette maison — ses thèmes s'expriment plus subtilement à travers le signe sur sa cuspide."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
