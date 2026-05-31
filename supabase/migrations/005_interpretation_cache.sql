-- ═══════════════════════════════════════════════
-- Interpretation cache — stores Gemini-generated text keyed by a
-- deterministic sha256 of (section, voice, locale, chart context, extras).
--
-- Replaces the Upstash Redis cache that was never provisioned in prod.
-- Postgres adds ~50-100ms vs Redis edge but for already-cached interp text
-- that latency is invisible next to a 5-10s Gemini regeneration.
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.interpretation_cache (
  cache_key   TEXT PRIMARY KEY,
  text_content TEXT NOT NULL,
  section     TEXT NOT NULL,
  hit_count   INTEGER DEFAULT 1,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  last_hit_at TIMESTAMPTZ DEFAULT NOW()
);

-- Useful for cleanup jobs / analytics
CREATE INDEX IF NOT EXISTS idx_interp_cache_section ON public.interpretation_cache (section);
CREATE INDEX IF NOT EXISTS idx_interp_cache_last_hit ON public.interpretation_cache (last_hit_at);

-- RLS on but with no policies = blocks ALL client access. Only the service
-- role (used by /api/* routes) can read/write — that's exactly what we want
-- since the cache should never be exposed directly to the browser.
ALTER TABLE public.interpretation_cache ENABLE ROW LEVEL SECURITY;
