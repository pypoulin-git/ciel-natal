import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Personal calendar events (Premium). Same auth pattern as /api/charts:
// Bearer token verified first, admin client for the query, ownership enforced
// on every operation. Reads are allowed for any signed-in user (so a lapsed
// premium still sees what they created); writes are Premium-gated.
const MAX_EVENTS = 100

function getSupabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

async function verifyAuth(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { data } = await supabase.auth.getUser(token)
  return data?.user?.id ?? null
}

async function isPremium(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase.from('profiles').select('is_premium').eq('id', userId).single()
  return data?.is_premium === true
}

// GET — list the caller's events
export async function GET(req: NextRequest) {
  const userId = await verifyAuth(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('calendar_events')
    .select('id, title, event_date, recurring, kind')
    .eq('user_id', userId)
    .order('event_date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ events: data })
}

// POST — create an event (Premium only)
export async function POST(req: NextRequest) {
  try {
    const { title, eventDate, recurring, kind } = await req.json()
    const userId = await verifyAuth(req)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!(await isPremium(userId))) {
      return NextResponse.json({ error: 'PREMIUM_REQUIRED' }, { status: 403 })
    }

    const cleanTitle = typeof title === 'string' ? title.trim().slice(0, 80) : ''
    if (!cleanTitle || typeof eventDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      return NextResponse.json({ error: 'Invalid fields' }, { status: 400 })
    }
    const cleanKind = kind === 'anniversaire' ? 'anniversaire' : 'perso'

    const supabase = getSupabaseAdmin()
    const { count } = await supabase
      .from('calendar_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    if ((count ?? 0) >= MAX_EVENTS) {
      return NextResponse.json({ error: 'LIMIT_REACHED', limit: MAX_EVENTS }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: userId,
        title: cleanTitle,
        event_date: eventDate,
        recurring: recurring === true,
        kind: cleanKind,
      })
      .select('id, title, event_date, recurring, kind')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ event: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// DELETE — remove one of the caller's events
export async function DELETE(req: NextRequest) {
  try {
    const { eventId } = await req.json()
    const userId = await verifyAuth(req)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!eventId) return NextResponse.json({ error: 'Missing eventId' }, { status: 400 })

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', userId) // ownership enforced

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ deleted: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
