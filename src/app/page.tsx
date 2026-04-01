"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Starfield from "@/components/Starfield";
import ZodiacWheel from "@/components/ZodiacWheel";
import ElementBalance from "@/components/results/ElementBalance";
import HousesMap from "@/components/results/HousesMap";
import SiteFooter from "@/components/SiteFooter";
import { calculateNatalChart, NatalChart, PlanetPosition } from "@/lib/astro";
import { useLocale } from "@/lib/i18n";

// ─── Types ────────────────────────────────────────────────────────
interface FormData {
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
  tone: number;
  depth: number;
  focus: number;
}

interface CityResult {
  name: string;
  lat: number;
  lon: number;
  display: string;
}

// ─── Constants ────────────────────────────────────────────────────
const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ASPECT_SYMBOLS: Record<string, string> = {
  Conjonction: "☌", Trigone: "△", Sextile: "⚹", Carre: "□", Opposition: "☍",
};

const ASPECT_COLORS: Record<string, string> = {
  Conjonction: "#a89ec8", Trigone: "#9a96aa", Sextile: "#8a87a0", Carre: "#b0a8be", Opposition: "#9590a8",
};

// ─── City Search (Nominatim + GeoNames fallback) ─────────────────
async function searchCities(query: string): Promise<CityResult[]> {
  if (query.length < 2) return [];

  // Helper to parse Nominatim results
  const parseNominatim = (data: Array<{
    display_name: string; lat: string; lon: string; class: string;
    address?: { city?: string; town?: string; village?: string; municipality?: string; state?: string; country?: string };
  }>): CityResult[] =>
    data
      .filter((r) => r.class === "place" || r.class === "boundary")
      .map((r) => {
        const name = r.address?.city || r.address?.town || r.address?.village || r.address?.municipality || r.display_name.split(",")[0];
        return {
          name,
          lat: parseFloat(r.lat),
          lon: parseFloat(r.lon),
          display: [name, r.address?.state, r.address?.country].filter(Boolean).join(", "),
        };
      });

  try {
    // Primary: broad search with featuretype=city for better ranking
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&accept-language=fr&addressdetails=1&featuretype=city`,
      { headers: { "User-Agent": "CielNatal/1.0" } }
    );
    if (res.ok) {
      const data = await res.json();
      let results = parseNominatim(data);
      // If few results, try without featuretype restriction (catches villages/hamlets)
      if (results.length < 3) {
        const res2 = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&accept-language=fr&addressdetails=1`,
          { headers: { "User-Agent": "CielNatal/1.0" } }
        );
        if (res2.ok) {
          const data2 = await res2.json();
          const more = parseNominatim(data2);
          // Merge, deduplicate by lat/lon proximity
          for (const m of more) {
            if (!results.some((r) => Math.abs(r.lat - m.lat) < 0.01 && Math.abs(r.lon - m.lon) < 0.01)) {
              results.push(m);
            }
          }
        }
      }
      // Deduplicate by name+country
      const seen = new Set<string>();
      results = results.filter((r) => {
        const key = r.display.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return results.slice(0, 6);
    }
  } catch {
    // Nominatim failed, try fallback
  }

  // Fallback: GeoNames free API
  try {
    const res = await fetch(
      `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(query)}&maxRows=6&lang=fr&featureClass=P&username=cielnatal`
    );
    if (res.ok) {
      const data = await res.json();
      return (data.geonames || []).map((r: { name: string; lat: string; lng: string; adminName1?: string; countryName?: string }) => ({
        name: r.name,
        lat: parseFloat(r.lat),
        lon: parseFloat(r.lng),
        display: [r.name, r.adminName1, r.countryName].filter(Boolean).join(", "),
      }));
    }
  } catch {
    // Both failed
  }
  return [];
}

// ─── Slider Config Keys ──────────────────────────────────────────
const SLIDER_KEYS = [
  { key: "tone" as const, leftKey: "slider.scientific", leftDescKey: "slider.scientific.desc", rightKey: "slider.esoteric", rightDescKey: "slider.esoteric.desc" },
  { key: "depth" as const, leftKey: "slider.concise", leftDescKey: "slider.concise.desc", rightKey: "slider.detailed", rightDescKey: "slider.detailed.desc" },
  { key: "focus" as const, leftKey: "slider.practical", leftDescKey: "slider.practical.desc", rightKey: "slider.introspective", rightDescKey: "slider.introspective.desc" },
];

