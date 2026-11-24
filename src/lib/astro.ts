// Astronomical calculations for natal chart positions.
// Sun & Moon: Jean Meeus' "Astronomical Algorithms" (geocentric, ~0.01°/0.3°).
// Mercury → Pluto: geocentric ephemeris from Keplerian elements (ephemeris.ts),
// which reproduces true positions AND retrograde motion (~1° accuracy).

import { geocentricLongitudes } from "./ephemeris";

export interface PlanetPosition {
  name: string;
  symbol: string;
  longitude: number; // ecliptic longitude in degrees
  sign: string;
  signIndex: number;
  degree: number; // degree within sign (0-29)
  house?: number;
  retrograde?: boolean; // apparent backward motion at that moment (℞)
}

export interface Aspect {
  planet1: string;
  planet2: string;
  symbol1: string;
  symbol2: string;
  type: string;
  angle: number;
  orb: number;
}

export interface NatalChart {
  planets: PlanetPosition[];
  ascendant: PlanetPosition | null;
  houses: number[];
  aspects: Aspect[];
}

const SIGNS = [
  "Belier", "Taureau", "Gemeaux", "Cancer", "Lion", "Vierge",
  "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons",
];

const SIGN_SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

const SIGNS_EN: Record<string, string> = {
  Belier: "Aries", Taureau: "Taurus", Gemeaux: "Gemini", Cancer: "Cancer",
  Lion: "Leo", Vierge: "Virgo", Balance: "Libra", Scorpion: "Scorpio",
  Sagittaire: "Sagittarius", Capricorne: "Capricorn", Verseau: "Aquarius", Poissons: "Pisces",
};

/** Translate a sign name (internal French key) to the display name for a given locale */
export function translateSign(sign: string, locale: string): string {
  if (locale === "en") return SIGNS_EN[sign] || SIGNS_EN[sign.replace(/[éè]/g, "e").replace(/[à]/g, "a")] || sign;
  // Add accents for French display
  const FR_DISPLAY: Record<string, string> = {
    Belier: "Bélier", Gemeaux: "Gémeaux",
  };
  return FR_DISPLAY[sign] || sign;
}

const PLANET_NAMES_EN: Record<string, string> = {
  Soleil: "Sun", Lune: "Moon", Mercure: "Mercury", "Vénus": "Venus",
  Mars: "Mars", Jupiter: "Jupiter", Saturne: "Saturn",
  Uranus: "Uranus", Neptune: "Neptune", Pluton: "Pluto",
  "Noeud Nord": "North Node",
};

/** Translate a planet name to the display name for a given locale */
export function translatePlanet(name: string, locale: string): string {
  if (locale === "en") return PLANET_NAMES_EN[name] || name;
  return name;
}

// Convert date to Julian Day Number
function toJulianDay(year: number, month: number, day: number, hour: number = 0): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + hour / 24 + B - 1524.5;
}

// Julian centuries from J2000.0
function toJulianCenturies(jd: number): number {
  return (jd - 2451545.0) / 36525.0;
}

