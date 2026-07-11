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

// One generated narration, whatever the provider produced.
interface TtsResult {
  buffer: Buffer;
  contentType: string;
  ext: string;
}

/**
 * Grok TTS (xAI) — primary provider (~$4.20/M chars vs ~$15 for Gemini).
 * Returns MP3 bytes directly. Grok reads the text verbatim (it is not
 * instruction-following), so no style prompt here — the "ara" voice is
 * already warm, which matches Natalune's tone.
 */
async function grokTts(text: string, language: "fr" | "en"): Promise<TtsResult> {
  const key = process.env.XAI_API_KEY?.trim();
  if (!key) throw new Error("XAI_API_KEY not set");

  const res = await fetch("https://api.x.ai/v1/tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      voice_id: "ara",
      language,
      output_format: { codec: "mp3", sample_rate: 24000, bit_rate: 128000 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Grok TTS ${res.status}: ${errText.slice(0, 300)}`);
  }
  return {
    buffer: Buffer.from(await res.arrayBuffer()),
    contentType: "audio/mpeg",
    ext: "mp3",
  };
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

/**
 * Gemini 2.5 Flash Preview TTS — fallback provider (same API key as the chat
 * models). Instruction-following, so the tone is set via a style prompt.
 * Returns raw PCM 24kHz mono signed 16-bit, wrapped in WAV here.
 */
async function geminiTts(text: string): Promise<TtsResult> {
  const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (!geminiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY not set");

  // Add a soft style instruction so the voice matches Natalune's tone
  // (calm, warm, contemplative — not a corporate audiobook).
  const styledPrompt = `Lis ce texte sur un ton calme, chaleureux, contemplatif — comme si tu confiais une lecture intime à un·e ami·e :\n\n${text}`;

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
    throw new Error(`Gemini TTS ${ttsRes.status}: ${errText.slice(0, 300)}`);
  }

  const json = await ttsRes.json();
  const audioPart = json?.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData?.data
  );
  if (!audioPart?.inlineData?.data) {
    throw new Error(`Gemini TTS produced empty response: ${JSON.stringify(json).slice(0, 300)}`);
  }

  const pcm = Buffer.from(audioPart.inlineData.data, "base64");
  return { buffer: pcmToWav(pcm, 24000), contentType: "audio/wav", ext: "wav" };
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

    // Provider: Grok (xAI) by default when its key is present — ~70% cheaper
    // than Gemini and returns MP3 directly. TTS_PROVIDER=gemini forces the
    // legacy provider; a missing XAI_API_KEY silently falls back to Gemini so
    // nothing breaks before the key is configured on Vercel.
    const useGrok =
      (process.env.TTS_PROVIDER?.trim().toLowerCase() || "grok") !== "gemini" &&
      !!process.env.XAI_API_KEY?.trim();

    if (!useGrok && !process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()) {
      return NextResponse.json({ error: "TTS not configured" }, { status: 503 });
    }

    // Cache key — same chart → same audio file (huge cost saver). Grok-era
    // files get their own keys, so switching provider regenerates cleanly
    // instead of serving the other voice from cache.
    const hash = crypto
      .createHash("sha256")
      .update((useGrok ? "grok|" : "") + JSON.stringify(chartParams || text))
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

    // Cost guard — TTS pricing scales with input chars.
    const trimmedText = text.slice(0, 2500);
    // The client tags every request with its locale (chartParams._locale).
    const language: "fr" | "en" = chartParams?._locale === "en" ? "en" : "fr";

    let result: TtsResult | null = null;
    if (useGrok) {
      try {
        result = await grokTts(trimmedText, language);
      } catch (err) {
        console.error("[audio] Grok TTS failed, falling back to Gemini:", (err as Error).message);
      }
    }
    if (!result) {
      try {
        result = await geminiTts(trimmedText);
      } catch (err) {
        console.error("[audio] Gemini TTS error:", (err as Error).message);
        return NextResponse.json(
          { error: "TTS generation failed", detail: (err as Error).message.slice(0, 200) },
          { status: 502 }
        );
      }
    }

    const fileName = `audio/${hash}.${result.ext}`;
    const { error: uploadError } = await supabase.storage
      .from("audio")
      .upload(fileName, result.buffer, {
        contentType: result.contentType,
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
