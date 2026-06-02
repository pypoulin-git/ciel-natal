// Sentry browser SDK — runs on every client page load.
// No DSN configured → Sentry is a silent no-op (safe default).
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    // Session replays entirely disabled — Loi 25 / RGPD concerns over
    // recording user activity even on error. Stack traces + breadcrumbs
    // are enough for triage.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    // VERCEL_ENV distinguishes production / preview / development; NODE_ENV
    // would tag every Vercel preview as "production" which makes alerts noisy.
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  });
}
