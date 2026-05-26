// Direct REST against Supabase admin API. Bypasses supabase-js (Node 24 bug).
const URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\\n$/, "").trim();
const KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

console.log("URL:", URL);
console.log("KEY?", !!KEY, KEY.length, "chars");

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
};

// 1. auth.users
const usersRes = await fetch(`${URL}/auth/v1/admin/users?per_page=50`, { headers });
const usersBody = await usersRes.text();
console.log("\n=== auth.users (HTTP", usersRes.status + ") ===");
try {
  const j = JSON.parse(usersBody);
  for (const u of j.users || []) {
    console.log(`  ${u.id} | ${u.email} | confirmed=${!!u.email_confirmed_at} | created=${u.created_at?.slice(0,19)}`);
  }
  console.log("  total:", j.users?.length ?? 0);
} catch {
  console.log("  body:", usersBody.slice(0, 400));
}

// 2. profiles
const profRes = await fetch(`${URL}/rest/v1/profiles?select=*`, { headers });
const profBody = await profRes.text();
console.log("\n=== profiles (HTTP", profRes.status + ") ===");
try {
  const j = JSON.parse(profBody);
  for (const p of j) console.log(" ", JSON.stringify(p));
  console.log("  total:", j.length);
} catch {
  console.log("  body:", profBody.slice(0, 400));
}
