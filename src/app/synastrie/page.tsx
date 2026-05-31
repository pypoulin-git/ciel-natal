"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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

/**
 * Render the astrological aspect glyph as an inline SVG instead of relying
 * on Unicode characters that aren't covered by every font (PY's screenshot
 * showed empty rectangles for "□" and "☌"). All shapes are stroke-only so
 * they pick up the surrounding color.
 */
function AspectIcon({ type, className = "" }: { type: string; className?: string }) {
  const props = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, className };
  switch (type) {
    case "Conjonction":
      return (<svg {...props}><circle cx="12" cy="12" r="3.5" /><circle cx="12" cy="12" r="9" strokeWidth={1} opacity={0.4} /></svg>);
    case "Trigone":
      return (<svg {...props}><polygon points="12,4 20,18 4,18" /></svg>);
    case "Sextile":
      return (<svg {...props}><line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" /><line x1="12" y1="4" x2="12" y2="20" /></svg>);
    case "Carre":
      return (<svg {...props}><rect x="5" y="5" width="14" height="14" /></svg>);
    case "Opposition":
      return (<svg {...props}><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="12" r="2.5" /><line x1="9" y1="12" x2="15" y2="12" /></svg>);
    default:
      return (<svg {...props}><circle cx="12" cy="12" r="2" /></svg>);
  }
}

