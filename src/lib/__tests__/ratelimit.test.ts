import { describe, it, expect, beforeEach, vi } from "vitest";

describe("ratelimit fallback", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("returns null when Upstash env vars are missing", async () => {
    const { getFreeRateLimit, getPremiumRateLimit } = await import("@/lib/ratelimit");
    expect(getFreeRateLimit()).toBeNull();
    expect(getPremiumRateLimit()).toBeNull();
  });

  it("getRedis returns null without credentials", async () => {
    const { getRedis } = await import("@/lib/redis");
    expect(getRedis()).toBeNull();
  });
});
