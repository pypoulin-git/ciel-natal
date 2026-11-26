-- Voice dictation for the dream journal (Premium).
--
-- The audio itself is never stored: it is transcribed by Gemini and dropped.
-- Only a minute counter lives here. It has its own month column so it rolls
-- over independently of dream_used / dream_images_used (their updates don't
-- know about it, and a shared dream_month would carry a stale count over).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dream_dictation_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dream_dictation_month   TEXT;
