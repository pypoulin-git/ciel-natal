/**
 * Interpretation cache — Gemini responses keyed by a deterministic sha256 of
 * (section, voice, locale, chart context, extras).
 *
 * Storage: the public.interpretation_cache table in Supabase Postgres. We
 * used to point at Upstash Redis but never provisioned it in prod — moving
 * to Supabase keeps everything in one place and adds maybe 50-100ms over
 * Redis (invisible next to a 5-10s Gemini regen on miss).
 *
 * Service-role only: the table has RLS enabled with no policies, so client
 * code cannot reach it. Only this module (running in /api/* routes with the
 * SUPABASE_SERVICE_ROLE_KEY) can read/write.
 */

import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url.trim(), key.trim(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function makeCacheKey(parts: {
  section: string;
  voice: string;
  locale: string;
  chartContext: string;
  extra?: string;
}): string {
  const h = createHash("sha256");
  h.update(parts.section);
  h.update("|");
  h.update(parts.voice);
  h.update("|");
  h.update(parts.locale);
  h.update("|");
  h.update(parts.chartContext);
  if (parts.extra) {
    h.update("|");
    h.update(parts.extra);
  }
  // `cn:interp:<section>:<hash>` keeps the prefix consistent with the
  // previous Redis-based naming so old logs stay grep-able.
  return `cn:interp:${parts.section}:${h.digest("hex").slice(0, 32)}`;
}

export async function cacheGet(key: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("interpretation_cache")
      .select("text_content")
      .eq("cache_key", key)
      .maybeSingle();
    if (error || !data?.text_content) return null;
    // Fire-and-forget: bump hit stats. We don't await — adds at most 100ms
    // to cold reads, but cache reads should feel instant.
    void sb
      .from("interpretation_cache")
      .update({ last_hit_at: new Date().toISOString(), hit_count: undefined })
      .eq("cache_key", key)
      .then(() => undefined);
    return data.text_content;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    // Derive the section from the key prefix so we can index/clean by it.
    const sectionMatch = key.match(/^cn:interp:([^:]+):/);
    const section = sectionMatch?.[1] ?? "unknown";
    await sb
      .from("interpretation_cache")
      .upsert(
        {
          cache_key: key,
          text_content: value,
          section,
          last_hit_at: new Date().toISOString(),
        },
        { onConflict: "cache_key" }
      );
  } catch {
    /* swallow — a cache write failure should never break the user flow */
  }
}
