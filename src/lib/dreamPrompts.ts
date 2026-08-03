/**
 * Dream journal prompts — ported from the Reverie prototype and folded into
 * Natalune's own prompt furniture (voice, gender agreement, reading prefs).
 *
 * Two changes worth knowing about:
 *
 * 1. The originals were written without accents. They are re-accented here —
 *    Gemini mirrors the register of its instructions, and unaccented French
 *    made the readings drift flat.
 * 2. The "no markdown, no backticks" constraint existed in Reverie's mobile
 *    Edge Function but was lost in its web rewrite, where JSON.parse then
 *    choked on ```json fences. It is restored here AND backed by a defensive
 *    stripper (parseModelJson) — belt and braces, because a fence costs the
 *    user a whole generation.
 */

import { EMOTION_KEYS, type DreamAstroContext } from './dreams'
import { genderAgreementInstruction, genderLabel, voiceBlock, type VoiceKey } from './voicePrompts'

const JSON_ONLY_FR =
  "RÉPONSE en JSON strict, et rien d'autre : pas de markdown, pas de backticks, pas de texte avant ou après."

const JSON_ONLY_EN =
  'RESPOND in strict JSON, and nothing else: no markdown, no backticks, no text before or after.'

// ── 1. Structuring ────────────────────────────────────────────────────────
// Cheap, mechanical pass: clean up the account and pull out metadata.
// Deliberately forbidden from inventing anything — a dream journal that
// embellishes is worthless as a record.

export function structureDreamSystem(locale: 'fr' | 'en'): string {
  if (locale === 'en') {
    return `You are Natalune's dream journal assistant. You analyse the raw account of a dream and structure it.

INSTRUCTIONS:
1. Write a short, evocative title (6 words max).
2. Restructure the text into a clear, flowing narration — WITHOUT INVENTING ANYTHING.
3. Extract the main tags (themes, symbols), lowercase.
4. Identify the emotions present, using only these values: ${EMOTION_KEYS.join(', ')}.
5. List the characters mentioned or implied.
6. List the places mentioned or implied.
7. If the account is too vague (under 2 sentences, or very blurry), write 1-2 short, kind clarification questions. Otherwise return an empty array.

IMPORTANT:
- Never invent details absent from the original account. If something is unclear, leave it unclear.
- Clarification questions must be short and gentle, never interrogating.

${JSON_ONLY_EN}
{"title": "string", "structured_text": "string", "tags": ["string"], "emotions": ["string"], "characters": ["string"], "places": ["string"], "clarification_questions": ["string"]}`
  }

  return `Tu es l'assistant du journal de rêves de Natalune. Tu analyses le récit brut d'un rêve et tu le structures.

INSTRUCTIONS :
1. Génère un titre court et évocateur (6 mots maximum).
2. Restructure le texte en une narration fluide et claire, SANS RIEN INVENTER.
3. Extrais les tags principaux (thèmes, symboles), en minuscules et en français.
4. Identifie les émotions présentes, en utilisant uniquement ces valeurs : ${EMOTION_KEYS.join(', ')}.
5. Liste les personnages mentionnés ou implicites.
6. Liste les lieux mentionnés ou implicites.
7. Si le récit est trop vague (moins de 2 phrases, ou très flou), rédige 1 ou 2 questions de clarification courtes et bienveillantes. Sinon, retourne un tableau vide.

IMPORTANT :
- N'invente jamais de détail absent du récit original. Si quelque chose est flou, laisse-le flou.
- Les questions de clarification doivent être courtes et douces, jamais un interrogatoire.

${JSON_ONLY_FR}
{"title": "string", "structured_text": "string", "tags": ["string"], "emotions": ["string"], "characters": ["string"], "places": ["string"], "clarification_questions": ["string"]}`
}

export function buildStructureDreamPrompt(rawText: string, locale: 'fr' | 'en'): string {
  return locale === 'en'
    ? `Here is the raw account of the dream:\n\n"${rawText}"\n\nAnalyse and structure it following the instructions.`
    : `Voici le récit brut du rêve :\n\n"${rawText}"\n\nAnalyse et structure ce rêve selon les instructions.`
}

// ── 2. Interpretation ─────────────────────────────────────────────────────
// The heart of the feature. All THREE readings are produced in a single call
// so the gauge is free to move afterwards — the prototype regenerated on
// every slider release, which is what made it expensive.

