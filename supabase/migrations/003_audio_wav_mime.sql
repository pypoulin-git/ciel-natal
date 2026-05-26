-- Allow audio/wav in the `audio` bucket so the Gemini-TTS pipeline can store
-- its output (Gemini returns raw PCM which we wrap in a WAV container — no
-- MP3 encoder available without bringing in ffmpeg/lamejs into the bundle).
--
-- Run this in Supabase Dashboard → SQL Editor.

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['audio/mpeg', 'audio/wav', 'audio/x-wav']
WHERE id = 'audio';
