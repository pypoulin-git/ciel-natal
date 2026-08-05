/**
 * Browser-side calls to the dream journal API.
 *
 * Every request carries the Supabase access token — the routes reject
 * anything else. Callers pass a `getToken` (from useAuth) rather than us
 * reaching for the Supabase client here, so these stay easy to test.
 */

import type { Dream, DreamInterpretationContent, DreamStructure } from './dreams'
import type { StatDream } from './dreamStats'

export interface DreamImageInfo {
  storage_path: string
  url: string | null
  width: number
  height: number
}

export interface DreamInterpretation {
  content: DreamInterpretationContent
  model_used: string
  astro_used: boolean
  created_at: string
}

export interface DreamDetail {
  dream: Dream
  interpretation: DreamInterpretation | null
  image: DreamImageInfo | null
}

export class DreamApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'DreamApiError'
  }
}

type TokenGetter = () => Promise<string | null>

async function request<T>(path: string, getToken: TokenGetter, init: RequestInit = {}): Promise<T> {
  const token = await getToken()
  if (!token) throw new DreamApiError('Not signed in', 'UNAUTHENTICATED', 401)

  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string }
    throw new DreamApiError(
      body.message ?? body.error ?? 'Request failed',
      body.error ?? 'UNKNOWN',
      res.status,
    )
  }
  return (await res.json()) as T
}

/** `month` (YYYY-MM) narrows to the calendar's month; otherwise the 50 most recent. */
export function listDreams(getToken: TokenGetter, month?: string): Promise<{ dreams: Dream[] }> {
  const query = month ? `?month=${encodeURIComponent(month)}` : ''
  return request(`/api/dreams${query}`, getToken)
}

/**
 * The dashboard's window: every dream from `since` on, aggregate columns only.
 * The account text is deliberately absent — nothing here renders a word of it.
 */
export function listDreamStats(
  getToken: TokenGetter,
  since: string,
): Promise<{ dreams: StatDream[] }> {
  return request(`/api/dreams?since=${encodeURIComponent(since)}`, getToken)
}

export function getDream(id: string, getToken: TokenGetter): Promise<DreamDetail> {
  return request(`/api/dreams/${id}`, getToken)
}

export function createDream(
  payload: Record<string, unknown>,
  getToken: TokenGetter,
): Promise<{ dream: Dream }> {
  return request('/api/dreams', getToken, { method: 'POST', body: JSON.stringify(payload) })
}

export function updateDream(
  id: string,
  payload: Record<string, unknown>,
  getToken: TokenGetter,
): Promise<{ dream: Dream }> {
  return request(`/api/dreams/${id}`, getToken, { method: 'PATCH', body: JSON.stringify(payload) })
}

export function deleteDream(id: string, getToken: TokenGetter): Promise<{ deleted: boolean }> {
  return request(`/api/dreams/${id}`, getToken, { method: 'DELETE' })
}

export function structureDream(
  rawText: string,
  locale: string,
  getToken: TokenGetter,
): Promise<DreamStructure> {
  return request('/api/dream-structure', getToken, {
    method: 'POST',
    body: JSON.stringify({ rawText, locale }),
  })
}

export function interpretDream(
  dreamId: string,
  locale: string,
  getToken: TokenGetter,
  force = false,
): Promise<DreamInterpretation & { regenerated: boolean; remaining?: number }> {
  return request('/api/dream-interpretation', getToken, {
    method: 'POST',
    body: JSON.stringify({ dreamId, locale, force }),
  })
}

/**
 * `instruction` is the dreamer's own words for what should change ("plus
 * sombre", "sans la mer"). Sending one implies a regeneration, and spends one
 * image from the monthly quota.
 */
export function generateDreamImage(
  dreamId: string,
  locale: string,
  getToken: TokenGetter,
  force = false,
  instruction?: string,
): Promise<DreamImageInfo & { regenerated: boolean; remaining?: number }> {
  return request('/api/dream-image', getToken, {
    method: 'POST',
    body: JSON.stringify({ dreamId, locale, force, instruction }),
  })
}
