-- ═══════════════════════════════════════════════
-- Natalune — Personal calendar events (Premium)
-- Run this in Supabase SQL Editor AFTER migrations 001-005.
--
-- Premium users can pin private events (birthdays, appointments…) onto the
-- celestial calendar. Events are strictly private: RLS restricts every
-- operation to the owner. The API layer additionally gates writes to Premium.
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 80),
  event_date  DATE NOT NULL,
  -- Annual recurrence (birthdays, anniversaries): matched on month+day.
  recurring   BOOLEAN NOT NULL DEFAULT false,
  -- 'anniversaire' gets the birthday treatment in the UI; 'perso' is generic.
  kind        TEXT NOT NULL DEFAULT 'perso' CHECK (kind IN ('perso', 'anniversaire')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS calendar_events_user_date_idx
  ON public.calendar_events (user_id, event_date);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own events"   ON public.calendar_events;
DROP POLICY IF EXISTS "Users can insert own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.calendar_events;

CREATE POLICY "Users can read own events"
  ON public.calendar_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
  ON public.calendar_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
  ON public.calendar_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
  ON public.calendar_events FOR DELETE
  USING (auth.uid() = user_id);
