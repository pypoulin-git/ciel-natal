/**
 * Small server-side security helpers.
 *
 * Kept dependency-free so any route file can import a single primitive without
 * pulling a full sanitization library into the bundle.
 */

import { NextRequest } from "next/server";

/**
 * Escape user-supplied strings before interpolating them into an HTML email
 * template. Resend HTML bodies are rendered by recipient mail clients (many
 * still execute inline JS or remote resources), so an unescaped `${userInput}`
 * is a stored-XSS-by-email vector. Always pipe through this for any field
 * that comes from a form, a profile name, a label, etc.
 *
 * Also neutralizes CR/LF injection in single-line fields (e.g. email subjects)
 * by stripping line separators.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strip CR/LF and other Unicode line terminators (subject / header injection). */
export function singleLine(input: string): string {
  return input.replace(new RegExp("[\r\n\u2028\u2029]+", "g"), " ").trim();
}

/**
 * Defense-in-depth Origin/Referer check for POST endpoints that may be hit
 * from anonymous (cookie-bearing) contexts. Bearer-token endpoints don't need
 * this — the token already proves intent — but anonymous POST routes
 * (/api/contact, etc.) do.
 *
 * Returns true if the request looks same-origin. Server-to-server callers
 * (Stripe webhook, cron jobs, curl probes) carry no Origin header at all and
 * are NOT blocked by this helper — they must rely on their own signature
 * verification.
 */
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");

  // No Origin and no Referer = likely a non-browser caller (curl, server-to-server).
  // We don't block; downstream routes apply their own auth/signature checks.
  if (!origin && !referer) return true;

  const candidates: string[] = [];
  if (origin) candidates.push(origin);
  if (referer) {
    try {
      candidates.push(new URL(referer).origin);
    } catch {
      /* malformed referer — treat as untrusted */
      return false;
    }
  }

  // Build the list of allowed origins for the current deployment.
  const allowed = new Set<string>();
  if (host) {
    allowed.add(`https://${host}`);
    allowed.add(`http://${host}`); // localhost dev
  }
  // Honor an explicit allow-list from env (comma-separated, full origins).
  if (process.env.ALLOWED_ORIGINS) {
    for (const o of process.env.ALLOWED_ORIGINS.split(",")) {
      const trimmed = o.trim();
      if (trimmed) allowed.add(trimmed);
    }
  }
  // Vercel preview deployments share the project alias.
  allowed.add("https://ciel-natal.vercel.app");

  return candidates.every((c) => allowed.has(c));
}
