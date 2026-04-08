import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { calculateNatalChart } from "@/lib/astro";

// ─────────────────────────────────────────────────────────────
// Daily Cosmic Forecast — Vercel Cron (runs 10:00 UTC daily)
// Generates a short 3-4 sentence bilingual forecast based on
// the current day's planetary transits and stores it in Supabase.
// ─────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function todaysTransits() {
  const now = new Date();
  // Midday UTC gives cleaner planetary positions
  return calculateNatalChart(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    now.getUTCDate(),
    12,
    0,
    0,
    0,
    false
  );
}

function formatTransits(chart: ReturnType<typeof calculateNatalChart>): string {
  return chart.planets
    .map((p) => `${p.name} en ${p.sign} (${p.degree.toFixed(0)}°)`)
    .join(", ");
}

async function generateForecast(transitsLine: string): Promise<{
  fr: string;
  en: string;
}> {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  if (!hasKey) {
    // Graceful fallback: return a neutral cosmic message
    return {
      fr: "Le ciel t'invite aujourd'hui à honorer ce qui prend racine en toi, même discrètement. Écoute l'élan qui monte, sans précipiter la suite.",
      en: "The sky invites you to honor what is quietly taking root within you today. Listen to the impulse rising, without rushing what comes next.",
    };
  }

  const prompt = `Tu es un astrologue psychologique inspiré par Carl Jung et Liz Greene. Rédige un court message "énergie du jour" basé sur les positions planétaires d'aujourd'hui.

Positions actuelles : ${transitsLine}

Exigences :
- 3 à 4 phrases maximum en français, puis 3 à 4 phrases en anglais
- Ton profond, introspectif, chaleureux — pas d'horoscope de magazine
- Évite les clichés ("les étoiles disent...", "aujourd'hui sera...")
- Pas de prédiction, mais une invitation psychologique
- Format de réponse STRICT en JSON :
{"fr": "...", "en": "..."}

Réponds uniquement avec le JSON, rien d'autre.`;

  const { text } = await generateText({
    model: anthropic("claude-haiku-4-5"),
    prompt,
    temperature: 0.85,
  });

  // Extract JSON from response (Haiku sometimes wraps in ```json)
  const match = text.match(/\{[\s\S]*"fr"[\s\S]*"en"[\s\S]*\}/);
  if (!match) throw new Error("Forecast JSON not found in LLM response");
  const parsed = JSON.parse(match[0]) as { fr: string; en: string };
  if (!parsed.fr || !parsed.en) throw new Error("Forecast missing fr or en field");
  return parsed;
}

export async function GET(req: NextRequest) {
  // ── Verify Vercel cron auth ──
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const chart = todaysTransits();
    const transitsLine = formatTransits(chart);

    const forecast = await generateForecast(transitsLine);

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("daily_forecasts").upsert(
      {
        forecast_date: today,
        summary_fr: forecast.fr,
        summary_en: forecast.en,
        transits: { planets: chart.planets, line: transitsLine },
        generated_at: new Date().toISOString(),
      },
      { onConflict: "forecast_date" }
    );

    if (error) {
      console.error("[cron/daily-forecast] supabase error:", error);
      return NextResponse.json(
        { error: "DB write failed", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      date: today,
      transits: transitsLine,
      forecast,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[cron/daily-forecast] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
