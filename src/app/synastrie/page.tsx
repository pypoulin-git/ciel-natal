"use client";

import { useState, useCallback, useRef } from "react";
import Starfield from "@/components/Starfield";
import SiteFooter from "@/components/SiteFooter";
import PremiumGate from "@/components/PremiumGate";
import PremiumBadge from "@/components/PremiumBadge";
import { useAuth } from "@/lib/auth-context";
import { calculateNatalChart, NatalChart, PlanetPosition, translateSign } from "@/lib/astro";
import { useLocale } from "@/lib/i18n";

interface PersonData {
  prenom: string;
  jour: number;
  mois: number;
  annee: number;
  heure: number;
  minute: number;
  hasTime: boolean;
  lieu: string;
  latitude: number;
  longitude: number;
}

interface CityResult {
  name: string;
  lat: number;
  lon: number;
  display: string;
}

const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ASPECT_SYMBOLS: Record<string, string> = {
  Conjonction: "☌", Trigone: "△", Sextile: "⚹", Carre: "□", Opposition: "☍",
};

const DEFAULT_PERSON: PersonData = {
  prenom: "", jour: 15, mois: 6, annee: 1990, heure: 12, minute: 0, hasTime: true,
  lieu: "", latitude: 48.8566, longitude: 2.3522,
};

