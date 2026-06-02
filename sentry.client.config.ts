// Sentry browser SDK — runs on every client page load.
// No DSN configured → Sentry is a silent no-op (safe default).
//
// Privacy hardening (Loi 25 + Sentry EU region):
//   - sendDefaultPii: false — never attach the user's IP or cookies.
//   - replays disabled — no DOM recording, no session activity capture.
//   - beforeSend scrubs URL query strings and known sensitive keys.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    // VERCEL_ENV distinguishes production / preview / development; NODE_ENV
    // would tag every Vercel preview as "production" which makes alerts noisy.
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
    beforeSend(event) {
      // Strip ?c=…, ?s=…, ?token=… and any other query that may carry
      // birth-data payloads or share tokens.
      if (event.request?.url) {
        try {
          const u = new URL(event.request.url);
          u.search = "";
          event.request.url = u.toString();
        } catch { /* keep raw on parse failure */ }
      }
      // Remove any user object we never set on purpose, in case a plugin did.
      delete event.user;
      return event;
    },
  });
}
