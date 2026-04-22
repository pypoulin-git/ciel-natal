import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { NextRequest } from "next/server";
import { cacheGet, cacheSet, makeCacheKey } from "@/lib/interpCache";
import { voiceBlock, genderAgreementInstruction, type VoiceKey } from "@/lib/voicePrompts";

export async function POST(req: NextRequest) {
  try {
    const { contextA, contextB, crossAspects, prenomA, prenomB, voice, locale, genreA, genreB } =
      (await req.json()) as {
        contextA: string;
        contextB: string;
        crossAspects: string;
        prenomA: string;
        prenomB: string;
        voice: VoiceKey;
        locale: "fr" | "en";
        genreA: string;
        genreB: string;
      };

    if (!contextA || !contextB || !crossAspects) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cacheKey = makeCacheKey({
      section: "synastry",
      voice,
      locale,
      chartContext: `${contextA}|${contextB}`,
      extra: crossAspects,
    });
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return new Response(JSON.stringify({ text: cached, cached: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const lang = locale === "en" ? "English" : "French";
    const sections =
      locale === "en"
        ? [
            "**What draws you in** — the placements that attract and light each other up.",
            "**What rubs** — the creative tensions, the misalignments that aren't flaws but signals.",
            "**What you build together** — the shared terrain, the projects your charts support.",
            "**Blind spots** — what each of you risks not seeing in the other.",
            "**The wager** — what this relationship invites you both to become.",
          ]
        : [
            "**Ce qui attire** — les placements qui s'allument l'un l'autre.",
            "**Ce qui frotte** — les tensions créatrices, les désalignements qui ne sont pas des défauts mais des signaux.",
            "**Ce que vous construisez** — le terrain partagé, les projets que vos cartes soutiennent.",
            "**Zones d'angle mort** — ce que chacun·e risque de ne pas voir chez l'autre.",
            "**Le pari** — ce que cette relation vous invite à devenir.",
          ];

    const systemPrompt = `Tu es un·e ami·e lucide qui lit la synastrie entre deux personnes.

Langue : ${lang}
${prenomA} — ${genderAgreementInstruction(genreA)}
${prenomB} — ${genderAgreementInstruction(genreB)}

${voiceBlock(voice, locale)}

Carte de ${prenomA} :
${contextA}

Carte de ${prenomB} :
${contextB}

Aspects inter-cartes :
${crossAspects}

Tâche : écris 5 sections courtes et denses, dans cet ordre exact et avec ces titres :
${sections.join("\n")}

Chaque section : 2 à 3 paragraphes. Adresse-toi au lecteur (celui/celle qui lit). Pas de prédictions. Pas de verdict "vous êtes faits l'un pour l'autre". Juste ce qui se joue.`;

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      prompt: locale === "en" ? "Write the synastry reading now." : "Écris la lecture de synastrie maintenant.",
      maxOutputTokens: 2200,
      temperature: 0.75,
    });

    const text = result.text.trim();
    await cacheSet(cacheKey, text);

    return new Response(JSON.stringify({ text, cached: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("/api/synastry-interpretation error:", err);
    return new Response(JSON.stringify({ error: "Generation failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
