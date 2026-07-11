// Moonrise / moonset / sky progression for the visitor's approximate location.
//
// The observer position is inferred from the browser timezone (no geolocation
// prompt — a ~100 km error moves rise/set by a few minutes, invisible at the
// granularity we display). The Moon's position comes from moonEcliptic() in
// ephemeris.ts (Schlyter theory, ~2′ accuracy); altitude uses the standard
// ecliptic → equatorial → horizontal chain with topocentric parallax, and
// rise/set are found by scanning the local day in 10-minute steps with linear
// interpolation across the h₀ = −0.583° threshold (refraction + semi-diameter
// − parallax, the conventional lunar value).

import { moonEcliptic, sunMeanLongitude, daysSince2000At } from './ephemeris'

const DEG = Math.PI / 180
const sind = (x: number) => Math.sin(x * DEG)
const cosd = (x: number) => Math.cos(x * DEG)
const asind = (x: number) => Math.asin(Math.max(-1, Math.min(1, x))) / DEG
const atan2d = (y: number, x: number) => Math.atan2(y, x) / DEG
const rev = (x: number) => ((x % 360) + 360) % 360

// Approximate observer coordinates per IANA timezone — our audience map.
// Anything unknown falls back to Montréal (the site's home).
const TZ_COORDS: Record<string, [number, number]> = {
  'America/Montreal': [45.5, -73.6],
  'America/Toronto': [43.7, -79.4],
  'America/New_York': [40.7, -74.0],
  'America/Chicago': [41.9, -87.6],
  'America/Denver': [39.7, -105.0],
  'America/Edmonton': [53.5, -113.5],
  'America/Winnipeg': [49.9, -97.1],
  'America/Regina': [50.4, -104.6],
  'America/Vancouver': [49.3, -123.1],
  'America/Los_Angeles': [34.1, -118.2],
  'America/Halifax': [44.6, -63.6],
  'America/St_Johns': [47.6, -52.7],
  'America/Moncton': [46.1, -64.8],
  'America/Mexico_City': [19.4, -99.1],
  'Europe/Paris': [48.9, 2.4],
  'Europe/Brussels': [50.8, 4.4],
  'Europe/Zurich': [47.4, 8.5],
  'Europe/Geneva': [46.2, 6.1],
  'Europe/London': [51.5, -0.1],
  'Europe/Madrid': [40.4, -3.7],
  'Europe/Rome': [41.9, 12.5],
  'Europe/Berlin': [52.5, 13.4],
  'Europe/Lisbon': [38.7, -9.1],
  'Africa/Casablanca': [33.6, -7.6],
  'Africa/Algiers': [36.8, 3.1],
  'Africa/Tunis': [36.8, 10.2],
  'America/Guadeloupe': [16.2, -61.5],
  'America/Martinique': [14.6, -61.1],
  'America/Port-au-Prince': [18.5, -72.3],
  'Indian/Reunion': [-20.9, 55.5],
  'Pacific/Noumea': [-22.3, 166.4],
  'Pacific/Tahiti': [-17.5, -149.6],
}

export function coordsForTimezone(tz: string): { lat: number; lon: number } {
  const hit = TZ_COORDS[tz]
  if (hit) return { lat: hit[0], lon: hit[1] }
  return { lat: 45.5, lon: -73.6 } // Montréal
}

// Topocentric altitude of the Moon (degrees) at a given instant/place.
export function moonAltitude(date: Date, lat: number, lon: number): number {
  const d = daysSince2000At(date)
  const moon = moonEcliptic(d)

  // Ecliptic → equatorial.
  const ecl = 23.4393 - 3.563e-7 * d
  const x = cosd(moon.lon) * cosd(moon.lat)
  const y = sind(moon.lon) * cosd(moon.lat)
  const z = sind(moon.lat)
  const xe = x
  const ye = y * cosd(ecl) - z * sind(ecl)
  const ze = y * sind(ecl) + z * cosd(ecl)
  const ra = rev(atan2d(ye, xe))
  const dec = asind(ze)

  // Local sidereal time from the Sun's mean longitude (Schlyter's shortcut):
  // GMST0 = Ls + 180°, plus Earth's rotation since 0h UT, plus east longitude.
  const utHours = (date.getTime() / 86400000 + 2440587.5 - 0.5) % 1
  const lst = rev(sunMeanLongitude(d) + 180 + utHours * 360 + lon)
  const ha = rev(lst - ra)

  // Geocentric altitude, then topocentric correction (lunar parallax is
  // ~1° — ignoring it shifts rise/set by ~10 min, so it matters here).
  const alt = asind(sind(lat) * sind(dec) + cosd(lat) * cosd(dec) * cosd(ha))
  return alt - asind(1 / moon.r) * cosd(alt)
}

