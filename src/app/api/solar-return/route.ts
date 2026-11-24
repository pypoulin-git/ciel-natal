import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { NextRequest, NextResponse } from "next/server";
import { cacheGet, cacheSet, makeCacheKey } from "@/lib/interpCache";
import { voiceBlock, genderAgreementInstruction, type VoiceKey } from "@/lib/voicePrompts";
import { readPrefsStyleBlock } from "@/lib/readingPrefs";
import { requirePremium, clampInt } from "@/lib/dreamGuard";
import { getPremiumRateLimit } from "@/lib/ratelimit";
import { singleLine } from "@/lib/security";
import { computeSolarReturn, serializeSolarReturn, type BirthInput } from "@/lib/solarReturn";

// The reading is recomputed here from the birth data rather than trusting a
// chart summary sent by the browser: the prompt only ever sees numbers we
// produced ourselves, and the cache key follows the real chart.

const VOICES: VoiceKey[] = ["sensible", "mystique", "pragmatique"];

function num(v: unknown, lo: number, hi: number): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n >= lo && n <= hi ? n : null;
}

export async function POST(req: NextRequest) {
  const guard = await requirePremium(req);
  if (!guard.ok) return guard.response;

  const rl = getPremiumRateLimit();
  if (rl) {
    const { success } = await rl.limit(`solar-return:${guard.userId}`);
    if (!success) return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const b = (body.birth ?? {}) as Record<string, unknown>;
    const p = (body.place ?? {}) as Record<string, unknown>;

    const year = clampInt(b.year, 1900, 2100);
    const month = clampInt(b.month, 1, 12);
    const day = clampInt(b.day, 1, 31);
    const hour = clampInt(b.hour, 0, 23) ?? 12;
    const minute = clampInt(b.minute, 0, 59) ?? 0;
    const lat = num(b.latitude, -90, 90);
    const lon = num(b.longitude, -180, 180);
    const placeLat = num(p.latitude, -90, 90);
    const placeLon = num(p.longitude, -180, 180);
    const offset = clampInt(body.offset, 0, 1) ?? 0;
    if (year == null || month == null || day == null || lat == null || lon == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const birth: BirthInput = {
      year,
      month,
      day,
      hour,
      minute,
      hasTime: b.hasTime !== false,
      latitude: lat,
      longitude: lon,
    };
    const sr = computeSolarReturn(
      birth,
      { latitude: placeLat ?? lat, longitude: placeLon ?? lon },
      new Date(),
      offset,
    );
    const context = serializeSolarReturn(sr);

    const locale = body.locale === "en" ? "en" : "fr";
    const voice: VoiceKey = VOICES.includes(body.voice as VoiceKey) ? (body.voice as VoiceKey) : "sensible";
    const prenom = singleLine(typeof body.prenom === "string" ? body.prenom : "").slice(0, 40);
    const genre = typeof body.genre === "string" ? body.genre.slice(0, 10) : "nb";
    const yearLabel = `${sr.start.getUTCFullYear()}-${sr.end.getUTCFullYear()}`;

    const cacheKey = makeCacheKey({
      section: `solar-return-v2-${yearLabel}`,
      voice,
      locale,
      chartContext: context,
      extra: prenom,
    });
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json({ text: cached, cached: true });

    const sections =
      locale === "en"
        ? [
            "**The tone of the year**: what the return Ascendant, Midheaven and angular planets say about how this year feels and how you'll come across.",
            "**Where it happens**: the life areas the year loads (Sun's house, busiest houses, the lord of the year and where it sits). Concrete.",
            "**Season by season**: walk through the year in four seasons from the start date, using the dated sky events (eclipses, retrogrades) and the house each falls in. Name the months.",
            "**What the year asks of you**: two or three sentences, an invitation, not a prediction.",
          ]
        : [
            "**Le ton de l'année** : ce que l'Ascendant, le Milieu du Ciel et les planètes angulaires de la révolution disent de l'ambiance de l'année et de la façon dont tu vas la traverser.",
            "**Là où ça se passe** : les domaines de vie que l'année charge (maison du Soleil, maisons les plus occupées, maître de l'année et sa position). Concret.",
            "**Saison par saison** : parcours l'année en quatre saisons à partir de la date de début, en t'appuyant sur les temps forts datés (éclipses, rétrogradations) et la maison où chacun tombe. Nomme les mois.",
            "**Ce que l'année te demande** : deux ou trois phrases, une invitation, pas une prédiction.",
          ];

    const prefsStyleBlock = await readPrefsStyleBlock(req, locale);
    const who = prenom || (locale === "en" ? "the reader" : "la personne");

    const system = `Tu es un·e astrologue lucide et chaleureux·se qui lit la révolution solaire de ${who} pour son année ${yearLabel}.

Langue : ${locale === "en" ? "English" : "français (Québec, tutoiement)"}
${genderAgreementInstruction(genre)}

${voiceBlock(voice, locale)}
${prefsStyleBlock}

Données calculées (révolution solaire, natal et temps forts de l'année) :
${context}

Règles :
- C'est une lecture d'UNE année, pas un portrait de vie. Parle de « ton année », au présent et au futur proche.
- La révolution module le natal, elle ne le remplace pas : relie au moins deux fois un point de l'année à un point natal.
- N'invente aucune position ni date absente des données. Si l'heure de naissance manque (pas d'Ascendant), dis-le simplement et lis surtout les signes et le calendrier.
- Aucune prédiction déterministe (santé, argent, rupture). Des tendances, des fenêtres, des invitations.
- Environ 650 mots. Écris 4 sections, dans cet ordre, avec ces titres en gras sur leur propre ligne :
${sections.join("\n")}`;

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      system,
      prompt: locale === "en" ? "Write the solar return reading now." : "Écris la lecture de révolution solaire maintenant.",
      maxOutputTokens: 1800,
      temperature: 0.7,
      experimental_telemetry: { isEnabled: true, functionId: "solar-return" },
    });

    const text = result.text.trim();
    if (text) await cacheSet(cacheKey, text);
    return NextResponse.json({ text, cached: false });
  } catch (err) {
    console.error("/api/solar-return error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
