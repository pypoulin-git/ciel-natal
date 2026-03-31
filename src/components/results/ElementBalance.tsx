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
  Feu: { color: "#f97316", icon: "🔥", desc: "Énergie, passion, initiative" },
  Terre: { color: "#22c55e", icon: "🌿", desc: "Stabilité, concret, patience" },
  Air: { color: "#60a5fa", icon: "💨", desc: "Pensée, communication, idées" },
  Eau: { color: "#8b5cf6", icon: "🌊", desc: "Émotions, intuition, empathie" },
};

const MODALITY_CONFIG = {
  Cardinal: { color: "#ef4444", desc: "Initier, lancer, diriger" },
  Fixe: { color: "#eab308", desc: "Persévérer, stabiliser, ancrer" },
  Mutable: { color: "#06b6d4", desc: "Adapter, transformer, connecter" },
};

interface Props {
  planets: PlanetPosition[];
  onTapElement?: (element: string) => void;
}

export default function ElementBalance({ planets, onTapElement }: Props) {
  // Count personal planets only (Sun through Saturn) for more meaningful balance
  const personalPlanets = planets.slice(0, 7);
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
    <div className="space-y-6">
      {/* Element bars */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)] mb-4">Répartition des éléments</h3>
        <div className="space-y-3">
          {(["Feu", "Terre", "Air", "Eau"] as const).map((el) => {
            const config = ELEMENT_CONFIG[el];
            const count = elementCount[el];
            const pct = Math.round((count / total) * 100);
            return (
              <button
                key={el}
                className="w-full text-left group"
                onClick={() => onTapElement?.(el)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{config.icon}</span>
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">{el}</span>
                    <span className="text-[10px] text-[var(--color-text-secondary)] hidden sm:inline">{config.desc}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-text-secondary)] font-mono">{count}/{total}</span>
                    <span className="text-xs font-mono" style={{ color: config.color }}>{pct}%</span>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${config.color}80, ${config.color})`,
                      boxShadow: `0 0 8px ${config.color}40`,
                    }}
                  />
                </div>
                <div className="flex gap-1 mt-1">
                  {elementPlanets[el].map((sym, i) => (
                    <span key={i} className="text-xs opacity-60">{sym}</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modality bars */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)] mb-4">Répartition des modalités</h3>
        <div className="space-y-3">
          {(["Cardinal", "Fixe", "Mutable"] as const).map((mod) => {
            const config = MODALITY_CONFIG[mod];
            const count = modalityCount[mod];
            const pct = Math.round((count / total) * 100);
            return (
              <div key={mod}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">{mod}</span>
                    <span className="text-[10px] text-[var(--color-text-secondary)]">{config.desc}</span>
                  </div>
                  <span className="text-xs font-mono" style={{ color: config.color }}>{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${config.color}80, ${config.color})`,
                    }}
                  />
                </div>
                <div className="flex gap-1 mt-1">
                  {modalityPlanets[mod].map((sym, i) => (
                    <span key={i} className="text-xs opacity-60">{sym}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insight text */}
      <div className="glass p-4 text-sm text-[var(--color-text-primary)] leading-relaxed">
        <p>
          Ton thème est dominé par l&apos;élément <strong style={{ color: ELEMENT_CONFIG[dominant[0] as keyof typeof ELEMENT_CONFIG].color }}>{dominant[0]}</strong> ({dominant[1]} planètes) — {ELEMENT_CONFIG[dominant[0] as keyof typeof ELEMENT_CONFIG].desc.toLowerCase()}.
          {weakest[1] === 0 ? (
            <> L&apos;absence d&apos;élément {weakest[0]} dans ta carte t&apos;invite à développer consciemment ces qualités : {ELEMENT_CONFIG[weakest[0] as keyof typeof ELEMENT_CONFIG].desc.toLowerCase()}.</>
          ) : weakest[1] <= 1 ? (
            <> L&apos;élément {weakest[0]} est peu présent — une invitation à explorer {ELEMENT_CONFIG[weakest[0] as keyof typeof ELEMENT_CONFIG].desc.toLowerCase()}.</>
          ) : null}
        </p>
        <p className="mt-2">
          Ta modalité dominante est <strong style={{ color: MODALITY_CONFIG[dominantMod[0] as keyof typeof MODALITY_CONFIG].color }}>{dominantMod[0]}</strong> — tu tends naturellement à {MODALITY_CONFIG[dominantMod[0] as keyof typeof MODALITY_CONFIG].desc.toLowerCase()}.
        </p>
      </div>
    </div>
  );
}
