import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const isDev = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // 'unsafe-eval' is only needed by Next's dev HMR/React Refresh.
              // Drop it in production to harden against injected-script execution.
              // Marketing pixels (Meta + GA4) are consent-gated at runtime in
              // MarketingPixels.tsx; these allow-list entries only let them load
              // once the user opts in — nothing fires otherwise.
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://js.stripe.com https://connect.facebook.net https://www.googletagmanager.com`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://www.facebook.com https://www.google-analytics.com https://www.googletagmanager.com",
              // AI providers (Anthropic/OpenAI) are called server-side only, so
              // they don't belong in connect-src (which governs browser fetch).
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.upstash.io https://nominatim.openstreetmap.org https://secure.geonames.org https://*.sentry.io https://*.ingest.sentry.io https://www.facebook.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
              "media-src 'self' https://*.supabase.co",
              'frame-src https://js.stripe.com https://checkout.stripe.com',
            ].join('; '),
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
}

// Sentry wrapper — active only when SENTRY_DSN is set. Otherwise a no-op.
// org/project are read from SENTRY_ORG / SENTRY_PROJECT env vars (or hard-code
// them here once the Sentry account exists).
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Wider client file upload for cleaner stack traces in browser errors.
  widenClientFileUpload: true,
  // Tunnel route to bypass ad-blockers (only active when DSN present).
  // Must be excluded from src/middleware.ts matcher — already handled.
  tunnelRoute: '/monitoring',
  // Skip source map upload when token missing (avoids local build errors).
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  silent: !process.env.CI,
})
