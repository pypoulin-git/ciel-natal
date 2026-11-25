/**
 * The Premium offer, in one place.
 *
 * Every number a visitor can read (pages, meta, JSON-LD, emails, terms) and
 * every limit the API enforces comes from here, so the copy can't drift from
 * the code again. The QA of 2026-11 found « chat illimité » sold against a
 * 200/month cap, « 10 cartes » against 200, and an « abonnement » that is a
 * one-time payment.
 *
 * Client-safe: no server imports.
 */

/** One-time price, Canadian dollars. Premium is a lifetime purchase, not a subscription. */
export const PRIX_CAD = 9.99;

/** Money-back window after purchase, in days. */
export const REMBOURSEMENT_JOURS = 14;

/** AI chat messages for a visitor or a free account, per rolling 24 h. */
export const CHAT_GRATUIT_PAR_JOUR = 5;

/** AI chat messages for a Premium member, per 30 days. */
export const CHAT_PREMIUM_PAR_MOIS = 200;

/** Lifetime chat ceiling — an abuse backstop, not a product promise. */
export const CHAT_PREMIUM_A_VIE = 2000;

/** Saved natal charts. */
export const CARTES_GRATUIT = 3;
export const CARTES_PREMIUM = 200;

/** « 9,99 $ » / « $9.99 » */
export function prixAffiche(locale: "fr" | "en"): string {
  return locale === "fr" ? `${PRIX_CAD.toFixed(2).replace(".", ",")} $` : `$${PRIX_CAD.toFixed(2)}`;
}
