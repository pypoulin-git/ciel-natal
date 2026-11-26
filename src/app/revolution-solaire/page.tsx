"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import PremiumGate from "@/components/PremiumGate";
import YearRing from "@/components/solar/YearRing";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";
import { SIGN_SYMBOLS, SIGNS, translatePlanet, translateSign } from "@/lib/astro";
import { searchCities, type CityResult } from "@/lib/citySearch";
import { formatInZone } from "@/lib/birthTime";
import { computeSolarReturn, type BirthInput, type SolarReturn, type YearEvent } from "@/lib/solarReturn";
import { ANGLE_LABEL, ASC_YEAR, HOUSE_THEME, PLANET_YEAR } from "@/lib/solarReturnTexts";

type Locale = "fr" | "en";

interface FormState {
  prenom: string;
  jour: number;
  mois: number;
  annee: number;
  heure: string; // "HH:MM"
  hasTime: boolean;
  lieu: string;
  latitude: number | null;
  longitude: number | null;
  ailleurs: boolean;
  lieu2: string;
  latitude2: number | null;
  longitude2: number | null;
}

const EMPTY: FormState = {
  prenom: "",
  jour: 15,
  mois: 6,
  annee: 1990,
  heure: "12:00",
  hasTime: true,
  lieu: "",
  latitude: null,
  longitude: null,
  ailleurs: false,
  lieu2: "",
  latitude2: null,
  longitude2: null,
};

interface SavedChart {
  id: string;
  label: string | null;
  form_data: Record<string, unknown>;
}

const PLANET_GLYPH: Record<string, string> = {
  Soleil: "☉", Lune: "☽", Mercure: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃",
  Saturne: "♄", Uranus: "♅", Neptune: "♆", Pluton: "⯓",
};

function formFromData(f: Record<string, unknown>): FormState | null {
  const n = (v: unknown) => (v == null || v === "" ? NaN : Number(v));
  const jour = n(f.jour ?? f.j);
  const mois = n(f.mois ?? f.m);
  const annee = n(f.annee ?? f.a);
  const lat = n(f.latitude ?? f.la);
  const lon = n(f.longitude ?? f.lo);
  if ([jour, mois, annee, lat, lon].some((x) => !Number.isFinite(x))) return null;
  const h = Number.isFinite(n(f.heure ?? f.h)) ? n(f.heure ?? f.h) : 12;
  const mn = Number.isFinite(n(f.minute ?? f.mn)) ? n(f.minute ?? f.mn) : 0;
  const ht = f.hasTime === false || f.ht === 0 ? false : true;
  const prenom = typeof (f.prenom ?? f.n) === "string" ? String(f.prenom ?? f.n) : "";
  const lieu = typeof (f.lieu ?? f.l) === "string" ? String(f.lieu ?? f.l) : "";
  return {
    ...EMPTY,
    prenom,
    jour,
    mois,
    annee,
    heure: `${String(h).padStart(2, "0")}:${String(mn).padStart(2, "0")}`,
    hasTime: ht,
    lieu: lieu || "—",
    latitude: lat,
    longitude: lon,
  };
}

function toBirth(f: FormState): BirthInput {
  const [h, m] = f.heure.split(":").map((x) => parseInt(x, 10));
  return {
    year: f.annee,
    month: f.mois,
    day: f.jour,
    hour: Number.isFinite(h) ? h : 12,
    minute: Number.isFinite(m) ? m : 0,
    hasTime: f.hasTime,
    latitude: f.latitude ?? 0,
    longitude: f.longitude ?? 0,
  };
}

/* ───────────────────────── City field ───────────────────────── */

