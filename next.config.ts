import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.upstash.io https://api.anthropic.com https://api.openai.com https://nominatim.openstreetmap.org https://secure.geonames.org https://*.sentry.io https://*.ingest.sentry.io",
              "media-src 'self' https://*.supabase.co",
              "frame-src https://js.stripe.com https://checkout.stripe.com",
            ].join("; "),
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

// Sentry wrapper — active only when SENTRY_DSN is set. Otherwise a no-op.
export default withSentryConfig(nextConfig, {
  silent: true,
  // Tunnel route to bypass ad-blockers (only active when DSN present).
  tunnelRoute: "/monitoring",
  // Skip source map upload when token missing (avoids local build errors).
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
