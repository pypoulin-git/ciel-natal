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

const ELEMENT_CONFIG_FR = {
  Feu: { desc: "Énergie, passion, initiative" },
  Terre: { desc: "Stabilité, concret, patience" },
  Air: { desc: "Pensée, communication, idées" },
  Eau: { desc: "Émotions, intuition, empathie" },
};

const ELEMENT_CONFIG_EN = {
  Feu: { desc: "Energy, passion, initiative" },
  Terre: { desc: "Stability, practicality, patience" },
  Air: { desc: "Thought, communication, ideas" },
  Eau: { desc: "Emotions, intuition, empathy" },
};

const ELEMENT_NAMES_EN: Record<string, string> = { Feu: "Fire", Terre: "Earth", Air: "Air", Eau: "Water" };

const MODALITY_CONFIG_FR = {
  Cardinal: { desc: "Initier, lancer, diriger" },
  Fixe: { desc: "Persévérer, stabiliser, ancrer" },
  Mutable: { desc: "Adapter, transformer, connecter" },
};

const MODALITY_CONFIG_EN = {
  Cardinal: { desc: "Initiate, launch, lead" },
  Fixe: { desc: "Persevere, stabilise, anchor" },
  Mutable: { desc: "Adapt, transform, connect" },
};

const MODALITY_NAMES_EN: Record<string, string> = { Cardinal: "Cardinal", Fixe: "Fixed", Mutable: "Mutable" };

interface Props {
  planets: PlanetPosition[];
  locale?: string;
}

export default function ElementBalance({ planets, locale = "fr" }: Props) {
  const isFr = locale === "fr";
  const ELEMENT_CONFIG = isFr ? ELEMENT_CONFIG_FR : ELEMENT_CONFIG_EN;
  const MODALITY_CONFIG = isFr ? MODALITY_CONFIG_FR : MODALITY_CONFIG_EN;
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
        {isFr
          ? "Les quatre éléments et trois modalités révèlent la dynamique fondamentale de ton thème. Les éléments décrivent ta nature énergétique, les modalités ta manière d'agir dans le monde."
          : "The four elements and three modalities reveal the fundamental dynamic of your chart. The elements describe your energetic nature, the modalities your way of acting in the world."}
      </p>

      <div>
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)] mb-5">
          {isFr ? "Éléments" : "Elements"}
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
                    <span className={`text-sm ${isDominant ? "text-[var(--color-text-primary)] font-medium" : "text-[var(--color-text-secondary)]"}`}>{isFr ? el : ELEMENT_NAMES_EN[el]}</span>
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
          {isFr ? "Modalités" : "Modalities"}
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
                    <span className={`text-sm ${isDominant ? "text-[var(--color-text-primary)] font-medium" : "text-[var(--color-text-secondary)]"}`}>{isFr ? mod : MODALITY_NAMES_EN[mod]}</span>
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
          {isFr ? "Ton thème est dominé par l'élément" : "Your chart is dominated by the element"}{" "}
          <strong className="font-medium text-[var(--color-text-primary)]">
            {isFr ? dominant[0] : ELEMENT_NAMES_EN[dominant[0]]}
          </strong>{" "}
          <span className="font-mono text-[11px]">({dominant[1]})</span>{" "}
          — {ELEMENT_CONFIG[dominant[0] as keyof typeof ELEMENT_CONFIG_FR].desc.toLowerCase()}.
          {weakest[1] === 0 ? (
            <> {isFr ? `L'absence de ${weakest[0]} t'invite à développer consciemment ces qualités` : `The absence of ${ELEMENT_NAMES_EN[weakest[0]]} invites you to consciously develop these qualities`} : {ELEMENT_CONFIG[weakest[0] as keyof typeof ELEMENT_CONFIG_FR].desc.toLowerCase()}.</>
          ) : weakest[1] <= 1 ? (
            <> {isFr ? `L'élément ${weakest[0]} est peu présent` : `${ELEMENT_NAMES_EN[weakest[0]]} is barely present`} — {isFr ? "une invitation à explorer" : "an invitation to explore"} {ELEMENT_CONFIG[weakest[0] as keyof typeof ELEMENT_CONFIG_FR].desc.toLowerCase()}.</>
          ) : null}
        </p>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mt-2">
          {isFr ? "Modalité dominante" : "Dominant modality"} :{" "}
          <strong className="font-medium text-[var(--color-text-primary)]">
            {isFr ? dominantMod[0] : MODALITY_NAMES_EN[dominantMod[0]]}
          </strong>{" "}
          — {isFr ? "tu tends naturellement à" : "you naturally tend to"} {MODALITY_CONFIG[dominantMod[0] as keyof typeof MODALITY_CONFIG_FR].desc.toLowerCase()}.
        </p>
      </div>
    </div>
  );
}
