// Generate a short-lived session for PY's user (via service role) and call
// the /api/chat endpoint to verify the Gemini integration end-to-end.

const URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\\n$/, "").trim();
const KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const PY_USER_ID = "68d08cd7-4dea-4678-8a24-183000243901";

async function main() {
  console.log("URL:", URL);
  console.log("KEY?", !!KEY);

  // Generate a magic link for PY — gives us an action_link that contains a token_hash.
  // We can exchange it for an access_token via the verify endpoint.
  const linkRes = await fetch(`${URL}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "magiclink", email: "py.poulin@gmail.com" }),
  });
  const linkData = await linkRes.json();
  console.log("magiclink generated:", linkRes.status, JSON.stringify(linkData).slice(0, 200));
  const hashedToken = linkData?.properties?.hashed_token;
  if (!hashedToken) {
    console.error("No hashed_token returned");
    process.exit(1);
  }

  // Exchange the hashed_token for a session
  const verifyRes = await fetch(`${URL}/auth/v1/verify`, {
    method: "POST",
    headers: { apikey: KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "magiclink", token: hashedToken }),
  });
  const session = await verifyRes.json();
  console.log("verify status:", verifyRes.status);
  if (!session?.access_token) {
    console.error("No access_token in session:", JSON.stringify(session).slice(0, 400));
    process.exit(1);
  }
  const accessToken = session.access_token;
  console.log("got access_token, length:", accessToken.length);

  // Call /api/chat
  console.log("\nCalling /api/chat ...");
  const chatRes = await fetch("https://ciel-natal.vercel.app/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({
      messages: [{ role: "user", content: "dis bonjour en 8 mots" }],
      chartContext: "Soleil Gémeaux, Lune Poissons, Ascendant Verseau",
      locale: "fr",
      genre: "neutre",
      voice: "sensible",
    }),
  });

  console.log("chat status:", chatRes.status);
  console.log("content-type:", chatRes.headers.get("content-type"));

  // Stream the response
  const reader = chatRes.body.getReader();
  const dec = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    full += dec.decode(value, { stream: true });
  }
  console.log("=== RESPONSE ===");
  console.log(full);
  console.log("=== END (", full.length, "chars) ===");
}

main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
