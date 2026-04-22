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
