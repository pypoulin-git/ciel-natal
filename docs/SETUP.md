# Natalune — Setup Guide

## Prerequisites

- Node.js 20+
- Vercel account (for deployment)
- Accounts needed: Supabase, Stripe, Google AI Studio (Gemini), Upstash (optional), xAI (optional), Resend (optional)

---

## 1. Supabase (Auth + Database + Storage)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and API keys from **Project Settings > API**:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key (keep secret)
3. Open **SQL Editor** and run every migration in `supabase/migrations/`, in order:
   - `001_initial_schema.sql` — profiles, saved_charts, audio_cache
   - `002_daily_forecasts.sql` — daily forecast cache (public read)
   - `003_lectures_and_preferences.sql` — PDF history + reading preferences
   - `004_audio_wav_mime.sql` — widen the audio bucket MIME types
   - `005_interpretation_cache.sql` — Gemini response cache (server-only)
   - `006_calendar_events.sql` — private calendar events (Premium)
   - `007_dreams.sql` — dream journal: dreams, interpretations, images, quotas
4. Enable auth providers in **Authentication > Providers**:
   - **Email**: enable (confirm email = on)
   - **Google**: enable (requires Google Cloud Console OAuth client)
5. Add redirect URL in **Authentication > URL Configuration**:
   - Site URL: `https://natalune.com`
   - Redirect URLs: `https://natalune.com/auth/callback`
6. Create the storage buckets in **Storage**:
   - `audio` — public, 5 MB, `audio/mpeg` (TTS narration)
   - `pdfs` — **private** (signed URLs), 5 MB, `application/pdf` (chart exports)
   - `dream-images` — **private** (signed URLs), 5 MB, `image/webp, image/png, image/jpeg`
     (dream imagery is intimate; the migration's storage policies only apply
     once the bucket exists, so create it before re-running `007_dreams.sql`)

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. APIs & Services > Credentials > Create OAuth 2.0 Client ID
4. Application type: Web application
5. Authorized redirect URIs: `https://<your-supabase-ref>.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret into Supabase > Authentication > Providers > Google

---

## 2. Stripe (Payment)

1. Go to [stripe.com](https://stripe.com) and create an account
2. Get API keys from **Developers > API keys**:
   - `STRIPE_SECRET_KEY` = Secret key (sk_live_... or sk_test_...)
3. Set up webhook in **Developers > Webhooks**:
   - Endpoint URL: `https://natalune.com/api/stripe/webhook`
   - Events: `checkout.session.completed`
   - Copy the signing secret: `STRIPE_WEBHOOK_SECRET` = whsec_...

### Testing

Use Stripe test mode with card `4242 4242 4242 4242` (any future date, any CVC).

---

## 3. Upstash Redis (Rate Limiting)

1. Go to [console.upstash.com](https://console.upstash.com)
2. Create a new Redis database (region: closest to Vercel deployment)
3. Copy from **REST API** tab:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## 4. AI APIs

### Google Gemini — required
1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Create an API key: `GOOGLE_GENERATIVE_AI_API_KEY`
3. It powers every AI surface: chart interpretations, synastry, AI chat, the
   daily forecast cron, and the dream journal (`gemini-2.5-flash` for readings,
   `gemini-2.5-flash-lite` for structuring, `gemini-2.5-flash-image` for the
   dream watercolours).

### xAI (Grok TTS — lecture audio Premium)
1. Go to [console.x.ai](https://console.x.ai)
2. Create an API key: `XAI_API_KEY`
3. Sans cette clé, la lecture audio retombe automatiquement sur Gemini
   (`GOOGLE_GENERATIVE_AI_API_KEY`). `TTS_PROVIDER=gemini` force le repli.

---

## 5. Vercel Environment Variables

In your Vercel project dashboard > **Settings > Environment Variables**:

Required — the app breaks without these:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
GOOGLE_GENERATIVE_AI_API_KEY
INTERNAL_API_SECRET
```

Optional — each degrades gracefully when absent:

```
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
XAI_API_KEY
TTS_PROVIDER
RESEND_API_KEY
RESEND_FROM
CONTACT_EMAIL
CRON_SECRET
ALLOWED_ORIGINS
NEXT_PUBLIC_SENTRY_DSN
SENTRY_DSN
SENTRY_AUTH_TOKEN
NEXT_PUBLIC_META_PIXEL_ID
NEXT_PUBLIC_GA4_ID
```

Set scope to **Production** + **Preview** for all variables.
`GET /api/diag/env` (header `x-internal-secret`) is the authoritative check —
it reports which expected variables are actually present.

---

## 6. Local Development

```bash
cp .env.example .env.local
# Fill in your values
npm install
npm run dev
```

Dev server runs on `http://localhost:3335`.

---

## 7. Deploy

```bash
git add -A && git commit -m "setup" && git push origin main
```

Vercel auto-deploys on push to `main`.
