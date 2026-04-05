"use client";

import React from "react";

// ─── Modern SVG Astrological Glyphs ─────────────────────────────
// Clean, geometric paths with glass-blur aesthetic
// Each icon is designed to work at 16-48px with proper stroke scaling

interface IconProps {
  size?: number;
  color?: string;
  glow?: boolean;
  className?: string;
}

function wrap(path: React.ReactNode, { size = 24, color = "currentColor", glow = false, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={glow ? { filter: "drop-shadow(0 0 4px rgba(168,158,200,0.5))" } : undefined}
    >
      {path}
    </svg>
  );
}

// ━━━ ZODIAC SIGNS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Aries ♈ — Ram horns */
export function Aries(props: IconProps) {
  return wrap(
    <>
      <path d="M6 20 C6 12, 6 8, 12 4 C18 8, 18 12, 18 20" />
      <line x1="12" y1="4" x2="12" y2="14" />
    </>,
    props
  );
}

/** Taurus ♉ — Bull head + horns */
export function Taurus(props: IconProps) {
  return wrap(
    <>
      <circle cx="12" cy="15" r="5" />
      <path d="M7 10 C4 6, 6 3, 9 5" />
      <path d="M17 10 C20 6, 18 3, 15 5" />
    </>,
    props
  );
}

/** Gemini ♊ — Pillars / Twins */
export function Gemini(props: IconProps) {
  return wrap(
    <>
      <line x1="8" y1="4" x2="8" y2="20" />
      <line x1="16" y1="4" x2="16" y2="20" />
      <path d="M5 5 C8 7, 16 7, 19 5" />
      <path d="M5 19 C8 17, 16 17, 19 19" />
    </>,
    props
  );
}

/** Cancer ♋ — Crab claws / 69 rotated */
export function Cancer(props: IconProps) {
  return wrap(
    <>
      <path d="M18 8 A5 5 0 0 0 8 8" />
      <circle cx="18" cy="8" r="2.5" />
      <path d="M6 16 A5 5 0 0 0 16 16" />
      <circle cx="6" cy="16" r="2.5" />
    </>,
    props
  );
}

/** Leo ♌ — Lion's mane swirl */
export function Leo(props: IconProps) {
  return wrap(
    <>
      <circle cx="9" cy="9" r="4" />
      <path d="M13 9 C16 9, 18 12, 18 15 C18 18, 16 20, 13 20" />
    </>,
    props
  );
}

/** Virgo ♍ — M with tail */
export function Virgo(props: IconProps) {
  return wrap(
    <>
      <path d="M4 18 L4 8 C4 6, 8 6, 8 8 L8 18" />
      <path d="M8 8 C8 6, 12 6, 12 8 L12 18" />
      <path d="M12 8 C12 6, 16 6, 16 8 L16 14 C16 17, 20 17, 20 14" />
      <line x1="18" y1="12" x2="20" y2="18" />
    </>,
    props
  );
}

/** Libra ♎ — Scales / balanced line */
export function Libra(props: IconProps) {
  return wrap(
    <>
      <line x1="4" y1="18" x2="20" y2="18" />
      <path d="M4 13 C4 9, 12 9, 12 13" />
      <path d="M12 13 C12 9, 20 9, 20 13" />
      <line x1="12" y1="13" x2="12" y2="18" />
    </>,
    props
  );
}

/** Scorpio ♏ — M with arrow tail */
export function Scorpio(props: IconProps) {
  return wrap(
    <>
      <path d="M4 18 L4 8 C4 6, 8 6, 8 8 L8 18" />
      <path d="M8 8 C8 6, 12 6, 12 8 L12 18" />
      <path d="M12 8 C12 6, 16 6, 16 8 L16 18 L20 14" />
      <line x1="16" y1="18" x2="20" y2="18" />
    </>,
    props
  );
}

/** Sagittarius ♐ — Arrow */
export function Sagittarius(props: IconProps) {
  return wrap(
    <>
      <line x1="5" y1="19" x2="19" y2="5" />
      <polyline points="13,5 19,5 19,11" />
      <line x1="8" y1="12" x2="12" y2="16" />
    </>,
    props
  );
}

/** Capricorn ♑ — Sea-goat */
export function Capricorn(props: IconProps) {
  return wrap(
    <>
      <path d="M5 12 C5 6, 10 4, 12 8 L12 16 C12 20, 18 20, 18 16 C18 13, 20 12, 20 14" />
      <circle cx="18" cy="18" r="2" />
    </>,
    props
  );
}

