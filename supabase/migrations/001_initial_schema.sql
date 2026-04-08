-- ═══════════════════════════════════════════════
-- Ciel Natal — Initial Database Schema
-- Run this in Supabase SQL Editor after creating your project
-- ═══════════════════════════════════════════════

-- ── 1. Profiles (auto-created on signup via trigger) ──
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_at TIMESTAMPTZ,
  stripe_payment_id TEXT,
  chat_used INTEGER DEFAULT 0,
  chat_month TEXT,
  chat_lifetime INTEGER DEFAULT 0,
  welcome_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. Saved Charts (max 10 per user, enforced app-side) ──
CREATE TABLE public.saved_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  form_data JSONB NOT NULL,
  chart_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_saved_charts_user ON public.saved_charts(user_id);

-- ── 3. Audio Cache (TTS dedup by chart hash) ──
CREATE TABLE public.audio_cache (
  chart_hash TEXT PRIMARY KEY,
  audio_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════

-- Profiles: users read/update own row, service_role bypasses RLS for webhooks
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Saved charts: full CRUD on own rows
ALTER TABLE public.saved_charts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own charts"
  ON public.saved_charts FOR ALL
  USING (auth.uid() = user_id);

-- Audio cache: no RLS (server-only via service_role key)
-- No direct client access needed

-- ═══════════════════════════════════════════════
-- Auto-create profile on new user signup
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════
-- Storage bucket for audio files
-- ═══════════════════════════════════════════════
-- Run in Supabase dashboard > Storage > Create bucket:
--   Name: audio
--   Public: true (files served via public URL)
--   File size limit: 5MB
--   Allowed MIME types: audio/mpeg

-- ═══════════════════════════════════════════════
-- Notes
-- ═══════════════════════════════════════════════
-- After running this migration:
-- 1. Enable Email provider in Auth > Providers
-- 2. Enable Google OAuth in Auth > Providers (needs Google Cloud Console client ID/secret)
-- 3. Add redirect URL: https://ciel-natal.vercel.app/auth/callback
-- 4. Create "audio" storage bucket (public, 5MB limit, audio/mpeg only)
