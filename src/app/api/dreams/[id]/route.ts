import { NextRequest, NextResponse } from 'next/server'
import { clampInt, cleanStringArray, getSupabaseAdmin, requireUser } from '@/lib/dreamGuard'
import { sanitizeEmotions } from '@/lib/dreams'

// A single dream, with whatever has already been generated for it. The detail
// page calls this ONCE on mount and only asks for generation if these come
// back empty — the prototype re-ran the model on every page view instead.

export const runtime = 'nodejs'

const SELECT_COLUMNS =
  'id, title, raw_text, structured_text, dream_date, emotional_intensity, lucidity_level, sleep_quality, tags, emotions, characters, places, gauge_value, created_at, updated_at'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireUser(req)
  if (!guard.ok) return guard.response

  const supabase = getSupabaseAdmin()
  const { data: dream, error } = await supabase
    .from('dreams')
    .select(SELECT_COLUMNS)
    .eq('id', id)
    .eq('user_id', guard.userId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!dream) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: interpretation } = await supabase
    .from('dream_interpretations')
    .select('content, model_used, astro_used, created_at')
    .eq('dream_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: image } = await supabase
    .from('dream_images')
    .select('storage_path, width, height')
    .eq('dream_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let imageUrl: string | null = null
  if (image?.storage_path) {
    const { data: signed } = await supabase.storage
      .from('dream-images')
      .createSignedUrl(image.storage_path, 60 * 60) // 1h
    imageUrl = signed?.signedUrl ?? null
  }

  return NextResponse.json({
    dream,
    interpretation: interpretation ?? null,
    image: image ? { ...image, url: imageUrl } : null,
  })
}

// PATCH — edit a dream. Free members keep a hand-written journal, so the text
// and its metadata have to stay correctable: you remember a detail at noon
// that you missed at 6am. Only the fields explicitly listed here can change.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const guard = await requireUser(req)
    if (!guard.ok) return guard.response

    const body = await req.json()
    const update: Record<string, unknown> = {}

    if (typeof body.gaugeValue === 'number' && Number.isFinite(body.gaugeValue)) {
      update.gauge_value = Math.min(1, Math.max(0, body.gaugeValue))
    }
    if (typeof body.title === 'string') {
      update.title = body.title.trim().slice(0, 120) || null
    }
    if (typeof body.rawText === 'string') {
      const rawText = body.rawText.trim().slice(0, 5000)
      if (!rawText) {
        return NextResponse.json({ error: 'rawText cannot be emptied' }, { status: 400 })
      }
      update.raw_text = rawText
    }
    if (typeof body.dreamDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.dreamDate)) {
      update.dream_date = body.dreamDate
    }
    if (body.emotions !== undefined) update.emotions = sanitizeEmotions(body.emotions)
    if (body.tags !== undefined) update.tags = cleanStringArray(body.tags, 12)
    if (body.characters !== undefined) update.characters = cleanStringArray(body.characters, 12)
    if (body.places !== undefined) update.places = cleanStringArray(body.places, 12)

    for (const [key, column, hi] of [
      ['emotionalIntensity', 'emotional_intensity', 10],
      ['lucidityLevel', 'lucidity_level', 5],
      ['sleepQuality', 'sleep_quality', 5],
    ] as const) {
      if (body[key] !== undefined) update[column] = clampInt(body[key], 1, hi)
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('dreams')
      .update(update)
      .eq('id', id)
      .eq('user_id', guard.userId) // ownership enforced
      .select(SELECT_COLUMNS)
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ dream: data })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// DELETE — remove a dream. Interpretations and images cascade in the schema;
// the stored image file has to be cleaned up by hand.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireUser(req)
  if (!guard.ok) return guard.response

  const supabase = getSupabaseAdmin()
  const { data: dream } = await supabase
    .from('dreams')
    .select('id')
    .eq('id', id)
    .eq('user_id', guard.userId)
    .maybeSingle()
  if (!dream) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: images } = await supabase
    .from('dream_images')
    .select('storage_path')
    .eq('dream_id', id)
  const paths = (images ?? []).map((row) => row.storage_path).filter(Boolean)
  if (paths.length > 0) {
    await supabase.storage.from('dream-images').remove(paths)
  }

  const { error } = await supabase.from('dreams').delete().eq('id', id).eq('user_id', guard.userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
