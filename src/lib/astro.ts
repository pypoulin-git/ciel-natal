// Simplified astronomical calculations for natal chart positions
// Based on Jean Meeus' "Astronomical Algorithms" and VSOP87 simplified theory
// Accuracy: ~1° for most planets (sufficient for sign determination)

export interface PlanetPosition {
  name: string;
  symbol: string;
  longitude: number; // ecliptic longitude in degrees
  sign: string;
  signIndex: number;
  degree: number; // degree within sign (0-29)
  house?: number;
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

// Simplified planetary longitudes using mean orbital elements + first-order corrections
function mercuryLongitude(T: number): number {
  const L = normalize(252.2509 + 149474.0722 * T);
  const M = normalize(174.7948 + 149472.5153 * T);
  return normalize(L + 5.7 * Math.sin(rad(M)) + 1.0 * Math.sin(rad(2 * M)));
}

function venusLongitude(T: number): number {
  const L = normalize(181.9798 + 58519.2130 * T);
  const M = normalize(50.4161 + 58517.8039 * T);
  return normalize(L + 0.727 * Math.sin(rad(M)));
}

function marsLongitude(T: number): number {
  const L = normalize(355.4330 + 19141.6964 * T);
  const M = normalize(19.3730 + 19139.8585 * T);
  return normalize(L + 10.691 * Math.sin(rad(M)) + 0.623 * Math.sin(rad(2 * M)));
}

function jupiterLongitude(T: number): number {
  const L = normalize(34.3515 + 3036.3027 * T);
  const M = normalize(20.0202 + 3034.6958 * T);
  return normalize(L + 5.555 * Math.sin(rad(M)) + 0.168 * Math.sin(rad(2 * M)));
}

function saturnLongitude(T: number): number {
  const L = normalize(50.0774 + 1223.5110 * T);
  const M = normalize(317.0207 + 1222.1138 * T);
  return normalize(L + 6.399 * Math.sin(rad(M)) + 0.319 * Math.sin(rad(2 * M)));
}

function uranusLongitude(T: number): number {
  const L = normalize(314.055 + 429.8640 * T);
  const M = normalize(142.5905 + 428.4946 * T);
  return normalize(L + 5.32 * Math.sin(rad(M)));
}

function neptuneLongitude(T: number): number {
  const L = normalize(304.349 + 219.8833 * T);
  const M = normalize(256.225 + 218.4862 * T);
  return normalize(L + 0.814 * Math.sin(rad(M)));
}

function plutoLongitude(T: number): number {
  // Very simplified — Pluto moves ~1.5° per year
  const L = normalize(238.929 + 145.1781 * T);
  return L;
}

// North Node (Mean)
function northNodeLongitude(T: number): number {
  return normalize(125.0446 - 1934.1363 * T);
}

// Calculate Ascendant (Placidus)
function calcAscendant(T: number, lst: number, latitude: number): number {
  const eps = rad(obliquity(T));
  const lstRad = rad(lst);
  const latRad = rad(latitude);

  const y = -Math.cos(lstRad);
  const x = Math.sin(lstRad) * Math.cos(eps) + Math.tan(latRad) * Math.sin(eps);
  let asc = deg(Math.atan2(y, x));
  return normalize(asc);
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
  // Use Equal house for missing parameters or extreme latitudes
  if (T === undefined || lst === undefined || latitude === undefined || Math.abs(latitude) > 66) {
    const houses: number[] = [];
    for (let i = 0; i < 12; i++) {
      houses.push(normalize(ascendant + i * 30));
    }
    return houses;
  }

  const eps = rad(obliquity(T));
  const latRad = rad(latitude);
  const lstRad = rad(lst);

  // Ascendant is house 1 cusp
  const houses: number[] = [ascendant];

  // MC (Midheaven) — house 10 cusp
  const mc = normalize(deg(Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.cos(eps))));

  // IC (Imum Coeli) — house 4 cusp
  const ic = normalize(mc + 180);

