import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { NextRequest } from "next/server";
import { cacheGet, cacheSet, makeCacheKey } from "@/lib/interpCache";
import { voiceBlock, genderAgreementInstruction, type VoiceKey } from "@/lib/voicePrompts";

export async function POST(req: NextRequest) {
  try {
    const { natalContext, returnContext, prenom, year, voice, locale, genre } =
      (await req.json()) as {
        natalContext: string;
        returnContext: string;
        prenom: string;
        year: number;
        voice: VoiceKey;
        locale: "fr" | "en";
        genre: string;
      };

    if (!natalContext || !returnContext) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cacheKey = makeCacheKey({
      section: `solar-return-${year}`,
      voice,
      locale,
      chartContext: natalContext,
      extra: returnContext,
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
            "**Themes of the year** — what colors the months ahead, anchored in the Ascendant and MC of the solar return.",
            "**Key months** — when the year's tensions concentrate, when the openings widen.",
            "**The invitation** — what this year is asking of you, not predicting of you.",
          ]
        : [
            "**Thèmes de l'année** — ce qui colore les mois à venir, ancré dans l'Ascendant et le MC de la révolution.",
            "**Mois-clés** — quand les tensions de l'année se concentrent, quand les ouvertures s'élargissent.",
            "**L'invitation** — ce que cette année te demande, pas ce qu'elle te prédit.",
          ];

    const systemPrompt = `Tu es un·e ami·e lucide qui lit la révolution solaire de ${prenom} pour l'année ${year}.

Langue : ${lang}
${genderAgreementInstruction(genre)}

${voiceBlock(voice, locale)}

Carte natale :
${natalContext}

Carte de la révolution solaire ${year} :
${returnContext}

Tâche : écris 3 sections dans cet ordre et avec ces titres :
${sections.join("\n")}

Environ 500 mots au total. Adresse directe (tu). Pas de prédictions déterministes. Tisse natal et révolution ensemble — la révolution module le natal, elle ne le remplace pas.`;

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      prompt: locale === "en" ? "Write the solar return reading now." : "Écris la lecture de révolution solaire maintenant.",
      maxOutputTokens: 1200,
      temperature: 0.75,
    });

    const text = result.text.trim();
    await cacheSet(cacheKey, text);

    return new Response(JSON.stringify({ text, cached: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("/api/solar-return error:", err);
    return new Response(JSON.stringify({ error: "Generation failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
