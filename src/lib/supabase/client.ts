import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// ══════════════════════════════════════════════════════════════
// Singleton browser client.
// Why: @supabase/ssr's browser client uses NavigatorLockManager on
// the `lock:sb-<ref>-auth-token` key. Instantiating multiple clients
// (one per page render) causes concurrent lock acquisitions → 5s
// timeout warning → hung getSession()/getUser() calls → broken UI.
// A single module-level instance serializes correctly with itself.
// ══════════════════════════════════════════════════════════════

let client: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (client) return client;
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";
  client = createBrowserClient(url, key);
  return client;
}
