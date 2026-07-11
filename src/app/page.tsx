"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Starfield from "@/components/Starfield";
import TitleSparkles from "@/components/TitleSparkles";
import SiteFooter from "@/components/SiteFooter";
import DailySign from "@/components/DailySign";
import SkyToday from "@/components/SkyToday";
import ExploreSections from "@/components/ExploreSections";
import { calculateNatalChart, NatalChart, PlanetPosition, translateSign, translatePlanet } from "@/lib/astro";
import { PlanetIcon, SignIcon, Sun as SunIcon, Moon as MoonIcon, AscendantIcon } from "@/components/AstroIcons";
import { useLocale } from "@/lib/i18n";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { searchCities, CityResult, UserLocation, CitySearchError } from "@/lib/citySearch";
import { getCosmicPortraitSun, getCosmicPortraitMoon, getCosmicPortraitAsc, getLifeThemes, genderize, getGreeting, getIntroSentence, serializeChartForAI, Genre } from "@/lib/chartHelpers";
import { useAuth } from "@/lib/auth-context";
import { getPlanetInterp, getAspectInterp as getAspectInterpHelper, type InterpModule, type VoiceKey } from "@/lib/getInterp";
import LoadingMessages from "@/components/LoadingMessages";
import Skeleton from "@/components/ui/Skeleton";
import SectionTransition from "@/components/results/SectionTransition";
import PremiumGate from "@/components/PremiumGate";
import PremiumBadge from "@/components/PremiumBadge";
import { stashPendingPdf } from "@/lib/pending-pdf";
import { chartShareMessage, toMailtoUrl } from "@/lib/shareMessages";
import { signMetaLine } from "@/lib/signMeta";

