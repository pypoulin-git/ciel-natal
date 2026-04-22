-- ═══════════════════════════════════════════════
-- Ciel Natal — Lectures (PDF history) + Reading Preferences
-- Run this in Supabase SQL Editor AFTER migrations 001 + 002.
-- ═══════════════════════════════════════════════

-- ── 1. Extend saved_charts: PDF storage path + email send timestamp ──
ALTER TABLE public.saved_charts
  ADD COLUMN IF NOT EXISTS pdf_url        TEXT,
  ADD COLUMN IF NOT EXISTS email_sent_at  TIMESTAMPTZ;

-- ── 2. Extend profiles: persisted reading preferences (tone, depth, focus, voice, genre) ──
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS reading_prefs  JSONB DEFAULT '{}'::jsonb;

-- ═══════════════════════════════════════════════
-- Note: Bucket "pdfs" must be created via Supabase Dashboard > Storage:
--   Name: pdfs
--   Public: false (signed URLs only)
--   File size limit: 5 MB
--   Allowed MIME types: application/pdf
--
-- Then add storage policies so authenticated users can:
--   - Upload objects whose path starts with their user_id/ prefix
--   - Read only their own objects
-- ═══════════════════════════════════════════════

-- Storage policies for "pdfs" bucket (run after creating the bucket)
-- These use the service_role bypass at the API layer (/api/pdf/save),
-- and these policies allow read-only signed URL access for owners.

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'pdfs') THEN
    -- Drop old policies if re-running
    DROP POLICY IF EXISTS "Users can read own PDFs"       ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload own PDFs"     ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete own PDFs"     ON storage.objects;

    -- SELECT: user can read objects stored under their user_id/ prefix
    CREATE POLICY "Users can read own PDFs"
      ON storage.objects FOR SELECT
      USING (
        bucket_id = 'pdfs'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );

    -- INSERT: user can upload under their own prefix (backend bypasses via service_role)
    CREATE POLICY "Users can upload own PDFs"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'pdfs'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );

    -- DELETE: user can delete their own PDFs
    CREATE POLICY "Users can delete own PDFs"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'pdfs'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;
