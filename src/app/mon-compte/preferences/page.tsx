"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";
import Starfield from "@/components/Starfield";
import SiteFooter from "@/components/SiteFooter";
import AccountTabs from "@/components/AccountTabs";

type Voice = "sensible" | "mystique" | "pragmatique";
type Tone = "poetic" | "direct" | "neutral";
type Depth = "surface" | "psychological" | "archetypal";
type Focus = "identity" | "relations" | "career";
type Genre = "femme" | "homme" | "neutre";

interface Prefs {
  voice: Voice;
  tone: Tone;
  depth: Depth;
  focus: Focus;
  genre: Genre;
}

const DEFAULTS: Prefs = {
  voice: "sensible",
  tone: "neutral",
  depth: "psychological",
  focus: "identity",
  genre: "neutre",
};

export default function PreferencesPage() {
  const { user, isPremium, loading, getAccessToken } = useAuth();
  const { locale } = useLocale();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchPrefs = useCallback(async () => {
    if (!user?.id) return;
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/preferences`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.prefs) setPrefs({ ...DEFAULTS, ...data.prefs });
      }
    } catch {
      /* noop */
    }
    setLoaded(true);
  }, [user?.id, getAccessToken]);

  useEffect(() => {
    if (user) fetchPrefs();
  }, [user, fetchPrefs]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    setSaved(false);
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/preferences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prefs }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="relative min-h-screen">
        <Starfield />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-3">
          <div className="w-8 h-8 border-2 border-[var(--color-accent-lavender)]/30 border-t-[var(--color-accent-lavender)] rounded-full animate-spin" />
          <p className="text-xs text-[var(--color-text-secondary)]">
            {locale === "fr" ? "Chargement de ton espace…" : "Loading your space…"}
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="relative min-h-screen">
        <Starfield />
        <div className="relative z-10 max-w-md mx-auto px-4 pt-24 text-center">
          <h1 className="font-cinzel text-2xl text-[var(--color-text-primary)] mb-4">
            {locale === "fr" ? "Préférences" : "Preferences"}
          </h1>
          <a href="/connexion" className="btn-primary px-6 py-3 rounded-xl text-sm inline-block">
            {locale === "fr" ? "Se connecter" : "Sign in"}
          </a>
        </div>
        <SiteFooter />
      </main>
    );
  }

  const label = (fr: string, en: string) => (locale === "fr" ? fr : en);

  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-10 pb-8">
        <AccountTabs current="preferences" locale={locale} />

        <h1 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-2">
          {label("Préférences d'interprétation", "Reading preferences")}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          {label(
            "Ces préférences s'appliqueront à tes prochaines lectures pour un ton et une profondeur qui te ressemblent.",
            "These preferences will apply to your next readings for a tone and depth that fits you."
          )}
        </p>

        {!isPremium && (
          <div className="glass p-4 mb-6 border-[var(--color-accent-rose)]/30 bg-[var(--color-accent-rose)]/5">
            <p className="text-sm text-[var(--color-text-primary)] mb-1">
              <span className="text-[var(--color-accent-rose)]">✦</span>{" "}
              {label("Fonctionnalité Premium", "Premium feature")}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mb-3">
              {label(
                "Les préférences avancées sont réservées aux comptes Premium. Tu peux modifier ici mais elles ne s'appliqueront qu'après activation Premium.",
                "Advanced preferences are Premium-only. You can edit them here but they apply only after upgrading."
              )}
            </p>
            <a href="/premium" className="inline-block btn-primary px-4 py-2 rounded-lg text-xs">
              {label("Passer Premium — 9,99 $", "Go Premium — $9.99")}
            </a>
          </div>
        )}

        <div className="glass p-6 space-y-6">
          <RadioGroup
            legend={label("Voix", "Voice")}
            helper={label("Le ton général de tes lectures.", "The overall tone of your readings.")}
            value={prefs.voice}
            onChange={(v) => setPrefs({ ...prefs, voice: v as Voice })}
            options={[
              { v: "sensible", fr: "Sensible", en: "Feeling", descFr: "Tendre, ressenti, corps.", descEn: "Tender, felt, embodied." },
              { v: "mystique", fr: "Mystique", en: "Mystic", descFr: "Symboles et archétypes jungiens.", descEn: "Symbols and Jungian archetypes." },
              { v: "pragmatique", fr: "Pragmatique", en: "Pragmatic", descFr: "Clair, concret, orienté action.", descEn: "Clear, concrete, action-oriented." },
            ]}
          />

          <RadioGroup
            legend={label("Ton", "Tone")}
            helper={label("Le style d'écriture.", "Writing style.")}
            value={prefs.tone}
            onChange={(v) => setPrefs({ ...prefs, tone: v as Tone })}
            options={[
              { v: "neutral", fr: "Neutre", en: "Neutral" },
              { v: "direct", fr: "Direct", en: "Direct" },
              { v: "poetic", fr: "Poétique", en: "Poetic" },
            ]}
          />

          <RadioGroup
            legend={label("Profondeur", "Depth")}
            helper={label("Niveau d'analyse psychologique.", "Level of psychological analysis.")}
            value={prefs.depth}
            onChange={(v) => setPrefs({ ...prefs, depth: v as Depth })}
            options={[
              { v: "surface", fr: "Aperçu", en: "Surface", descFr: "Grandes lignes, simple.", descEn: "Big picture, simple." },
              { v: "psychological", fr: "Psychologique", en: "Psychological", descFr: "Dynamiques intérieures.", descEn: "Inner dynamics." },
              { v: "archetypal", fr: "Archétypal", en: "Archetypal", descFr: "Mythes et profondeurs.", descEn: "Myths and depths." },
            ]}
          />

          <RadioGroup
            legend={label("Focus", "Focus")}
            helper={label("L'axe central des lectures.", "The central axis of readings.")}
            value={prefs.focus}
            onChange={(v) => setPrefs({ ...prefs, focus: v as Focus })}
            options={[
              { v: "identity", fr: "Identité", en: "Identity" },
              { v: "relations", fr: "Relations", en: "Relationships" },
              { v: "career", fr: "Vocation", en: "Career" },
            ]}
          />

          <RadioGroup
            legend={label("Accord de genre", "Gender agreement")}
            helper={label("Comment t'adresser dans les lectures.", "How to address you in readings.")}
            value={prefs.genre}
            onChange={(v) => setPrefs({ ...prefs, genre: v as Genre })}
            options={[
              { v: "neutre", fr: "Neutre", en: "Neutral" },
              { v: "femme", fr: "Féminin", en: "Feminine" },
              { v: "homme", fr: "Masculin", en: "Masculine" },
            ]}
          />

          <div className="flex items-center justify-between pt-4 border-t border-[var(--color-glass-border)]">
            <span className="text-xs text-[var(--color-text-secondary)]">
              {!loaded ? label("Chargement…", "Loading…") : saved ? label("Enregistré ✓", "Saved ✓") : ""}
            </span>
            <button
              onClick={handleSave}
              disabled={saving || !loaded}
              className="btn-primary px-5 py-2.5 rounded-lg text-xs disabled:opacity-50"
            >
              {saving ? label("Enregistrement…", "Saving…") : label("Enregistrer", "Save")}
            </button>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

function RadioGroup<T extends string>({
  legend,
  helper,
  value,
  onChange,
  options,
}: {
  legend: string;
  helper: string;
  value: T;
  onChange: (v: T) => void;
  options: { v: T; fr: string; en: string; descFr?: string; descEn?: string }[];
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-[var(--color-text-primary)] mb-1 font-cinzel">
        {legend}
      </legend>
      <p className="text-xs text-[var(--color-text-secondary)] mb-3">{helper}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => {
          const active = value === opt.v;
          return (
            <button
              key={opt.v}
              type="button"
              onClick={() => onChange(opt.v)}
              className={`text-left p-3 rounded-xl border transition-all ${
                active
                  ? "border-[var(--color-accent-lavender)] bg-[var(--color-accent-lavender)]/10"
                  : "border-[var(--color-glass-border)] bg-white/[0.02] hover:border-[var(--color-accent-lavender)]/40"
              }`}
            >
              <span className={`block text-xs font-medium ${active ? "text-[var(--color-accent-lavender)]" : "text-[var(--color-text-primary)]"}`}>
                {opt.fr}
              </span>
              {opt.descFr && (
                <span className="block text-[10px] text-[var(--color-text-secondary)] mt-1 leading-snug">
                  {opt.descFr}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