// Lazy-load heavy result components (only needed after chart calculation)
const ZodiacWheel = dynamic(() => import("@/components/ZodiacWheel"), { ssr: false });
const ElementBalance = dynamic(() => import("@/components/results/ElementBalance"), { ssr: false });
const HousesMap = dynamic(() => import("@/components/results/HousesMap"), { ssr: false });
const ChartChat = dynamic(() => import("@/components/results/ChartChat"), { ssr: false });
const AudioPlayer = dynamic(() => import("@/components/AudioPlayer"), { ssr: false });
const SavedCharts = dynamic(() => import("@/components/SavedCharts"), { ssr: false });
const TransitRow = dynamic(() => import("@/components/results/TransitRow"), { ssr: false });
const DateWheelPicker = dynamic(() => import("@/components/ui/date-wheel-picker").then((m) => m.DateWheelPicker), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────
interface FormData {
  prenom: string;
  genre: Genre;
  jour: number;
  mois: number;
  annee: number;
  heure: number;
  minute: number;
  hasTime: boolean;
  lieu: string;
  latitude: number;
  longitude: number;
  voice: VoiceKey;
  // legacy (kept for URL backwards-compat & legacy getInterpretation fallback)
  tone: number;
  depth: number;
  focus: number;
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

// Canonical saved-chart label — shared by auto-save, the PDF save, and the
// manual "Mes cartes" save so all three target the SAME saved_charts row
// (de-duped server-side by label). Keeps one chart = one saved row.
function makeChartLabel(prenom: string, jour: number, mois: number, annee: number, locale: string): string {
  return locale === "fr"
    ? `Carte de ${prenom || "lecture"} — ${jour}/${mois}/${annee}`
    : `${prenom || "Chart"}'s chart — ${mois}/${jour}/${annee}`;
}

const ASPECT_SYMBOLS: Record<string, string> = {
  Conjonction: "☌", Trigone: "△", Sextile: "⚹", Carre: "□", Opposition: "☍",
};

const ASPECT_COLORS: Record<string, string> = {
  Conjonction: "#a89ec8", Trigone: "#9a96aa", Sextile: "#8a87a0", Carre: "#b0a8be", Opposition: "#9590a8",
};

// Plain-language nature of each aspect, surfaced inline so a beginner understands
// "△ = Trigone = Harmonie" without having to expand the row. Colour is the family
// cue (green = flowing, rose = tension, gold = fusion, lavender = adjustment).
const ASPECT_NATURE: Record<string, { fr: string; en: string; color: string }> = {
  Conjonction: { fr: "Fusion", en: "Fusion", color: "var(--color-accent-gold)" },
  Trigone: { fr: "Harmonie", en: "Harmony", color: "#79c2a0" },
  Sextile: { fr: "Harmonie", en: "Harmony", color: "#79c2a0" },
  Carre: { fr: "Tension créatrice", en: "Creative tension", color: "var(--color-accent-rose)" },
  Opposition: { fr: "Tension créatrice", en: "Creative tension", color: "var(--color-accent-rose)" },
  Quinconce: { fr: "Ajustement", en: "Adjustment", color: "var(--color-accent-lavender)" },
};

// ─── Voice options (sensible / mystique / pragmatique) ─────────
const VOICE_OPTIONS: { key: VoiceKey; labelFr: string; labelEn: string; descFr: string; descEn: string }[] = [
  {
    key: "sensible",
    labelFr: "Sensible", labelEn: "Feeling",
    descFr: "Adresse tendre, ressenti, corps. Reconnaît ce qui se vit.",
    descEn: "Tender voice, felt sense, body-aware. Names what you live.",
  },
  {
    key: "mystique",
    labelFr: "Mystique", labelEn: "Mystic",
    descFr: "Symboles et archétypes. Mythes, rêves, profondeurs jungiennes.",
    descEn: "Symbols and archetypes. Myths, dreams, Jungian depths.",
  },
  {
    key: "pragmatique",
    labelFr: "Pragmatique", labelEn: "Grounded",
    descFr: "Concret, lucide, terre à terre. Zéro jargon ésotérique.",
    descEn: "Grounded, lucid, practical. Zero esoteric jargon.",
  },
];

// ─── Page ────────────────────────────────────────────────────────
export default function Home() {
  const { t, locale } = useLocale();
  const { user, isPremium, getAccessToken } = useAuth();
  const MONTHS = locale === "fr" ? MONTHS_FR : MONTHS_EN;
  const RESULT_TABS = [
    { id: "portrait", label: t("results.portrait"), icon: "✦" },
    { id: "planets", label: t("results.planets"), icon: "⊙" },
    { id: "elements", label: t("results.elements"), icon: "◆" },
    { id: "houses", label: t("results.houses"), icon: "⌂" },
    { id: "aspects", label: t("results.aspects"), icon: "△" },
    { id: "transits", label: t("results.transits"), icon: "◎" },
  ];

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    prenom: "", genre: "femme" as Genre, jour: 15, mois: 6, annee: 1990,
    heure: 12, minute: 0, hasTime: true,
    lieu: "", latitude: 48.8566, longitude: 2.3522,
    voice: "sensible",
    tone: 5, depth: 5, focus: 5,
  });
  const [chart, setChart] = useState<NatalChart | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<CityResult[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityError, setCityError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("portrait");
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [expandedPlanets, setExpandedPlanets] = useState<Set<string>>(new Set());
  const [expandedAspects, setExpandedAspects] = useState<Set<number>>(new Set());
  const [interpretations, setInterpretations] = useState<Record<string, unknown> | null>(null);
  const [stepDirection, setStepDirection] = useState<"next" | "prev">("next");
  const [copied, setCopied] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showWheelAspects, setShowWheelAspects] = useState(true);
  const [todayTransits, setTodayTransits] = useState<NatalChart | null>(null);
  // Transit AI interpretation (premium only — same pattern as portrait/houses/etc.)
  // Without this the transits section showed raw positions but no narrative,
  // which made a premium feature feel half-baked.
  const [transitInterp, setTransitInterp] = useState<{ text: string | null; loading: boolean; error: string | null }>({ text: null, loading: false, error: null });
  // Auto-save UX state: surfaces a toast when a chart is silently saved
  // to the user's account so the user understands their reading is now
  // findable in /mon-compte/lectures without any extra click.
  const [autoSaveToast, setAutoSaveToast] = useState<
    | { kind: "ok"; msg: string }
    | { kind: "limit"; msg: string }
    | null
  >(null);
  const autoSavedLabelRef = useRef<string | null>(null);
  const [showTabsHint, setShowTabsHint] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [activeBigThree, setActiveBigThree] = useState<string | null>(null);
  useScrollReveal([step]);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  // Used by the PDF generator to snap the zodiac wheel SVG into a PNG.
  const zodiacWheelRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const citySearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bigThreeContentRef = useRef<HTMLDivElement | null>(null);

  // ─── IntersectionObserver for auto-highlighting active tab ───
  useEffect(() => {
    if (step !== 7) return;
    const sectionIds = ["portrait", "planets", "elements", "houses", "aspects", "transits"];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = sectionIds.find((sid) => sectionRefs.current[sid] === entry.target);
            if (id) setActiveTab(id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );
    // Small delay to let refs settle
    const timer = setTimeout(() => {
      sectionIds.forEach((id) => {
        const el = sectionRefs.current[id];
        if (el) observer.observe(el);
      });
    }, 500);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [step]);

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
    const loadInterp = locale === "en"
      ? import("@/data/interpretations-en")
      : import("@/data/interpretations");
    loadInterp.then((mod) => {
      setInterpretations(mod as unknown as Record<string, unknown>);
    });
  }, [locale]);

  // Silently request geolocation for city search bias (no UI impact if denied)
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => { /* denied or unavailable — Canada bias will be used */ },
        { timeout: 5000, maximumAge: 600000 }
      );
    }
  }, []);

  const handleCitySearch = useCallback((query: string) => {
    setForm((f) => ({ ...f, lieu: query }));
    if (citySearchTimer.current) clearTimeout(citySearchTimer.current);
    if (query.length < 2) { setCitySuggestions([]); setCityError(null); return; }
    setCityLoading(true);
    setCityError(null);
    citySearchTimer.current = setTimeout(async () => {
      try {
        const results = await searchCities(query, userLocation);
        setCitySuggestions(results);
      } catch (err) {
        setCitySuggestions([]);
        if (err instanceof CitySearchError) {
          if (err.code === "timeout") {
            setCityError(locale === "fr" ? "La recherche a pris trop de temps. Réessaie." : "Search took too long. Please try again.");
          } else if (err.code === "no_results") {
            setCityError(locale === "fr" ? "Aucun résultat trouvé. Essaie un autre nom." : "No results found. Try a different name.");
          } else {
            setCityError(locale === "fr" ? "Recherche impossible. Vérifie ta connexion." : "Search failed. Check your connection.");
          }
        } else {
          setCityError(locale === "fr" ? "Recherche impossible. Vérifie ta connexion." : "Search failed. Check your connection.");
        }
      } finally {
        setCityLoading(false);
      }
    }, 350);
  }, [userLocation, locale]);

  const selectCity = useCallback((city: CityResult) => {
    setForm((f) => ({ ...f, lieu: city.display, latitude: city.lat, longitude: city.lon }));
    setCitySuggestions([]);
  }, []);

  const canAdvance = (): boolean => {
    switch (step) {
      case 1: return form.prenom.trim().length >= 1;
      case 2: return form.annee >= 1900 && form.annee <= 2026 && form.mois >= 1 && form.mois <= 12 && form.jour >= 1 && form.jour <= 31;
      case 3: return form.lieu.length >= 2;
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
      // Show tabs guidance hint once per session for first-time results view
      if (!sessionStorage.getItem("tabs_guidance_seen")) {
        setShowTabsHint(true);
      }
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
            { headers: { "User-Agent": "Natalune/1.0" } }
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

  // ─── Fetch transit AI interpretation (premium only) ──────────
  // Server caches in Supabase by chart + voice + locale + transit day,
  // so the same chart re-loaded on the same day returns instantly.
  useEffect(() => {
    if (!isPremium || !chart || !todayTransits || step < 7) return;
    let cancelled = false;
    setTransitInterp({ text: null, loading: true, error: null });

    (async () => {
      try {
        const token = await getAccessToken();
        const transitsLine = todayTransits.planets.slice(0, 7).map((tp) => {
          const natal = chart.planets.find((p) => p.name === tp.name);
          if (!natal) return `${tp.name}: ${translateSign(tp.sign, locale)} ${tp.degree}°`;
          return `${tp.name}: aujourd'hui ${translateSign(tp.sign, locale)} ${tp.degree}° / natal ${translateSign(natal.sign, locale)} ${natal.degree}°`;
        }).join("; ");
        const natalSummary = chart.planets.slice(0, 7).map((p) => `${p.name} ${translateSign(p.sign, locale)}`).join(", ");
        const chartContext = `Carte natale : ${natalSummary}${chart.ascendant ? `, Ascendant ${translateSign(chart.ascendant.sign, locale)}` : ""}.\nTransits du jour (${new Date().toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}) : ${transitsLine}.`;

        const res = await fetch("/api/interpretation", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ chartContext, voice: form.voice, locale, genre: form.genre, section: "transits" }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data.text) throw new Error(data.error || `HTTP ${res.status}`);
        setTransitInterp({ text: data.text, loading: false, error: null });
      } catch (err) {
        if (!cancelled) setTransitInterp({ text: null, loading: false, error: (err as Error).message });
      }
    })();

    return () => { cancelled = true; };
  }, [isPremium, chart, todayTransits, step, form.voice, form.genre, locale, getAccessToken]);

  // ─── Auto-save chart for logged-in users ─────────────────────
  // The flow used to be "calculate → click Obtenir mon PDF to save". That
  // confused users who assumed calculation alone was enough — their charts
  // never showed up in /mon-compte/lectures. Now: as soon as a logged-in
  // user has a computed chart we POST /api/charts (data only, no PDF).
  // Server de-dupes by label so reloads / recalculations don't pile up.
  // The PDF route remains the manual path and adds the actual PDF file.
  useEffect(() => {
    if (!user?.id || !chart || step < 7) return;
    const label = makeChartLabel(form.prenom, form.jour, form.mois, form.annee, locale);
    // Skip if we already saved this exact label in this session — avoids
    // hitting the API every time React re-runs the effect on tab change.
    if (autoSavedLabelRef.current === label) return;
    autoSavedLabelRef.current = label;

    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const res = await fetch("/api/charts", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ label, formData: form, chartData: chart }),
        });
        if (res.status === 201) {
          setAutoSaveToast({
            kind: "ok",
            msg:
              locale === "fr"
                ? "Carte sauvegardée dans Mes lectures."
                : "Chart saved to My readings.",
          });
          // Auto-dismiss after 5s — non-blocking confirmation.
          setTimeout(() => setAutoSaveToast(null), 5000);
        } else if (res.status === 403) {
          const data = await res.json().catch(() => ({}));
          if (data.error === "LIMIT_REACHED") {
            setAutoSaveToast({
              kind: "limit",
              msg: data.message ||
                (locale === "fr"
                  ? "Limite de cartes atteinte. Passe Premium pour plus."
                  : "Saved-chart limit reached. Go Premium for more."),
            });
          }
        }
        // 200 deduped → silent, user already has this chart.
      } catch {
        /* network error — silent, the user can still manually click PDF */
      }
    })();
  }, [user?.id, chart, step, locale, form, getAccessToken]);

  // ─── PDF generation + save flow ──────────────────────────────
  // - Always generates client-side PDF
  // - Anonymous: stores in sessionStorage + redirects to /inscription?intent=pdf
  // - Logged in: uploads to /api/pdf/save (Supabase Storage) + emails + redirects to /mon-compte/lectures
  const [pdfStatus, setPdfStatus] = useState<
    "idle" | "generating" | "uploading" | "done" | "error" | "limit"
  >("idle");
  const [pdfMessage, setPdfMessage] = useState<string>("");

  /**
   * Builds the PDF data object from the chart, then hands it to the pure,
   * fully-native generator in `@/lib/pdf/chartPdf.mjs` (Fraunces embedded,
   * native zodiac wheel — no html2canvas snap, deterministic & theme-proof).
   * The generator is dynamically imported so the embedded font only loads
   * when a PDF is actually requested.
   */
  const generatePdfBlob = useCallback(async (): Promise<{ blob: Blob; dataUrl: string; filename: string } | null> => {
    if (!chart) return null;

    // Element / modality tallies from the raw FR sign keys.
    const ELEMENT_BY_SIGN: Record<string, "Feu" | "Terre" | "Air" | "Eau"> = {
      Belier: "Feu", Lion: "Feu", Sagittaire: "Feu",
      Taureau: "Terre", Vierge: "Terre", Capricorne: "Terre",
      Gemeaux: "Air", Balance: "Air", Verseau: "Air",
      Cancer: "Eau", Scorpion: "Eau", Poissons: "Eau",
    };
    const MODALITY_BY_SIGN: Record<string, "Cardinal" | "Fixe" | "Mutable"> = {
      Belier: "Cardinal", Cancer: "Cardinal", Balance: "Cardinal", Capricorne: "Cardinal",
      Taureau: "Fixe", Lion: "Fixe", Scorpion: "Fixe", Verseau: "Fixe",
      Gemeaux: "Mutable", Vierge: "Mutable", Sagittaire: "Mutable", Poissons: "Mutable",
    };
    const elements = { Feu: 0, Terre: 0, Air: 0, Eau: 0 };
    const modalities = { Cardinal: 0, Fixe: 0, Mutable: 0 };
    for (const p of chart.planets) {
      const e = ELEMENT_BY_SIGN[p.sign]; if (e) elements[e]++;
      const m = MODALITY_BY_SIGN[p.sign]; if (m) modalities[m]++;
    }

    const houseNames: Record<number, string> = {
      1: locale === "fr" ? "Identité, premier abord" : "Identity, first impression",
      2: locale === "fr" ? "Valeurs, ressources" : "Values, resources",
      3: locale === "fr" ? "Communication, fratrie" : "Communication, siblings",
      4: locale === "fr" ? "Foyer, racines" : "Home, roots",
      5: locale === "fr" ? "Création, plaisir" : "Creation, pleasure",
      6: locale === "fr" ? "Quotidien, santé" : "Daily life, health",
      7: locale === "fr" ? "Liens, partenariats" : "Bonds, partnerships",
      8: locale === "fr" ? "Profondeurs, transformations" : "Depths, transformations",
      9: locale === "fr" ? "Horizons, sens" : "Horizons, meaning",
      10: locale === "fr" ? "Vocation, image publique" : "Vocation, public image",
      11: locale === "fr" ? "Réseaux, futur" : "Networks, future",
      12: locale === "fr" ? "Retrait, inconscient" : "Retreat, unconscious",
    };
    const byHouse = new Map<number, string[]>();
    for (const p of chart.planets) {
      if (typeof p.house === "number") {
        if (!byHouse.has(p.house)) byHouse.set(p.house, []);
        byHouse.get(p.house)!.push(`${translatePlanet(p.name, locale)} (${translateSign(p.sign, locale)})`);
      }
    }
    const houses: { n: number; name: string; occupants: string[] }[] = [];
    for (let h = 1; h <= 12; h++) {
      const occ = byHouse.get(h);
      if (occ && occ.length) houses.push({ n: h, name: houseNames[h], occupants: occ });
    }

    const aspectLabel = (t: string) =>
      locale === "fr"
        ? (t === "Carre" ? "Carré" : t)
        : (t === "Carre" ? "Square" : t === "Conjonction" ? "Conjunction" : t === "Trigone" ? "Trine" : t);

    const sun = chart.planets[0], moon = chart.planets[1];
    const portrait: { name: string; sign: string; degree: number; house?: number; text: string }[] = [
      { name: "Soleil", sign: translateSign(sun.sign, locale), degree: sun.degree, house: sun.house, text: locale === "fr" ? genderize(getCosmicPortraitSun(sun.sign, locale), form.genre) : getCosmicPortraitSun(sun.sign, locale) },
      { name: "Lune", sign: translateSign(moon.sign, locale), degree: moon.degree, house: moon.house, text: locale === "fr" ? genderize(getCosmicPortraitMoon(moon.sign, locale), form.genre) : getCosmicPortraitMoon(moon.sign, locale) },
    ];
    if (chart.ascendant) {
      portrait.push({ name: "Ascendant", sign: translateSign(chart.ascendant.sign, locale), degree: chart.ascendant.degree, text: locale === "fr" ? genderize(getCosmicPortraitAsc(chart.ascendant.sign, locale), form.genre) : getCosmicPortraitAsc(chart.ascendant.sign, locale) });
    }

    const data = {
      locale,
      meta: {
        prenom: form.prenom || "",
        dateLabel: `${form.jour} ${MONTHS[form.mois - 1]} ${form.annee}`,
        timeLabel: form.hasTime ? `${String(form.heure).padStart(2, "0")}h${String(form.minute).padStart(2, "0")}` : null,
        place: form.lieu || "",
      },
      bigThree: {
        sunSign: translateSign(sun.sign, locale),
        moonSign: translateSign(moon.sign, locale),
        ascSign: chart.ascendant ? translateSign(chart.ascendant.sign, locale) : null,
      },
      portrait,
      planets: chart.planets.map((p) => ({ name: translatePlanet(p.name, locale), sign: translateSign(p.sign, locale), degree: p.degree, house: p.house })),
      elements,
      modalities,
      houses,
      aspects: (chart.aspects || []).slice(0, 14).map((a) => ({ p1: translatePlanet(a.planet1, locale), p2: translatePlanet(a.planet2, locale), type: a.type, orb: a.orb, label: aspectLabel(a.type) })),
      wheel: {
        ascendantLongitude: chart.ascendant ? chart.ascendant.longitude : null,
        planets: chart.planets.map((p) => ({ name: p.name, longitude: p.longitude })),
      },
      closing: locale === "fr"
        ? [
            "Cette carte est une photographie du ciel au moment précis de ta naissance — un instant unique dans l'histoire du cosmos. Elle ne prédit rien. Elle ne détermine rien. Elle éclaire.",
            "Les planètes dessinent des potentiels, des invitations, des tensions créatrices. C'est toi qui choisis comment les vivre, les transformer, les transcender.",
          ]
        : [
            "This chart is a photograph of the sky at the precise moment of your birth — a unique instant in the history of the cosmos. It predicts nothing. It determines nothing. It illuminates.",
            "The planets sketch potentials, invitations, creative tensions. You are the one who chooses how to live them, transform them, transcend them.",
          ],
    };

    const mod = await import("@/lib/pdf/chartPdf.mjs") as unknown as {
      generateChartPdf: (d: unknown) => { blob: Blob; dataUrl: string; filename: string };
    };
    const { blob, dataUrl, filename } = mod.generateChartPdf(data);
    return { blob, dataUrl, filename };
  }, [chart, form, locale, MONTHS]);

  const handleGetPdf = useCallback(async () => {
    try {
      setPdfStatus("generating");
      setPdfMessage(locale === "fr" ? "Génération du PDF…" : "Generating PDF…");
      const result = await generatePdfBlob();
      if (!result) {
        setPdfStatus("error");
        setPdfMessage(locale === "fr" ? "Erreur de génération." : "Generation error.");
        return;
      }
      const label = makeChartLabel(form.prenom, form.jour, form.mois, form.annee, locale);

      if (!user) {
        // ── Anonymous: stash Blob in IndexedDB, trigger immediate download, redirect to signup ──
        // (IndexedDB, not sessionStorage — PDF blobs routinely exceed 5 MB quota)
        try {
          await stashPendingPdf({
            blob: result.blob,
            label,
            formData: form as unknown as Record<string, unknown>,
            chartData: chart as unknown as Record<string, unknown> | null,
          });
        } catch {
          /* IndexedDB unavailable (private mode on some browsers) — degrade gracefully */
        }
        // Also trigger a local download so user gets it even if signup abandoned
        const link = document.createElement("a");
        link.href = result.dataUrl;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        // Redirect to signup
        window.location.href = "/inscription?intent=pdf";
        return;
      }

      // ── Logged in: upload + email ──
      setPdfStatus("uploading");
      setPdfMessage(locale === "fr" ? "Envoi à ton compte…" : "Saving to your account…");
      const token = await getAccessToken();
      if (!token) {
        setPdfStatus("error");
        setPdfMessage(locale === "fr" ? "Session expirée. Reconnecte-toi." : "Session expired. Sign in again.");
        return;
      }
      const formBody = new FormData();
      formBody.append("file", result.blob, result.filename);
      formBody.append("label", label);
      formBody.append("formData", JSON.stringify(form));
      formBody.append("chartData", JSON.stringify(chart));
      formBody.append("sendEmail", "true");

      const res = await fetch("/api/pdf/save", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formBody,
      });

      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        if (data.error === "FREE_LIMIT_REACHED") {
          setPdfStatus("limit");
          setPdfMessage(
            locale === "fr"
              ? `Tu as atteint la limite gratuite (${data.limit} lectures). Passe Premium pour un historique illimité.`
              : `Free limit reached (${data.limit} readings). Go Premium for unlimited history.`
          );
          // Still trigger local download so user isn't blocked
          const link = document.createElement("a");
          link.href = result.dataUrl;
          link.download = result.filename;
          document.body.appendChild(link);
          link.click();
          link.remove();
          return;
        }
      }

      if (!res.ok) {
        setPdfStatus("error");
        setPdfMessage(locale === "fr" ? "Erreur de sauvegarde." : "Save error.");
        return;
      }

      setPdfStatus("done");
      setPdfMessage(locale === "fr" ? "Envoyé par email ✓" : "Sent by email ✓");
      // Redirect to history after short delay for feedback
      setTimeout(() => {
        window.location.href = "/mon-compte/lectures";
      }, 900);
    } catch (err) {
      console.error("[handleGetPdf]", err);
      setPdfStatus("error");
      setPdfMessage(locale === "fr" ? "Erreur inattendue." : "Unexpected error.");
    }
  }, [generatePdfBlob, form, chart, user, getAccessToken, locale]);

  // Planets + Aspects are free & complete per recalibrated gating (2026-04-20).
  // Houses, Transits, Synastrie, SR remain premium.
  const getInterp = (planet: string, sign: string, house?: number): string => {
    const mod = interpretations as unknown as InterpModule | null;
    if (mod && !mod.variants?.[form.voice]?.planetInSign?.[planet]?.[sign] && mod.getInterpretation) {
      const legacy = mod.getInterpretation(planet, sign, house, { tone: form.tone, depth: form.depth, focus: form.focus });
      return genderize(legacy, form.genre);
    }
    return getPlanetInterp(mod, planet, sign, house, {
      voice: form.voice, genre: form.genre, isPremium: true,
    });
  };

  const getAspectInterp = (type: string, p1: string, p2: string): string => {
    const mod = interpretations as unknown as InterpModule | null;
    return getAspectInterpHelper(mod, type, p1, p2, {
      voice: form.voice, genre: form.genre, isPremium: true,
    });
  };

  const scrollToTab = (tabId: string) => {
    setActiveTab(tabId);
    const el = sectionRefs.current[tabId];
    if (el) {
      const navHeight = 56; // sticky nav ~52px + margin
      const y = el.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // ─── Auto-load from URL params ───
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const defaultName = locale === "fr" ? "Voyageur·se" : "Explorer";

    let loaded: FormData | null = null;

    // New format: ?c=base64encoded
    if (p.has("c")) {
      const decoded = decodeChartParams(decodeURIComponent(p.get("c") || ""));
      if (decoded && decoded.j && decoded.m && decoded.a && decoded.la && decoded.lo) {
        loaded = {
          prenom: (decoded.n as string) || defaultName,
          genre: (decoded.g as Genre) || "femme",
          jour: decoded.j as number, mois: decoded.m as number, annee: decoded.a as number,
          heure: (decoded.h as number) ?? 12, minute: (decoded.mn as number) ?? 0,
          hasTime: decoded.ht !== 0,
          lieu: (decoded.l as string) || "",
          latitude: decoded.la as number, longitude: decoded.lo as number,
          voice: (decoded.v as VoiceKey) || "sensible",
          tone: 5, depth: 5, focus: 5,
        };
      }
    }
    // Legacy format: ?j=&m=&a=&lat=&lon=
    else if (p.has("j") && p.has("m") && p.has("a") && p.has("lat") && p.has("lon")) {
      loaded = {
        prenom: decodeURIComponent(p.get("n") || defaultName),
        genre: (p.get("g") as Genre) || "femme",
        jour: parseInt(p.get("j") || "15"), mois: parseInt(p.get("m") || "6"), annee: parseInt(p.get("a") || "1990"),
        heure: parseInt(p.get("h") || "12"), minute: parseInt(p.get("min") || "0"),
        hasTime: p.get("ht") !== "0",
        lieu: decodeURIComponent(p.get("l") || ""),
        latitude: parseFloat(p.get("lat") || "48.8566"), longitude: parseFloat(p.get("lon") || "2.3522"),
        voice: (p.get("v") as VoiceKey) || "sensible",
        tone: 5, depth: 5, focus: 5,
      };
    }

    if (loaded) {
      setForm(loaded);
      const c = calculateNatalChart(
        loaded.annee, loaded.mois, loaded.jour,
        loaded.hasTime ? loaded.heure : 12, loaded.hasTime ? loaded.minute : 0,
        loaded.latitude, loaded.longitude, loaded.hasTime
      );
      setChart(c);
      setStep(7);
      // If the URL ends with #pdf (set by /mon-compte/lectures "Generate PDF"
      // button), scroll the user straight to the PDF button after results
      // mount. Small delay so the section renders before we measure.
      if (typeof window !== "undefined" && window.location.hash === "#pdf") {
        setTimeout(() => {
          document.getElementById("pdf")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 800);
      }
    }
  }, []);

  // ─── Encode/decode chart params as opaque base64 ───
  const encodeChartParams = (payload: Record<string, unknown>): string => {
    try { return btoa(JSON.stringify(payload)); } catch { return ""; }
  };
  const decodeChartParams = (encoded: string): Record<string, unknown> | null => {
    try { return JSON.parse(atob(encoded)); } catch { return null; }
  };

  // ─── Generate shareable URL ───
  // Links point to /carte, whose server-rendered metadata gives messengers and
  // social networks a per-chart preview (Big Three og:image) before humans are
  // forwarded back to the full experience on /?c=.
  // Full link (with name) — for personal use
  const getShareUrl = (): string => {
    const base = typeof window !== "undefined" ? window.location.origin + "/carte" : "/carte";
    const payload = {
      n: form.prenom, g: form.genre, j: form.jour, m: form.mois, a: form.annee,
      h: form.heure, mn: form.minute, ht: form.hasTime ? 1 : 0,
      l: form.lieu, la: form.latitude, lo: form.longitude, v: form.voice,
    };
    return `${base}?c=${encodeURIComponent(encodeChartParams(payload))}`;
  };

  // Anonymous link — no name, no city name
  const getAnonymousShareUrl = (): string => {
    const base = typeof window !== "undefined" ? window.location.origin + "/carte" : "/carte";
    const payload = {
      g: form.genre, j: form.jour, m: form.mois, a: form.annee,
      h: form.heure, mn: form.minute, ht: form.hasTime ? 1 : 0,
      la: form.latitude, lo: form.longitude, v: form.voice,
    };
    return `${base}?c=${encodeURIComponent(encodeChartParams(payload))}`;
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
      ...chart.planets.slice(2).map((p) => `  ${p.name.padEnd(9)} : ${p.sign} ${p.degree}°${p.retrograde ? " ℞" : ""}${p.house ? ` (M${p.house})` : ""}`),
      ``,
      `ASPECTS MAJEURS`,
      ...chart.aspects.slice(0, 10).map((a) => `  ${a.planet1} ${ASPECT_SYMBOLS[a.type] || "·"} ${a.planet2} (${a.type}, ${a.orb}°)`),
      ``,
      `─────────────────────────────────────`,
      `Généré sur Natalune`,
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
          <>
            <section className="relative overflow-hidden min-h-[68vh] flex flex-col items-center justify-center px-4 text-center pt-10">
              {/* Soft radial halo behind the title — adds cosmic depth. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] max-w-[90vw] rounded-full blur-3xl opacity-50"
                style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--color-accent-lavender) 55%, transparent), transparent 70%)" }}
              />
              <div className="relative animate-fade-in-up">
                {/* Pulsing star — gold-tinted glow for warmth. */}
                <div
                  className="text-5xl md:text-6xl mb-6 text-[var(--color-accent-gold)] animate-pulse-glow"
                  style={{ filter: "drop-shadow(0 0 18px color-mix(in srgb, var(--color-accent-gold) 55%, transparent))" }}
                >
                  &#10022;
                </div>
                <h1 className="font-cinzel text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-accent-lavender)] bg-clip-text text-transparent leading-tight">
                  {t("hero.title")}
                </h1>
                <TitleSparkles
                  id="hero-sparkles"
                  className="h-24 max-w-xl mx-auto mt-1 mb-2 -z-0"
                />
                <p className="text-lg sm:text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-md mx-auto mb-2 font-light -mt-16 relative z-10">
                  {t("hero.subtitle1")}
                </p>
                <p className="text-lg sm:text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-md mx-auto mb-8 font-light">
                  {t("hero.subtitle2")}
                </p>
                <button onClick={() => setStep(1)}
                  className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-medium text-lg glow-lavender">
                  <span aria-hidden="true">&#10022;</span>
                  {t("hero.cta")}
                </button>
                {/* Reassurance microline — lowers friction before the CTA commitment. */}
                <p className="mt-4 text-xs sm:text-sm text-[var(--color-text-secondary)] opacity-70 tracking-wide">
                  {locale === "fr" ? "Gratuit · Aucun compte requis · 3 minutes" : "Free · No account needed · 3 minutes"}
                </p>
              </div>

              {/* Scroll cue — invites exploring the sections below. */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce opacity-40" aria-hidden="true">
                <svg width="22" height="22" fill="none" stroke="var(--color-accent-lavender)" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </section>

            {/* ═══ LE CIEL AUJOURD'HUI — énergie du jour + cartes ═══ */}
            <div className="max-w-6xl mx-auto px-4 pt-10">
              <DailySign />
            </div>
            <SkyToday />

            {/* ═══ EXPLORE NATALUNE — les sections du site ═══ */}
            <ExploreSections onStart={() => setStep(1)} />

            {/* ═══ GRATUIT + PASSE PREMIUM ═══ */}
            <section className="max-w-4xl mx-auto px-4 py-12">
              <div className="text-center mb-9">
                <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)]/70 mb-2">
                  {locale === "fr" ? "Gratuit, et un peu plus" : "Free, and a little more"}
                </p>
                <h2 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-3">
                  {locale === "fr" ? "Gratuit pour tous — Premium pour aller plus loin" : "Free for everyone — Premium to go further"}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed">
                  {locale === "fr"
                    ? "Le cœur de Natalune est gratuit, sans compte ni courriel. La passe Premium — un paiement unique — soutient ce projet indépendant et débloque les lectures les plus riches."
                    : "The heart of Natalune is free, no account or email. The Premium pass — a one-time payment — supports this independent project and unlocks the richest readings."}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="glass p-5">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)]/70 mb-3">
                    {locale === "fr" ? "Gratuit · sans compte" : "Free · no account"}
                  </p>
                  <ul className="text-sm text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                    <li>✦ {locale === "fr" ? "Ta carte natale complète : roue, planètes, ascendant" : "Your full birth chart: wheel, planets, ascendant"}</li>
                    <li>✦ {locale === "fr" ? "Portrait Soleil · Lune · Ascendant" : "Sun · Moon · Ascendant portrait"}</li>
                    <li>✦ {locale === "fr" ? "Maisons, aspects et éléments" : "Houses, aspects and elements"}</li>
                    <li>✦ {locale === "fr" ? "Le ciel du jour, le calendrier et les signes" : "The daily sky, the calendar and the signs"}</li>
                  </ul>
                </div>
                <div
                  className="glass p-5"
                  style={{ borderColor: "rgba(224,169,78,0.32)", background: "linear-gradient(135deg, color-mix(in srgb, var(--color-accent-gold) 8%, transparent), transparent)" }}
                >
                  <p className="text-xs uppercase tracking-widest text-[var(--color-accent-gold)]/85 mb-3">
                    {locale === "fr" ? "✦ Passe Premium · 9,99 $ une fois" : "✦ Premium pass · $9.99 one-time"}
                  </p>
                  <ul className="text-sm text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                    <li>✦ {locale === "fr" ? "Interprétations complètes et détaillées" : "Full, detailed interpretations"}</li>
                    <li>✦ {locale === "fr" ? "Chat avec un astrologue IA bienveillant" : "Chat with a caring AI astrologer"}</li>
                    <li>✦ {locale === "fr" ? "Synastrie — l'alchimie de deux âmes" : "Synastry — the alchemy of two souls"}</li>
                    <li>✦ {locale === "fr" ? "Tes anniversaires et dates perso dans le calendrier céleste" : "Your birthdays and personal dates in the celestial calendar"}</li>
                    <li>✦ {locale === "fr" ? "Narration audio de ta lecture" : "Audio narration of your reading"}</li>
                    <li>✦ {locale === "fr" ? "Sauvegarde de tes cartes + PDF par courriel" : "Save your charts + PDF by email"}</li>
                  </ul>
                  <p className="mt-3 text-xs text-[var(--color-text-secondary)]/70 italic">
                    {locale === "fr"
                      ? "Paiement unique, à vie — et tu soutiens un projet indépendant. 💛"
                      : "One-time, forever — and you support an independent project. 💛"}
                  </p>
                  {!isPremium && (
                    <a
                      href={user ? "/premium" : "/inscription?intent=premium"}
                      className="btn-primary mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-white text-sm font-medium glow-lavender"
                      style={{ background: "linear-gradient(135deg, var(--color-accent-gold), #b8863f)" }}
                    >
                      <span aria-hidden="true">✦</span>
                      {locale === "fr"
                        ? user
                          ? "Débloquer Premium — 9,99 $"
                          : "Créer mon compte Premium — 9,99 $"
                        : user
                          ? "Unlock Premium — $9.99"
                          : "Create my Premium account — $9.99"}
                    </a>
                  )}
                </div>
              </div>
            </section>

            {/* ═══ CONFIANCE / FAQ COURTE ═══ */}
            <section className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
              <div className="text-center mb-8">
                <h2 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-3">
                  {locale === "fr" ? "Les questions qu'on se pose" : "The questions you might have"}
                </h2>
              </div>
              <div className="space-y-3">
                {[
                  {
                    fr: {
                      q: "Et si je ne connais pas mon heure de naissance ?",
                      a: "Tu peux quand même calculer ta carte sans l'heure — on te donne ce qui est sûr (Soleil, Lune approximative, planètes). L'Ascendant et les maisons nécessitent l'heure exacte. Renseigne-toi à l'état civil de ta ville de naissance, c'est souvent dans ton acte de naissance.",
                    },
                    en: {
                      q: "What if I don't know my birth time?",
                      a: "You can still calculate without a time — we give you what's certain (Sun, approximate Moon, planets). The Ascendant and houses need the exact time. Check your birth certificate or contact the civil registry of your birthplace.",
                    },
                  },
                  {
                    fr: {
                      q: "Mes données sont-elles en sécurité ?",
                      a: "Sans compte : tout reste dans ton navigateur, rien n'est envoyé ailleurs. Avec un compte : on stocke uniquement ce qui est nécessaire (email, prénom, cartes sauvegardées), et tu peux tout effacer en un clic. Détails sur la page Confidentialité.",
                    },
                    en: {
                      q: "Is my data safe?",
                      a: "Without an account: everything stays in your browser, nothing is sent elsewhere. With an account: we store only what's needed (email, name, saved charts), and you can erase everything in one click. See the Privacy page for details.",
                    },
                  },
                  {
                    fr: {
                      q: "C'est de l'astrologie « sérieuse » ou un horoscope de magazine ?",
                      a: "Astrologie psychologique inspirée de Carl Jung, Liz Greene et Howard Sasportas. Pas de prédictions, pas de fatalité. C'est un outil de réflexion sur soi, basé sur des calculs astronomiques réels (théorie VSOP87).",
                    },
                    en: {
                      q: "Is this serious astrology or magazine horoscopes?",
                      a: "Psychological astrology inspired by Carl Jung, Liz Greene and Howard Sasportas. No predictions, no fate. It's a tool for self-reflection grounded in real astronomical calculations (VSOP87 theory).",
                    },
                  },
                  {
                    fr: {
                      q: "Comment passer à Premium et puis-je annuler ?",
                      a: "9,99 $ CAD une seule fois, paiement sécurisé via Stripe. C'est un achat unique, pas un abonnement — il n'y a donc rien à annuler. Et si tu changes d'avis dans les 14 jours, on te rembourse simplement.",
                    },
                    en: {
                      q: "How do I go Premium and can I cancel?",
                      a: "$9.99 CAD once, secure payment through Stripe. It's a one-time purchase, not a subscription — so there's nothing to cancel. If you change your mind within 14 days, we'll refund you simply.",
                    },
                  },
                ].map((item, i) => (
                  <details key={i} className="glass p-4 group">
                    <summary className="cursor-pointer flex items-center justify-between text-sm font-medium text-[var(--color-text-primary)]">
                      <span>{locale === "fr" ? item.fr.q : item.en.q}</span>
                      <span className="text-[var(--color-accent-lavender)] text-lg transition-transform group-open:rotate-45 ml-3">+</span>
                    </summary>
                    <p className="mt-3 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      {locale === "fr" ? item.fr.a : item.en.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            {/* ═══ CTA FINAL ═══ */}
            <section className="max-w-2xl mx-auto px-4 pb-20 text-center">
              <p className="text-sm text-[var(--color-text-secondary)] mb-5">
                {locale === "fr"
                  ? "Prêt·e à voir ce que ton ciel disait ce jour-là ?"
                  : "Ready to see what your sky was saying that day?"}
              </p>
              <button onClick={() => setStep(1)}
                className="btn-primary px-8 py-4 rounded-full text-white font-medium text-base">
                {t("hero.cta")}
              </button>
            </section>
          </>
        )}

        {/* ═══ FORM ═══ */}
        {step >= 1 && step <= 3 && (
          <section className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="glass p-6 sm:p-8 md:p-12 max-w-lg w-full glow-lavender step-enter">
              <div className="flex gap-1.5 mb-8">
                {[1, 2, 3].map((s) => (
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
                  <div className="flex justify-center gap-2 mt-5">
                    {([
                      { value: "femme" as Genre, label: locale === "fr" ? "Femme" : "Woman" },
                      { value: "homme" as Genre, label: locale === "fr" ? "Homme" : "Man" },
                      { value: "nb" as Genre, label: locale === "fr" ? "Non-binaire" : "Non-binary" },
                    ]).map((opt) => (
                      <button key={opt.value}
                        onClick={() => setForm({ ...form, genre: opt.value })}
                        className={`px-4 py-2 rounded-full text-sm transition-all duration-200 border ${
                          form.genre === opt.value
                            ? "bg-[var(--color-accent-lavender)]/20 border-[var(--color-accent-lavender)]/50 text-[var(--color-text-primary)]"
                            : "bg-white/5 border-white/10 text-[var(--color-text-secondary)] hover:border-white/20"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className={stepDirection === "next" ? "animate-slide-in-right" : "animate-slide-in-left"}>
                  <h2 className="font-cinzel text-xl sm:text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">{t("form.step2.title")}</h2>
                  <p className="text-xs sm:text-sm text-center text-[var(--color-text-secondary)] mb-6">{t("form.step2.subtitle")}</p>
                  <div className="glass rounded-2xl px-3 py-4 mb-6">
                    <DateWheelPicker
                      value={new Date(form.annee, form.mois - 1, form.jour)}
                      onChange={(d) => setForm({ ...form, annee: d.getFullYear(), mois: d.getMonth() + 1, jour: d.getDate() })}
                      minYear={1900}
                      maxYear={new Date().getFullYear()}
                      size="md"
                      locale={locale === "fr" ? "fr-FR" : "en-US"}
                    />
                  </div>
                  <label className="flex items-center justify-center gap-3 mb-4 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form.hasTime ? "bg-[var(--color-accent-lavender)] border-[var(--color-accent-lavender)]" : "border-[var(--color-text-secondary)] bg-transparent"}`}
                      onClick={() => setForm({ ...form, hasTime: !form.hasTime })}>
                      {form.hasTime && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition">{t("form.step3.knowTime")}</span>
                  </label>
                  {form.hasTime ? (
                    <input
                      type="time"
                      value={`${String(form.heure).padStart(2, "0")}:${String(form.minute).padStart(2, "0")}`}
                      onChange={(e) => {
                        const [h, m] = e.target.value.split(":").map((n) => parseInt(n, 10));
                        if (!isNaN(h) && !isNaN(m)) setForm({ ...form, heure: h, minute: m });
                      }}
                      className="glass-input w-full max-w-[240px] mx-auto block text-center text-lg"
                    />
                  ) : (
                    <div className="glass p-4 text-sm text-[var(--color-text-secondary)] text-center border-l-2 border-[var(--color-accent-lavender)]/30">
                      {t("form.step3.noTime")}
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className={stepDirection === "next" ? "animate-slide-in-right" : "animate-slide-in-left"}>
                  <h2 className="font-cinzel text-xl sm:text-2xl text-center mb-2 text-[var(--color-accent-lavender)]">{t("form.step4.title")}</h2>
                  <p className="text-xs sm:text-sm text-center text-[var(--color-text-secondary)] mb-6">{t("form.step4.subtitle")}</p>
                  <div className="relative">
                    <input type="text" value={form.lieu} onChange={(e) => handleCitySearch(e.target.value)}
                      placeholder={t("form.step4.placeholder")} className="glass-input w-full text-lg text-center" autoFocus />
                    <button type="button" onClick={detectLocation}
                      className="mt-3 w-full btn-ghost px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2" disabled={geoLoading}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4m10-10h-4M6 12H2"/></svg>
                      {geoLoading ? t("geo.detecting") : t("geo.detect")}
                    </button>
                    {cityLoading && (
                      <div className="absolute right-4 top-5 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-[var(--color-accent-lavender)]/30 border-t-[var(--color-accent-lavender)] rounded-full animate-spin" />
                      </div>
                    )}
                    {citySuggestions.length > 0 && (
                      <div className="mt-2 glass overflow-hidden z-20">
                        {citySuggestions.map((city, i) => (
                          <button key={`${city.lat}-${city.lon}-${i}`} onClick={() => selectCity(city)}
                            className="w-full px-4 py-3 text-left hover:bg-white/5 active:bg-white/10 transition text-[var(--color-text-primary)] text-sm border-b border-[var(--color-glass-border)] last:border-0">
                            {city.display}
                          </button>
                        ))}
                      </div>
                    )}
                    {cityError && (
                      <p className="text-xs text-[var(--color-accent-rose)] mt-3 text-center animate-fade-in" role="alert">
                        {cityError}
                      </p>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5">
                    <h3 className="font-cinzel text-base text-center mb-1 text-[var(--color-text-primary)]">
                      {locale === "fr" ? "La voix qui te parle" : "The voice that speaks to you"}
                    </h3>
                    <p className="text-[12px] text-center text-[var(--color-text-secondary)] mb-4">
                      {locale === "fr"
                        ? "Le ton de ta lecture. Les positions restent les mêmes."
                        : "The tone of your reading. Positions remain the same."}
                    </p>
                    <div role="radiogroup" aria-label={locale === "fr" ? "Voix d'interprétation" : "Interpretation voice"} className="flex flex-col gap-2">
                      {VOICE_OPTIONS.map((opt) => {
                        const active = form.voice === opt.key;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setForm({ ...form, voice: opt.key })}
                            className={`text-left rounded-xl px-4 py-3 transition-all duration-200 border ${
                              active
                                ? "bg-[var(--color-accent-lavender)]/15 border-[var(--color-accent-lavender)]/60 shadow-[0_0_20px_-8px_var(--color-accent-lavender)]"
                                : "bg-white/[0.03] border-white/10 hover:border-white/20"
                            }`}
                          >
                            <div className={`font-cinzel text-base mb-0.5 ${active ? "text-[var(--color-accent-lavender)]" : "text-[var(--color-text-primary)]"}`}>
                              {locale === "fr" ? opt.labelFr : opt.labelEn}
                            </div>
                            <div className="text-[12px] text-[var(--color-text-secondary)] leading-snug">
                              {locale === "fr" ? opt.descFr : opt.descEn}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {showValidation && !canAdvance() && (
                <p className="text-xs text-red-400/80 text-center mt-4 animate-fade-in" role="alert">
                  {step === 1 && t("validation.nameRequired")}
                  {step === 2 && t("validation.dateInvalid")}
                  {step === 3 && t("validation.cityRequired")}
                </p>
              )}

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => { setStepDirection("prev"); setShowValidation(false); setStep(Math.max(0, step - 1)); }}
                  className="btn-ghost px-5 py-2.5 rounded-xl text-sm"
                >
                  {t("form.back")}
                </button>
                {step < 3 ? (
                  <button onClick={() => { if (canAdvance()) { setStepDirection("next"); setShowValidation(false); setStep(step + 1); } else { setShowValidation(true); } }}
                    aria-disabled={!canAdvance()}
                    className={`btn-primary px-6 py-2.5 rounded-xl text-sm ${!canAdvance() ? "opacity-50 cursor-not-allowed" : ""}`}>{t("form.next")}</button>
                ) : (
                  <button onClick={() => { if (canAdvance()) { doCalculation(); } else { setShowValidation(true); } }}
                    aria-disabled={!canAdvance()}
                    className={`btn-primary px-8 py-3 rounded-xl font-bold text-sm glow-lavender ${!canAdvance() ? "opacity-50 cursor-not-allowed" : ""}`}>{t("form.calculate")}</button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ═══ LOADING ═══ */}
        {step === 6 && (
          <section className="min-h-screen flex items-center justify-center px-4" aria-live="polite" aria-busy="true">
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
          <section className="min-h-screen pb-24" aria-live="polite">
            {/* Auto-save confirmation — fades in then auto-dismisses */}
            {autoSaveToast && (
              <div
                role="status"
                className={`max-w-xl mx-auto mt-4 mx-4 sm:mx-auto rounded-xl border px-4 py-3 text-sm flex items-start gap-3 animate-fade-in ${
                  autoSaveToast.kind === "ok"
                    ? "bg-[var(--color-accent-lavender)]/10 border-[var(--color-accent-lavender)]/30 text-[var(--color-text-primary)]"
                    : "bg-[var(--color-accent-rose)]/10 border-[var(--color-accent-rose)]/30 text-[var(--color-text-primary)]"
                }`}
              >
                <span className="text-[var(--color-accent-lavender)] mt-0.5">
                  {autoSaveToast.kind === "ok" ? "✓" : "✦"}
                </span>
                <span className="flex-1">
                  {autoSaveToast.msg}{" "}
                  <a href="/mon-compte/lectures" className="underline text-[var(--color-accent-lavender)] hover:no-underline">
                    {locale === "fr" ? "Voir mes lectures →" : "View my readings →"}
                  </a>
                </span>
                <button
                  onClick={() => setAutoSaveToast(null)}
                  aria-label={locale === "fr" ? "Fermer" : "Close"}
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] -mr-1"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <div className="text-center pt-8 pb-4 px-4">
              <div className="text-2xl mb-2 opacity-30 text-[var(--color-accent-lavender)]">✦</div>
              <h1 className="font-cinzel text-3xl sm:text-4xl text-[var(--color-text-primary)]">
                {t("results.skyOf")} <span className="text-[var(--color-accent-lavender)]">{form.prenom}</span>
              </h1>
              <TitleSparkles
                id="results-sparkles"
                className="h-16 max-w-md mx-auto mt-1"
                density={500}
              />
              <p className="text-sm text-[var(--color-text-secondary)] font-mono -mt-10 relative z-10">
                {form.jour} {MONTHS[form.mois - 1]} {form.annee}
                {form.hasTime && ` — ${String(form.heure).padStart(2, "0")}h${String(form.minute).padStart(2, "0")}`}
                {" — "}{form.lieu}
              </p>
            </div>

            {/* ── Intro Narrative ── */}
            {chart && (
              <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-8 animate-on-scroll">
                <div className="glass p-6 sm:p-8 text-center">
                  <p className="text-xl sm:text-2xl font-cinzel text-[var(--color-text-primary)] mb-4 leading-relaxed">
                    {getGreeting(form.prenom, form.genre, locale)},{" "}
                    {locale === "fr" ? "tu es" : "you are"}{" "}
                    <span className="text-[var(--color-accent-lavender)] font-semibold">{translateSign(chart.planets[0].sign, locale)}</span>
                    {chart.ascendant && (<>, {locale === "fr" ? "Ascendant" : "Ascendant"}{" "}
                      <span className="text-[var(--color-accent-lavender)] font-semibold">{translateSign(chart.ascendant.sign, locale)}</span>
                    </>)}.
                  </p>

                  {/* Three sign icons */}
                  <div className="flex justify-center gap-6 my-6">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center">
                        <SignIcon name={chart.planets[0].sign} size={28} color="#fbbf24" glow />
                      </div>
                      <span className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)]">{locale === "fr" ? "Soleil" : "Sun"}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-14 h-14 rounded-2xl bg-blue-400/10 border border-blue-300/20 flex items-center justify-center">
                        <SignIcon name={chart.planets[1].sign} size={28} color="#93c5fd" glow />
                      </div>
                      <span className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)]">{locale === "fr" ? "Lune" : "Moon"}</span>
                    </div>
                    {chart.ascendant && (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center">
                          <SignIcon name={chart.ascendant.sign} size={28} color="#c084fc" glow />
                        </div>
                        <span className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)]">Ascendant</span>
                      </div>
                    )}
                  </div>

                  {/* Short portrait sentences */}
                  <div className="space-y-2 text-[15px] text-[var(--color-text-secondary)] leading-relaxed max-w-lg mx-auto">
                    <p>{locale === "fr" ? "Ton Soleil en" : "Your Sun in"} {translateSign(chart.planets[0].sign, locale)} {genderize(getIntroSentence(getCosmicPortraitSun(chart.planets[0].sign, locale)), form.genre)}</p>
                    <p>{locale === "fr" ? "Ta Lune en" : "Your Moon in"} {translateSign(chart.planets[1].sign, locale)} {genderize(getIntroSentence(getCosmicPortraitMoon(chart.planets[1].sign, locale)), form.genre)}</p>
                    {chart.ascendant && (
                      <p>Ascendant {translateSign(chart.ascendant.sign, locale)} — {genderize(getCosmicPortraitAsc(chart.ascendant.sign, locale), form.genre)}</p>
                    )}
                  </div>

                  <div className="mt-6">
                    <button onClick={() => scrollToTab("portrait")} className="text-sm text-[var(--color-accent-lavender)] hover:underline inline-flex items-center gap-1 transition">
                      {locale === "fr" ? "Explore ta carte en détail" : "Explore your chart in detail"} <span className="animate-bounce inline-block">↓</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <nav className="sticky top-0 z-30 backdrop-blur-2xl bg-[var(--color-space-deep)]/80" style={{ borderBottom: "1px solid rgba(201,160,255,0.06)" }}>
              <div className="tab-nav flex overflow-x-auto max-w-3xl lg:max-w-4xl mx-auto">
                {RESULT_TABS.map((tab) => (
                  <button key={tab.id} onClick={() => {
                    scrollToTab(tab.id);
                    if (showTabsHint) {
                      setShowTabsHint(false);
                      sessionStorage.setItem("tabs_guidance_seen", "1");
                    }
                  }}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3.5 text-xs font-medium tracking-wide uppercase transition-all whitespace-nowrap relative ${
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

            {showTabsHint && (
              <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 pt-3">
                <p className="text-xs text-center text-[var(--color-accent-lavender)]/60 animate-fade-in">
                  {locale === "en" ? "↑ Start here — explore each section at your own pace" : "↑ Commence par ici — explore chaque section à ton rythme"}
                </p>
              </div>
            )}

            <div ref={resultsRef} className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 space-y-8 mt-6">

              {/* PORTRAIT */}
              <div ref={(el) => { sectionRefs.current.portrait = el; }} className="scroll-mt-16">
                <div className="glass p-4 sm:p-6 mb-6">
                  <div className="flex justify-end gap-2 mb-2">
                    <button
                      onClick={() => setShowWheelAspects(!showWheelAspects)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${showWheelAspects ? "border-[var(--color-accent-lavender)]/40 text-[var(--color-accent-lavender)]" : "border-[var(--color-glass-border)] text-[var(--color-text-secondary)]"}`}
                    >
                      {locale === "fr" ? "Aspects" : "Aspects"} {showWheelAspects ? "✓" : ""}
                    </button>
                    {selectedPlanet && (
                      <button
                        onClick={() => setSelectedPlanet(null)}
                        className="text-xs px-3 py-1 rounded-full border border-[var(--color-glass-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all"
                      >
                        {locale === "fr" ? "Tout afficher" : "Show all"}
                      </button>
                    )}
                  </div>
                  <div ref={zodiacWheelRef}>
                    <ZodiacWheel planets={chart.planets} ascendant={chart.ascendant} selectedPlanet={selectedPlanet} showAspects={showWheelAspects} onTapPlanet={(p) => { setSelectedPlanet(p.name); if (activeTab !== "planets") { scrollToTab("planets"); setTimeout(() => togglePlanet(p.name), 200); } else { togglePlanet(p.name); } }} />
                  </div>
                </div>

                {/* ── Ton Portrait Cosmique (Big Three fused) ── */}
                <div className="glass p-6 sm:p-8 mb-6">
                  <h2 className="font-cinzel text-2xl text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
                    <span className="text-[var(--color-accent-lavender)] opacity-50">✦</span> {t("results.cosmicPortrait")}
                  </h2>

                  {/* Big Three badges — toggle (single active, replaces content) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    {[
                      { id: "sun", label: locale === "fr" ? "Soleil" : "Sun", sub: t("results.sunLabel"), data: chart.planets[0], icon: <SunIcon size={28} color="var(--color-sun)" glow />, color: "from-amber-500/25 to-orange-500/10", activeColor: "from-amber-500/35 to-orange-500/20", border: "border-amber-400/20", activeBorder: "border-amber-400/50", ring: "ring-amber-400/30", glowClass: "glow-sun" },
                      { id: "moon", label: locale === "fr" ? "Lune" : "Moon", sub: t("results.moonLabel"), data: chart.planets[1], icon: <MoonIcon size={28} color="var(--color-moon)" glow />, color: "from-blue-400/20 to-indigo-500/10", activeColor: "from-blue-400/30 to-indigo-500/20", border: "border-blue-300/20", activeBorder: "border-blue-300/50", ring: "ring-blue-400/30", glowClass: "glow-moon" },
                      ...(chart.ascendant ? [{ id: "asc", label: "Ascendant", sub: t("results.ascLabel"), data: chart.ascendant, icon: <AscendantIcon size={28} color="var(--color-accent-lavender)" glow />, color: "from-purple-500/20 to-fuchsia-500/10", activeColor: "from-purple-500/30 to-fuchsia-500/20", border: "border-purple-400/20", activeBorder: "border-purple-400/50", ring: "ring-purple-400/30", glowClass: "glow-lavender" }] : []),
                    ].map((item) => {
                      const isActive = activeBigThree === item.data.name;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveBigThree(isActive ? null : item.data.name);
                            if (!isActive) setTimeout(() => bigThreeContentRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
                          }}
                          className={`relative rounded-2xl bg-gradient-to-br ${isActive ? item.activeColor : item.color} border ${isActive ? item.activeBorder : item.border} backdrop-blur-md p-5 text-left transition-all duration-300 hover:scale-[1.02] cursor-pointer ${isActive ? `ring-2 ${item.ring} ${item.glowClass}` : "hover:shadow-lg hover:shadow-white/5"}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center border shadow-inner transition-all duration-300 ${isActive ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10"}`}>
                              <span className={`transition-all duration-300 ${isActive ? "scale-110" : ""}`}>{item.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)] font-medium">{item.label}</div>
                              <div className="font-cinzel text-2xl text-[var(--color-text-primary)] mt-0.5">{translateSign(item.data.sign, locale)}</div>
                              <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">{item.sub}</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-sm font-mono text-[var(--color-text-primary)]">{item.data.degree}°</div>
                              {item.data.house && <div className="text-xs font-mono text-[var(--color-text-secondary)]">M{item.data.house}</div>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Mobile hint arrow */}
                  {!activeBigThree && (
                    <div className="sm:hidden text-center py-2 animate-bounce opacity-40">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="inline text-[var(--color-accent-lavender)]"><path d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  )}

                  {/* Single content area — replaces on toggle with smooth transition */}
                  <div ref={bigThreeContentRef} className="min-h-[60px] transition-all duration-500 ease-in-out">
                    {(() => {
                      const items = [
                        { data: chart.planets[0], portrait: () => <><strong>{form.prenom}</strong>, {locale === "fr" ? "ton Soleil en" : "your Sun in"} {translateSign(chart.planets[0].sign, locale)} {genderize(getCosmicPortraitSun(chart.planets[0].sign, locale), form.genre)}</> },
                        { data: chart.planets[1], portrait: () => <>{locale === "fr" ? "Ta Lune en" : "Your Moon in"} {translateSign(chart.planets[1].sign, locale)} {genderize(getCosmicPortraitMoon(chart.planets[1].sign, locale), form.genre)}</> },
                        ...(chart.ascendant ? [{ data: chart.ascendant, portrait: () => <>{locale === "fr" ? "Avec un Ascendant" : "With an Ascendant in"} {translateSign(chart.ascendant!.sign, locale)}, {genderize(getCosmicPortraitAsc(chart.ascendant!.sign, locale), form.genre)}</> }] : []),
                      ];
                      const active = items.find((i) => i.data.name === activeBigThree);
                      if (!active) return (
                        <p className="text-sm text-[var(--color-text-secondary)] text-center py-4 italic">
                          {locale === "fr" ? "Clique sur un élément pour explorer ton portrait." : "Click an element to explore your portrait."}
                        </p>
                      );
                      return (
                        <div key={active.data.name} className="rounded-xl bg-white/[0.03] border border-white/5 p-5 sm:p-6" style={{ animation: "fadeSlideIn 0.4s ease-out" }}>
                          <p className="text-base leading-relaxed text-[var(--color-text-primary)]">{active.portrait()}</p>
                          {getInterp(active.data.name, active.data.sign, active.data.house) && (
                            <p className="mt-4 text-base leading-relaxed text-[var(--color-text-primary)] opacity-85">
                              {getInterp(active.data.name, active.data.sign, active.data.house)}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* AUDIO NARRATION — right after Portrait for visibility */}
              {isPremium ? (
                <div className="scroll-reveal">
                  <AudioPlayer
                    narrativeText={[
                      getCosmicPortraitSun(chart.planets[0].sign, locale),
                      getCosmicPortraitMoon(chart.planets[1].sign, locale),
                      chart.ascendant ? getCosmicPortraitAsc(chart.ascendant.sign, locale) : "",
                      ...getLifeThemes(chart, form.prenom, locale).slice(0, 2).map((t) => t.text),
                    ].filter(Boolean).join(" ")}
                    chartParams={{ sun: chart.planets[0].sign, moon: chart.planets[1].sign, asc: chart.ascendant?.sign }}
                    prenom={form.prenom}
                  />
                </div>
              ) : (
                <PremiumGate compact>
                  <div className="glass p-5 sm:p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/15 flex items-center justify-center">
                      <svg width="18" height="18" fill="none" stroke="var(--color-accent-rose)" strokeWidth="1.5" viewBox="0 0 24 24">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">
                        {locale === "fr" ? "Écoute ton portrait cosmique" : "Listen to your cosmic portrait"}
                      </span>
                      <span className="block text-xs text-[var(--color-text-secondary)] opacity-60">
                        {locale === "fr" ? "Une narration audio douce de ta carte du ciel" : "A gentle audio narration of your natal chart"}
                      </span>
                    </div>
                  </div>
                </PremiumGate>
              )}

              <SectionTransition
                text={locale === "fr"
                  ? "Maintenant que tu connais tes trois piliers, explorons les planètes qui colorent ton thème..."
                  : "Now that you know your three pillars, let's explore the planets that color your chart..."}
                symbol="⊙"
              />

              {/* PLANETS — personal planets only (skip Sun/Moon already in Big Three, skip generational) */}
              <div ref={(el) => { sectionRefs.current.planets = el; }} className="scroll-mt-16">
                <h2 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                  <span className="text-[var(--color-accent-lavender)] opacity-50">⊙</span> {t("results.planets")}
                </h2>
                <p className="text-base text-[var(--color-text-secondary)] mb-5">{t("results.planetDesc")}</p>
                <div className="space-y-2">
                  {chart.planets
                    .filter((p) => !["Soleil", "Lune", "Uranus", "Neptune", "Pluton"].includes(p.name))
                    .map((planet) => {
                    const isOpen = expandedPlanets.has(planet.name);
                    return (
                      <div key={planet.name} className="glass overflow-hidden">
                        <button onClick={() => togglePlanet(planet.name)}
                          className="w-full flex items-center justify-between p-4 sm:p-5 text-left btn-hover group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 backdrop-blur-sm flex items-center justify-center border border-white/10 group-hover:border-[var(--color-accent-lavender)]/25 transition shadow-inner">
                              <PlanetIcon name={planet.name} size={26} color="var(--color-accent-lavender)" />
                            </div>
                            <div>
                              <span className="inline-flex items-center gap-2">
                                <span className="text-lg font-medium text-[var(--color-text-primary)]">{translatePlanet(planet.name, locale)}</span>
                                {planet.retrograde && (
                                  <span
                                    className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--color-accent-rose)]/15 text-[var(--color-accent-rose)]"
                                    title={locale === "fr" ? "Rétrograde à ta naissance — cette énergie s'exprime de façon plus intérieure." : "Retrograde at your birth — this energy expresses itself more inwardly."}
                                  >
                                    ℞
                                  </span>
                                )}
                              </span>
                              <span
                                className="text-base text-[var(--color-text-secondary)] ml-2 underline decoration-dotted decoration-[var(--color-text-muted)]/40 underline-offset-4 cursor-help"
                                title={signMetaLine(planet.sign, locale)}
                              >{translateSign(planet.sign, locale)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-[var(--color-text-secondary)]">{planet.degree}°</span>
                            {planet.house && <span className="text-xs font-mono text-[var(--color-text-secondary)]">M{planet.house}</span>}
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5"
                              className={`text-[var(--color-text-secondary)] opacity-40 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                              <path d="M3 5l4 4 4-4" />
                            </svg>
                          </div>
                        </button>
                        <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? "600px" : "0", opacity: isOpen ? 1 : 0 }}>
                          <div className="px-5 pb-5 text-base text-[var(--color-text-primary)] leading-relaxed border-t border-white/5">
                            <div className="pt-4 whitespace-pre-line">
                              {getInterp(planet.name, planet.sign, planet.house) || (
                                <span className="text-[var(--color-text-secondary)]">{translatePlanet(planet.name, locale)} {locale === "en" ? "in" : "en"} {translateSign(planet.sign, locale)} {locale === "en" ? "colors how you express the qualities of this sign." : "colore ta manière d'exprimer les qualités de ce signe."}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <SectionTransition
                text={locale === "fr"
                  ? "Chaque planète appartient à un élément. Voici l'équilibre des forces qui te traversent..."
                  : "Each planet belongs to an element. Here's the balance of forces flowing through you..."}
                symbol="◆"
              />

              {/* ELEMENTS */}
              <div ref={(el) => { sectionRefs.current.elements = el; }} className="scroll-mt-16">
                <h2 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                  <span className="text-[var(--color-accent-lavender)] opacity-50">◆</span> {t("results.elements")}
                </h2>
                <p className="text-base text-[var(--color-text-secondary)] mb-6">{t("results.elementDesc")}</p>
                <ElementBalance planets={chart.planets} locale={locale} />
              </div>

              {chart.ascendant && (
                <SectionTransition
                  text={locale === "fr"
                    ? "Les maisons astrologiques révèlent les domaines de ta vie où ces énergies s'expriment..."
                    : "The astrological houses reveal the life areas where these energies express themselves..."}
                  symbol="⌂"
                />
              )}

              {/* HOUSES */}
              {chart.ascendant && (
                <div ref={(el) => { sectionRefs.current.houses = el; }} className="scroll-mt-16">
                  <h2 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                    <span className="text-[var(--color-accent-lavender)] opacity-50">⌂</span> {t("results.houses")}
                  </h2>
                  <p className="text-base text-[var(--color-text-secondary)] mb-5">{t("results.houseDesc")}</p>
                  <HousesMap planets={chart.planets} locale={locale} genre={form.genre} isPremium={isPremium} />

                  {/* Houses audio narration (premium) */}
                  {isPremium && (
                    <div className="mt-6">
                      <AudioPlayer
                        section="houses"
                        prenom={form.prenom}
                        chartParams={{ asc: chart.ascendant.sign, planets: chart.planets.map(p => `${p.name}-${p.sign}-M${p.house}`).join("|") }}
                        narrativeText={(() => {
                          // Group planets by house. Only mention the houses that
                          // actually have at least one planet — empty houses are
                          // narratively dull and would dilute the audio.
                          const byHouse = new Map<number, string[]>();
                          for (const p of chart.planets) {
                            if (typeof p.house === "number") {
                              if (!byHouse.has(p.house)) byHouse.set(p.house, []);
                              byHouse.get(p.house)!.push(`${p.name} en ${translateSign(p.sign, locale)}`);
                            }
                          }
                          const ascSign = chart.ascendant ? translateSign(chart.ascendant.sign, locale) : "";
                          const lines = [
                            locale === "fr"
                              ? `Ton Ascendant en ${ascSign} ouvre ta première maison : la manière dont tu arrives au monde, le seuil entre toi et les autres.`
                              : `Your Ascendant in ${ascSign} opens your first house: the way you arrive in the world, the threshold between you and others.`,
                          ];
                          for (const [h, planets] of [...byHouse.entries()].sort((a, b) => a[0] - b[0])) {
                            if (locale === "fr") {
                              lines.push(`Maison ${h} : ${planets.join(", ")}. Ce domaine te demande de l'attention.`);
                            } else {
                              lines.push(`House ${h}: ${planets.join(", ")}. This field asks for your attention.`);
                            }
                          }
                          return lines.join(" ");
                        })()}
                      />
                    </div>
                  )}
                </div>
              )}

              <SectionTransition
                text={locale === "fr"
                  ? "Les aspects révèlent comment tes planètes se parlent entre elles — harmonies et tensions créatrices..."
                  : "Aspects reveal how your planets talk to each other — harmonies and creative tensions..."}
                symbol="△"
              />

              {/* ASPECTS */}
              <div ref={(el) => { sectionRefs.current.aspects = el; }} className="scroll-mt-16">
                <h2 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                  <span className="text-[var(--color-accent-lavender)] opacity-50">△</span> {t("results.aspects")}
                </h2>
                <p className="text-base text-[var(--color-text-secondary)] mb-4">{t("results.aspectDesc")}</p>

                {/* Legend — teach the 3 aspect families at a glance so the
                    glyphs below aren't cryptic. */}
                {chart.aspects.length > 0 && (
                  <div className="glass p-3 sm:p-4 mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                    <span className="uppercase tracking-widest text-[var(--color-text-secondary)] opacity-70">
                      {locale === "fr" ? "Comment lire" : "How to read"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-accent-gold)" }} />
                      <span className="text-[var(--color-text-secondary)]">{locale === "fr" ? "Fusion (☌) — énergies confondues" : "Fusion (☌) — merged energies"}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#79c2a0" }} />
                      <span className="text-[var(--color-text-secondary)]">{locale === "fr" ? "Harmonie (△ ⚹) — fluide" : "Harmony (△ ⚹) — flowing"}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-accent-rose)" }} />
                      <span className="text-[var(--color-text-secondary)]">{locale === "fr" ? "Tension (□ ☍) — à travailler" : "Tension (□ ☍) — to work through"}</span>
                    </span>
                  </div>
                )}

                {chart.aspects.length > 0 ? (
                  <div className="space-y-2">
                    {chart.aspects.slice(0, 12).map((aspect, i) => {
                      const interp = getAspectInterp(aspect.type, aspect.planet1, aspect.planet2);
                      const color = ASPECT_COLORS[aspect.type] || "#c9a0ff";
                      const symbol = ASPECT_SYMBOLS[aspect.type] || "·";
                      const nature = ASPECT_NATURE[aspect.type];
                      const natureLabel = nature ? (locale === "fr" ? nature.fr : nature.en) : "";
                      const typeDescShort = (interpretations as { aspectTypeDescriptions?: Record<string, string> })?.aspectTypeDescriptions?.[aspect.type];
                      const isOpen = expandedAspects.has(i);
                      return (
                        <div key={i} className="glass overflow-hidden">
                          <button className="w-full p-4 text-left btn-hover group" onClick={() => toggleAspect(i)}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-base">
                                <span className="text-[var(--color-accent-lavender)]" style={{ fontFamily: "serif" }}>{aspect.symbol1}</span>
                                <span className="text-[var(--color-text-primary)]">{aspect.planet1}</span>
                                <span
                                  style={{ color }}
                                  className="text-xl mx-0.5 cursor-help"
                                  title={typeDescShort ? `${aspect.type} — ${genderize(typeDescShort, form.genre)}` : aspect.type}
                                >{symbol}</span>
                                <span className="text-[var(--color-text-primary)]">{aspect.planet2}</span>
                                <span className="text-[var(--color-accent-lavender)]" style={{ fontFamily: "serif" }}>{aspect.symbol2}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Nature chip — visible WITHOUT expanding (PY: aider à comprendre). */}
                                {natureLabel && (
                                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs">
                                    <span className="w-2 h-2 rounded-full" style={{ background: nature!.color }} />
                                    <span style={{ color: nature!.color }}>{natureLabel}</span>
                                  </span>
                                )}
                                <span className="text-xs px-2 py-0.5 rounded-full border font-mono" style={{ borderColor: `${color}30`, color }}>{aspect.type}</span>
                                <span className="text-xs text-[var(--color-text-secondary)] font-mono">{aspect.orb}°</span>
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5"
                                  className={`text-[var(--color-text-secondary)] opacity-40 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                                  <path d="M2 4l4 4 4-4" />
                                </svg>
                              </div>
                            </div>
                          </button>
                          <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? "800px" : "0", opacity: isOpen ? 1 : 0 }}>
                            <div className="px-5 pb-5 text-base leading-relaxed border-t border-white/5">
                              {/* Explain: what is this aspect type? */}
                              {(() => {
                                const mod = interpretations as { aspectTypeDescriptions?: Record<string, string> };
                                const typeDesc = mod?.aspectTypeDescriptions?.[aspect.type];
                                return typeDesc ? (
                                  <div className="pt-4 mb-3 rounded-lg bg-white/[0.03] border border-white/5 p-3">
                                    <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] block mb-1">{locale === "fr" ? "Qu'est-ce que c'est ?" : "What is this?"}</span>
                                    <p className="text-sm text-[var(--color-text-primary)] opacity-80">{genderize(typeDesc, form.genre)}</p>
                                  </div>
                                ) : null;
                              })()}
                              {/* Interpret: personal meaning */}
                              <div className={`pt-${interpretations && (interpretations as { aspectTypeDescriptions?: Record<string, string> }).aspectTypeDescriptions?.[aspect.type] ? "1" : "4"}`}>
                                <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-lavender)] block mb-2">{locale === "fr" ? "Pour toi" : "For you"}</span>
                                <p className="text-[var(--color-text-primary)]">{interp || (locale === "en" ? `The ${aspect.type.toLowerCase()} between ${aspect.planet1} and ${aspect.planet2} creates a unique dialogue, shaping how these two energies interact in your life.` : `L'aspect ${aspect.type.toLowerCase()} entre ${aspect.planet1} et ${aspect.planet2} crée un dialogue unique, colorant la manière dont ces deux énergies interagissent dans ta vie.`)}</p>
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

                {/* Aspects audio narration (premium) */}
                {isPremium && chart.aspects.length > 0 && (
                  <div className="mt-6">
                    <AudioPlayer
                      section="aspects"
                      prenom={form.prenom}
                      chartParams={{ aspects: chart.aspects.slice(0, 5).map(a => `${a.planet1}-${a.type}-${a.planet2}`).join("|") }}
                      narrativeText={chart.aspects.slice(0, 5).map((aspect) => {
                        const interp = getAspectInterp(aspect.type, aspect.planet1, aspect.planet2);
                        const head = locale === "fr"
                          ? `${translatePlanet(aspect.planet1, locale)} en ${aspect.type.toLowerCase()} avec ${translatePlanet(aspect.planet2, locale)}.`
                          : `${translatePlanet(aspect.planet1, locale)} ${aspect.type.toLowerCase()} ${translatePlanet(aspect.planet2, locale)}.`;
                        return interp ? `${head} ${interp}` : head;
                      }).join(" ")}
                    />
                  </div>
                )}
              </div>

              {/* TRANSITS DU JOUR (premium) */}
              {todayTransits && (
                <div ref={(el) => { sectionRefs.current.transits = el; }} className="scroll-mt-16">
                  <h2 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                    <span className="text-[var(--color-accent-lavender)] opacity-50">◎</span> {t("transits.title")}
                    {!isPremium && <PremiumBadge small />}
                  </h2>
                  <p className="text-base text-[var(--color-text-secondary)] mb-5">{t("transits.desc")}</p>

                  {/* AI interpretation of today's transits (premium only) */}
                  {isPremium && (transitInterp.loading || transitInterp.text || transitInterp.error) && (
                    <div className="glass p-5 sm:p-6 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[var(--color-accent-lavender)] opacity-60">✦</span>
                        <h3 className="font-cinzel text-base text-[var(--color-accent-lavender)]">
                          {locale === "fr" ? "Le climat d'aujourd'hui" : "Today's climate"}
                        </h3>
                      </div>
                      {transitInterp.loading && (
                        <div>
                          <p className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-3">
                            <span className="w-3 h-3 border border-[var(--color-accent-lavender)]/30 border-t-[var(--color-accent-lavender)] rounded-full animate-spin" />
                            {locale === "fr" ? "Lecture du ciel du jour…" : "Reading today's sky…"}
                          </p>
                          <Skeleton lines={4} />
                        </div>
                      )}
                      {transitInterp.error && (
                        <p className="text-sm text-[var(--color-accent-rose)]">
                          {locale === "fr" ? "Impossible de générer la lecture : " : "Could not generate the reading: "}
                          {transitInterp.error}
                        </p>
                      )}
                      {transitInterp.text && !transitInterp.loading && (
                        <div className="text-sm sm:text-base text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                          {transitInterp.text}
                        </div>
                      )}
                    </div>
                  )}

                  <PremiumGate>
                  <div className="space-y-2">
                    {todayTransits.planets.slice(0, 7).map((transit) => {
                      const natal = chart.planets.find((p) => p.name === transit.name);
                      if (!natal) return null;
                      return (
                        <TransitRow
                          key={transit.name}
                          transit={transit}
                          natal={natal}
                          locale={locale}
                          labels={{
                            current: t("transits.current"),
                            natal: t("transits.natal"),
                          }}
                        />
                      );
                    })}
                    {/* Légende compacte des deux glyphes du mini-diagramme.
                        Astuce visuelle suite au feedback PY : "il faut que
                        l'utilisateur comprenne tout de suite ce qu'il voit". */}
                    <div className="hidden sm:flex items-center gap-4 px-1 pt-1 text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] opacity-60">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-accent-lavender)]/40" />
                        {locale === "fr" ? "Natal" : "Natal"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-accent-rose)]/50" />
                        {locale === "fr" ? "Transit du jour" : "Today's transit"}
                      </span>
                      <span className="opacity-70">
                        {locale === "fr" ? "Écart angulaire affiché en degrés" : "Angular gap shown in degrees"}
                      </span>
                    </div>
                  </div>
                  </PremiumGate>

                  {/* Transits audio narration (premium) */}
                  {isPremium && (
                    <div className="mt-6">
                      <AudioPlayer
                        section="transits"
                        prenom={form.prenom}
                        chartParams={{
                          date: new Date().toISOString().slice(0, 10),
                          transits: todayTransits.planets.slice(0, 7).map(p => `${p.name}-${p.sign}`).join("|"),
                        }}
                        narrativeText={todayTransits.planets.slice(0, 7).map((transit) => {
                          const natal = chart.planets.find((p) => p.name === transit.name);
                          if (!natal) return "";
                          const sameSgn = transit.sign === natal.sign;
                          const head = locale === "fr"
                            ? `${translatePlanet(transit.name, locale)} aujourd'hui en ${translateSign(transit.sign, locale)}, contre ${translateSign(natal.sign, locale)} dans ton natal.`
                            : `${translatePlanet(transit.name, locale)} today in ${translateSign(transit.sign, locale)}, against ${translateSign(natal.sign, locale)} in your natal.`;
                          const flavor = sameSgn
                            ? (locale === "fr" ? "Un retour aux sources de cette énergie." : "A return to the source of this energy.")
                            : "";
                          return [head, flavor].filter(Boolean).join(" ");
                        }).filter(Boolean).join(" ")}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* LIFE THEMES SYNTHESIS */}
              <div className="glass p-6 sm:p-8 scroll-reveal">
                <h2 className="font-cinzel text-2xl text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                  <span className="text-[var(--color-accent-lavender)] opacity-50">✦</span> {t("results.lifeThemes")}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mb-5">{t("results.lifeThemesDesc")}</p>
                <div className="space-y-3 stagger-in">
                  {getLifeThemes(chart, form.prenom, locale).map((theme, i) => (
                    <div key={i} className="flex gap-4 p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-[var(--color-glass-border)]">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-lavender)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-base text-[var(--color-accent-lavender)]">{theme.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">{theme.title}</h3>
                        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{genderize(theme.text, form.genre)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AUDIO NARRATION — moved to after Portrait section */}

              {/* CHAT AI (P4.3) */}
              <ChartChat
                chartContext={serializeChartForAI(chart, form)}
                prenom={form.prenom}
                genre={form.genre}
                locale={locale}
                voice={form.voice}
              />

              {/* CLOSING */}
              <div className="glass p-8 sm:p-10 text-center scroll-reveal">
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[var(--color-accent-lavender)]/5 border border-[var(--color-accent-lavender)]/10 flex items-center justify-center">
                  <span className="text-xl text-[var(--color-accent-lavender)] opacity-60">✦</span>
                </div>
                <h2 className="font-cinzel text-3xl text-[var(--color-text-primary)] mb-5">{t("results.closing.title")} {form.prenom}</h2>
                <div className="text-base text-[var(--color-text-primary)] leading-relaxed max-w-lg mx-auto space-y-4 mb-8">
                  <p>{t("results.closing.p1")}</p>
                  <p>{t("results.closing.p2")}</p>
                  <p>{t("results.closing.p3")}</p>
                  <div className="border-l-2 border-[var(--color-accent-lavender)]/20 pl-4 py-2 mt-6">
                    <p className="text-[var(--color-accent-lavender)] italic text-sm opacity-70">&laquo;&nbsp;{t("results.closing.quote")}&nbsp;&raquo;</p>
                  </div>
                </div>
                {/* Saved charts (premium only) */}
                <div className="flex justify-center mb-6">
                  <SavedCharts
                    onLoadChart={(formData) => {
                      const fd = formData as unknown as typeof form;
                      setForm(fd);
                      setStep(0);
                      setChart(null);
                    }}
                    currentFormData={form as unknown as Record<string, unknown>}
                    currentLabel={makeChartLabel(form.prenom, form.jour, form.mois, form.annee, locale)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 flex-wrap">
                  {/* Share anonymously (default — no name, safe for social) */}
                  <button onClick={() => {
                      const url = getAnonymousShareUrl();
                      const bigThree = `${translateSign(chart.planets[0].sign, locale)} · ${translateSign(chart.planets[1].sign, locale)}${chart.ascendant ? ` · Ascendant ${translateSign(chart.ascendant.sign, locale)}` : ""}`;
                      // Reuse the shared message builder so the body matches
                      // the dedicated Email button below.
                      const msg = chartShareMessage({ url, bigThree, locale: locale === "en" ? "en" : "fr" });
                      if (navigator.share) {
                        navigator.share({ title: msg.subject, text: msg.body, url });
                      } else {
                        navigator.clipboard.writeText(`${msg.body}`);
                        setCopied(true); setTimeout(() => setCopied(false), 2000);
                      }
                    }} className="btn-primary px-6 py-3 rounded-xl text-sm flex items-center gap-2">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                    {t("results.shareLink")}
                  </button>
                  {/* Dedicated email button — opens the default mail client
                      with a warm, contextual body (PY's feedback: "Pour le
                      partage via courriel, le sujet brut c'est moche, faut
                      contextualiser"). */}
                  <a
                    href={toMailtoUrl(chartShareMessage({
                      url: getAnonymousShareUrl(),
                      bigThree: `${translateSign(chart.planets[0].sign, locale)} · ${translateSign(chart.planets[1].sign, locale)}${chart.ascendant ? ` · Ascendant ${translateSign(chart.ascendant.sign, locale)}` : ""}`,
                      locale: locale === "en" ? "en" : "fr",
                    }))}
                    className="btn-ghost px-5 py-3 rounded-xl text-sm flex items-center gap-2"
                    aria-label={locale === "fr" ? "Partager par email" : "Share by email"}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    {locale === "fr" ? "Email" : "Email"}
                  </a>
                  {/* Copy full personal link (with name) */}
                  <button onClick={() => {
                      navigator.clipboard.writeText(getShareUrl());
                      setCopied(true); setTimeout(() => setCopied(false), 2000);
                    }} className="btn-ghost px-5 py-3 rounded-xl text-sm flex items-center gap-2">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                    {locale === "fr" ? "Mon lien perso" : "My personal link"}
                  </button>
                  <button onClick={() => {
                      navigator.clipboard.writeText(generateOnePager());
                      setCopied(true); setTimeout(() => setCopied(false), 2000);
                    }} className="btn-ghost px-5 py-3 rounded-xl text-sm flex items-center gap-2">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    {t("results.copyChart")}
                  </button>
                  <button
                    id="pdf"
                    onClick={handleGetPdf}
                    disabled={pdfStatus === "generating" || pdfStatus === "uploading"}
                    className="btn-primary px-5 py-3 rounded-xl text-sm flex items-center gap-2 disabled:opacity-60 scroll-mt-20"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
                    {pdfStatus === "generating" || pdfStatus === "uploading"
                      ? pdfMessage
                      : locale === "fr" ? "Obtenir mon PDF" : "Get my PDF"}
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-[var(--color-accent-lavender)] mb-4 animate-fade-in">{t("results.copied")}</p>
                )}
                {pdfStatus !== "idle" && pdfMessage && (
                  <p
                    className={`text-xs mb-4 animate-fade-in ${
                      pdfStatus === "error" || pdfStatus === "limit"
                        ? "text-[var(--color-accent-rose)]"
                        : "text-[var(--color-accent-lavender)]"
                    }`}
                  >
                    {pdfMessage}
                    {pdfStatus === "limit" && (
                      <> · <a href="/premium" className="underline">{locale === "fr" ? "Passer Premium" : "Go Premium"}</a></>
                    )}
                  </p>
                )}
                <div className="border-t border-[var(--color-glass-border)] pt-5">
                  <p className="text-xs text-[var(--color-text-secondary)]/50 italic max-w-md mx-auto leading-relaxed">{t("results.disclaimer")}</p>
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

