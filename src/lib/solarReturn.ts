// Solar return — the chart of the exact instant the Sun comes back to its
// natal longitude, cast for the place where the person spends that birthday.
// It is read as the weather of the year that runs from one return to the next.
//
// Everything here is pure (no DOM, no fetch) so it can be unit-tested and
// reused server-side for the AI context.

import {
  calculateChartAtUtc,
  houseOf,
  sunLongitudeAtUtc,
  SIGNS,
  type NatalChart,
} from "./astro";
import { localBirthToUtc, timeZoneAt, type BirthUtc } from "./birthTime";
import { computeCalendar, type EclipseKind } from "./skyCalendar";
import { daysSince2000At, geocentricLongitudes } from "./ephemeris";

const DAY_MS = 86400000;

export interface BirthInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  hasTime: boolean;
  latitude: number;
  longitude: number;
}

export interface Place {
  latitude: number;
  longitude: number;
  label?: string;
}

export type AngleKey = "asc" | "mc" | "dsc" | "ic";

export interface YearEvent {
  kind: "eclipse-solar" | "eclipse-lunar" | "retrograde";
  date: Date;
  /** Retrogrades only: the direct station, when it falls inside the search window. */
  until?: Date;
  planet?: string;
  sign: string;
  /** House of the solar return the event falls in (precise charts only). */
  house?: number;
  eclipseKind?: EclipseKind;
}

export interface SolarReturn {
  /** False without a birth time: the return instant is then only known to ±12 h. */
  precise: boolean;
  birth: BirthUtc;
  natal: NatalChart;
  chart: NatalChart;
  start: Date;
  end: Date;
  /** Age turned at this birthday. */
  age: number;
  place: Place;
  placeTimeZone: string | null;
  ascendant: { sign: string; degree: number; longitude: number } | null;
  midheaven: { sign: string; degree: number; longitude: number } | null;
  sunHouse: number | null;
  moon: { sign: string; house: number | null };
  angular: { planet: string; angle: AngleKey; orb: number }[];
  houses: { house: number; weight: number; planets: string[] }[];
  /** Natal house the return Ascendant falls into. */
  ascInNatalHouse: number | null;
  /** Annual profection: the natal house (whole sign) the year activates, and its lord. */
  profection: { house: number; sign: string; lord: string; lordHouse: number | null } | null;
  events: YearEvent[];
}

/** Signed difference a − b folded into (−180, 180]. */
export function angleDelta(a: number, b: number): number {
  let d = (((a - b) % 360) + 360) % 360;
  if (d > 180) d -= 360;
  return d;
}

/**
 * Exact UTC instant the Sun reaches `targetLon` within ±4 days of `around`.
 * The Sun moves ~1°/day and never stations, so a bisection on the signed
 * offset converges to well under a second in ~40 steps.
 */
export function findSunReturn(targetLon: number, around: Date): Date {
  let lo = around.getTime() - 4 * DAY_MS;
  let hi = around.getTime() + 4 * DAY_MS;
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2;
    if (angleDelta(sunLongitudeAtUtc(new Date(mid)), targetLon) < 0) lo = mid;
    else hi = mid;
  }
  return new Date((lo + hi) / 2);
}

/** Birth instant in UTC: real clock time when known, local noon otherwise. */
export function birthInstant(b: BirthInput): BirthUtc {
  return localBirthToUtc(
    b.year,
    b.month,
    b.day,
    b.hasTime ? b.hour : 12,
    b.hasTime ? b.minute : 0,
    b.latitude,
    b.longitude,
  );
}

/** Natal chart computed from the real UTC birth instant. */
export function natalChartFor(b: BirthInput): { chart: NatalChart; birth: BirthUtc } {
  const birth = birthInstant(b);
  const full = calculateChartAtUtc(birth.date, b.latitude, b.longitude);
  if (b.hasTime) return { chart: full, birth };
  // Without a time, angles and houses are meaningless: strip them.
  return {
    chart: {
      ...full,
      ascendant: null,
      houses: [],
      planets: full.planets.map(({ house: _house, ...p }) => p),
    },
    birth,
  };
}

/**
 * Return instant for the birthday falling in calendar year `year`.
 */
export function returnForYear(natalSunLon: number, birth: Date, year: number): Date {
  const around = new Date(
    Date.UTC(year, birth.getUTCMonth(), birth.getUTCDate(), birth.getUTCHours(), birth.getUTCMinutes()),
  );
  return findSunReturn(natalSunLon, around);
}

/**
 * The solar year in force at `now` (the return that most recently began),
 * shifted by `offset` years (+1 = the next one).
 */
export function solarYearAt(
  natalSunLon: number,
  birth: Date,
  now: Date,
  offset = 0,
): { start: Date; end: Date; year: number } {
  let year = now.getUTCFullYear();
  if (returnForYear(natalSunLon, birth, year).getTime() > now.getTime()) year -= 1;
  year += offset;
  return {
    year,
    start: returnForYear(natalSunLon, birth, year),
    end: returnForYear(natalSunLon, birth, year + 1),
  };
}

