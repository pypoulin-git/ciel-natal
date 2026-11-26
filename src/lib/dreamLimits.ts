/**
 * The dream journal's quotas, in one place.
 *
 * They live apart from `dreamGuard` so the UI can quote the real number
 * without dragging `next/server` and the Supabase admin client into a client
 * bundle. The copy on the adjust panel used to hardcode "10 par mois" beside a
 * constant that could change underneath it — one edit, two truths.
 *
 * Premium is a one-time 9.99 CAD purchase and a dream journal gets opened
 * every morning, so these are the guardrail on a recurring cost funded once.
 * Images dominate that cost: ~0.039 USD each against ~0.002 for a full
 * three-reading interpretation.
 */

/** Interpretations a Premium member can generate per calendar month. */
export const DREAM_MONTHLY_LIMIT = 30

/** Lifetime ceiling — a runaway-abuse backstop, not a product promise. */
export const DREAM_LIFETIME_LIMIT = 300

/**
 * Images per calendar month. Tighter than the text quota by an order of
 * magnitude because each one costs roughly twenty interpretations, and since
 * adjusting an image spends the same unit as painting a new one, a member who
 * retouches can reach this quickly.
 */
export const DREAM_IMAGE_MONTHLY_LIMIT = 5

/**
 * Voice dictation (Premium). Billed per started minute of audio — each
 * ≤ 60 s slice sent for transcription counts one. Gemini audio is cheap
 * (~0.2 ¢/min), so this is an abuse guard more than a cost line.
 */
export const DREAM_DICTATION_MONTHLY_MINUTES = 180

/** Longest single dictation; the recorder stops itself here. */
export const DREAM_DICTATION_MAX_SECONDS = 180

export type QuotaKind = 'interpretation' | 'image' | 'dictation'

export interface QuotaResult {
  allowed: boolean
  remaining: number
  reason?: 'MONTHLY' | 'LIFETIME'
}

/**
 * What we tell someone who has run out. Separated from the HTTP response so
 * the wording is testable — and so images stop being described as
 * "interprétations", which is what the single shared message used to say.
 */
export function quotaMessage(
  kind: QuotaKind,
  reason: QuotaResult['reason'],
  locale: 'fr' | 'en',
): string {
  const en = locale === 'en'

  if (reason === 'LIFETIME') {
    return en
      ? 'You have reached the overall limit for dream interpretations. Get in touch and we will sort it out.'
      : "Tu as atteint la limite globale d'interprétations de rêves. Écris-nous et on arrange ça."
  }

  if (kind === 'dictation') {
    return en
      ? `You have used your ${DREAM_DICTATION_MONTHLY_MINUTES} minutes of dictation for this month. You can still type your dream.`
      : `Tu as utilisé tes ${DREAM_DICTATION_MONTHLY_MINUTES} minutes de dictée ce mois-ci. Tu peux toujours taper ton rêve.`
  }

  if (kind === 'image') {
    return en
      ? `You have used your ${DREAM_IMAGE_MONTHLY_LIMIT} dream images for this month. They renew at the start of next month.`
      : `Tu as utilisé tes ${DREAM_IMAGE_MONTHLY_LIMIT} images de rêve ce mois-ci. Elles se renouvellent au début du mois prochain.`
  }

  return en
    ? 'You have used all your dream interpretations for this month. They renew at the start of next month.'
    : 'Tu as utilisé toutes tes interprétations de rêves ce mois-ci. Elles se renouvellent au début du mois prochain.'
}
