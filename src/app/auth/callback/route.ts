import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Defensive profile upsert (trigger handles most cases, this is a safety net)
      try {
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (serviceKey && supabaseUrl) {
          const admin = createAdminClient(supabaseUrl, serviceKey);
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
        }
      } catch {
        // Non-blocking — trigger should have handled it
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/connexion?error=auth`);
}