// Normalize angle to 0-360
function normalize(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

// Degrees to radians
function rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function deg(r: number): number {
  return (r * 180) / Math.PI;
}

// Obliquity of the ecliptic
function obliquity(T: number): number {
  return 23.4393 - 0.013 * T;
}

// Sun position (simplified)
function sunLongitude(T: number): number {
  const L0 = normalize(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = normalize(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mr = rad(M);
  const C = (1.9146 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr)
    + 0.00029 * Math.sin(3 * Mr);
  return normalize(L0 + C);
}

// Moon position (simplified)
function moonLongitude(T: number): number {
  const Lp = normalize(218.3165 + 481267.8813 * T);
  const D = normalize(297.8502 + 445267.1115 * T);
  const M = normalize(357.5291 + 35999.0503 * T);
  const Mp = normalize(134.9634 + 477198.8676 * T);
  const F = normalize(93.272 + 483202.0175 * T);

  let lon = Lp
    + 6.289 * Math.sin(rad(Mp))
    - 1.274 * Math.sin(rad(2 * D - Mp))
    + 0.658 * Math.sin(rad(2 * D))
    + 0.214 * Math.sin(rad(2 * Mp))
    - 0.186 * Math.sin(rad(M))
    - 0.114 * Math.sin(rad(2 * F));

  return normalize(lon);
}

// Mercury → Pluto longitudes now come from the geocentric ephemeris
// (src/lib/ephemeris.ts) — the old heliocentric mean-element approximations
// were ~1° off and could never show retrograde motion.

// North Node (Mean)
function northNodeLongitude(T: number): number {
  return normalize(125.0446 - 1934.1363 * T);
}

// Calculate Ascendant (Placidus)
function calcAscendant(T: number, lst: number, latitude: number): number {
  const eps = rad(obliquity(T));
  const lstRad = rad(lst);
  const latRad = rad(latitude);

  // Meeus, Astronomical Algorithms (14.3) — the quadrant matters: the
  // atan2(−cos, …) form without the sign flip lands on the *Descendant*.
  const y = Math.cos(lstRad);
  const x = -(Math.sin(lstRad) * Math.cos(eps) + Math.tan(latRad) * Math.sin(eps));
  return normalize(deg(Math.atan2(y, x)));
}

// Calculate Local Sidereal Time
function localSiderealTime(jd: number, longitude: number): number {
  const T = toJulianCenturies(jd);
  let gst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  gst = normalize(gst);
  return normalize(gst + longitude);
}

// Calculate houses — Placidus system (standard professional)
// Falls back to Equal if latitude > 66° (polar regions where Placidus fails)
function calcHouses(ascendant: number, T?: number, lst?: number, latitude?: number): number[] {
  const equal = () => Array.from({ length: 12 }, (_, i) => normalize(ascendant + i * 30));
  // Placidus is undefined inside the polar circles: Equal houses there.
  if (T === undefined || lst === undefined || latitude === undefined || Math.abs(latitude) > 66) {
    return equal();
  }

  const eps = rad(obliquity(T));
  const tanLat = Math.tan(rad(latitude));
  const ramc = lst; // right ascension of the meridian, degrees

  // Ecliptic longitude of the point whose right ascension is `ra`.
  const lonFromRa = (ra: number) =>
    normalize(deg(Math.atan2(Math.sin(rad(ra)), Math.cos(rad(ra)) * Math.cos(eps))));
  // Ascensional difference of an ecliptic point (degrees).
  const ascDiff = (lon: number) => {
    const decl = Math.asin(Math.sin(eps) * Math.sin(rad(lon)));
    const x = tanLat * Math.tan(decl);
    return deg(Math.asin(Math.max(-1, Math.min(1, x))));
  };

  // Placidus: a cusp is the ecliptic point that has travelled a fixed
  // fraction of its own semi-arc. Above the horizon (houses 11, 12) the
  // fraction is of the diurnal semi-arc east of the MC; below it (houses
  // 2, 3) of the nocturnal semi-arc west of the IC. Solved by iteration.
  const cusp = (fraction: number, above: boolean): number => {
    let ra = above ? ramc + fraction * 90 : ramc + 180 - fraction * 90;
    for (let i = 0; i < 50; i++) {
      const ad = ascDiff(lonFromRa(ra));
      const next = above ? ramc + fraction * (90 + ad) : ramc + 180 - fraction * (90 - ad);
      if (Math.abs(next - ra) < 1e-6) {
        ra = next;
        break;
      }
      ra = next;
    }
    return lonFromRa(ra);
  };

  const mc = lonFromRa(ramc);
  const h11 = cusp(1 / 3, true);
  const h12 = cusp(2 / 3, true);
  const h2 = cusp(2 / 3, false);
  const h3 = cusp(1 / 3, false);

  const opp = (x: number) => normalize(x + 180);
  const houses = [ascendant, h2, h3, opp(mc), opp(h11), opp(h12), opp(ascendant), opp(h2), opp(h3), mc, h11, h12];

  // Sanity: cusps must run forward around the zodiac, each house < 180°.
  for (let i = 0; i < 12; i++) {
    const span = normalize(houses[(i + 1) % 12] - houses[i]);
    if (!Number.isFinite(houses[i]) || span <= 0 || span >= 180) return equal();
  }
  return houses;
}

// Determine which house a planet is in
function getHouse(longitude: number, houses: number[]): number {
  for (let i = 0; i < 12; i++) {
    const start = houses[i];
    const end = houses[(i + 1) % 12];
    if (start < end) {
      if (longitude >= start && longitude < end) return i + 1;
    } else {
      if (longitude >= start || longitude < end) return i + 1;
    }
  }
  return 1;
}

// Longitude to sign info
function toSignInfo(longitude: number): { sign: string; signIndex: number; degree: number } {
  const norm = normalize(longitude);
  const signIndex = Math.floor(norm / 30);
  return {
    sign: SIGNS[signIndex],
    signIndex,
    degree: Math.floor(norm % 30),
  };
}

// Calculate aspects between planets
function calcAspects(planets: PlanetPosition[]): Aspect[] {
  const aspectTypes = [
    { name: "Conjonction", angle: 0, orb: 8 },
    { name: "Sextile", angle: 60, orb: 6 },
    { name: "Carre", angle: 90, orb: 7 },
    { name: "Trigone", angle: 120, orb: 7 },
    { name: "Opposition", angle: 180, orb: 8 },
  ];

  const aspects: Aspect[] = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      let diff = Math.abs(planets[i].longitude - planets[j].longitude);
      if (diff > 180) diff = 360 - diff;

      for (const at of aspectTypes) {
        const orb = Math.abs(diff - at.angle);
        if (orb <= at.orb) {
          aspects.push({
            planet1: planets[i].name,
            planet2: planets[j].name,
            symbol1: planets[i].symbol,
            symbol2: planets[j].symbol,
            type: at.name,
            angle: at.angle,
            orb: Math.round(orb * 10) / 10,
          });
          break;
        }
      }
    }
  }

  return aspects;
}

export function calculateNatalChart(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  latitude: number,
  longitude: number,
  hasTime: boolean
): NatalChart {
  const decimalHour = hour + minute / 60;
  const jd = toJulianDay(year, month, day, decimalHour);
  const T = toJulianCenturies(jd);

  // Geocentric planet longitudes (Mercury → Pluto) on the same timebase as jd.
  // ±1 day gives the apparent motion, hence the retrograde (℞) flag.
  const dEph = jd - 2451543.5;
  const geoNow = geocentricLongitudes(dEph);
  const geoPrev = geocentricLongitudes(dEph - 1);
  const geoNext = geocentricLongitudes(dEph + 1);
  const isRetro = (name: string): boolean => {
    let motion = (geoNext[name] - geoPrev[name]) % 360;
    if (motion > 180) motion -= 360;
    if (motion < -180) motion += 360;
    return motion < 0;
  };
  const geo = (name: string) => ({
    fn: () => geoNow[name],
    retro: isRetro(name),
  });

  // Calculate planetary longitudes
  const planetCalcs: {
    name: string;
    symbol: string;
    fn: (T: number) => number;
    retro?: boolean;
  }[] = [
    { name: "Soleil", symbol: "☉", fn: sunLongitude },
    { name: "Lune", symbol: "☽", fn: moonLongitude },
    { name: "Mercure", symbol: "☿", ...geo("Mercure") },
    { name: "Venus", symbol: "♀", ...geo("Venus") },
    { name: "Mars", symbol: "♂", ...geo("Mars") },
    { name: "Jupiter", symbol: "♃", ...geo("Jupiter") },
    { name: "Saturne", symbol: "♄", ...geo("Saturne") },
    { name: "Uranus", symbol: "♅", ...geo("Uranus") },
    { name: "Neptune", symbol: "♆", ...geo("Neptune") },
    { name: "Pluton", symbol: "⯓", ...geo("Pluton") },
    { name: "Noeud Nord", symbol: "☊", fn: northNodeLongitude },
  ];

  let ascendantPos: PlanetPosition | null = null;
  let houses: number[] = [];

  if (hasTime) {
    const lst = localSiderealTime(jd, longitude);
    const ascLon = calcAscendant(T, lst, latitude);
    houses = calcHouses(ascLon, T, lst, latitude);
    const ascInfo = toSignInfo(ascLon);
    ascendantPos = {
      name: "Ascendant",
      symbol: "↑",
      longitude: ascLon,
      ...ascInfo,
    };
  }

  const planets: PlanetPosition[] = planetCalcs.map(({ name, symbol, fn, retro }) => {
    const lon = fn(T);
    const info = toSignInfo(lon);
    const pos: PlanetPosition = { name, symbol, longitude: lon, ...info };
    if (retro) pos.retrograde = true;
    if (hasTime && houses.length) {
      pos.house = getHouse(lon, houses);
    }
    return pos;
  });

  const aspects = calcAspects(planets);

  return { planets, ascendant: ascendantPos, houses, aspects };
}

/** Apparent geocentric Sun longitude (degrees) at an exact UTC instant. */
export function sunLongitudeAtUtc(date: Date): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  return normalize(sunLongitude(toJulianCenturies(jd)));
}

/**
 * Chart for an exact UTC instant. `calculateNatalChart` reads its date/time
 * arguments as Universal Time, so this is a thin wrapper that keeps callers
 * from re-deriving UTC components by hand.
 */
export function calculateChartAtUtc(date: Date, latitude: number, longitude: number): NatalChart {
  return calculateNatalChart(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes() + date.getUTCSeconds() / 60,
    latitude,
    longitude,
    true,
  );
}

export { SIGNS, SIGN_SYMBOLS, getHouse as houseOf };