export interface MoonDay {
  rise: Date | null // null when the Moon doesn't rise that local day
  set: Date | null
  alwaysUp: boolean
  alwaysDown: boolean
  // Progression 0..1 between rise and set when the Moon is up (null when down
  // or when the bracketing rise/set can't be determined near the poles).
  progress: number | null
  up: boolean // is the Moon above the horizon right now
}

const H0 = -0.583 // rise/set altitude threshold for the Moon's center

// Linear interpolation of the threshold crossing between two scan samples.
function crossing(t1: number, a1: number, t2: number, a2: number): Date {
  const f = (H0 - a1) / (a2 - a1)
  return new Date(t1 + f * (t2 - t1))
}

// Scan a time window for rise/set events (10-min steps + interpolation).
function scanEvents(
  start: Date,
  hours: number,
  lat: number,
  lon: number,
): { rises: Date[]; sets: Date[]; firstAlt: number } {
  const stepMs = 10 * 60 * 1000
  const n = Math.round((hours * 60) / 10)
  const rises: Date[] = []
  const sets: Date[] = []
  let prevT = start.getTime()
  let prevA = moonAltitude(start, lat, lon)
  const firstAlt = prevA
  for (let k = 1; k <= n; k++) {
    const t = start.getTime() + k * stepMs
    const a = moonAltitude(new Date(t), lat, lon)
    if (prevA < H0 && a >= H0) rises.push(crossing(prevT, prevA, t, a))
    if (prevA >= H0 && a < H0) sets.push(crossing(prevT, prevA, t, a))
    prevT = t
    prevA = a
  }
  return { rises, sets, firstAlt }
}

// Midnight (00:00) of the observer's local calendar day, as a UTC instant.
// Derived via Intl so it respects the timezone's DST rules.
function localMidnight(now: Date, tz: string): Date {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts: Record<string, number> = {}
  for (const p of dtf.formatToParts(now)) {
    if (p.type !== 'literal') parts[p.type] = parseInt(p.value, 10)
  }
  // Interpret the local wall-clock as if it were UTC, take the difference →
  // the tz offset at `now`; midnight local = now minus elapsed local time.
  const wallAsUTC = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour % 24,
    parts.minute,
    parts.second,
  )
  const offsetMs = wallAsUTC - now.getTime()
  const midnightWallUTC = Date.UTC(parts.year, parts.month - 1, parts.day, 0, 0, 0)
  return new Date(midnightWallUTC - offsetMs)
}

// Rise/set/progression for the observer's current local day.
export function computeMoonDay(
  now: Date,
  tz?: string,
  coords?: { lat: number; lon: number },
): MoonDay {
  const zone = tz ?? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Montreal')
  const { lat, lon } = coords ?? coordsForTimezone(zone)
  const dayStart = localMidnight(now, zone)

  // Scan the local day for today's displayed rise/set…
  const day = scanEvents(dayStart, 24, lat, lon)
  const rise = day.rises[0] ?? null
  const set = day.sets[0] ?? null
  const alwaysUp = !rise && !set && day.firstAlt >= H0
  const alwaysDown = !rise && !set && day.firstAlt < H0

  // …and a wider ±26h window around "now" to bracket the current pass, so the
  // progression is correct even when the pass straddles midnight.
  const up = moonAltitude(now, lat, lon) >= H0
  let progress: number | null = null
  if (up) {
    const wide = scanEvents(new Date(now.getTime() - 26 * 3600 * 1000), 52, lat, lon)
    const lastRise = wide.rises.filter((r) => r.getTime() <= now.getTime()).pop() ?? null
    const nextSet = wide.sets.find((s) => s.getTime() > now.getTime()) ?? null
    if (lastRise && nextSet && nextSet.getTime() > lastRise.getTime()) {
      progress = (now.getTime() - lastRise.getTime()) / (nextSet.getTime() - lastRise.getTime())
      progress = Math.max(0, Math.min(1, progress))
    }
  }

  return { rise, set, alwaysUp, alwaysDown, progress, up }
}
