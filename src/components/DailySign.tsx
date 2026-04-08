"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n";
import { SignIcon } from "@/components/AstroIcons";

const SIGN_DATA = [
  { fr: "Bélier", en: "Aries", glyph: "♈", start: [3, 21], end: [4, 19] },
  { fr: "Taureau", en: "Taurus", glyph: "♉", start: [4, 20], end: [5, 20] },
  { fr: "Gémeaux", en: "Gemini", glyph: "♊", start: [5, 21], end: [6, 20] },
  { fr: "Cancer", en: "Cancer", glyph: "♋", start: [6, 21], end: [7, 22] },
  { fr: "Lion", en: "Leo", glyph: "♌", start: [7, 23], end: [8, 22] },
  { fr: "Vierge", en: "Virgo", glyph: "♍", start: [8, 23], end: [9, 22] },
  { fr: "Balance", en: "Libra", glyph: "♎", start: [9, 23], end: [10, 22] },
  { fr: "Scorpion", en: "Scorpio", glyph: "♏", start: [10, 23], end: [11, 21] },
  { fr: "Sagittaire", en: "Sagittarius", glyph: "♐", start: [11, 22], end: [12, 21] },
  { fr: "Capricorne", en: "Capricorn", glyph: "♑", start: [12, 22], end: [1, 19] },
  { fr: "Verseau", en: "Aquarius", glyph: "♒", start: [1, 20], end: [2, 18] },
  { fr: "Poissons", en: "Pisces", glyph: "♓", start: [2, 19], end: [3, 20] },
];

const DAILY_MESSAGES_FR: Record<string, string[]> = {
  Bélier: ["L'énergie est haute — idéal pour initier un projet.", "Ton audace naturelle est amplifiée aujourd'hui.", "Un moment propice pour défendre tes convictions."],
  Taureau: ["Ancre-toi dans le moment présent — ta stabilité est ta force.", "Le confort et la beauté nourrissent ton âme aujourd'hui.", "La patience porte ses fruits — continue sur ta lancée."],
  Gémeaux: ["Ta curiosité est en éveil — laisse-toi surprendre.", "Les échanges sont favorisés — communique tes idées.", "L'adaptabilité est ton super-pouvoir du jour."],
  Cancer: ["Ton intuition est particulièrement aiguisée.", "Prends soin de toi et de ceux que tu aimes.", "Un retour aux sources nourrit ton équilibre intérieur."],
  Lion: ["Ta lumière intérieure rayonne — laisse-la briller.", "La créativité t'appelle — exprime-toi librement.", "Ta générosité inspire les autres autour de toi."],
  Vierge: ["Ton sens du détail est un atout précieux.", "L'organisation apporte la clarté dont tu as besoin.", "Un moment idéal pour affiner tes projets."],
  Balance: ["L'harmonie est à portée de main — cherche l'équilibre.", "Les relations sont au centre de ta journée.", "Ton sens esthétique guide tes choix avec justesse."],
  Scorpion: ["Ta profondeur émotionnelle est ta plus grande force.", "Un moment de transformation intérieure est en cours.", "Fais confiance à ton instinct — il ne te trompe pas."],
  Sagittaire: ["L'horizon t'appelle — élargis ta perspective.", "L'optimisme est contagieux — partage-le.", "L'aventure est dans l'état d'esprit, pas seulement dans le mouvement."],
  Capricorne: ["Ta persévérance construit des fondations solides.", "La discipline d'aujourd'hui est la liberté de demain.", "Un pas de plus vers tes objectifs — continue."],
  Verseau: ["Ton originalité est un don — assume-la pleinement.", "Les idées novatrices sont favorisées.", "Ta vision du futur inspire ceux qui t'entourent."],
  Poissons: ["Ton empathie est un pont vers les autres.", "La créativité et l'imagination sont tes alliées.", "Écoute tes rêves — ils portent des messages."],
};

