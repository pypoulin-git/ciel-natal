"use client";

import { CARTES_GRATUIT, CARTES_PREMIUM, CHAT_GRATUIT_PAR_JOUR, CHAT_PREMIUM_PAR_MOIS } from "@/lib/offre";
import { DREAM_DICTATION_MONTHLY_MINUTES, DREAM_IMAGE_MONTHLY_LIMIT, DREAM_MONTHLY_LIMIT } from "@/lib/dreamLimits";

/**
 * Free vs Premium, row by row, as the code actually gates it (QA 2026-11:
 * the old page sold « interprétations complètes » and « export PDF », which
 * every visitor already gets). Numbers come from offre.ts / dreamLimits.ts.
 *
 * `compact` keeps the rows people decide on — used on the home page.
 */

type Cell = boolean | { fr: string; en: string };
interface Row {
  fr: string;
  en: string;
  free: Cell;
  premium: Cell;
  /** Shown in the compact (home page) version. */
  key?: boolean;
}
interface Group {
  fr: string;
  en: string;
  rows: Row[];
}

const t = (fr: string, en: string) => ({ fr, en });

const GROUPS: Group[] = [
  {
    fr: "Ta carte natale",
    en: "Your natal chart",
    rows: [
      { fr: "Carte complète : roue, planètes et aspects interprétés", en: "Full chart: wheel, planets and aspects interpreted", free: true, premium: true, key: true },
      { fr: "Export PDF", en: "PDF export", free: true, premium: true },
      { fr: "Tes planètes dans les maisons", en: "Your planets in the houses", free: t("La 1re phrase", "First sentence"), premium: t("En entier", "In full"), key: true },
      { fr: "Transits du jour, croisés avec ta carte", en: "Today's transits, crossed with your chart", free: false, premium: t("Avec lecture IA", "With AI reading"), key: true },
      { fr: "Narration audio de ta lecture", en: "Audio narration of your reading", free: false, premium: true, key: true },
      { fr: "Chat avec ton astrologue IA", en: "Chat with your AI astrologer", free: t(`${CHAT_GRATUIT_PAR_JOUR} messages par jour`, `${CHAT_GRATUIT_PAR_JOUR} messages a day`), premium: t(`${CHAT_PREMIUM_PAR_MOIS} par mois`, `${CHAT_PREMIUM_PAR_MOIS} a month`), key: true },
      { fr: "Voix et ton de lecture sur mesure", en: "Custom reading voice and tone", free: false, premium: true },
      { fr: "Cartes sauvegardées", en: "Saved charts", free: t(`${CARTES_GRATUIT} (avec un compte)`, `${CARTES_GRATUIT} (with an account)`), premium: t(`Jusqu'à ${CARTES_PREMIUM}`, `Up to ${CARTES_PREMIUM}`) },
    ],
  },
  {
    fr: "Ton année et tes liens",
    en: "Your year and your bonds",
    rows: [
      { fr: "Révolution solaire", en: "Solar return", free: t("Ascendant, cœur et maisons de l'année", "Ascendant, heart and houses of the year"), premium: t("+ maître de l'année, calendrier complet, lecture IA", "+ lord of the year, full calendar, AI reading"), key: true },
      { fr: "Synastrie (compatibilité)", en: "Synastry (compatibility)", free: t("Score et affinités", "Score and affinities"), premium: t("+ aspects croisés et lecture IA", "+ cross aspects and AI reading") },
    ],
  },
  {
    fr: "Ton journal de rêves",
    en: "Your dream journal",
    rows: [
      { fr: "Noter tes rêves, calendrier et portrait de tes nuits", en: "Record dreams, calendar and portrait of your nights", free: t("Avec un compte", "With an account"), premium: true },
      { fr: "Dicter ton rêve au réveil", en: "Dictate your dream on waking", free: false, premium: t(`${DREAM_DICTATION_MONTHLY_MINUTES} min par mois`, `${DREAM_DICTATION_MONTHLY_MINUTES} min a month`), key: true },
      { fr: "Analyse IA : trois lectures colorées par ta Lune natale", en: "AI analysis: three readings coloured by your natal Moon", free: false, premium: t(`${DREAM_MONTHLY_LIMIT} par mois`, `${DREAM_MONTHLY_LIMIT} a month`), key: true },
      { fr: "Aquarelle onirique de ton rêve", en: "Dreamlike watercolour of your dream", free: false, premium: t(`${DREAM_IMAGE_MONTHLY_LIMIT} par mois`, `${DREAM_IMAGE_MONTHLY_LIMIT} a month`) },
    ],
  },
  {
    fr: "Le ciel",
    en: "The sky",
    rows: [
      { fr: "Ciel du jour, calendrier sur 12 mois, signes, blogue", en: "Today's sky, 12-month calendar, signs, blog", free: true, premium: true },
      { fr: "Tes dates à toi dans le calendrier", en: "Your own dates in the calendar", free: false, premium: true },
    ],
  },
];

