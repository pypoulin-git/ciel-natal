import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getFreeRateLimit, getPremiumRateLimit } from "@/lib/ratelimit";

// ── Supabase admin (lazy init, server-only) ──
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ── In-memory fallback rate limiting (when Redis unavailable) ──
const ipLimits = new Map<string, { count: number; windowStart: number }>();
const FREE_LIMIT = 3;
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
  const { messages, chartContext, locale, genre, userId } = await req.json();

  let isPremium = false;
  let maxTokens = 400; // Free tier: shorter responses

  if (userId) {
    const result = await checkPremiumLimits(userId);
    if (result.allowed) {
      isPremium = true;
      maxTokens = 600;
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

  const systemPrompt = `Tu es une astrologue bienveillante et expérimentée. Tu tutoies la personne et tu parles avec chaleur et douceur. Tu utilises un vocabulaire accessible, jamais trop technique. Tu ne fais jamais de prédictions — tu explores les potentiels, les tendances, les invitations du ciel.

Langue : ${lang}
Genre de la personne : ${genreLabel} (adapte tes accords grammaticaux)

Voici la carte natale de la personne :
${chartContext}

Règles :
- Sois concise et bienveillante (2-4 paragraphes max par réponse)
- Tutoie toujours la personne
- Ne fais JAMAIS de prédictions (pas de "tu vas...", "il va t'arriver...")
- Parle de potentiels, tendances, invitations, énergies
- Si on te demande quelque chose hors astrologie, ramène doucement la conversation vers la carte
- Utilise des métaphores poétiques mais accessibles
- ${genre === "femme" ? "Utilise le féminin pour les accords" : genre === "homme" ? "Utilise le masculin pour les accords" : "Utilise l'écriture inclusive avec le point médian (·e)"}`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: systemPrompt,
    messages,
    maxOutputTokens: maxTokens,
    temperature: 0.7,
  });

  return result.toTextStreamResponse();
}