const DAILY_MESSAGES_EN: Record<string, string[]> = {
  Aries: ["Energy is high — perfect for starting a new project.", "Your natural boldness is amplified today.", "A great time to stand up for your beliefs."],
  Taurus: ["Ground yourself in the present — your stability is your strength.", "Comfort and beauty nourish your soul today.", "Patience is paying off — keep going."],
  Gemini: ["Your curiosity is awakened — let yourself be surprised.", "Communication flows easily today.", "Adaptability is your superpower right now."],
  Cancer: ["Your intuition is particularly sharp today.", "Take care of yourself and your loved ones.", "A return to your roots nourishes your inner balance."],
  Leo: ["Your inner light is shining — let it radiate.", "Creativity is calling — express yourself freely.", "Your generosity inspires those around you."],
  Virgo: ["Your attention to detail is a precious asset today.", "Organization brings the clarity you need.", "An ideal moment to refine your plans."],
  Libra: ["Harmony is within reach — seek balance.", "Relationships are at the center of your day.", "Your aesthetic sense guides your choices wisely."],
  Scorpio: ["Your emotional depth is your greatest strength.", "An inner transformation is underway.", "Trust your instincts — they won't mislead you."],
  Sagittarius: ["The horizon is calling — broaden your perspective.", "Optimism is contagious — share it.", "Adventure is a state of mind, not just movement."],
  Capricorn: ["Your perseverance builds solid foundations.", "Today's discipline is tomorrow's freedom.", "One more step toward your goals — keep going."],
  Aquarius: ["Your originality is a gift — own it fully.", "Innovative ideas are favored today.", "Your vision of the future inspires those around you."],
  Pisces: ["Your empathy is a bridge to others.", "Creativity and imagination are your allies.", "Listen to your dreams — they carry messages."],
};

function getCurrentSign(): typeof SIGN_DATA[0] {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();

  for (const sign of SIGN_DATA) {
    const [sm, sd] = sign.start;
    const [em, ed] = sign.end;
    if (sm <= em) {
      if ((m === sm && d >= sd) || (m === em && d <= ed) || (m > sm && m < em)) return sign;
    } else {
      if ((m === sm && d >= sd) || (m === em && d <= ed) || m > sm || m < em) return sign;
    }
  }
  return SIGN_DATA[0];
}

function getDailyMessage(signFr: string, signEn: string, locale: string): string {
  const messages = locale === "fr" ? DAILY_MESSAGES_FR[signFr] : DAILY_MESSAGES_EN[signEn];
  if (!messages) return "";
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return messages[dayOfYear % messages.length];
}

export default function DailySign() {
  const { locale } = useLocale();
  const sign = getCurrentSign();
  const name = locale === "fr" ? sign.fr : sign.en;
  const fallback = getDailyMessage(sign.fr, sign.en, locale);
  const label = locale === "fr" ? "Énergie du jour" : "Today's energy";

  // Fetch the dynamic cosmic forecast (updated daily by the Vercel cron).
  // Gracefully falls back to the static per-sign message if the cron hasn't
  // run yet or the API is unavailable.
  const [dynamicMsg, setDynamicMsg] = useState<{ fr: string; en: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/daily-forecast")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.fr && data?.en) {
          setDynamicMsg({ fr: data.fr, en: data.en });
        }
      })
      .catch(() => {
        /* silent fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const message = dynamicMsg ? (locale === "fr" ? dynamicMsg.fr : dynamicMsg.en) : fallback;

  return (
    <div className="glass px-5 py-4 max-w-sm mx-auto text-center">
      <div className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)] mb-2">{label}</div>
      <div className="flex items-center justify-center gap-3 mb-2">
        <SignIcon name={sign.fr} size={26} color="var(--color-accent-lavender)" glow />
        <span className="font-cinzel text-xl text-[var(--color-text-primary)]">{name}</span>
      </div>
      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{message}</p>
    </div>
  );
}
