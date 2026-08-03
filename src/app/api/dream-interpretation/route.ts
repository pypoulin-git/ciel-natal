import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import {
  consumeDreamQuota,
  getSupabaseAdmin,
  loadAstroContext,
  loadOwnedDream,
  quotaExceededResponse,
  requirePremium,
} from '@/lib/dreamGuard'
import { buildInterpretDreamPrompt, interpretDreamSystem, parseModelJson } from '@/lib/dreamPrompts'
import { readPrefsStyleBlock, readUserPrefs } from '@/lib/readingPrefs'
import { cacheGet, cacheSet, makeCacheKey } from '@/lib/interpCache'
import type { DreamInterpretationContent } from '@/lib/dreams'
import type { VoiceKey } from '@/lib/voicePrompts'

// The heart of the feature: three readings of one dream, generated together
// in a SINGLE call, enriched with the dreamer's own natal Moon/Sun/Ascendant.
//
// Two deliberate economies, both regressions in the prototype this replaces:
//   1. If an interpretation already exists, return it. It re-ran the model on
//      every page view.
//   2. All three readings come back at once, so moving the gauge afterwards is
//      free. It fired a fresh call on every slider release.

export const runtime = 'nodejs'
export const maxDuration = 60

const MODEL = 'gemini-2.5-flash'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const guard = await requirePremium(req)
    if (!guard.ok) return guard.response

    const locale: 'fr' | 'en' = body.locale === 'en' ? 'en' : 'fr'
    const dreamId = typeof body.dreamId === 'string' ? body.dreamId : ''
    if (!dreamId) return NextResponse.json({ error: 'Missing dreamId' }, { status: 400 })

    const dream = await loadOwnedDream(dreamId, guard.userId)
    if (!dream) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const supabase = getSupabaseAdmin()

    // ── 1. Already generated? Serve it. ──
    // `force: true` (the "regenerate" button) skips this, but still pays quota.
    if (body.force !== true) {
      const { data: existing } = await supabase
        .from('dream_interpretations')
        .select('content, model_used, astro_used, created_at')
        .eq('dream_id', dreamId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (existing?.content) {
        return NextResponse.json({ ...existing, regenerated: false })
      }
    }

    // ── 2. Quota, before we spend anything ──
    const quota = await consumeDreamQuota(guard.userId, 'interpretation')
    if (!quota.allowed) return quotaExceededResponse(quota, locale)

    // ── 3. Context: the reader's voice, their sliders, and their chart ──
    const prefs = await readUserPrefs(req)
    const prefsBlock = await readPrefsStyleBlock(req, locale)
    const voice: VoiceKey = prefs?.voice ?? 'sensible'
    const genre = typeof prefs?.genre === 'string' ? prefs.genre : 'non-binaire'
    const astro = await loadAstroContext(guard.userId)

    const structuredText = dream.structured_text || dream.raw_text
    const options = {
      structuredText,
      tags: (dream.tags ?? []) as string[],
      emotions: (dream.emotions ?? []) as string[],
      characters: (dream.characters ?? []) as string[],
      places: (dream.places ?? []) as string[],
      gaugeValue: typeof dream.gauge_value === 'number' ? dream.gauge_value : 0.5,
      locale,
      voice,
      genre,
      prefsBlock,
      astro: astro ?? undefined,
    }

    // ── 4. Cache. Two people can dream the same dream; more usefully, a
    // regeneration with unchanged inputs shouldn't cost a second call. ──
    const cacheKey = makeCacheKey({
      section: 'dream',
      voice,
      locale,
      chartContext: structuredText,
      extra: `${genre}|${astro?.moonSign ?? ''}|${astro?.sunSign ?? ''}|${astro?.ascendant ?? ''}|${prefsBlock.length}`,
    })
    const cached = await cacheGet(cacheKey)
    let content = cached ? parseModelJson<DreamInterpretationContent>(cached) : null

    // ── 5. Generate ──
    if (!content) {
      const { text } = await generateText({
        model: google(MODEL),
        system: interpretDreamSystem(options),
        prompt: buildInterpretDreamPrompt(options),
        maxOutputTokens: 1400,
        temperature: 0.75,
        providerOptions: { google: { thinkingConfig: { thinkingBudget: 0 } } },
        experimental_telemetry: { isEnabled: true, functionId: 'dream-interpretation' },
      })
      content = parseModelJson<DreamInterpretationContent>(text)
      if (!content?.factual || !content?.spiritual || !content?.blended) {
        console.error('[dream-interpretation] incomplete model output')
        return NextResponse.json({ error: 'Generation failed' }, { status: 502 })
      }
      await cacheSet(cacheKey, JSON.stringify(content))
    }

    // ── 6. Persist, so the next visit is free ──
    const astroUsed = Boolean(astro)
    const { data: saved } = await supabase
      .from('dream_interpretations')
      .insert({
        dream_id: dreamId,
        content,
        model_used: MODEL,
        astro_used: astroUsed,
      })
      .select('content, model_used, astro_used, created_at')
      .single()

    return NextResponse.json({
      content,
      model_used: MODEL,
      astro_used: astroUsed,
      created_at: saved?.created_at ?? new Date().toISOString(),
      regenerated: true,
      remaining: quota.remaining,
    })
  } catch (err) {
    console.error('/api/dream-interpretation error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
