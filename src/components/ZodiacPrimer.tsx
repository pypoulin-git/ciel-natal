"use client";

import { useState } from "react";
import { getSignPaths } from "@/components/AstroIcons";
import { signMeta } from "@/lib/signMeta";
import { useLocale } from "@/lib/i18n";

// Canonical FR sign keys in zodiac order (Bélier → Poissons).
const SIGN_KEYS = [
  "Belier", "Taureau", "Gemeaux", "Cancer", "Lion", "Vierge",
  "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons",
];

const NAMES_FR = ["Bélier", "Taureau", "Gémeaux", "Cancer", "Lion", "Vierge", "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons"];
const NAMES_EN = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

// Element colours (kept distinct for legibility — matches the sign grid below).
const EL_COLOR: Record<string, string> = {
  Feu: "#e0703f", Terre: "#5ba36a", Air: "#5b9bd4", Eau: "#9a7fd0",
};
const EL_FR_TO_EN: Record<string, string> = { Feu: "Fire", Terre: "Earth", Air: "Air", Eau: "Water" };

// Season per sign index (Northern hemisphere — Québec).
const SEASONS = [
  { fr: "Printemps", en: "Spring", mid: 30 },   // Bélier·Taureau·Gémeaux
  { fr: "Été", en: "Summer", mid: 120 },        // Cancer·Lion·Vierge
  { fr: "Automne", en: "Autumn", mid: 210 },    // Balance·Scorpion·Sagittaire
  { fr: "Hiver", en: "Winter", mid: 300 },      // Capricorne·Verseau·Poissons
];

const SIZE = 460;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = 206;
const BAND_INNER = 156;
const GLYPH_R = 181;
const NAME_R = 224;
const SEASON_R = 122;

// 0° = top, counter-clockwise (true zodiac direction): Bélier top,
// Cancer left (summer solstice), Balance bottom, Capricorne right (winter).
function toXY(deg: number, r: number): { x: number; y: number } {
  const t = (deg * Math.PI) / 180;
  return { x: CX - r * Math.sin(t), y: CY - r * Math.cos(t) };
}

