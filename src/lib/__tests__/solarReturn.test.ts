import { describe, it, expect } from "vitest";
import {
  angleDelta,
  computeSolarReturn,
  findSunReturn,
  natalChartFor,
  solarYearAt,
} from "../solarReturn";
import { sunLongitudeAtUtc } from "../astro";

const MONTREAL = { latitude: 45.5017, longitude: -73.5673 };
const PARIS = { latitude: 48.8566, longitude: 2.3522 };

describe("findSunReturn", () => {
  it("lands on the natal Sun longitude to within a few arc-seconds", () => {
    const birth = new Date("1990-06-15T12:00:00Z");
    const natalSun = sunLongitudeAtUtc(birth);
    const ret = findSunReturn(natalSun, new Date("2026-06-15T12:00:00Z"));
    expect(Math.abs(angleDelta(sunLongitudeAtUtc(ret), natalSun))).toBeLessThan(0.001);
    // The return drifts by hours, never by days.
    expect(Math.abs(ret.getTime() - Date.parse("2026-06-15T12:00:00Z"))).toBeLessThan(2 * 86400000);
  });

  it("works across the Aries point (0°/360° wrap)", () => {
    const birth = new Date("1985-03-20T18:00:00Z");
    const natalSun = sunLongitudeAtUtc(birth);
    const ret = findSunReturn(natalSun, new Date("2026-03-20T18:00:00Z"));
    expect(Math.abs(angleDelta(sunLongitudeAtUtc(ret), natalSun))).toBeLessThan(0.001);
  });
});

describe("solarYearAt", () => {
  const birth = new Date("1990-06-15T12:00:00Z");
  const natalSun = sunLongitudeAtUtc(birth);

  it("picks the return that most recently began", () => {
    const y = solarYearAt(natalSun, birth, new Date("2026-11-24T00:00:00Z"));
    expect(y.year).toBe(2026);
    const before = solarYearAt(natalSun, birth, new Date("2026-03-01T00:00:00Z"));
    expect(before.year).toBe(2025);
  });

  it("spans roughly one year and can look ahead", () => {
    const y = solarYearAt(natalSun, birth, new Date("2026-11-24T00:00:00Z"), 1);
    expect(y.year).toBe(2027);
    const days = (y.end.getTime() - y.start.getTime()) / 86400000;
    expect(days).toBeGreaterThan(364.5);
    expect(days).toBeLessThan(366.5);
  });
});

describe("computeSolarReturn", () => {
  const birth = { year: 1990, month: 6, day: 15, hour: 8, minute: 0, hasTime: true, ...MONTREAL };
  const now = new Date("2026-11-24T00:00:00Z");

  it("builds a full reading for a known birth time", () => {
    const sr = computeSolarReturn(birth, MONTREAL, now);
    expect(sr.precise).toBe(true);
    expect(sr.age).toBe(36);
    expect(sr.ascendant).not.toBeNull();
    expect(sr.midheaven).not.toBeNull();
    expect(sr.sunHouse).toBeGreaterThanOrEqual(1);
    expect(sr.sunHouse).toBeLessThanOrEqual(12);
    // The return Sun sits on the natal Sun.
    expect(Math.abs(angleDelta(sr.chart.planets[0].longitude, sr.natal.planets[0].longitude))).toBeLessThan(0.001);
    // Profection: age 36 → 36 % 12 = 0 → house 1, the natal Ascendant sign.
    expect(sr.profection?.house).toBe(1);
    expect(sr.profection?.sign).toBe(sr.natal.ascendant?.sign);
    expect(sr.houses.reduce((s, h) => s + h.planets.length, 0)).toBe(10);
  });

  it("only lists events inside the solar year, in order", () => {
    const sr = computeSolarReturn(birth, MONTREAL, now);
    expect(sr.events.length).toBeGreaterThan(0);
    for (const e of sr.events) {
      expect(e.date.getTime()).toBeGreaterThanOrEqual(sr.start.getTime());
      expect(e.date.getTime()).toBeLessThan(sr.end.getTime());
      expect(e.house).toBeGreaterThanOrEqual(1);
    }
    const times = sr.events.map((e) => e.date.getTime());
    expect([...times].sort((a, b) => a - b)).toEqual(times);
    // Mercury goes retrograde three or four times a year.
    expect(sr.events.filter((e) => e.planet === "Mercure").length).toBeGreaterThanOrEqual(3);
  });

  it("casts houses for the birthday location, not the birthplace", () => {
    const home = computeSolarReturn(birth, MONTREAL, now);
    const away = computeSolarReturn(birth, PARIS, now);
    expect(away.start.getTime()).toBe(home.start.getTime());
    expect(away.ascendant?.longitude).not.toBeCloseTo(home.ascendant!.longitude, 0);
  });

  it("degrades without a birth time: no angles, no houses", () => {
    const sr = computeSolarReturn({ ...birth, hasTime: false }, MONTREAL, now);
    expect(sr.precise).toBe(false);
    expect(sr.ascendant).toBeNull();
    expect(sr.sunHouse).toBeNull();
    expect(sr.profection).toBeNull();
    expect(sr.events.every((e) => e.house === undefined)).toBe(true);
    expect(natalChartFor({ ...birth, hasTime: false }).chart.houses).toEqual([]);
  });
});
