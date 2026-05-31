/**
 * Reading preferences helper — turns the per-user prefs stored in
 * `profiles.reading_prefs` into a short style instruction we inject
 * into Gemini prompts.
 *
 * Without this, the four sliders saved on /mon-compte/preferences
 * (tone / depth / focus on top of voice + genre) were silently ignored
 * by the AI routes — confusing for paying users who tuned them.
 *
 * Defensive defaults: if there's no Bearer token, no profile row, or
 * no prefs JSON, we return an empty string and the prompt is unaffected.
 */

import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export interface ReadingPrefs {
  voice?: "sensible" | "mystique" | "pragmatique";
  tone?: number;   // 1..10 — familiar ↔ formal
  depth?: number;  // 1..10 — light ↔ deep
  focus?: number;  // 1..10 — psychological ↔ symbolic
  genre?: string;
}

function clamp(n: unknown, lo: number, hi: number, fallback: number): number {
  const v = typeof n === "number" ? n : parseFloat(String(n));
  if (!Number.isFinite(v)) return fallback;
  return Math.min(hi, Math.max(lo, v));
}

/**
 * Read prefs for the authenticated caller. Bearer-only — body-supplied
 * userId would be an IDOR vector. Anonymous callers get null.
 */
export async function readUserPrefs(req: NextRequest): Promise<ReadingPrefs | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !anon || !service) return null;

  try {
    const authClient = createClient(url, anon);
    const { data: userData } = await authClient.auth.getUser(token);
    const userId = userData?.user?.id;
    if (!userId) return null;

    const admin = createClient(url, service);
    const { data: profile } = await admin
      .from("profiles")
      .select("reading_prefs")
      .eq("id", userId)
      .single();
    return (profile?.reading_prefs as ReadingPrefs | null) ?? null;
  } catch {
    return null;
  }
}

/**
 * Turn raw prefs into a French/English natural-language style block that
 * goes straight into Gemini's system prompt. We translate the sliders
 * into prose because Gemini handles "écris avec une profondeur élevée"
 * much better than "depth: 8/10".
 */
export function prefsToStyleBlock(prefs: ReadingPrefs | null, locale: "fr" | "en"): string {
  if (!prefs) return "";
  const tone = clamp(prefs.tone, 1, 10, 5);
  const depth = clamp(prefs.depth, 1, 10, 5);
  const focus = clamp(prefs.focus, 1, 10, 5);

  const pick = (v: number, low: string, mid: string, high: string) =>
    v <= 3 ? low : v >= 7 ? high : mid;

  if (locale === "en") {
    const toneStr = pick(tone, "very familiar, intimate (tutoiement-style)", "warm but respectful", "more formal, composed");
    const depthStr = pick(depth, "stay surface, keep it light and accessible", "balance accessibility and depth", "go deep, dig into the layers");
    const focusStr = pick(focus, "stay strongly psychological — feelings, patterns, lived experience", "balance psychology and symbolism", "lean into archetypes, myths, symbolism");
    return `\nReader's style preferences:\n- Tone: ${toneStr}\n- Depth: ${depthStr}\n- Focus: ${focusStr}\n`;
  }

  const toneStr = pick(tone, "très familier, intime (tutoie franchement)", "chaleureux mais respectueux", "plutôt soutenu, posé");
  const depthStr = pick(depth, "reste en surface, garde-le léger et accessible", "équilibre l'accessible et la profondeur", "va en profondeur, creuse les couches");
  const focusStr = pick(focus, "reste très psychologique — ressentis, schémas, vécu", "équilibre psychologie et symbolisme", "penche vers archétypes, mythes, symbolisme");
  return `\nPréférences de lecture du lecteur :\n- Ton : ${toneStr}\n- Profondeur : ${depthStr}\n- Angle : ${focusStr}\n`;
}

/** One-shot helper: read + format. Used by every AI route. */
export async function readPrefsStyleBlock(req: NextRequest, locale: "fr" | "en"): Promise<string> {
  const prefs = await readUserPrefs(req);
  return prefsToStyleBlock(prefs, locale);
}
