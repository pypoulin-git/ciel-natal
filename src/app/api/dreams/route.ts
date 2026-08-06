import { NextRequest, NextResponse } from 'next/server'
import {
  clampInt,
  cleanStringArray,
  getSupabaseAdmin,
  requireUser,
  DREAM_MONTHLY_LIMIT,
  DREAM_IMAGE_MONTHLY_LIMIT,
} from '@/lib/dreamGuard'
import { sanitizeEmotions } from '@/lib/dreams'

// Dream journal CRUD. Same shape as /api/calendar-events: Bearer verified
// first, admin client for the query, ownership enforced on every operation.
//
// Recording a dream is FREE — any signed-in member keeps a manual journal, and
// a lapsed Premium never loses theirs. What Premium buys is the AI on top:
// structuring, the three readings, the watercolour. Those live in their own
// routes and are gated there.

export const runtime = 'nodejs'

const MAX_DREAMS = 2000
const SELECT_COLUMNS =
  'id, title, raw_text, structured_text, dream_date, emotional_intensity, lucidity_level, sleep_quality, tags, emotions, characters, places, gauge_value, created_at, updated_at'
// The dashboard aggregates; it never renders a word of the account. Sending
// two years of raw_text so a radar chart can count emotions would be a
// multi-megabyte response for a handful of integers.
const STAT_COLUMNS =
  'id, dream_date, emotional_intensity, lucidity_level, sleep_quality, tags, emotions, characters, places'

// GET — the caller's dreams.
//   ?month=YYYY-MM     one month, for the calendar
//   ?since=YYYY-MM-DD  everything from that date on, aggregate columns only
//   neither            the most recent 50
export async function GET(req: NextRequest) {
  const guard = await requireUser(req)
  if (!guard.ok) return guard.response

  const month = req.nextUrl.searchParams.get('month')
  const since = req.nextUrl.searchParams.get('since')

  const supabase = getSupabaseAdmin()
  let query = supabase
    .from('dreams')
    .select(since && !month ? STAT_COLUMNS : SELECT_COLUMNS)
    .eq('user_id', guard.userId)
    .order('dream_date', { ascending: false })

  if (month) {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: 'Invalid month' }, { status: 400 })
    }
    const [year, mon] = month.split('-').map(Number)
    // Day 0 of the next month is the last day of this one — avoids hardcoding
    // month lengths and gets February right in leap years.
    const lastDay = new Date(Date.UTC(year, mon, 0)).getUTCDate()
    query = query.gte('dream_date', `${month}-01`).lte('dream_date', `${month}-${lastDay}`)
  } else if (since) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(since)) {
      return NextResponse.json({ error: 'Invalid since' }, { status: 400 })
    }
    // Capped: the widest window is 12 months plus the 12 before it, for the
    // period-over-period delta. Two dreams a night across two years is already
    // an unusual journal.
    query = query.gte('dream_date', since).limit(1500)
  } else {
    query = query.limit(50)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ dreams: data })
}

// POST — record a dream. Free: any signed-in member, typed by hand.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const guard = await requireUser(req)
    if (!guard.ok) return guard.response

    const rawText = typeof body.rawText === 'string' ? body.rawText.trim().slice(0, 5000) : ''
    if (!rawText) {
      return NextResponse.json({ error: 'Missing rawText' }, { status: 400 })
    }

    const dreamDate =
      typeof body.dreamDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.dreamDate)
        ? body.dreamDate
        : new Date().toISOString().slice(0, 10)

    const supabase = getSupabaseAdmin()
    const { count } = await supabase
      .from('dreams')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', guard.userId)
    if ((count ?? 0) >= MAX_DREAMS) {
      return NextResponse.json({ error: 'LIMIT_REACHED', limit: MAX_DREAMS }, { status: 403 })
    }

    const gauge = typeof body.gaugeValue === 'number' ? body.gaugeValue : 0.5

    const { data, error } = await supabase
      .from('dreams')
      .insert({
        user_id: guard.userId,
        raw_text: rawText,
        title: typeof body.title === 'string' ? body.title.trim().slice(0, 120) || null : null,
        structured_text:
          typeof body.structuredText === 'string' ? body.structuredText.slice(0, 8000) : null,
        dream_date: dreamDate,
        emotional_intensity: clampInt(body.emotionalIntensity, 1, 10),
        lucidity_level: clampInt(body.lucidityLevel, 1, 5),
        sleep_quality: clampInt(body.sleepQuality, 1, 5),
        tags: cleanStringArray(body.tags, 12),
        emotions: sanitizeEmotions(body.emotions),
        characters: cleanStringArray(body.characters, 12),
        places: cleanStringArray(body.places, 12),
        gauge_value: Math.min(1, Math.max(0, gauge)),
      })
      .select(SELECT_COLUMNS)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(
      {
        dream: data,
        limits: { interpretations: DREAM_MONTHLY_LIMIT, images: DREAM_IMAGE_MONTHLY_LIMIT },
      },
      { status: 201 },
    )
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
