"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Starfield from "@/components/Starfield";
import ZodiacWheel from "@/components/ZodiacWheel";
import BottomSheet from "@/components/BottomSheet";
import ElementBalance from "@/components/results/ElementBalance";
import HousesMap from "@/components/results/HousesMap";
import { calculateNatalChart, NatalChart, PlanetPosition, SIGNS, SIGN_SYMBOLS } from "@/lib/astro";
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

// ─── City database ────────────────────────────────────────────────
const CITIES: { name: string; lat: number; lon: number }[] = [
  { name: "Paris, France", lat: 48.8566, lon: 2.3522 },
  { name: "Montréal, Québec", lat: 45.5017, lon: -73.5673 },
  { name: "Lyon, France", lat: 45.764, lon: 4.8357 },
  { name: "Marseille, France", lat: 43.2965, lon: 5.3698 },
  { name: "Toulouse, France", lat: 43.6047, lon: 1.4442 },
  { name: "Québec, Québec", lat: 46.8139, lon: -71.208 },
  { name: "Bruxelles, Belgique", lat: 50.8503, lon: 4.3517 },
  { name: "Genève, Suisse", lat: 46.2044, lon: 6.1432 },
  { name: "Bordeaux, France", lat: 44.8378, lon: -0.5792 },
  { name: "Lille, France", lat: 50.6292, lon: 3.0573 },
  { name: "Nice, France", lat: 43.7102, lon: 7.262 },
  { name: "Nantes, France", lat: 47.2184, lon: -1.5536 },
  { name: "Strasbourg, France", lat: 48.5734, lon: 7.7521 },
  { name: "Ottawa, Ontario", lat: 45.4215, lon: -75.6972 },
  { name: "Toronto, Ontario", lat: 43.6532, lon: -79.3832 },
  { name: "Vancouver, BC", lat: 49.2827, lon: -123.1207 },
  { name: "Dakar, Sénégal", lat: 14.7167, lon: -17.4677 },
  { name: "Tunis, Tunisie", lat: 36.8065, lon: 10.1815 },
  { name: "Casablanca, Maroc", lat: 33.5731, lon: -7.5898 },
  { name: "Alger, Algérie", lat: 36.7538, lon: 3.0588 },
  { name: "Lausanne, Suisse", lat: 46.5197, lon: 6.6323 },
  { name: "Luxembourg, Luxembourg", lat: 49.6117, lon: 6.13 },
  { name: "Abidjan, Côte d'Ivoire", lat: 5.3600, lon: -4.0083 },
  { name: "Kinshasa, RDC", lat: -4.4419, lon: 15.2663 },
  { name: "Port-au-Prince, Haïti", lat: 18.5944, lon: -72.3074 },
  { name: "New York, USA", lat: 40.7128, lon: -74.006 },
  { name: "Los Angeles, USA", lat: 34.0522, lon: -118.2437 },
  { name: "Londres, UK", lat: 51.5074, lon: -0.1278 },
  { name: "Berlin, Allemagne", lat: 52.52, lon: 13.405 },
  { name: "Rome, Italie", lat: 41.9028, lon: 12.4964 },
  { name: "Madrid, Espagne", lat: 40.4168, lon: -3.7038 },
  { name: "Lisbonne, Portugal", lat: 38.7223, lon: -9.1393 },
  { name: "Amsterdam, Pays-Bas", lat: 52.3676, lon: 4.9041 },
  { name: "Zurich, Suisse", lat: 47.3769, lon: 8.5417 },
  { name: "Sherbrooke, Québec", lat: 45.4042, lon: -71.8929 },
  { name: "Trois-Rivières, Québec", lat: 46.3432, lon: -72.5419 },
  { name: "Gatineau, Québec", lat: 45.4765, lon: -75.7013 },
  { name: "Laval, Québec", lat: 45.6066, lon: -73.7124 },
  { name: "Saguenay, Québec", lat: 48.4279, lon: -71.0548 },
];

