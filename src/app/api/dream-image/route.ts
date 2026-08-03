import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from 'ai'
import { google } from '@ai-sdk/google'
import {
  consumeDreamQuota,
  getSupabaseAdmin,
  loadOwnedDream,
  quotaExceededResponse,
  requirePremium,
} from '@/lib/dreamGuard'
import { buildImagePrompt } from '@/lib/dreamPrompts'

// A watercolour of the dream. Generated at most once per dream unless the
// dreamer explicitly asks again, stored in a PRIVATE bucket and served through
// a signed URL — dream imagery is intimate, and the prototype's public-URL
// bucket was the wrong default.
//
// Images are metered separately and more tightly than text: they cost more.

export const runtime = 'nodejs'
export const maxDuration = 60

const MODEL = 'gemini-2.5-flash-image'

function extensionFor(mediaType: string): string {
  if (mediaType.includes('png')) return 'png'
  if (mediaType.includes('webp')) return 'webp'
  return 'jpg'
}

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

    // ── Already have one? Hand back a fresh signed URL, spend nothing. ──
    if (body.force !== true) {
      const { data: existing } = await supabase
        .from('dream_images')
        .select('storage_path, width, height')
        .eq('dream_id', dreamId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (existing?.storage_path) {
        const { data: signed } = await supabase.storage
          .from('dream-images')
          .createSignedUrl(existing.storage_path, 60 * 60)
        if (signed?.signedUrl) {
          return NextResponse.json({ ...existing, url: signed.signedUrl, regenerated: false })
        }
      }
    }

    const quota = await consumeDreamQuota(guard.userId, 'image')
    if (!quota.allowed) return quotaExceededResponse(quota, locale)

    const { prompt, negativePrompt } = buildImagePrompt(
      dream.structured_text || dream.raw_text,
      (dream.tags ?? []) as string[],
      (dream.emotions ?? []) as string[],
      (dream.places ?? []) as string[],
    )

    // Gemini image models take no separate negative-prompt field (unlike the
    // SDXL endpoint this replaces), so the exclusions ride along in prose.
    const fullPrompt = `${prompt}. Avoid: ${negativePrompt}.`

    const result = await generateImage({
      model: google.image(MODEL),
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
    const path = `${guard.userId}/${dreamId}/image.${extensionFor(mediaType)}`

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
      prompt_used: fullPrompt.slice(0, 1000),
      model_used: MODEL,
      width: 768,
      height: 1024,
    })

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
