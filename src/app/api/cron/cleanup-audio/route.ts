import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
// Monthly Audio Cache Cleanup — Vercel Cron
// Runs on the 1st of each month at 07:00 UTC (~3 AM ET during DST).
// Deletes audio_cache entries older than 60 days + their Storage files.
// ─────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const STALE_DAYS = 60;

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  // ── Verify Vercel cron auth ──
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const cutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000).toISOString();

    // 1. Find stale entries
    const { data: stale, error: selectErr } = await supabase
      .from("audio_cache")
      .select("chart_hash, audio_url, created_at")
      .lt("created_at", cutoff);

    if (selectErr) {
      console.error("[cron/cleanup-audio] select error:", selectErr);
      return NextResponse.json({ error: selectErr.message }, { status: 500 });
    }

    if (!stale || stale.length === 0) {
      return NextResponse.json({ ok: true, deleted: 0, cutoff });
    }

    // 2. Delete Storage files (best-effort per file; continue on error)
    const filesToDelete = stale.map((row) => `audio/${row.chart_hash}.mp3`);
    let storageDeleted = 0;
    let storageErrors = 0;

    // Delete in batches of 100 (Supabase storage remove limit)
    for (let i = 0; i < filesToDelete.length; i += 100) {
      const batch = filesToDelete.slice(i, i + 100);
      const { error: removeErr } = await supabase.storage.from("audio").remove(batch);
      if (removeErr) {
        storageErrors += batch.length;
        console.error("[cron/cleanup-audio] storage remove error:", removeErr.message);
      } else {
        storageDeleted += batch.length;
      }
    }

    // 3. Delete DB rows
    const hashes = stale.map((r) => r.chart_hash);
    const { error: deleteErr } = await supabase
      .from("audio_cache")
      .delete()
      .in("chart_hash", hashes);

    if (deleteErr) {
      console.error("[cron/cleanup-audio] delete error:", deleteErr);
      return NextResponse.json(
        {
          error: deleteErr.message,
          storageDeleted,
          storageErrors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      deleted: stale.length,
      storageDeleted,
      storageErrors,
      cutoff,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[cron/cleanup-audio] fatal:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