/** Aquarius ♒ — Water waves */
export function Aquarius(props: IconProps) {
  return wrap(
    <>
      <path d="M4 10 C6 8, 8 12, 10 10 C12 8, 14 12, 16 10 C18 8, 20 12, 20 10" />
      <path d="M4 16 C6 14, 8 18, 10 16 C12 14, 14 18, 16 16 C18 14, 20 18, 20 16" />
    </>,
    props
  );
}

/** Pisces ♓ — Two fish / parallel curves */
export function Pisces(props: IconProps) {
  return wrap(
    <>
      <path d="M7 4 C3 8, 3 16, 7 20" />
      <path d="M17 4 C21 8, 21 16, 17 20" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </>,
    props
  );
}

// ━━━ PLANETS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Sun ☉ — Circle with dot */
export function Sun(props: IconProps) {
  return wrap(
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="1.5" fill={props.color || "currentColor"} stroke="none" />
    </>,
    props
  );
}

/** Moon ☽ — Crescent */
export function Moon(props: IconProps) {
  return wrap(
    <path d="M16 4 A8 8 0 1 0 16 20 A6 6 0 0 1 16 4 Z" />,
    props
  );
}

/** Mercury ☿ — Winged circle + cross */
export function Mercury(props: IconProps) {
  return wrap(
    <>
      <circle cx="12" cy="10" r="4" />
      <line x1="12" y1="14" x2="12" y2="21" />
      <line x1="9" y1="18" x2="15" y2="18" />
      <path d="M8 6 C8 3, 12 2, 12 5" />
      <path d="M16 6 C16 3, 12 2, 12 5" />
    </>,
    props
  );
}

/** Venus ♀ — Circle + cross below */
export function Venus(props: IconProps) {
  return wrap(
    <>
      <circle cx="12" cy="9" r="5" />
      <line x1="12" y1="14" x2="12" y2="22" />
      <line x1="9" y1="18" x2="15" y2="18" />
    </>,
    props
  );
}

/** Mars ♂ — Circle + arrow */
export function Mars(props: IconProps) {
  return wrap(
    <>
      <circle cx="10" cy="14" r="5" />
      <line x1="14" y1="10" x2="20" y2="4" />
      <polyline points="15,4 20,4 20,9" />
    </>,
    props
  );
}

/** Jupiter ♃ — Stylized 4 */
export function Jupiter(props: IconProps) {
  return wrap(
    <>
      <path d="M7 4 C4 4, 4 10, 7 10 L18 10" />
      <line x1="14" y1="4" x2="14" y2="20" />
    </>,
    props
  );
}

/** Saturn ♄ — Cross + crescent */
export function Saturn(props: IconProps) {
  return wrap(
    <>
      <line x1="10" y1="4" x2="10" y2="16" />
      <line x1="7" y1="7" x2="13" y2="7" />
      <path d="M10 16 C10 20, 16 20, 16 16 C16 13, 13 12, 13 12" />
    </>,
    props
  );
}

/** Uranus ♅ — H with circle */
export function Uranus(props: IconProps) {
  return wrap(
    <>
      <line x1="8" y1="6" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="18" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <circle cx="12" cy="4" r="2" />
    </>,
    props
  );
}

/** Neptune ♆ — Trident */
export function Neptune(props: IconProps) {
  return wrap(
    <>
      <line x1="12" y1="6" x2="12" y2="22" />
      <line x1="8" y1="18" x2="16" y2="18" />
      <path d="M6 6 C6 10, 12 10, 12 6 C12 10, 18 10, 18 6" />
      <line x1="6" y1="6" x2="6" y2="4" />
      <line x1="18" y1="6" x2="18" y2="4" />
    </>,
    props
  );
}

/** Pluto ♇ — Circle + crescent + cross */
export function Pluto(props: IconProps) {
  return wrap(
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M8 8 A4 4 0 0 1 16 8" />
      <line x1="12" y1="12" x2="12" y2="22" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </>,
    props
  );
}

/** Ascendant ↑ — Arrow up with base */
export function AscendantIcon(props: IconProps) {
  return wrap(
    <>
      <line x1="12" y1="4" x2="12" y2="20" />
      <polyline points="7,9 12,4 17,9" />
      <line x1="7" y1="20" x2="17" y2="20" />
    </>,
    props
  );
}

// ━━━ LOOKUP MAPS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SIGN_COMPONENTS: Record<string, React.FC<IconProps>> = {
  "Belier": Aries, "Bélier": Aries, "Aries": Aries,
  "Taureau": Taurus, "Taurus": Taurus,
  "Gemeaux": Gemini, "Gémeaux": Gemini, "Gemini": Gemini,
  "Cancer": Cancer,
  "Lion": Leo, "Leo": Leo,
  "Vierge": Virgo, "Virgo": Virgo,
  "Balance": Libra, "Libra": Libra,
  "Scorpion": Scorpio, "Scorpio": Scorpio,
  "Sagittaire": Sagittarius, "Sagittarius": Sagittarius,
  "Capricorne": Capricorn, "Capricorn": Capricorn,
  "Verseau": Aquarius, "Aquarius": Aquarius,
  "Poissons": Pisces, "Pisces": Pisces,
};

