import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MAX_CHARTS = 10;

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Verify the user is authenticated and premium
async function verifyPremiumUser(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", userId)
    .single();
  return data?.is_premium === true;
}

// GET — List saved charts for a user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("saved_charts")
    .select("id, label, form_data, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ charts: data });
}

// POST — Save a new chart
export async function POST(req: NextRequest) {
  try {
    const { userId, label, formData, chartData } = await req.json();
    if (!userId || !label || !formData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check premium
    const premium = await verifyPremiumUser(userId);
    if (!premium) {
      return NextResponse.json({ error: "Premium required" }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();

    // Check chart limit
    const { count } = await supabase
      .from("saved_charts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if ((count ?? 0) >= MAX_CHARTS) {
      return NextResponse.json({ error: `Maximum ${MAX_CHARTS} charts allowed` }, { status: 400 });
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
    return NextResponse.json({ chart: data }, { status: 201 });
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
