import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Public endpoint — returns today's cached cosmic forecast (FR + EN).
// Falls back to 404 if the cron hasn't run yet (frontend will use static msgs).

export const revalidate = 300; // cache 5 minutes at the edge

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("daily_forecasts")
      .select("forecast_date, summary_fr, summary_en")
      .eq("forecast_date", today)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      date: data.forecast_date,
      fr: data.summary_fr,
      en: data.summary_en,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
