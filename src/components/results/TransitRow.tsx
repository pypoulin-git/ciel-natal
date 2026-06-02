"use client";

import { PlanetPosition } from "@/lib/astro";
import { translatePlanet, translateSign } from "@/lib/astro";
import { getPlanetPaths } from "@/components/AstroIcons";

interface Props {
  transit: PlanetPosition;
  natal: PlanetPosition;
  locale: string;
  labels: {
    current: string;
    natal: string;
  };
}

/**
 * Calcule l'écart angulaire le plus court entre deux longitudes (0-180).
 */
function angularGap(a: number, b: number): number {
  let diff = Math.abs(a - b) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

/**
 * Microtexte par planète basé sur l'écart angulaire transit-natal.
 * 5 catégories — pas d'appel LLM, fallback local instantané.
 */
function microtext(planetFr: string, planetDisplay: string, gap: number, locale: string): string {
  const fr = locale !== "en";
  // Pic / conjonction quasi-exacte
  if (gap < 5) {
    return fr
      ? `Pic de l'énergie ${planetDisplay} — elle revient à sa place natale.`
      : `Peak of the ${planetDisplay} energy — it returns to its natal place.`;
  }
  // Sextile (~60°) ou trigone (~120°) — soutien
  if (Math.abs(gap - 60) < 6 || Math.abs(gap - 120) < 6) {
    return fr
      ? `Un soutien des étoiles sur ce que ta ${planetDisplay} traverse.`
      : `Support from the stars on what your ${planetDisplay} is going through.`;
  }
  // Carré (~90°) ou opposition (~180°) — tension créatrice
  if (Math.abs(gap - 90) < 6 || Math.abs(gap - 180) < 6) {
    return fr
      ? `Une tension créatrice qui demande à être travaillée.`
      : `A creative tension that asks to be worked through.`;
  }
  // Petit écart 5-60° hors aspects — ajustement
  if (gap >= 5 && gap < 60) {
    return fr
      ? `${planetDisplay} t'invite à un petit ajustement intérieur.`
      : `${planetDisplay} invites you to a small inner adjustment.`;
  }
  // Reste — murmure
  return fr
    ? `${planetDisplay} circule, simple murmure du ciel.`
    : `${planetDisplay} drifts on — a soft murmur of the sky.`;
  // (planetFr conservé en signature pour usage futur — calculs spécifiques par planète)
  void planetFr;
}

/**
 * Mini-diagramme orbital SVG. Affiche les deux glyphes (natal lavande,
 * transit rose) sur une portion d'écliptique de 180px de large,
 * positionnés selon leurs longitudes relatives au plus petit arc qui
 * les contient. Distance entre les disques proportionnelle à l'écart
 * angulaire (max 180° → max distance).
 */
function OrbitalMini({ transit, natal, gap }: { transit: PlanetPosition; natal: PlanetPosition; gap: number }) {
  const W = 180;
  const H = 56;
  const cy = H / 2;
  // 0° -> distance = 0 (centré). 180° -> distance max (~140px d'écart).
  const ratio = Math.min(gap / 180, 1);
  const spread = ratio * 130; // px d'écart max entre les deux disques
  const xN = W / 2 - spread / 2;
  const xT = W / 2 + spread / 2;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="flex-shrink-0"
      aria-hidden="true"
      role="presentation"
    >
      {/* Écliptique — ligne semi-transparente */}
      <line
        x1={6}
        y1={cy}
        x2={W - 6}
        y2={cy}
        stroke="var(--color-glass-border)"
        strokeWidth={1}
        strokeDasharray="2 4"
        opacity={0.6}
      />
      {/* Arc reliant les deux points — donne un sentiment d'angle */}
      {gap > 1 && (
        <path
          d={`M ${xN} ${cy} Q ${(xN + xT) / 2} ${cy - 14 - ratio * 6}, ${xT} ${cy}`}
          stroke="var(--color-accent-lavender)"
          strokeWidth={1}
          fill="none"
          opacity={0.4}
        />
      )}
      {/* Halo natal */}
      <circle cx={xN} cy={cy} r={14} fill="var(--color-accent-lavender)" opacity={0.12} />
      <circle cx={xN} cy={cy} r={10} fill="var(--color-accent-lavender)" opacity={0.18} />
      {/* Glyphe natal — viewBox du glyphe est 0..24, on scale à ~0.75 et on
          centre dans le halo. */}
      <g
        transform={`translate(${xN - 9} ${cy - 9}) scale(0.75)`}
        stroke="var(--color-accent-lavender)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {getPlanetPaths(natal.name)}
      </g>
      {/* Halo transit */}
      <circle cx={xT} cy={cy} r={14} fill="var(--color-accent-rose)" opacity={0.14} />
      <circle cx={xT} cy={cy} r={10} fill="var(--color-accent-rose)" opacity={0.20} />
      {/* Glyphe transit */}
      <g
        transform={`translate(${xT - 9} ${cy - 9}) scale(0.75)`}
        stroke="var(--color-accent-rose)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {getPlanetPaths(transit.name)}
      </g>
      {/* Étiquette de l'écart angulaire — petit chiffre sous l'arc */}
      <text
        x={W / 2}
        y={H - 4}
        textAnchor="middle"
        fontSize={9}
        fill="var(--color-text-secondary)"
        opacity={0.55}
      >
        {Math.round(gap)}°
      </text>
    </svg>
  );
}

export default function TransitRow({ transit, natal, locale, labels }: Props) {
  const gap = angularGap(transit.longitude, natal.longitude);
  const planetDisplay = translatePlanet(transit.name, locale);
  const flavor = microtext(transit.name, planetDisplay, gap, locale);

  return (
    <div className="glass p-4 sm:p-5">
      <div className="flex items-center gap-4">
        <span
          className="text-lg text-[var(--color-accent-lavender)]"
          style={{ fontFamily: "serif" }}
        >
          {transit.symbol}
        </span>
        <span className="text-base font-medium text-[var(--color-text-primary)] flex-1 min-w-0 truncate">
          {planetDisplay}
        </span>

        {/* Mini-diagramme orbital — caché sur très petits écrans pour
            laisser l'info sign/degré respirer, visible dès sm. */}
        <div className="hidden sm:block">
          <OrbitalMini transit={transit} natal={natal} gap={gap} />
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-sm text-[var(--color-text-secondary)]">
            <span className="text-[var(--color-accent-rose)]">{labels.current}</span>{" "}
            {translateSign(transit.sign, locale)} {transit.degree}°
          </div>
          <div className="text-xs text-[var(--color-text-secondary)] opacity-70">
            <span className="text-[var(--color-accent-lavender)]">{labels.natal}</span>{" "}
            {translateSign(natal.sign, locale)} {natal.degree}°
          </div>
        </div>
      </div>

      {/* Microtexte — toujours présent (avant on n'en avait que pour
          les transits dans le même signe natal). */}
      <p className="mt-2 text-xs text-[var(--color-text-secondary)] leading-relaxed opacity-85">
        {flavor}
      </p>
    </div>
  );
}