export interface InterpretDreamOptions {
  structuredText: string
  tags: string[]
  emotions: string[]
  characters: string[]
  places: string[]
  gaugeValue: number
  locale: 'fr' | 'en'
  voice: VoiceKey
  genre: string
  /** Style block from the reader's saved preferences. May be empty. */
  prefsBlock?: string
  astro?: DreamAstroContext
}

export function interpretDreamSystem(opts: InterpretDreamOptions): string {
  const { locale, voice, genre, prefsBlock = '' } = opts
  const lang = locale === 'en' ? 'English' : 'French'

  const modes =
    locale === 'en'
      ? `1. FACTUAL — neuroscientific and psychological:
   - Sleep neuroscience (memory consolidation, emotional regulation)
   - Cognitive psychology (information processing, problem solving)
   - Behavioural patterns
   Tone: informative, measured, grounded in research.

2. SPIRITUAL — symbolic and archetypal:
   - Jungian archetypes (shadow, anima/animus, the sage, the inner child)
   - Mythological and universal symbolism
   - Dream traditions (shamanic, Sufi, Buddhist)
   - Symbolic correspondences
   Tone: poetic, evocative, respectful.

3. BLENDED — a balanced synthesis: a bridge between science and symbol.
   Tone: accessible, nuanced.`
      : `1. FACTUEL — approche neuroscientifique et psychologique :
   - Neurosciences du sommeil (consolidation mémorielle, régulation émotionnelle)
   - Psychologie cognitive (traitement de l'information, résolution de problèmes)
   - Schémas comportementaux
   Ton : informatif, mesuré, appuyé sur la recherche.

2. SPIRITUEL — approche symbolique et archétypale :
   - Archétypes jungiens (ombre, anima/animus, le sage, l'enfant intérieur)
   - Symbolisme mythologique et universel
   - Traditions oniriques (chamanique, soufie, bouddhiste)
   - Correspondances symboliques
   Ton : poétique, évocateur, respectueux.

3. MIXTE (blended) — une synthèse équilibrée : un pont entre science et symbole.
   Ton : accessible, nuancé.`

  const guardrails =
    locale === 'en'
      ? `NON-NEGOTIABLE:
- Never make a medical or psychological diagnosis. Not even a hedged one.
- Kind, curious tone — never anxiety-inducing. A frightening dream is material to explore, not a warning.
- These are avenues for reflection, never truths. Write as if that were understood.
- Each reading: 3 to 5 sentences maximum.`
      : `NON NÉGOCIABLE :
- Ne pose jamais de diagnostic médical ou psychologique. Même nuancé.
- Ton bienveillant et curieux — jamais anxiogène. Un rêve effrayant est une matière à explorer, pas un avertissement.
- Ce sont des pistes de réflexion, jamais des vérités. Écris comme si c'était entendu.
- Chaque lecture : 3 à 5 phrases maximum.`

  const header =
    locale === 'en'
      ? `You are Natalune's dream interpreter. You ALWAYS provide three distinct readings of the same dream.

Language: ${lang}
Dreamer's gender: ${genderLabel(genre)}
${genderAgreementInstruction(genre)}`
      : `Tu es l'interprète de rêves de Natalune. Tu fournis TOUJOURS trois lectures distinctes du même rêve.

Langue : ${lang}
Genre de la personne : ${genderLabel(genre)}
${genderAgreementInstruction(genre)}`

  const modesTitle = locale === 'en' ? 'INTERPRETATION MODES:' : "MODES D'INTERPRÉTATION :"
  const jsonLine = locale === 'en' ? JSON_ONLY_EN : JSON_ONLY_FR

  return `${header}

${voiceBlock(voice, locale)}
${prefsBlock}
${modesTitle}

${modes}

${guardrails}

${jsonLine}
{"factual": "string", "spiritual": "string", "blended": "string"}`
}