const PLANET_COMPONENTS: Record<string, React.FC<IconProps>> = {
  "Soleil": Sun, "Sun": Sun,
  "Lune": Moon, "Moon": Moon,
  "Mercure": Mercury, "Mercury": Mercury,
  "Vénus": Venus, "Venus": Venus,
  "Mars": Mars,
  "Jupiter": Jupiter,
  "Saturne": Saturn, "Saturn": Saturn,
  "Uranus": Uranus,
  "Neptune": Neptune,
  "Pluton": Pluto, "Pluto": Pluto,
  "Ascendant": AscendantIcon, "AC": AscendantIcon,
};

/** Get a zodiac sign SVG component by name (FR or EN) */
export function SignIcon({ name, ...props }: IconProps & { name: string }) {
  const Comp = SIGN_COMPONENTS[name];
  if (!Comp) return <span>{name}</span>;
  return <Comp {...props} />;
}

/** Get a planet SVG component by name (FR or EN) */
export function PlanetIcon({ name, ...props }: IconProps & { name: string }) {
  const Comp = PLANET_COMPONENTS[name];
  if (!Comp) return <span>{name}</span>;
  return <Comp {...props} />;
}

// ━━━ SIGN INDEX MAP (for ZodiacWheel by index) ━━━━━━━━━━━━━━━━

const SIGN_BY_INDEX: React.FC<IconProps>[] = [
  Aries, Taurus, Gemini, Cancer, Leo, Virgo,
  Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces,
];

/** Get a zodiac sign SVG component by index (0=Aries...11=Pisces) */
export function SignIconByIndex({ index, ...props }: IconProps & { index: number }) {
  const Comp = SIGN_BY_INDEX[index];
  if (!Comp) return null;
  return <Comp {...props} />;
}

// ━━━ INLINE SVG PATHS FOR USE INSIDE SVG (ZodiacWheel) ━━━━━━━━

/** Returns SVG path elements for a sign glyph — to be used inside an existing <svg> */
export function getSignPaths(index: number): React.ReactNode {
  const paths: React.ReactNode[] = [
    // 0: Aries
    <><path d="M6 20 C6 12, 6 8, 12 4 C18 8, 18 12, 18 20" /><line x1="12" y1="4" x2="12" y2="14" /></>,
    // 1: Taurus
    <><circle cx="12" cy="15" r="5" /><path d="M7 10 C4 6, 6 3, 9 5" /><path d="M17 10 C20 6, 18 3, 15 5" /></>,
    // 2: Gemini
    <><line x1="8" y1="4" x2="8" y2="20" /><line x1="16" y1="4" x2="16" y2="20" /><path d="M5 5 C8 7, 16 7, 19 5" /><path d="M5 19 C8 17, 16 17, 19 19" /></>,
    // 3: Cancer
    <><path d="M18 8 A5 5 0 0 0 8 8" /><circle cx="18" cy="8" r="2.5" /><path d="M6 16 A5 5 0 0 0 16 16" /><circle cx="6" cy="16" r="2.5" /></>,
    // 4: Leo
    <><circle cx="9" cy="9" r="4" /><path d="M13 9 C16 9, 18 12, 18 15 C18 18, 16 20, 13 20" /></>,
    // 5: Virgo
    <><path d="M4 18 L4 8 C4 6, 8 6, 8 8 L8 18" /><path d="M8 8 C8 6, 12 6, 12 8 L12 18" /><path d="M12 8 C12 6, 16 6, 16 8 L16 14 C16 17, 20 17, 20 14" /><line x1="18" y1="12" x2="20" y2="18" /></>,
    // 6: Libra
    <><line x1="4" y1="18" x2="20" y2="18" /><path d="M4 13 C4 9, 12 9, 12 13" /><path d="M12 13 C12 9, 20 9, 20 13" /><line x1="12" y1="13" x2="12" y2="18" /></>,
    // 7: Scorpio
    <><path d="M4 18 L4 8 C4 6, 8 6, 8 8 L8 18" /><path d="M8 8 C8 6, 12 6, 12 8 L12 18" /><path d="M12 8 C12 6, 16 6, 16 8 L16 18 L20 14" /><line x1="16" y1="18" x2="20" y2="18" /></>,
    // 8: Sagittarius
    <><line x1="5" y1="19" x2="19" y2="5" /><polyline points="13,5 19,5 19,11" /><line x1="8" y1="12" x2="12" y2="16" /></>,
    // 9: Capricorn
    <><path d="M5 12 C5 6, 10 4, 12 8 L12 16 C12 20, 18 20, 18 16 C18 13, 20 12, 20 14" /><circle cx="18" cy="18" r="2" /></>,
    // 10: Aquarius
    <><path d="M4 10 C6 8, 8 12, 10 10 C12 8, 14 12, 16 10 C18 8, 20 12, 20 10" /><path d="M4 16 C6 14, 8 18, 10 16 C12 14, 14 18, 16 16 C18 14, 20 18, 20 16" /></>,
    // 11: Pisces
    <><path d="M7 4 C3 8, 3 16, 7 20" /><path d="M17 4 C21 8, 21 16, 17 20" /><line x1="4" y1="12" x2="20" y2="12" /></>,
  ];
  return paths[index] ?? null;
}