/** Traditional rulers — the profection lord is always a visible planet. */
const RULER: Record<string, string> = {
  Belier: "Mars",
  Taureau: "Venus",
  Gemeaux: "Mercure",
  Cancer: "Lune",
  Lion: "Soleil",
  Vierge: "Mercure",
  Balance: "Venus",
  Scorpion: "Mars",
  Sagittaire: "Jupiter",
  Capricorne: "Saturne",
  Verseau: "Saturne",
  Poissons: "Jupiter",
};

/** How much a planet weighs when we say where the year "happens". */
const WEIGHT: Record<string, number> = {
  Soleil: 3,
  Lune: 2,
  Mercure: 1,
  Venus: 1,
  Mars: 1,
  Jupiter: 1,
  Saturne: 1,
  Uranus: 0.5,
  Neptune: 0.5,
  Pluton: 0.5,
};

const ANGULAR_ORB = 6;
const RETRO_PLANETS = new Set(["Mercure", "Venus", "Mars", "Jupiter", "Saturne"]);

function signInfo(longitude: number) {
  const norm = ((longitude % 360) + 360) % 360;
  return { sign: SIGNS[Math.floor(norm / 30)], degree: Math.floor(norm % 30), longitude: norm };
}

function parseDay(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`);
}

/** Eclipses and retrograde stations inside [start, end), placed in the return's houses. */
export function yearEvents(chart: NatalChart, start: Date, end: Date, precise: boolean): YearEvent[] {
  // A few extra months so a retrograde that starts late still finds its end.
  const months = Math.ceil((end.getTime() - start.getTime()) / (30 * DAY_MS)) + 4;
  const all = computeCalendar(start, months).flatMap((m) => m.events);
  const houseFor = (lon: number) => (precise && chart.houses.length ? houseOf(lon, chart.houses) : undefined);
  const out: YearEvent[] = [];

  for (let i = 0; i < all.length; i++) {
    const e = all[i];
    const date = e.atISO ? new Date(e.atISO) : parseDay(e.dateISO);
    if (date < start || date >= end) continue;

    if (e.type === "eclipse-solar" || e.type === "eclipse-lunar") {
      const sun = sunLongitudeAtUtc(date);
      const lon = e.type === "eclipse-solar" ? sun : sun + 180;
      out.push({
        kind: e.type,
        date,
        sign: signInfo(lon).sign,
        house: houseFor(lon),
        eclipseKind: e.eclipseKind,
      });
    } else if (e.type === "retro-begin" && e.planetKey && RETRO_PLANETS.has(e.planetKey)) {
      const lon = geocentricLongitudes(daysSince2000At(date))[e.planetKey];
      const endEvt = all
        .slice(i + 1)
        .find((x) => x.type === "retro-end" && x.planetKey === e.planetKey);
      out.push({
        kind: "retrograde",
        date,
        until: endEvt ? parseDay(endEvt.dateISO) : undefined,
        planet: e.planetKey,
        sign: signInfo(lon).sign,
        house: houseFor(lon),
      });
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function computeSolarReturn(
  birthInput: BirthInput,
  place: Place,
  now: Date = new Date(),
  offset = 0,
): SolarReturn {
  const { chart: natal, birth } = natalChartFor(birthInput);
  const precise = birthInput.hasTime;
  const natalSun = natal.planets[0].longitude;
  const { start, end, year } = solarYearAt(natalSun, birth.date, now, offset);
  const chart = calculateChartAtUtc(start, place.latitude, place.longitude);

  const asc = chart.ascendant ? signInfo(chart.ascendant.longitude) : null;
  const mcLon = chart.houses.length ? chart.houses[9] : null;
  const mc = mcLon != null ? signInfo(mcLon) : null;

  const planetsNoNode = chart.planets.filter((p) => p.name !== "Noeud Nord");

  const angular: SolarReturn["angular"] = [];
  if (precise && asc && mcLon != null) {
    const angles: [AngleKey, number][] = [
      ["asc", asc.longitude],
      ["mc", mcLon],
      ["dsc", asc.longitude + 180],
      ["ic", mcLon + 180],
    ];
    for (const p of planetsNoNode) {
      for (const [angle, lon] of angles) {
        const orb = Math.abs(angleDelta(p.longitude, lon));
        if (orb <= ANGULAR_ORB) angular.push({ planet: p.name, angle, orb: Math.round(orb * 10) / 10 });
      }
    }
    angular.sort((a, b) => a.orb - b.orb);
  }

  const houses = Array.from({ length: 12 }, (_, i) => ({ house: i + 1, weight: 0, planets: [] as string[] }));
  if (precise) {
    for (const p of planetsNoNode) {
      if (!p.house) continue;
      const h = houses[p.house - 1];
      h.weight += WEIGHT[p.name] ?? 0.5;
      h.planets.push(p.name);
    }
  }

  const sun = chart.planets.find((p) => p.name === "Soleil");
  const moon = chart.planets.find((p) => p.name === "Lune")!;

  const age = year - birthInput.year;
  let profection: SolarReturn["profection"] = null;
  let ascInNatalHouse: number | null = null;
  if (precise && natal.ascendant && natal.houses.length) {
    const sign = SIGNS[(natal.ascendant.signIndex + age) % 12];
    const lord = RULER[sign];
    const lordInReturn = chart.planets.find((p) => p.name === lord);
    profection = { house: (age % 12) + 1, sign, lord, lordHouse: lordInReturn?.house ?? null };
    if (asc) ascInNatalHouse = houseOf(asc.longitude, natal.houses);
  }

  return {
    precise,
    birth,
    natal,
    chart,
    start,
    end,
    age,
    place,
    placeTimeZone: timeZoneAt(place.latitude, place.longitude),
    ascendant: precise ? asc : null,
    midheaven: precise ? mc : null,
    sunHouse: precise ? (sun?.house ?? null) : null,
    moon: { sign: moon.sign, house: precise ? (moon.house ?? null) : null },
    angular,
    houses,
    ascInNatalHouse,
    profection,
    events: yearEvents(chart, start, end, precise),
  };
}

/** Plain-text summary handed to the AI reading. Internal French keys, on purpose. */
export function serializeSolarReturn(sr: SolarReturn): string {
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const lines: string[] = [];
  lines.push(`Année solaire : du ${fmt(sr.start)} au ${fmt(sr.end)} (${sr.age} ans).`);
  if (sr.ascendant) lines.push(`Ascendant de la révolution : ${sr.ascendant.sign} ${sr.ascendant.degree}°.`);
  if (sr.midheaven) lines.push(`Milieu du Ciel de la révolution : ${sr.midheaven.sign} ${sr.midheaven.degree}°.`);
  if (sr.sunHouse) lines.push(`Soleil de la révolution en maison ${sr.sunHouse}.`);
  lines.push(`Lune de la révolution en ${sr.moon.sign}${sr.moon.house ? `, maison ${sr.moon.house}` : ""}.`);
  if (sr.angular.length) {
    lines.push(
      `Planètes angulaires : ${sr.angular.map((a) => `${a.planet} sur ${a.angle.toUpperCase()} (${a.orb}°)`).join(", ")}.`,
    );
  }
  const loaded = sr.houses.filter((h) => h.weight > 0).sort((a, b) => b.weight - a.weight).slice(0, 4);
  if (loaded.length) {
    lines.push(`Maisons les plus chargées : ${loaded.map((h) => `M${h.house} (${h.planets.join(", ")})`).join(" ; ")}.`);
  }
  if (sr.ascInNatalHouse) lines.push(`L'Ascendant de la révolution tombe dans la maison ${sr.ascInNatalHouse} natale.`);
  if (sr.profection) {
    lines.push(
      `Profection annuelle : maison ${sr.profection.house} natale (${sr.profection.sign}), maître de l'année ${sr.profection.lord}${
        sr.profection.lordHouse ? `, placé en maison ${sr.profection.lordHouse} de la révolution` : ""
      }.`,
    );
  }
  lines.push(
    `Positions de la révolution : ${sr.chart.planets
      .filter((p) => p.name !== "Noeud Nord")
      .map((p) => `${p.name} ${p.sign} ${p.degree}°${p.retrograde ? " R" : ""}${sr.precise && p.house ? ` M${p.house}` : ""}`)
      .join(", ")}.`,
  );
  lines.push(
    `Positions natales : ${sr.natal.planets
      .filter((p) => p.name !== "Noeud Nord")
      .map((p) => `${p.name} ${p.sign}${p.house ? ` M${p.house}` : ""}`)
      .join(", ")}${sr.natal.ascendant ? `, Ascendant ${sr.natal.ascendant.sign}` : ""}.`,
  );
  if (sr.events.length) {
    lines.push("Temps forts du ciel pendant l'année :");
    for (const e of sr.events) {
      const where = `${e.sign}${e.house ? `, maison ${e.house} de la révolution` : ""}`;
      if (e.kind === "retrograde") {
        lines.push(`- ${e.planet} rétrograde du ${fmt(e.date)}${e.until ? ` au ${fmt(e.until)}` : ""} en ${where}`);
      } else {
        lines.push(`- Éclipse ${e.kind === "eclipse-solar" ? "solaire" : "lunaire"} ${e.eclipseKind ?? ""} le ${fmt(e.date)} en ${where}`);
      }
    }
  }
  return lines.join("\n");
}
