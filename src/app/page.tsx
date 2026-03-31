"use client";

import { useState, useEffect, useCallback } from "react";
import Starfield from "@/components/Starfield";
import ZodiacWheel from "@/components/ZodiacWheel";
import { calculateNatalChart, NatalChart, SIGNS, SIGN_SYMBOLS } from "@/lib/astro";

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
  tone: number;     // 1=scientifique, 10=ésotérique
  depth: number;    // 1=concis, 10=approfondi
  focus: number;    // 1=pratique, 10=introspectif
}

// ─── City database (major francophone cities) ─────────────────────
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
  { name: "Chicoutimi, Québec", lat: 48.4279, lon: -71.0548 },
];

// ─── Page ────────────────────────────────────────────────────────
export default function Home() {
  const [step, setStep] = useState(0); // 0=hero, 1-5=form steps, 6=loading, 7=results
  const [form, setForm] = useState<FormData>({
    prenom: "",
    jour: 15,
    mois: 6,
    annee: 1990,
    heure: 12,
    minute: 0,
    hasTime: true,
    lieu: "",
    latitude: 48.8566,
    longitude: 2.3522,
    tone: 5,
    depth: 5,
    focus: 5,
  });
  const [chart, setChart] = useState<NatalChart | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<typeof CITIES>([]);
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);
  const [interpretations, setInterpretations] = useState<Record<string, unknown> | null>(null);

  // Lazy-load interpretations
  useEffect(() => {
    import("@/data/interpretations").then((mod) => {
      setInterpretations(mod as unknown as Record<string, unknown>);
    });
  }, []);

  const handleCitySearch = useCallback((query: string) => {
    setForm((f) => ({ ...f, lieu: query }));
    if (query.length < 2) {
      setCitySuggestions([]);
      return;
    }
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
        form.hasTime ? form.heure : 12,
        form.hasTime ? form.minute : 0,
        form.latitude, form.longitude,
        form.hasTime
      );
      setChart(c);
      setTimeout(() => setStep(7), 2000);
    }, 1500);
  };

  const getInterp = (planet: string, sign: string, house?: number): string => {
    if (!interpretations) return "";
    const mod = interpretations as {
      planetInSign: Record<string, Record<string, string>>;
      planetInHouse: Record<string, Record<number, string>>;
      getInterpretation?: (planet: string, sign: string, house: number | undefined, prefs: {tone: number; depth: number; focus: number}) => string;
    };
    if (mod.getInterpretation) {
      return mod.getInterpretation(planet, sign, house, { tone: form.tone, depth: form.depth, focus: form.focus });
    }
    let text = mod.planetInSign?.[planet]?.[sign] || "";
    if (house && mod.planetInHouse?.[planet]?.[house]) {
      text += " " + mod.planetInHouse[planet][house];
    }
    return text;
  };

  const getAspectInterp = (type: string, p1: string, p2: string): string => {
    if (!interpretations) return "";
    const mod = interpretations as {
      aspectInterpretations: Record<string, Record<string, string>>;
    };
    const key1 = `${p1}-${p2}`;
    const key2 = `${p2}-${p1}`;
    return mod.aspectInterpretations?.[type]?.[key1] || mod.aspectInterpretations?.[type]?.[key2] || "";
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
              <div className="text-6xl mb-6 opacity-60">✦</div>
              <h1 className="font-cinzel text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[var(--color-accent-lavender)] to-[var(--color-accent-gold)] bg-clip-text text-transparent">
                Ciel Natal
              </h1>
              <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-xl mx-auto mb-2 font-light">
                Qu&apos;est-ce que le ciel racontait
              </p>
              <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-xl mx-auto mb-10 font-light">
                quand tu es né(e)&nbsp;?
              </p>
              <button
                onClick={() => setStep(1)}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--color-accent-lavender)] to-purple-500 text-white font-medium text-lg hover:scale-105 transition-transform glow-lavender"
              >
                Découvrir ma carte
              </button>
            </div>
            <div className="absolute bottom-8 animate-bounce opacity-40">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
          </section>
        )}

        {/* ═══ FORM STEPS ═══ */}
        {step >= 1 && step <= 5 && (
          <section className="min-h-screen flex items-center justify-center px-4">
            <div className="glass p-8 md:p-12 max-w-lg w-full glow-lavender step-enter">
              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${s === step ? "bg-[var(--color-accent-lavender)] scale-125" : s < step ? "bg-[var(--color-accent-gold)]" : "bg-[var(--color-text-secondary)] opacity-30"}`}
                  />
                ))}
              </div>

              {/* Step 1: Prénom */}
              {step === 1 && (
                <div className="step-enter">
                  <h2 className="font-cinzel text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">
                    Comment t&apos;appelles-tu&nbsp;?
                  </h2>
                  <p className="text-sm text-center text-[var(--color-text-secondary)] mb-8">
                    Ton prénom personnalisera toute ta lecture.
                  </p>
                  <input
                    type="text"
                    value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    placeholder="Ton prénom"
                    className="w-full bg-white/10 border border-[var(--color-glass-border)] rounded-xl px-5 py-4 text-lg text-center text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent-lavender)] transition"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && canAdvance() && setStep(2)}
                  />
                </div>
              )}

              {/* Step 2: Date de naissance */}
              {step === 2 && (
                <div className="step-enter">
                  <h2 className="font-cinzel text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">
                    Quand es-tu né(e)&nbsp;?
                  </h2>
                  <p className="text-sm text-center text-[var(--color-text-secondary)] mb-8">
                    La position des astres change chaque jour.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1 block text-center">Jour</label>
                      <input
                        type="number" min={1} max={31} value={form.jour}
                        onChange={(e) => setForm({ ...form, jour: parseInt(e.target.value) || 1 })}
                        className="w-full bg-white/10 border border-[var(--color-glass-border)] rounded-xl px-3 py-4 text-lg text-center text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-lavender)] transition"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1 block text-center">Mois</label>
                      <select
                        value={form.mois}
                        onChange={(e) => setForm({ ...form, mois: parseInt(e.target.value) })}
                        className="w-full bg-white/10 border border-[var(--color-glass-border)] rounded-xl px-3 py-4 text-lg text-center text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-lavender)] transition appearance-none"
                      >
                        {["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"].map((m, i) => (
                          <option key={i} value={i + 1} className="bg-[var(--color-space-deep)]">{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1 block text-center">Année</label>
                      <input
                        type="number" min={1900} max={2026} value={form.annee}
                        onChange={(e) => setForm({ ...form, annee: parseInt(e.target.value) || 1990 })}
                        className="w-full bg-white/10 border border-[var(--color-glass-border)] rounded-xl px-3 py-4 text-lg text-center text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-lavender)] transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Heure de naissance */}
              {step === 3 && (
                <div className="step-enter">
                  <h2 className="font-cinzel text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">
                    À quelle heure&nbsp;?
                  </h2>
                  <p className="text-sm text-center text-[var(--color-text-secondary)] mb-8">
                    L&apos;heure exacte détermine ton Ascendant et tes maisons.
                  </p>
                  <label className="flex items-center justify-center gap-3 mb-6 cursor-pointer">
                    <input
                      type="checkbox" checked={form.hasTime}
                      onChange={(e) => setForm({ ...form, hasTime: e.target.checked })}
                      className="w-4 h-4 accent-[var(--color-accent-lavender)]"
                    />
                    <span className="text-sm text-[var(--color-text-secondary)]">Je connais mon heure de naissance</span>
                  </label>
                  {form.hasTime ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1 block text-center">Heure</label>
                        <input
                          type="number" min={0} max={23} value={form.heure}
                          onChange={(e) => setForm({ ...form, heure: parseInt(e.target.value) || 0 })}
                          className="w-full bg-white/10 border border-[var(--color-glass-border)] rounded-xl px-3 py-4 text-lg text-center text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-lavender)] transition"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1 block text-center">Minute</label>
                        <input
                          type="number" min={0} max={59} value={form.minute}
                          onChange={(e) => setForm({ ...form, minute: parseInt(e.target.value) || 0 })}
                          className="w-full bg-white/10 border border-[var(--color-glass-border)] rounded-xl px-3 py-4 text-lg text-center text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-lavender)] transition"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="glass p-4 text-sm text-[var(--color-text-secondary)] text-center">
                      Sans heure exacte, ta lecture n&apos;inclura pas l&apos;Ascendant ni les maisons astrologiques. Les positions planétaires resteront précises.
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Lieu */}
              {step === 4 && (
                <div className="step-enter">
                  <h2 className="font-cinzel text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">
                    Où es-tu né(e)&nbsp;?
                  </h2>
                  <p className="text-sm text-center text-[var(--color-text-secondary)] mb-8">
                    Le lieu affine le calcul de ton Ascendant.
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.lieu}
                      onChange={(e) => handleCitySearch(e.target.value)}
                      placeholder="Cherche ta ville..."
                      className="w-full bg-white/10 border border-[var(--color-glass-border)] rounded-xl px-5 py-4 text-lg text-center text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent-lavender)] transition"
                      autoFocus
                    />
                    {citySuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 glass overflow-hidden z-20">
                        {citySuggestions.map((city) => (
                          <button
                            key={city.name}
                            onClick={() => selectCity(city)}
                            className="w-full px-4 py-3 text-left hover:bg-white/10 transition text-[var(--color-text-primary)] text-sm border-b border-[var(--color-glass-border)] last:border-0"
                          >
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
                  <h2 className="font-cinzel text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">
                    Personnalise ta lecture
                  </h2>
                  <p className="text-sm text-center text-[var(--color-text-secondary)] mb-8">
                    Ajuste ces curseurs selon tes préférences.
                  </p>
                  <div className="space-y-8">
                    {/* Tone slider */}
                    <div>
                      <div className="flex justify-between text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">
                        <span>🔬 Scientifique</span>
                        <span>Ésotérique 🔮</span>
                      </div>
                      <input
                        type="range" min={1} max={10} value={form.tone}
                        onChange={(e) => setForm({ ...form, tone: parseInt(e.target.value) })}
                      />
                      <div className="text-center text-xs text-[var(--color-accent-lavender)] mt-1 font-mono">{form.tone}/10</div>
                    </div>
                    {/* Depth slider */}
                    <div>
                      <div className="flex justify-between text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">
                        <span>⚡ Concis</span>
                        <span>Approfondi 📖</span>
                      </div>
                      <input
                        type="range" min={1} max={10} value={form.depth}
                        onChange={(e) => setForm({ ...form, depth: parseInt(e.target.value) })}
                      />
                      <div className="text-center text-xs text-[var(--color-accent-lavender)] mt-1 font-mono">{form.depth}/10</div>
                    </div>
                    {/* Focus slider */}
                    <div>
                      <div className="flex justify-between text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">
                        <span>🎯 Pratique</span>
                        <span>Introspectif 🧘</span>
                      </div>
                      <input
                        type="range" min={1} max={10} value={form.focus}
                        onChange={(e) => setForm({ ...form, focus: parseInt(e.target.value) })}
                      />
                      <div className="text-center text-xs text-[var(--color-accent-lavender)] mt-1 font-mono">{form.focus}/10</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-10">
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-2.5 rounded-xl text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition"
                >
                  ← Retour
                </button>
                {step < 5 ? (
                  <button
                    onClick={() => canAdvance() && setStep(step + 1)}
                    disabled={!canAdvance()}
                    className="px-6 py-2.5 rounded-xl bg-[var(--color-accent-lavender)] text-[var(--color-space-deep)] font-medium text-sm hover:bg-opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Suivant →
                  </button>
                ) : (
                  <button
                    onClick={doCalculation}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--color-accent-lavender)] to-[var(--color-accent-gold)] text-[var(--color-space-deep)] font-bold text-sm hover:scale-105 transition-transform glow-lavender"
                  >
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
            <div className="text-center animate-fade-in-up">
              <div className="text-6xl mb-8 animate-pulse-glow">✦</div>
              <LoadingMessages />
            </div>
          </section>
        )}

        {/* ═══ RESULTS ═══ */}
        {step === 7 && chart && (
          <section className="min-h-screen py-12 px-4">
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="text-4xl mb-3 opacity-60">✦</div>
                <h1 className="font-cinzel text-3xl md:text-4xl text-[var(--color-accent-lavender)] mb-2">
                  Le Ciel de {form.prenom}
                </h1>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  {form.jour}/{form.mois}/{form.annee}
                  {form.hasTime && ` à ${String(form.heure).padStart(2, "0")}h${String(form.minute).padStart(2, "0")}`}
                  {" — "}{form.lieu}
                </p>
              </div>

              {/* Zodiac Wheel */}
              <div className="glass p-6 glow-lavender">
                <ZodiacWheel planets={chart.planets} ascendant={chart.ascendant} />
              </div>

              {/* Big Three */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(() => {
                  const sun = chart.planets[0];
                  const moon = chart.planets[1];
                  const asc = chart.ascendant;
                  const bigThree = [
                    { label: "Soleil", icon: "☉", data: sun, color: "#ffd700" },
                    { label: "Lune", icon: "☽", data: moon, color: "#c9a0ff" },
                    ...(asc ? [{ label: "Ascendant", icon: "↑", data: asc, color: "#60a5fa" }] : []),
                  ];
                  return bigThree.map((item) => (
                    <div key={item.label} className="glass p-5 text-center">
                      <div className="text-3xl mb-2" style={{ color: item.color }}>{item.icon}</div>
                      <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1">{item.label}</div>
                      <div className="font-cinzel text-lg text-[var(--color-text-primary)]">
                        {SIGN_SYMBOLS[item.data.signIndex]} {item.data.sign}
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)] font-mono mt-1">
                        {item.data.degree}°
                        {item.data.house ? ` · Maison ${item.data.house}` : ""}
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Portrait cosmique */}
              <div className="glass p-8">
                <h2 className="font-cinzel text-xl text-[var(--color-accent-lavender)] mb-4">
                  ✦ Ton Portrait Cosmique
                </h2>
                <div className="text-[var(--color-text-primary)] leading-relaxed space-y-4">
                  <p>
                    {form.prenom}, ton Soleil en {chart.planets[0].sign} {getCosmicPortraitSun(chart.planets[0].sign)}
                  </p>
                  <p>
                    Ta Lune en {chart.planets[1].sign} {getCosmicPortraitMoon(chart.planets[1].sign)}
                  </p>
                  {chart.ascendant && (
                    <p>
                      Avec un Ascendant {chart.ascendant.sign}, {getCosmicPortraitAsc(chart.ascendant.sign)}
                    </p>
                  )}
                </div>
              </div>

              {/* Planets detail */}
              <div className="glass p-8">
                <h2 className="font-cinzel text-xl text-[var(--color-accent-lavender)] mb-6">
                  ✦ Tes Planètes
                </h2>
                <div className="space-y-3">
                  {chart.planets.map((planet) => (
                    <div key={planet.name} className="border border-[var(--color-glass-border)] rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedPlanet(expandedPlanet === planet.name ? null : planet.name)}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl text-[var(--color-accent-gold)]">{planet.symbol}</span>
                          <span className="font-medium">{planet.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-[var(--color-text-secondary)]">
                            {SIGN_SYMBOLS[planet.signIndex]} {planet.sign}
                          </span>
                          {planet.house && (
                            <span className="text-[var(--color-text-secondary)] font-mono text-xs">
                              M{planet.house}
                            </span>
                          )}
                          <span className="text-[var(--color-text-secondary)] text-xs">
                            {expandedPlanet === planet.name ? "▲" : "▼"}
                          </span>
                        </div>
                      </button>
                      {expandedPlanet === planet.name && (
                        <div className="px-4 pb-4 text-sm text-[var(--color-text-primary)] leading-relaxed border-t border-[var(--color-glass-border)] pt-4">
                          {getInterp(planet.name, planet.sign, planet.house) || (
                            <span className="text-[var(--color-text-secondary)] italic">
                              {planet.name} en {planet.sign}
                              {planet.house ? ` (Maison ${planet.house})` : ""} —
                              une énergie qui colore ta manière d&apos;exprimer les qualités de {planet.sign} dans ta vie.
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Aspects */}
              {chart.aspects.length > 0 && (
                <div className="glass p-8">
                  <h2 className="font-cinzel text-xl text-[var(--color-accent-lavender)] mb-6">
                    ✦ Tes Aspects
                  </h2>
                  <div className="space-y-3">
                    {chart.aspects.slice(0, form.depth >= 7 ? undefined : 10).map((aspect, i) => {
                      const aspectColors: Record<string, string> = {
                        Conjonction: "#c9a0ff",
                        Trigone: "#34d399",
                        Sextile: "#60a5fa",
                        Carre: "#ef4444",
                        Opposition: "#fbbf24",
                      };
                      const aspectSymbols: Record<string, string> = {
                        Conjonction: "☌",
                        Trigone: "△",
                        Sextile: "⚹",
                        Carre: "□",
                        Opposition: "☍",
                      };
                      return (
                        <div key={i} className="border border-[var(--color-glass-border)] rounded-xl overflow-hidden">
                          <button
                            onClick={() => setExpandedPlanet(expandedPlanet === `aspect-${i}` ? null : `aspect-${i}`)}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
                          >
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-[var(--color-accent-gold)]">{aspect.symbol1}</span>
                              <span>{aspect.planet1}</span>
                              <span style={{ color: aspectColors[aspect.type] || "#c9a0ff" }} className="text-lg mx-1">
                                {aspectSymbols[aspect.type] || "·"}
                              </span>
                              <span>{aspect.planet2}</span>
                              <span className="text-[var(--color-accent-gold)]">{aspect.symbol2}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${aspectColors[aspect.type]}20`, color: aspectColors[aspect.type] }}>
                                {aspect.type}
                              </span>
                              <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">
                                orbe {aspect.orb}°
                              </span>
                            </div>
                          </button>
                          {expandedPlanet === `aspect-${i}` && (
                            <div className="px-4 pb-4 text-sm text-[var(--color-text-primary)] leading-relaxed border-t border-[var(--color-glass-border)] pt-4">
                              {getAspectInterp(aspect.type, aspect.planet1, aspect.planet2) || (
                                <span className="text-[var(--color-text-secondary)] italic">
                                  {getDefaultAspectText(aspect.type, aspect.planet1, aspect.planet2)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Closing */}
              <div className="glass p-8 text-center">
                <h2 className="font-cinzel text-xl text-[var(--color-accent-lavender)] mb-4">
                  ✦ Un Mot de Clôture
                </h2>
                <p className="text-[var(--color-text-primary)] leading-relaxed max-w-xl mx-auto mb-4">
                  {form.prenom}, cette carte est un miroir, pas une sentence. Elle reflète des tendances, des potentiels et des invitations — pas des certitudes. Tu restes l&apos;auteur·e de ton histoire, et le ciel n&apos;est qu&apos;un éclairage parmi d&apos;autres pour mieux te comprendre.
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] italic">
                  L&apos;astrologie est un outil de réflexion personnelle, pas un substitut à un avis médical, psychologique ou financier.
                </p>
              </div>

              {/* Restart */}
              <div className="text-center pb-12">
                <button
                  onClick={() => { setStep(0); setChart(null); setExpandedPlanet(null); }}
                  className="px-6 py-3 rounded-xl border border-[var(--color-glass-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent-lavender)] transition text-sm"
                >
                  ← Calculer une autre carte
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
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
    const timer = setInterval(() => {
      setIdx((i) => (i < messages.length - 1 ? i + 1 : i));
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-3">
      {messages.map((msg, i) => (
        <p
          key={i}
          className={`text-sm transition-all duration-500 ${i <= idx ? "text-[var(--color-text-primary)] opacity-100" : "text-[var(--color-text-secondary)] opacity-20"}`}
        >
          {i < idx ? "✓" : i === idx ? "◌" : "·"} {msg}
        </p>
      ))}
    </div>
  );
}

// ─── Cosmic Portrait Helpers ──────────────────────────────────────
function getCosmicPortraitSun(sign: string): string {
  const texts: Record<string, string> = {
    Belier: "illumine une nature audacieuse et pionnière. Tu portes en toi une énergie d'initiation — un besoin viscéral de tracer ta propre voie, d'oser avant de calculer. Cette flamme intérieure est ton moteur le plus puissant.",
    Taureau: "révèle une nature profondément ancrée et sensorielle. Tu construis avec patience, tu apprécies la beauté tangible du monde, et ta persévérance est une force tranquille que beaucoup t'envient.",
    Gemeaux: "dévoile un esprit vif, curieux et multiple. Tu as soif d'apprendre, de connecter les idées, de communiquer. Ta richesse réside dans ta capacité à voir les situations sous plusieurs angles à la fois.",
    Cancer: "baigne ta personnalité dans une sensibilité intuitive et protectrice. Tu ressens profondément les émotions — les tiennes et celles des autres — et ta capacité à créer un espace sûr est un don précieux.",
    Lion: "rayonne d'une chaleur naturelle et d'une générosité authentique. Tu as besoin de créer, de briller, d'inspirer — non par vanité, mais parce que l'expression de soi est ta manière d'exister pleinement.",
    Vierge: "affine ton regard sur le monde avec une précision et une intelligence analytique remarquables. Tu cherches à être utile, à améliorer, à comprendre les mécanismes subtils de la vie quotidienne.",
    Balance: "cherche l'harmonie et la justesse dans chaque interaction. Tu possèdes un sens esthétique développé et une capacité rare à voir les deux côtés d'une situation avec une élégance naturelle.",
    Scorpion: "plonge ta conscience dans les profondeurs de l'expérience humaine. Tu ne te contentes jamais de la surface — ta lucidité et ton intensité émotionnelle sont des outils de transformation puissants.",
    Sagittaire: "ouvre grands les horizons de ta conscience. Tu es animé·e par une quête de sens, d'aventure et de vérité qui te pousse toujours plus loin — géographiquement, intellectuellement, spirituellement.",
    Capricorne: "ancre ta volonté dans la durée et la structure. Tu as une maturité naturelle, une capacité à construire des fondations solides et une ambition qui se mesure sur le long terme.",
    Verseau: "souffle un vent d'originalité et de vision. Tu penses au-delà des conventions, tu questionnes les normes, et ta liberté intellectuelle est une source d'innovation pour toi et pour les autres.",
    Poissons: "dissout les frontières entre toi et le monde avec une empathie et une imagination sans limites. Tu perçois des nuances invisibles aux autres, et ta sensibilité est une forme de sagesse.",
  };
  return texts[sign] || "colore ta personnalité d'une énergie unique et riche.";
}

function getCosmicPortraitMoon(sign: string): string {
  const texts: Record<string, string> = {
    Belier: "révèle un monde émotionnel spontané et direct. Tes réactions sont vives, ton besoin d'authenticité immédiat. Tu te ressources dans l'action et le mouvement.",
    Taureau: "parle d'un besoin profond de stabilité et de douceur. Tu te ressources dans le confort, les plaisirs simples, et la sécurité émotionnelle que procure ce qui est familier.",
    Gemeaux: "dépeint une vie intérieure animée et changeante. Tu as besoin de stimulation mentale pour te sentir en équilibre, et le dialogue est ta manière naturelle de traiter tes émotions.",
    Cancer: "amplifie ta sensibilité naturelle et ton intuition. Tu ressens les ambiances comme un sismographe, et ton besoin de nourrir et d'être nourri·e est au coeur de ton équilibre.",
    Lion: "met en lumière un besoin d'être vu·e et apprécié·e dans ton authenticité. Tu as un coeur généreux qui s'épanouit dans la chaleur des liens et la reconnaissance sincère.",
    Vierge: "traduit un besoin d'ordre émotionnel et de clarté intérieure. Tu analyses tes sentiments avec finesse, et tu te ressources dans les routines bien huilées et le sentiment d'utilité.",
    Balance: "aspire à l'harmonie relationnelle avant tout. Tu as besoin de beauté autour de toi, de relations équilibrées, et ton bien-être est intimement lié à la qualité de tes liens.",
    Scorpion: "révèle une vie émotionnelle d'une profondeur remarquable. La confiance se construit lentement chez toi, non par méfiance, mais parce que tu cherches l'authenticité absolue.",
    Sagittaire: "colore ta vie émotionnelle d'optimisme et de soif de liberté. Tu as besoin d'espace intérieur, de sens et d'aventure pour maintenir ton équilibre émotionnel.",
    Capricorne: "confère à tes émotions une maturité et une réserve qui cachent une grande profondeur. Tu te ressources dans la structure, l'accomplissement et la solitude choisie.",
    Verseau: "donne à ta vie émotionnelle une qualité détachée et originale. Tu as besoin de liberté intérieure, d'espace pour tes idées, et tu traites tes émotions avec une lucidité inhabituelle.",
    Poissons: "ouvre les portes d'une sensibilité sans frontières. Tu absorbes les émotions ambiantes comme une éponge, et ton monde intérieur est riche d'images, de rêves et d'intuitions.",
  };
  return texts[sign] || "enrichit ton monde intérieur d'une dimension émotionnelle unique.";
}

function getCosmicPortraitAsc(sign: string): string {
  const texts: Record<string, string> = {
    Belier: "tu arrives dans le monde avec une énergie directe et magnétique. Les autres te perçoivent comme quelqu'un de courageux et d'initiative.",
    Taureau: "tu te présentes au monde avec une présence calme et rassurante. On te perçoit comme quelqu'un de fiable, de sensuel et d'ancré.",
    Gemeaux: "tu projettes une image vive, communicative et adaptable. Ta curiosité visible attire naturellement les échanges et les connexions.",
    Cancer: "tu te montres au monde avec une douceur protectrice et une intuition visible. Les gens sentent ta capacité à les accueillir.",
    Lion: "tu entres dans une pièce avec une présence chaude et lumineuse. Ta dignité naturelle et ta générosité sont immédiatement perceptibles.",
    Vierge: "tu te présentes avec une élégance discrète et une intelligence attentive. Les gens remarquent ta précision et ton souci du détail.",
    Balance: "tu projettes une image d'harmonie et de grâce naturelle. Ta diplomatie et ton sens esthétique sont tes premières cartes de visite.",
    Scorpion: "tu arrives avec une intensité magnétique qui ne passe pas inaperçue. Ton regard perçant et ta profondeur intriguent et fascinent.",
    Sagittaire: "tu rayonnes d'un enthousiasme et d'une ouverture d'esprit contagieux. On te perçoit comme aventurier·ère et inspirant·e.",
    Capricorne: "tu te présentes avec une dignité mature et une aura de compétence. On te prend au sérieux naturellement et on respecte ta réserve.",
    Verseau: "tu projettes une originalité et une indépendance qui te distinguent. Les gens sentent en toi quelqu'un qui pense différemment.",
    Poissons: "tu arrives dans le monde avec une douceur éthérée et une empathie visible. Les gens se sentent compris en ta présence.",
  };
  return texts[sign] || "tu te présentes au monde avec une énergie unique qui te distingue.";
}

function getDefaultAspectText(type: string, p1: string, p2: string): string {
  const typeTexts: Record<string, string> = {
    Conjonction: `La fusion entre ${p1} et ${p2} dans ta carte crée une concentration d'énergie puissante. Ces deux forces agissent ensemble, amplifiant mutuellement leur expression.`,
    Trigone: `L'harmonie naturelle entre ${p1} et ${p2} indique un flux d'énergie fluide et créatif. C'est un talent inné qui soutient ton expression personnelle.`,
    Sextile: `La connexion bienveillante entre ${p1} et ${p2} offre des opportunités de croissance. C'est une ressource que tu peux activer consciemment.`,
    Carre: `La tension créative entre ${p1} et ${p2} est une source de dynamisme et de croissance. Ce défi intérieur t'invite à intégrer deux besoins apparemment contradictoires.`,
    Opposition: `La polarité entre ${p1} et ${p2} crée un jeu d'équilibre permanent. L'apprentissage consiste à honorer les deux côtés plutôt qu'à choisir un camp.`,
  };
  return typeTexts[type] || `L'aspect entre ${p1} et ${p2} colore leur interaction d'une nuance particulière dans ta carte.`;
}
