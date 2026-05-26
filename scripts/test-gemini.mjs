// Quick smoke test of @ai-sdk/google + Gemini.
// Run with: node scripts/test-gemini.mjs
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!apiKey) {
  console.error("Set GOOGLE_GENERATIVE_AI_API_KEY first");
  process.exit(1);
}

console.log("Testing gemini-2.5-flash...");
try {
  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    prompt: "Dis bonjour en une phrase poétique en français.",
  });
  console.log("Response:", text);
} catch (e) {
  console.error("ERR:", e.message);
  console.error(e);
}
