import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { requirePremium } from '@/lib/dreamGuard'
import { buildStructureDreamPrompt, parseModelJson, structureDreamSystem } from '@/lib/dreamPrompts'
import { sanitizeEmotions, type DreamStructure } from '@/lib/dreams'

// Turn a raw, half-awake account into a title, a clean narration and metadata.
// Not quota-metered: it is Flash-Lite on a few hundred tokens, and charging a
// paying member a quota unit just to tidy their text would be mean. The
// Premium gate and the 5000-character cap keep it bounded.

export const runtime = 'nodejs'
export const maxDuration = 30

function cleanStrings(input: unknown, max: number, maxLength = 60): string[] {
  if (!Array.isArray(input)) return []
  return input
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().slice(0, maxLength))
    .filter(Boolean)
    .slice(0, max)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const guard = await requirePremium(req)
    if (!guard.ok) return guard.response

    const locale: 'fr' | 'en' = body.locale === 'en' ? 'en' : 'fr'
    const rawText = typeof body.rawText === 'string' ? body.rawText.trim().slice(0, 5000) : ''
    if (!rawText) {
      return NextResponse.json({ error: 'Missing rawText' }, { status: 400 })
    }

    const { text } = await generateText({
      // Structuring is mechanical extraction, not prose — Flash-Lite is plenty,
      // same call as the daily forecast cron.
      model: google('gemini-2.5-flash-lite'),
      system: structureDreamSystem(locale),
      prompt: buildStructureDreamPrompt(rawText, locale),
      maxOutputTokens: 1200,
      temperature: 0.4,
      // No thinking: reasoning tokens would eat the budget and can return an
      // empty body (the bug fixed for the chat route).
      providerOptions: { google: { thinkingConfig: { thinkingBudget: 0 } } },
      experimental_telemetry: { isEnabled: true, functionId: 'dream-structure' },
    })

    const parsed = parseModelJson<Partial<DreamStructure>>(text)
    if (!parsed) {
      console.error('[dream-structure] unparseable model output')
      return NextResponse.json({ error: 'Generation failed' }, { status: 502 })
    }

    const structure: DreamStructure = {
      title:
        typeof parsed.title === 'string' && parsed.title.trim()
          ? parsed.title.trim().slice(0, 120)
          : locale === 'en'
            ? 'Untitled dream'
            : 'Rêve sans titre',
      structured_text:
        typeof parsed.structured_text === 'string' && parsed.structured_text.trim()
          ? parsed.structured_text.trim().slice(0, 8000)
          : rawText,
      tags: cleanStrings(parsed.tags, 12),
      emotions: sanitizeEmotions(parsed.emotions),
      characters: cleanStrings(parsed.characters, 12),
      places: cleanStrings(parsed.places, 12),
      clarification_questions: cleanStrings(parsed.clarification_questions, 2, 160),
    }

    return NextResponse.json(structure)
  } catch (err) {
    console.error('/api/dream-structure error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
