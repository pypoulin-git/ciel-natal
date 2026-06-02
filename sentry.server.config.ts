// Sentry Node SDK — runs inside server components, route handlers, middleware.
//
// Privacy hardening (Loi 25 + Sentry EU region):
//   - sendDefaultPii: false — no IP, no Authorization header forwarded.
//   - beforeSend scrubs query strings + a denylist of sensitive headers.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

// Header keys that must NEVER reach Sentry — they would either leak a
// secret (signature, auth token) or PII (cookie, ip).
const SENSITIVE_HEADERS = new Set([
  "authorization",
  "cookie",
  "stripe-signature",
  "x-internal-secret",
  "x-forwarded-for",
  "x-real-ip",
]);

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    // VERCEL_ENV is set automatically by Vercel and distinguishes
    // production / preview / development. Falls back to NODE_ENV locally.
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
    beforeSend(event) {
      if (event.request?.url) {
        try {
          const u = new URL(event.request.url);
          u.search = "";
          event.request.url = u.toString();
        } catch { /* keep raw on parse failure */ }
      }
      if (event.request?.headers) {
        const cleaned: Record<string, string> = {};
        for (const [k, v] of Object.entries(event.request.headers)) {
          if (!SENSITIVE_HEADERS.has(k.toLowerCase())) cleaned[k] = String(v);
        }
        event.request.headers = cleaned;
      }
      delete event.user;
      return event;
    },
  });
}
