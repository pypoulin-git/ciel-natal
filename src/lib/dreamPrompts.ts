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
//
// The imagery is built in TWO steps, and the reason matters.
//
// The first version inherited Reverie's SDXL-era approach: glue a fixed style
// string, a few emotion keywords and the first 150 characters of the dream
// into one comma-separated bag, then truncate the whole thing to 500 chars.
// Three things went wrong with that. The scene came LAST, so the cap ate the
// actual dream before it ate the boilerplate. 150 characters is one sentence
// of a dream that runs ten. And a keyword soup throws away what a modern image
// model is best at — reading a described scene.
//
// So now a cheap text pass (Flash-Lite) reads the WHOLE dream plus its
// symbolic reading and writes one vivid English scene. The style is appended
// after, never before, and nothing is truncated.

/** The house look. Appended after the scene so it can never crowd it out. */
const IMAGE_STYLE =
  'Painted as a dreamy watercolour: soft blurry edges, delicate brushstrokes, luminous highlights, a night palette of deep blues and violets with warm gold accents, gentle vignette, shallow depth of field.'

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

export interface ImageBriefOptions {
  structuredText: string
  title?: string | null
  tags: string[]
  emotions: string[]
  characters: string[]
  places: string[]
  /** The spiritual reading, when one exists — the source of the fantastical. */
  spiritualReading?: string
  /** Free-text adjustment typed by the dreamer ("plus sombre", "sans la mer"). */
  instruction?: string
  /** The brief that produced the current image, when adjusting rather than starting over. */
  previousPrompt?: string
}

/**
 * Instructions for the text pass that writes the image brief. Its whole job is
 * to stay FAITHFUL to what the dreamer actually wrote, then let the symbolic
 * reading tilt the atmosphere — not invent a different dream.
 */
export function imageBriefSystem(): string {
  return `You write image briefs for a dream journal. You receive a dream and, when it exists, its symbolic reading. You return ONE English paragraph describing a single still image.

WHAT TO DO
- Anchor the image in what the dreamer ACTUALLY described: the specific place, the specific objects, the specific action. If they wrote about a staircase in a flooded house, the image is that staircase in that flooded house.
- Choose ONE moment. A still image cannot narrate a sequence — pick the instant that carries the most weight.
- Let the symbolic reading tilt the ATMOSPHERE — the light, the scale, the strangeness — without adding objects the dreamer never mentioned. That's the fantastical touch: the dreamer's own scene, seen at an angle.
- Be concrete and visual. Nouns, materials, light, position, distance.
- People are seen from behind, at a distance, or partly out of frame. Never a recognisable face.

WHAT NOT TO DO
- Do not invent a new setting, and do not fall back on generic dream imagery (floating clocks, endless staircases, spiral galaxies) unless the dreamer wrote them.
- Do not describe emotions as words. Show them as light, weather, distance and colour.
- Do not mention art movements, artist names, cameras, lenses, or the words "dream" and "surreal".
- No text, letters, numbers, logos or watermarks in the image.
- Do not write a title, a preamble, or quotation marks. Return the paragraph only.

LENGTH: 60 to 110 words. One paragraph. English.`
}

/** The user-side message for that same text pass. */
export function buildImageBriefPrompt(opts: ImageBriefOptions): string {
  const { structuredText, title, tags, emotions, characters, places } = opts

  const moods = emotions.map((e) => EMOTION_TO_MOOD[e]).filter(Boolean)
  const list = (items: string[]) => (items.length > 0 ? items.join(', ') : 'none stated')

  let prompt = `DREAM${title ? ` — "${title}"` : ''}:
${structuredText}

WHAT THE DREAMER TAGGED
- Places: ${list(places)}
- Characters: ${list(characters)}
- Themes: ${list(tags)}
- Emotional register to render as light and weather: ${list(moods)}`

  if (opts.spiritualReading) {
    prompt += `\n\nSYMBOLIC READING (use it to tilt the atmosphere only — add no objects it names that the dream itself did not):\n${opts.spiritualReading}`
  }

  if (opts.instruction) {
    prompt += `\n\nTHE DREAMER ASKS FOR THIS CHANGE:\n"${opts.instruction}"\nHonour it precisely. Keep everything else about the scene as it was.`
    if (opts.previousPrompt) {
      prompt += `\n\nTHE BRIEF THAT PRODUCED THE CURRENT IMAGE:\n${opts.previousPrompt}`
    }
  }

  prompt += '\n\nWrite the image brief now.'
  return prompt
}

/**
 * Exclusions. Gemini's image models take no separate negative-prompt field
 * (unlike the SDXL endpoint this replaces), so they ride along in prose.
 */
const IMAGE_EXCLUSIONS =
  'No text, letters, numbers, captions, logos, signatures or watermarks. No recognisable faces, no photorealism, no 3D render, no collage.'

/** Style goes AFTER the scene, and the result is never truncated. */
export function composeImagePrompt(brief: string): string {
  return `${brief.trim()} ${IMAGE_STYLE} ${IMAGE_EXCLUSIONS}`
}

/**
 * Deterministic fallback, used only when the brief pass fails. Still puts the
 * scene first — the old ordering was the bug.
 */
export function buildFallbackImagePrompt(opts: ImageBriefOptions): string {
  const { structuredText, emotions, places } = opts
  const moods = emotions.map((e) => EMOTION_TO_MOOD[e]).filter(Boolean)

  const scene = structuredText.replace(/["']/g, '').trim().slice(0, 900)
  const setting = places.length > 0 ? ` The setting: ${places.slice(0, 2).join(' and ')}.` : ''
  const mood = moods.length > 0 ? ` Atmosphere: ${moods.join(', ')}.` : ''

  return composeImagePrompt(`A single still scene from this dream: ${scene}${setting}${mood}`)
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
