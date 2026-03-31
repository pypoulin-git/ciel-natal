"use client";

import { PlanetPosition } from "@/lib/astro";

const ELEMENT_MAP: Record<string, string> = {
  Belier: "Feu", Taureau: "Terre", Gemeaux: "Air", Cancer: "Eau",
  Lion: "Feu", Vierge: "Terre", Balance: "Air", Scorpion: "Eau",
  Sagittaire: "Feu", Capricorne: "Terre", Verseau: "Air", Poissons: "Eau",
};

const MODALITY_MAP: Record<string, string> = {
  Belier: "Cardinal", Taureau: "Fixe", Gemeaux: "Mutable", Cancer: "Cardinal",
  Lion: "Fixe", Vierge: "Mutable", Balance: "Cardinal", Scorpion: "Fixe",
  Sagittaire: "Mutable", Capricorne: "Cardinal", Verseau: "Fixe", Poissons: "Mutable",
};

const ELEMENT_CONFIG = {
  Feu: { color: "#f97316", desc: "Energie, passion, initiative" },
  Terre: { color: "#22c55e", desc: "Stabilite, concret, patience" },
  Air: { color: "#60a5fa", desc: "Pensee, communication, idees" },
  Eau: { color: "#8b5cf6", desc: "Emotions, intuition, empathie" },
};

const MODALITY_CONFIG = {
  Cardinal: { color: "#ef4444", desc: "Initier, lancer, diriger" },
  Fixe: { color: "#eab308", desc: "Perseverer, stabiliser, ancrer" },
  Mutable: { color: "#06b6d4", desc: "Adapter, transformer, connecter" },
};

interface Props {
  planets: PlanetPosition[];
}

export default function ElementBalance({ planets }: Props) {
  const allPlanets = planets;

  const elementCount: Record<string, number> = { Feu: 0, Terre: 0, Air: 0, Eau: 0 };
  const modalityCount: Record<string, number> = { Cardinal: 0, Fixe: 0, Mutable: 0 };
  const elementPlanets: Record<string, string[]> = { Feu: [], Terre: [], Air: [], Eau: [] };
  const modalityPlanets: Record<string, string[]> = { Cardinal: [], Fixe: [], Mutable: [] };

  for (const p of allPlanets) {
    const el = ELEMENT_MAP[p.sign];
    const mod = MODALITY_MAP[p.sign];
    if (el) {
      elementCount[el]++;
      elementPlanets[el].push(p.symbol);
    }
    if (mod) {
      modalityCount[mod]++;
      modalityPlanets[mod].push(p.symbol);
    }
  }

  const total = allPlanets.length;
  const dominant = Object.entries(elementCount).sort((a, b) => b[1] - a[1])[0];
  const weakest = Object.entries(elementCount).sort((a, b) => a[1] - b[1])[0];
  const dominantMod = Object.entries(modalityCount).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-8">
      {/* Intro */}
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
        Les quatre elements et trois modalites revelent la dynamique
        fondamentale de ton theme. Les elements decrivent ta nature
        energetique, les modalites ta maniere d&apos;agir dans le monde.
      </p>

      {/* Element bars */}
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)] mb-5">
          Elements
        </h3>
        <div className="space-y-4 stagger-in">
          {(["Feu", "Terre", "Air", "Eau"] as const).map((el) => {
            const config = ELEMENT_CONFIG[el];
            const count = elementCount[el];
            const pct = Math.round((count / total) * 100);
            return (
              <div key={el}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="block w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: config.color, boxShadow: `0 0 6px ${config.color}50` }}
                    />
                    <span className="text-sm text-[var(--color-text-primary)]">{el}</span>
                    <span className="text-[10px] text-[var(--color-text-secondary)] hidden sm:inline">
                      {config.desc}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-[var(--color-text-secondary)]">
                      {count}/{total}
                    </span>
                    <span
                      className="font-mono text-[11px] font-medium tabular-nums"
                      style={{ color: config.color }}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${config.color}40, ${config.color}cc)`,
                      boxShadow: `inset 0 0 4px ${config.color}30, 0 0 6px ${config.color}20`,
                    }}
                  />
                </div>
                {elementPlanets[el].length > 0 && (
                  <div className="flex gap-1.5 mt-1.5">
                    {elementPlanets[el].map((sym, i) => (
                      <span
                        key={i}
                        className="text-[11px] opacity-40"
                      >
                        {sym}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modality bars */}
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)] mb-5">
          Modalites
        </h3>
        <div className="space-y-4 stagger-in">
          {(["Cardinal", "Fixe", "Mutable"] as const).map((mod) => {
            const config = MODALITY_CONFIG[mod];
            const count = modalityCount[mod];
            const pct = Math.round((count / total) * 100);
            return (
              <div key={mod}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="block w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: config.color, boxShadow: `0 0 6px ${config.color}50` }}
                    />
                    <span className="text-sm text-[var(--color-text-primary)]">{mod}</span>
                    <span className="text-[10px] text-[var(--color-text-secondary)]">
                      {config.desc}
                    </span>
                  </div>
                  <span
                    className="font-mono text-[11px] font-medium tabular-nums"
                    style={{ color: config.color }}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${config.color}40, ${config.color}cc)`,
                      boxShadow: `inset 0 0 4px ${config.color}30, 0 0 6px ${config.color}20`,
                    }}
                  />
                </div>
                {modalityPlanets[mod].length > 0 && (
                  <div className="flex gap-1.5 mt-1.5">
                    {modalityPlanets[mod].map((sym, i) => (
                      <span
                        key={i}
                        className="text-[11px] opacity-40"
                      >
                        {sym}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Insight */}
      <div className="border-l-2 border-[var(--color-accent-lavender)]/30 pl-4 py-1">
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          Ton theme est domine par l&apos;element{" "}
          <strong
            className="font-medium"
            style={{ color: ELEMENT_CONFIG[dominant[0] as keyof typeof ELEMENT_CONFIG].color }}
          >
            {dominant[0]}
          </strong>{" "}
          <span className="font-mono text-[11px]">({dominant[1]})</span>{" "}
          — {ELEMENT_CONFIG[dominant[0] as keyof typeof ELEMENT_CONFIG].desc.toLowerCase()}.
          {weakest[1] === 0 ? (
            <> L&apos;absence de {weakest[0]} t&apos;invite a developper consciemment ces qualites : {ELEMENT_CONFIG[weakest[0] as keyof typeof ELEMENT_CONFIG].desc.toLowerCase()}.</>
          ) : weakest[1] <= 1 ? (
            <> L&apos;element {weakest[0]} est peu present — une invitation a explorer {ELEMENT_CONFIG[weakest[0] as keyof typeof ELEMENT_CONFIG].desc.toLowerCase()}.</>
          ) : null}
        </p>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mt-2">
          Modalite dominante :{" "}
          <strong
            className="font-medium"
            style={{ color: MODALITY_CONFIG[dominantMod[0] as keyof typeof MODALITY_CONFIG].color }}
          >
            {dominantMod[0]}
          </strong>{" "}
          — tu tends naturellement a {MODALITY_CONFIG[dominantMod[0] as keyof typeof MODALITY_CONFIG].desc.toLowerCase()}.
        </p>
      </div>
    </div>
  );
}
