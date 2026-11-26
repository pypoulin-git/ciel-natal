/**
 * Voice dictation → files Gemini reads reliably.
 *
 * Browsers record in whatever they like (Chrome/Firefox: WebM-Opus, Safari:
 * MP4-AAC). Gemini officially takes WAV, MP3, AAC, OGG, FLAC, AIFF — not WebM.
 * So the recording is decoded in the browser, mixed down to mono, resampled to
 * 16 kHz (plenty for speech) and cut into ≤ 60 s WAV slices: 60 s of 16-bit
 * 16 kHz mono is 1.9 MB, safely under Vercel's 4.5 MB request-body limit.
 *
 * The pure helpers (encode / split) are unit-tested; `recordingToWavSlices`
 * needs Web Audio and runs in the browser only.
 */

export const DICTATION_SAMPLE_RATE = 16000;
export const DICTATION_SLICE_SECONDS = 60;

/** Float samples in [-1, 1] → 16-bit PCM WAV file bytes. */
export function encodeWav(samples: Float32Array, sampleRate: number): Uint8Array {
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeString = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true); // byte rate
  view.setUint16(32, bytesPerSample, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Uint8Array(buffer);
}

/** Cut samples into consecutive slices of at most `seconds`. */
export function splitSamples(samples: Float32Array, sampleRate: number, seconds = DICTATION_SLICE_SECONDS): Float32Array[] {
  const size = Math.max(1, Math.floor(sampleRate * seconds));
  const out: Float32Array[] = [];
  for (let start = 0; start < samples.length; start += size) {
    out.push(samples.subarray(start, Math.min(samples.length, start + size)));
  }
  return out;
}

/** Recorded blob (any browser format) → 16 kHz mono WAV slices of ≤ 60 s. */
export async function recordingToWavSlices(blob: Blob): Promise<{ slices: Blob[]; seconds: number }> {
  const AudioCtx: typeof AudioContext =
    window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
    const length = Math.ceil(decoded.duration * DICTATION_SAMPLE_RATE);
    // OfflineAudioContext with 1 channel downmixes and resamples in one pass.
    const offline = new OfflineAudioContext(1, Math.max(1, length), DICTATION_SAMPLE_RATE);
    const src = offline.createBufferSource();
    src.buffer = decoded;
    src.connect(offline.destination);
    src.start();
    const rendered = await offline.startRendering();
    const mono = rendered.getChannelData(0);
    const slices = splitSamples(mono, DICTATION_SAMPLE_RATE).map(
      (s) => new Blob([encodeWav(s, DICTATION_SAMPLE_RATE) as BlobPart], { type: "audio/wav" }),
    );
    return { slices, seconds: decoded.duration };
  } finally {
    void ctx.close();
  }
}
