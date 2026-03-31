"use client";

import { PlanetPosition } from "@/lib/astro";
import { houseDescriptions } from "@/data/interpretations";

interface Props {
  planets: PlanetPosition[];
  onTapHouse: (house: number) => void;
}

const HOUSE_ICONS = ["👤", "💎", "💬", "🏠", "🎨", "⚙️", "🤝", "🔮", "🌍", "🏔️", "👥", "🌙"];

export default function HousesMap({ planets, onTapHouse }: Props) {
  // Group planets by house
  const houseOccupants: Record<number, PlanetPosition[]> = {};
  for (let i = 1; i <= 12; i++) houseOccupants[i] = [];
  for (const p of planets) {
    if (p.house) houseOccupants[p.house].push(p);
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--color-text-secondary)] mb-4">
        Touche une maison pour découvrir son influence dans ta vie.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
          const desc = houseDescriptions[h];
          const occupants = houseOccupants[h];
          const hasOccupants = occupants.length > 0;

          return (
            <button
              key={h}
              onClick={() => onTapHouse(h)}
              className={`text-left p-3 rounded-xl border transition-all active:scale-95 ${
                hasOccupants
                  ? "border-[var(--color-accent-lavender)]/30 bg-[var(--color-accent-lavender)]/5"
                  : "border-[var(--color-glass-border)] bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{HOUSE_ICONS[h - 1]}</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">M{h}</span>
              </div>
              <div className="text-xs font-medium text-[var(--color-text-primary)] mb-0.5">
                {desc?.domain}
              </div>
              {hasOccupants && (
                <div className="flex gap-1 mt-1">
                  {occupants.map((p) => (
                    <span key={p.name} className="text-sm text-[var(--color-accent-gold)]" title={p.name}>
                      {p.symbol}
                    </span>
                  ))}
                </div>
              )}
              {!hasOccupants && (
                <div className="text-[10px] text-[var(--color-text-secondary)] mt-1 opacity-50">Vide</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