export default function ZodiacPrimer() {
  const { locale } = useLocale();
  const fr = locale !== "en";
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="my-6">
      {/* ── The wheel ── */}
      <div className="glass p-4 sm:p-6">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full max-w-[520px] mx-auto select-none"
          role="img"
          aria-label={fr ? "Cadran du zodiaque : 12 signes, 4 saisons, éléments et modalités" : "Zodiac dial: 12 signs, 4 seasons, elements and modalities"}
        >
          <defs>
            <radialGradient id="zp-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-accent-gold)" stopOpacity="0.5" />
              <stop offset="55%" stopColor="var(--color-accent-gold)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Rings */}
          <circle cx={CX} cy={CY} r={OUTER_R} fill="none" stroke="var(--color-glass-border)" strokeWidth="1.5" />
          <circle cx={CX} cy={CY} r={BAND_INNER} fill="none" stroke="var(--color-glass-border)" strokeWidth="1" />
          <circle cx={CX} cy={CY} r={SEASON_R + 22} fill="none" stroke="var(--color-glass-border)" strokeWidth="0.75" strokeDasharray="2 5" />

          {/* Axes — equinox (Bélier–Balance, vertical) + solstice (Cancer–Capricorne, horizontal) */}
          <line x1={CX} y1={CY - OUTER_R} x2={CX} y2={CY + OUTER_R} stroke="var(--color-accent-lavender)" strokeWidth="0.75" strokeDasharray="3 4" opacity="0.4" />
          <line x1={CX - OUTER_R} y1={CY} x2={CX + OUTER_R} y2={CY} stroke="var(--color-accent-lavender)" strokeWidth="0.75" strokeDasharray="3 4" opacity="0.4" />

          {/* Season labels in each quadrant centre */}
          {SEASONS.map((s) => {
            const p = toXY(s.mid, SEASON_R);
            return (
              <text
                key={s.fr}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="11"
                fontWeight="600"
                letterSpacing="0.12em"
                fill="var(--color-text-secondary)"
                style={{ fontFamily: "'Inter', sans-serif", textTransform: "uppercase" }}
              >
                {fr ? s.fr : s.en}
              </text>
            );
          })}

          {/* 12 sign segments */}
          {SIGN_KEYS.map((key, i) => {
            const mid = i * 30;
            const boundary = i * 30 + 15;
            // signMeta(key, "fr").element is always a FR element name → colour map.
            const elFr = signMeta(key, "fr")?.element || "Feu";
            const elColor = EL_COLOR[elFr] || "var(--color-accent-lavender)";
            const isHover = hover === i;

            const bLine1 = toXY(boundary, BAND_INNER);
            const bLine2 = toXY(boundary, OUTER_R);
            const glyph = toXY(mid, GLYPH_R);
            const namePos = toXY(mid, NAME_R);
            const sz = isHover ? 26 : 22;

            return (
              <g
                key={key}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "default" }}
              >
                {/* Division line */}
                <line x1={bLine1.x} y1={bLine1.y} x2={bLine2.x} y2={bLine2.y} stroke="var(--color-glass-border)" strokeWidth="0.75" />

                {/* Element-coloured badge */}
                <circle cx={glyph.x} cy={glyph.y} r={isHover ? 19 : 16} fill={`${elColor}${isHover ? "33" : "1f"}`} stroke={elColor} strokeOpacity={isHover ? 0.9 : 0.5} strokeWidth="1.2" style={{ transition: "all 0.2s" }} />

                {/* Sign glyph */}
                <g
                  transform={`translate(${glyph.x - sz / 2}, ${glyph.y - sz / 2}) scale(${sz / 24})`}
                  fill="none"
                  stroke={elColor}
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: "all 0.2s" }}
                >
                  {getSignPaths(i)}
                </g>

                {/* Sign name (always on, outside the ring) */}
                <text
                  x={namePos.x}
                  y={namePos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10.5"
                  fontWeight={isHover ? 700 : 500}
                  fill={isHover ? "var(--color-text-primary)" : "var(--color-text-secondary)"}
                  style={{ fontFamily: "'Inter', sans-serif", transition: "all 0.2s" }}
                >
                  {fr ? NAMES_FR[i] : NAMES_EN[i]}
                </text>
              </g>
            );
          })}

          {/* Center — the Sun (the wheel is the Sun's yearly path) */}
          <circle cx={CX} cy={CY} r={42} fill="url(#zp-core)" />
          <circle cx={CX} cy={CY} r={15} fill="none" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
          <circle cx={CX} cy={CY} r="2.5" fill="var(--color-accent-gold)" />
          {Array.from({ length: 12 }, (_, k) => {
            const r1 = toXY(k * 30, 21);
            const r2 = toXY(k * 30, 28);
            return <line key={k} x1={r1.x} y1={r1.y} x2={r2.x} y2={r2.y} stroke="var(--color-accent-gold)" strokeWidth="1.2" opacity="0.7" />;
          })}
        </svg>

        {/* Cardinal markers caption */}
        <p className="text-center text-xs text-[var(--color-text-secondary)] opacity-70 mt-2">
          {fr
            ? "Bélier (haut) ouvre le printemps · Cancer (gauche) l'été · Balance (bas) l'automne · Capricorne (droite) l'hiver"
            : "Aries (top) opens spring · Cancer (left) summer · Libra (bottom) autumn · Capricorn (right) winter"}
        </p>
      </div>

      {/* ── Explanations: the principles & structure ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
        {/* The wheel of the year */}
        <div className="glass p-5">
          <h3 className="font-cinzel text-base text-[var(--color-text-primary)] mb-2">
            {fr ? "La roue de l'année" : "The wheel of the year"}
          </h3>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {fr
              ? "Le cadran est le chemin que le Soleil parcourt dans le ciel en une année. Il est divisé en 12 secteurs égaux de 30° — les signes — pour un total de 360°. Chaque signe correspond à environ un mois. Ce n'est pas une carte des étoiles, mais un calendrier symbolique des saisons."
              : "The dial is the path the Sun travels across the sky in one year. It's divided into 12 equal 30° sectors — the signs — for a total of 360°. Each sign spans about a month. It isn't a star map but a symbolic calendar of the seasons."}
          </p>
        </div>

        {/* Axes & seasons */}
        <div className="glass p-5">
          <h3 className="font-cinzel text-base text-[var(--color-text-primary)] mb-2">
            {fr ? "Les 2 axes, les 4 saisons" : "The 2 axes, the 4 seasons"}
          </h3>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {fr
              ? "Deux axes structurent la roue. L'axe des équinoxes relie le Bélier (équinoxe de printemps) à la Balance (équinoxe d'automne). L'axe des solstices relie le Cancer (solstice d'été) au Capricorne (solstice d'hiver). Ces quatre points cardinaux découpent les quatre saisons — les quatre cadrans."
              : "Two axes structure the wheel. The equinox axis links Aries (spring equinox) to Libra (autumn equinox). The solstice axis links Cancer (summer solstice) to Capricorn (winter solstice). These four cardinal points carve out the four seasons — the four quadrants."}
          </p>
        </div>

        {/* Elements (triplicities) */}
        <div className="glass p-5">
          <h3 className="font-cinzel text-base text-[var(--color-text-primary)] mb-3">
            {fr ? "Les 4 éléments" : "The 4 elements"}
          </h3>
          <div className="space-y-2">
            {(["Feu", "Terre", "Air", "Eau"] as const).map((el) => {
              const signsOfEl = SIGN_KEYS.filter((k) => signMeta(k, "fr")?.element === el);
              const names = signsOfEl.map((k) => {
                const idx = SIGN_KEYS.indexOf(k);
                return fr ? NAMES_FR[idx] : NAMES_EN[idx];
              });
              const elName = fr ? el : EL_FR_TO_EN[el];
              return (
                <div key={el} className="flex items-start gap-2 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: EL_COLOR[el] }} />
                  <span>
                    <span className="font-medium" style={{ color: EL_COLOR[el] }}>{elName}</span>
                    <span className="text-[var(--color-text-secondary)]"> — {names.join(", ")}</span>
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] opacity-70 mt-3">
            {fr
              ? "Les signes d'un même élément sont espacés de 120° sur la roue (le grand triangle harmonique)."
              : "Signs of the same element sit 120° apart on the wheel (the harmonious grand triangle)."}
          </p>
        </div>

        {/* Modalities (quadruplicities) */}
        <div className="glass p-5">
          <h3 className="font-cinzel text-base text-[var(--color-text-primary)] mb-3">
            {fr ? "Les 3 modalités" : "The 3 modalities"}
          </h3>
          <div className="space-y-2 text-sm">
            {([
              { fr: "Cardinal", en: "Cardinal", descFr: "amorcent (début de saison)", descEn: "initiate (start of a season)" },
              { fr: "Fixe", en: "Fixed", descFr: "consolident (cœur de saison)", descEn: "stabilize (heart of a season)" },
              { fr: "Mutable", en: "Mutable", descFr: "transforment (fin de saison)", descEn: "adapt (end of a season)" },
            ] as const).map((m) => {
              const modSigns = SIGN_KEYS.filter((k) => signMeta(k, "fr")?.modality === m.fr);
              const names = modSigns.map((k) => {
                const idx = SIGN_KEYS.indexOf(k);
                return fr ? NAMES_FR[idx] : NAMES_EN[idx];
              });
              return (
                <div key={m.fr}>
                  <span className="font-medium text-[var(--color-accent-lavender)]">{fr ? m.fr : m.en}</span>
                  <span className="text-[var(--color-text-secondary)]"> — {fr ? m.descFr : m.descEn}</span>
                  <div className="text-xs text-[var(--color-text-secondary)] opacity-70">{names.join(", ")}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
