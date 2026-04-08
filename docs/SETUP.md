# Ciel Natal — Setup Guide

## Prerequisites

- Node.js 20+
- Vercel account (for deployment)
- Accounts needed: Supabase, Stripe, Upstash, OpenAI, Anthropic

---

## 1. Supabase (Auth + Database + Storage)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and API keys from **Project Settings > API**:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key (keep secret)
3. Open **SQL Editor** and run the migration file: `supabase/migrations/001_initial_schema.sql`
4. Enable auth providers in **Authentication > Providers**:
   - **Email**: enable (confirm email = on)
   - **Google**: enable (requires Google Cloud Console OAuth client)
5. Add redirect URL in **Authentication > URL Configuration**:
   - Site URL: `https://ciel-natal.vercel.app`
   - Redirect URLs: `https://ciel-natal.vercel.app/auth/callback`
6. Create storage bucket in **Storage**:
   - Name: `audio`
   - Public: yes
   - File size limit: 5MB
   - Allowed MIME types: `audio/mpeg`

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
   - Endpoint URL: `https://ciel-natal.vercel.app/api/stripe/webhook`
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

### Anthropic (Chat)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key: `ANTHROPIC_API_KEY`

### OpenAI (Audio TTS)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key: `OPENAI_API_KEY`

---

## 5. Vercel Environment Variables

In your Vercel project dashboard > **Settings > Environment Variables**, add all 10 variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
ANTHROPIC_API_KEY
OPENAI_API_KEY
```

Set scope to **Production** + **Preview** for all variables.

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