async function searchCities(query: string, locale: string): Promise<CityResult[]> {
  if (query.length < 2) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=${locale}&addressdetails=1&featuretype=city`,
      { headers: { "User-Agent": "CielNatal/1.0" } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.filter((r: { class: string }) => r.class === "place" || r.class === "boundary")
      .map((r: { display_name: string; lat: string; lon: string; address?: { city?: string; town?: string; village?: string; municipality?: string; state?: string; country?: string } }) => ({
        name: r.address?.city || r.address?.town || r.address?.village || r.address?.municipality || r.display_name.split(",")[0],
        lat: parseFloat(r.lat), lon: parseFloat(r.lon),
        display: [r.address?.city || r.address?.town || r.address?.village || r.display_name.split(",")[0], r.address?.state, r.address?.country].filter(Boolean).join(", "),
      }));
  } catch { return []; }
}

export default function SynastryPage() {
  const { t, locale } = useLocale();
  const { isPremium } = useAuth();
  const MONTHS = locale === "fr" ? MONTHS_FR : MONTHS_EN;

  const [personA, setPersonA] = useState<PersonData>({ ...DEFAULT_PERSON });
  const [personB, setPersonB] = useState<PersonData>({ ...DEFAULT_PERSON });
  const [chartA, setChartA] = useState<NatalChart | null>(null);
  const [chartB, setChartB] = useState<NatalChart | null>(null);
  const [crossAspects, setCrossAspects] = useState<{ planet1: string; sign1: string; planet2: string; sign2: string; type: string; orb: number }[]>([]);
  const [computed, setComputed] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<{ target: "A" | "B"; results: CityResult[] }>({ target: "A", results: [] });
  const cityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AI interpretation state — gated to premium because Gemini calls cost
  // money even when free (no rate limit on this route yet).
  const [interpText, setInterpText] = useState<string | null>(null);
  const [interpLoading, setInterpLoading] = useState(false);
  const [interpError, setInterpError] = useState<string | null>(null);

  const handleCitySearch = useCallback((query: string, target: "A" | "B") => {
    const setter = target === "A" ? setPersonA : setPersonB;
    setter((f) => ({ ...f, lieu: query }));
    if (cityTimer.current) clearTimeout(cityTimer.current);
    if (query.length < 2) { setCitySuggestions({ target, results: [] }); return; }
    cityTimer.current = setTimeout(async () => {
      const results = await searchCities(query, locale);
      setCitySuggestions({ target, results });
    }, 350);
  }, [locale]);

  const selectCity = (city: CityResult, target: "A" | "B") => {
    const setter = target === "A" ? setPersonA : setPersonB;
    setter((f) => ({ ...f, lieu: city.display, latitude: city.lat, longitude: city.lon }));
    setCitySuggestions({ target, results: [] });
  };

  const compute = () => {
    const cA = calculateNatalChart(personA.annee, personA.mois, personA.jour, personA.hasTime ? personA.heure : 12, personA.hasTime ? personA.minute : 0, personA.latitude, personA.longitude, personA.hasTime);
    const cB = calculateNatalChart(personB.annee, personB.mois, personB.jour, personB.hasTime ? personB.heure : 12, personB.hasTime ? personB.minute : 0, personB.latitude, personB.longitude, personB.hasTime);
    setChartA(cA);
    setChartB(cB);

    // Cross aspects
    const aspects: typeof crossAspects = [];
    const ASPECT_DEFS = [
      { name: "Conjonction", angle: 0, orb: 8 },
      { name: "Sextile", angle: 60, orb: 6 },
      { name: "Carre", angle: 90, orb: 8 },
      { name: "Trigone", angle: 120, orb: 8 },
      { name: "Opposition", angle: 180, orb: 8 },
    ];
    for (const pA of cA.planets) {
      for (const pB of cB.planets) {
        let diff = Math.abs(pA.longitude - pB.longitude);
        if (diff > 180) diff = 360 - diff;
        for (const def of ASPECT_DEFS) {
          const orb = Math.abs(diff - def.angle);
          if (orb <= def.orb) {
            aspects.push({ planet1: `${personA.prenom}: ${pA.name}`, sign1: pA.sign, planet2: `${personB.prenom}: ${pB.name}`, sign2: pB.sign, type: def.name, orb: Math.round(orb * 10) / 10 });
          }
        }
      }
    }
    aspects.sort((a, b) => a.orb - b.orb);
    const topAspects = aspects.slice(0, 20);
    setCrossAspects(topAspects);
    setComputed(true);

    // Fire the AI interpretation for premium users. Free users get the
    // mechanical cross-aspects list but no narrative — that's the upsell.
    if (isPremium) {
      void fetchInterpretation(cA, cB, topAspects);
    } else {
      setInterpText(null);
      setInterpError(null);
    }
  };

  // Calls /api/synastry-interpretation with a textual summary of both
  // charts + the top cross aspects. The endpoint streams back a single
  // {text} response (cached server-side). Errors surface in `interpError`.
  const fetchInterpretation = useCallback(async (
    cA: NatalChart,
    cB: NatalChart,
    aspects: { planet1: string; sign1: string; planet2: string; sign2: string; type: string; orb: number }[],
  ) => {
    setInterpLoading(true);
    setInterpText(null);
    setInterpError(null);
    try {
      const planetsToString = (chart: NatalChart) =>
        chart.planets
          .slice(0, 10)
          .map((p) => `${p.name} en ${translateSign(p.sign, locale)}${typeof p.house === "number" ? ` (maison ${p.house})` : ""}`)
          .join(", ");
      const contextA = `${personA.prenom} : ${planetsToString(cA)}${cA.ascendant ? `, Ascendant ${translateSign(cA.ascendant.sign, locale)}` : ""}`;
      const contextB = `${personB.prenom} : ${planetsToString(cB)}${cB.ascendant ? `, Ascendant ${translateSign(cB.ascendant.sign, locale)}` : ""}`;
      const crossText = aspects
        .slice(0, 12)
        .map((a) => `${a.planet1} (${a.sign1}) ${a.type.toLowerCase()} ${a.planet2} (${a.sign2}) — orbe ${a.orb}°`)
        .join("\n");

      const res = await fetch("/api/synastry-interpretation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contextA,
          contextB,
          crossAspects: crossText,
          prenomA: personA.prenom,
          prenomB: personB.prenom,
          voice: "sensible",
          locale,
          // We don't collect genre on the synastry form; default to neutral.
          genreA: "neutre",
          genreB: "neutre",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.text) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setInterpText(data.text);
    } catch (err) {
      setInterpError((err as Error).message);
    } finally {
      setInterpLoading(false);
    }
  }, [personA.prenom, personB.prenom, locale]);

  const canCompute = personA.prenom.length >= 1 && personB.prenom.length >= 1 && personA.lieu.length >= 2 && personB.lieu.length >= 2;

  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-12 pb-8">
        <a href="/" className="inline-flex items-center gap-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition mb-8">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {locale === "fr" ? "Retour" : "Back"}
        </a>

        <h1 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-2">
          {locale === "fr" ? "Synastrie — Compatibilité" : "Synastry — Compatibility"}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          {locale === "fr" ? "Compare deux thèmes natals et découvre les dynamiques relationnelles." : "Compare two natal charts and discover relationship dynamics."}
        </p>

        {/* Intro contextuelle */}
        {!computed && (
          <div className="glass rounded-xl px-5 py-4 mb-8 border border-white/5 space-y-2">
            <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
              {locale === "fr"
                ? "La synastrie compare les positions planétaires de deux personnes pour révéler les dynamiques relationnelles — attractions, complémentarités et zones de tension. Plus les données sont précises (heure, lieu), plus l'analyse est riche."
                : "Synastry compares the planetary positions of two people to reveal relationship dynamics — attractions, complementarities and areas of tension. The more precise the data (time, place), the richer the analysis."}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] opacity-60 flex items-center gap-1.5">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              {locale === "fr"
                ? "Tous les calculs restent sur ton appareil — aucune donnée n'est envoyée."
                : "All calculations stay on your device — no data is sent."}
            </p>
          </div>
        )}

        {!computed ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(["A", "B"] as const).map((who) => {
              const person = who === "A" ? personA : personB;
              const setPerson = who === "A" ? setPersonA : setPersonB;
              return (
                <div key={who} className="glass p-5">
                  <h2 className="font-cinzel text-xl text-[var(--color-accent-lavender)] mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[var(--color-accent-lavender)]/15 border border-[var(--color-accent-lavender)]/25 flex items-center justify-center text-sm font-bold text-[var(--color-accent-lavender)]">
                      {who}
                    </span>
                    {locale === "fr" ? `Personne ${who}` : `Person ${who}`}
                  </h2>
                  <div className="space-y-3">
                    <input type="text" value={person.prenom} onChange={(e) => setPerson({ ...person, prenom: e.target.value })}
                      placeholder={t("form.step1.placeholder")} className="glass-input w-full text-sm" />
                    <div className="grid grid-cols-3 gap-2">
                      <select value={person.jour} onChange={(e) => setPerson({ ...person, jour: parseInt(e.target.value) })}
                        className="glass-input text-sm text-center appearance-none">
                        {Array.from({ length: 31 }, (_, i) => <option key={i} value={i + 1} className="bg-[var(--color-space-deep)]">{i + 1}</option>)}
                      </select>
                      <select value={person.mois} onChange={(e) => setPerson({ ...person, mois: parseInt(e.target.value) })}
                        className="glass-input text-sm text-center appearance-none">
                        {MONTHS.map((m, i) => <option key={i} value={i + 1} className="bg-[var(--color-space-deep)]">{m}</option>)}
                      </select>
                      <select value={person.annee} onChange={(e) => setPerson({ ...person, annee: parseInt(e.target.value) })}
                        className="glass-input text-sm text-center appearance-none">
                        {Array.from({ length: 127 }, (_, i) => <option key={i} value={2026 - i} className="bg-[var(--color-space-deep)]">{2026 - i}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={person.heure} onChange={(e) => setPerson({ ...person, heure: parseInt(e.target.value) })}
                        className="glass-input text-sm text-center appearance-none">
                        {Array.from({ length: 24 }, (_, i) => <option key={i} value={i} className="bg-[var(--color-space-deep)]">{String(i).padStart(2, "0")}h</option>)}
                      </select>
                      <select value={person.minute} onChange={(e) => setPerson({ ...person, minute: parseInt(e.target.value) })}
                        className="glass-input text-sm text-center appearance-none">
                        {Array.from({ length: 60 }, (_, i) => <option key={i} value={i} className="bg-[var(--color-space-deep)]">{String(i).padStart(2, "0")}min</option>)}
                      </select>
                    </div>
                    <div className="relative">
                      <input type="text" value={person.lieu} onChange={(e) => handleCitySearch(e.target.value, who)}
                        placeholder={t("form.step4.placeholder")} className="glass-input w-full text-sm" />
                      {citySuggestions.target === who && citySuggestions.results.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 glass overflow-hidden z-20">
                          {citySuggestions.results.map((city, i) => (
                            <button key={i} onClick={() => selectCity(city, who)}
                              className="w-full px-3 py-2 text-left hover:bg-white/5 text-xs text-[var(--color-text-primary)] border-b border-[var(--color-glass-border)] last:border-0">
                              {city.display}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="md:col-span-2 text-center">
              <button onClick={compute} disabled={!canCompute}
                className="btn-primary px-8 py-3 rounded-xl font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed">
                {locale === "fr" ? "Comparer les thèmes" : "Compare charts"}
              </button>
            </div>
          </div>
        ) : chartA && chartB && (
          <div className="space-y-8">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[{ person: personA, chart: chartA }, { person: personB, chart: chartB }].map(({ person, chart }, i) => (
                <div key={i} className="glass p-5">
                  <h3 className="font-cinzel text-xl text-[var(--color-accent-lavender)] mb-3">{person.prenom}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-[var(--color-text-secondary)]">
                      <span>{locale === "fr" ? "Soleil" : "Sun"}</span>
                      <span className="text-[var(--color-text-primary)]">{translateSign(chart.planets[0].sign, locale)} {chart.planets[0].degree}°</span>
                    </div>
                    <div className="flex justify-between text-[var(--color-text-secondary)]">
                      <span>{locale === "fr" ? "Lune" : "Moon"}</span>
                      <span className="text-[var(--color-text-primary)]">{translateSign(chart.planets[1].sign, locale)} {chart.planets[1].degree}°</span>
                    </div>
                    {chart.ascendant && (
                      <div className="flex justify-between text-[var(--color-text-secondary)]">
                        <span>Ascendant</span>
                        <span className="text-[var(--color-text-primary)]">{translateSign(chart.ascendant.sign, locale)} {chart.ascendant.degree}°</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Compatibility score — free teaser */}
            {(() => {
              const harmonics = crossAspects.filter((a) => a.type === "Trigone" || a.type === "Sextile" || a.type === "Conjonction").length;
              const tensions = crossAspects.filter((a) => a.type === "Carre" || a.type === "Opposition").length;
              const total = harmonics + tensions;
              const score = total > 0 ? Math.round((harmonics / total) * 100) : 50;
              return (
                <div className="glass p-6 text-center">
                  <div className="text-3xl font-cinzel text-[var(--color-text-primary)] mb-2">{score}%</div>
                  <div className="text-xs text-[var(--color-text-secondary)] mb-4">
                    {locale === "fr" ? "Harmonie relationnelle" : "Relationship harmony"}
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden max-w-xs mx-auto">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${score}%`, background: "linear-gradient(90deg, rgba(168,158,200,0.3), rgba(168,158,200,0.7))" }} />
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-4 max-w-md mx-auto">
                    {harmonics} {locale === "fr" ? "aspects harmonieux" : "harmonious aspects"}, {tensions} {locale === "fr" ? "aspects tendus" : "tense aspects"} — {crossAspects.length} {locale === "fr" ? "connexions croisées" : "cross-connections"}
                  </p>
                </div>
              );
            })()}

            {/* AI interpretation — premium only, fetched right after compute */}
            {isPremium && (
              <div className="glass p-5 sm:p-6 mb-2">
                <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                  <span className="text-[var(--color-accent-rose)] opacity-60">✦</span>
                  {locale === "fr" ? "Lecture de votre rencontre" : "Reading your connection"}
                </h2>
                {interpLoading && (
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <span className="w-3 h-3 border border-[var(--color-accent-rose)]/30 border-t-[var(--color-accent-rose)] rounded-full animate-spin" />
                    {locale === "fr" ? "Tissage de la lecture…" : "Weaving the reading…"}
                  </div>
                )}
                {interpError && (
                  <div className="text-sm text-[var(--color-accent-rose)]">
                    {locale === "fr" ? "L'interprétation n'a pas pu être générée : " : "Could not generate interpretation: "}
                    {interpError}
                    <button
                      onClick={() => chartA && chartB && fetchInterpretation(chartA, chartB, crossAspects)}
                      className="ml-2 underline hover:no-underline"
                    >
                      {locale === "fr" ? "Réessayer" : "Retry"}
                    </button>
                  </div>
                )}
                {interpText && !interpLoading && (
                  <div className="text-sm sm:text-base text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                    {interpText}
                  </div>
                )}
              </div>
            )}

            {/* Cross aspects list — Premium gated */}
            <PremiumGate>
              <div>
                <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                  {locale === "fr" ? "Aspects croisés" : "Cross aspects"}
                  {!isPremium && <PremiumBadge />}
                </h2>
                <div className="space-y-2">
                  {crossAspects.map((aspect, i) => (
                    <div key={i} className="glass p-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--color-text-primary)]">{aspect.planet1}</span>
                          <span className="text-[var(--color-accent-lavender)]">{ASPECT_SYMBOLS[aspect.type] || "·"}</span>
                          <span className="text-[var(--color-text-primary)]">{aspect.planet2}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full border border-[var(--color-glass-border)] font-mono text-[var(--color-text-secondary)]">{aspect.type}</span>
                          <span className="text-xs text-[var(--color-text-secondary)] font-mono">{aspect.orb}°</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PremiumGate>

            <div className="text-center">
              <button onClick={() => { setComputed(false); setChartA(null); setChartB(null); setCrossAspects([]); }}
                className="btn-ghost px-6 py-3 rounded-xl text-sm">
                {locale === "fr" ? "← Nouvelle comparaison" : "← New comparison"}
              </button>
            </div>
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
