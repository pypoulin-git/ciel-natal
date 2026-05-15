import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Allow only same-origin relative paths to prevent open-redirect via ?next=
// (eg. ?next=//evil.com is parsed by some clients as absolute URL).
function sanitizeNext(raw: string | null): string {
  if (!raw) return "/";
  if (!raw.startsWith("/")) return "/";
  if (raw.startsWith("//")) return "/";
  if (raw.startsWith("/\\")) return "/";
  return raw;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Defensive profile upsert (trigger handles most cases, this is a safety net)
      let isFirstSignIn = false;
      try {
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (serviceKey && supabaseUrl) {
          const admin = createAdminClient(supabaseUrl, serviceKey);
          // Check if a welcome email has already been sent
          const { data: existing } = await admin
            .from("profiles")
            .select("id, welcome_sent_at")
            .eq("id", data.user.id)
            .maybeSingle();
          isFirstSignIn = !existing?.welcome_sent_at;

          await admin.from("profiles").upsert(
            {
              id: data.user.id,
              display_name:
                data.user.user_metadata?.display_name ||
                data.user.user_metadata?.full_name ||
                data.user.email?.split("@")[0] ||
                null,
            },
            { onConflict: "id", ignoreDuplicates: true }
          );

          // Fire-and-forget welcome email on first sign-in
          if (isFirstSignIn && data.user.email && process.env.RESEND_API_KEY) {
            const displayName =
              data.user.user_metadata?.display_name ||
              data.user.user_metadata?.full_name ||
              data.user.email.split("@")[0];
            const locale = searchParams.get("locale") || "fr";
            // Don't await — non-blocking
            fetch(`${origin}/api/email/welcome`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                // Internal-only endpoint — proves the call comes from our server.
                "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
              },
              body: JSON.stringify({ email: data.user.email, displayName, locale }),
            })
              .then(async (res) => {
                if (res.ok) {
                  await admin
                    .from("profiles")
                    .update({ welcome_sent_at: new Date().toISOString() })
                    .eq("id", data.user.id);
                }
              })
              .catch(() => { /* ignore */ });
          }
        }
      } catch {
        // Non-blocking — trigger should have handled it
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/connexion?error=auth`);
}
