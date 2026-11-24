// Birth time → Universal Time.
//
// People give their birth time on the clock of the place they were born
// (« 8 h 10 à Montréal »). The ephemeris works in Universal Time, so the wall
// time has to be shifted by that place's UTC offset *on that date* — standard
// vs daylight time included. The IANA zone comes from the coordinates
// (tz-lookup), and the historical offset from the browser's / Node's own tz
// database through Intl.

import tzlookup from "@photostructure/tz-lookup";

/** IANA zone for a point, or null at sea / on lookup failure. */
export function timeZoneAt(latitude: number, longitude: number): string | null {
  try {
    return tzlookup(latitude, longitude);
  } catch {
    return null;
  }
}

/** UTC offset (minutes east of Greenwich) of `timeZone` at the instant `utcMs`. */
export function offsetMinutesAt(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - Math.floor(utcMs / 1000) * 1000) / 60000);
}

export interface BirthUtc {
  /** The birth instant in UTC. */
  date: Date;
  /** IANA zone used, or null when we fell back to solar time from the longitude. */
  timeZone: string | null;
  /** Offset applied, minutes east of Greenwich (−300 = UTC−5). */
  offsetMinutes: number;
}

/**
 * Convert a wall-clock time at (latitude, longitude) to UTC.
 *
 * Two passes settle the offset on either side of a DST change; a wall time
 * that does not exist (the skipped spring-forward hour) lands one hour later,
 * which is what the clock on the wall would have read.
 */
export function localBirthToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  latitude: number,
  longitude: number,
): BirthUtc {
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  const timeZone = timeZoneAt(latitude, longitude);

  if (!timeZone) {
    // Open sea or a lookup failure: fall back to the nautical zone.
    const offsetMinutes = Math.round(longitude / 15) * 60;
    return { date: new Date(wall - offsetMinutes * 60000), timeZone: null, offsetMinutes };
  }

  let offset = offsetMinutesAt(wall, timeZone);
  let utc = wall - offset * 60000;
  const second = offsetMinutesAt(utc, timeZone);
  if (second !== offset) {
    offset = second;
    utc = wall - offset * 60000;
  }
  return { date: new Date(utc), timeZone, offsetMinutes: offset };
}

/** Wall-clock date and time of a UTC instant in a given zone (for display). */
export function formatInZone(date: Date, timeZone: string | null, locale: "fr" | "en"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    timeZone: timeZone ?? "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
