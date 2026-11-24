// Natal chart from a birth as people state it: the date and the clock time
// *of the birthplace*. Every natal chart on the site goes through here so the
// wall time is converted to Universal Time (historical DST included) before
// it reaches the ephemeris — `calculateNatalChart` itself reads UT.

import { calculateNatalChart, type NatalChart } from "./astro";
import { localBirthToUtc } from "./birthTime";

export function natalChart(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  latitude: number,
  longitude: number,
  hasTime: boolean,
): NatalChart {
  // Unknown time: local noon, the least-wrong guess for the Moon.
  const { date } = localBirthToUtc(
    year,
    month,
    day,
    hasTime ? hour : 12,
    hasTime ? minute : 0,
    latitude,
    longitude,
  );
  return calculateNatalChart(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    latitude,
    longitude,
    hasTime,
  );
}
