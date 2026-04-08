"use client";

import { PlanetPosition, translatePlanet } from "@/lib/astro";

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

const ELEMENT_CONFIG_FR: Record<string, { desc: string; icon: string; color: string; life: string }> = {
  Feu:   { desc: "Énergie, passion, initiative", icon: "🔥", color: "#ef4444", life: "Tu agis d'instinct, tu es souvent le premier à prendre une initiative. Au travail comme en amour, tu apportes une flamme et une vitalité contagieuses. Tu motives les autres et tu n'as pas peur de foncer — même quand le chemin n'est pas clair." },
  Terre: { desc: "Stabilité, concret, patience", icon: "🌿", color: "#22c55e", life: "Tu construis sur du solide. Tes amis te voient comme un roc, la personne fiable à qui on confie les clés. Au travail, tu excelles dans les projets concrets et durables. Tu as besoin de toucher, de voir les résultats de tes efforts." },
  Air:   { desc: "Pensée, communication, idées", icon: "💨", color: "#60a5fa", life: "Tu vis dans le monde des idées et des connexions. Socialement, tu relis les gens entre eux. Tu as besoin de stimulation intellectuelle — les conversations profondes sont ton carburant. L'ennui est ton pire ennemi." },
  Eau:   { desc: "Émotions, intuition, empathie", icon: "🌊", color: "#a78bfa", life: "Tu ressens tout — parfois même ce que les autres ne disent pas. Tes intuitions se révèlent souvent justes. En amour, tu cherches la profondeur et la connexion émotionnelle authentique. L'art et la musique te parlent viscéralement." },
};

const ELEMENT_CONFIG_EN: Record<string, { desc: string; icon: string; color: string; life: string }> = {
  Feu:   { desc: "Energy, passion, initiative", icon: "🔥", color: "#ef4444", life: "You act on instinct, often the first to take initiative. At work and in love, you bring a contagious flame and vitality. You motivate others and aren't afraid to charge ahead — even when the path isn't clear." },
  Terre: { desc: "Stability, practicality, patience", icon: "🌿", color: "#22c55e", life: "You build on solid ground. Your friends see you as a rock — the reliable one they trust with the keys. At work, you excel at concrete, lasting projects. You need to touch, to see the tangible results of your efforts." },
  Air:   { desc: "Thought, communication, ideas", icon: "💨", color: "#60a5fa", life: "You live in the world of ideas and connections. Socially, you link people together. You need intellectual stimulation — deep conversations are your fuel. Boredom is your worst enemy." },
  Eau:   { desc: "Emotions, intuition, empathy", icon: "🌊", color: "#a78bfa", life: "You feel everything — sometimes even what others don't say. Your intuitions often prove right. In love, you seek depth and authentic emotional connection. Art and music speak to you viscerally." },
};

const ELEMENT_NAMES_EN: Record<string, string> = { Feu: "Fire", Terre: "Earth", Air: "Air", Eau: "Water" };

const MODALITY_CONFIG_FR: Record<string, { desc: string; icon: string; life: string }> = {
  Cardinal: { desc: "Initier, lancer, diriger", icon: "🚀", life: "Tu es un démarreur — tu lances les projets, les idées, les conversations. L'action est ta zone de confort." },
  Fixe:     { desc: "Persévérer, stabiliser, ancrer", icon: "⚓", life: "Tu tiens bon. Quand tu décides, tu ne lâches pas. Ta constance est remarquable, mais la flexibilité te demande un effort conscient." },
  Mutable:  { desc: "Adapter, transformer, connecter", icon: "🌀", life: "Tu surfes sur le changement. Ta capacité d'adaptation impressionne, mais tu dois veiller à ne pas te disperser." },
};

