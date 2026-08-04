import { NextRequest, NextResponse } from 'next/server'
import { generateImage, generateText } from 'ai'
import { google } from '@ai-sdk/google'
import {
  consumeDreamQuota,
  getSupabaseAdmin,
  loadOwnedDream,
  quotaExceededResponse,
  requirePremium,
} from '@/lib/dreamGuard'
import {
  buildFallbackImagePrompt,
  buildImageBriefPrompt,
  composeImagePrompt,
  imageBriefSystem,
  type ImageBriefOptions,
} from '@/lib/dreamPrompts'
import type { DreamInterpretationContent } from '@/lib/dreams'

// A watercolour of the dream. Generated at most once per dream unless the
// dreamer explicitly asks again, stored in a PRIVATE bucket and served through
// a signed URL — dream imagery is intimate, and the prototype's public-URL
// bucket was the wrong default.
//
// Two steps, and the reason matters. A cheap Flash-Lite pass reads the WHOLE
// dream — plus its symbolic reading, and plus any adjustment the dreamer typed
// — and writes one vivid scene. That brief is what goes to the image model.
// The first version glued a style string, a few emotion keywords and the first
// 150 characters of the dream into one bag and truncated it to 500 chars, so
// the cap ate the dream before it ate the boilerplate. Images that had nothing
// to do with the night they illustrated were the predictable result.
//
// Images are metered separately and more tightly than text: they cost more.

export const runtime = 'nodejs'
export const maxDuration = 60

const IMAGE_MODEL = 'gemini-2.5-flash-image'
const BRIEF_MODEL = 'gemini-2.5-flash-lite'

/** An adjustment is a sentence, not an essay. */
const MAX_INSTRUCTION = 300

function extensionFor(mediaType: string): string {
  if (mediaType.includes('png')) return 'png'
  if (mediaType.includes('webp')) return 'webp'
  return 'jpg'
}

/**
 * Write the scene the image model will paint. Falls back to a deterministic
 * composition if the pass fails — a missing brief must never cost the dreamer
 * the image quota they just spent.
 */
async function writeBrief(opts: ImageBriefOptions): Promise<string> {
  try {
    const { text } = await generateText({
      model: google(BRIEF_MODEL),
      system: imageBriefSystem(),
      prompt: buildImageBriefPrompt(opts),
      maxOutputTokens: 400,
      temperature: 0.8,
      providerOptions: { google: { thinkingConfig: { thinkingBudget: 0 } } },
      experimental_telemetry: { isEnabled: true, functionId: 'dream-image-brief' },
    })
    const brief = text.trim()
    if (brief.length >= 40) return composeImagePrompt(brief)
    console.error('[dream-image] brief too short, falling back')
  } catch (err) {
    console.error('[dream-image] brief pass failed:', err)
  }
  return buildFallbackImagePrompt(opts)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const guard = await requirePremium(req)
    if (!guard.ok) return guard.response

    const locale: 'fr' | 'en' = body.locale === 'en' ? 'en' : 'fr'
    const dreamId = typeof body.dreamId === 'string' ? body.dreamId : ''
    if (!dreamId) return NextResponse.json({ error: 'Missing dreamId' }, { status: 400 })

    const instruction =
      typeof body.instruction === 'string' ? body.instruction.trim().slice(0, MAX_INSTRUCTION) : ''
    // Asking for a change is asking for a new image — no need to also send force.
    const regenerating = body.force === true || instruction.length > 0

    const dream = await loadOwnedDream(dreamId, guard.userId)
    if (!dream) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const supabase = getSupabaseAdmin()

    // The current image, if any. Needed either way: to serve it untouched, or
    // to hand the adjustment pass the brief that produced it.
    const { data: existing } = await supabase
      .from('dream_images')
      .select('id, storage_path, prompt_used, width, height')
      .eq('dream_id', dreamId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // ── Already have one and nothing was asked? Fresh signed URL, spend nothing. ──
    if (!regenerating && existing?.storage_path) {
      const { data: signed } = await supabase.storage
        .from('dream-images')
        .createSignedUrl(existing.storage_path, 60 * 60)
      if (signed?.signedUrl) {
        return NextResponse.json({
          storage_path: existing.storage_path,
          url: signed.signedUrl,
          width: existing.width,
          height: existing.height,
          regenerated: false,
        })
      }
    }

    const quota = await consumeDreamQuota(guard.userId, 'image')
    if (!quota.allowed) return quotaExceededResponse(quota, locale)

    // The fantastical touch comes from the symbolic reading — the one part of
    // the feature that already knows what the dream is *about*. The prototype
    // generated the image and the interpretation from the same raw text and
    // never let one inform the other.
    let spiritualReading: string | undefined
    const { data: interpretation } = await supabase
      .from('dream_interpretations')
      .select('content')
      .eq('dream_id', dreamId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    const content = interpretation?.content as DreamInterpretationContent | null | undefined
    if (typeof content?.spiritual === 'string' && content.spiritual.trim()) {
      spiritualReading = content.spiritual.trim()
    }

    const briefOptions: ImageBriefOptions = {
      structuredText: dream.structured_text || dream.raw_text,
      title: dream.title,
      tags: (dream.tags ?? []) as string[],
      emotions: (dream.emotions ?? []) as string[],
      characters: (dream.characters ?? []) as string[],
      places: (dream.places ?? []) as string[],
      spiritualReading,
      instruction: instruction || undefined,
      previousPrompt: instruction ? (existing?.prompt_used ?? undefined) : undefined,
    }

    const fullPrompt = await writeBrief(briefOptions)

    const result = await generateImage({
      model: google.image(IMAGE_MODEL),
      prompt: fullPrompt,
      aspectRatio: '3:4',
      providerOptions: { google: { personGeneration: 'allow_adult' } },
    })

    const image = result.image
    if (!image?.uint8Array?.length) {
      console.error('[dream-image] model returned no image')
      return NextResponse.json({ error: 'Generation failed' }, { status: 502 })
    }

    const mediaType = image.mediaType || 'image/png'
    // A fresh path per generation rather than an upsert on a fixed name: an
    // adjusted image must not be shadowed by a cached copy of the one it
    // replaces. The old object is removed below, so storage stays bounded.
    const path = `${guard.userId}/${dreamId}/${Date.now()}.${extensionFor(mediaType)}`

    const { error: uploadError } = await supabase.storage
      .from('dream-images')
      .upload(path, image.uint8Array, {
        contentType: mediaType,
        upsert: true,
        cacheControl: '31536000',
      })
    if (uploadError) {
      console.error('[dream-image] upload failed:', uploadError.message)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    await supabase.from('dream_images').insert({
      dream_id: dreamId,
      storage_path: path,
      prompt_used: fullPrompt.slice(0, 2000),
      model_used: IMAGE_MODEL,
      width: 768,
      height: 1024,
    })

    // Retire the previous image now that the new one is safely stored. Done
    // after the upload so a failure never leaves the dream without a picture.
    if (existing?.id && existing.storage_path !== path) {
      await supabase.storage.from('dream-images').remove([existing.storage_path])
      await supabase.from('dream_images').delete().eq('id', existing.id)
    }

    const { data: signed } = await supabase.storage
      .from('dream-images')
      .createSignedUrl(path, 60 * 60)

    return NextResponse.json({
      storage_path: path,
      url: signed?.signedUrl ?? null,
      width: 768,
      height: 1024,
      regenerated: true,
      remaining: quota.remaining,
    })
  } catch (err) {
    console.error('/api/dream-image error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
