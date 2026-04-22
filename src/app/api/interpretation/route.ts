import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { NextRequest } from "next/server";
import { cacheGet, cacheSet, makeCacheKey } from "@/lib/interpCache";
import { voiceBlock, genderLabel, genderAgreementInstruction, type VoiceKey } from "@/lib/voicePrompts";

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

    const cacheKey = makeCacheKey({ section, voice, locale, chartContext, extra: genre });
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

Carte natale :
${chartContext}

Tâche :
${sectionPrompt}`;

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
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