/** Returns SVG path elements for a planet glyph — to be used inside an existing <svg> */
export function getPlanetPaths(name: string): React.ReactNode {
  const map: Record<string, React.ReactNode> = {
    "Soleil": <><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /></>,
    "Sun": <><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /></>,
    "Lune": <path d="M16 4 A8 8 0 1 0 16 20 A6 6 0 0 1 16 4 Z" />,
    "Moon": <path d="M16 4 A8 8 0 1 0 16 20 A6 6 0 0 1 16 4 Z" />,
    "Mercure": <><circle cx="12" cy="10" r="4" /><line x1="12" y1="14" x2="12" y2="21" /><line x1="9" y1="18" x2="15" y2="18" /><path d="M8 6 C8 3, 12 2, 12 5" /><path d="M16 6 C16 3, 12 2, 12 5" /></>,
    "Mercury": <><circle cx="12" cy="10" r="4" /><line x1="12" y1="14" x2="12" y2="21" /><line x1="9" y1="18" x2="15" y2="18" /><path d="M8 6 C8 3, 12 2, 12 5" /><path d="M16 6 C16 3, 12 2, 12 5" /></>,
    "Vénus": <><circle cx="12" cy="9" r="5" /><line x1="12" y1="14" x2="12" y2="22" /><line x1="9" y1="18" x2="15" y2="18" /></>,
    "Venus": <><circle cx="12" cy="9" r="5" /><line x1="12" y1="14" x2="12" y2="22" /><line x1="9" y1="18" x2="15" y2="18" /></>,
    "Mars": <><circle cx="10" cy="14" r="5" /><line x1="14" y1="10" x2="20" y2="4" /><polyline points="15,4 20,4 20,9" /></>,
    "Jupiter": <><path d="M7 4 C4 4, 4 10, 7 10 L18 10" /><line x1="14" y1="4" x2="14" y2="20" /></>,
    "Saturne": <><line x1="10" y1="4" x2="10" y2="16" /><line x1="7" y1="7" x2="13" y2="7" /><path d="M10 16 C10 20, 16 20, 16 16 C16 13, 13 12, 13 12" /></>,
    "Saturn": <><line x1="10" y1="4" x2="10" y2="16" /><line x1="7" y1="7" x2="13" y2="7" /><path d="M10 16 C10 20, 16 20, 16 16 C16 13, 13 12, 13 12" /></>,
    "Uranus": <><line x1="8" y1="6" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="18" /><line x1="8" y1="12" x2="16" y2="12" /><circle cx="12" cy="4" r="2" /></>,
    "Neptune": <><line x1="12" y1="6" x2="12" y2="22" /><line x1="8" y1="18" x2="16" y2="18" /><path d="M6 6 C6 10, 12 10, 12 6 C12 10, 18 10, 18 6" /><line x1="6" y1="6" x2="6" y2="4" /><line x1="18" y1="6" x2="18" y2="4" /></>,
    "Pluton": <><circle cx="12" cy="8" r="4" /><path d="M8 8 A4 4 0 0 1 16 8" /><line x1="12" y1="12" x2="12" y2="22" /><line x1="9" y1="17" x2="15" y2="17" /></>,
    "Pluto": <><circle cx="12" cy="8" r="4" /><path d="M8 8 A4 4 0 0 1 16 8" /><line x1="12" y1="12" x2="12" y2="22" /><line x1="9" y1="17" x2="15" y2="17" /></>,
    "Ascendant": <><line x1="12" y1="4" x2="12" y2="20" /><polyline points="7,9 12,4 17,9" /><line x1="7" y1="20" x2="17" y2="20" /></>,
  };
  return map[name] ?? null;
}
