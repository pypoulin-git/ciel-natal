// Server-side decoding of the share payload carried in `?c=` (opaque base64
// JSON, produced by getShareUrl in the home page). Used by the /carte share
// route and the /api/og/chart image so crawlers get chart-specific previews.

export interface SharePayload {
  n?: string // first name (absent on anonymous links)
  g?: string // genre
  j: number // day
  m: number // month
  a: number // year
  h?: number // hour
  mn?: number // minute
  ht?: number // 1 = has birth time, 0 = unknown
  l?: string // birthplace label
  la: number // latitude
  lo: number // longitude
  v?: string // voice
}

export function decodeSharePayload(c: string | undefined | null): SharePayload | null {
  if (!c) return null
  try {
    const json = Buffer.from(decodeURIComponent(c), 'base64').toString('utf8')
    const p = JSON.parse(json) as Partial<SharePayload>
    if (
      typeof p.j !== 'number' ||
      typeof p.m !== 'number' ||
      typeof p.a !== 'number' ||
      typeof p.la !== 'number' ||
      typeof p.lo !== 'number'
    ) {
      return null
    }
    // Basic sanity bounds — reject garbage before it reaches the ephemeris.
    if (p.j < 1 || p.j > 31 || p.m < 1 || p.m > 12 || p.a < 1800 || p.a > 2100) return null
    return p as SharePayload
  } catch {
    return null
  }
}
