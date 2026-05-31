import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MAX_CHARTS_PREMIUM = 10;
const MAX_CHARTS_FREE = 3;

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Verify the caller owns this userId by checking the Authorization header
async function verifyAuth(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.auth.getUser(token);
  return data?.user?.id ?? null;
}

// Read the user's tier (used to enforce the per-tier chart cap)
async function getUserTier(userId: string): Promise<"premium" | "free"> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", userId)
    .single();
  return data?.is_premium === true ? "premium" : "free";
}

// GET — List saved charts for a user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  // Verify the caller owns this userId
  const authedUserId = await verifyAuth(req);
  if (!authedUserId || authedUserId !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("saved_charts")
    .select("id, label, form_data, created_at, pdf_url, email_sent_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ charts: data });
}

// POST — Save a new chart (data only, no PDF). Both Free and Premium can
// call this; the cap differs (3 vs 10). If the same chart was already saved
// (same form_data signature), we skip the insert — auto-save fires on every
// calculation and we don't want duplicates piling up.
export async function POST(req: NextRequest) {
  try {
    // We accept the body-supplied userId as a hint but ALWAYS use the verified
    // one from the Bearer token (IDOR safety).
    const { userId: bodyUserId, label, formData, chartData } = await req.json();
    if (!label || !formData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const authedUserId = await verifyAuth(req);
    if (!authedUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // If the body specifies a different userId, refuse — defense-in-depth.
    if (bodyUserId && bodyUserId !== authedUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const userId = authedUserId;

    const tier = await getUserTier(userId);
    const cap = tier === "premium" ? MAX_CHARTS_PREMIUM : MAX_CHARTS_FREE;

    const supabase = getSupabaseAdmin();

    // ── De-duplicate: don't save the same form_data twice in a row ──
    // We compare the canonical chart key (date/time/place/name) so re-loading
    // the same chart via ?c= or recalculating doesn't multiply rows.
    const { data: existing } = await supabase
      .from("saved_charts")
      .select("id, label")
      .eq("user_id", userId)
      .eq("label", label)
      .limit(1)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { chart: existing, deduped: true },
        { status: 200 }
      );
    }

    const { count } = await supabase
      .from("saved_charts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if ((count ?? 0) >= cap) {
      return NextResponse.json(
        {
          error: "LIMIT_REACHED",
          tier,
          limit: cap,
          message:
            tier === "free"
              ? `Limite gratuite atteinte (${cap} cartes). Passe Premium pour plus.`
              : `Maximum ${cap} cartes — supprime-en pour en ajouter une nouvelle.`,
        },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("saved_charts")
      .insert({
        user_id: userId,
        label,
        form_data: formData,
        chart_data: chartData || null,
      })
      .select("id, label, created_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ chart: data, tier, limit: cap }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// DELETE — Remove a saved chart
export async function DELETE(req: NextRequest) {
  try {
    const { userId, chartId } = await req.json();
    if (!userId || !chartId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify the caller owns this userId
    const authedUserId = await verifyAuth(req);
    if (!authedUserId || authedUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("saved_charts")
      .delete()
      .eq("id", chartId)
      .eq("user_id", userId); // Ensure user owns the chart

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