// ─── Page ────────────────────────────────────────────────────────
export default function Home() {
  const { t, locale } = useLocale();
  const MONTHS = locale === "fr" ? MONTHS_FR : MONTHS_EN;
  const RESULT_TABS = [
    { id: "portrait", label: t("results.portrait"), icon: "✦" },
    { id: "planets", label: t("results.planets"), icon: "☉" },
    { id: "elements", label: t("results.elements"), icon: "◆" },
    { id: "houses", label: t("results.houses"), icon: "⌂" },
    { id: "aspects", label: t("results.aspects"), icon: "△" },
    { id: "transits", label: t("results.transits"), icon: "◎" },
  ];

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    prenom: "", jour: 15, mois: 6, annee: 1990,
    heure: 12, minute: 0, hasTime: true,
    lieu: "", latitude: 48.8566, longitude: 2.3522,
    tone: 5, depth: 5, focus: 5,
  });
  const [chart, setChart] = useState<NatalChart | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<CityResult[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("portrait");
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [expandedPlanets, setExpandedPlanets] = useState<Set<string>>(new Set());
  const [expandedAspects, setExpandedAspects] = useState<Set<number>>(new Set());
  const [interpretations, setInterpretations] = useState<Record<string, unknown> | null>(null);
  const [stepDirection, setStepDirection] = useState<"next" | "prev">("next");
  const [copied, setCopied] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [todayTransits, setTodayTransits] = useState<NatalChart | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const citySearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const togglePlanet = (name: string) => {
    setExpandedPlanets((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const toggleAspect = (i: number) => {
    setExpandedAspects((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  useEffect(() => {
    import("@/data/interpretations").then((mod) => {
      setInterpretations(mod as unknown as Record<string, unknown>);
    });
  }, []);

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

  const selectCity = useCallback((city: CityResult) => {
    setForm((f) => ({ ...f, lieu: city.display, latitude: city.lat, longitude: city.lon }));
    setCitySuggestions([]);
  }, []);

  const canAdvance = (): boolean => {
    switch (step) {
      case 1: return form.prenom.trim().length >= 1;
      case 2: return form.annee >= 1900 && form.annee <= 2026 && form.mois >= 1 && form.mois <= 12 && form.jour >= 1 && form.jour <= 31;
      case 3: return true;
      case 4: return form.lieu.length >= 2;
      case 5: return true;
      default: return true;
    }
  };

  const doCalculation = () => {
    setStep(6);
    setTimeout(() => {
      const c = calculateNatalChart(
        form.annee, form.mois, form.jour,
        form.hasTime ? form.heure : 12, form.hasTime ? form.minute : 0,
        form.latitude, form.longitude, form.hasTime
      );
      setChart(c);
      setTimeout(() => setStep(7), 2500);
    }, 1000);
  };

  // ─── Geolocation ───
  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=${locale}`,
            { headers: { "User-Agent": "CielNatal/1.0" } }
          );
          if (res.ok) {
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || "";
            const country = data.address?.country || "";
            setForm((f) => ({ ...f, lieu: [city, country].filter(Boolean).join(", "), latitude, longitude }));
          }
        } catch { /* ignore */ }
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { timeout: 8000 }
    );
  }, [locale]);

  // ─── Calculate today's transits ───
  useEffect(() => {
    if (step === 7 && chart) {
      const now = new Date();
      const transit = calculateNatalChart(
        now.getFullYear(), now.getMonth() + 1, now.getDate(),
        now.getHours(), now.getMinutes(),
        form.latitude, form.longitude, true
      );
      setTodayTransits(transit);
    }
  }, [step, chart, form.latitude, form.longitude]);

  // ─── Export PDF ───
  const exportPdf = useCallback(async () => {
    if (!resultsRef.current) return;
    const html2canvas = (await import("html2canvas-pro")).default;
    const { jsPDF } = await import("jspdf");
    const canvas = await html2canvas(resultsRef.current, {
      backgroundColor: "#09090f",
      scale: 2,
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const ratio = canvas.width / canvas.height;
    const imgW = pageW;
    const imgH = imgW / ratio;
    let y = 0;
    while (y < imgH) {
      if (y > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, -y, imgW, imgH);
      y += pageH;
    }
    pdf.save(`ciel-natal-${form.prenom.toLowerCase()}.pdf`);
  }, [form.prenom]);

  const getInterp = (planet: string, sign: string, house?: number): string => {
    if (!interpretations) return "";
    const mod = interpretations as {
      planetInSign: Record<string, Record<string, string>>;
      planetInHouse: Record<string, Record<number, string>>;
      getInterpretation?: (p: string, s: string, h: number | undefined, prefs: { tone: number; depth: number; focus: number }) => string;
    };
    if (mod.getInterpretation) return mod.getInterpretation(planet, sign, house, { tone: form.tone, depth: form.depth, focus: form.focus });
    let text = mod.planetInSign?.[planet]?.[sign] || "";
    if (house && mod.planetInHouse?.[planet]?.[house]) text += "\n\n" + mod.planetInHouse[planet][house];
    return text;
  };

  const getAspectInterp = (type: string, p1: string, p2: string): string => {
    if (!interpretations) return "";
    const mod = interpretations as { aspectInterpretations: Record<string, Record<string, string>> };
    return mod.aspectInterpretations?.[type]?.[`${p1}-${p2}`] || mod.aspectInterpretations?.[type]?.[`${p2}-${p1}`] || "";
  };

  const scrollToTab = (tabId: string) => {
    setActiveTab(tabId);
    sectionRefs.current[tabId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ─── Auto-load from URL params ───
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    if (p.has("n") && p.has("j") && p.has("m") && p.has("a") && p.has("lat") && p.has("lon")) {
      const loaded: FormData = {
        prenom: decodeURIComponent(p.get("n") || ""),
        jour: parseInt(p.get("j") || "15"),
        mois: parseInt(p.get("m") || "6"),
        annee: parseInt(p.get("a") || "1990"),
        heure: parseInt(p.get("h") || "12"),
        minute: parseInt(p.get("min") || "0"),
        hasTime: p.get("ht") !== "0",
        lieu: decodeURIComponent(p.get("l") || ""),
        latitude: parseFloat(p.get("lat") || "48.8566"),
        longitude: parseFloat(p.get("lon") || "2.3522"),
        tone: 5, depth: 5, focus: 5,
      };
      setForm(loaded);
      const c = calculateNatalChart(
        loaded.annee, loaded.mois, loaded.jour,
        loaded.hasTime ? loaded.heure : 12, loaded.hasTime ? loaded.minute : 0,
        loaded.latitude, loaded.longitude, loaded.hasTime
      );
      setChart(c);
      setStep(7);
    }
  }, []);

  // ─── Generate shareable URL ───
  const getShareUrl = (): string => {
    const base = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
    const p = new URLSearchParams({
      n: form.prenom, j: String(form.jour), m: String(form.mois), a: String(form.annee),
      h: String(form.heure), min: String(form.minute), ht: form.hasTime ? "1" : "0",
      l: form.lieu, lat: String(form.latitude), lon: String(form.longitude),
    });
    return `${base}?${p.toString()}`;
  };

  // ─── Generate one-pager text ───
  const generateOnePager = (): string => {
    if (!chart) return "";
    const sun = chart.planets[0];
    const moon = chart.planets[1];
    const asc = chart.ascendant;
    const lines = [
      `CARTE DU CIEL DE ${form.prenom.toUpperCase()}`,
      `${"─".repeat(36)}`,
      `${form.jour} ${MONTHS[form.mois - 1]} ${form.annee}${form.hasTime ? ` — ${String(form.heure).padStart(2, "0")}h${String(form.minute).padStart(2, "0")}` : ""} — ${form.lieu}`,
      ``,
      `LE TRIO ESSENTIEL`,
      `  Soleil : ${sun.sign} (${sun.degree}°)${sun.house ? ` — Maison ${sun.house}` : ""}`,
      `  Lune   : ${moon.sign} (${moon.degree}°)${moon.house ? ` — Maison ${moon.house}` : ""}`,
      ...(asc ? [`  Asc.   : ${asc.sign} (${asc.degree}°)`] : []),
      ``,
      `POSITIONS PLANÉTAIRES`,
      ...chart.planets.slice(2).map((p) => `  ${p.name.padEnd(9)} : ${p.sign} ${p.degree}°${p.house ? ` (M${p.house})` : ""}`),
      ``,
      `ASPECTS MAJEURS`,
      ...chart.aspects.slice(0, 10).map((a) => `  ${a.planet1} ${ASPECT_SYMBOLS[a.type] || "·"} ${a.planet2} (${a.type}, ${a.orb}°)`),
      ``,
      `─────────────────────────────────────`,
      `Généré sur Ciel Natal`,
      getShareUrl(),
    ];
    return lines.join("\n");
  };

  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10">

        {/* ═══ HERO ═══ */}
        {step === 0 && (
          <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
            <div className="animate-fade-in-up">
              <div className="text-5xl md:text-6xl mb-6 opacity-40 text-[var(--color-accent-lavender)]">&#10022;</div>
              <h1 className="font-cinzel text-3xl sm:text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-accent-lavender)] bg-clip-text text-transparent leading-tight">
                {t("hero.title")}
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-md mx-auto mb-2 font-light">
                {t("hero.subtitle1")}
              </p>
              <p className="text-lg sm:text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-md mx-auto mb-10 font-light">
                {t("hero.subtitle2")}
              </p>
              <button onClick={() => setStep(1)}
                className="btn-primary px-8 py-4 rounded-full text-white font-medium text-lg">
                {t("hero.cta")}
              </button>
            </div>
          </section>
        )}

        {/* ═══ FORM ═══ */}
        {step >= 1 && step <= 5 && (
          <section className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="glass p-6 sm:p-8 md:p-12 max-w-lg w-full glow-lavender step-enter">
              <div className="flex gap-1.5 mb-8">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="flex-1 h-1 rounded-full overflow-hidden bg-white/10">
                    <div className={`h-full rounded-full transition-all duration-500 ${s < step ? "bg-[var(--color-accent-lavender)]" : s === step ? "bg-[var(--color-accent-lavender)]" : ""}`}
                      style={{ width: s <= step ? "100%" : "0%" }} />
                  </div>
                ))}
              </div>

              {step === 1 && (
                <div className={stepDirection === "next" ? "animate-slide-in-right" : "animate-slide-in-left"}>
                  <h2 className="font-cinzel text-xl sm:text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">{t("form.step1.title")}</h2>
                  <p className="text-xs sm:text-sm text-center text-[var(--color-text-secondary)] mb-8">{t("form.step1.subtitle")}</p>
                  <input type="text" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    placeholder={t("form.step1.placeholder")} className="glass-input w-full text-lg text-center" autoFocus
                    onKeyDown={(e) => e.key === "Enter" && canAdvance() && setStep(2)} />
                </div>
              )}

              {step === 2 && (
                <div className={stepDirection === "next" ? "animate-slide-in-right" : "animate-slide-in-left"}>
                  <h2 className="font-cinzel text-xl sm:text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">{t("form.step2.title")}</h2>
                  <p className="text-xs sm:text-sm text-center text-[var(--color-text-secondary)] mb-8">{t("form.step2.subtitle")}</p>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 block text-center">{t("form.step2.day")}</label>
                      <select value={form.jour} onChange={(e) => setForm({ ...form, jour: parseInt(e.target.value) })}
                        className="glass-input w-full text-center text-base sm:text-lg appearance-none">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d} className="bg-[var(--color-space-deep)]">{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 block text-center">{t("form.step2.month")}</label>
                      <select value={form.mois} onChange={(e) => setForm({ ...form, mois: parseInt(e.target.value) })}
                        className="glass-input w-full text-center text-base sm:text-lg appearance-none">
                        {MONTHS.map((m, i) => (
                          <option key={i} value={i + 1} className="bg-[var(--color-space-deep)]">{m.slice(0, 3)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 block text-center">{t("form.step2.year")}</label>
                      <select value={form.annee} onChange={(e) => setForm({ ...form, annee: parseInt(e.target.value) })}
                        className="glass-input w-full text-center text-base sm:text-lg appearance-none">
                        {Array.from({ length: 127 }, (_, i) => 2026 - i).map((y) => (
                          <option key={y} value={y} className="bg-[var(--color-space-deep)]">{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className={stepDirection === "next" ? "animate-slide-in-right" : "animate-slide-in-left"}>
                  <h2 className="font-cinzel text-xl sm:text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">{t("form.step3.title")}</h2>
                  <p className="text-xs sm:text-sm text-center text-[var(--color-text-secondary)] mb-6">{t("form.step3.subtitle")}</p>
                  <label className="flex items-center justify-center gap-3 mb-6 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form.hasTime ? "bg-[var(--color-accent-lavender)] border-[var(--color-accent-lavender)]" : "border-[var(--color-text-secondary)] bg-transparent"}`}
                      onClick={() => setForm({ ...form, hasTime: !form.hasTime })}>
                      {form.hasTime && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition">{t("form.step3.knowTime")}</span>
                  </label>
                  {form.hasTime ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex-1 max-w-[120px]">
                        <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 block text-center">{t("form.step3.hour")}</label>
                        <select value={form.heure} onChange={(e) => setForm({ ...form, heure: parseInt(e.target.value) })}
                          className="glass-input w-full text-center text-lg appearance-none">
                          {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                            <option key={h} value={h} className="bg-[var(--color-space-deep)]">{String(h).padStart(2, "0")}</option>
                          ))}
                        </select>
                      </div>
                      <span className="text-2xl text-[var(--color-text-secondary)] mt-5 font-light">:</span>
                      <div className="flex-1 max-w-[120px]">
                        <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 block text-center">{t("form.step3.minute")}</label>
                        <select value={form.minute} onChange={(e) => setForm({ ...form, minute: parseInt(e.target.value) })}
                          className="glass-input w-full text-center text-lg appearance-none">
                          {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                            <option key={m} value={m} className="bg-[var(--color-space-deep)]">{String(m).padStart(2, "0")}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="glass p-4 text-sm text-[var(--color-text-secondary)] text-center border-l-2 border-[var(--color-accent-lavender)]/30">
                      {t("form.step3.noTime")}
                    </div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className={stepDirection === "next" ? "animate-slide-in-right" : "animate-slide-in-left"}>
                  <h2 className="font-cinzel text-xl sm:text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">{t("form.step4.title")}</h2>
                  <p className="text-xs sm:text-sm text-center text-[var(--color-text-secondary)] mb-8">{t("form.step4.subtitle")}</p>
                  <div className="relative">
                    <input type="text" value={form.lieu} onChange={(e) => handleCitySearch(e.target.value)}
                      placeholder={t("form.step4.placeholder")} className="glass-input w-full text-lg text-center" autoFocus />
                    <button type="button" onClick={detectLocation}
                      className="mt-3 w-full btn-ghost px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2" disabled={geoLoading}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4m10-10h-4M6 12H2"/></svg>
                      {geoLoading ? t("geo.detecting") : t("geo.detect")}
                    </button>
                    {cityLoading && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-[var(--color-accent-lavender)]/30 border-t-[var(--color-accent-lavender)] rounded-full animate-spin" />
                      </div>
                    )}
                    {citySuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 glass overflow-hidden z-20">
                        {citySuggestions.map((city, i) => (
                          <button key={`${city.lat}-${city.lon}-${i}`} onClick={() => selectCity(city)}
                            className="w-full px-4 py-3 text-left hover:bg-white/5 active:bg-white/10 transition text-[var(--color-text-primary)] text-sm border-b border-[var(--color-glass-border)] last:border-0">
                            {city.display}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className={stepDirection === "next" ? "animate-slide-in-right" : "animate-slide-in-left"}>
                  <h2 className="font-cinzel text-xl sm:text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">{t("form.step5.title")}</h2>
                  <p className="text-xs sm:text-sm text-center text-[var(--color-text-secondary)] mb-8">{t("form.step5.subtitle")}</p>
                  <div className="space-y-8">
                    {SLIDER_KEYS.map((slider) => (
                      <EnhancedSlider key={slider.key}
                        left={{ label: t(slider.leftKey), desc: t(slider.leftDescKey) }}
                        right={{ label: t(slider.rightKey), desc: t(slider.rightDescKey) }}
                        value={form[slider.key]}
                        onChange={(v) => setForm({ ...form, [slider.key]: v })} />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-10">
                <button onClick={() => { setStepDirection("prev"); setStep(step - 1); }} className="btn-ghost px-5 py-2.5 rounded-xl text-sm">{t("form.back")}</button>
                {step < 5 ? (
                  <button onClick={() => { if (canAdvance()) { setStepDirection("next"); setStep(step + 1); } }} disabled={!canAdvance()}
                    className="btn-primary px-6 py-2.5 rounded-xl text-sm disabled:opacity-30 disabled:cursor-not-allowed">{t("form.next")}</button>
                ) : (
                  <button onClick={doCalculation} className="btn-primary px-8 py-3 rounded-xl font-bold text-sm glow-lavender">{t("form.calculate")}</button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ═══ LOADING ═══ */}
        {step === 6 && (
          <section className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center animate-fade-in-up max-w-xs mx-auto">
              <div className="text-4xl mb-8 animate-pulse-glow text-[var(--color-accent-lavender)]">✦</div>
              <LoadingMessages />
              <div className="mt-6 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-accent-lavender)] animate-progress" />
              </div>
            </div>
          </section>
        )}

        {/* ═══ RESULTS ═══ */}
        {step === 7 && chart && (
          <section className="min-h-screen pb-24">
            <div className="text-center pt-8 pb-4 px-4">
              <div className="text-2xl mb-2 opacity-30 text-[var(--color-accent-lavender)]">✦</div>
              <h1 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-1">
                {t("results.skyOf")} <span className="text-[var(--color-accent-lavender)]">{form.prenom}</span>
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)] font-mono">
                {form.jour} {MONTHS[form.mois - 1]} {form.annee}
                {form.hasTime && ` — ${String(form.heure).padStart(2, "0")}h${String(form.minute).padStart(2, "0")}`}
                {" — "}{form.lieu}
              </p>
            </div>

            <nav className="sticky top-0 z-30 backdrop-blur-2xl bg-[var(--color-space-deep)]/80" style={{ borderBottom: "1px solid rgba(201,160,255,0.06)" }}>
              <div className="tab-nav flex overflow-x-auto max-w-3xl mx-auto">
                {RESULT_TABS.map((tab) => (
                  <button key={tab.id} onClick={() => scrollToTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3.5 text-[11px] font-medium tracking-wide uppercase transition-all whitespace-nowrap relative ${
                      activeTab === tab.id
                        ? "text-[var(--color-accent-lavender)]"
                        : "text-[var(--color-text-secondary)]/60 hover:text-[var(--color-text-secondary)]"
                    }`}>
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-[var(--color-accent-lavender)]" />
                    )}
                  </button>
                ))}
              </div>
            </nav>

            <div ref={resultsRef} className="max-w-3xl mx-auto px-4 space-y-8 mt-6">

              {/* PORTRAIT */}
              <div ref={(el) => { sectionRefs.current.portrait = el; }} className="scroll-mt-14">
                <div className="glass p-4 sm:p-6 mb-6">
                  <ZodiacWheel planets={chart.planets} ascendant={chart.ascendant} selectedPlanet={selectedPlanet} onTapPlanet={(p) => { setSelectedPlanet(p.name); togglePlanet(p.name); }} />
                </div>

                {/* Big Three — full width expand/collapse */}
                <div className="space-y-2 mb-6">
                  {[
                    { label: locale === "fr" ? "Soleil" : "Sun", desc: t("results.sunLabel"), data: chart.planets[0], glyph: "☉" },
                    { label: locale === "fr" ? "Lune" : "Moon", desc: t("results.moonLabel"), data: chart.planets[1], glyph: "☽" },
                    ...(chart.ascendant ? [{ label: locale === "fr" ? "Ascendant" : "Ascendant", desc: t("results.ascLabel"), data: chart.ascendant, glyph: "AC" }] : []),
                  ].map((item) => {
                    const isOpen = expandedPlanets.has(item.data.name);
                    return (
                      <div key={item.label} className="glass overflow-hidden">
                        <button className="w-full p-5 flex items-center gap-5 text-left btn-hover group"
                          onClick={() => togglePlanet(item.data.name)}>
                          <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5 group-hover:border-[var(--color-accent-lavender)]/20 transition">
                            <span className="text-xl text-[var(--color-accent-lavender)]" style={{ fontFamily: "serif" }}>{item.glyph}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-0.5">{item.label}</div>
                            <div className="font-cinzel text-lg text-[var(--color-text-primary)]">{item.data.sign}</div>
                            <div className="text-xs text-[var(--color-text-secondary)]">{item.desc}</div>
                          </div>
                          <div className="text-right flex-shrink-0 mr-2">
                            <div className="text-xs font-mono text-[var(--color-text-secondary)]">{item.data.degree}°</div>
                            {item.data.house && <div className="text-[10px] font-mono text-[var(--color-text-secondary)] opacity-50">M{item.data.house}</div>}
                          </div>
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5"
                            className={`text-[var(--color-text-secondary)] opacity-40 transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                            <path d="M3 5l4 4 4-4" />
                          </svg>
                        </button>
                        <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? "600px" : "0", opacity: isOpen ? 1 : 0 }}>
                          <div className="px-5 pb-5 pt-0 text-sm text-[var(--color-text-primary)]/80 leading-relaxed border-t border-white/5">
                            <div className="pt-4">
                              {getInterp(item.data.name, item.data.sign, item.data.house) || (
                                <span className="text-[var(--color-text-secondary)]">{item.data.name} en {item.data.sign} colore ta manière d&apos;exprimer les qualités de ce signe.</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cosmic Portrait */}
                <div className="glass p-6">
                  <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                    <span className="text-[var(--color-accent-lavender)] opacity-40">&#10022;</span> {t("results.cosmicPortrait")}
                  </h2>
                  <div className="text-sm text-[var(--color-text-primary)]/80 leading-relaxed space-y-4">
                    <p>{form.prenom}, ton Soleil en {chart.planets[0].sign} {getCosmicPortraitSun(chart.planets[0].sign)}</p>
                    <p>Ta Lune en {chart.planets[1].sign} {getCosmicPortraitMoon(chart.planets[1].sign)}</p>
                    {chart.ascendant && <p>Avec un Ascendant {chart.ascendant.sign}, {getCosmicPortraitAsc(chart.ascendant.sign)}</p>}
                  </div>
                </div>
              </div>

              {/* PLANETS */}
              <div ref={(el) => { sectionRefs.current.planets = el; }} className="scroll-mt-14">
                <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-1 flex items-center gap-2">
                  <span className="text-[var(--color-accent-lavender)] opacity-40">☉</span> {t("results.planets")}
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mb-4">{t("results.planetDesc")}</p>
                <div className="space-y-2">
                  {chart.planets.map((planet) => {
                    const isOpen = expandedPlanets.has(planet.name);
                    return (
                      <div key={planet.name} className="glass overflow-hidden">
                        <button onClick={() => togglePlanet(planet.name)}
                          className="w-full flex items-center justify-between p-4 text-left btn-hover group">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-[var(--color-accent-lavender)]/20 transition">
                              <span className="text-base text-[var(--color-accent-lavender)]" style={{ fontFamily: "serif" }}>{planet.symbol}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-[var(--color-text-primary)]">{planet.name}</span>
                              <span className="text-xs text-[var(--color-text-secondary)] ml-2">{planet.sign}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">{planet.degree}°</span>
                            {planet.house && <span className="text-[10px] font-mono text-[var(--color-text-secondary)] opacity-50">M{planet.house}</span>}
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5"
                              className={`text-[var(--color-text-secondary)] opacity-40 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                              <path d="M2 4l4 4 4-4" />
                            </svg>
                          </div>
                        </button>
                        <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? "600px" : "0", opacity: isOpen ? 1 : 0 }}>
                          <div className="px-4 pb-4 text-sm text-[var(--color-text-primary)]/80 leading-relaxed border-t border-white/5">
                            <div className="pt-3 whitespace-pre-line">
                              {getInterp(planet.name, planet.sign, planet.house) || (
                                <span className="text-[var(--color-text-secondary)]">{planet.name} en {planet.sign} colore ta manière d&apos;exprimer les qualités de ce signe.</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ELEMENTS */}
              <div ref={(el) => { sectionRefs.current.elements = el; }} className="scroll-mt-14">
                <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-1 flex items-center gap-2">
                  <span className="text-[var(--color-accent-lavender)] opacity-40">◆</span> {t("results.elements")}
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mb-4">{t("results.elementDesc")}</p>
                <div className="glass p-5">
                  <ElementBalance planets={chart.planets} />
                </div>
              </div>

              {/* HOUSES */}
              {chart.ascendant && (
                <div ref={(el) => { sectionRefs.current.houses = el; }} className="scroll-mt-14">
                  <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-1 flex items-center gap-2">
                    <span className="text-[var(--color-accent-lavender)] opacity-40">⌂</span> {t("results.houses")}
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-4">{t("results.houseDesc")}</p>
                  <HousesMap planets={chart.planets} />
                </div>
              )}

              {/* ASPECTS */}
              <div ref={(el) => { sectionRefs.current.aspects = el; }} className="scroll-mt-14">
                <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-1 flex items-center gap-2">
                  <span className="text-[var(--color-accent-lavender)] opacity-40">△</span> {t("results.aspects")}
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mb-4">{t("results.aspectDesc")}</p>
                {chart.aspects.length > 0 ? (
                  <div className="space-y-2">
                    {chart.aspects.slice(0, form.depth >= 7 ? undefined : 12).map((aspect, i) => {
                      const interp = getAspectInterp(aspect.type, aspect.planet1, aspect.planet2);
                      const color = ASPECT_COLORS[aspect.type] || "#c9a0ff";
                      const symbol = ASPECT_SYMBOLS[aspect.type] || "·";
                      const isOpen = expandedAspects.has(i);
                      return (
                        <div key={i} className="glass overflow-hidden">
                          <button className="w-full p-4 text-left btn-hover group" onClick={() => toggleAspect(i)}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-[var(--color-accent-lavender)]" style={{ fontFamily: "serif" }}>{aspect.symbol1}</span>
                                <span className="text-[var(--color-text-primary)]">{aspect.planet1}</span>
                                <span style={{ color }} className="text-lg mx-0.5">{symbol}</span>
                                <span className="text-[var(--color-text-primary)]">{aspect.planet2}</span>
                                <span className="text-[var(--color-accent-lavender)]" style={{ fontFamily: "serif" }}>{aspect.symbol2}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] px-2 py-0.5 rounded-full border font-mono" style={{ borderColor: `${color}30`, color }}>{aspect.type}</span>
                                <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">{aspect.orb}°</span>
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5"
                                  className={`text-[var(--color-text-secondary)] opacity-40 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                                  <path d="M2 4l4 4 4-4" />
                                </svg>
                              </div>
                            </div>
                          </button>
                          <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? "600px" : "0", opacity: isOpen ? 1 : 0 }}>
                            <div className="px-4 pb-4 text-sm text-[var(--color-text-primary)]/80 leading-relaxed border-t border-white/5">
                              <div className="pt-3">
                                {interp || `L'aspect ${aspect.type.toLowerCase()} entre ${aspect.planet1} et ${aspect.planet2} crée un dialogue unique dans ta carte, colorant la manière dont ces deux énergies interagissent dans ton expérience de vie.`}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="glass p-5 text-sm text-[var(--color-text-secondary)] text-center">{t("results.noAspects")}</div>
                )}
              </div>

              {/* TRANSITS DU JOUR */}
              {todayTransits && (
                <div ref={(el) => { sectionRefs.current.transits = el; }} className="scroll-mt-14">
                  <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-1 flex items-center gap-2">
                    <span className="text-[var(--color-accent-lavender)] opacity-40">&#9678;</span> {t("transits.title")}
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-4">{t("transits.desc")}</p>
                  <div className="space-y-2">
                    {todayTransits.planets.slice(0, 7).map((transit) => {
                      const natal = chart.planets.find((p) => p.name === transit.name);
                      if (!natal) return null;
                      const sameSgn = transit.sign === natal.sign;
                      return (
                        <div key={transit.name} className="glass p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-base text-[var(--color-accent-lavender)]" style={{ fontFamily: "serif" }}>{transit.symbol}</span>
                              <span className="text-sm font-medium text-[var(--color-text-primary)]">{transit.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-[var(--color-text-secondary)]">
                                <span className="text-[var(--color-accent-lavender)]">{t("transits.current")}</span> {transit.sign} {transit.degree}°
                              </div>
                              <div className="text-[10px] text-[var(--color-text-secondary)] opacity-60">
                                {t("transits.natal")} {natal.sign} {natal.degree}°
                              </div>
                            </div>
                          </div>
                          {sameSgn && (
                            <div className="mt-2 text-[10px] text-[var(--color-accent-lavender)] opacity-60">
                              {locale === "fr" ? `${transit.name} transite dans ton signe natal — un retour aux sources.` : `${transit.name} transits your natal sign — a return to origins.`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* LIFE THEMES SYNTHESIS */}
              <div className="glass p-6">
                <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                  <span className="text-[var(--color-accent-lavender)] opacity-40">&#10022;</span> {t("results.lifeThemes")}
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mb-5">{t("results.lifeThemesDesc")}</p>
                <div className="space-y-3 stagger-in">
                  {getLifeThemes(chart, form.prenom).map((theme, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-[var(--color-glass-border)]">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-lavender)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm text-[var(--color-accent-lavender)]">{theme.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-1">{theme.title}</h3>
                        <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">{theme.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CLOSING */}
              <div className="glass p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-[var(--color-accent-lavender)]/5 border border-[var(--color-accent-lavender)]/10 flex items-center justify-center">
                  <span className="text-lg text-[var(--color-accent-lavender)] opacity-60">&#10022;</span>
                </div>
                <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-5">{t("results.closing.title")} {form.prenom}</h2>
                <div className="text-sm text-[var(--color-text-primary)]/80 leading-relaxed max-w-lg mx-auto space-y-4 mb-8">
                  <p>{t("results.closing.p1")}</p>
                  <p>{t("results.closing.p2")}</p>
                  <p>{t("results.closing.p3")}</p>
                  <div className="border-l-2 border-[var(--color-accent-lavender)]/20 pl-4 py-2 mt-6">
                    <p className="text-[var(--color-accent-lavender)]/60 italic text-xs">&laquo;&nbsp;{t("results.closing.quote")}&nbsp;&raquo;</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
                  <button onClick={() => {
                      const url = getShareUrl();
                      const text = `La carte du ciel de ${form.prenom} : Soleil en ${chart.planets[0].sign}, Lune en ${chart.planets[1].sign}${chart.ascendant ? `, Ascendant ${chart.ascendant.sign}` : ""}. Découvre la tienne !`;
                      if (navigator.share) { navigator.share({ title: `Carte du ciel — ${form.prenom}`, text, url }); }
                      else { navigator.clipboard.writeText(text + "\n" + url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
                    }} className="btn-primary px-6 py-3 rounded-xl text-sm flex items-center gap-2">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                    {t("results.shareLink")}
                  </button>
                  <button onClick={() => {
                      navigator.clipboard.writeText(generateOnePager());
                      setCopied(true); setTimeout(() => setCopied(false), 2000);
                    }} className="btn-ghost px-5 py-3 rounded-xl text-sm flex items-center gap-2">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    {t("results.copyChart")}
                  </button>
                  <button onClick={() => {
                      navigator.clipboard.writeText(getShareUrl());
                      setCopied(true); setTimeout(() => setCopied(false), 2000);
                    }} className="btn-ghost px-5 py-3 rounded-xl text-sm flex items-center gap-2">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                    {t("results.copyLink")}
                  </button>
                  <button onClick={exportPdf} className="btn-ghost px-5 py-3 rounded-xl text-sm flex items-center gap-2">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
                    {t("results.exportPdf")}
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-[var(--color-accent-lavender)] mb-4 animate-fade-in">{t("results.copied")}</p>
                )}
                <div className="border-t border-[var(--color-glass-border)] pt-5">
                  <p className="text-[10px] text-[var(--color-text-secondary)]/50 italic max-w-md mx-auto leading-relaxed">{t("results.disclaimer")}</p>
                </div>
              </div>

              <div className="text-center pb-8">
                <button onClick={() => { setStep(0); setChart(null); setSelectedPlanet(null); setExpandedPlanets(new Set()); setExpandedAspects(new Set()); setActiveTab("portrait"); }}
                  className="btn-ghost px-6 py-3 rounded-xl text-sm">{t("results.newChart")}</button>
              </div>
            </div>

          </section>
        )}

        {/* Footer on results or hero */}
        {(step === 0 || step === 7) && <SiteFooter />}
      </div>
    </main>
  );
}

// ─── Enhanced Slider ─────────────────────────────────────────────
function EnhancedSlider({ left, right, value, onChange }: {
  left: { label: string; desc: string };
  right: { label: string; desc: string };
  value: number;
  onChange: (v: number) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className={`transition-all ${isDragging ? "scale-[1.01]" : ""}`}>
      <div className="flex justify-between mb-2">
        <div className="text-left">
          <div className={`text-xs font-medium transition-all ${value <= 4 ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}>{left.label}</div>
          <div className={`text-[10px] transition-all max-w-[140px] ${value <= 4 ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-secondary)]/40"}`}>{left.desc}</div>
        </div>
        <div className="text-right">
          <div className={`text-xs font-medium transition-all ${value >= 7 ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}>{right.label}</div>
          <div className={`text-[10px] transition-all max-w-[140px] ${value >= 7 ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-secondary)]/40"}`}>{right.desc}</div>
        </div>
      </div>
      <input type="range" min={1} max={10} value={value} onChange={(e) => onChange(parseInt(e.target.value))}
        onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)}
        onTouchStart={() => setIsDragging(true)} onTouchEnd={() => setIsDragging(false)} />
      <div className="flex justify-between px-1 mt-1.5">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className={`w-1 h-1 rounded-full transition-all ${i + 1 === value ? "bg-[var(--color-accent-lavender)] scale-150" : "bg-white/10"}`} />
        ))}
      </div>
      <div className="text-center text-[10px] text-[var(--color-text-secondary)] font-mono mt-1">{value}/10</div>
    </div>
  );
}

// ─── Loading Messages ─────────────────────────────────────────────
function LoadingMessages() {
  const { t } = useLocale();
  const messages = [t("loading.planets"), t("loading.houses"), t("loading.aspects"), t("loading.portrait")];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => Math.min(i + 1, messages.length - 1)), 800);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="space-y-2">
      {messages.map((msg, i) => (
        <p key={i} className={`text-xs transition-all duration-500 font-mono ${i <= idx ? "text-[var(--color-text-primary)] opacity-100" : "text-[var(--color-text-secondary)] opacity-20"}`}>
          {i < idx ? "✓" : i === idx ? "◌" : "·"} {msg}
        </p>
      ))}
    </div>
  );
}

// ─── Portrait Helpers ─────────────────────────────────────────────
function getCosmicPortraitSun(sign: string): string {
  const t: Record<string, string> = {
    Belier: "illumine une nature audacieuse et pionnière. Tu portes en toi une énergie d'initiation — un besoin viscéral de tracer ta propre voie.",
    Taureau: "révèle une nature profondément ancrée et sensorielle. Tu construis avec patience, tu apprécies la beauté tangible du monde.",
    Gemeaux: "dévoile un esprit vif, curieux et multiple. Tu as soif d'apprendre, de connecter les idées, de communiquer.",
    Cancer: "baigne ta personnalité dans une sensibilité intuitive et protectrice. Tu ressens profondément les émotions — les tiennes et celles des autres.",
    Lion: "rayonne d'une chaleur naturelle et d'une générosité authentique. Tu as besoin de créer, de briller, d'inspirer.",
    Vierge: "affine ton regard sur le monde avec une précision et une intelligence analytique remarquables.",
    Balance: "cherche l'harmonie et la justesse dans chaque interaction. Tu possèdes un sens esthétique développé et une capacité rare à voir les deux côtés.",
    Scorpion: "plonge ta conscience dans les profondeurs de l'expérience humaine. Tu ne te contentes jamais de la surface.",
    Sagittaire: "ouvre grands les horizons de ta conscience. Tu es animé·e par une quête de sens, d'aventure et de vérité.",
    Capricorne: "ancre ta volonté dans la durée et la structure. Tu as une maturité naturelle et une ambition qui se mesure sur le long terme.",
    Verseau: "souffle un vent d'originalité et de vision. Tu penses au-delà des conventions, tu questionnes les normes.",
    Poissons: "dissout les frontières entre toi et le monde avec une empathie et une imagination sans limites.",
  };
  return t[sign] || "colore ta personnalité d'une énergie unique.";
}

function getCosmicPortraitMoon(sign: string): string {
  const t: Record<string, string> = {
    Belier: "révèle un monde émotionnel spontané et direct. Tes réactions sont vives, ton besoin d'authenticité immédiat.",
    Taureau: "parle d'un besoin profond de stabilité et de douceur. Tu te ressources dans le confort et la sécurité du familier.",
    Gemeaux: "dépeint une vie intérieure animée et changeante. Tu as besoin de stimulation mentale pour te sentir en équilibre.",
    Cancer: "amplifie ta sensibilité naturelle et ton intuition. Tu ressens les ambiances comme un sismographe.",
    Lion: "met en lumière un besoin d'être vu·e et apprécié·e dans ton authenticité. Tu as un coeur généreux.",
    Vierge: "traduit un besoin d'ordre émotionnel et de clarté intérieure. Tu te ressources dans les routines et le sentiment d'utilité.",
    Balance: "aspire à l'harmonie relationnelle avant tout. Tu as besoin de beauté autour de toi et de relations équilibrées.",
    Scorpion: "révèle une vie émotionnelle d'une profondeur remarquable. La confiance se construit lentement chez toi.",
    Sagittaire: "colore ta vie émotionnelle d'optimisme et de soif de liberté. Tu as besoin d'espace pour ton équilibre.",
    Capricorne: "confère à tes émotions une maturité et une réserve qui cachent une grande profondeur.",
    Verseau: "donne à ta vie émotionnelle une qualité détachée et originale. Tu traites tes émotions avec une lucidité inhabituelle.",
    Poissons: "ouvre les portes d'une sensibilité sans frontières. Tu absorbes les émotions ambiantes comme une éponge.",
  };
  return t[sign] || "enrichit ton monde intérieur d'une dimension unique.";
}

// ─── Life Themes Generator ───────────────────────────────────────
function getLifeThemes(chart: NatalChart, prenom: string): { icon: string; title: string; text: string }[] {
  const sun = chart.planets[0];
  const moon = chart.planets[1];
  const asc = chart.ascendant;
  const themes: { icon: string; title: string; text: string }[] = [];

  // Element dominance theme
  const elCount: Record<string, number> = { Feu: 0, Terre: 0, Air: 0, Eau: 0 };
  const elMap: Record<string, string> = {
    Belier: "Feu", Taureau: "Terre", Gemeaux: "Air", Cancer: "Eau",
    Lion: "Feu", Vierge: "Terre", Balance: "Air", Scorpion: "Eau",
    Sagittaire: "Feu", Capricorne: "Terre", Verseau: "Air", Poissons: "Eau",
  };
  chart.planets.forEach((p) => { if (elMap[p.sign]) elCount[elMap[p.sign]]++; });
  const dominant = Object.entries(elCount).sort((a, b) => b[1] - a[1])[0];
  const elThemes: Record<string, { title: string; text: string }> = {
    Feu: { title: "L'élan créateur", text: `${prenom}, ton thème est traversé par le Feu — l'énergie de l'action, de l'inspiration et du courage. Tu es fait·e pour initier, oser et rayonner.` },
    Terre: { title: "L'ancrage constructeur", text: `${prenom}, la Terre domine ton ciel — tu construis dans la durée, avec patience et réalisme. Ta force réside dans la capacité à matérialiser tes visions.` },
    Air: { title: "Le souffle des idées", text: `${prenom}, l'Air circule puissamment dans ta carte — pensée, communication, connexion. Tu es un·e tisseur·se de liens et d'idées.` },
    Eau: { title: "La profondeur émotionnelle", text: `${prenom}, l'Eau nourrit ton thème — intuition, empathie, profondeur. Tu perçois ce que d'autres ne voient pas, tu ressens ce que d'autres n'osent pas.` },
  };
  themes.push({ icon: "◆", ...elThemes[dominant[0]] });

  // Sun-Moon dynamic
  const sunEl = elMap[sun.sign] || "";
  const moonEl = elMap[moon.sign] || "";
  if (sunEl === moonEl) {
    themes.push({ icon: "☯", title: "Cohérence intérieure", text: `Ton Soleil et ta Lune partagent le même élément (${sunEl}) — une harmonie rare entre qui tu es et ce que tu ressens. Cette cohérence te donne une assurance naturelle.` });
  } else {
    themes.push({ icon: "☯", title: "La danse intérieure", text: `Ton Soleil en ${sun.sign} et ta Lune en ${moon.sign} créent un dialogue entre ${sunEl} et ${moonEl}. Cette tension est créatrice — elle t'invite à intégrer deux facettes complémentaires de toi-même.` });
  }

  // Ascendant theme
  if (asc) {
    themes.push({ icon: "↑", title: "Ton masque et ta mission", text: `Ton Ascendant ${asc.sign} est la porte par laquelle tu entres dans le monde. Il colore ta première impression et révèle la direction de croissance personnelle que la vie t'invite à explorer.` });
  }

  // Aspect pattern theme
  const squares = chart.aspects.filter((a) => a.type === "Carre").length;
  const trines = chart.aspects.filter((a) => a.type === "Trigone").length;
  if (squares >= 3) {
    themes.push({ icon: "□", title: "Les tensions qui forgent", text: `Ton thème comporte plusieurs carrés — des tensions dynamiques qui sont tes plus grands moteurs de transformation. Ce qui résiste en toi est aussi ce qui te rend fort·e.` });
  } else if (trines >= 3) {
    themes.push({ icon: "△", title: "Les flux naturels", text: `Les trigones abondent dans ta carte — des dons naturels, des facilités. Le défi sera de ne pas te reposer sur ces acquis mais de les mettre activement au service de ta croissance.` });
  } else {
    themes.push({ icon: "✧", title: "L'équilibre des forces", text: `Ton thème mêle harmonies et tensions de façon équilibrée — tu possèdes à la fois des talents naturels et des défis stimulants qui ensemble te poussent vers ta pleine expression.` });
  }

  return themes;
}

function getCosmicPortraitAsc(sign: string): string {
  const t: Record<string, string> = {
    Belier: "tu arrives dans le monde avec une énergie directe et magnétique.",
    Taureau: "tu te présentes au monde avec une présence calme et rassurante.",
    Gemeaux: "tu projettes une image vive, communicative et adaptable.",
    Cancer: "tu te montres au monde avec une douceur protectrice et intuitive.",
    Lion: "tu entres dans une pièce avec une présence chaude et lumineuse.",
    Vierge: "tu te présentes avec une élégance discrète et une intelligence attentive.",
    Balance: "tu projettes une image d'harmonie et de grâce naturelle.",
    Scorpion: "tu arrives avec une intensité magnétique qui ne passe pas inaperçue.",
    Sagittaire: "tu rayonnes d'un enthousiasme et d'une ouverture d'esprit contagieux.",
    Capricorne: "tu te présentes avec une dignité mature et une aura de compétence.",
    Verseau: "tu projettes une originalité et une indépendance qui te distinguent.",
    Poissons: "tu arrives dans le monde avec une douceur éthérée et une empathie visible.",
  };
  return t[sign] || "tu te présentes au monde avec une énergie unique.";
}
