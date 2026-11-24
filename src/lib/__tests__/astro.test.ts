import { describe, it, expect } from "vitest";
import { calculateNatalChart, translateSign, translatePlanet, SIGNS } from "@/lib/astro";

describe("translateSign", () => {
  it("translates internal keys to English", () => {
    expect(translateSign("Belier", "en")).toBe("Aries");
    expect(translateSign("Gemeaux", "en")).toBe("Gemini");
    expect(translateSign("Scorpion", "en")).toBe("Scorpio");
  });

  it("adds accents for French display", () => {
    expect(translateSign("Belier", "fr")).toBe("Bélier");
    expect(translateSign("Gemeaux", "fr")).toBe("Gémeaux");
  });

  it("returns plain name for signs without accents", () => {
    expect(translateSign("Lion", "fr")).toBe("Lion");
    expect(translateSign("Taureau", "fr")).toBe("Taureau");
  });
});

describe("translatePlanet", () => {
  it("translates French names to English", () => {
    expect(translatePlanet("Soleil", "en")).toBe("Sun");
    expect(translatePlanet("Lune", "en")).toBe("Moon");
    expect(translatePlanet("Mercure", "en")).toBe("Mercury");
    expect(translatePlanet("Vénus", "en")).toBe("Venus");
    expect(translatePlanet("Noeud Nord", "en")).toBe("North Node");
  });

  it("returns original in French", () => {
    expect(translatePlanet("Soleil", "fr")).toBe("Soleil");
    expect(translatePlanet("Mars", "fr")).toBe("Mars");
  });
});

describe("calculateNatalChart", () => {
  it("returns 11 planets (Sun through North Node)", () => {
    const chart = calculateNatalChart(1990, 6, 15, 12, 0, 48.8566, 2.3522, true);
    expect(chart.planets).toHaveLength(11);
    expect(chart.planets[0].name).toBe("Soleil");
    expect(chart.planets[1].name).toBe("Lune");
  });

  it("assigns valid sign names to all planets", () => {
    const chart = calculateNatalChart(1990, 6, 15, 12, 0, 48.8566, 2.3522, true);
    for (const planet of chart.planets) {
      expect(SIGNS).toContain(planet.sign);
      expect(planet.degree).toBeGreaterThanOrEqual(0);
      expect(planet.degree).toBeLessThan(30);
    }
  });

  it("places the Sun in Gemini for early-June birth", () => {
    // Sun enters Cancer ~June 21; June 15 is always Gemini
    const chart = calculateNatalChart(1990, 6, 15, 12, 0, 48.8566, 2.3522, true);
    expect(chart.planets[0].sign).toBe("Gemeaux");
  });

  it("places the Sun in Capricorn for early-January birth", () => {
    // Sun in Capricorn ~Dec 22 – Jan 19
    const chart = calculateNatalChart(2000, 1, 5, 12, 0, 48.8566, 2.3522, true);
    expect(chart.planets[0].sign).toBe("Capricorne");
  });

  it("places the Sun in Leo for early-August birth", () => {
    const chart = calculateNatalChart(1985, 8, 5, 12, 0, 48.8566, 2.3522, true);
    expect(chart.planets[0].sign).toBe("Lion");
  });

  it("computes ascendant and houses when hasTime=true", () => {
    const chart = calculateNatalChart(1990, 6, 15, 12, 0, 48.8566, 2.3522, true);
    expect(chart.ascendant).not.toBeNull();
    expect(chart.houses).toHaveLength(12);
  });

  it("skips ascendant when hasTime=false", () => {
    const chart = calculateNatalChart(1990, 6, 15, 12, 0, 48.8566, 2.3522, false);
    expect(chart.ascendant).toBeNull();
    expect(chart.houses).toHaveLength(0);
  });

  it("generates major aspects", () => {
    const chart = calculateNatalChart(1990, 6, 15, 12, 0, 48.8566, 2.3522, true);
    expect(chart.aspects.length).toBeGreaterThan(0);
    const validTypes = ["Conjonction", "Opposition", "Trigone", "Carre", "Sextile"];
    for (const aspect of chart.aspects) {
      expect(validTypes).toContain(aspect.type);
      expect(aspect.orb).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("angles and houses (regression: Ascendant was the Descendant)", () => {
  const MTL = { lat: 45.5017, lon: -73.5673 };
  const gap = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

  it("puts the Sun on the Ascendant at sunrise and on the Descendant at sunset", () => {
    // Montréal, 15 June 2026: sunrise ≈ 09:06 UTC, sunset ≈ 00:46 UTC (16th).
    const rise = calculateNatalChart(2026, 6, 15, 9, 6, MTL.lat, MTL.lon, true);
    expect(gap(rise.ascendant!.longitude, rise.planets[0].longitude)).toBeLessThan(2.5);
    const set = calculateNatalChart(2026, 6, 16, 0, 46, MTL.lat, MTL.lon, true);
    expect(gap(set.ascendant!.longitude + 180, set.planets[0].longitude)).toBeLessThan(2.5);
  });

  it("matches a Placidus table (RAMC ≈ 10°, 45.5° N)", () => {
    const c = calculateNatalChart(1990, 6, 15, 12, 0, MTL.lat, MTL.lon, true);
    const [asc, h2, h3, ic, , , , , , mc, h11, h12] = c.houses;
    expect(gap(mc, 10.8)).toBeLessThan(0.5);
    expect(gap(h11, 48.6)).toBeLessThan(1);
    expect(gap(h12, 87.6)).toBeLessThan(1);
    expect(gap(asc, 119.8)).toBeLessThan(1);
    expect(gap(h2, 138.3)).toBeLessThan(1);
    expect(gap(h3, 161.0)).toBeLessThan(1);
    expect(gap(ic, mc + 180)).toBeLessThan(0.01);
  });

  it("keeps cusps in zodiacal order for many times and latitudes", () => {
    for (const lat of [-45, -20, 0, 20, 45.5, 60]) {
      for (let h = 0; h < 24; h += 3) {
        const c = calculateNatalChart(2001, 3, 10, h, 0, lat, 10, true);
        expect(c.houses[0]).toBeCloseTo(c.ascendant!.longitude, 6);
        for (let i = 0; i < 12; i++) {
          const span = (c.houses[(i + 1) % 12] - c.houses[i] + 360) % 360;
          expect(span).toBeGreaterThan(0);
          expect(span).toBeLessThan(180);
        }
      }
    }
  });
});