// Color hint per aspect type. Subtle, just enough to scan quickly.
const ASPECT_TINT: Record<string, string> = {
  Conjonction: "text-[var(--color-accent-lavender)]",
  Trigone: "text-emerald-300",
  Sextile: "text-sky-300",
  Carre: "text-[var(--color-accent-rose)]",
  Opposition: "text-amber-300",
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

  // Relationship orientation — drives the Gemini prompt frame so an
  // amour/amitié/famille/professionnel reading speaks the right register
  // (no romantic framing for friends, no friendship framing for partners).
  type RelationType = "amour" | "amitie" | "famille" | "professionnel" | "indetermine";
  const [relationType, setRelationType] = useState<RelationType>("indetermine");
  const [shareCopied, setShareCopied] = useState(false);

  // Receive shared synastry: /synastrie?s=base64({a, b, r})
  // — auto-hydrates both persons + relation type + fires compute immediately,
  // so the recipient lands on the same reading without typing anything.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const s = params.get("s");
    if (!s) return;
    try {
      const decoded = JSON.parse(atob(decodeURIComponent(s))) as {
        a: { n: string; j: number; m: number; y: number; h: number; mn: number; ht: number; l: string; la: number; lo: number };
        b: { n: string; j: number; m: number; y: number; h: number; mn: number; ht: number; l: string; la: number; lo: number };
        r: RelationType;
      };
      const toPerson = (p: typeof decoded.a): PersonData => ({
        prenom: p.n, jour: p.j, mois: p.m, annee: p.y, heure: p.h, minute: p.mn,
        hasTime: p.ht === 1, lieu: p.l, latitude: p.la, longitude: p.lo,
      });
      setPersonA(toPerson(decoded.a));
      setPersonB(toPerson(decoded.b));
      if (decoded.r) setRelationType(decoded.r);
      // Defer compute until state has flushed — using a microtask is enough.
      Promise.resolve().then(() => {
        // We can't call compute() directly because closure captures stale
        // person state. Instead we replay the chart calculation inline.
        const cA = calculateNatalChart(decoded.a.y, decoded.a.m, decoded.a.j, decoded.a.ht ? decoded.a.h : 12, decoded.a.ht ? decoded.a.mn : 0, decoded.a.la, decoded.a.lo, decoded.a.ht === 1);
        const cB = calculateNatalChart(decoded.b.y, decoded.b.m, decoded.b.j, decoded.b.ht ? decoded.b.h : 12, decoded.b.ht ? decoded.b.mn : 0, decoded.b.la, decoded.b.lo, decoded.b.ht === 1);
        setChartA(cA);
        setChartB(cB);
        // Build cross aspects (duplicate of compute()'s logic — kept inline
        // here to avoid a giant useCallback dep on form fields).
        const aspects: { planet1: string; sign1: string; planet2: string; sign2: string; type: string; orb: number }[] = [];
        const DEFS = [
          { name: "Conjonction", angle: 0, orb: 8 },
          { name: "Sextile", angle: 60, orb: 6 },
          { name: "Carre", angle: 90, orb: 8 },
          { name: "Trigone", angle: 120, orb: 8 },
          { name: "Opposition", angle: 180, orb: 8 },
        ];
        for (const pA of cA.planets) for (const pB of cB.planets) {
          let diff = Math.abs(pA.longitude - pB.longitude);
          if (diff > 180) diff = 360 - diff;
          for (const def of DEFS) {
            const orb = Math.abs(diff - def.angle);
            if (orb <= def.orb) aspects.push({ planet1: `${decoded.a.n}: ${pA.name}`, sign1: pA.sign, planet2: `${decoded.b.n}: ${pB.name}`, sign2: pB.sign, type: def.name, orb: Math.round(orb * 10) / 10 });
          }
        }
        aspects.sort((a, b) => a.orb - b.orb);
        const top = aspects.slice(0, 20);
        setCrossAspects(top);
        setComputed(true);
        if (isPremium) void fetchInterpretation(cA, cB, top);
      });
    } catch {
      /* malformed ?s= payload — ignore, user falls back to the empty form */
    }
    // Only run once on mount; isPremium/fetchInterpretation are stable enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          relationType,
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
  }, [personA.prenom, personB.prenom, locale, relationType]);

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
            {/* Relationship orientation — tells Gemini which register to read in */}
            <div className="md:col-span-2 glass p-5">
              <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)]/80 mb-3">
                {locale === "fr" ? "Quel lien lis-tu ?" : "What kind of bond is this?"}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {([
                  { id: "amour" as const, fr: "Amour", en: "Love" },
                  { id: "amitie" as const, fr: "Amitié", en: "Friendship" },
                  { id: "famille" as const, fr: "Famille", en: "Family" },
                  { id: "professionnel" as const, fr: "Professionnel", en: "Professional" },
                  { id: "indetermine" as const, fr: "Indéterminé", en: "Unspecified" },
                ]).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRelationType(opt.id)}
                    aria-pressed={relationType === opt.id}
                    className={`px-3 py-2.5 rounded-lg text-xs font-medium border transition ${
                      relationType === opt.id
                        ? "bg-[var(--color-accent-rose)]/20 border-[var(--color-accent-rose)]/50 text-[var(--color-text-primary)] shadow-sm shadow-[var(--color-accent-rose)]/20"
                        : "border-[var(--color-glass-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent-rose)]/30"
                    }`}
                  >
                    {locale === "fr" ? opt.fr : opt.en}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)] opacity-60 mt-2 italic">
                {locale === "fr"
                  ? "Cette orientation guide la lecture IA — un amour, une amitié et un lien familial ne se lisent pas du tout pareil."
                  : "This orientation steers the AI reading — love, friendship and family bonds don't read the same way."}
              </p>
            </div>

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

            {/* Compatibility score — donut SVG, far more impactful than the
                old text + thin bar PY rightly called fade. */}
            {(() => {
              const harmonics = crossAspects.filter((a) => a.type === "Trigone" || a.type === "Sextile" || a.type === "Conjonction").length;
              const tensions = crossAspects.filter((a) => a.type === "Carre" || a.type === "Opposition").length;
              const total = harmonics + tensions;
              const score = total > 0 ? Math.round((harmonics / total) * 100) : 50;
              const r = 78;
              const c = 2 * Math.PI * r;
              const dash = (score / 100) * c;
              const relationLabel = (() => {
                if (locale === "en") {
                  return ({ amour: "Love reading", amitie: "Friendship reading", famille: "Family reading", professionnel: "Professional reading", indetermine: "Open reading" } as const)[relationType];
                }
                return ({ amour: "Lecture amour", amitie: "Lecture amitié", famille: "Lecture famille", professionnel: "Lecture professionnelle", indetermine: "Lecture ouverte" } as const)[relationType];
              })();
              return (
                <div className="glass p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
                    {/* Donut */}
                    <div className="relative flex-shrink-0">
                      <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
                        <defs>
                          <linearGradient id="syn-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--color-accent-lavender)" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="var(--color-accent-rose)" stopOpacity="0.95" />
                          </linearGradient>
                        </defs>
                        <circle cx="100" cy="100" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="none" />
                        <circle
                          cx="100" cy="100" r={r}
                          stroke="url(#syn-grad)"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={`${dash} ${c}`}
                          fill="none"
                          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,.7,.3,1)" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-cinzel text-5xl text-[var(--color-text-primary)] leading-none">{score}</span>
                        <span className="text-xs text-[var(--color-text-secondary)] opacity-60 mt-1">%</span>
                      </div>
                    </div>
                    {/* Right: labels + breakdown */}
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)] mb-2">
                        {relationLabel}
                      </p>
                      <h2 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-3">
                        {locale === "fr" ? "Harmonie relationnelle" : "Relationship harmony"}
                      </h2>
                      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto sm:mx-0">
                        <div className="rounded-xl bg-[var(--color-accent-lavender)]/8 border border-[var(--color-accent-lavender)]/20 p-3 text-center">
                          <div className="text-2xl font-cinzel text-[var(--color-accent-lavender)]">{harmonics}</div>
                          <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] mt-1">
                            {locale === "fr" ? "Harmonies" : "Harmonies"}
                          </div>
                        </div>
                        <div className="rounded-xl bg-[var(--color-accent-rose)]/8 border border-[var(--color-accent-rose)]/20 p-3 text-center">
                          <div className="text-2xl font-cinzel text-[var(--color-accent-rose)]">{tensions}</div>
                          <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] mt-1">
                            {locale === "fr" ? "Tensions" : "Tensions"}
                          </div>
                        </div>
                        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3 text-center">
                          <div className="text-2xl font-cinzel text-[var(--color-text-primary)]">{crossAspects.length}</div>
                          <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] mt-1">
                            {locale === "fr" ? "Connexions" : "Connections"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* AI interpretation — premium only, with share button + section split */}
            {isPremium && (
              <div className="glass p-6 sm:p-8 relative overflow-hidden">
                {/* Soft accent gradient on the corner — gives the block weight */}
                <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20" style={{ background: "radial-gradient(circle, var(--color-accent-rose), transparent 70%)" }} />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[var(--color-accent-rose)] mb-1.5">
                        {locale === "fr" ? "Lecture IA personnalisée" : "Personalized AI reading"}
                      </p>
                      <h2 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)]">
                        {locale === "fr" ? `${personA.prenom} & ${personB.prenom}` : `${personA.prenom} & ${personB.prenom}`}
                      </h2>
                    </div>
                    {/* Share button — copies a self-contained URL with both
                        people + relation type. Recipient lands on the same
                        reading without re-typing anything. */}
                    {interpText && !interpLoading && (
                      <button
                        onClick={async () => {
                          try {
                            const payload = {
                              a: { n: personA.prenom, j: personA.jour, m: personA.mois, y: personA.annee, h: personA.heure, mn: personA.minute, ht: personA.hasTime ? 1 : 0, l: personA.lieu, la: personA.latitude, lo: personA.longitude },
                              b: { n: personB.prenom, j: personB.jour, m: personB.mois, y: personB.annee, h: personB.heure, mn: personB.minute, ht: personB.hasTime ? 1 : 0, l: personB.lieu, la: personB.latitude, lo: personB.longitude },
                              r: relationType,
                            };
                            const encoded = btoa(JSON.stringify(payload));
                            const url = `${window.location.origin}/synastrie?s=${encodeURIComponent(encoded)}`;
                            await navigator.clipboard.writeText(url);
                            setShareCopied(true);
                            setTimeout(() => setShareCopied(false), 2500);
                          } catch {
                            /* clipboard may be denied — fall through silently */
                          }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border border-[var(--color-accent-rose)]/30 bg-[var(--color-accent-rose)]/10 text-[var(--color-accent-rose)] hover:bg-[var(--color-accent-rose)]/20 transition flex-shrink-0"
                      >
                        {shareCopied ? (
                          <>
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {locale === "fr" ? "Lien copié" : "Link copied"}
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                              <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" /><line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
                            </svg>
                            {locale === "fr" ? "Partager" : "Share"}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  {interpLoading && (
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] py-6">
                      <span className="w-3 h-3 border border-[var(--color-accent-rose)]/30 border-t-[var(--color-accent-rose)] rounded-full animate-spin" />
                      {locale === "fr" ? "Tissage de la lecture… (jusqu'à 20 secondes)" : "Weaving the reading… (up to 20 seconds)"}
                    </div>
                  )}
                  {interpError && (
                    <div className="text-sm text-[var(--color-accent-rose)] py-3">
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
                    <article className="prose-synastry text-[15px] sm:text-base text-[var(--color-text-primary)] leading-[1.75] space-y-5">
                      {/* Render the markdown response into styled blocks.
                          Each section header from Gemini comes as **Title**,
                          which we lift into a Cinzel subtitle separated by a
                          delicate hairline so the eye can scan. */}
                      {interpText.split(/\n\n+/).map((para, idx) => {
                        // [\s\S] instead of /s flag to keep ES2017 compat.
                        const headerMatch = para.match(/^\*\*(.+?)\*\*\s*([\s\S]*)$/);
                        if (headerMatch) {
                          return (
                            <div key={idx}>
                              <h3 className="font-cinzel text-base sm:text-lg text-[var(--color-accent-rose)] mb-2 pt-1 border-t border-[var(--color-accent-rose)]/15 pt-3">
                                {headerMatch[1]}
                              </h3>
                              {headerMatch[2] && (
                                <p className="whitespace-pre-wrap">{headerMatch[2]}</p>
                              )}
                            </div>
                          );
                        }
                        return (
                          <p key={idx} className="whitespace-pre-wrap">{para}</p>
                        );
                      })}
                    </article>
                  )}
                </div>
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
                  {crossAspects.map((aspect, i) => {
                    const tint = ASPECT_TINT[aspect.type] || "text-[var(--color-text-secondary)]";
                    return (
                      <div key={i} className="glass p-3 sm:p-4 hover:border-[var(--color-accent-lavender)]/20 transition">
                        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3 text-sm">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-[var(--color-text-primary)] truncate">{aspect.planet1}</span>
                            <span className={`flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.04] border border-white/10 ${tint}`} aria-label={aspect.type}>
                              <AspectIcon type={aspect.type} />
                            </span>
                            <span className="text-[var(--color-text-primary)] truncate">{aspect.planet2}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${tint} border-current/30`} style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                              {aspect.type}
                            </span>
                            <span className="text-[11px] text-[var(--color-text-secondary)] font-mono opacity-70">{aspect.orb}°</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
