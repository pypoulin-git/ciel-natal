// The three reading voices, shared by the quick chart form and the results.
import type { VoiceKey } from "./voicePrompts";

export const VOICE_OPTIONS: { key: VoiceKey; labelFr: string; labelEn: string; descFr: string; descEn: string }[] = [
  {
    key: "sensible",
    labelFr: "Sensible", labelEn: "Feeling",
    descFr: "Adresse tendre, ressenti, corps. Reconnaît ce qui se vit.",
    descEn: "Tender voice, felt sense, body-aware. Names what you live.",
  },
  {
    key: "mystique",
    labelFr: "Mystique", labelEn: "Mystic",
    descFr: "Symboles et archétypes. Mythes, rêves, profondeurs jungiennes.",
    descEn: "Symbols and archetypes. Myths, dreams, Jungian depths.",
  },
  {
    key: "pragmatique",
    labelFr: "Pragmatique", labelEn: "Grounded",
    descFr: "Concret, lucide, terre à terre. Zéro jargon ésotérique.",
    descEn: "Grounded, lucid, practical. Zero esoteric jargon.",
  },
];
