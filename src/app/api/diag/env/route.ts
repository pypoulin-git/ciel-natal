import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Internal diagnostic endpoint — reports which secrets are present in the
 * runtime, never their values. Protected by INTERNAL_API_SECRET so it can't
 * be probed by anyone but the operator.
 *
 * Use:
 *   curl -H "x-internal-secret: $S" https://ciel-natal.vercel.app/api/_diag/env
 */
export async function GET(req: NextRequest) {
  // .trim() defends against trailing-newline corruption from
  // `echo "$X" | vercel env add` (echo appends a real newline to stdin).
  const secret = process.env.INTERNAL_API_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "Service not configured" }, { status: 503 });
  }
  const provided = req.headers.get("x-internal-secret")?.trim();
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // List of env vars the app expects, with the feature each one unlocks.
  const expected: Array<{ name: string; feature: string; required: boolean }> = [
    { name: "NEXT_PUBLIC_SUPABASE_URL", feature: "Supabase (auth, DB)", required: true },
    { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", feature: "Supabase (auth, DB)", required: true },
    { name: "SUPABASE_SERVICE_ROLE_KEY", feature: "Supabase admin (webhook, PDF save)", required: true },
    { name: "STRIPE_SECRET_KEY", feature: "Stripe checkout (premium)", required: true },
    { name: "STRIPE_WEBHOOK_SECRET", feature: "Stripe webhook (premium activation)", required: true },
    { name: "GOOGLE_GENERATIVE_AI_API_KEY", feature: "Gemini — chat IA + interpretations + TTS", required: true },
    { name: "RESEND_API_KEY", feature: "Resend — PDF email + contact form", required: false },
    { name: "RESEND_FROM", feature: "Resend — sender address", required: false },
    { name: "CONTACT_EMAIL", feature: "Contact form recipient", required: false },
    { name: "UPSTASH_REDIS_REST_URL", feature: "Upstash — rate limit + chat counters", required: false },
    { name: "UPSTASH_REDIS_REST_TOKEN", feature: "Upstash — rate limit + chat counters", required: false },
    { name: "SENTRY_DSN", feature: "Sentry — error tracking", required: false },
    { name: "INTERNAL_API_SECRET", feature: "Internal endpoints (welcome email, this diag)", required: true },
  ];

  const status = expected.map((v) => {
    const val = process.env[v.name];
    return {
      name: v.name,
      feature: v.feature,
      required: v.required,
      present: !!val,
      length: val?.length ?? 0,
      // Fingerprint: first 4 + last 2 chars only — never enough to leak the secret
      fingerprint: val && val.length > 8 ? `${val.slice(0, 4)}…${val.slice(-2)}` : null,
    };
  });

  const missing = status.filter((s) => s.required && !s.present);
  const optionalMissing = status.filter((s) => !s.required && !s.present);

  return NextResponse.json({
    runtime: "nodejs",
    nodeVersion: process.version,
    deploymentRegion: process.env.VERCEL_REGION || "unknown",
    requiredOk: missing.length === 0,
    missing: missing.map((m) => m.name),
    optionalMissing: optionalMissing.map((m) => m.name),
    all: status,
  });
}
