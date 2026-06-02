"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Starfield from "@/components/Starfield";
import SiteFooter from "@/components/SiteFooter";
import DailySign from "@/components/DailySign";
import { calculateNatalChart, NatalChart, PlanetPosition, translateSign, translatePlanet } from "@/lib/astro";
import { PlanetIcon, SignIcon, Sun as SunIcon, Moon as MoonIcon, AscendantIcon } from "@/components/AstroIcons";
import { useLocale } from "@/lib/i18n";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { searchCities, CityResult, UserLocation, CitySearchError } from "@/lib/citySearch";
import { getCosmicPortraitSun, getCosmicPortraitMoon, getCosmicPortraitAsc, getLifeThemes, genderize, getGreeting, getIntroSentence, serializeChartForAI, Genre } from "@/lib/chartHelpers";
import { useAuth } from "@/lib/auth-context";
import { getPlanetInterp, getAspectInterp as getAspectInterpHelper, type InterpModule, type VoiceKey } from "@/lib/getInterp";
import LoadingMessages from "@/components/LoadingMessages";
import SectionTransition from "@/components/results/SectionTransition";
import PremiumGate from "@/components/PremiumGate";
import PremiumBadge from "@/components/PremiumBadge";
import { stashPendingPdf } from "@/lib/pending-pdf";
import { chartShareMessage, toMailtoUrl } from "@/lib/shareMessages";

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

const ASPECT_SYMBOLS: Record<string, string> = {
  Conjonction: "☌", Trigone: "△", Sextile: "⚹", Carre: "□", Opposition: "☍",
};

