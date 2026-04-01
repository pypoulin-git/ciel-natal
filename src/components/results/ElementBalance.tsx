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
  Feu: { desc: "Energie, passion, initiative", intensity: 1.0 },
  Terre: { desc: "Stabilite, concret, patience", intensity: 0.7 },
  Air: { desc: "Pensee, communication, idees", intensity: 0.5 },
  Eau: { desc: "Emotions, intuition, empathie", intensity: 0.85 },
};

const MODALITY_CONFIG = {
  Cardinal: { desc: "Initier, lancer, diriger" },
  Fixe: { desc: "Perseverer, stabiliser, ancrer" },
  Mutable: { desc: "Adapter, transformer, connecter" },
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
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
        Les quatre elements et trois modalites revelent la dynamique
        fondamentale de ton theme. Les elements decrivent ta nature
        energetique, les modalites ta maniere d&apos;agir dans le monde.
      </p>

      <div>
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)] mb-5">
          Elements
        </h3>
        <div className="space-y-4 stagger-in">
          {(["Feu", "Terre", "Air", "Eau"] as const).map((el) => {
            const config = ELEMENT_CONFIG[el];
            const count = elementCount[el];
            const pct = Math.round((count / total) * 100);
            const isDominant = el === dominant[0];
            return (
              <div key={el}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="block w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: isDominant ? "var(--color-accent-lavender)" : "rgba(168,158,200,0.3)",
                      }}
                    />
                    <span className={`text-sm ${isDominant ? "text-[var(--color-text-primary)] font-medium" : "text-[var(--color-text-secondary)]"}`}>{el}</span>
                    <span className="text-[10px] text-[var(--color-text-secondary)] hidden sm:inline">
                      {config.desc}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-[var(--color-text-secondary)]">
                      {count}/{total}
                    </span>
                    <span className={`font-mono text-[11px] font-medium tabular-nums ${isDominant ? "text-[var(--color-accent-lavender)]" : "text-[var(--color-text-secondary)]"}`}>
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: isDominant
                        ? "linear-gradient(90deg, rgba(168,158,200,0.3), rgba(168,158,200,0.7))"
                        : "linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.15))",
                      boxShadow: isDominant ? "0 0 8px rgba(168,158,200,0.15)" : "none",
                    }}
                  />
                </div>
                {elementPlanets[el].length > 0 && (
                  <div className="flex gap-1.5 mt-1.5">
                    {elementPlanets[el].map((sym, i) => (
                      <span key={i} className="text-[11px] opacity-40">{sym}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)] mb-5">
          Modalites
        </h3>
        <div className="space-y-4 stagger-in">
          {(["Cardinal", "Fixe", "Mutable"] as const).map((mod) => {
            const count = modalityCount[mod];
            const pct = Math.round((count / total) * 100);
            const isDominant = mod === dominantMod[0];
            return (
              <div key={mod}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="block w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: isDominant ? "var(--color-accent-lavender)" : "rgba(168,158,200,0.3)",
                      }}
                    />
                    <span className={`text-sm ${isDominant ? "text-[var(--color-text-primary)] font-medium" : "text-[var(--color-text-secondary)]"}`}>{mod}</span>
                    <span className="text-[10px] text-[var(--color-text-secondary)]">
                      {MODALITY_CONFIG[mod].desc}
                    </span>
                  </div>
                  <span className={`font-mono text-[11px] font-medium tabular-nums ${isDominant ? "text-[var(--color-accent-lavender)]" : "text-[var(--color-text-secondary)]"}`}>
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: isDominant
                        ? "linear-gradient(90deg, rgba(168,158,200,0.3), rgba(168,158,200,0.7))"
                        : "linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.15))",
                      boxShadow: isDominant ? "0 0 8px rgba(168,158,200,0.15)" : "none",
                    }}
                  />
                </div>
                {modalityPlanets[mod].length > 0 && (
                  <div className="flex gap-1.5 mt-1.5">
                    {modalityPlanets[mod].map((sym, i) => (
                      <span key={i} className="text-[11px] opacity-40">{sym}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-l-2 border-[var(--color-accent-lavender)]/20 pl-4 py-1">
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          Ton theme est domine par l&apos;element{" "}
          <strong className="font-medium text-[var(--color-text-primary)]">
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
          <strong className="font-medium text-[var(--color-text-primary)]">
            {dominantMod[0]}
          </strong>{" "}
          — tu tends naturellement a {MODALITY_CONFIG[dominantMod[0] as keyof typeof MODALITY_CONFIG].desc.toLowerCase()}.
        </p>
      </div>
    </div>
  );
}
