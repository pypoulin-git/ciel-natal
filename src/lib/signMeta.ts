// Centralized zodiac-sign metadata (element + modality + a one-line keyword).
// Replaces the element/modality maps that were duplicated inside
// ElementBalance.tsx, and powers "what does this sign mean" tooltips next to
// otherwise-cryptic glyphs.

export type Element = "Feu" | "Terre" | "Air" | "Eau";
export type Modality = "Cardinal" | "Fixe" | "Mutable";

interface SignMetaRaw {
  element: Element;
  modality: Modality;
  keywordFr: string;
  keywordEn: string;
}

// Keyed by the canonical French sign names used across the app (astro.ts output).
const SIGN_META: Record<string, SignMetaRaw> = {
  Belier:     { element: "Feu",   modality: "Cardinal", keywordFr: "élan, initiative",        keywordEn: "drive, initiative" },
  Taureau:    { element: "Terre", modality: "Fixe",     keywordFr: "stabilité, sensualité",   keywordEn: "stability, the senses" },
  Gemeaux:    { element: "Air",   modality: "Mutable",  keywordFr: "curiosité, échange",      keywordEn: "curiosity, exchange" },
  Cancer:     { element: "Eau",   modality: "Cardinal", keywordFr: "sensibilité, foyer",      keywordEn: "sensitivity, home" },
  Lion:       { element: "Feu",   modality: "Fixe",     keywordFr: "rayonnement, cœur",       keywordEn: "radiance, heart" },
  Vierge:     { element: "Terre", modality: "Mutable",  keywordFr: "précision, soin",         keywordEn: "precision, care" },
  Balance:    { element: "Air",   modality: "Cardinal", keywordFr: "harmonie, relation",      keywordEn: "harmony, relationship" },
  Scorpion:   { element: "Eau",   modality: "Fixe",     keywordFr: "intensité, transformation", keywordEn: "intensity, transformation" },
  Sagittaire: { element: "Feu",   modality: "Mutable",  keywordFr: "quête, sens",             keywordEn: "quest, meaning" },
  Capricorne: { element: "Terre", modality: "Cardinal", keywordFr: "ambition, structure",     keywordEn: "ambition, structure" },
  Verseau:    { element: "Air",   modality: "Fixe",     keywordFr: "liberté, vision",         keywordEn: "freedom, vision" },
  Poissons:   { element: "Eau",   modality: "Mutable",  keywordFr: "intuition, compassion",   keywordEn: "intuition, compassion" },
};

const ELEMENT_NAMES_EN: Record<Element, string> = { Feu: "Fire", Terre: "Earth", Air: "Air", Eau: "Water" };
const MODALITY_NAMES_EN: Record<Modality, string> = { Cardinal: "Cardinal", Fixe: "Fixed", Mutable: "Mutable" };

export interface SignMeta {
  element: string;   // localized
  modality: string;  // localized
  keyword: string;   // localized
}

/** Resolve localized element / modality / keyword for a sign name (FR canonical). */
export function signMeta(sign: string, locale: string = "fr"): SignMeta | null {
  const raw = SIGN_META[sign];
  if (!raw) return null;
  const isFr = locale !== "en";
  return {
    element: isFr ? raw.element : ELEMENT_NAMES_EN[raw.element],
    modality: isFr ? raw.modality : MODALITY_NAMES_EN[raw.modality],
    keyword: isFr ? raw.keywordFr : raw.keywordEn,
  };
}

/** Compact one-line summary, e.g. "Feu · Cardinal · élan, initiative". */
export function signMetaLine(sign: string, locale: string = "fr"): string {
  const m = signMeta(sign, locale);
  if (!m) return "";
  return `${m.element} · ${m.modality} · ${m.keyword}`;
}
