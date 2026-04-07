import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "./redis";

// Free tier: 3 messages per 24 hours (by IP)
let _freeLimit: Ratelimit | null = null;
export function getFreeRateLimit(): Ratelimit | null {
  if (_freeLimit) return _freeLimit;
  const redis = getRedis();
  if (!redis) return null;

  _freeLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(3, "24 h"),
    prefix: "rl:free",
    analytics: false,
  });
  return _freeLimit;
}

// Premium tier: 200 messages per 30 days (by userId)
let _premiumLimit: Ratelimit | null = null;
export function getPremiumRateLimit(): Ratelimit | null {
  if (_premiumLimit) return _premiumLimit;
  const redis = getRedis();
  if (!redis) return null;

  _premiumLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(200, "30 d"),
    prefix: "rl:premium",
    analytics: false,
  });
  return _premiumLimit;
}