function CityField({
  id,
  label,
  value,
  onText,
  onPick,
  locale,
}: {
  id: string;
  label: string;
  value: string;
  onText: (v: string) => void;
  onPick: (c: CityResult) => void;
  locale: Locale;
}) {
  const [results, setResults] = useState<CityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = (q: string) => {
    onText(q);
    if (timer.current) clearTimeout(timer.current);
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        setResults(await searchCities(q));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="sr-label">
        {label}
      </label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        value={value}
        onChange={(e) => search(e.target.value)}
        placeholder={locale === "fr" ? "Cherche une ville…" : "Search a city…"}
        className="sr-input"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={results.length > 0}
        // Only point at the list while it exists: a dangling id fails axe.
        aria-controls={results.length > 0 ? `${id}-list` : undefined}
      />
      {loading && <span className="absolute right-1 top-[34px] sr-spinner animate-spin" aria-hidden />}
      {results.length > 0 && (
        <ul id={`${id}-list`} role="listbox" className="absolute z-30 left-0 right-0 mt-2 sr-pop">
          {results.map((c, i) => (
            <li key={`${c.lat}-${c.lon}-${i}`}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => {
                  onPick(c);
                  setResults([]);
                }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-[var(--sr-tint)] focus:bg-[var(--sr-tint)] outline-none"
              >
                {c.display}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ───────────────────────── Page ───────────────────────── */

export default function RevolutionSolairePage() {
  const { t, locale: rawLocale } = useLocale();
  const locale: Locale = rawLocale === "en" ? "en" : "fr";
  const tr = useCallback((fr: string, en: string) => (locale === "fr" ? fr : en), [locale]);
  const { user, isPremium, getAccessToken } = useAuth();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [offset, setOffset] = useState(0);
  const [result, setResult] = useState<SolarReturn | null>(null);
  const [saved, setSaved] = useState<SavedChart[]>([]);
  const [now] = useState(() => new Date());

  const [reading, setReading] = useState<string | null>(null);
  const [readingState, setReadingState] = useState<"idle" | "loading" | "error">("idle");

  const compute = useCallback(
    (f: FormState, off: number) => {
      if (f.latitude == null || f.longitude == null) return;
      const place =
        f.ailleurs && f.latitude2 != null && f.longitude2 != null
          ? { latitude: f.latitude2, longitude: f.longitude2, label: f.lieu2 }
          : { latitude: f.latitude, longitude: f.longitude, label: f.lieu };
      setResult(computeSolarReturn(toBirth(f), place, now, off));
      setReading(null);
      setReadingState("idle");
    },
    [now],
  );

  // ?c= — arriving from a natal chart: same payload as the share links.
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("c");
    if (!c) return;
    try {
      const data = JSON.parse(atob(decodeURIComponent(c))) as Record<string, unknown>;
      const f = formFromData(data);
      if (f) {
        setForm(f);
        compute(f, 0);
      }
    } catch {
      /* bad link: fall back to the form */
    }
  }, [compute]);

  // Signed in: offer the saved charts as one-tap shortcuts.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const token = await getAccessToken();
      if (!token) return;
      const res = await fetch(`/api/charts?userId=${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = (await res.json()) as { charts?: SavedChart[] };
      if (!cancelled) setSaved((data.charts ?? []).filter((c) => formFromData(c.form_data)).slice(0, 6));
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, getAccessToken]);

  const fetchReading = async () => {
    if (!result) return;
    setReadingState("loading");
    try {
      const token = await getAccessToken();
      const b = toBirth(form);
      const res = await fetch("/api/solar-return", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          birth: b,
          place: result.place,
          offset,
          prenom: form.prenom,
          locale,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { text?: string };
      if (!res.ok || !data.text) throw new Error(String(res.status));
      setReading(data.text);
      setReadingState("idle");
    } catch {
      setReadingState("error");
    }
  };

  const canCompute = form.latitude != null && form.longitude != null && (!form.ailleurs || form.latitude2 != null);

  return (
    <main className="sr-page relative min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-24">
        {!result ? (
          <Intro
            locale={locale}
            tr={tr}
            t={t}
            form={form}
            setForm={setForm}
            saved={saved}
            canCompute={canCompute}
            onCompute={() => compute(form, offset)}
            onPickSaved={(c) => {
              const f = formFromData(c.form_data);
              if (f) {
                setForm(f);
                compute(f, offset);
              }
            }}
          />
        ) : (
          <Results
            sr={result}
            locale={locale}
            tr={tr}
            now={now}
            offset={offset}
            prenom={form.prenom}
            isPremium={isPremium}
            signedIn={!!user}
            reading={reading}
            readingState={readingState}
            onReading={fetchReading}
            onOffset={(o) => {
              setOffset(o);
              compute(form, o);
            }}
            onEdit={() => setResult(null)}
          />
        )}
      </div>
      <SiteFooter />
    </main>
  );
}

/* ───────────────────────── Intro / form ───────────────────────── */

function Intro({
  locale,
  tr,
  t,
  form,
  setForm,
  saved,
  canCompute,
  onCompute,
  onPickSaved,
}: {
  locale: Locale;
  tr: (fr: string, en: string) => string;
  t: (k: string) => string;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  saved: SavedChart[];
  canCompute: boolean;
  onCompute: () => void;
  onPickSaved: (c: SavedChart) => void;
}) {
  const thisYear = new Date().getFullYear();
  return (
    <>
      <header className="text-center mb-12 sm:mb-16">
        <p className="sr-eyebrow">{tr("Révolution solaire", "Solar return")}</p>
        <h1 className="font-cinzel text-4xl sm:text-6xl leading-[1.05] text-[var(--color-text-primary)] mt-4 text-balance">
          {tr("Ton année, d'un anniversaire à l'autre", "Your year, from one birthday to the next")}
        </h1>
        <p className="mt-6 text-base sm:text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed text-pretty">
          {tr(
            "Chaque année, le Soleil revient exactement là où il était à ta naissance. Le ciel de cet instant donne le ton des douze mois qui suivent.",
            "Every year the Sun returns to the exact spot it held when you were born. The sky at that moment sets the tone for the twelve months ahead.",
          )}
        </p>
      </header>

      {saved.length > 0 && (
        <section className="mb-10" aria-labelledby="sr-saved">
          <h2 id="sr-saved" className="sr-label text-center mb-3">
            {tr("Partir d'une carte enregistrée", "Start from a saved chart")}
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {saved.map((c) => (
              <button key={c.id} type="button" onClick={() => onPickSaved(c)} className="sr-chip">
                {c.label || String(c.form_data.prenom || tr("Ma carte", "My chart"))}
              </button>
            ))}
          </div>
        </section>
      )}

      <form
        className="sr-card p-6 sm:p-10 space-y-7"
        onSubmit={(e) => {
          e.preventDefault();
          if (canCompute) onCompute();
        }}
      >
        <div>
          <label htmlFor="sr-prenom" className="sr-label">
            {tr("Prénom (facultatif)", "First name (optional)")}
          </label>
          <input
            id="sr-prenom"
            className="sr-input"
            value={form.prenom}
            maxLength={40}
            onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
          />
        </div>

        <fieldset>
          <legend className="sr-label">{tr("Date de naissance", "Date of birth")}</legend>
          <div className="grid grid-cols-[1fr_1.6fr_1.2fr] gap-3">
            <select
              aria-label={tr("Jour", "Day")}
              className="sr-input"
              value={form.jour}
              onChange={(e) => setForm((f) => ({ ...f, jour: +e.target.value }))}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              aria-label={tr("Mois", "Month")}
              className="sr-input"
              value={form.mois}
              onChange={(e) => setForm((f) => ({ ...f, mois: +e.target.value }))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i + 1}>
                  {t(`months.${i + 1}`)}
                </option>
              ))}
            </select>
            <select
              aria-label={tr("Année", "Year")}
              className="sr-input"
              value={form.annee}
              onChange={(e) => setForm((f) => ({ ...f, annee: +e.target.value }))}
            >
              {Array.from({ length: thisYear - 1900 + 1 }, (_, i) => thisYear - i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        <div>
          <label htmlFor="sr-heure" className="sr-label">
            {tr("Heure de naissance", "Time of birth")}
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <input
              id="sr-heure"
              type="time"
              className="sr-input max-w-[10rem]"
              value={form.heure}
              disabled={!form.hasTime}
              onChange={(e) => setForm((f) => ({ ...f, heure: e.target.value }))}
            />
            <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] cursor-pointer min-h-11">
              <input
                type="checkbox"
                className="accent-[var(--sr-accent)] w-4 h-4"
                checked={!form.hasTime}
                onChange={(e) => setForm((f) => ({ ...f, hasTime: !e.target.checked }))}
              />
              {tr("Je ne la connais pas", "I don't know it")}
            </label>
          </div>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            {form.hasTime
              ? tr("L'heure de l'horloge du lieu de naissance. On s'occupe du fuseau et de l'heure avancée.", "The clock time where you were born. We handle time zones and daylight saving.")
              : tr("Sans heure, l'instant du retour reste flou à ±12 h : pas d'Ascendant ni de maisons pour l'année.", "Without a time, the return is only known to ±12 h: no Ascendant or houses for the year.")}
          </p>
        </div>

        <CityField
          id="sr-lieu"
          label={tr("Lieu de naissance", "Place of birth")}
          value={form.lieu}
          locale={locale}
          onText={(v) => setForm((f) => ({ ...f, lieu: v, latitude: null, longitude: null }))}
          onPick={(c) => setForm((f) => ({ ...f, lieu: c.display, latitude: c.lat, longitude: c.lon }))}
        />

        <div className="space-y-4">
          <label className="flex items-start gap-3 text-sm text-[var(--color-text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              className="accent-[var(--sr-accent)] w-4 h-4 mt-0.5"
              checked={form.ailleurs}
              onChange={(e) => setForm((f) => ({ ...f, ailleurs: e.target.checked }))}
            />
            <span>
              {tr("Je passe mon anniversaire ailleurs", "I'm spending my birthday somewhere else")}
              <span className="block text-xs text-[var(--color-text-muted)] mt-0.5">
                {tr(
                  "Les maisons de l'année se calculent pour l'endroit où tu te trouves au moment du retour.",
                  "The year's houses are cast for wherever you are at the moment of the return.",
                )}
              </span>
            </span>
          </label>
          {form.ailleurs && (
            <CityField
              id="sr-lieu2"
              label={tr("Où seras-tu ?", "Where will you be?")}
              value={form.lieu2}
              locale={locale}
              onText={(v) => setForm((f) => ({ ...f, lieu2: v, latitude2: null, longitude2: null }))}
              onPick={(c) => setForm((f) => ({ ...f, lieu2: c.display, latitude2: c.lat, longitude2: c.lon }))}
            />
          )}
        </div>

        <button type="submit" disabled={!canCompute} className="sr-cta w-full">
          {tr("Voir mon année", "See my year")}
        </button>
      </form>
    </>
  );
}

/* ───────────────────────── Results ───────────────────────── */

function Results({
  sr,
  locale,
  tr,
  now,
  offset,
  prenom,
  isPremium,
  signedIn,
  reading,
  readingState,
  onReading,
  onOffset,
  onEdit,
}: {
  sr: SolarReturn;
  locale: Locale;
  tr: (fr: string, en: string) => string;
  now: Date;
  offset: number;
  prenom: string;
  isPremium: boolean;
  signedIn: boolean;
  reading: string | null;
  readingState: "idle" | "loading" | "error";
  onReading: () => void;
  onOffset: (o: number) => void;
  onEdit: () => void;
}) {
  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { day: "numeric", month: "long", year: "numeric" }),
    [locale],
  );
  const shortFmt = useMemo(
    () => new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { day: "numeric", month: "long" }),
    [locale],
  );
  const DAY = 86400000;
  const totalDays = Math.round((sr.end.getTime() - sr.start.getTime()) / DAY);
  const inside = now >= sr.start && now < sr.end;
  const dayN = Math.floor((now.getTime() - sr.start.getTime()) / DAY) + 1;
  const untilStart = Math.ceil((sr.start.getTime() - now.getTime()) / DAY);
  const untilEnd = Math.ceil((sr.end.getTime() - now.getTime()) / DAY);
  const sign = (s: string) => translateSign(s, locale);
  const glyph = (s: string) => SIGN_SYMBOLS[SIGNS.indexOf(s)] ?? "";
  const planet = (p: string) => translatePlanet(p === "Venus" ? "Vénus" : p, locale);
  const yearsLabel = `${sr.start.getUTCFullYear()}–${sr.end.getUTCFullYear()}`;

  const loaded = [...sr.houses].filter((h) => h.weight > 0).sort((a, b) => b.weight - a.weight);
  const maxWeight = loaded[0]?.weight ?? 1;
  const freeEvents = 2;

  return (
    <article>
      {/* ── Hero ── */}
      <header className="text-center">
        <p className="sr-eyebrow">
          {prenom ? tr(`L'année solaire de ${prenom}`, `${prenom}'s solar year`) : tr("Ton année solaire", "Your solar year")}
        </p>
        <h1 className="font-cinzel text-5xl sm:text-7xl text-[var(--color-text-primary)] mt-3 tabular-nums">{yearsLabel}</h1>
        <p className="mt-4 text-[var(--color-text-secondary)]">
          {tr("Du", "From")} {dateFmt.format(sr.start)} {tr("au", "to")} {dateFmt.format(sr.end)}
        </p>

        <div className="mt-6 inline-flex rounded-full p-1 sr-seg" role="group" aria-label={tr("Choix de l'année", "Pick the year")}>
          {[0, 1].map((o) => (
            <button
              key={o}
              type="button"
              aria-pressed={offset === o}
              onClick={() => onOffset(o)}
              className={`px-4 min-h-11 rounded-full text-sm transition ${offset === o ? "sr-seg-on" : "text-[var(--color-text-secondary)]"}`}
            >
              {o === 0 ? tr("Année en cours", "Current year") : tr("Année prochaine", "Next year")}
            </button>
          ))}
        </div>

        <div className="relative mt-10 flex justify-center">
          <YearRing
            start={sr.start}
            end={sr.end}
            now={now}
            events={sr.events}
            locale={locale}
            planetGlyph={(p) => PLANET_GLYPH[p] ?? ""}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {inside ? (
              <>
                <span className="font-cinzel text-5xl sm:text-6xl text-[var(--color-text-primary)] tabular-nums">{dayN}</span>
                <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)] mt-1">
                  {tr(`jour sur ${totalDays}`, `day of ${totalDays}`)}
                </span>
                <span className="text-xs text-[var(--color-text-secondary)] mt-2 tabular-nums">
                  {tr(`encore ${untilEnd} j`, `${untilEnd} d to go`)}
                </span>
              </>
            ) : (
              <>
                <span className="font-cinzel text-5xl text-[var(--color-text-primary)] tabular-nums">{untilStart}</span>
                <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)] mt-1">
                  {tr("jours avant le début", "days to go")}
                </span>
              </>
            )}
          </div>
        </div>
        <p className="mt-4 text-xs text-[var(--color-text-muted)]">
          {sr.precise
            ? `${tr("Retour exact :", "Exact return:")} ${formatInZone(sr.start, sr.placeTimeZone, locale)}`
            : `${tr("Retour vers le", "Return around")} ${dateFmt.format(sr.start)} ${tr("(à ±12 h près)", "(±12 h)")}`}
          {sr.place.label ? ` · ${sr.place.label}` : ""}
        </p>
        <Legend tr={tr} />
      </header>

      {!sr.precise && (
        <aside className="sr-note mt-12">
          {tr(
            "Sans heure de naissance, on ne peut pas situer l'Ascendant ni les maisons de ton année. Voici ce qui reste sûr : les dates, les signes et le calendrier du ciel. Ajoute ton heure pour la lecture complète.",
            "Without a birth time we can't place the year's Ascendant or houses. What stays solid: the dates, the signs and the sky calendar. Add your time for the full reading.",
          )}{" "}
          <button type="button" onClick={onEdit} className="underline underline-offset-4">
            {tr("Ajouter mon heure", "Add my time")}
          </button>
        </aside>
      )}

      {/* ── Opening: Ascendant & MC ── */}
      {sr.ascendant && (
        <Section n="01" title={tr("L'ouverture", "The opening")}>
          <div className="grid sm:grid-cols-[auto_1fr] gap-6 sm:gap-10 items-start">
            <div className="sr-glyph" aria-hidden>
              {glyph(sr.ascendant.sign)}
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-cinzel text-[var(--color-text-primary)]">
                {tr("Ascendant de l'année :", "Ascendant of the year:")} {sign(sr.ascendant.sign)}
              </h3>
              <p className="mt-3 text-lg leading-relaxed text-[var(--color-text-secondary)]">{ASC_YEAR[sr.ascendant.sign]?.[locale]}</p>
              {sr.midheaven && (
                <p className="mt-4 text-sm text-[var(--color-text-muted)]">
                  {tr("Milieu du Ciel en", "Midheaven in")} {sign(sr.midheaven.sign)}
                  {sr.ascInNatalHouse
                    ? tr(
                        ` · l'Ascendant de l'année tombe dans ta maison ${sr.ascInNatalHouse} natale (${HOUSE_THEME[sr.ascInNatalHouse].label.fr.toLowerCase()}).`,
                        ` · the year's Ascendant falls in your natal house ${sr.ascInNatalHouse} (${HOUSE_THEME[sr.ascInNatalHouse].label.en.toLowerCase()}).`,
                      )
                    : ""}
                </p>
              )}
            </div>
          </div>
          {sr.angular.length > 0 && (
            <ul className="mt-8 space-y-2">
              {sr.angular.slice(0, 3).map((a) => (
                <li key={`${a.planet}-${a.angle}`} className="flex gap-3 text-[var(--color-text-secondary)]">
                  <span className="text-[var(--sr-accent)] w-5 text-center" aria-hidden>
                    {PLANET_GLYPH[a.planet]}
                  </span>
                  <span>
                    <strong className="text-[var(--color-text-primary)] font-medium">
                      {planet(a.planet)} {ANGLE_LABEL[a.angle][locale]}
                    </strong>{" "}
                    {PLANET_YEAR[a.planet]?.[locale]}.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {/* ── Heart: Sun house ── */}
      {sr.sunHouse && (
        <Section n="02" title={tr("Le cœur de l'année", "The heart of the year")}>
          <p className="sr-big">
            {tr("Maison", "House")} {sr.sunHouse} · {HOUSE_THEME[sr.sunHouse].label[locale]}
          </p>
          <p className="mt-3 text-lg leading-relaxed text-[var(--color-text-secondary)]">{HOUSE_THEME[sr.sunHouse].year[locale]}</p>
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">
            {tr("Lune de l'année en", "Moon of the year in")} {sign(sr.moon.sign)}
            {sr.moon.house ? tr(`, maison ${sr.moon.house} : ton climat intérieur passe par là.`, `, house ${sr.moon.house}: your inner weather runs through here.`) : "."}
          </p>
        </Section>
      )}

      {/* ── Where it happens: houses ── */}
      {sr.precise && (
        <Section n="03" title={tr("Où se joue ton année", "Where your year happens")}>
          <ol className="grid grid-cols-2 sm:grid-cols-3 gap-px sr-grid" aria-label={tr("Les douze maisons de l'année", "The twelve houses of the year")}>
            {sr.houses.map((h) => {
              const strength = h.weight / maxWeight;
              const isSun = h.house === sr.sunHouse;
              return (
                <li key={h.house} className={`sr-cell ${isSun ? "sr-cell-sun" : ""}`} style={{ ["--w" as string]: strength.toFixed(2) }}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-cinzel text-xl text-[var(--color-text-primary)] tabular-nums">{h.house}</span>
                    <span className="text-[var(--sr-accent)] tracking-wider text-sm" aria-label={h.planets.map(planet).join(", ")}>
                      {h.planets.map((p) => PLANET_GLYPH[p]).join(" ")}
                    </span>
                  </div>
                  <span className="block mt-1 text-xs text-[var(--color-text-secondary)]">{HOUSE_THEME[h.house].label[locale]}</span>
                  <span className="sr-bar" aria-hidden />
                </li>
              );
            })}
          </ol>
        </Section>
      )}

      {/* ── Lord of the year (profection) ── */}
      {sr.profection && (
        <Section n="04" title={tr("Le maître de l'année", "The lord of the year")}>
          <PremiumGate>
            <p className="sr-big">
              {PLANET_GLYPH[sr.profection.lord]} {planet(sr.profection.lord)}
            </p>
            <p className="mt-3 text-lg leading-relaxed text-[var(--color-text-secondary)]">
              {tr(
                `À ${sr.age} ans, l'année active ta maison ${sr.profection.house} natale (${HOUSE_THEME[sr.profection.house].label.fr.toLowerCase()}), en ${sign(sr.profection.sign)}. Sa planète maîtresse, ${planet(sr.profection.lord)}, devient le fil conducteur des douze mois.`,
                `At ${sr.age}, the year activates your natal house ${sr.profection.house} (${HOUSE_THEME[sr.profection.house].label.en.toLowerCase()}), in ${sign(sr.profection.sign)}. Its ruling planet, ${planet(sr.profection.lord)}, becomes the thread running through the twelve months.`,
              )}
              {sr.profection.lordHouse
                ? tr(
                    ` Cette année, elle se tient en maison ${sr.profection.lordHouse} : ${HOUSE_THEME[sr.profection.lordHouse].year.fr.charAt(0).toLowerCase()}${HOUSE_THEME[sr.profection.lordHouse].year.fr.slice(1)}`,
                    ` This year it sits in house ${sr.profection.lordHouse}: ${HOUSE_THEME[sr.profection.lordHouse].year.en.charAt(0).toLowerCase()}${HOUSE_THEME[sr.profection.lordHouse].year.en.slice(1)}`,
                  )
                : ""}
            </p>
          </PremiumGate>
        </Section>
      )}

      {/* ── Calendar ── */}
      <Section n={sr.precise ? "05" : "01"} title={tr("Le calendrier de ton année", "Your year's calendar")}>
        <Timeline events={sr.events.slice(0, freeEvents)} now={now} locale={locale} tr={tr} shortFmt={shortFmt} sign={sign} planet={planet} />
        {sr.events.length > freeEvents && (
          <PremiumGate>
            <Timeline events={sr.events.slice(freeEvents)} now={now} locale={locale} tr={tr} shortFmt={shortFmt} sign={sign} planet={planet} />
          </PremiumGate>
        )}
      </Section>

      {/* ── AI reading ── */}
      <Section n={sr.precise ? "06" : "02"} title={tr("La lecture de ton année", "The reading of your year")}>
        {isPremium ? (
          reading ? (
            <Reading text={reading} />
          ) : (
            <div className="text-center py-4">
              <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
                {tr(
                  "Une lecture écrite pour toi : le ton de l'année, là où ça se passe, et ton année saison par saison.",
                  "A reading written for you: the tone of the year, where it happens, and your year season by season.",
                )}
              </p>
              <button type="button" onClick={onReading} disabled={readingState === "loading"} className="sr-cta">
                {readingState === "loading" ? tr("Écriture en cours…", "Writing…") : tr("Lire mon année", "Read my year")}
              </button>
              {readingState === "error" && (
                <p role="alert" className="mt-4 text-sm text-[var(--color-accent-rose)]">
                  {tr("La lecture n'a pas pu être générée. Réessaie dans un instant.", "The reading couldn't be generated. Try again in a moment.")}
                </p>
              )}
            </div>
          )
        ) : (
          <div className="text-center py-4">
            <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
              {tr(
                "Le ton de l'année, là où ça se passe, et tes douze mois saison par saison, écrits pour toi.",
                "The tone of the year, where it happens, and your twelve months season by season, written for you.",
              )}
            </p>
            <Link href={signedIn ? "/premium" : "/connexion"} className="sr-cta">
              {tr("Débloquer avec Premium", "Unlock with Premium")}
            </Link>
          </div>
        )}
      </Section>

      <div className="mt-16 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onEdit} className="sr-chip">
          {tr("Modifier les données", "Edit details")}
        </button>
        <Link href="/carte-natale" className="sr-chip">
          {tr("Ma carte natale", "My natal chart")}
        </Link>
        <Link href="/calendrier" className="sr-chip">
          {tr("Le calendrier du ciel", "The sky calendar")}
        </Link>
      </div>
    </article>
  );
}

function Legend({ tr }: { tr: (fr: string, en: string) => string }) {
  return (
    <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-[var(--color-text-muted)]">
      <li className="flex items-center gap-2">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--sr-accent)]" /> {tr("Éclipse solaire", "Solar eclipse")}
      </li>
      <li className="flex items-center gap-2">
        <span className="inline-block w-2.5 h-2.5 rounded-full border border-[var(--color-moon)]" /> {tr("Éclipse lunaire", "Lunar eclipse")}
      </li>
      <li className="flex items-center gap-2">
        <span className="inline-block w-4 h-0.5 bg-[var(--sr-retro)]" /> {tr("Rétrogradation", "Retrograde")}
      </li>
    </ul>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-20 sm:mt-24">
      <div className="flex items-baseline gap-4 mb-8 pb-4 border-b border-[var(--sr-line)]">
        <span className="text-xs tabular-nums tracking-[0.2em] text-[var(--sr-accent)]">{n}</span>
        <h2 className="text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Timeline({
  events,
  now,
  locale,
  tr,
  shortFmt,
  sign,
  planet,
}: {
  events: YearEvent[];
  now: Date;
  locale: Locale;
  tr: (fr: string, en: string) => string;
  shortFmt: Intl.DateTimeFormat;
  sign: (s: string) => string;
  planet: (p: string) => string;
}) {
  if (!events.length) return null;
  const KIND: Record<string, string> = {
    total: tr("totale", "total"),
    partial: tr("partielle", "partial"),
    penumbral: tr("pénombrale", "penumbral"),
    annular: tr("annulaire", "annular"),
  };
  return (
    <ol className="sr-timeline">
      {events.map((e, i) => {
        const past = (e.until ?? e.date) < now;
        const live = e.date <= now && !!e.until && e.until >= now;
        const title =
          e.kind === "retrograde"
            ? tr(`${planet(e.planet ?? "")} rétrograde`, `${planet(e.planet ?? "")} retrograde`)
            : `${e.kind === "eclipse-solar" ? tr("Éclipse solaire", "Solar eclipse") : tr("Éclipse lunaire", "Lunar eclipse")}${e.eclipseKind ? ` ${KIND[e.eclipseKind]}` : ""}`;
        const when = e.until ? `${shortFmt.format(e.date)} → ${shortFmt.format(e.until)}` : shortFmt.format(e.date);
        return (
          <li key={i} className={`sr-tl-item ${past ? "opacity-55" : ""}`}>
            <span className={`sr-tl-dot ${e.kind === "retrograde" ? "sr-tl-dot-retro" : e.kind === "eclipse-lunar" ? "sr-tl-dot-moon" : ""}`} aria-hidden />
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)] tabular-nums">
              {when}
              {live && <span className="ml-2 text-[var(--sr-accent)] normal-case tracking-normal">· {tr("en ce moment", "happening now")}</span>}
            </p>
            <p className="mt-1 text-[var(--color-text-primary)] font-medium">
              {title} <span className="text-[var(--color-text-muted)] font-normal">{tr("en", "in")} {sign(e.sign)}</span>
            </p>
            {e.house && (
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {tr(`Maison ${e.house} de l'année`, `House ${e.house} of the year`)} · {HOUSE_THEME[e.house].label[locale]}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Reading({ text }: { text: string }) {
  const blocks = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  return (
    <div className="space-y-5 text-[17px] leading-[1.75] text-[var(--color-text-secondary)] max-w-[65ch]">
      {blocks.map((line, i) => {
        const m = line.match(/^\*\*(.+?)\*\*\s*:?\s*(.*)$/);
        if (m) {
          return (
            <div key={i} className={i ? "pt-4" : ""}>
              <h3 className="font-cinzel text-2xl text-[var(--color-text-primary)]">{m[1]}</h3>
              {m[2] && <p className="mt-3">{m[2].replace(/\*\*/g, "")}</p>}
            </div>
          );
        }
        return <p key={i}>{line.replace(/\*\*/g, "")}</p>;
      })}
    </div>
  );
}
