"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Starfield from "@/components/Starfield";
import ZodiacWheel from "@/components/ZodiacWheel";
import GlassModal from "@/components/BottomSheet";
import ElementBalance from "@/components/results/ElementBalance";
import HousesMap from "@/components/results/HousesMap";
import { calculateNatalChart, NatalChart, PlanetPosition, SIGN_SYMBOLS } from "@/lib/astro";
import { houseDescriptions, planetInHouse } from "@/data/interpretations";

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
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const RESULT_TABS = [
  { id: "portrait", label: "Portrait", icon: "✦" },
  { id: "planets", label: "Planètes", icon: "☉" },
  { id: "elements", label: "Éléments", icon: "◆" },
  { id: "houses", label: "Maisons", icon: "⌂" },
  { id: "aspects", label: "Aspects", icon: "△" },
];

const ASPECT_SYMBOLS: Record<string, string> = {
  Conjonction: "☌", Trigone: "△", Sextile: "⚹", Carre: "□", Opposition: "☍",
};

const ASPECT_COLORS: Record<string, string> = {
  Conjonction: "#c9a0ff", Trigone: "#34d399", Sextile: "#60a5fa", Carre: "#ef4444", Opposition: "#fbbf24",
};

// ─── Nominatim City Search ────────────────────────────────────────
async function searchCities(query: string): Promise<CityResult[]> {
  if (query.length < 2) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&accept-language=fr&addressdetails=1`,
      { headers: { "User-Agent": "CielNatal/1.0" } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data
      .filter((r: { type: string; class: string }) => r.class === "place" || r.class === "boundary")
      .map((r: { display_name: string; lat: string; lon: string; address?: { city?: string; town?: string; village?: string; state?: string; country?: string } }) => ({
        name: r.address?.city || r.address?.town || r.address?.village || r.display_name.split(",")[0],
        lat: parseFloat(r.lat),
        lon: parseFloat(r.lon),
        display: [
          r.address?.city || r.address?.town || r.address?.village || r.display_name.split(",")[0],
          r.address?.state,
          r.address?.country,
        ].filter(Boolean).join(", "),
      }));
  } catch {
    return [];
  }
}

// ─── Slider Config ────────────────────────────────────────────────
const SLIDER_CONFIG = [
  {
    key: "tone" as const,
    left: { label: "Scientifique", desc: "Approche rationnelle, astronomie, psychologie" },
    right: { label: "Ésotérique", desc: "Symbolisme, archétypes, dimension spirituelle" },
  },
  {
    key: "depth" as const,
    left: { label: "Concis", desc: "L'essentiel, direct et clair" },
    right: { label: "Approfondi", desc: "Analyse détaillée, nuances et subtilités" },
  },
  {
    key: "focus" as const,
    left: { label: "Pratique", desc: "Conseils concrets, actions au quotidien" },
    right: { label: "Introspectif", desc: "Réflexion intérieure, exploration psychologique" },
  },
];

// ─── Page ────────────────────────────────────────────────────────
export default function Home() {
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
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetPosition | null>(null);
  const [aspectModalData, setAspectModalData] = useState<{ title: string; subtitle: string; text: string } | null>(null);
  const [interpretations, setInterpretations] = useState<Record<string, unknown> | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const citySearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10">

        {/* ═══ HERO ═══ */}
        {step === 0 && (
          <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
            <div className="animate-fade-in-up">
              <div className="text-5xl md:text-6xl mb-6 opacity-40 text-[var(--color-accent-lavender)]">✦</div>
              <h1 className="font-cinzel text-3xl sm:text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[var(--color-accent-lavender)] to-[var(--color-accent-gold)] bg-clip-text text-transparent leading-tight">
                Ciel Natal
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-md mx-auto mb-2 font-light">
                Qu&apos;est-ce que le ciel racontait
              </p>
              <p className="text-lg sm:text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-md mx-auto mb-10 font-light">
                quand tu es né(e)&nbsp;?
              </p>
              <button onClick={() => setStep(1)}
                className="btn-primary px-8 py-4 rounded-full text-white font-medium text-lg">
                Découvrir ma carte
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
                    <div className={`h-full rounded-full transition-all duration-500 ${s < step ? "bg-[var(--color-accent-gold)]" : s === step ? "bg-[var(--color-accent-lavender)]" : ""}`}
                      style={{ width: s <= step ? "100%" : "0%" }} />
                  </div>
                ))}
              </div>

              {step === 1 && (
                <div className="step-enter">
                  <h2 className="font-cinzel text-xl sm:text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">Comment t&apos;appelles-tu&nbsp;?</h2>
                  <p className="text-xs sm:text-sm text-center text-[var(--color-text-secondary)] mb-8">Ton prénom personnalisera toute ta lecture.</p>
                  <input type="text" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    placeholder="Ton prénom" className="glass-input w-full text-lg text-center" autoFocus
                    onKeyDown={(e) => e.key === "Enter" && canAdvance() && setStep(2)} />
                </div>
              )}

              {step === 2 && (
                <div className="step-enter">
                  <h2 className="font-cinzel text-xl sm:text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">Quand es-tu né(e)&nbsp;?</h2>
                  <p className="text-xs sm:text-sm text-center text-[var(--color-text-secondary)] mb-8">La position des astres change chaque jour.</p>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 block text-center">Jour</label>
                      <select value={form.jour} onChange={(e) => setForm({ ...form, jour: parseInt(e.target.value) })}
                        className="glass-input w-full text-center text-base sm:text-lg appearance-none">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d} className="bg-[var(--color-space-deep)]">{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 block text-center">Mois</label>
                      <select value={form.mois} onChange={(e) => setForm({ ...form, mois: parseInt(e.target.value) })}
                        className="glass-input w-full text-center text-base sm:text-lg appearance-none">
                        {MONTHS.map((m, i) => (
                          <option key={i} value={i + 1} className="bg-[var(--color-space-deep)]">{m.slice(0, 3)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 block text-center">Année</label>
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
                <div className="step-enter">
                  <h2 className="font-cinzel text-xl sm:text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">À quelle heure&nbsp;?</h2>
                  <p className="text-xs sm:text-sm text-center text-[var(--color-text-secondary)] mb-6">L&apos;heure exacte détermine ton Ascendant et tes maisons.</p>
                  <label className="flex items-center justify-center gap-3 mb-6 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form.hasTime ? "bg-[var(--color-accent-lavender)] border-[var(--color-accent-lavender)]" : "border-[var(--color-text-secondary)] bg-transparent"}`}
                      onClick={() => setForm({ ...form, hasTime: !form.hasTime })}>
                      {form.hasTime && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition">Je connais mon heure de naissance</span>
                  </label>
                  {form.hasTime ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex-1 max-w-[120px]">
                        <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 block text-center">Heure</label>
                        <select value={form.heure} onChange={(e) => setForm({ ...form, heure: parseInt(e.target.value) })}
                          className="glass-input w-full text-center text-lg appearance-none">
                          {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                            <option key={h} value={h} className="bg-[var(--color-space-deep)]">{String(h).padStart(2, "0")}</option>
                          ))}
                        </select>
                      </div>
                      <span className="text-2xl text-[var(--color-text-secondary)] mt-5 font-light">:</span>
                      <div className="flex-1 max-w-[120px]">
                        <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 block text-center">Minute</label>
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
                      Sans heure exacte, ta lecture n&apos;inclura pas l&apos;Ascendant ni les maisons astrologiques.
                    </div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="step-enter">
                  <h2 className="font-cinzel text-xl sm:text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">Où es-tu né(e)&nbsp;?</h2>
                  <p className="text-xs sm:text-sm text-center text-[var(--color-text-secondary)] mb-8">Le lieu affine le calcul de ton Ascendant.</p>
                  <div className="relative">
                    <input type="text" value={form.lieu} onChange={(e) => handleCitySearch(e.target.value)}
                      placeholder="Cherche ta ville..." className="glass-input w-full text-lg text-center" autoFocus />
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
                <div className="step-enter">
                  <h2 className="font-cinzel text-xl sm:text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">Personnalise ta lecture</h2>
                  <p className="text-xs sm:text-sm text-center text-[var(--color-text-secondary)] mb-8">Ajuste ces curseurs pour une expérience sur mesure.</p>
                  <div className="space-y-8">
                    {SLIDER_CONFIG.map((slider) => (
                      <EnhancedSlider key={slider.key} left={slider.left} right={slider.right} value={form[slider.key]}
                        onChange={(v) => setForm({ ...form, [slider.key]: v })} />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-10">
                <button onClick={() => setStep(step - 1)} className="btn-ghost px-5 py-2.5 rounded-xl text-sm">← Retour</button>
                {step < 5 ? (
                  <button onClick={() => canAdvance() && setStep(step + 1)} disabled={!canAdvance()}
                    className="btn-primary px-6 py-2.5 rounded-xl text-sm disabled:opacity-30 disabled:cursor-not-allowed">Suivant →</button>
                ) : (
                  <button onClick={doCalculation} className="btn-primary px-8 py-3 rounded-xl font-bold text-sm glow-lavender">✦ Calculer ma carte</button>
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
                <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent-lavender)] to-[var(--color-accent-gold)] animate-progress" />
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
                Le Ciel de <span className="text-[var(--color-accent-lavender)]">{form.prenom}</span>
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)] font-mono">
                {form.jour} {MONTHS[form.mois - 1]} {form.annee}
                {form.hasTime && ` — ${String(form.heure).padStart(2, "0")}h${String(form.minute).padStart(2, "0")}`}
                {" — "}{form.lieu}
              </p>
            </div>

            <div className="sticky top-0 z-30 bg-[var(--color-space-deep)]/95 backdrop-blur-xl border-b border-white/5">
              <div className="tab-nav flex overflow-x-auto px-4 py-2.5 gap-1 max-w-3xl mx-auto">
                {RESULT_TABS.map((tab) => (
                  <button key={tab.id} onClick={() => scrollToTab(tab.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap btn-hover ${
                      activeTab === tab.id
                        ? "bg-white/10 text-[var(--color-text-primary)] border border-white/10"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5"
                    }`}>
                    <span className="opacity-60">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 space-y-8 mt-6">

              {/* PORTRAIT */}
              <div ref={(el) => { sectionRefs.current.portrait = el; }} className="scroll-mt-16">
                <div className="glass p-4 sm:p-6 mb-6">
                  <ZodiacWheel planets={chart.planets} ascendant={chart.ascendant} selectedPlanet={selectedPlanet?.name} onTapPlanet={(p) => setSelectedPlanet(p)} />
                  <p className="text-[10px] text-center text-[var(--color-text-secondary)] mt-3 opacity-60">Touche une planète pour voir son interprétation</p>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    { label: "Soleil", desc: "Ton identité profonde", data: chart.planets[0], glyph: "☉" },
                    { label: "Lune", desc: "Ton monde émotionnel", data: chart.planets[1], glyph: "☽" },
                    ...(chart.ascendant ? [{ label: "Ascendant", desc: "Ta façade au monde", data: chart.ascendant, glyph: "AC" }] : []),
                  ].map((item) => (
                    <button key={item.label} className="w-full glass p-5 flex items-center gap-5 text-left btn-hover group"
                      onClick={() => setSelectedPlanet(item.data)}>
                      <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5 group-hover:border-[var(--color-accent-lavender)]/20 transition">
                        <span className="text-xl font-mono text-[var(--color-accent-lavender)]">{item.glyph}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-0.5">{item.label}</div>
                        <div className="font-cinzel text-lg text-[var(--color-text-primary)]">{item.data.sign}</div>
                        <div className="text-xs text-[var(--color-text-secondary)]">{item.desc}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-mono text-[var(--color-text-secondary)]">{item.data.degree}°</div>
                        {item.data.house && <div className="text-[10px] font-mono text-[var(--color-text-secondary)] opacity-50">M{item.data.house}</div>}
                      </div>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-text-secondary)] opacity-30 group-hover:opacity-60 transition"><path d="M6 4l4 4-4 4" /></svg>
                    </button>
                  ))}
                </div>

                <div className="glass p-6">
                  <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                    <span className="text-[var(--color-accent-lavender)] opacity-60">✦</span> Ton Portrait Cosmique
                  </h2>
                  <div className="text-sm text-[var(--color-text-primary)]/80 leading-relaxed space-y-4">
                    <p>{form.prenom}, ton Soleil en {chart.planets[0].sign} {getCosmicPortraitSun(chart.planets[0].sign)}</p>
                    <p>Ta Lune en {chart.planets[1].sign} {getCosmicPortraitMoon(chart.planets[1].sign)}</p>
                    {chart.ascendant && <p>Avec un Ascendant {chart.ascendant.sign}, {getCosmicPortraitAsc(chart.ascendant.sign)}</p>}
                  </div>
                </div>
              </div>

              {/* PLANETS */}
              <div ref={(el) => { sectionRefs.current.planets = el; }} className="scroll-mt-16">
                <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-1 flex items-center gap-2">
                  <span className="text-[var(--color-accent-lavender)] opacity-60">☉</span> Tes Planètes
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mb-4">Chaque planète colore un aspect de ta personnalité.</p>
                <div className="stagger-in space-y-2">
                  {chart.planets.map((planet) => (
                    <button key={planet.name} onClick={() => setSelectedPlanet(planet)}
                      className="w-full glass flex items-center justify-between p-4 text-left btn-hover group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-[var(--color-accent-lavender)]/20 transition">
                          <span className="text-base font-mono text-[var(--color-accent-lavender)]">{planet.symbol}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">{planet.name}</span>
                          <span className="text-xs text-[var(--color-text-secondary)] ml-2">{planet.sign}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">{planet.degree}°</span>
                        {planet.house && <span className="text-[10px] font-mono text-[var(--color-text-secondary)] opacity-50">M{planet.house}</span>}
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-text-secondary)] opacity-30 group-hover:opacity-60 transition"><path d="M5 3l4 4-4 4" /></svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ELEMENTS */}
              <div ref={(el) => { sectionRefs.current.elements = el; }} className="scroll-mt-16">
                <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-1 flex items-center gap-2">
                  <span className="text-[var(--color-accent-lavender)] opacity-60">◆</span> Éléments et Modalités
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mb-4">L&apos;équilibre des forces dans ta carte natale.</p>
                <div className="glass p-5">
                  <ElementBalance planets={chart.planets} />
                </div>
              </div>

              {/* HOUSES */}
              {chart.ascendant && (
                <div ref={(el) => { sectionRefs.current.houses = el; }} className="scroll-mt-16">
                  <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-1 flex items-center gap-2">
                    <span className="text-[var(--color-accent-lavender)] opacity-60">⌂</span> Tes 12 Maisons
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-4">Les domaines de vie activés par tes planètes.</p>
                  <HousesMap planets={chart.planets} />
                </div>
              )}

              {/* ASPECTS */}
              <div ref={(el) => { sectionRefs.current.aspects = el; }} className="scroll-mt-16">
                <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-1 flex items-center gap-2">
                  <span className="text-[var(--color-accent-lavender)] opacity-60">△</span> Tes Aspects
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mb-4">Les dialogues entre tes planètes — harmonies et tensions.</p>
                {chart.aspects.length > 0 ? (
                  <div className="space-y-2">
                    {chart.aspects.slice(0, form.depth >= 7 ? undefined : 12).map((aspect, i) => {
                      const interp = getAspectInterp(aspect.type, aspect.planet1, aspect.planet2);
                      const color = ASPECT_COLORS[aspect.type] || "#c9a0ff";
                      const symbol = ASPECT_SYMBOLS[aspect.type] || "·";
                      return (
                        <button key={i} className="w-full glass p-4 text-left btn-hover group"
                          onClick={() => setAspectModalData({
                            title: `${aspect.planet1} ${symbol} ${aspect.planet2}`,
                            subtitle: `${aspect.type} — orbe ${aspect.orb}°`,
                            text: interp || `L'aspect ${aspect.type.toLowerCase()} entre ${aspect.planet1} et ${aspect.planet2} crée un dialogue unique dans ta carte, colorant la manière dont ces deux énergies interagissent dans ton expérience de vie.`,
                          })}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-mono text-[var(--color-accent-lavender)]">{aspect.symbol1}</span>
                              <span className="text-[var(--color-text-primary)]">{aspect.planet1}</span>
                              <span style={{ color }} className="text-lg mx-0.5">{symbol}</span>
                              <span className="text-[var(--color-text-primary)]">{aspect.planet2}</span>
                              <span className="font-mono text-[var(--color-accent-lavender)]">{aspect.symbol2}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] px-2 py-0.5 rounded-full border font-mono" style={{ borderColor: `${color}30`, color }}>{aspect.type}</span>
                              <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">{aspect.orb}°</span>
                            </div>
                          </div>
                          {interp && <p className="text-xs text-[var(--color-text-secondary)] mt-2 line-clamp-2 group-hover:text-[var(--color-text-primary)]/60 transition">{interp}</p>}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="glass p-5 text-sm text-[var(--color-text-secondary)] text-center">Aucun aspect majeur détecté dans ta carte.</div>
                )}
              </div>

              {/* CLOSING */}
              <div className="glass p-8 text-center border-t border-[var(--color-accent-lavender)]/10">
                <div className="text-2xl mb-4 opacity-30 text-[var(--color-accent-lavender)]">✦</div>
                <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-5">Un dernier mot, {form.prenom}</h2>
                <div className="text-sm text-[var(--color-text-primary)]/80 leading-relaxed max-w-lg mx-auto space-y-4 mb-8">
                  <p>Cette carte est une photographie du ciel au moment précis de ta naissance — un instant unique dans l&apos;histoire du cosmos. Elle ne prédit rien. Elle ne détermine rien. Elle éclaire.</p>
                  <p>Les planètes dessinent des potentiels, des invitations, des tensions créatrices. C&apos;est toi qui choisis comment les vivre, les transformer, les transcender. Tu es l&apos;auteur·e de ton histoire — le ciel n&apos;en est que la toile de fond.</p>
                  <p className="text-[var(--color-accent-lavender)]/60 italic">&laquo;&nbsp;Le sage domine les étoiles, les étoiles ne dominent pas le sage.&nbsp;&raquo;</p>
                </div>
                <div className="flex items-center justify-center gap-3 mb-6">
                  <button onClick={() => {
                      const text = `Mon thème natal : Soleil en ${chart.planets[0].sign}, Lune en ${chart.planets[1].sign}${chart.ascendant ? `, Ascendant ${chart.ascendant.sign}` : ""}. Découvre le tien sur Ciel Natal !`;
                      if (navigator.share) { navigator.share({ title: "Mon Ciel Natal", text, url: window.location.href }); }
                      else { navigator.clipboard.writeText(text + " " + window.location.href); }
                    }} className="btn-ghost px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                    Partager
                  </button>
                  <button onClick={() => {
                      const text = `Mon thème natal : Soleil en ${chart.planets[0].sign}, Lune en ${chart.planets[1].sign}${chart.ascendant ? `, Ascendant ${chart.ascendant.sign}` : ""}.`;
                      navigator.clipboard.writeText(text);
                    }} className="btn-ghost px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    Copier
                  </button>
                </div>
                <p className="text-[10px] text-[var(--color-text-secondary)]/60 italic max-w-md mx-auto">L&apos;astrologie est un outil de réflexion personnelle inspiré de traditions millénaires. Elle ne remplace en aucun cas un avis médical, psychologique ou financier.</p>
              </div>

              <div className="text-center pb-8">
                <button onClick={() => { setStep(0); setChart(null); setSelectedPlanet(null); setAspectModalData(null); setActiveTab("portrait"); }}
                  className="btn-ghost px-6 py-3 rounded-xl text-sm">← Calculer une autre carte</button>
              </div>
            </div>

            {/* MODALS */}
            <GlassModal isOpen={!!selectedPlanet} onClose={() => setSelectedPlanet(null)}
              title={selectedPlanet?.name || ""} subtitle={selectedPlanet ? `${selectedPlanet.sign} — ${selectedPlanet.degree}°${selectedPlanet.house ? ` — Maison ${selectedPlanet.house}` : ""}` : ""}>
              {selectedPlanet && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                      <span className="text-2xl font-mono text-[var(--color-accent-lavender)]">{selectedPlanet.symbol}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[var(--color-text-primary)]">{selectedPlanet.name} en {selectedPlanet.sign}</div>
                      <div className="text-xs text-[var(--color-text-secondary)] font-mono">{selectedPlanet.degree}°{selectedPlanet.house ? ` — Maison ${selectedPlanet.house}` : ""}</div>
                    </div>
                  </div>
                  <div className="text-sm text-[var(--color-text-primary)]/80 leading-relaxed whitespace-pre-line">
                    {getInterp(selectedPlanet.name, selectedPlanet.sign, selectedPlanet.house) || (
                      <span className="text-[var(--color-text-secondary)]">{selectedPlanet.name} en {selectedPlanet.sign} colore ta manière d&apos;exprimer les qualités de ce signe dans ta vie quotidienne.</span>
                    )}
                  </div>
                </div>
              )}
            </GlassModal>

            <GlassModal isOpen={!!aspectModalData} onClose={() => setAspectModalData(null)}
              title={aspectModalData?.title || ""} subtitle={aspectModalData?.subtitle}>
              {aspectModalData && (
                <div className="text-sm text-[var(--color-text-primary)]/80 leading-relaxed">{aspectModalData.text}</div>
              )}
            </GlassModal>
          </section>
        )}
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
  const messages = ["Calcul des positions planétaires...", "Détermination des maisons astrologiques...", "Analyse des aspects entre les planètes...", "Tissage de ton portrait cosmique..."];
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
