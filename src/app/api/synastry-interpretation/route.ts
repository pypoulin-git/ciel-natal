import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { NextRequest } from "next/server";
import { cacheGet, cacheSet, makeCacheKey } from "@/lib/interpCache";
import { voiceBlock, genderAgreementInstruction, type VoiceKey } from "@/lib/voicePrompts";

export type RelationType = "amour" | "amitie" | "famille" | "professionnel" | "indetermine";

const RELATION_FRAME_FR: Record<RelationType, string> = {
  amour:
    "Contexte relationnel : amour. Lis cette synastrie comme on lit une histoire d'amour — désir, intimité, projection, sexualité, engagement. Ce qui attire physiquement et émotionnellement, ce qui peut blesser, ce qui se construit dans la durée comme couple.",
  amitie:
    "Contexte relationnel : amitié. Lis cette synastrie comme on regarde une amitié vraie — complicité, loyauté, ce qu'on s'apporte mutuellement, ce qui peut user à long terme. Pas de lecture romantique ou sexuelle.",
  famille:
    "Contexte relationnel : famille (parent–enfant, fratrie, ou famille proche). Lis cette synastrie comme un lien familial — héritage, schémas qui se rejouent, blessures héritées et ressources transmises, distance saine vs fusion.",
  professionnel:
    "Contexte relationnel : professionnel (collègue, associé, mentor). Lis cette synastrie comme une dynamique de travail — complémentarités, conflits productifs, styles de décision, terrains où collaborer crée vs épuise.",
  indetermine:
    "Contexte relationnel : non précisé. Lis la synastrie de manière neutre, en couvrant les dynamiques qui pourraient se jouer en amour, amitié ou famille selon ce qui ressort des cartes.",
};

const RELATION_FRAME_EN: Record<RelationType, string> = {
  amour:
    "Relationship type: romantic love. Read this synastry like a love story — desire, intimacy, projection, sexuality, long-term commitment. What physically and emotionally attracts, what hurts, what builds as a couple.",
  amitie:
    "Relationship type: friendship. Read this synastry as a real friendship — companionship, loyalty, mutual nourishment, what may grind down over time. No romantic or sexual framing.",
  famille:
    "Relationship type: family (parent–child, siblings, close family). Read this as a family bond — inheritance, repeating patterns, inherited wounds and gifts, healthy distance vs fusion.",
  professionnel:
    "Relationship type: professional (coworker, partner, mentor). Read this as a work dynamic — complementary skills, productive conflict, decision styles, where collaboration sparks vs drains.",
  indetermine:
    "Relationship type: unspecified. Read the synastry neutrally, covering dynamics that could play out across love, friendship or family depending on what surfaces from the charts.",
};

export async function POST(req: NextRequest) {
  try {
    const { contextA, contextB, crossAspects, prenomA, prenomB, voice, locale, genreA, genreB, relationType } =
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
        relationType?: RelationType;
      };

    if (!contextA || !contextB || !crossAspects) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const safeRelation: RelationType =
      relationType && ["amour", "amitie", "famille", "professionnel", "indetermine"].includes(relationType)
        ? relationType
        : "indetermine";

    const cacheKey = makeCacheKey({
      section: "synastry",
      voice,
      locale,
      chartContext: `${contextA}|${contextB}|${safeRelation}`,
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

    const relationFrame =
      locale === "en" ? RELATION_FRAME_EN[safeRelation] : RELATION_FRAME_FR[safeRelation];

    const systemPrompt = `Tu es un·e ami·e lucide qui lit la synastrie entre deux personnes.

Langue : ${lang}
${prenomA} — ${genderAgreementInstruction(genreA)}
${prenomB} — ${genderAgreementInstruction(genreB)}

${relationFrame}

${voiceBlock(voice, locale)}

Carte de ${prenomA} :
${contextA}

Carte de ${prenomB} :
${contextB}

Aspects inter-cartes :
${crossAspects}

Tâche : écris 5 sections riches et incarnées, dans cet ordre exact et avec ces titres :
${sections.join("\n")}

Pour chaque section : 2 à 4 paragraphes pleins, charnus, qui prennent leur temps. Cite des planètes, des signes, des aspects précis quand ils éclairent ton propos — n'écris pas en abstraction. Adresse-toi à la fois à ${prenomA} et à ${prenomB} (utilise leurs prénoms quand tu pivotes). Pas de prédictions. Pas de verdict du genre "vous êtes faits l'un pour l'autre". Pas de listes à puces — du liant, des phrases qui respirent. Termine par une dernière ligne de respiration, jamais coupée mid-phrase.`;

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: locale === "en" ? "Write the synastry reading now." : "Écris la lecture de synastrie maintenant.",
      // Bumped from 2200 — PY reported the previous response truncated
      // mid-sentence ("qui vous invite à grandir et à vous révéler l'un-e…").
      // 5 sections × 3-4 paragraphs needs more headroom.
      maxOutputTokens: 4096,
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
