import { describe, it, expect } from "vitest";
import { encodeWav, splitSamples, DICTATION_SAMPLE_RATE } from "../audioWav";

describe("encodeWav", () => {
  it("writes a valid 16-bit mono PCM header", () => {
    const wav = encodeWav(new Float32Array([0, 0.5, -0.5, 1, -1]), 16000);
    const view = new DataView(wav.buffer);
    const str = (o: number, n: number) => String.fromCharCode(...wav.slice(o, o + n));
    expect(str(0, 4)).toBe("RIFF");
    expect(str(8, 4)).toBe("WAVE");
    expect(str(12, 4)).toBe("fmt ");
    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(16000);
    expect(view.getUint16(34, true)).toBe(16);
    expect(str(36, 4)).toBe("data");
    expect(view.getUint32(40, true)).toBe(10); // 5 samples × 2 bytes
    expect(wav.length).toBe(44 + 10);
  });

  it("maps and clamps samples to the int16 range", () => {
    const wav = encodeWav(new Float32Array([0, 1, -1, 2, -2]), 8000);
    const view = new DataView(wav.buffer);
    expect(view.getInt16(44, true)).toBe(0);
    expect(view.getInt16(46, true)).toBe(32767);
    expect(view.getInt16(48, true)).toBe(-32768);
    expect(view.getInt16(50, true)).toBe(32767);
    expect(view.getInt16(52, true)).toBe(-32768);
  });
});

describe("splitSamples", () => {
  it("cuts 150 s into 60 + 60 + 30 s slices", () => {
    const samples = new Float32Array(DICTATION_SAMPLE_RATE * 150);
    const slices = splitSamples(samples, DICTATION_SAMPLE_RATE);
    expect(slices.map((s) => s.length / DICTATION_SAMPLE_RATE)).toEqual([60, 60, 30]);
  });

  it("keeps a one-minute WAV slice under Vercel's 4.5 MB body limit", () => {
    const slice = splitSamples(new Float32Array(DICTATION_SAMPLE_RATE * 60), DICTATION_SAMPLE_RATE)[0];
    expect(encodeWav(slice, DICTATION_SAMPLE_RATE).length).toBeLessThan(4.5 * 1024 * 1024 * 0.5);
  });

  it("returns a single slice for short audio", () => {
    expect(splitSamples(new Float32Array(100), DICTATION_SAMPLE_RATE)).toHaveLength(1);
  });
});