export function buildInterpretDreamPrompt(opts: InterpretDreamOptions): string {
  const { structuredText, tags, emotions, characters, places, gaugeValue, locale, astro } = opts
  const en = locale === 'en'

  const list = (items: string[]) => (items.length > 0 ? items.join(', ') : en ? 'none' : 'aucun')

  const leaning =
    gaugeValue < 0.33
      ? en
        ? 'factual'
        : 'factuel'
      : gaugeValue > 0.66
        ? en
          ? 'spiritual'
          : 'spirituel'
        : en
          ? 'balanced'
          : 'équilibré'

  let prompt = en
    ? `DREAM:
"${structuredText}"

METADATA:
- Tags: ${list(tags)}
- Emotions detected: ${list(emotions)}
- Characters: ${list(characters)}
- Places: ${list(places)}
- The dreamer leans: ${leaning}`
    : `RÊVE :
"${structuredText}"

MÉTADONNÉES :
- Tags : ${list(tags)}
- Émotions détectées : ${list(emotions)}
- Personnages : ${list(characters)}
- Lieux : ${list(places)}
- Préférence du rêveur : ${leaning}`

  // The natal block is what no other dream journal can offer: Natalune
  // already holds this person's chart. Only added when we actually have it.
  if (astro?.moonSign || astro?.sunSign || astro?.ascendant) {
    const lines: string[] = []
    if (astro.moonSign) {
      lines.push(
        en
          ? `- Natal Moon in ${astro.moonSign} (shapes recurring dream themes)`
          : `- Lune natale en ${astro.moonSign} (colore les thèmes oniriques récurrents)`,
      )
    }
    if (astro.sunSign) {
      lines.push(
        en
          ? `- Sun in ${astro.sunSign} (the dreamer's identity)`
          : `- Soleil en ${astro.sunSign} (identité du rêveur)`,
      )
    }
    if (astro.ascendant) {
      lines.push(
        en
          ? `- Ascendant in ${astro.ascendant} (perceptual filter)`
          : `- Ascendant en ${astro.ascendant} (filtre perceptif)`,
      )
    }
    prompt += en
      ? `\n\nNATAL CONTEXT:\n${lines.join('\n')}\nWeave these correspondences into the SPIRITUAL reading, subtly — one touch, not a horoscope. Leave the factual reading untouched by them.`
      : `\n\nCONTEXTE NATAL :\n${lines.join('\n')}\nIntègre subtilement ces correspondances dans la lecture SPIRITUELLE — une touche, pas un horoscope. La lecture factuelle n'en tient pas compte.`
  }

  prompt += en
    ? '\n\nInterpret this dream in all three modes now.'
    : '\n\nInterprète ce rêve selon les trois modes maintenant.'

  return prompt
}

// ── 3. Image prompt ───────────────────────────────────────────────────────
// Watercolour night imagery. English on purpose — image models are trained
// predominantly on English captions.

const STYLE_PREFIX =
  'dreamy watercolor painting, soft blurry edges, ethereal atmosphere, night palette with deep blues violets and warm gold accents, vignette effect, depth of field, delicate brushstrokes, luminous highlights'

const NEGATIVE_PROMPT =
  'text, watermark, signature, logo, ugly, deformed, disfigured, blurry face, realistic photo, sharp edges, neon colors, bright daylight, cartoon, anime, 3d render'

const EMOTION_TO_MOOD: Record<string, string> = {
  joy: 'warm golden light, radiant',
  anxiety: 'swirling shadows, tension',
  wonder: 'sparkling stars, vast expanses',
  sadness: 'gentle rain, melancholy blue tones',
  fear: 'dark corridors, mysterious shadows',
  peace: 'calm waters, soft moonlight',
  love: 'warm rose tones, gentle embrace',
  anger: 'stormy skies, intense warm tones',
}

export function buildImagePrompt(
  structuredText: string,
  tags: string[],
  emotions: string[],
  places: string[],
): { prompt: string; negativePrompt: string } {
  const visualElements: string[] = []

  if (places.length > 0) visualElements.push(places.slice(0, 2).join(' and '))
  for (const emotion of emotions) {
    const mood = EMOTION_TO_MOOD[emotion]
    if (mood) visualElements.push(mood)
  }
  if (tags.length > 0) visualElements.push(tags.slice(0, 3).join(', '))

  const sceneSnippet = structuredText.replace(/['"]/g, '').slice(0, 150).trim()
  const prompt = `${STYLE_PREFIX}, ${visualElements.join(', ')}, ${sceneSnippet}`

  return { prompt: prompt.slice(0, 500), negativePrompt: NEGATIVE_PROMPT }
}

// ── Shared: tolerant JSON parsing ─────────────────────────────────────────

/**
 * Parse a model response that is supposed to be pure JSON. Strips markdown
 * fences and any prose around the object before parsing, because losing a
 * whole generation to a stray ```json is not an acceptable failure mode.
 * Returns null rather than throwing — callers decide what a miss means.
 */
export function parseModelJson<T>(raw: string): T | null {
  const trimmed = raw.trim()
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  const candidates = [withoutFence]
  const first = withoutFence.indexOf('{')
  const last = withoutFence.lastIndexOf('}')
  if (first !== -1 && last > first) candidates.push(withoutFence.slice(first, last + 1))

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as T
    } catch {
      /* try the next shape */
    }
  }
  return null
}
