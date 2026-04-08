-- ═══════════════════════════════════════════════
-- Ciel Natal — Daily Cosmic Forecast Cache
-- Run after 001_initial_schema.sql
-- ═══════════════════════════════════════════════

-- Daily forecast: one row per date, bilingual
CREATE TABLE IF NOT EXISTS public.daily_forecasts (
  forecast_date DATE PRIMARY KEY,
  summary_fr TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  transits JSONB,          -- snapshot of the day's significant transits
  generated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_forecasts_date
  ON public.daily_forecasts(forecast_date DESC);

-- Public read (anonymous users can GET today's forecast)
ALTER TABLE public.daily_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read daily forecasts"
  ON public.daily_forecasts FOR SELECT
  USING (true);

-- Only service_role (server-side cron) can write
-- (no INSERT/UPDATE/DELETE policies — service_role bypasses RLS)
