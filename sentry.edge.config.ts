// Sentry Edge runtime — runs inside middleware and edge routes.
//
// Privacy hardening identical to the server config (Loi 25 + Sentry EU).
// AI Monitoring on Edge requires manual opt-in (not auto-enabled like Node).
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    sendDefaultPii: false,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
    integrations: [
      Sentry.vercelAIIntegration(),
    ],
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
