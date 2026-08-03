-- ═══════════════════════════════════════════════
-- Natalune — Journal de rêves (Premium)
-- Run this in Supabase SQL Editor AFTER migrations 001-006.
--
-- Premium members log their dreams; Gemini structures the raw account
-- (title, tags, emotions, characters, places) and produces three readings
-- of the same dream (factual / spiritual / blended) enriched with the
-- dreamer's own natal Moon, Sun and Ascendant — read from saved_charts.
--
-- Every table is strictly private: RLS restricts each operation to the
-- owner. The API layer additionally gates writes behind Premium and a
-- monthly quota, because a one-time purchase funds a recurring AI cost.
-- ═══════════════════════════════════════════════

-- ── 1. Dreams ──
CREATE TABLE IF NOT EXISTS public.dreams (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- The untouched account, as typed by the dreamer. Never overwritten.
  raw_text            TEXT NOT NULL CHECK (char_length(raw_text) BETWEEN 1 AND 5000),
  title               TEXT CHECK (title IS NULL OR char_length(title) <= 120),
  -- Gemini's cleaned-up narration. NULL until structuring has run.
  structured_text     TEXT,
  dream_date          DATE NOT NULL DEFAULT CURRENT_DATE,
  emotional_intensity SMALLINT CHECK (emotional_intensity BETWEEN 1 AND 10),
  lucidity_level      SMALLINT CHECK (lucidity_level BETWEEN 1 AND 5),
  sleep_quality       SMALLINT CHECK (sleep_quality BETWEEN 1 AND 5),
  tags                JSONB NOT NULL DEFAULT '[]'::jsonb,
  emotions            JSONB NOT NULL DEFAULT '[]'::jsonb,
  characters          JSONB NOT NULL DEFAULT '[]'::jsonb,
  places              JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Last position of the factual↔spiritual gauge, so reopening a dream
  -- restores the reading the dreamer left it on. 0 = factual, 1 = spiritual.
  gauge_value         REAL NOT NULL DEFAULT 0.5 CHECK (gauge_value BETWEEN 0 AND 1),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dreams_user_date_idx
  ON public.dreams (user_id, dream_date DESC);

-- Tag search ("show me every dream with 'eau'") needs a GIN index.
CREATE INDEX IF NOT EXISTS dreams_tags_idx
  ON public.dreams USING GIN (tags);

-- ── 2. Interpretations ──
-- One row per dream per generation. `content` holds ALL THREE readings, so
-- moving the gauge in the UI never costs another model call.
CREATE TABLE IF NOT EXISTS public.dream_interpretations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id    UUID NOT NULL REFERENCES public.dreams(id) ON DELETE CASCADE,
  content     JSONB NOT NULL, -- { spiritual, factual, blended }
  model_used  TEXT NOT NULL,
  -- Whether the dreamer's natal chart fed the reading. Lets us re-offer a
  -- richer interpretation once they finally save a chart.
  astro_used  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dream_interpretations_dream_idx
  ON public.dream_interpretations (dream_id, created_at DESC);

-- ── 3. Generated images ──
CREATE TABLE IF NOT EXISTS public.dream_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id     UUID NOT NULL REFERENCES public.dreams(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  prompt_used  TEXT,
  model_used   TEXT,
  width        INTEGER NOT NULL DEFAULT 768,
  height       INTEGER NOT NULL DEFAULT 1024,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dream_images_dream_idx
  ON public.dream_images (dream_id, created_at DESC);

-- ── 4. Quota counters on profiles ──
-- Same shape as the chat counters (chat_used / chat_month / chat_lifetime).
-- Upstash is not provisioned in prod, so THESE are the real enforcement —
-- the Redis limiter is a nicety on top.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dream_used         INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dream_month        TEXT,
  ADD COLUMN IF NOT EXISTS dream_lifetime     INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dream_images_used  INTEGER DEFAULT 0;

-- ── 5. updated_at maintenance ──
-- Deliberately a dedicated function that touches ONLY updated_at. The
-- Reverie prototype reused its BEFORE INSERT trigger (which sets user_id
-- from auth.uid()) for BEFORE UPDATE too, which nulled user_id on every
-- service_role write. Keep these two concerns apart.
CREATE OR REPLACE FUNCTION public.touch_dream_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dreams_touch_updated_at ON public.dreams;
CREATE TRIGGER dreams_touch_updated_at
  BEFORE UPDATE ON public.dreams
  FOR EACH ROW EXECUTE FUNCTION public.touch_dream_updated_at();

-- ═══════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════

ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own dreams"   ON public.dreams;
DROP POLICY IF EXISTS "Users can insert own dreams" ON public.dreams;
DROP POLICY IF EXISTS "Users can update own dreams" ON public.dreams;
DROP POLICY IF EXISTS "Users can delete own dreams" ON public.dreams;

CREATE POLICY "Users can read own dreams"
  ON public.dreams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dreams"
  ON public.dreams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dreams"
  ON public.dreams FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dreams"
  ON public.dreams FOR DELETE
  USING (auth.uid() = user_id);

-- Interpretations and images inherit ownership through their dream.
ALTER TABLE public.dream_interpretations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own dream interpretations"   ON public.dream_interpretations;
DROP POLICY IF EXISTS "Users can delete own dream interpretations" ON public.dream_interpretations;

CREATE POLICY "Users can read own dream interpretations"
  ON public.dream_interpretations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.dreams d
      WHERE d.id = dream_interpretations.dream_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own dream interpretations"
  ON public.dream_interpretations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.dreams d
      WHERE d.id = dream_interpretations.dream_id AND d.user_id = auth.uid()
    )
  );

ALTER TABLE public.dream_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own dream images"   ON public.dream_images;
DROP POLICY IF EXISTS "Users can delete own dream images" ON public.dream_images;

CREATE POLICY "Users can read own dream images"
  ON public.dream_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.dreams d
      WHERE d.id = dream_images.dream_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own dream images"
  ON public.dream_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.dreams d
      WHERE d.id = dream_images.dream_id AND d.user_id = auth.uid()
    )
  );

-- Writes to dream_interpretations / dream_images go exclusively through the
-- API routes with the service_role key (which bypasses RLS), so there are
-- deliberately no INSERT/UPDATE policies here.

-- ═══════════════════════════════════════════════
-- Storage bucket for dream images
-- ═══════════════════════════════════════════════
-- Create via Supabase Dashboard > Storage:
--   Name: dream-images
--   Public: false (signed URLs only — dream imagery is intimate)
--   File size limit: 5 MB
--   Allowed MIME types: image/webp, image/png, image/jpeg
--
-- Path convention: {user_id}/{dream_id}/image.webp

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'dream-images') THEN
    DROP POLICY IF EXISTS "Users can read own dream images files"   ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete own dream images files" ON storage.objects;

    CREATE POLICY "Users can read own dream images files"
      ON storage.objects FOR SELECT
      USING (
        bucket_id = 'dream-images'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );

    CREATE POLICY "Users can delete own dream images files"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'dream-images'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;
