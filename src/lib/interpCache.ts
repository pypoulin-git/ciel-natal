import { createHash } from "crypto";
import { getRedis } from "./redis";

const NINETY_DAYS_SECONDS = 60 * 60 * 24 * 90;

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
  return `cn:interp:${parts.section}:${h.digest("hex").slice(0, 32)}`;
}

export async function cacheGet(key: string): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const val = await redis.get<string>(key);
    return typeof val === "string" ? val : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: NINETY_DAYS_SECONDS });
  } catch {
    /* ignore cache write failures */
  }
}
