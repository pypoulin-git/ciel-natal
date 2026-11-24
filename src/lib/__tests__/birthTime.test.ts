import { describe, it, expect } from "vitest";
import { localBirthToUtc, timeZoneAt } from "../birthTime";
import { natalChart } from "../natal";

const MONTREAL = { latitude: 45.5017, longitude: -73.5673 };
const PARIS = { latitude: 48.8566, longitude: 2.3522 };

describe("localBirthToUtc", () => {
  it("finds the IANA zone from coordinates", () => {
    expect(timeZoneAt(MONTREAL.latitude, MONTREAL.longitude)).toBe("America/Toronto");
    expect(timeZoneAt(PARIS.latitude, PARIS.longitude)).toBe("Europe/Paris");
  });

  it("applies daylight time in summer and standard time in winter", () => {
    const summer = localBirthToUtc(1990, 6, 15, 8, 0, MONTREAL.latitude, MONTREAL.longitude);
    expect(summer.date.toISOString()).toBe("1990-06-15T12:00:00.000Z");
    expect(summer.offsetMinutes).toBe(-240);

    const winter = localBirthToUtc(1990, 1, 15, 8, 0, MONTREAL.latitude, MONTREAL.longitude);
    expect(winter.date.toISOString()).toBe("1990-01-15T13:00:00.000Z");
  });

  it("handles zones east of Greenwich", () => {
    const r = localBirthToUtc(2000, 7, 1, 8, 30, PARIS.latitude, PARIS.longitude);
    expect(r.date.toISOString()).toBe("2000-07-01T06:30:00.000Z");
  });

  it("still gives a zone in open sea (nautical Etc/GMT zones)", () => {
    const r = localBirthToUtc(2000, 1, 1, 12, 0, 30, -40);
    expect(r.timeZone).toMatch(/^Etc\/GMT/);
    expect(Math.abs(r.offsetMinutes)).toBeLessThanOrEqual(240);
  });
});

describe("natalChart", () => {
  it("reads the birth time on the birthplace clock", () => {
    // 08:00 EDT in Montréal is 12:00 UT: the Sun must be ~3 h above the
    // eastern horizon, i.e. in house 11 or 12 — not below the horizon.
    const c = natalChart(1990, 6, 15, 8, 0, MONTREAL.latitude, MONTREAL.longitude, true);
    expect([11, 12]).toContain(c.planets[0].house);
  });
});