const ASPECT_COLORS: Record<string, string> = {
  Conjonction: "#a89ec8", Trigone: "#9a96aa", Sextile: "#8a87a0", Carre: "#b0a8be", Opposition: "#9590a8",
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
    const label =
      locale === "fr"
        ? `Carte de ${form.prenom || "lecture"} — ${form.jour}/${form.mois}/${form.annee}`
        : `${form.prenom || "Chart"}'s chart — ${form.mois}/${form.jour}/${form.annee}`;
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
   * Native-text PDF generation.
   *
   * Previous version used html2canvas to screenshot the entire results
   * page then sliced the screenshot into A4 pages. The output looked
   * "abominable" (PY's word): pure raster images, no selectable text,
   * paragraphs cut mid-sentence at every page break, 1.9 MB for 7 pages,
   * dark starfield ink-bleeding on paper.
   *
   * The new version builds the PDF section by section with jsPDF native
   * text primitives. Every paragraph is selectable, accents render with
   * the bundled WinAnsi encoding (no font embed needed since we keep
   * standard fonts), page breaks fall between sections — never inside
   * a sentence — and the only raster is the zodiac wheel SVG which we
   * snap once and place on the cover.
   */
  const generatePdfBlob = useCallback(async (): Promise<{ blob: Blob; dataUrl: string; filename: string } | null> => {
    if (!chart) return null;
    const { jsPDF } = await import("jspdf");

    // Snap the zodiac wheel SVG to a PNG via html2canvas. We only screenshot
    // ONE element (the wheel) rather than the whole results page — keeps the
    // PDF lean while still giving it a real visual centerpiece. If the wheel
    // isn't mounted yet (e.g. cold load from ?c= URL) we just skip it.
    let wheelPng: string | null = null;
    let wheelRatio = 1;
    try {
      const wheelEl = zodiacWheelRef.current?.querySelector("svg") as SVGElement | null;
      if (wheelEl) {
        const html2canvas = (await import("html2canvas-pro")).default;
        const wrapper = zodiacWheelRef.current!;
        const canvas = await html2canvas(wrapper, {
          backgroundColor: null,
          scale: 2.5,
          useCORS: true,
        });
        wheelPng = canvas.toDataURL("image/png");
        wheelRatio = canvas.width / canvas.height;
      }
    } catch {
      /* wheel snap failed — degrade gracefully without the visual */
    }

    // A4 portrait, mm units. Standard fonts cover Latin-1 (French accents
    // work). For astrological glyphs (Sun ☉, planets ☿♀♂, aspects ☌△□☍)
    // we draw native vector primitives rather than relying on unicode
    // that WinAnsi-only fonts can't render (PY's screenshot showed the
    // unicode glyphs as garbage like "%Ç %i %³").
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const PW = pdf.internal.pageSize.getWidth();
    const PH = pdf.internal.pageSize.getHeight();
    const MX = 20;
    const TOP = 22;
    const BOT = 22;
    const CONTENT_W = PW - MX * 2;

    // Brand palette — pulled from the website's CSS variables. Cream
    // paper / deep plum ink / accent-lavender + accent-rose for headings
    // and accents. Avoids the dark starfield "school project" look.
    const COLOR = {
      ink: [38, 32, 56] as [number, number, number],
      mutedInk: [108, 100, 130] as [number, number, number],
      lavender: [120, 92, 175] as [number, number, number],
      lavenderSoft: [184, 166, 255] as [number, number, number],
      rose: [200, 122, 160] as [number, number, number],
      hairline: [220, 215, 232] as [number, number, number],
      paper: [253, 251, 248] as [number, number, number],
      headerBand: [245, 240, 250] as [number, number, number],
    };

    /** Background tint + an editorial header band that carries the brand. */
    const paintPage = (kind: "cover" | "content" = "content") => {
      pdf.setFillColor(...COLOR.paper);
      pdf.rect(0, 0, PW, PH, "F");
      if (kind === "content") {
        // Subtle lavender band at the top — gives every page a logo home.
        pdf.setFillColor(...COLOR.headerBand);
        pdf.rect(0, 0, PW, 14, "F");
        // Star glyph + wordmark (drawn as primitives, not unicode).
        drawStar(MX + 2.5, 8, 2.6, COLOR.lavender);
        pdf.setFont("times", "italic");
        pdf.setFontSize(10);
        pdf.setTextColor(...COLOR.lavender);
        pdf.text("Ciel Natal", MX + 8, 9.4);
        // Right side: name of the chart holder, small.
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        pdf.setTextColor(...COLOR.mutedInk);
        pdf.text(`${form.prenom || ""} — ${form.jour}/${form.mois}/${form.annee}`, PW - MX, 9.4, { align: "right" });
      }
    };

    /** Star glyph drawn as a 4-point asterisk (matches the site's ✦ logo). */
    const drawStar = (cx: number, cy: number, r: number, rgb: [number, number, number]) => {
      pdf.setDrawColor(...rgb);
      pdf.setLineWidth(0.5);
      pdf.line(cx, cy - r, cx, cy + r);
      pdf.line(cx - r, cy, cx + r, cy);
      pdf.line(cx - r * 0.7, cy - r * 0.7, cx + r * 0.7, cy + r * 0.7);
      pdf.line(cx - r * 0.7, cy + r * 0.7, cx + r * 0.7, cy - r * 0.7);
    };

    /** Aspect glyph as vector primitives — fixes PY's unicode garbage. */
    const drawAspectGlyph = (type: string, cx: number, cy: number) => {
      const r = 2.2;
      pdf.setDrawColor(...COLOR.lavender);
      pdf.setLineWidth(0.55);
      switch (type) {
        case "Conjonction":
          pdf.circle(cx, cy, r * 0.55, "S");
          pdf.circle(cx, cy, r, "S");
          break;
        case "Trigone":
          pdf.triangle(cx, cy - r, cx - r, cy + r * 0.7, cx + r, cy + r * 0.7, "S");
          break;
        case "Sextile":
          // Six-point asterisk (★) → 3 crossing lines
          pdf.line(cx, cy - r, cx, cy + r);
          pdf.line(cx - r * 0.87, cy - r * 0.5, cx + r * 0.87, cy + r * 0.5);
          pdf.line(cx - r * 0.87, cy + r * 0.5, cx + r * 0.87, cy - r * 0.5);
          break;
        case "Carre":
          pdf.rect(cx - r, cy - r, 2 * r, 2 * r, "S");
          break;
        case "Opposition":
          pdf.circle(cx - r, cy, r * 0.45, "S");
          pdf.circle(cx + r, cy, r * 0.45, "S");
          pdf.line(cx - r + 0.55, cy, cx + r - 0.55, cy);
          break;
        default:
          pdf.circle(cx, cy, 0.6, "F");
      }
    };

    let y = TOP;

    /** Move to a new page if the next block won't fit, then re-paint the header. */
    const ensureSpace = (h: number) => {
      if (y + h > PH - BOT) {
        pdf.addPage();
        paintPage("content");
        drawFooter();
        y = TOP;
      }
    };

    /** Footer with page number + url + hairline rule. */
    const drawFooter = () => {
      const page = pdf.getNumberOfPages();
      pdf.setDrawColor(...COLOR.hairline);
      pdf.setLineWidth(0.2);
      pdf.line(MX, PH - 12, PW - MX, PH - 12);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(...COLOR.mutedInk);
      pdf.text("ciel-natal.vercel.app", MX, PH - 7);
      pdf.text(`${page}`, PW - MX, PH - 7, { align: "right" });
    };

    const writeSectionTitle = (text: string, eyebrow?: string) => {
      ensureSpace(eyebrow ? 22 : 16);
      if (eyebrow) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        pdf.setTextColor(...COLOR.rose);
        pdf.text(eyebrow.toUpperCase(), MX, y);
        y += 5;
      }
      pdf.setFont("times", "normal");
      pdf.setFontSize(22);
      pdf.setTextColor(...COLOR.ink);
      pdf.text(text, MX, y);
      y += 4;
      pdf.setDrawColor(...COLOR.lavender);
      pdf.setLineWidth(0.6);
      pdf.line(MX, y, MX + 22, y);
      y += 9;
    };

    const writeParagraph = (text: string, opts: { italic?: boolean; muted?: boolean; size?: number; center?: boolean } = {}) => {
      const { italic = false, muted = false, size = 11, center = false } = opts;
      pdf.setFont(italic ? "times" : "helvetica", italic ? "italic" : "normal");
      pdf.setFontSize(size);
      pdf.setTextColor(...(muted ? COLOR.mutedInk : COLOR.ink));
      const lines = pdf.splitTextToSize(text, CONTENT_W) as string[];
      const lineH = size * 0.5;
      for (const line of lines) {
        ensureSpace(lineH);
        if (center) pdf.text(line, PW / 2, y, { align: "center" });
        else pdf.text(line, MX, y);
        y += lineH;
      }
      y += 3;
    };

    const writePlanetRow = (planetName: string, signLabel: string, degree: number, house: number | undefined) => {
      ensureSpace(8);
      // Tiny bullet
      pdf.setFillColor(...COLOR.lavenderSoft);
      pdf.circle(MX + 1, y - 1.5, 0.9, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.5);
      pdf.setTextColor(...COLOR.ink);
      pdf.text(planetName, MX + 5, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...COLOR.mutedInk);
      pdf.text(`${signLabel} ${degree}°${typeof house === "number" ? ` · M${house}` : ""}`, PW - MX, y, { align: "right" });
      y += 6;
    };

    // ═══ COVER ═══════════════════════════════════════════════════════
    paintPage("cover");

    // Big star, brand wordmark
    drawStar(PW / 2, 30, 5, COLOR.lavender);
    pdf.setFont("times", "italic");
    pdf.setFontSize(11);
    pdf.setTextColor(...COLOR.lavender);
    pdf.text("CIEL NATAL", PW / 2, 42, { align: "center" });

    pdf.setFont("times", "normal");
    pdf.setFontSize(34);
    pdf.setTextColor(...COLOR.ink);
    pdf.text(form.prenom || (locale === "fr" ? "Voyageur·se" : "Traveller"), PW / 2, 64, { align: "center" });

    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(11);
    pdf.setTextColor(...COLOR.mutedInk);
    pdf.text(locale === "fr" ? "le ciel à ton arrivée" : "the sky at your arrival", PW / 2, 72, { align: "center" });

    // Date/heure/lieu under a thin rule
    pdf.setDrawColor(...COLOR.rose);
    pdf.setLineWidth(0.4);
    pdf.line(PW / 2 - 18, 78, PW / 2 + 18, 78);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(...COLOR.ink);
    const subtitle = `${form.jour} ${MONTHS[form.mois - 1]} ${form.annee}` +
      (form.hasTime ? ` · ${String(form.heure).padStart(2, "0")}h${String(form.minute).padStart(2, "0")}` : "") +
      ` · ${form.lieu}`;
    pdf.text(subtitle, PW / 2, 87, { align: "center" });

    // Zodiac wheel image — the visual heart of the cover
    if (wheelPng) {
      const imgMaxW = Math.min(CONTENT_W, 130);
      const imgH = imgMaxW / wheelRatio;
      pdf.addImage(wheelPng, "PNG", (PW - imgMaxW) / 2, 96, imgMaxW, imgH);
      y = 96 + imgH + 8;
    } else {
      y = 110;
    }

    // Big three summary
    pdf.setFont("times", "normal");
    pdf.setFontSize(14);
    pdf.setTextColor(...COLOR.lavender);
    pdf.text(
      `${translateSign(chart.planets[0].sign, locale)} · ${translateSign(chart.planets[1].sign, locale)} · ${chart.ascendant ? translateSign(chart.ascendant.sign, locale) : "—"}`,
      PW / 2, y + 4, { align: "center" }
    );
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(9);
    pdf.setTextColor(...COLOR.mutedInk);
    pdf.text(locale === "fr" ? "Soleil  ·  Lune  ·  Ascendant" : "Sun  ·  Moon  ·  Ascendant", PW / 2, y + 11, { align: "center" });

    // Cover footer with pull quote
    pdf.setDrawColor(...COLOR.hairline);
    pdf.setLineWidth(0.3);
    pdf.line(MX, PH - 32, PW - MX, PH - 32);
    pdf.setFont("times", "italic");
    pdf.setFontSize(10.5);
    pdf.setTextColor(...COLOR.rose);
    pdf.text("« Le sage domine les étoiles, les étoiles ne dominent pas le sage. »", PW / 2, PH - 22, { align: "center", maxWidth: CONTENT_W });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...COLOR.mutedInk);
    pdf.text("Marsile Ficin · 1486", PW / 2, PH - 16, { align: "center" });

    // ═══ PAGE — PORTRAIT COSMIQUE ═══════════════════════════════════
    pdf.addPage();
    paintPage("content");
    drawFooter();
    y = TOP;

    writeSectionTitle(
      locale === "fr" ? "Portrait cosmique" : "Cosmic portrait",
      locale === "fr" ? "01 · Les trois piliers" : "01 · The three pillars"
    );

    const sun = chart.planets[0];
    const moon = chart.planets[1];

    // Sun
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...COLOR.lavender);
    ensureSpace(8);
    pdf.text(locale === "fr" ? "Soleil" : "Sun", MX, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...COLOR.mutedInk);
    pdf.text(`${translateSign(sun.sign, locale)} ${sun.degree}°${typeof sun.house === "number" ? ` · Maison ${sun.house}` : ""}`, MX + 22, y);
    y += 6;
    writeParagraph(
      locale === "fr"
        ? genderize(getCosmicPortraitSun(sun.sign, locale), form.genre)
        : getCosmicPortraitSun(sun.sign, locale)
    );

    // Moon
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...COLOR.lavender);
    ensureSpace(8);
    pdf.text(locale === "fr" ? "Lune" : "Moon", MX, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...COLOR.mutedInk);
    pdf.text(`${translateSign(moon.sign, locale)} ${moon.degree}°${typeof moon.house === "number" ? ` · Maison ${moon.house}` : ""}`, MX + 22, y);
    y += 6;
    writeParagraph(
      locale === "fr"
        ? genderize(getCosmicPortraitMoon(moon.sign, locale), form.genre)
        : getCosmicPortraitMoon(moon.sign, locale)
    );

    // Ascendant
    if (chart.ascendant) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(...COLOR.lavender);
      ensureSpace(8);
      pdf.text("Ascendant", MX, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...COLOR.mutedInk);
      pdf.text(`${translateSign(chart.ascendant.sign, locale)} ${chart.ascendant.degree}°`, MX + 28, y);
      y += 6;
      writeParagraph(
        locale === "fr"
          ? genderize(getCosmicPortraitAsc(chart.ascendant.sign, locale), form.genre)
          : getCosmicPortraitAsc(chart.ascendant.sign, locale)
      );
    }

    // ═══ PAGE — PLANÈTES ════════════════════════════════════════════
    pdf.addPage();
    paintPage("content");
    drawFooter();
    y = TOP;

    writeSectionTitle(
      locale === "fr" ? "Tes planètes" : "Your planets",
      locale === "fr" ? "02 · Les énergies" : "02 · The energies"
    );
    writeParagraph(
      locale === "fr"
        ? "Chaque planète éclaire une facette de toi. Voici leurs positions au moment précis de ta naissance."
        : "Each planet lights up a facet of you. Here are their positions at the precise moment of your birth.",
      { italic: true, muted: true, size: 10 }
    );

    for (const p of chart.planets) {
      writePlanetRow(p.name, translateSign(p.sign, locale), p.degree, p.house);
    }

    // ═══ PAGE — ÉLÉMENTS & MODALITÉS ════════════════════════════════
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
    const elementCounts = { Feu: 0, Terre: 0, Air: 0, Eau: 0 };
    const modalityCounts = { Cardinal: 0, Fixe: 0, Mutable: 0 };
    for (const p of chart.planets) {
      const e = ELEMENT_BY_SIGN[p.sign]; if (e) elementCounts[e]++;
      const m = MODALITY_BY_SIGN[p.sign]; if (m) modalityCounts[m]++;
    }

    pdf.addPage();
    paintPage("content");
    drawFooter();
    y = TOP;

    writeSectionTitle(
      locale === "fr" ? "Éléments & modalités" : "Elements & modalities",
      locale === "fr" ? "03 · L'équilibre" : "03 · The balance"
    );
    writeParagraph(
      locale === "fr"
        ? "L'équilibre des quatre éléments et des trois modalités révèle la dynamique fondamentale de ton thème."
        : "The balance of the four elements and three modalities reveals the fundamental dynamic of your chart.",
      { italic: true, muted: true, size: 10 }
    );

    // Bar chart for elements
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...COLOR.ink);
    pdf.text(locale === "fr" ? "Éléments" : "Elements", MX, y);
    y += 6;
    const total = chart.planets.length;
    const elements: { name: string; count: number; rgb: [number, number, number] }[] = [
      { name: "Feu", count: elementCounts.Feu, rgb: [218, 102, 102] },
      { name: "Terre", count: elementCounts.Terre, rgb: [125, 168, 110] },
      { name: "Air", count: elementCounts.Air, rgb: [110, 158, 200] },
      { name: "Eau", count: elementCounts.Eau, rgb: [148, 122, 184] },
    ];
    for (const el of elements) {
      ensureSpace(8);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(...COLOR.ink);
      pdf.text(el.name, MX, y);
      pdf.setTextColor(...COLOR.mutedInk);
      pdf.text(`${el.count}/${total}`, MX + 26, y);
      // bar
      const barX = MX + 38, barY = y - 3, barW = CONTENT_W - 38, barH = 3;
      pdf.setFillColor(...COLOR.hairline);
      pdf.rect(barX, barY, barW, barH, "F");
      pdf.setFillColor(...el.rgb);
      pdf.rect(barX, barY, barW * (el.count / total), barH, "F");
      y += 7;
    }
    y += 4;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...COLOR.ink);
    pdf.text(locale === "fr" ? "Modalités" : "Modalities", MX, y);
    y += 6;
    const modalities: { name: string; count: number; rgb: [number, number, number] }[] = [
      { name: "Cardinal", count: modalityCounts.Cardinal, rgb: [200, 122, 160] },
      { name: "Fixe", count: modalityCounts.Fixe, rgb: [120, 92, 175] },
      { name: "Mutable", count: modalityCounts.Mutable, rgb: [110, 158, 200] },
    ];
    for (const mod of modalities) {
      ensureSpace(8);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(...COLOR.ink);
      pdf.text(mod.name, MX, y);
      pdf.setTextColor(...COLOR.mutedInk);
      pdf.text(`${mod.count}/${total}`, MX + 26, y);
      const barX = MX + 38, barY = y - 3, barW = CONTENT_W - 38, barH = 3;
      pdf.setFillColor(...COLOR.hairline);
      pdf.rect(barX, barY, barW, barH, "F");
      pdf.setFillColor(...mod.rgb);
      pdf.rect(barX, barY, barW * (mod.count / total), barH, "F");
      y += 7;
    }

    // ═══ PAGE — MAISONS ═════════════════════════════════════════════
    if (chart.ascendant) {
      pdf.addPage();
      paintPage("content");
      drawFooter();
      y = TOP;

      writeSectionTitle(
        locale === "fr" ? "Tes douze maisons" : "Your twelve houses",
        locale === "fr" ? "04 · Les domaines de vie" : "04 · Life domains"
      );
      writeParagraph(
        locale === "fr"
          ? "Les maisons sont les scènes où tes planètes jouent leur partition. Voici les domaines qui appellent ton attention."
          : "Houses are the stages on which your planets perform. Here are the life areas that ask for your attention.",
        { italic: true, muted: true, size: 10 }
      );

      const byHouse = new Map<number, string[]>();
      for (const p of chart.planets) {
        if (typeof p.house === "number") {
          if (!byHouse.has(p.house)) byHouse.set(p.house, []);
          byHouse.get(p.house)!.push(`${p.name} (${translateSign(p.sign, locale)})`);
        }
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
      for (let h = 1; h <= 12; h++) {
        const planets = byHouse.get(h);
        if (!planets || planets.length === 0) continue;
        ensureSpace(13);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(...COLOR.lavender);
        pdf.text(`${locale === "fr" ? "Maison" : "House"} ${h}`, MX, y);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...COLOR.mutedInk);
        pdf.text(houseNames[h], MX + 22, y);
        y += 5;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(...COLOR.ink);
        const lines = pdf.splitTextToSize(planets.join(" · "), CONTENT_W) as string[];
        for (const line of lines) {
          ensureSpace(5);
          pdf.text(line, MX, y);
          y += 5;
        }
        y += 3;
      }
    }

    // ═══ PAGE — ASPECTS ═════════════════════════════════════════════
    if (chart.aspects && chart.aspects.length > 0) {
      pdf.addPage();
      paintPage("content");
      drawFooter();
      y = TOP;

      writeSectionTitle(
        locale === "fr" ? "Tes aspects clés" : "Your key aspects",
        locale === "fr" ? "05 · Les dialogues" : "05 · The dialogues"
      );
      writeParagraph(
        locale === "fr"
          ? "Les aspects sont les dialogues entre tes planètes — ce qui s'allume, ce qui se frotte, ce qui s'apaise. Voici les douze plus marqués de ta carte."
          : "Aspects are the dialogues between your planets — what lights up, what rubs, what soothes. Here are the twelve most pronounced in your chart.",
        { italic: true, muted: true, size: 10 }
      );

      // Legend (small)
      ensureSpace(20);
      const legendItems: { type: string; label: string }[] = [
        { type: "Conjonction", label: locale === "fr" ? "Conjonction" : "Conjunction" },
        { type: "Trigone", label: locale === "fr" ? "Trigone" : "Trine" },
        { type: "Sextile", label: locale === "fr" ? "Sextile" : "Sextile" },
        { type: "Carre", label: locale === "fr" ? "Carré" : "Square" },
        { type: "Opposition", label: locale === "fr" ? "Opposition" : "Opposition" },
      ];
      let lx = MX;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...COLOR.mutedInk);
      for (const item of legendItems) {
        drawAspectGlyph(item.type, lx + 3, y);
        pdf.text(item.label, lx + 7, y + 1);
        lx += 34;
      }
      y += 8;

      for (const a of chart.aspects.slice(0, 12)) {
        ensureSpace(8);
        drawAspectGlyph(a.type, MX + 2.5, y - 1);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10.5);
        pdf.setTextColor(...COLOR.ink);
        pdf.text(`${a.planet1}  —  ${a.planet2}`, MX + 8, y);
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(9);
        pdf.setTextColor(...COLOR.mutedInk);
        const typeLabel = locale === "fr"
          ? (a.type === "Carre" ? "Carré" : a.type)
          : (a.type === "Carre" ? "Square" : a.type === "Conjonction" ? "Conjunction" : a.type === "Trigone" ? "Trine" : a.type);
        pdf.text(`${typeLabel} · ${a.orb}°`, PW - MX, y, { align: "right" });
        y += 6.5;
      }
    }

    // ═══ FINAL PAGE — CLOSING ═══════════════════════════════════════
    pdf.addPage();
    paintPage("content");
    drawFooter();
    y = TOP + 6;

    writeSectionTitle(
      locale === "fr" ? `Un dernier mot, ${form.prenom}` : `A last word, ${form.prenom}`,
      locale === "fr" ? "Fermeture" : "Closing"
    );
    writeParagraph(
      locale === "fr"
        ? "Cette carte est une photographie du ciel au moment précis de ta naissance — un instant unique dans l'histoire du cosmos. Elle ne prédit rien. Elle ne détermine rien. Elle éclaire."
        : "This chart is a photograph of the sky at the precise moment of your birth — a unique instant in the history of the cosmos. It predicts nothing. It determines nothing. It illuminates."
    );
    writeParagraph(
      locale === "fr"
        ? "Les planètes dessinent des potentiels, des invitations, des tensions créatrices. C'est toi qui choisis comment les vivre, les transformer, les transcender."
        : "The planets sketch potentials, invitations, creative tensions. You are the one who chooses how to live them, transform them, transcend them."
    );
    writeParagraph(
      locale === "fr"
        ? `Tu es l'auteur·e de ton histoire — le ciel n'en est que la toile étoilée.`
        : "You are the author of your story — the sky is only its starry canvas."
    );

    y += 8;
    pdf.setDrawColor(...COLOR.rose);
    pdf.setLineWidth(0.4);
    pdf.line(PW / 2 - 14, y, PW / 2 + 14, y);
    y += 8;
    pdf.setFont("times", "italic");
    pdf.setFontSize(11);
    pdf.setTextColor(...COLOR.rose);
    const quoteLines = pdf.splitTextToSize("« Le sage domine les étoiles, les étoiles ne dominent pas le sage. »", CONTENT_W * 0.85) as string[];
    for (const line of quoteLines) {
      ensureSpace(5);
      pdf.text(line, PW / 2, y, { align: "center" });
      y += 5;
    }

    const filename = `ciel-natal-${(form.prenom || "lecture").toLowerCase().replace(/\s+/g, "-")}.pdf`;
    const blob = pdf.output("blob");
    const dataUrl = pdf.output("datauristring");
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
      const label =
        locale === "fr"
          ? `Carte de ${form.prenom || "lecture"} — ${form.jour}/${form.mois}/${form.annee}`
          : `${form.prenom || "Chart"}'s chart — ${form.mois}/${form.jour}/${form.annee}`;

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
  // Full link (with name) — for personal use
  const getShareUrl = (): string => {
    const base = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
    const payload = {
      n: form.prenom, g: form.genre, j: form.jour, m: form.mois, a: form.annee,
      h: form.heure, mn: form.minute, ht: form.hasTime ? 1 : 0,
      l: form.lieu, la: form.latitude, lo: form.longitude, v: form.voice,
    };
    return `${base}?c=${encodeURIComponent(encodeChartParams(payload))}`;
  };

  // Anonymous link — no name, no city name
  const getAnonymousShareUrl = (): string => {
    const base = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
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
          <>
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
                <div className="mt-12">
                  <DailySign />
                </div>
              </div>
            </section>

            {/* ═══ COMMENT ÇA MARCHE ═══ */}
            <section className="max-w-5xl mx-auto px-4 py-20 sm:py-28">
              <div className="text-center mb-12">
                <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)]/70 mb-3">
                  {locale === "fr" ? "Comment ça marche" : "How it works"}
                </p>
                <h2 className="font-cinzel text-3xl sm:text-4xl text-[var(--color-text-primary)]">
                  {locale === "fr" ? "Trois minutes, et le ciel te parle" : "Three minutes, and the sky speaks"}
                </h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  {
                    n: "1",
                    fr: { title: "Tes données de naissance", desc: "Date, heure, lieu. Plus l'heure est précise, plus la lecture est juste." },
                    en: { title: "Your birth details", desc: "Date, time, place. The more precise the time, the truer the reading." },
                  },
                  {
                    n: "2",
                    fr: { title: "Calcul instantané", desc: "Positions planétaires, ascendant, maisons, aspects — tout est calculé directement dans ton navigateur." },
                    en: { title: "Instant calculation", desc: "Planets, ascendant, houses, aspects — everything computed right in your browser." },
                  },
                  {
                    n: "3",
                    fr: { title: "Lecture personnelle", desc: "Un portrait écrit pour toi, à ton rythme. Et un PDF si tu veux le garder." },
                    en: { title: "A personal reading", desc: "A portrait written for you, at your own pace. And a PDF if you want to keep it." },
                  },
                ].map((step) => (
                  <div key={step.n} className="glass p-6 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-accent-lavender)]/15 text-[var(--color-accent-lavender)] font-cinzel text-xl mb-4">
                      {step.n}
                    </div>
                    <h3 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-2">
                      {locale === "fr" ? step.fr.title : step.en.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      {locale === "fr" ? step.fr.desc : step.en.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* ═══ CE QUE TU OBTIENS ═══ */}
            <section className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
              <div className="text-center mb-10">
                <h2 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-3">
                  {locale === "fr" ? "Ce que tu obtiens" : "What you get"}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] max-w-xl mx-auto">
                  {locale === "fr"
                    ? "Le calcul de carte est gratuit. Sans compte, sans email, sans engagement."
                    : "The chart calculation is free. No account, no email, no strings attached."}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="glass p-5">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)]/70 mb-2">
                    {locale === "fr" ? "Gratuit · sans compte" : "Free · no account"}
                  </p>
                  <ul className="text-sm text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                    <li>✦ {locale === "fr" ? "Ta carte natale complète (roue zodiacale)" : "Your full birth chart (zodiac wheel)"}</li>
                    <li>✦ {locale === "fr" ? "Portrait Soleil, Lune, Ascendant" : "Sun, Moon and Ascendant portrait"}</li>
                    <li>✦ {locale === "fr" ? "Maisons, aspects, éléments" : "Houses, aspects, elements"}</li>
                    <li>✦ {locale === "fr" ? "Aperçu des transits du jour" : "Today's transits preview"}</li>
                  </ul>
                </div>
                <div className="glass p-5 border border-[var(--color-accent-lavender)]/30">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-accent-lavender)] mb-2">
                    {locale === "fr" ? "Premium · 9,99 $ une fois" : "Premium · $9.99 one-time"}
                  </p>
                  <ul className="text-sm text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
                    <li>✦ {locale === "fr" ? "Interprétations complètes et détaillées" : "Full detailed interpretations"}</li>
                    <li>✦ {locale === "fr" ? "Chat avec un astrologue IA bienveillant" : "Chat with a caring AI astrologer"}</li>
                    <li>✦ {locale === "fr" ? "Synastrie" : "Synastry"}</li>
                    <li>✦ {locale === "fr" ? "Export PDF, sauvegarde et email" : "PDF export, save and email"}</li>
                  </ul>
                  <p className="mt-3 text-xs text-[var(--color-text-secondary)]/70 italic">
                    {locale === "fr" ? "Paiement unique. Pas d'abonnement. À vie." : "One-time payment. No subscription. Forever."}
                  </p>
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
                    className={`btn-primary px-6 py-2.5 rounded-xl text-sm ${!canAdvance() ? "opacity-50" : ""}`}>{t("form.next")}</button>
                ) : (
                  <button onClick={() => { if (canAdvance()) { doCalculation(); } else { setShowValidation(true); } }}
                    className={`btn-primary px-8 py-3 rounded-xl font-bold text-sm glow-lavender ${!canAdvance() ? "opacity-50" : ""}`}>{t("form.calculate")}</button>
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
              <h1 className="font-cinzel text-3xl sm:text-4xl text-[var(--color-text-primary)] mb-2">
                {t("results.skyOf")} <span className="text-[var(--color-accent-lavender)]">{form.prenom}</span>
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)] font-mono">
                {form.jour} {MONTHS[form.mois - 1]} {form.annee}
                {form.hasTime && ` — ${String(form.heure).padStart(2, "0")}h${String(form.minute).padStart(2, "0")}`}
                {" — "}{form.lieu}
              </p>
            </div>

            {/* ── Intro Narrative ── */}
            {chart && (
              <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-8 animate-on-scroll">
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
              <div className="tab-nav flex overflow-x-auto max-w-3xl mx-auto">
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
              <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-3">
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
                      { id: "sun", label: locale === "fr" ? "Soleil" : "Sun", sub: t("results.sunLabel"), data: chart.planets[0], icon: <SunIcon size={28} color="#fbbf24" glow />, color: "from-amber-500/25 to-orange-500/10", activeColor: "from-amber-500/35 to-orange-500/20", border: "border-amber-400/20", activeBorder: "border-amber-400/50", ring: "ring-amber-400/30" },
                      { id: "moon", label: locale === "fr" ? "Lune" : "Moon", sub: t("results.moonLabel"), data: chart.planets[1], icon: <MoonIcon size={28} color="#93c5fd" glow />, color: "from-blue-400/20 to-indigo-500/10", activeColor: "from-blue-400/30 to-indigo-500/20", border: "border-blue-300/20", activeBorder: "border-blue-300/50", ring: "ring-blue-400/30" },
                      ...(chart.ascendant ? [{ id: "asc", label: "Ascendant", sub: t("results.ascLabel"), data: chart.ascendant, icon: <AscendantIcon size={28} color="#c084fc" glow />, color: "from-purple-500/20 to-fuchsia-500/10", activeColor: "from-purple-500/30 to-fuchsia-500/20", border: "border-purple-400/20", activeBorder: "border-purple-400/50", ring: "ring-purple-400/30" }] : []),
                    ].map((item) => {
                      const isActive = activeBigThree === item.data.name;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveBigThree(isActive ? null : item.data.name);
                            if (!isActive) setTimeout(() => bigThreeContentRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
                          }}
                          className={`relative rounded-2xl bg-gradient-to-br ${isActive ? item.activeColor : item.color} border ${isActive ? item.activeBorder : item.border} backdrop-blur-md p-5 text-left transition-all duration-300 hover:scale-[1.02] cursor-pointer ${isActive ? `ring-2 ${item.ring} shadow-lg shadow-white/5` : "hover:shadow-lg hover:shadow-white/5"}`}
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
                              </span>
                              <span className="text-base text-[var(--color-text-secondary)] ml-2">{translateSign(planet.sign, locale)}</span>
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
                <p className="text-base text-[var(--color-text-secondary)] mb-5">{t("results.aspectDesc")}</p>
                {chart.aspects.length > 0 ? (
                  <div className="space-y-2">
                    {chart.aspects.slice(0, 12).map((aspect, i) => {
                      const interp = getAspectInterp(aspect.type, aspect.planet1, aspect.planet2);
                      const color = ASPECT_COLORS[aspect.type] || "#c9a0ff";
                      const symbol = ASPECT_SYMBOLS[aspect.type] || "·";
                      const isOpen = expandedAspects.has(i);
                      return (
                        <div key={i} className="glass overflow-hidden">
                          <button className="w-full p-4 text-left btn-hover group" onClick={() => toggleAspect(i)}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-base">
                                <span className="text-[var(--color-accent-lavender)]" style={{ fontFamily: "serif" }}>{aspect.symbol1}</span>
                                <span className="text-[var(--color-text-primary)]">{aspect.planet1}</span>
                                <span style={{ color }} className="text-xl mx-0.5">{symbol}</span>
                                <span className="text-[var(--color-text-primary)]">{aspect.planet2}</span>
                                <span className="text-[var(--color-accent-lavender)]" style={{ fontFamily: "serif" }}>{aspect.symbol2}</span>
                              </div>
                              <div className="flex items-center gap-2">
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
                        <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                          <span className="w-3 h-3 border border-[var(--color-accent-lavender)]/30 border-t-[var(--color-accent-lavender)] rounded-full animate-spin" />
                          {locale === "fr" ? "Lecture du ciel du jour…" : "Reading today's sky…"}
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
                    currentLabel={form.prenom}
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

