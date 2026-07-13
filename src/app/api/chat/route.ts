import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getFreeRateLimit, getPremiumRateLimit } from "@/lib/ratelimit";
import { readPrefsStyleBlock } from "@/lib/readingPrefs";

// Force Node runtime so Gemini SDK + Supabase SSR work consistently.
// (AI SDK + @ai-sdk/google support Edge too, but several of our helpers
// — Supabase admin, ratelimit — assume Node.)
export const runtime = "nodejs";
export const maxDuration = 60;

// ── Supabase admin (lazy init, server-only) ──
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Verify Bearer token and return the authenticated userId, or null for anonymous.
// We never trust a userId supplied in the request body — that was an IDOR vector
// that let a caller consume someone else's Premium quota.
async function verifyAuth(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.auth.getUser(token);
  return data?.user?.id ?? null;
}

// ── In-memory fallback rate limiting (when Redis unavailable) ──
const ipLimits = new Map<string, { count: number; windowStart: number }>();
const FREE_LIMIT = 5;
const PREMIUM_MONTHLY_LIMIT = 200;
const LIFETIME_LIMIT = 2000;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour for IP-based fallback

function isIpLimitedFallback(ip: string): boolean {
  const now = Date.now();
  const entry = ipLimits.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    ipLimits.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= FREE_LIMIT) return true;
  entry.count++;
  return false;
}

