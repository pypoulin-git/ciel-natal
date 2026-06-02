// Sentry browser SDK — Next.js 13+ canonical pattern.
//
// This file replaces the older `sentry.client.config.ts`. Next.js auto-loads it
// for the client bundle on every page load. We also export
// `onRouterTransitionStart` so navigation spans in the App Router get captured.
//
// Privacy hardening (Loi 25 + Sentry EU region):
//   - sendDefaultPii: false — never attach IP, cookies, or auth headers.
//   - Session replays fully disabled — no DOM recording.
//   - beforeSend scrubs URL query strings (we encode birth data in `?c=` /
//     `?s=` share URLs — these must never reach Sentry).
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // 100% in dev, 10% in prod — matches the SDK skill recommendation.
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    sendDefaultPii: false,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    // VERCEL_ENV distinguishes production / preview / development; NODE_ENV
    // would tag every Vercel preview as "production" which makes alerts noisy.
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
    beforeSend(event) {
      if (event.request?.url) {
        try {
          const u = new URL(event.request.url);
          u.search = "";
          event.request.url = u.toString();
        } catch { /* keep raw on parse failure */ }
      }
      delete event.user;
      return event;
    },
  });
}

// App Router navigation tracing — captures the start of every client-side route
// transition. Sentry surfaces this as a span in the trace tree.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