const MODALITY_CONFIG_EN: Record<string, { desc: string; icon: string; life: string }> = {
  Cardinal: { desc: "Initiate, launch, lead", icon: "🚀", life: "You're a starter — you launch projects, ideas, conversations. Action is your comfort zone." },
  Fixe:     { desc: "Persevere, stabilize, anchor", icon: "⚓", life: "You hold your ground. Once you decide, you don't let go. Your consistency is remarkable, but flexibility takes conscious effort." },
  Mutable:  { desc: "Adapt, transform, connect", icon: "🌀", life: "You ride the waves of change. Your adaptability impresses, but you must watch not to scatter your energy." },
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
  const elementPlanetNames: Record<string, string[]> = { Feu: [], Terre: [], Air: [], Eau: [] };

  for (const p of allPlanets) {
    const el = ELEMENT_MAP[p.sign];
    const mod = MODALITY_MAP[p.sign];
    if (el) {
      elementCount[el]++;
      elementPlanets[el].push(p.symbol);
      elementPlanetNames[el].push(translatePlanet(p.name, locale));
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
    <div className="space-y-10">
      <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
        {isFr
          ? "Les quatre éléments et trois modalités révèlent la dynamique fondamentale de ton thème. Les éléments décrivent ta nature énergétique, les modalités ta manière d'agir dans le monde."
          : "The four elements and three modalities reveal the fundamental dynamic of your chart. The elements describe your energetic nature, the modalities your way of acting in the world."}
      </p>

      {/* ── ELEMENTS ─────────────────────────────────────────── */}
      <div>
        <h3 className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)] mb-6 font-semibold">
          {isFr ? "Éléments" : "Elements"}
        </h3>
        <div className="space-y-5 stagger-in">
          {(["Feu", "Terre", "Air", "Eau"] as const).map((el) => {
            const config = ELEMENT_CONFIG[el];
            const count = elementCount[el];
            const pct = Math.round((count / total) * 100);
            const isDominant = el === dominant[0];
            const displayName = isFr ? el : ELEMENT_NAMES_EN[el];

            return (
              <div key={el} className="glass p-4 sm:p-5" style={{ borderColor: isDominant ? `${config.color}40` : undefined }}>
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-hidden="true">{config.icon}</span>
                    <div>
                      <span className={`text-lg font-semibold ${isDominant ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}>{displayName}</span>
                      <span className="block text-sm text-[var(--color-text-secondary)] opacity-80">{config.desc}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-lg font-bold tabular-nums" style={{ color: isDominant ? config.color : "var(--color-text-secondary)" }}>
                      {pct}%
                    </span>
                    <span className="block font-mono text-xs text-[var(--color-text-secondary)]">
                      {count}/{total}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: isDominant
                        ? `linear-gradient(90deg, ${config.color}40, ${config.color}aa)`
                        : `linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.18))`,
                      boxShadow: isDominant ? `0 0 12px ${config.color}30` : "none",
                    }}
                  />
                </div>

                {/* Planet symbols row */}
                {elementPlanets[el].length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    {elementPlanets[el].map((sym, i) => (
                      <span key={i} className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm" style={{ background: `${config.color}15`, color: config.color }}>
                        {sym}
                      </span>
                    ))}
                    <span className="text-xs text-[var(--color-text-secondary)] ml-1">
                      {elementPlanetNames[el].join(", ")}
                    </span>
                  </div>
                )}

                {/* Life insight — only for dominant or empty */}
                {(isDominant || count === 0) && (
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] mt-2 pt-2 border-t border-white/5">
                    {count === 0
                      ? (isFr
                          ? `L'absence de ${el} dans ton thème ne signifie pas un manque — c'est une invitation à développer consciemment ces qualités : ${config.desc.toLowerCase()}.`
                          : `The absence of ${displayName} in your chart doesn't mean a lack — it's an invitation to consciously develop these qualities: ${config.desc.toLowerCase()}.`)
                      : config.life}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MODALITIES ───────────────────────────────────────── */}
      <div>
        <h3 className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)] mb-6 font-semibold">
          {isFr ? "Modalités" : "Modalities"}
        </h3>
        <div className="space-y-5 stagger-in">
          {(["Cardinal", "Fixe", "Mutable"] as const).map((mod) => {
            const config = MODALITY_CONFIG[mod];
            const count = modalityCount[mod];
            const pct = Math.round((count / total) * 100);
            const isDominant = mod === dominantMod[0];
            const displayName = isFr ? mod : MODALITY_NAMES_EN[mod];

            return (
              <div key={mod} className="glass p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-hidden="true">{config.icon}</span>
                    <div>
                      <span className={`text-lg font-semibold ${isDominant ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}>{displayName}</span>
                      <span className="block text-sm text-[var(--color-text-secondary)] opacity-80">{config.desc}</span>
                    </div>
                  </div>
                  <span className="font-mono text-lg font-bold tabular-nums" style={{ color: isDominant ? "var(--color-accent-lavender)" : "var(--color-text-secondary)" }}>
                    {pct}%
                  </span>
                </div>

                <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: isDominant
                        ? "linear-gradient(90deg, rgba(168,158,200,0.35), rgba(168,158,200,0.75))"
                        : "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.18))",
                      boxShadow: isDominant ? "0 0 12px rgba(168,158,200,0.2)" : "none",
                    }}
                  />
                </div>

                {modalityPlanets[mod].length > 0 && (
                  <div className="flex items-center gap-2">
                    {modalityPlanets[mod].map((sym, i) => (
                      <span key={i} className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/5 text-sm text-[var(--color-text-secondary)]">
                        {sym}
                      </span>
                    ))}
                  </div>
                )}

                {isDominant && (
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] mt-3 pt-2 border-t border-white/5">
                    {config.life}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SYNTHESIS ────────────────────────────────────────── */}
      <div className="glass p-5 sm:p-6" style={{ borderLeft: `3px solid var(--color-accent-lavender)` }}>
        <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-3">
          {isFr ? "Synthèse énergétique" : "Energy synthesis"}
        </h3>
        <p className="text-base text-[var(--color-text-secondary)] leading-relaxed">
          {isFr ? "Ton thème est dominé par l'élément" : "Your chart is dominated by the element"}{" "}
          <strong className="font-semibold text-[var(--color-text-primary)]">
            {isFr ? dominant[0] : ELEMENT_NAMES_EN[dominant[0]]}
          </strong>{" "}
          <span className="font-mono text-sm">({dominant[1]}/{total})</span>{" "}
          — {ELEMENT_CONFIG[dominant[0]].desc.toLowerCase()}.
          {weakest[1] === 0 ? (
            <> {isFr ? `L'absence de ${weakest[0]} t'invite à développer consciemment ces qualités` : `The absence of ${ELEMENT_NAMES_EN[weakest[0]]} invites you to consciously develop these qualities`} : {ELEMENT_CONFIG[weakest[0]].desc.toLowerCase()}.</>
          ) : weakest[1] <= 1 ? (
            <> {isFr ? `L'élément ${weakest[0]} est peu présent` : `${ELEMENT_NAMES_EN[weakest[0]]} is barely present`} — {isFr ? "une invitation à explorer" : "an invitation to explore"} {ELEMENT_CONFIG[weakest[0]].desc.toLowerCase()}.</>
          ) : null}
        </p>
        <p className="text-base text-[var(--color-text-secondary)] leading-relaxed mt-3">
          {isFr ? "Modalité dominante" : "Dominant modality"} :{" "}
          <strong className="font-semibold text-[var(--color-text-primary)]">
            {isFr ? dominantMod[0] : MODALITY_NAMES_EN[dominantMod[0]]}
          </strong>{" "}
          — {isFr ? "tu tends naturellement à" : "you naturally tend to"} {MODALITY_CONFIG[dominantMod[0]].desc.toLowerCase()}.
        </p>
      </div>
    </div>
  );
}