function CellView({ cell, locale, premium }: { cell: Cell; locale: "fr" | "en"; premium?: boolean }) {
  if (cell === true) {
    return (
      <span className={premium ? "text-[var(--color-accent-rose)]" : "text-[var(--color-accent-lavender)]"}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="inline-block">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
        <span className="sr-only">{locale === "fr" ? "Inclus" : "Included"}</span>
      </span>
    );
  }
  if (cell === false) {
    return (
      <span className="text-[var(--color-text-muted)]">
        <span aria-hidden="true">—</span>
        <span className="sr-only">{locale === "fr" ? "Non inclus" : "Not included"}</span>
      </span>
    );
  }
  return <span className={premium ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}>{cell[locale]}</span>;
}

export default function OffreComparatif({ locale, compact = false }: { locale: "fr" | "en"; compact?: boolean }) {
  const fr = locale === "fr";
  const groups = compact
    ? [{ fr: "", en: "", rows: GROUPS.flatMap((g) => g.rows.filter((r) => r.key)) }]
    : GROUPS;

  return (
    <div className="glass overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[20rem] border-collapse text-sm">
        <caption className="sr-only">{fr ? "Ce qui est gratuit et ce qu'ajoute Premium" : "What's free and what Premium adds"}</caption>
        <thead>
          <tr className="border-b border-[var(--color-glass-border)]">
            <th scope="col" className="w-1/2 px-4 py-4 text-left text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)]">
              <span className="sr-only">{fr ? "Fonction" : "Feature"}</span>
            </th>
            <th scope="col" className="px-3 py-4 text-center align-bottom">
              <span className="block text-xs uppercase tracking-widest text-[var(--color-accent-lavender)]">{fr ? "Gratuit" : "Free"}</span>
              <span className="mt-1 block text-[11px] font-normal text-[var(--color-text-muted)]">{fr ? "sans compte" : "no account"}</span>
            </th>
            <th scope="col" className="bg-[var(--color-accent-rose)]/[0.07] px-3 py-4 text-center align-bottom">
              <span className="block text-xs uppercase tracking-widest text-[var(--color-accent-rose)]">Premium</span>
              <span className="mt-1 block text-[11px] font-normal text-[var(--color-text-muted)]">{fr ? "9,99 $, une fois" : "$9.99, once"}</span>
            </th>
          </tr>
        </thead>
        {groups.map((g, gi) => (
          <tbody key={gi}>
            {g.fr && (
              <tr>
                <th
                  scope="colgroup"
                  colSpan={3}
                  className="px-4 pb-2 pt-6 text-left font-cinzel text-base font-medium text-[var(--color-text-primary)]"
                >
                  {fr ? g.fr : g.en}
                </th>
              </tr>
            )}
            {g.rows.map((r) => (
              <tr key={r.fr} className="border-b border-[var(--color-glass-border)]/60 last:border-0">
                <th scope="row" className="px-4 py-3 text-left font-normal leading-snug text-[var(--color-text-primary)]">
                  {fr ? r.fr : r.en}
                </th>
                <td className="px-3 py-3 text-center text-xs leading-snug">
                  <CellView cell={r.free} locale={locale} />
                </td>
                <td className="bg-[var(--color-accent-rose)]/[0.07] px-3 py-3 text-center text-xs leading-snug">
                  <CellView cell={r.premium} locale={locale} premium />
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}
