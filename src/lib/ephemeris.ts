// Compact geocentric ephemeris (Paul Schlyter's low-precision method).
//
// Why this exists: src/lib/astro.ts computes *heliocentric mean* longitudes
// whose dominant linear term always increases — so planets there never appear
// retrograde. Retrograde motion is a purely *geocentric* effect (it comes from
// Earth overtaking the other planet), so it requires real geocentric positions.
// This module computes them from Keplerian orbital elements, which correctly
// reproduces retrograde loops, stations, and current planet-to-planet aspects.
//
// Accuracy ~1–2° in longitude (stations good to a few days) — plenty for a
// "sky today" panel. The natal-chart code is left untouched.

const DEG = Math.PI / 180
const sind = (x: number) => Math.sin(x * DEG)
const cosd = (x: number) => Math.cos(x * DEG)
const atan2d = (y: number, x: number) => Math.atan2(y, x) / DEG
const rev = (x: number) => ((x % 360) + 360) % 360

// Days since the epoch 2000 Jan 0.0 TT (JD 2451543.5), at 12:00 UTC of `date`.
function daysSince2000(date: Date): number {
  const jd =
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0) / 86400000 +
    2440587.5
  return jd - 2451543.5
}

interface Elements {
  N: (d: number) => number // longitude of ascending node
  i: (d: number) => number // inclination
  w: (d: number) => number // argument of perihelion
  a: number // semi-major axis (AU)
  e: (d: number) => number // eccentricity
  M: (d: number) => number // mean anomaly
}

// Internal French planet keys (matching astro.ts / skyInterpretations.ts).
export const EPHEM_PLANETS = [
  'Mercure',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturne',
  'Uranus',
  'Neptune',
] as const

const ELEMENTS: Record<string, Elements> = {
  Mercure: {
    N: (d) => 48.3313 + 3.24587e-5 * d,
    i: (d) => 7.0047 + 5.0e-8 * d,
    w: (d) => 29.1241 + 1.01444e-5 * d,
    a: 0.387098,
    e: (d) => 0.205635 + 5.59e-10 * d,
    M: (d) => 168.6562 + 4.0923344368 * d,
  },
  Venus: {
    N: (d) => 76.6799 + 2.4659e-5 * d,
    i: (d) => 3.3946 + 2.75e-8 * d,
    w: (d) => 54.891 + 1.38374e-5 * d,
    a: 0.72333,
    e: (d) => 0.006773 - 1.302e-9 * d,
    M: (d) => 48.0052 + 1.6021302244 * d,
  },
  Mars: {
    N: (d) => 49.5574 + 2.11081e-5 * d,
    i: (d) => 1.8497 - 1.78e-8 * d,
    w: (d) => 286.5016 + 2.92961e-5 * d,
    a: 1.523688,
    e: (d) => 0.093405 + 2.516e-9 * d,
    M: (d) => 18.6021 + 0.5240207766 * d,
  },
  Jupiter: {
    N: (d) => 100.4542 + 2.76854e-5 * d,
    i: (d) => 1.303 - 1.557e-7 * d,
    w: (d) => 273.8777 + 1.64505e-5 * d,
    a: 5.20256,
    e: (d) => 0.048498 + 4.469e-9 * d,
    M: (d) => 19.895 + 0.0830853001 * d,
  },
  Saturne: {
    N: (d) => 113.6634 + 2.3898e-5 * d,
    i: (d) => 2.4886 - 1.081e-7 * d,
    w: (d) => 339.3939 + 2.97661e-5 * d,
    a: 9.55475,
    e: (d) => 0.055546 - 9.499e-9 * d,
    M: (d) => 316.967 + 0.0334442282 * d,
  },
  Uranus: {
    N: (d) => 74.0005 + 1.3978e-5 * d,
    i: (d) => 0.7733 + 1.9e-8 * d,
    w: (d) => 96.6612 + 3.0565e-5 * d,
    a: 19.18171,
    e: (d) => 0.047318 + 7.45e-9 * d,
    M: (d) => 142.5905 + 0.011725806 * d,
  },
  Neptune: {
    N: (d) => 131.7806 + 3.0173e-5 * d,
    i: (d) => 1.77 - 2.55e-7 * d,
    w: (d) => 272.8461 - 6.027e-6 * d,
    a: 30.05826,
    e: (d) => 0.008606 + 2.15e-9 * d,
    M: (d) => 260.2471 + 0.005995147 * d,
  },
}

// Solve Kepler's equation for the eccentric anomaly (degrees).
function eccentricAnomaly(M: number, e: number): number {
  M = rev(M)
  let E = M + ((e * 180) / Math.PI) * sind(M) * (1 + e * cosd(M))
  for (let n = 0; n < 12; n++) {
    const dE = (E - ((e * 180) / Math.PI) * sind(E) - M) / (1 - e * cosd(E))
    E -= dE
    if (Math.abs(dE) < 1e-6) break
  }
  return E
}

// The Sun's geocentric ecliptic longitude + its rectangular coords (AU),
// which double as the Earth→Sun vector used to make planets geocentric.
function sunGeo(d: number): { lon: number; xs: number; ys: number } {
  const w = 282.9404 + 4.70935e-5 * d
  const e = 0.016709 - 1.151e-9 * d
  const M = rev(356.047 + 0.9856002585 * d)
  const E = eccentricAnomaly(M, e)
  const xv = cosd(E) - e
  const yv = Math.sqrt(1 - e * e) * sind(E)
  const v = atan2d(yv, xv)
  const r = Math.sqrt(xv * xv + yv * yv)
  const lon = rev(v + w)
  return { lon, xs: r * cosd(lon), ys: r * sind(lon) }
}

// Geocentric ecliptic longitude (degrees) of one planet.
function planetGeoLon(key: string, d: number, xs: number, ys: number): number {
  const el = ELEMENTS[key]
  const N = el.N(d)
  const i = el.i(d)
  const w = el.w(d)
  const e = el.e(d)
  const M = el.M(d)
  const E = eccentricAnomaly(M, e)
  const xv = el.a * (cosd(E) - e)
  const yv = el.a * (Math.sqrt(1 - e * e) * sind(E))
  const v = atan2d(yv, xv)
  const r = Math.sqrt(xv * xv + yv * yv)
  const u = v + w
  // Heliocentric ecliptic rectangular (longitude only needs x,y).
  const xh = r * (cosd(N) * cosd(u) - sind(N) * sind(u) * cosd(i))
  const yh = r * (sind(N) * cosd(u) + cosd(N) * sind(u) * cosd(i))
  // Geocentric = heliocentric + Earth→Sun vector.
  return rev(atan2d(yh + ys, xh + xs))
}

export interface GeoChart {
  // Internal name → geocentric ecliptic longitude (0..360). Includes "Soleil".
  lon: Record<string, number>
}

// Geocentric longitudes of the Sun + Mercury…Neptune for a given date.
export function geocentricChart(date: Date): GeoChart {
  const d = daysSince2000(date)
  const sun = sunGeo(d)
  const lon: Record<string, number> = { Soleil: sun.lon }
  for (const key of EPHEM_PLANETS) {
    lon[key] = planetGeoLon(key, d, sun.xs, sun.ys)
  }
  return { lon }
}