// ── Check premium user limits via Supabase ──
async function checkPremiumLimits(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const supabase = getSupabaseAdmin();
    const { data: profile } = await supabase
      .from("profiles")
      .select("chat_used, chat_month, chat_lifetime, is_premium")
      .eq("id", userId)
      .single();

    if (!profile || !profile.is_premium) {
      return { allowed: false, remaining: 0 };
    }

    // Try Redis rate limit first
    const premiumRL = getPremiumRateLimit();
    if (premiumRL) {
      const { success, remaining } = await premiumRL.limit(userId);
      if (!success) return { allowed: false, remaining: 0 };

      // Also update Supabase counters for dashboard/analytics
      const currentMonth = new Date().toISOString().slice(0, 7);
      await supabase
        .from("profiles")
        .update({
          chat_used: (profile.chat_month === currentMonth ? (profile.chat_used || 0) : 0) + 1,
          chat_month: currentMonth,
          chat_lifetime: (profile.chat_lifetime || 0) + 1,
        })
        .eq("id", userId);

      return { allowed: true, remaining };
    }

    // Fallback: Supabase-only tracking
    const currentMonth = new Date().toISOString().slice(0, 7);
    let monthUsed = profile.chat_used || 0;
    if (profile.chat_month !== currentMonth) monthUsed = 0;
    if ((profile.chat_lifetime || 0) >= LIFETIME_LIMIT) return { allowed: false, remaining: 0 };
    if (monthUsed >= PREMIUM_MONTHLY_LIMIT) return { allowed: false, remaining: 0 };

    await supabase
      .from("profiles")
      .update({
        chat_used: monthUsed + 1,
        chat_month: currentMonth,
        chat_lifetime: (profile.chat_lifetime || 0) + 1,
      })
      .eq("id", userId);

    return { allowed: true, remaining: PREMIUM_MONTHLY_LIMIT - monthUsed - 1 };
  } catch (err) {
    console.error("Error checking premium limits:", err);
    return { allowed: true, remaining: -1 };
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { messages, chartContext, locale, genre, voice } = await req.json();

  // Trust the userId from the verified Bearer token only (never from body).
  const authedUserId = await verifyAuth(req);

  let isPremium = false;
  let maxTokens = 650; // Free tier: enough room to breathe

  if (authedUserId) {
    const result = await checkPremiumLimits(authedUserId);
    if (result.allowed) {
      isPremium = true;
      maxTokens = 900;
    } else if (result.remaining === 0) {
      return new Response(
        JSON.stringify({
          error: locale === "fr"
            ? "Limite de messages atteinte. Réessaie le mois prochain."
            : "Message limit reached. Try again next month.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Non-premium / anonymous: Redis rate limit with in-memory fallback
  if (!isPremium) {
    const freeRL = getFreeRateLimit();
    if (freeRL) {
      const { success } = await freeRL.limit(ip);
      if (!success) {
        return new Response(
          JSON.stringify({
            error: locale === "fr"
              ? "Tu as utilisé tes messages gratuits. Passe Premium pour continuer."
              : "You've used your free messages. Go Premium to continue.",
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    } else if (isIpLimitedFallback(ip)) {
      return new Response(
        JSON.stringify({
          error: locale === "fr"
            ? "Tu as utilisé tes messages gratuits. Passe Premium pour continuer."
            : "You've used your free messages. Go Premium to continue.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  const genreLabel = genre === "femme" ? "féminin" : genre === "homme" ? "masculin" : "non-binaire";
  const lang = locale === "en" ? "English" : "French";
  const voiceKey = (voice === "mystique" || voice === "pragmatique" ? voice : "sensible") as
    | "sensible"
    | "mystique"
    | "pragmatique";

  const voiceInstructions: Record<typeof voiceKey, string> = {
    sensible:
      "Tu parles au ressenti et au corps. Tu nommes ce qui se vit : les tensions, les appels, les nostalgies. Ta langue est tendre, précise, jamais condescendante. Tu reconnais avant d'expliquer.",
    mystique:
      "Tu parles en archétypes et en symboles. Tu tisses mythe, rêve, images jungiennes. Tu laisses la profondeur respirer. Tu évoques plus que tu ne définis — comme un·e ami·e qui lit les symboles à voix haute.",
    pragmatique:
      "Tu parles concret, lucide, terre à terre. Zéro jargon ésotérique, zéro cliché. Tu traduis le ciel en questions posables : ce que ça change dans une semaine, dans une décision, dans un geste.",
  };

  // Per-user style sliders saved on /mon-compte/preferences. Anonymous
  // callers and free users without prefs just get an empty string back,
  // so the rest of the prompt is unaffected.
  const prefsStyleBlock = await readPrefsStyleBlock(req, (locale === "en" ? "en" : "fr"));

  const systemPrompt = `Tu es un·e ami·e lucide et cultivé·e qui connaît l'astrologie intimement. Pas un·e guru, pas un manuel — quelqu'un·e qui lit la carte de cette personne spécifique et la lui restitue comme on raconte un souvenir partagé.

Langue : ${lang}
Genre de la personne : ${genreLabel}
Voix demandée : ${voiceKey}
${voiceInstructions[voiceKey]}
${prefsStyleBlock}
Voici sa carte natale :
${chartContext}

Règles d'or :
- Tutoie. Adresse directe, toujours.
- Pas de prédictions ("tu vas…", "il arrivera…"). Parle de tensions, d'appels, de pentes naturelles.
- Pas de phrases passe-partout ("chaque signe a ses forces"). Si tu peux le dire de n'importe qui, ne le dis pas.
- Tisse les placements entre eux quand c'est pertinent — un Soleil ne parle jamais seul, il parle à une Lune, à un Ascendant.
- 2 à 4 paragraphes. Brève n'est pas pauvre. Longue doit se justifier.
- ${genre === "femme" ? "Accords féminins." : genre === "homme" ? "Accords masculins." : "Écriture inclusive avec point médian (·e)."}
- Si on te pose une question hors-astro, tu peux répondre en une phrase puis ramener à la carte.

Exemple de ton (Soleil Bélier, voix sensible) :
"Il y a en toi un feu qui veut agir avant de comprendre. Pas par impatience — par fidélité à quelque chose qui te précède. Quand tu hésites trop, tu deviens absent·e à toi-même."

Exemple à éviter :
"Le Soleil en Bélier invite à embrasser l'élan pionnier. Cette position suggère une vitalité brute qu'il convient de cultiver."`;

  // Diag: surface presence of the Gemini key + how many messages were received.
  // Truncated fingerprint — never the full key.
  const gKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  console.log("[chat] entering streamText", {
    hasKey: !!gKey,
    keyLen: gKey?.length,
    keyFingerprint: gKey ? `${gKey.slice(0, 6)}…${gKey.slice(-3)}` : null,
    msgCount: Array.isArray(messages) ? messages.length : -1,
    isPremium,
    maxTokens,
  });

  try {
    const result = streamText({
      // Gemini 2.5 Flash: cost-effective for psychological-astrology prose
      // (~40× cheaper than Claude Sonnet, free tier covers casual usage).
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages,
      maxOutputTokens: maxTokens,
      temperature: 0.7,
      // Gemini 2.5 Flash is a "thinking" model: reasoning tokens count toward
      // the output budget. With a low maxOutputTokens (650–900) the thinking
      // could swallow the whole budget and return an EMPTY answer (the "chat
      // renders nothing" bug). Disable thinking so the full budget goes to the
      // reply — no reasoning needed for this conversational task.
      providerOptions: { google: { thinkingConfig: { thinkingBudget: 0 } } },
      // Sentry AI Monitoring — captures model, tokens, latency. Prompts and
      // completions stay private (sendDefaultPii: false → recordInputs/Outputs
      // default to false).
      experimental_telemetry: { isEnabled: true, functionId: "chat-stream" },
      onError: ({ error }) => {
        const e = error as { message?: string; name?: string };
        console.error("[chat] streamText onError:", e?.name, e?.message);
      },
    });

    return result.toTextStreamResponse();
  } catch (err) {
    const e = err as Error;
    console.error("[chat] streamText threw synchronously:", e?.message, e?.stack?.split("\n").slice(0, 3));
    return new Response(
      JSON.stringify({ error: "AI service failed", detail: e?.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
