/**
 * QA cleanup — delete all Supabase users whose email matches py.poulin+qa*@gmail.com
 *
 * Usage:
 *   npx tsx scripts/qa-cleanup.ts
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (secret, never expose)
 *
 * Also removes PDFs from the `pdfs` storage bucket for each deleted user.
 * Run before re-executing QA to avoid "user_already_exists" (422) errors.
 */

import { createClient } from "@supabase/supabase-js";

// Load .env.local if running locally
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv").config({ path: ".env.local" });
} catch {
  /* dotenv not installed in CI, that's fine */
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error("✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Email pattern to wipe. Adjust if you use a different alias scheme.
const EMAIL_PATTERN = /^py\.poulin\+qa\d*@gmail\.com$/i;

const supabase = createClient(URL, KEY);

async function main() {
  console.log("→ Listing users…");

  // listUsers is paginated; default 50 per page. We only expect a handful of QA accounts.
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) {
    console.error("✗ listUsers failed:", error.message);
    process.exit(1);
  }

  const qaUsers = data.users.filter((u) => u.email && EMAIL_PATTERN.test(u.email));

  if (qaUsers.length === 0) {
    console.log("✓ No QA users to clean up.");
    return;
  }

  console.log(`→ Found ${qaUsers.length} QA user(s):`);
  qaUsers.forEach((u) => console.log(`   - ${u.email} (${u.id})`));

  for (const user of qaUsers) {
    // 1. Clean storage (best-effort — user may have 0 PDFs)
    try {
      const { data: files } = await supabase.storage.from("pdfs").list(user.id);
      if (files && files.length > 0) {
        const paths = files.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from("pdfs").remove(paths);
        console.log(`   · wiped ${paths.length} PDF(s) for ${user.email}`);
      }
    } catch (err) {
      console.warn(`   · storage cleanup warning for ${user.email}:`, err);
    }

    // 2. Delete auth user (cascades to profiles + saved_charts via ON DELETE CASCADE)
    const { error: delErr } = await supabase.auth.admin.deleteUser(user.id);
    if (delErr) {
      console.error(`   ✗ deleteUser failed for ${user.email}:`, delErr.message);
    } else {
      console.log(`   ✓ deleted ${user.email}`);
    }
  }

  console.log("\n✓ QA cleanup done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
