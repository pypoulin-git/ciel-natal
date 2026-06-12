import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient, type User } from "@supabase/supabase-js";
import type { EmailOtpType } from "@supabase/supabase-js";

// Allow only same-origin relative paths to prevent open-redirect via ?next=
// (eg. ?next=//evil.com is parsed by some clients as absolute URL).
function sanitizeNext(raw: string | null): string {
  if (!raw) return "/";
  if (!raw.startsWith("/")) return "/";
  if (raw.startsWith("//")) return "/";
  if (raw.startsWith("/\\")) return "/";
  return raw;
}

// Post-auth side effects: defensive profile upsert + one-time welcome email.
async function onSignedIn(user: User, origin: string, locale: string) {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey || !supabaseUrl) return;
    const admin = createAdminClient(supabaseUrl, serviceKey);

    // Check if a welcome email has already been sent
    const { data: existing } = await admin
      .from("profiles")
      .select("id, welcome_sent_at")
      .eq("id", user.id)
      .maybeSingle();
    const isFirstSignIn = !existing?.welcome_sent_at;

    await admin.from("profiles").upsert(
      {
        id: user.id,
        display_name:
          user.user_metadata?.display_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          null,
      },
      { onConflict: "id", ignoreDuplicates: true }
    );

    // Fire-and-forget welcome email on first sign-in
    if (isFirstSignIn && user.email && process.env.RESEND_API_KEY) {
      const displayName =
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        user.email.split("@")[0];
      // Don't await — non-blocking
      fetch(`${origin}/api/email/welcome`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Internal-only endpoint — proves the call comes from our server.
          // .trim() defends against the trailing \n that `vercel env add`
          // sometimes appends when the value is piped via echo. The
          // receive side (welcome route) also trims — they must match.
          "x-internal-secret": (process.env.INTERNAL_API_SECRET || "").trim(),
        },
        body: JSON.stringify({ email: user.email, displayName, locale }),
      })
        .then(async (res) => {
          if (res.ok) {
            await admin
              .from("profiles")
              .update({ welcome_sent_at: new Date().toISOString() })
              .eq("id", user.id);
          }
        })
        .catch(() => { /* ignore */ });
    }
  } catch {
    // Non-blocking — trigger should have handled it
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const otpType = searchParams.get("type") as EmailOtpType | null;
  const next = sanitizeNext(searchParams.get("next"));
  const locale = searchParams.get("locale") || "fr";

  const supabase = await createClient();

  // token_hash flow (email templates link here directly). Unlike the PKCE
  // ?code= flow, verifyOtp doesn't need the code_verifier cookie, so the
  // link works even when opened in a different browser/device than the one
  // that initiated the signup — the main cause of ?error=auth failures.
  if (tokenHash && otpType) {
    const { error, data } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: tokenHash,
    });
    if (!error && data.user) {
      await onSignedIn(data.user, origin, locale);
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth-callback] verifyOtp failed:", error?.code, error?.message);
    return NextResponse.redirect(`${origin}/connexion?error=auth`);
  }

  // PKCE flow — OAuth (Google) and password reset links keep using ?code=.
  if (code) {
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      await onSignedIn(data.user, origin, locale);
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth-callback] exchangeCodeForSession failed:", error?.code, error?.message);
  }

  return NextResponse.redirect(`${origin}/connexion?error=auth`);
}
