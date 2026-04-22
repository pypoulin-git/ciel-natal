import type { Genre } from "@/lib/chartHelpers";
import { genderize } from "@/lib/chartHelpers";

export type VoiceKey = "sensible" | "mystique" | "pragmatique";

export const VOICES: VoiceKey[] = ["sensible", "mystique", "pragmatique"];

type Dict = Record<string, Record<string, string>>;
type HouseDict = Record<string, Record<number, string>>;
type AspectDict = Record<string, Record<string, string>>;

export interface InterpModule {
  planetInSign: Dict;
  planetInHouse: HouseDict;
  aspectInterpretations?: AspectDict;
  variants?: Partial<Record<VoiceKey, {
    planetInSign?: Dict;
    planetInHouse?: HouseDict;
    aspectInterpretations?: AspectDict;
  }>>;
  getInterpretation?: (
    p: string,
    s: string,
    h: number | undefined,
    prefs: { tone: number; depth: number; focus: number }
  ) => string;
}

export interface GetInterpOptions {
  voice: VoiceKey;
  genre: Genre;
  isPremium: boolean;
}

function firstSentence(text: string): string {
  if (!text) return "";
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0] : text;
}

export function getPlanetInterp(
  mod: InterpModule | null,
  planet: string,
  sign: string,
  house: number | undefined,
  opts: GetInterpOptions
): string {
  if (!mod) return "";
  const variant = mod.variants?.[opts.voice];
  const signText =
    variant?.planetInSign?.[planet]?.[sign] ??
    mod.planetInSign?.[planet]?.[sign] ??
    "";
  const houseText = house
    ? variant?.planetInHouse?.[planet]?.[house] ??
      mod.planetInHouse?.[planet]?.[house] ??
      ""
    : "";
  let text = signText;
  if (houseText) text += (text ? "\n\n" : "") + houseText;
  const gendered = genderize(text, opts.genre);
  return opts.isPremium ? gendered : firstSentence(gendered);
}

export function getAspectInterp(
  mod: InterpModule | null,
  type: string,
  p1: string,
  p2: string,
  opts: GetInterpOptions
): string {
  if (!mod) return "";
  const variant = mod.variants?.[opts.voice];
  const fromVariant =
    variant?.aspectInterpretations?.[type]?.[`${p1}-${p2}`] ||
    variant?.aspectInterpretations?.[type]?.[`${p2}-${p1}`];
  const fromBase =
    mod.aspectInterpretations?.[type]?.[`${p1}-${p2}`] ||
    mod.aspectInterpretations?.[type]?.[`${p2}-${p1}`] ||
    "";
  const raw = fromVariant ?? fromBase;
  const gendered = genderize(raw, opts.genre);
  return opts.isPremium ? gendered : firstSentence(gendered);
}
