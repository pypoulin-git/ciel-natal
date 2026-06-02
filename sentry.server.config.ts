// Sentry Node SDK — runs inside server components, route handlers, middleware.
//
// Privacy hardening (Loi 25 + Sentry EU region):
//   - sendDefaultPii: false — no IP, no Authorization header forwarded.
//   - beforeSend scrubs query strings + a denylist of sensitive headers.
//
// AI Monitoring:
//   - vercelAIIntegration({ force: true }) — required on Vercel because the
//     `ai` package gets bundled, breaking automatic module detection. With
//     `force: true` we still get semantic span names (gen_ai.*) and token
//     metrics on every call wrapped with experimental_telemetry.
//   - anthropicAIIntegration() — listed defensively (Anthropic isn't currently
//     called by any route, but if a future route adds it the integration will
//     auto-instrument).
//   - recordInputs/recordOutputs follow sendDefaultPii — both default to FALSE
//     here, so prompts and completions never leave for Sentry. We only get
//     model name, latency, and token counts.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

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
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    sendDefaultPii: false,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
    integrations: [
      Sentry.vercelAIIntegration({ force: true }),
      Sentry.anthropicAIIntegration(),
    ],
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
