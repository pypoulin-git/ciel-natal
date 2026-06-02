// Sentry Node SDK — runs inside server components, route handlers, middleware.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    // VERCEL_ENV is set automatically by Vercel and distinguishes
    // production / preview / development. Falls back to NODE_ENV locally.
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  });
}