  // Placidus intermediate cusps via trisection of semi-arcs
  const lstVal = lst;

  function placidusCusp(f: number, isAboveHorizon: boolean): number {
    // f is the fraction of semi-arc (1/3 or 2/3)
    // Iterative solution for Placidus cusps
    let cusp = isAboveHorizon ? normalize(mc + f * ((ascendant + 360 - mc) % 360))
      : normalize(ic + f * ((ascendant + 180 + 360 - ic) % 360));

    for (let iter = 0; iter < 20; iter++) {
      const cuspRad = rad(cusp);
      const d = Math.asin(Math.sin(eps) * Math.sin(cuspRad));
      const ad = Math.abs(deg(Math.asin(Math.tan(latRad) * Math.tan(d))));
      const sa = isAboveHorizon ? 90 + ad : 90 - ad;
      if (sa <= 0) break; // degenerate case

      const H = normalize(lstVal - cusp);
      const target = f * sa;
      const diff = (isAboveHorizon ? H : normalize(H + 180)) - target;

      if (Math.abs(diff) < 0.01) break;

      cusp = normalize(cusp + diff * 0.5);
    }
    return cusp;
  }

  try {
    // Houses 11, 12 (above horizon, between MC and ASC)
    const h11 = placidusCusp(1 / 3, true);
    const h12 = placidusCusp(2 / 3, true);

    // Houses 2, 3 (below horizon, between ASC and IC)
    const h2 = placidusCusp(1 / 3, false);
    const h3 = placidusCusp(2 / 3, false);

    // Opposite houses: 5=11+180, 6=12+180, 8=2+180, 9=3+180
    houses[1] = h2; // House 2
    houses[2] = h3; // House 3
    houses[3] = ic; // House 4
    houses[4] = normalize(h11 + 180); // House 5
    houses[5] = normalize(h12 + 180); // House 6
    houses[6] = normalize(ascendant + 180); // House 7 (Descendant)
    houses[7] = normalize(h2 + 180); // House 8
    houses[8] = normalize(h3 + 180); // House 9
    houses[9] = mc; // House 10
    houses[10] = h11; // House 11
    houses[11] = h12; // House 12

    // Validate: all cusps should be between 0-360 and make sense
    if (houses.some((h) => isNaN(h))) throw new Error("NaN in houses");

    return houses;
  } catch {
    // Fallback to Equal house if Placidus fails
    const equalHouses: number[] = [];
    for (let i = 0; i < 12; i++) {
      equalHouses.push(normalize(ascendant + i * 30));
    }
    return equalHouses;
  }
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

  // Calculate planetary longitudes
  const planetCalcs: { name: string; symbol: string; fn: (T: number) => number }[] = [
    { name: "Soleil", symbol: "☉", fn: sunLongitude },
    { name: "Lune", symbol: "☽", fn: moonLongitude },
    { name: "Mercure", symbol: "☿", fn: mercuryLongitude },
    { name: "Venus", symbol: "♀", fn: venusLongitude },
    { name: "Mars", symbol: "♂", fn: marsLongitude },
    { name: "Jupiter", symbol: "♃", fn: jupiterLongitude },
    { name: "Saturne", symbol: "♄", fn: saturnLongitude },
    { name: "Uranus", symbol: "♅", fn: uranusLongitude },
    { name: "Neptune", symbol: "♆", fn: neptuneLongitude },
    { name: "Pluton", symbol: "⯓", fn: plutoLongitude },
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

  const planets: PlanetPosition[] = planetCalcs.map(({ name, symbol, fn }) => {
    const lon = fn(T);
    const info = toSignInfo(lon);
    const pos: PlanetPosition = { name, symbol, longitude: lon, ...info };
    if (hasTime && houses.length) {
      pos.house = getHouse(lon, houses);
    }
    return pos;
  });

  const aspects = calcAspects(planets);

  return { planets, ascendant: ascendantPos, houses, aspects };
}

export { SIGNS, SIGN_SYMBOLS };
