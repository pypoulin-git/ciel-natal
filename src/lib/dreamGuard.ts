/**
 * Server-side guards for the dream journal routes.
 *
 * Every AI route here is Bearer-authenticated, Premium-gated and quota-metered
 * before it costs us a single token. The Reverie prototype shipped these three
 * routes with NO authentication at all, two of them holding the service_role
 * key — anyone could interpret anyone's dream, on our bill. That does not come
 * across.
 *
 * The quota matters more than usual: Premium is a one-time 9.99 CAD purchase,
 * but a dream journal gets used every morning. Counters live on `profiles`,
 * mirroring the chat ones, and they are the real enforcement — the Upstash
 * limiter is a nicety we cannot rely on (not provisioned in prod).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getDreamRateLimit } from './ratelimit'
import type { DreamAstroContext } from './dreams'

/** Interpretations a Premium member can generate per calendar month. */
export const DREAM_MONTHLY_LIMIT = 30
/** Lifetime ceiling — a runaway-abuse backstop, not a product promise. */
export const DREAM_LIFETIME_LIMIT = 300
/** Images per calendar month (pricier than text, so a tighter cap). */
export const DREAM_IMAGE_MONTHLY_LIMIT = 10

export function getSupabaseAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

/**
 * Resolve the caller from their Bearer token. Never trust a userId from the
 * request body — that is the IDOR vector this codebase calls out everywhere.
 */
export async function verifyAuth(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { data } = await supabase.auth.getUser(token)
  return data?.user?.id ?? null
}

export async function isPremium(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase.from('profiles').select('is_premium').eq('id', userId).single()
  return data?.is_premium === true
}

export type Guard = { ok: true; userId: string } | { ok: false; response: NextResponse }

/** Signed in only — used by reads, so a lapsed Premium keeps their journal. */
export async function requireUser(req: NextRequest): Promise<Guard> {
  const userId = await verifyAuth(req)
  if (!userId) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { ok: true, userId }
}

/** Signed in AND Premium — used by anything that writes or costs tokens. */
export async function requirePremium(req: NextRequest): Promise<Guard> {
  const guard = await requireUser(req)
  if (!guard.ok) return guard
  if (!(await isPremium(guard.userId))) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'PREMIUM_REQUIRED' }, { status: 403 }),
    }
  }
  return guard
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7) // YYYY-MM
}

export type QuotaKind = 'interpretation' | 'image'

export interface QuotaResult {
  allowed: boolean
  remaining: number
  reason?: 'MONTHLY' | 'LIFETIME'
}

/**
 * Check and consume one unit of the caller's dream quota. Counters reset when
 * the month rolls over. Consumes on success only.
 *
 * On an unexpected failure we let the call through: a broken counter should
 * degrade to "slightly too generous", never to "the feature is down for a
 * paying member".
 */
export async function consumeDreamQuota(
  userId: string,
  kind: QuotaKind = 'interpretation',
): Promise<QuotaResult> {
  try {
    const supabase = getSupabaseAdmin()
    const { data: profile } = await supabase
      .from('profiles')
      .select('dream_used, dream_month, dream_lifetime, dream_images_used')
      .eq('id', userId)
      .single()

    const month = currentMonth()
    const sameMonth = profile?.dream_month === month
    const used = sameMonth ? (profile?.dream_used ?? 0) : 0
    const imagesUsed = sameMonth ? (profile?.dream_images_used ?? 0) : 0
    const lifetime = profile?.dream_lifetime ?? 0

    if (kind === 'image') {
      if (imagesUsed >= DREAM_IMAGE_MONTHLY_LIMIT) {
        return { allowed: false, remaining: 0, reason: 'MONTHLY' }
      }
      await supabase
        .from('profiles')
        .update({ dream_images_used: imagesUsed + 1, dream_month: month, dream_used: used })
        .eq('id', userId)
      return { allowed: true, remaining: DREAM_IMAGE_MONTHLY_LIMIT - imagesUsed - 1 }
    }

    if (lifetime >= DREAM_LIFETIME_LIMIT) {
      return { allowed: false, remaining: 0, reason: 'LIFETIME' }
    }
    if (used >= DREAM_MONTHLY_LIMIT) {
      return { allowed: false, remaining: 0, reason: 'MONTHLY' }
    }

    // Burst guard, when Redis happens to be configured.
    const limiter = getDreamRateLimit()
    if (limiter) {
      const { success } = await limiter.limit(userId)
      if (!success) return { allowed: false, remaining: 0, reason: 'MONTHLY' }
    }

    await supabase
      .from('profiles')
      .update({
        dream_used: used + 1,
        dream_month: month,
        dream_lifetime: lifetime + 1,
        dream_images_used: imagesUsed,
      })
      .eq('id', userId)

    return { allowed: true, remaining: DREAM_MONTHLY_LIMIT - used - 1 }
  } catch (err) {
    console.error('consumeDreamQuota failed:', err)
    return { allowed: true, remaining: -1 }
  }
}

