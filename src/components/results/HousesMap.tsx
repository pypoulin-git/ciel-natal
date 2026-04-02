"use client";

import { useState } from "react";
import { PlanetPosition } from "@/lib/astro";
import { houseDescriptions as houseDescFr, planetInHouse as pihFr } from "@/data/interpretations";
import { houseDescriptions as houseDescEn, planetInHouse as pihEn } from "@/data/interpretations-en";

interface Props {
  planets: PlanetPosition[];
  locale?: string;
}

export default function HousesMap({ planets, locale = "fr" }: Props) {
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
      if (next.has(house)) {
        next.delete(house);
      } else {
        next.add(house);
      }
      return next;
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--color-text-secondary)] mb-4">
        {locale === "en" ? "Open each house to explore its influence in your life." : "Ouvre chaque maison pour explorer son influence dans ta vie."}
      </p>

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
              {/* Collapsed header — always visible */}
              <button
                onClick={() => toggle(h)}
                className="w-full flex items-center gap-3 p-3 text-left cursor-pointer select-none"
              >
                {/* House number badge */}
                <span
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-semibold ${
                    hasOccupants
                      ? "bg-[var(--color-accent-lavender)]/15 text-[var(--color-accent-lavender)]"
                      : "bg-white/5 text-[var(--color-text-secondary)]"
                  }`}
                >
                  M{h}
                </span>

                {/* Domain name */}
                <span className="flex-1 text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {desc?.domain}
                </span>

                {/* Planet symbols (collapsed) */}
                {hasOccupants && (
                  <span className="flex gap-1 flex-shrink-0 mr-1">
                    {occupants.map((p) => (
                      <span
                        key={p.name}
                        className="text-sm text-[var(--color-accent-gold)]"
                        title={p.name}
                      >
                        {p.symbol}
                      </span>
                    ))}
                  </span>
                )}

                {/* Chevron */}
                <svg
                  className={`w-4 h-4 flex-shrink-0 text-[var(--color-text-secondary)] transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expandable content */}
              <div
                className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
                style={{ maxHeight: isOpen ? "2000px" : "0px" }}
              >
                <div className="px-3 pb-3 pt-0 space-y-3">
                  {/* House description */}
                  {desc && (
                    <div className="border-t border-[var(--color-glass-border)] pt-3">
                      <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                        {desc.name}
                      </p>
                      <p className="text-xs leading-relaxed text-[var(--color-text-primary)] opacity-80">
                        {desc.description}
                      </p>
                    </div>
                  )}

                  {/* Planet-in-house interpretations */}
                  {hasOccupants &&
                    occupants.map((p) => {
                      const interpretation = planetInHouse[p.name]?.[h];
                      if (!interpretation) return null;

                      return (
                        <div
                          key={p.name}
                          className="rounded-lg bg-white/[0.03] border border-[var(--color-glass-border)] p-3"
                        >
                          <p className="text-xs font-semibold text-[var(--color-accent-gold)] mb-1">
                            {p.symbol} {p.name} {locale === "en" ? "in house" : "en maison"} {h}
                          </p>
                          <p className="text-xs leading-relaxed text-[var(--color-text-primary)] opacity-80">
                            {interpretation}
                          </p>
                        </div>
                      );
                    })}

                  {/* Empty house note */}
                  {!hasOccupants && (
                    <p className="text-[10px] text-[var(--color-text-secondary)] opacity-50 pb-1">
                      {locale === "en"
                        ? "No planet in this house — its influence is expressed through the sign on its cusp."
                        : "Aucune planete dans cette maison — son influence s'exprime par le signe sur sa cuspide."}
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