// ─── Results tab definition ───────────────────────────────────────
const RESULT_TABS = [
  { id: "portrait", label: "Portrait", icon: "✦" },
  { id: "planets", label: "Planètes", icon: "☉" },
  { id: "elements", label: "Éléments", icon: "🔥" },
  { id: "houses", label: "Maisons", icon: "🏠" },
  { id: "aspects", label: "Aspects", icon: "△" },
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
  const [citySuggestions, setCitySuggestions] = useState<typeof CITIES>([]);
  const [activeTab, setActiveTab] = useState("portrait");
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetPosition | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);
  const [interpretations, setInterpretations] = useState<Record<string, unknown> | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    import("@/data/interpretations").then((mod) => {
      setInterpretations(mod as unknown as Record<string, unknown>);
    });
  }, []);

  const handleCitySearch = useCallback((query: string) => {
    setForm((f) => ({ ...f, lieu: query }));
    if (query.length < 2) { setCitySuggestions([]); return; }
    const q = query.toLowerCase();
    setCitySuggestions(CITIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6));
  }, []);

  const selectCity = useCallback((city: (typeof CITIES)[0]) => {
    setForm((f) => ({ ...f, lieu: city.name, latitude: city.lat, longitude: city.lon }));
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

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10">

        {/* ═══ HERO ═══ */}
        {step === 0 && (
          <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
            <div className="animate-fade-in-up">
              <div className="text-5xl md:text-6xl mb-6 opacity-60">✦</div>
              <h1 className="font-cinzel text-3xl sm:text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[var(--color-accent-lavender)] to-[var(--color-accent-gold)] bg-clip-text text-transparent leading-tight">
                Ciel Natal
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-md mx-auto mb-2 font-light">
                Qu&apos;est-ce que le ciel racontait
              </p>
              <p className="text-lg sm:text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-md mx-auto mb-10 font-light">
                quand tu es né(e)&nbsp;?
              </p>
              <button
                onClick={() => setStep(1)}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--color-accent-lavender)] to-purple-500 text-white font-medium text-lg active:scale-95 transition-transform glow-lavender"
              >
                Découvrir ma carte
              </button>
            </div>
          </section>
        )}

        {/* ═══ FORM STEPS ═══ */}
        {step >= 1 && step <= 5 && (
          <section className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="glass p-6 sm:p-8 md:p-12 max-w-lg w-full glow-lavender step-enter">
              {/* Progress bar */}
              <div className="flex gap-1.5 mb-8">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="flex-1 h-1 rounded-full overflow-hidden bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${s < step ? "bg-[var(--color-accent-gold)]" : s === step ? "bg-[var(--color-accent-lavender)]" : ""}`}
                      style={{ width: s <= step ? "100%" : "0%" }}
                    />
                  </div>
                ))}
              </div>

              {/* Step 1: Prénom */}
              {step === 1 && (
                <div className="step-enter">
                  <h2 className="font-cinzel text-xl sm:text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">
                    Comment t&apos;appelles-tu&nbsp;?
                  </h2>
                  <p className="text-xs sm:text-sm text-center text-[var(--color-text-secondary)] mb-8">
                    Ton prénom personnalisera toute ta lecture.
                  </p>
                  <input
                    type="text" value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    placeholder="Ton prénom"
                    className="w-full bg-white/10 border border-[var(--color-glass-border)] rounded-xl px-5 py-4 text-lg text-center text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent-lavender)] transition"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && canAdvance() && setStep(2)}
                  />
                </div>
              )}

              {/* Step 2: Date */}
              {step === 2 && (
                <div className="step-enter">
                  <h2 className="font-cinzel text-xl sm:text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">
                    Quand es-tu né(e)&nbsp;?
                  </h2>
                  <p className="text-xs sm:text-sm text-center text-[var(--color-text-secondary)] mb-8">
                    La position des astres change chaque jour.
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1 block text-center">Jour</label>
                      <input type="number" min={1} max={31} value={form.jour}
                        onChange={(e) => setForm({ ...form, jour: parseInt(e.target.value) || 1 })}
                        className="w-full bg-white/10 border border-[var(--color-glass-border)] rounded-xl px-2 sm:px-3 py-3 sm:py-4 text-base sm:text-lg text-center text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-lavender)] transition" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1 block text-center">Mois</label>
                      <select value={form.mois} onChange={(e) => setForm({ ...form, mois: parseInt(e.target.value) })}
                        className="w-full bg-white/10 border border-[var(--color-glass-border)] rounded-xl px-1 sm:px-3 py-3 sm:py-4 text-base sm:text-lg text-center text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-lavender)] transition appearance-none">
                        {["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"].map((m, i) => (
                          <option key={i} value={i + 1} className="bg-[var(--color-space-deep)]">{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1 block text-center">Année</label>
                      <input type="number" min={1900} max={2026} value={form.annee}
                        onChange={(e) => setForm({ ...form, annee: parseInt(e.target.value) || 1990 })}
                        className="w-full bg-white/10 border border-[var(--color-glass-border)] rounded-xl px-2 sm:px-3 py-3 sm:py-4 text-base sm:text-lg text-center text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-lavender)] transition" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Heure */}
              {step === 3 && (
                <div className="step-enter">
                  <h2 className="font-cinzel text-xl sm:text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">
                    À quelle heure&nbsp;?
                  </h2>
                  <p className="text-xs sm:text-sm text-center text-[var(--color-text-secondary)] mb-8">
                    L&apos;heure exacte détermine ton Ascendant et tes maisons.
                  </p>
                  <label className="flex items-center justify-center gap-3 mb-6 cursor-pointer">
                    <input type="checkbox" checked={form.hasTime}
                      onChange={(e) => setForm({ ...form, hasTime: e.target.checked })}
                      className="w-5 h-5 accent-[var(--color-accent-lavender)]" />
                    <span className="text-sm text-[var(--color-text-secondary)]">Je connais mon heure de naissance</span>
                  </label>
                  {form.hasTime ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1 block text-center">Heure</label>
                        <input type="number" min={0} max={23} value={form.heure}
                          onChange={(e) => setForm({ ...form, heure: parseInt(e.target.value) || 0 })}
                          className="w-full bg-white/10 border border-[var(--color-glass-border)] rounded-xl px-3 py-4 text-lg text-center text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-lavender)] transition" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1 block text-center">Minute</label>
                        <input type="number" min={0} max={59} value={form.minute}
                          onChange={(e) => setForm({ ...form, minute: parseInt(e.target.value) || 0 })}
                          className="w-full bg-white/10 border border-[var(--color-glass-border)] rounded-xl px-3 py-4 text-lg text-center text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-lavender)] transition" />
                      </div>
                    </div>
                  ) : (
                    <div className="glass p-4 text-sm text-[var(--color-text-secondary)] text-center">
                      Sans heure exacte, ta lecture n&apos;inclura pas l&apos;Ascendant ni les maisons astrologiques.
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Lieu */}
              {step === 4 && (
                <div className="step-enter">
                  <h2 className="font-cinzel text-xl sm:text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">
                    Où es-tu né(e)&nbsp;?
                  </h2>
                  <p className="text-xs sm:text-sm text-center text-[var(--color-text-secondary)] mb-8">
                    Le lieu affine le calcul de ton Ascendant.
                  </p>
                  <div className="relative">
                    <input type="text" value={form.lieu}
                      onChange={(e) => handleCitySearch(e.target.value)}
                      placeholder="Cherche ta ville..."
                      className="w-full bg-white/10 border border-[var(--color-glass-border)] rounded-xl px-5 py-4 text-lg text-center text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent-lavender)] transition"
                      autoFocus />
                    {citySuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 glass overflow-hidden z-20">
                        {citySuggestions.map((city) => (
                          <button key={city.name} onClick={() => selectCity(city)}
                            className="w-full px-4 py-3 text-left active:bg-white/10 transition text-[var(--color-text-primary)] text-sm border-b border-[var(--color-glass-border)] last:border-0">
                            {city.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 5: Préférences */}
              {step === 5 && (
                <div className="step-enter">
                  <h2 className="font-cinzel text-xl sm:text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">
                    Personnalise ta lecture
                  </h2>
                  <p className="text-xs sm:text-sm text-center text-[var(--color-text-secondary)] mb-8">
                    Ajuste ces curseurs selon tes préférences.
                  </p>
                  <div className="space-y-7">
                    <SliderField label1="🔬 Scientifique" label2="Ésotérique 🔮" value={form.tone}
                      onChange={(v) => setForm({ ...form, tone: v })} />
                    <SliderField label1="⚡ Concis" label2="Approfondi 📖" value={form.depth}
                      onChange={(v) => setForm({ ...form, depth: v })} />
                    <SliderField label1="🎯 Pratique" label2="Introspectif 🧘" value={form.focus}
                      onChange={(v) => setForm({ ...form, focus: v })} />
                  </div>
                </div>
              )}

              {/* Nav buttons */}
              <div className="flex justify-between mt-10">
                <button onClick={() => setStep(step - 1)}
                  className="px-5 py-2.5 rounded-xl text-sm text-[var(--color-text-secondary)] active:text-[var(--color-text-primary)] transition">
                  ← Retour
                </button>
                {step < 5 ? (
                  <button onClick={() => canAdvance() && setStep(step + 1)} disabled={!canAdvance()}
                    className="px-6 py-2.5 rounded-xl bg-[var(--color-accent-lavender)] text-[var(--color-space-deep)] font-medium text-sm active:scale-95 transition disabled:opacity-30">
                    Suivant →
                  </button>
                ) : (
                  <button onClick={doCalculation}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--color-accent-lavender)] to-[var(--color-accent-gold)] text-[var(--color-space-deep)] font-bold text-sm active:scale-95 transition-transform glow-lavender">
                    ✦ Calculer ma carte
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ═══ LOADING ═══ */}
        {step === 6 && (
          <section className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center animate-fade-in-up max-w-xs mx-auto">
              <div className="text-5xl mb-8 animate-pulse-glow">✦</div>
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
            {/* Header */}
            <div className="text-center pt-8 pb-4 px-4">
              <div className="text-3xl mb-2 opacity-50">✦</div>
              <h1 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-accent-lavender)] mb-1">
                Le Ciel de {form.prenom}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {form.jour}/{form.mois}/{form.annee}
                {form.hasTime && ` · ${String(form.heure).padStart(2, "0")}h${String(form.minute).padStart(2, "0")}`}
                {" · "}{form.lieu}
              </p>
            </div>

            {/* Sticky tab navigation */}
            <div className="sticky top-0 z-30 bg-[var(--color-space-deep)]/90 backdrop-blur-md border-b border-[var(--color-glass-border)]">
              <div className="tab-nav flex overflow-x-auto px-4 py-2 gap-1 max-w-3xl mx-auto">
                {RESULT_TABS.map((tab) => (
                  <button key={tab.id} onClick={() => scrollToTab(tab.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-[var(--color-accent-lavender)]/20 text-[var(--color-accent-lavender)] border border-[var(--color-accent-lavender)]/30"
                        : "text-[var(--color-text-secondary)] active:bg-white/5"
                    }`}>
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 space-y-6 mt-6">

              {/* ─── PORTRAIT TAB ─── */}
              <div ref={(el) => { sectionRefs.current.portrait = el; }} className="scroll-mt-16">
                {/* Zodiac Wheel */}
                <div className="glass p-4 sm:p-6 glow-lavender mb-4">
                  <ZodiacWheel
                    planets={chart.planets}
                    ascendant={chart.ascendant}
                    selectedPlanet={selectedPlanet?.name}
                    onTapPlanet={(p) => setSelectedPlanet(p)}
                  />
                </div>

                {/* Big Three — horizontal scroll on mobile */}
                <div className="flex gap-3 overflow-x-auto pb-2 tab-nav mb-4">
                  {(() => {
                    const items = [
                      { label: "Soleil", icon: "☉", data: chart.planets[0], color: "#ffd700" },
                      { label: "Lune", icon: "☽", data: chart.planets[1], color: "#c9a0ff" },
                      ...(chart.ascendant ? [{ label: "Ascendant", icon: "↑", data: chart.ascendant, color: "#60a5fa" }] : []),
                    ];
                    return items.map((item) => (
                      <button key={item.label}
                        className="flex-shrink-0 glass p-4 min-w-[130px] text-center touch-card"
                        onClick={() => setSelectedPlanet(item.data)}>
                        <div className="text-2xl mb-1" style={{ color: item.color }}>{item.icon}</div>
                        <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-0.5">{item.label}</div>
                        <div className="font-cinzel text-sm text-[var(--color-text-primary)]">
                          {SIGN_SYMBOLS[item.data.signIndex]} {item.data.sign}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-secondary)] font-mono mt-0.5">
                          {item.data.degree}°{item.data.house ? ` · M${item.data.house}` : ""}
                        </div>
                      </button>
                    ));
                  })()}
                </div>

                {/* Cosmic portrait text */}
                <div className="glass p-5 sm:p-6">
                  <h2 className="font-cinzel text-lg text-[var(--color-accent-lavender)] mb-3">
                    ✦ Ton Portrait Cosmique
                  </h2>
                  <div className="text-sm text-[var(--color-text-primary)] leading-relaxed space-y-3">
                    <p>{form.prenom}, ton Soleil en {chart.planets[0].sign} {getCosmicPortraitSun(chart.planets[0].sign)}</p>
                    <p>Ta Lune en {chart.planets[1].sign} {getCosmicPortraitMoon(chart.planets[1].sign)}</p>
                    {chart.ascendant && <p>Avec un Ascendant {chart.ascendant.sign}, {getCosmicPortraitAsc(chart.ascendant.sign)}</p>}
                  </div>
                </div>
              </div>

              {/* ─── PLANETS TAB ─── */}
              <div ref={(el) => { sectionRefs.current.planets = el; }} className="scroll-mt-16">
                <h2 className="font-cinzel text-lg text-[var(--color-accent-lavender)] mb-3 flex items-center gap-2">
                  <span>☉</span> Tes Planètes
                </h2>
                <div className="stagger-in space-y-2">
                  {chart.planets.map((planet) => (
                    <button key={planet.name} onClick={() => setSelectedPlanet(planet)}
                      className="w-full glass flex items-center justify-between p-4 touch-card text-left">
                      <div className="flex items-center gap-3">
                        <span className="text-xl text-[var(--color-accent-gold)]">{planet.symbol}</span>
                        <div>
                          <span className="text-sm font-medium">{planet.name}</span>
                          <span className="text-xs text-[var(--color-text-secondary)] ml-2">
                            {SIGN_SYMBOLS[planet.signIndex]} {planet.sign}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {planet.house && <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">M{planet.house}</span>}
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-text-secondary)] opacity-40">
                          <path d="M6 4l4 4-4 4" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ─── ELEMENTS TAB ─── */}
              <div ref={(el) => { sectionRefs.current.elements = el; }} className="scroll-mt-16">
                <h2 className="font-cinzel text-lg text-[var(--color-accent-lavender)] mb-3 flex items-center gap-2">
                  <span>🔥</span> Éléments & Modalités
                </h2>
                <div className="glass p-5">
                  <ElementBalance planets={chart.planets} />
                </div>
              </div>

              {/* ─── HOUSES TAB ─── */}
              {chart.ascendant && (
                <div ref={(el) => { sectionRefs.current.houses = el; }} className="scroll-mt-16">
                  <h2 className="font-cinzel text-lg text-[var(--color-accent-lavender)] mb-3 flex items-center gap-2">
                    <span>🏠</span> Tes 12 Maisons
                  </h2>
                  <div className="glass p-5">
                    <HousesMap planets={chart.planets} onTapHouse={(h) => setSelectedHouse(h)} />
                  </div>
                </div>
              )}

              {/* ─── ASPECTS TAB ─── */}
              <div ref={(el) => { sectionRefs.current.aspects = el; }} className="scroll-mt-16">
                <h2 className="font-cinzel text-lg text-[var(--color-accent-lavender)] mb-3 flex items-center gap-2">
                  <span>△</span> Tes Aspects
                </h2>
                {chart.aspects.length > 0 ? (
                  <div className="space-y-2">
                    {chart.aspects.slice(0, form.depth >= 7 ? undefined : 12).map((aspect, i) => {
                      const colors: Record<string, string> = {
                        Conjonction: "#c9a0ff", Trigone: "#34d399", Sextile: "#60a5fa", Carre: "#ef4444", Opposition: "#fbbf24",
                      };
                      const symbols: Record<string, string> = {
                        Conjonction: "☌", Trigone: "△", Sextile: "⚹", Carre: "□", Opposition: "☍",
                      };
                      const interp = getAspectInterp(aspect.type, aspect.planet1, aspect.planet2);
                      return (
                        <button key={i}
                          className="w-full glass p-4 touch-card text-left"
                          onClick={() => interp && setSelectedPlanet({
                            name: `${aspect.planet1} ${symbols[aspect.type]} ${aspect.planet2}`,
                            symbol: symbols[aspect.type] || "·",
                            longitude: 0, sign: aspect.type, signIndex: 0, degree: 0,
                          } as PlanetPosition & { _aspectInterp?: string })}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-[var(--color-accent-gold)]">{aspect.symbol1}</span>
                              <span>{aspect.planet1}</span>
                              <span style={{ color: colors[aspect.type] }} className="text-lg mx-0.5">{symbols[aspect.type]}</span>
                              <span>{aspect.planet2}</span>
                              <span className="text-[var(--color-accent-gold)]">{aspect.symbol2}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: `${colors[aspect.type]}15`, color: colors[aspect.type] }}>
                                {aspect.type}
                              </span>
                              <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">{aspect.orb}°</span>
                            </div>
                          </div>
                          {interp && (
                            <p className="text-xs text-[var(--color-text-secondary)] mt-2 line-clamp-2">{interp}</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="glass p-5 text-sm text-[var(--color-text-secondary)] text-center">
                    Aucun aspect majeur détecté dans ta carte.
                  </div>
                )}
              </div>

              {/* ─── CLOSING ─── */}
              <div className="glass p-6 text-center">
                <h2 className="font-cinzel text-lg text-[var(--color-accent-lavender)] mb-3">✦ Un Mot de Clôture</h2>
                <p className="text-sm text-[var(--color-text-primary)] leading-relaxed max-w-md mx-auto mb-3">
                  {form.prenom}, cette carte est un miroir, pas une sentence. Elle reflète des tendances, des potentiels et des invitations — pas des certitudes.
                </p>
                <p className="text-[10px] text-[var(--color-text-secondary)] italic">
                  L&apos;astrologie est un outil de réflexion personnelle, pas un substitut à un avis médical, psychologique ou financier.
                </p>
              </div>

              {/* Restart */}
              <div className="text-center pb-8">
                <button onClick={() => { setStep(0); setChart(null); setSelectedPlanet(null); setActiveTab("portrait"); }}
                  className="px-6 py-3 rounded-xl border border-[var(--color-glass-border)] text-[var(--color-text-secondary)] active:text-[var(--color-text-primary)] transition text-sm">
                  ← Calculer une autre carte
                </button>
              </div>
            </div>

            {/* ═══ BOTTOM SHEETS ═══ */}

            {/* Planet detail sheet */}
            <BottomSheet
              isOpen={!!selectedPlanet}
              onClose={() => setSelectedPlanet(null)}
              title={selectedPlanet ? `${selectedPlanet.name}` : ""}
              icon={selectedPlanet?.symbol}
              iconColor="#ffd700"
            >
              {selectedPlanet && (
                <div className="space-y-4">
                  {/* Planet header info */}
                  <div className="flex items-center gap-4 pb-3 border-b border-[var(--color-glass-border)]">
                    <div className="text-center">
                      <div className="text-3xl text-[var(--color-accent-gold)]">{selectedPlanet.symbol}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{selectedPlanet.name}</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">
                        {SIGN_SYMBOLS[selectedPlanet.signIndex]} {selectedPlanet.sign} · {selectedPlanet.degree}°
                        {selectedPlanet.house ? ` · Maison ${selectedPlanet.house}` : ""}
                      </div>
                    </div>
                  </div>
                  {/* Interpretation */}
                  <div className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-line">
                    {getInterp(selectedPlanet.name, selectedPlanet.sign, selectedPlanet.house) || (
                      <span className="text-[var(--color-text-secondary)] italic">
                        {selectedPlanet.name} en {selectedPlanet.sign} — une énergie qui colore ta manière d&apos;exprimer les qualités de ce signe dans ta vie.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </BottomSheet>

            {/* House detail sheet */}
            <BottomSheet
              isOpen={!!selectedHouse}
              onClose={() => setSelectedHouse(null)}
              title={selectedHouse ? `Maison ${selectedHouse} — ${houseDescriptions[selectedHouse]?.domain}` : ""}
              icon={selectedHouse ? ["👤", "💎", "💬", "🏠", "🎨", "⚙️", "🤝", "🔮", "🌍", "🏔️", "👥", "🌙"][selectedHouse - 1] : undefined}
            >
              {selectedHouse && (
                <div className="space-y-4">
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {houseDescriptions[selectedHouse]?.description}
                  </p>
                  {/* Planets in this house */}
                  {chart.planets.filter((p) => p.house === selectedHouse).length > 0 ? (
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)] mb-2">Planètes dans cette maison</h4>
                      <div className="space-y-3">
                        {chart.planets.filter((p) => p.house === selectedHouse).map((p) => (
                          <div key={p.name}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[var(--color-accent-gold)]">{p.symbol}</span>
                              <span className="text-sm font-medium">{p.name} en {p.sign}</span>
                            </div>
                            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                              {planetInHouse[p.name]?.[selectedHouse] || `${p.name} dans ta Maison ${selectedHouse} apporte son énergie au domaine de ${houseDescriptions[selectedHouse]?.domain?.toLowerCase()}.`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--color-text-secondary)] italic">
                      Aucune planète dans cette maison. L&apos;énergie de cette maison s&apos;exprime à travers le signe qui la gouverne.
                    </p>
                  )}
                </div>
              )}
            </BottomSheet>

          </section>
        )}
      </div>
    </main>
  );
}

// ─── Slider Field ─────────────────────────────────────────────────
function SliderField({ label1, label2, value, onChange }: { label1: string; label2: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">
        <span>{label1}</span>
        <span>{label2}</span>
      </div>
      <input type="range" min={1} max={10} value={value} onChange={(e) => onChange(parseInt(e.target.value))} />
      <div className="text-center text-xs text-[var(--color-accent-lavender)] mt-1 font-mono">{value}/10</div>
    </div>
  );
}

// ─── Loading Messages ─────────────────────────────────────────────
function LoadingMessages() {
  const messages = [
    "Calcul des positions planétaires...",
    "Détermination des maisons astrologiques...",
    "Analyse des aspects entre les planètes...",
    "Tissage de ton portrait cosmique...",
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => Math.min(i + 1, messages.length - 1)), 800);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="space-y-2">
      {messages.map((msg, i) => (
        <p key={i} className={`text-xs transition-all duration-500 ${i <= idx ? "text-[var(--color-text-primary)] opacity-100" : "text-[var(--color-text-secondary)] opacity-20"}`}>
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