export function quotaExceededResponse(result: QuotaResult, locale: 'fr' | 'en'): NextResponse {
  const lifetime = result.reason === 'LIFETIME'
  const message =
    locale === 'en'
      ? lifetime
        ? 'You have reached the overall limit for dream interpretations. Get in touch and we will sort it out.'
        : 'You have used all your dream interpretations for this month. They renew at the start of next month.'
      : lifetime
        ? "Tu as atteint la limite globale d'interprétations de rêves. Écris-nous et on arrange ça."
        : 'Tu as utilisé toutes tes interprétations de rêves ce mois-ci. Elles se renouvellent au début du mois prochain.'
  return NextResponse.json(
    { error: 'QUOTA_EXCEEDED', reason: result.reason, message },
    { status: 429 },
  )
}

// ── Input sanitizers, shared by the CRUD routes ──

/** Trim, cap length, drop empties, cap count. Tolerates a non-array. */
export function cleanStringArray(input: unknown, max: number, maxLength = 60): string[] {
  if (!Array.isArray(input)) return []
  return input
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().slice(0, maxLength))
    .filter(Boolean)
    .slice(0, max)
}

/** Coerce to an integer inside [lo, hi], or null when it isn't a number. */
export function clampInt(value: unknown, lo: number, hi: number): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return null
  return Math.min(hi, Math.max(lo, Math.round(n)))
}

/** Confirm this dream belongs to this user before doing anything with it. */
export async function loadOwnedDream(dreamId: string, userId: string) {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('dreams')
    .select(
      'id, user_id, raw_text, structured_text, title, tags, emotions, characters, places, gauge_value',
    )
    .eq('id', dreamId)
    .eq('user_id', userId)
    .maybeSingle()
  return data
}

interface StoredPlanet {
  name?: string
  sign?: string
}

/**
 * Pull the dreamer's natal Moon / Sun / Ascendant out of their most recent
 * saved chart. This is the whole point of bringing dreams into Natalune —
 * the prototype queried a `natal_charts` table that no migration ever
 * created, so the astrological context it advertised never once fired.
 *
 * Charts saved before chart_data existed hold NULL, hence the scan for the
 * newest row that actually carries positions.
 */
export async function loadAstroContext(userId: string): Promise<DreamAstroContext | null> {
  try {
    const supabase = getSupabaseAdmin()
    const { data } = await supabase
      .from('saved_charts')
      .select('chart_data, created_at')
      .eq('user_id', userId)
      .not('chart_data', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)

    const chart = data?.[0]?.chart_data as
      | { planets?: StoredPlanet[]; ascendant?: StoredPlanet | null }
      | null
      | undefined
    if (!chart?.planets) return null

    const signOf = (planetName: string) =>
      chart.planets?.find((p) => p.name === planetName)?.sign ?? undefined

    const context: DreamAstroContext = {
      moonSign: signOf('Lune'),
      sunSign: signOf('Soleil'),
      ascendant: chart.ascendant?.sign ?? undefined,
    }
    return context.moonSign || context.sunSign || context.ascendant ? context : null
  } catch {
    return null
  }
}
