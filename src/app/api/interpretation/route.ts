import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cacheGet, cacheSet, makeCacheKey } from "@/lib/interpCache";
import { voiceBlock, genderLabel, genderAgreementInstruction, type VoiceKey } from "@/lib/voicePrompts";

/**
 * Reads the caller's saved reading preferences (tone/depth/focus sliders
 * from /mon-compte/preferences) when a valid Bearer is present. Returns
 * null for anonymous callers — they get the default Gemini behaviour.
 *
 * Each slider is 1..10. We translate them into a short style instruction
 * so Gemini actually changes register, instead of letting the user feel
 * like they're tuning dead knobs (the previous behaviour).
 */
async function readPrefsStyleBlock(req: NextRequest, locale: "fr" | "en"): Promise<string> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return "";
  const token = auth.slice(7);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) return "";
  try {
    const userClient = createClient(url.trim(), anonKey.trim());
    const { data: userData } = await userClient.auth.getUser(token);
    const userId = userData?.user?.id;
    if (!userId) return "";
    const admin = createClient(url.trim(), serviceKey.trim());
    const { data } = await admin
      .from("profiles")
      .select("reading_prefs")
      .eq("id", userId)
      .maybeSingle();
    const prefs = (data?.reading_prefs ?? {}) as { tone?: number; depth?: number; focus?: number };
    const t = typeof prefs.tone === "number" ? prefs.tone : 5;
    const d = typeof prefs.depth === "number" ? prefs.depth : 5;
    const f = typeof prefs.focus === "number" ? prefs.focus : 5;
    if (locale === "en") {
      return `Reader's preferences (1-10 sliders):
- Tone (${t}/10): ${t <= 3 ? "playful, casual, light footing" : t >= 7 ? "grave, reverent, weighty" : "balanced — neither too playful nor too solemn"}
- Depth (${d}/10): ${d <= 3 ? "stay surface, give the gist, don't psychoanalyse" : d >= 7 ? "go deep — symbols, complexes, shadow material" : "moderate depth, hint at the inner work without lecturing"}
- Focus (${f}/10): ${f <= 3 ? "concrete, daily, actionable angle" : f >= 7 ? "archetypal, mythic, symbolic angle" : "balanced between practical and symbolic"}
Honor these. They override defaults.`;
    }
    return `Préférences du lecteur (curseurs 1-10) :
- Ton (${t}/10) : ${t <= 3 ? "léger, familier, complice" : t >= 7 ? "grave, intense, recueilli" : "équilibré — ni trop léger ni trop solennel"}
- Profondeur (${d}/10) : ${d <= 3 ? "reste en surface, donne l'idée, ne psychanalyse pas" : d >= 7 ? "va en profondeur — symboles, complexes, matière d'ombre" : "profondeur modérée, suggère le travail intérieur sans en faire un cours"}
- Angle (${f}/10) : ${f <= 3 ? "concret, quotidien, exploitable" : f >= 7 ? "archétypal, mythique, symbolique" : "équilibré entre pratique et symbolique"}
Respecte ces réglages. Ils l'emportent sur les défauts.`;
  } catch {
    return "";
  }
}

type Section = "portrait" | "houses" | "transits";

const SECTION_PROMPT_FR: Record<Section, string> = {
  portrait:
    "Écris un portrait cosmique long (5 à 7 paragraphes) qui tisse le Soleil, la Lune et l'Ascendant entre eux, puis ouvre sur les 3 aspects majeurs. C'est le coeur de la lecture — le lecteur doit se reconnaître, pas lire un manuel. Pas de listes. Du liant. Des phrases qui respirent.",
  houses:
    "Écris une lecture des maisons (4 à 6 paragraphes) qui regroupe les planètes par domaine de vie (identité, ressources, liens, foyer, création, travail, couple, profondeurs, horizons, vocation, réseaux, retraits). Montre ce qui est nourri, ce qui est appelé, ce qui est en tension. Pas une maison par paragraphe — un regroupement vivant.",
  transits:
    "Écris une lecture des transits du jour (3 à 4 paragraphes) qui ne prédit rien mais nomme le climat : ce qui se joue en toi cette semaine, comment les positions actuelles croisent ta carte natale. Tone d'un·e ami·e qui observe, pas d'un·e oracle.",
};

const SECTION_PROMPT_EN: Record<Section, string> = {
  portrait:
    "Write a long cosmic portrait (5 to 7 paragraphs) that weaves Sun, Moon, and Ascendant together, then opens onto the 3 major aspects. This is the heart of the reading — the reader must recognize themselves, not read a manual. No lists. Flow. Breathing sentences.",
  houses:
    "Write a houses reading (4 to 6 paragraphs) that groups planets by life domain (identity, resources, bonds, home, creation, work, partnership, depths, horizons, vocation, networks, retreats). Show what is nourished, what is called, what is in tension. Not one house per paragraph — a living grouping.",
  transits:
    "Write today's transits reading (3 to 4 paragraphs) that predicts nothing but names the climate: what is at play in you this week, how current positions cross your natal chart. Tone of a friend observing, not an oracle.",
};

export async function POST(req: NextRequest) {
  try {
    const { chartContext, voice, locale, genre, section } = (await req.json()) as {
      chartContext: string;
      voice: VoiceKey;
      locale: "fr" | "en";
      genre: string;
      section: Section;
    };

    if (!chartContext || !voice || !section) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Mix the prefs hash into the cache key so different sliders yield
    // different cached versions (otherwise the first generation locks in
    // for everyone with the same chart).
    const prefsBlock = await readPrefsStyleBlock(req, locale);
    const cacheKey = makeCacheKey({
      section, voice, locale, chartContext,
      extra: `${genre}|${prefsBlock.length > 0 ? Buffer.from(prefsBlock).toString("base64").slice(0, 24) : "default"}`,
    });
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return new Response(JSON.stringify({ text: cached, cached: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const lang = locale === "en" ? "English" : "French";
    const sectionPrompt = locale === "en" ? SECTION_PROMPT_EN[section] : SECTION_PROMPT_FR[section];

    const systemPrompt = `Tu es un·e ami·e lucide et cultivé·e qui connaît l'astrologie intimement. Pas un·e guru, pas un manuel.

Langue : ${lang}
Genre de la personne : ${genderLabel(genre)}
${genderAgreementInstruction(genre)}

${voiceBlock(voice, locale)}
${prefsBlock}
Carte natale :
${chartContext}

Tâche :
${sectionPrompt}`;

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: locale === "en" ? "Write the reading now." : "Écris la lecture maintenant.",
      maxOutputTokens: 1800,
      temperature: 0.75,
    });

    const text = result.text.trim();
    await cacheSet(cacheKey, text);

    return new Response(JSON.stringify({ text, cached: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("/api/interpretation error:", err);
    return new Response(JSON.stringify({ error: "Generation failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
