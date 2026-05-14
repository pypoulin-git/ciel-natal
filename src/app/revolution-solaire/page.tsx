"use client";

import { useState, useCallback, useRef } from "react";
import Starfield from "@/components/Starfield";
import ZodiacWheel from "@/components/ZodiacWheel";
import SiteFooter from "@/components/SiteFooter";
import PremiumGate from "@/components/PremiumGate";
import PremiumBadge from "@/components/PremiumBadge";
import { useAuth } from "@/lib/auth-context";
import { calculateNatalChart, NatalChart } from "@/lib/astro";
import { useLocale } from "@/lib/i18n";

interface CityResult {
  name: string;
  lat: number;
  lon: number;
  display: string;
}

async function searchCities(query: string): Promise<CityResult[]> {
  if (query.length < 2) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&accept-language=fr&addressdetails=1&featuretype=city`,
      { headers: { "User-Agent": "CielNatal/1.0" } }
    );
    if (res.ok) {
      const data = await res.json();
      return data
        .filter((r: { class: string }) => r.class === "place" || r.class === "boundary")
        .map((r: { display_name: string; lat: string; lon: string; address?: { city?: string; town?: string; village?: string; municipality?: string; state?: string; country?: string } }) => {
          const name = r.address?.city || r.address?.town || r.address?.village || r.address?.municipality || r.display_name.split(",")[0];
          return {
            name,
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
            display: [name, r.address?.state, r.address?.country].filter(Boolean).join(", "),
          };
        })
        .slice(0, 6);
    }
  } catch { /* ignore */ }
  return [];
}

const SR_THEMES: Record<string, { fr: string; en: string }> = {
  Belier: { fr: "Une année d'initiatives et de nouveaux départs.", en: "A year of initiatives and new beginnings." },
  Taureau: { fr: "Une année de stabilisation et de construction patiente.", en: "A year of stabilization and patient building." },
  Gemeaux: { fr: "Une année de communication, d'apprentissage et de connexions.", en: "A year of communication, learning, and connections." },
  Cancer: { fr: "Une année tournée vers la famille, le foyer et les émotions.", en: "A year focused on family, home, and emotions." },
  Lion: { fr: "Une année de créativité, d'expression personnelle et de rayonnement.", en: "A year of creativity, self-expression, and radiance." },
  Vierge: { fr: "Une année d'organisation, de santé et de perfectionnement.", en: "A year of organization, health, and refinement." },
  Balance: { fr: "Une année centrée sur les relations, l'harmonie et la justice.", en: "A year centered on relationships, harmony, and justice." },
  Scorpion: { fr: "Une année de transformation profonde et de régénération.", en: "A year of deep transformation and regeneration." },
  Sagittaire: { fr: "Une année d'expansion, de voyages et de quête de sens.", en: "A year of expansion, travel, and searching for meaning." },
  Capricorne: { fr: "Une année de responsabilités, d'ambition et de maturité.", en: "A year of responsibility, ambition, and maturity." },
  Verseau: { fr: "Une année d'originalité, de liberté et d'innovation.", en: "A year of originality, freedom, and innovation." },
  Poissons: { fr: "Une année d'intuition, de compassion et de croissance spirituelle.", en: "A year of intuition, compassion, and spiritual growth." },
};

export default function RevolutionSolaire() {
  const { t, locale } = useLocale();
  const { isPremium } = useAuth();
  const [form, setForm] = useState({
    jour: 15, mois: 6, annee: 1990,
    heure: 12, minute: 0, hasTime: true,
    lieu: "", latitude: 48.8566, longitude: 2.3522,
  });
  const [citySuggestions, setCitySuggestions] = useState<CityResult[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [natalChart, setNatalChart] = useState<NatalChart | null>(null);
  const [srChart, setSrChart] = useState<NatalChart | null>(null);
  const [calculating, setCalculating] = useState(false);
  const citySearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCitySearch = useCallback((query: string) => {
    setForm((f) => ({ ...f, lieu: query }));
    if (citySearchTimer.current) clearTimeout(citySearchTimer.current);
    if (query.length < 2) { setCitySuggestions([]); return; }
    setCityLoading(true);
    citySearchTimer.current = setTimeout(async () => {
      const results = await searchCities(query);
      setCitySuggestions(results);
      setCityLoading(false);
    }, 350);
  }, []);

  const calculate = () => {
    setCalculating(true);
    setTimeout(() => {
      // Calculate natal chart
      const natal = calculateNatalChart(
        form.annee, form.mois, form.jour,
        form.hasTime ? form.heure : 12, form.hasTime ? form.minute : 0,
        form.latitude, form.longitude, form.hasTime
      );
      setNatalChart(natal);

      // Solar return: find the moment the Sun returns to its natal longitude this year
      const natalSunLon = natal.planets[0].longitude;
      const thisYear = new Date().getFullYear();

      // Approximate: Sun returns to same longitude around birthday each year
      // Start from birthday this year and iterate
      let bestChart: NatalChart | null = null;
      let bestDiff = 999;

      // Search around the birthday +/- 2 days with 1-hour resolution
      for (let dayOff = -2; dayOff <= 2; dayOff++) {
        for (let h = 0; h < 24; h++) {
          const testChart = calculateNatalChart(
            thisYear, form.mois, form.jour + dayOff,
            h, 0,
            form.latitude, form.longitude, true
          );
          let diff = Math.abs(testChart.planets[0].longitude - natalSunLon);
          if (diff > 180) diff = 360 - diff;
          if (diff < bestDiff) {
            bestDiff = diff;
            bestChart = testChart;
          }
        }
      }

      // Refine to minute level around best hour
      if (bestChart) {
        const bestHour = Math.round((bestChart.planets[0].longitude - natalSunLon + 360) % 360);
        for (let m = 0; m < 60; m++) {
          const testChart = calculateNatalChart(
            thisYear, form.mois, form.jour,
            Math.floor(bestHour), m,
            form.latitude, form.longitude, true
          );
          let diff = Math.abs(testChart.planets[0].longitude - natalSunLon);
          if (diff > 180) diff = 360 - diff;
          if (diff < bestDiff) {
            bestDiff = diff;
            bestChart = testChart;
          }
        }
      }

      setSrChart(bestChart);
      setCalculating(false);
    }, 500);
  };

  const title = locale === "fr" ? "Révolution Solaire" : "Solar Return";
  const subtitle = locale === "fr"
    ? "Découvre les thèmes de ton année en cours"
    : "Discover the themes of your current year";

  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <a href="/" className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent-lavender)] transition mb-8 block">
            &larr; {locale === "fr" ? "Retour" : "Back"}
          </a>

          <h1 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-2">{title}</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-8">{subtitle}</p>

          {!srChart ? (
            <div className="glass p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 block text-center">
                    {locale === "fr" ? "Jour" : "Day"}
                  </label>
                  <select value={form.jour} onChange={(e) => setForm({ ...form, jour: parseInt(e.target.value) })}
                    className="glass-input w-full text-center appearance-none">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d} className="bg-[var(--color-space-deep)]">{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 block text-center">
                    {locale === "fr" ? "Mois" : "Month"}
                  </label>
                  <select value={form.mois} onChange={(e) => setForm({ ...form, mois: parseInt(e.target.value) })}
                    className="glass-input w-full text-center appearance-none">
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i + 1} className="bg-[var(--color-space-deep)]">{t(`months.${i + 1}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 block text-center">
                    {locale === "fr" ? "Année" : "Year"}
                  </label>
                  <select value={form.annee} onChange={(e) => setForm({ ...form, annee: parseInt(e.target.value) })}
                    className="glass-input w-full text-center appearance-none">
                    {Array.from({ length: 127 }, (_, i) => 2026 - i).map((y) => (
                      <option key={y} value={y} className="bg-[var(--color-space-deep)]">{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative">
                <label className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 block">
                  {locale === "fr" ? "Lieu de naissance" : "Birthplace"}
                </label>
                <input type="text" value={form.lieu} onChange={(e) => handleCitySearch(e.target.value)}
                  placeholder={locale === "fr" ? "Cherche ta ville..." : "Search your city..."}
                  className="glass-input w-full" />
                {cityLoading && (
                  <div className="absolute right-3 top-8">
                    <div className="w-4 h-4 border-2 border-[var(--color-accent-lavender)]/30 border-t-[var(--color-accent-lavender)] rounded-full animate-spin" />
                  </div>
                )}
                {citySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 glass overflow-hidden z-20">
                    {citySuggestions.map((city, i) => (
                      <button key={`${city.lat}-${city.lon}-${i}`}
                        onClick={() => { setForm({ ...form, lieu: city.display, latitude: city.lat, longitude: city.lon }); setCitySuggestions([]); }}
                        className="w-full px-4 py-3 text-left hover:bg-white/5 transition text-[var(--color-text-primary)] text-sm border-b border-[var(--color-glass-border)] last:border-0">
                        {city.display}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={calculate} disabled={form.lieu.length < 2 || calculating}
                className="btn-primary w-full py-3 rounded-xl font-medium disabled:opacity-30">
                {calculating
                  ? (locale === "fr" ? "Calcul en cours..." : "Calculating...")
                  : (locale === "fr" ? "Calculer ma révolution solaire" : "Calculate my solar return")}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* SR Wheel */}
              <div className="glass p-4 sm:p-6">
                <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-4 text-center">
                  {locale === "fr" ? `Révolution Solaire ${new Date().getFullYear()}` : `Solar Return ${new Date().getFullYear()}`}
                </h2>
                <ZodiacWheel planets={srChart.planets} ascendant={srChart.ascendant} />
              </div>

              {/* SR Ascendant theme — free teaser */}
              {srChart.ascendant && (
                <div className="glass p-6">
                  <h3 className="font-cinzel text-base text-[var(--color-accent-lavender)] mb-2">
                    {locale === "fr" ? "Ascendant de Révolution" : "Return Ascendant"}: {srChart.ascendant.sign}
                  </h3>
                  <p className="text-sm text-[var(--color-text-primary)]/80 leading-relaxed">
                    {SR_THEMES[srChart.ascendant.sign]?.[locale] ||
                      (locale === "fr" ? "L'Ascendant de ta révolution solaire colore le thème de ton année." : "The Ascendant of your solar return colors your year's theme.")}
                  </p>
                </div>
              )}

              {/* SR Planets + Comparison — Premium gated */}
              <PremiumGate>
                <div className="space-y-6">
                  <div className="glass p-6">
                    <h3 className="font-cinzel text-base text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                      {locale === "fr" ? "Positions planétaires de l'année" : "Planetary positions for the year"}
                      {!isPremium && <PremiumBadge />}
                    </h3>
                    <div className="space-y-2">
                      {srChart.planets.map((planet) => (
                        <div key={planet.name} className="flex items-center justify-between py-2 border-b border-[var(--color-glass-border)] last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[var(--color-accent-lavender)]" style={{ fontFamily: "serif" }}>{planet.symbol}</span>
                            <span className="text-sm text-[var(--color-text-primary)]">{planet.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-[var(--color-text-secondary)]">{planet.sign} {planet.degree}°</span>
                            {planet.house && <span className="text-xs text-[var(--color-text-secondary)] opacity-50 ml-2">M{planet.house}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comparison with natal */}
                  {natalChart && (
                    <div className="glass p-6">
                      <h3 className="font-cinzel text-base text-[var(--color-text-primary)] mb-4">
                        {locale === "fr" ? "Comparaison avec ton thème natal" : "Comparison with your natal chart"}
                      </h3>
                      <div className="space-y-2">
                        {srChart.planets.slice(0, 7).map((srPlanet) => {
                          const natal = natalChart.planets.find((p) => p.name === srPlanet.name);
                          if (!natal) return null;
                          const sameSgn = srPlanet.sign === natal.sign;
                          return (
                            <div key={srPlanet.name} className="flex items-center justify-between py-2 border-b border-[var(--color-glass-border)] last:border-0">
                              <span className="text-sm text-[var(--color-text-primary)]">{srPlanet.name}</span>
                              <div className="text-right text-xs">
                                <span className={sameSgn ? "text-[var(--color-accent-lavender)]" : "text-[var(--color-text-secondary)]"}>
                                  {srPlanet.sign} {srPlanet.degree}°
                                </span>
                                <span className="text-[var(--color-text-secondary)] opacity-40 mx-2">/</span>
                                <span className="text-[var(--color-text-secondary)] opacity-60">{natal.sign} {natal.degree}°</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </PremiumGate>

              <div className="text-center">
                <button onClick={() => { setSrChart(null); setNatalChart(null); }}
                  className="btn-ghost px-6 py-3 rounded-xl text-sm">
                  {locale === "fr" ? "\u2190 Nouveau calcul" : "\u2190 New calculation"}
                </button>
              </div>
            </div>
          )}
        </div>
        <SiteFooter />
      </div>
    </main>
  );
}
