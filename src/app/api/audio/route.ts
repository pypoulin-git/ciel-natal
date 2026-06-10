import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";
export const maxDuration = 60;

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Verify the caller's Bearer token and return the userId (never trust the body)
async function verifyAuth(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await sb.auth.getUser(token);
  return data?.user?.id ?? null;
}

async function isPremiumUser(userId: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("profiles").select("is_premium").eq("id", userId).single();
  return data?.is_premium === true;
}

/**
 * Wrap raw PCM (signed 16-bit little-endian, mono) in a minimal WAV
 * RIFF container so browsers can play it without external tools.
 */
function pcmToWav(pcm: Buffer, sampleRate = 24000): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcm.length;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  return Buffer.concat([header, pcm]);
}

export async function POST(req: NextRequest) {
  try {
    // ── Auth FIRST (no IDOR — userId comes from the verified token) ──
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await isPremiumUser(userId))) {
      return NextResponse.json({ error: "Premium required" }, { status: 403 });
    }

    const { text, chartParams } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Cache key — same chart → same audio file (huge cost saver)
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(chartParams || text))
      .digest("hex")
      .slice(0, 16);

    const supabase = getSupabaseAdmin();

    const { data: cached } = await supabase
      .from("audio_cache")
      .select("audio_url")
      .eq("chart_hash", hash)
      .single();

    if (cached?.audio_url) {
      return NextResponse.json({ audioUrl: cached.audio_url });
    }

    // Gemini 2.5 Flash Preview TTS — same API key as the chat models.
    // Free tier is generous; paid is $0.50/1M chars output.
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
    if (!geminiKey) {
      return NextResponse.json({ error: "TTS not configured" }, { status: 503 });
    }

    // Cost guard — Gemini TTS pricing scales with input chars.
    const trimmedText = text.slice(0, 2500);

    // Add a soft style instruction so the voice matches Natalune's tone
    // (calm, warm, contemplative — not a corporate audiobook).
    const styledPrompt = `Lis ce texte sur un ton calme, chaleureux, contemplatif — comme si tu confiais une lecture intime à un·e ami·e :\n\n${trimmedText}`;

    const ttsRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${encodeURIComponent(geminiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: styledPrompt }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                // "Aoede" = a warm female voice, good in French.
                // Other good options: "Kore", "Charon", "Puck", "Fenrir".
                prebuiltVoiceConfig: { voiceName: "Aoede" },
              },
            },
          },
        }),
      }
    );

    if (!ttsRes.ok) {
      const errText = await ttsRes.text();
      console.error("[audio] Gemini TTS error:", ttsRes.status, errText.slice(0, 400));
      return NextResponse.json(
        { error: "TTS generation failed", detail: errText.slice(0, 200) },
        { status: 502 }
      );
    }

    const json = await ttsRes.json();
    const audioPart = json?.candidates?.[0]?.content?.parts?.find(
      (p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData?.data
    );
    if (!audioPart?.inlineData?.data) {
      console.error("[audio] Gemini returned no audio:", JSON.stringify(json).slice(0, 400));
      return NextResponse.json({ error: "TTS produced empty response" }, { status: 502 });
    }

    // Gemini returns raw PCM 24kHz mono signed 16-bit — wrap in WAV.
    const pcm = Buffer.from(audioPart.inlineData.data, "base64");
    const wavBuffer = pcmToWav(pcm, 24000);

    const fileName = `audio/${hash}.wav`;
    const { error: uploadError } = await supabase.storage
      .from("audio")
      .upload(fileName, wavBuffer, {
        contentType: "audio/wav",
        cacheControl: "31536000",
        upsert: true,
      });

    if (uploadError) {
      console.error("[audio] storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to store audio", detail: uploadError.message },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage.from("audio").getPublicUrl(fileName);
    const audioUrl = urlData.publicUrl;

    await supabase.from("audio_cache").upsert({ chart_hash: hash, audio_url: audioUrl });

    return NextResponse.json({ audioUrl });
  } catch (err) {
    const e = err as Error;
    console.error("[audio] error:", e?.message, e?.stack?.split("\n").slice(0, 3));
    return NextResponse.json({ error: "Internal error", detail: e?.message }, { status: 500 });
  }
}
