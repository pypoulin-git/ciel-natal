import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Verify premium status
async function isPremiumUser(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", userId)
    .single();
  return data?.is_premium === true;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, text, chartParams } = await req.json();

    if (!userId || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check premium
    if (!(await isPremiumUser(userId))) {
      return NextResponse.json({ error: "Premium required" }, { status: 403 });
    }

    // Generate a hash for cache key
    const hash = crypto.createHash("sha256").update(JSON.stringify(chartParams || text)).digest("hex").slice(0, 16);

    const supabase = getSupabaseAdmin();

    // Check cache
    const { data: cached } = await supabase
      .from("audio_cache")
      .select("audio_url")
      .eq("chart_hash", hash)
      .single();

    if (cached?.audio_url) {
      return NextResponse.json({ audioUrl: cached.audio_url });
    }

    // Generate TTS via OpenAI
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json({ error: "TTS not configured" }, { status: 503 });
    }

    // Trim text to ~2500 chars max for cost control
    const trimmedText = text.slice(0, 2500);

    const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: "nova",
        input: trimmedText,
        response_format: "mp3",
      }),
    });

    if (!ttsRes.ok) {
      console.error("OpenAI TTS error:", await ttsRes.text());
      return NextResponse.json({ error: "TTS generation failed" }, { status: 502 });
    }

    const audioBuffer = Buffer.from(await ttsRes.arrayBuffer());
    const fileName = `audio/${hash}.mp3`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("audio")
      .upload(fileName, audioBuffer, {
        contentType: "audio/mpeg",
        cacheControl: "31536000", // 1 year cache
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to store audio" }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("audio").getPublicUrl(fileName);
    const audioUrl = urlData.publicUrl;

    // Cache in DB
    await supabase
      .from("audio_cache")
      .upsert({ chart_hash: hash, audio_url: audioUrl });

    return NextResponse.json({ audioUrl });
  } catch (err) {
    console.error("Audio API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
