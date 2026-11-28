"use client";

import { useRef, useState } from "react";
import { searchCities, type CityResult } from "@/lib/citySearch";
import { VOICE_OPTIONS } from "@/lib/voiceOptions";
import type { Genre } from "@/lib/chartHelpers";
import type { VoiceKey } from "@/lib/voicePrompts";

export interface QuickChartData {
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
}

/**
 * The whole birth form on one screen (QA 2026-11: the chart sat behind a
 * second landing page and a three-step wizard). Used in the home hero and on
 * /carte-natale. `onChange` lets the page draw a live wheel preview while the
 * person types; `onSubmit` receives complete, validated data.
 */
export default function QuickChartForm({
  locale,
  onSubmit,
  onChange,
  submitLabel,
  idPrefix = "qc",
  initial,
}: {
  locale: string;
  onSubmit: (data: QuickChartData) => void;
  onChange?: (partial: { date: string; heure: string; hasTime: boolean; latitude: number | null; longitude: number | null }) => void;
  submitLabel?: string;
  idPrefix?: string;
  /** Pre-fill, e.g. when coming back from results to change a detail. */
  initial?: Partial<QuickChartData>;
}) {
  const fr = locale !== "en";
  const l = (a: string, b: string) => (fr ? a : b);
  const id = (s: string) => `${idPrefix}-${s}`;

  const pad = (n: number) => String(n).padStart(2, "0");
  const hasInitial = !!(initial?.annee && initial.mois && initial.jour && initial.lieu);
  const [prenom, setPrenom] = useState(initial?.prenom ?? "");
  const [genre, setGenre] = useState<Genre>(initial?.genre ?? "femme");
  const [date, setDate] = useState(hasInitial ? `${initial!.annee}-${pad(initial!.mois!)}-${pad(initial!.jour!)}` : "");
  const [heure, setHeure] = useState(hasInitial ? `${pad(initial!.heure ?? 12)}:${pad(initial!.minute ?? 0)}` : "12:00");
  const [hasTime, setHasTime] = useState(initial?.hasTime ?? true);
  const [lieu, setLieu] = useState(hasInitial ? initial!.lieu! : "");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    hasInitial && initial!.latitude != null && initial!.longitude != null ? { lat: initial!.latitude, lon: initial!.longitude } : null,
  );
  const [voice, setVoice] = useState<VoiceKey>(initial?.voice ?? "sensible");
  const [cities, setCities] = useState<CityResult[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityError, setCityError] = useState("");
  const [tried, setTried] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= "1900-01-01" && date <= today;
  const errors = {
    prenom: !prenom.trim() ? l("Écris ton prénom.", "Enter your first name.") : "",
    date: !dateOk ? l("Choisis ta date de naissance.", "Pick your date of birth.") : "",
    lieu: !coords ? l("Choisis ta ville dans la liste.", "Pick your city from the list.") : "",
  };
  const valid = !errors.prenom && !errors.date && !errors.lieu;

  const emit = (next: Partial<{ date: string; heure: string; hasTime: boolean; coords: { lat: number; lon: number } | null }>) => {
    const c = "coords" in next ? next.coords ?? null : coords;
    onChange?.({
      date: next.date ?? date,
      heure: next.heure ?? heure,
      hasTime: next.hasTime ?? hasTime,
      latitude: c?.lat ?? null,
      longitude: c?.lon ?? null,
    });
  };

  const search = (q: string) => {
    setLieu(q);
    setCoords(null);
    emit({ coords: null });
    setCityError("");
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setCities([]);
      return;
    }
    setCityLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const res = await searchCities(q);
        setCities(res);
        if (!res.length) setCityError(l("Aucune ville trouvée. Essaie l'orthographe locale.", "No city found. Try the local spelling."));
      } catch {
        setCities([]);
        setCityError(l("La recherche de ville ne répond pas. Réessaie dans un instant.", "City search isn't responding. Try again in a moment."));
      } finally {
        setCityLoading(false);
      }
    }, 350);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!valid || !coords) return;
    const [a, m, j] = date.split("-").map((n) => parseInt(n, 10));
    const [h, mn] = heure.split(":").map((n) => parseInt(n, 10));
    onSubmit({
      prenom: prenom.trim().slice(0, 40),
      genre,
      jour: j,
      mois: m,
      annee: a,
      heure: Number.isFinite(h) ? h : 12,
      minute: Number.isFinite(mn) ? mn : 0,
      hasTime,
      lieu,
      latitude: coords.lat,
      longitude: coords.lon,
      voice,
    });
  };

  const fieldError = (msg: string, fid: string) =>
    tried && msg ? (
      <p id={fid} className="mt-1.5 text-xs text-[var(--color-accent-rose)]" role="alert">
        {msg}
      </p>
    ) : null;

  const labelCls = "mb-1.5 block text-xs uppercase tracking-widest text-[var(--color-text-secondary)]";

  return (
    <form onSubmit={submit} noValidate className="space-y-5 text-left">
      {/* Name + pronoun agreement */}
      <div>
        <label htmlFor={id("prenom")} className={labelCls}>
          {l("Ton prénom", "Your first name")}
        </label>
        <input
          id={id("prenom")}
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          maxLength={40}
          autoComplete="given-name"
          className="glass-input w-full"
          aria-invalid={tried && !!errors.prenom}
          aria-describedby={tried && errors.prenom ? id("prenom-err") : undefined}
        />
        {fieldError(errors.prenom, id("prenom-err"))}
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={l("Accords du texte", "Text agreement")}>
          {([
            ["femme", l("Femme", "Woman")],
            ["homme", l("Homme", "Man")],
            ["nb", l("Non-binaire", "Non-binary")],
          ] as [Genre, string][]).map(([g, txt]) => (
            <button
              key={g}
              type="button"
              role="radio"
              aria-checked={genre === g}
              onClick={() => setGenre(g)}
              className={`min-h-9 rounded-full border px-3.5 text-xs transition ${
                genre === g
                  ? "border-[var(--color-accent-lavender)]/60 bg-[var(--color-accent-lavender)]/20 text-[var(--color-text-primary)]"
                  : "border-[var(--color-glass-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-lavender)]/40"
              }`}
            >
              {txt}
            </button>
          ))}
        </div>
      </div>

      {/* Date + time */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={id("date")} className={labelCls}>
            {l("Date de naissance", "Date of birth")}
          </label>
          <input
            id={id("date")}
            type="date"
            min="1900-01-01"
            max={today}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              emit({ date: e.target.value });
            }}
            className="glass-input w-full"
            aria-invalid={tried && !!errors.date}
            aria-describedby={tried && errors.date ? id("date-err") : undefined}
          />
          {fieldError(errors.date, id("date-err"))}
        </div>
        <div>
          <label htmlFor={id("heure")} className={labelCls}>
            {l("Heure de naissance", "Time of birth")}
          </label>
          <input
            id={id("heure")}
            type="time"
            value={heure}
            disabled={!hasTime}
            onChange={(e) => {
              setHeure(e.target.value);
              emit({ heure: e.target.value });
            }}
            className="glass-input w-full disabled:opacity-40"
          />
          <label className="mt-1.5 flex min-h-9 cursor-pointer items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <input
              type="checkbox"
              checked={!hasTime}
              onChange={(e) => {
                setHasTime(!e.target.checked);
                emit({ hasTime: !e.target.checked });
              }}
              className="h-4 w-4 accent-[var(--color-accent-lavender)]"
            />
            {l("Je ne la connais pas", "I don't know it")}
          </label>
        </div>
      </div>

      {/* Place */}
      <div className="relative">
        <label htmlFor={id("lieu")} className={labelCls}>
          {l("Lieu de naissance", "Place of birth")}
        </label>
        <input
          id={id("lieu")}
          value={lieu}
          onChange={(e) => search(e.target.value)}
          autoComplete="off"
          placeholder={l("Cherche ta ville…", "Search your city…")}
          className="glass-input w-full"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={cities.length > 0}
          aria-controls={cities.length > 0 ? id("villes") : undefined}
          aria-invalid={tried && !!errors.lieu}
          aria-describedby={tried && errors.lieu ? id("lieu-err") : undefined}
        />
        {cityLoading && (
          <span className="absolute right-3 top-[38px] h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-accent-lavender)]/30 border-t-[var(--color-accent-lavender)]" aria-hidden="true" />
        )}
        {cities.length > 0 && (
          <ul id={id("villes")} role="listbox" className="glass absolute left-0 right-0 z-30 mt-2 max-h-64 overflow-y-auto">
            {cities.map((c, i) => (
              <li key={`${c.lat}-${c.lon}-${i}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => {
                    setLieu(c.display);
                    setCoords({ lat: c.lat, lon: c.lon });
                    setCities([]);
                    emit({ coords: { lat: c.lat, lon: c.lon } });
                  }}
                  className="min-h-11 w-full border-b border-[var(--color-glass-border)] px-4 py-2.5 text-left text-sm text-[var(--color-text-primary)] last:border-0 hover:bg-white/5"
                >
                  {c.display}
                </button>
              </li>
            ))}
          </ul>
        )}
        {cityError && <p className="mt-1.5 text-xs text-[var(--color-accent-rose)]" role="alert">{cityError}</p>}
        {!cityError && fieldError(errors.lieu, id("lieu-err"))}
      </div>

      {/* Voice — optional, folded */}
      <details className="group rounded-xl border border-[var(--color-glass-border)] px-4 py-2">
        <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between text-xs text-[var(--color-text-secondary)]">
          <span>
            {l("Voix de ta lecture", "Voice of your reading")} :{" "}
            <span className="text-[var(--color-text-primary)]">
              {(() => {
                const o = VOICE_OPTIONS.find((v) => v.key === voice)!;
                return fr ? o.labelFr : o.labelEn;
              })()}
            </span>
          </span>
          <span aria-hidden="true" className="transition group-open:rotate-180">⌄</span>
        </summary>
        <div role="radiogroup" aria-label={l("Voix d'interprétation", "Interpretation voice")} className="mt-2 grid gap-2 pb-2">
          {VOICE_OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={voice === o.key}
              onClick={() => setVoice(o.key)}
              className={`rounded-xl border px-3 py-2 text-left transition ${
                voice === o.key
                  ? "border-[var(--color-accent-lavender)]/60 bg-[var(--color-accent-lavender)]/15"
                  : "border-[var(--color-glass-border)] hover:border-[var(--color-accent-lavender)]/40"
              }`}
            >
              <span className="block text-sm text-[var(--color-text-primary)]">{fr ? o.labelFr : o.labelEn}</span>
              <span className="block text-xs text-[var(--color-text-secondary)]">{fr ? o.descFr : o.descEn}</span>
            </button>
          ))}
        </div>
      </details>

      <button type="submit" className="btn-primary glow-lavender inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-medium">
        <span aria-hidden="true">✦</span>
        {submitLabel ?? l("Voir ma carte du ciel", "See my birth chart")}
      </button>
      <p className="text-center text-xs text-[var(--color-text-secondary)]">
        {l("Gratuit · sans compte · calculé à la minute près", "Free · no account · calculated to the minute")}
      </p>
    </form>
  );
}
