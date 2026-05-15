import { NextRequest, NextResponse } from "next/server";
import { getContactRateLimit } from "@/lib/ratelimit";
import { escapeHtml, singleLine, isSameOrigin } from "@/lib/security";

// In-memory fallback ONLY for local dev where Upstash isn't configured.
// In serverless prod the Upstash limiter (Redis) is the source of truth.
const fallbackMap = new Map<string, { count: number; resetAt: number }>();
const FALLBACK_LIMIT = 3;
const FALLBACK_WINDOW = 60 * 60 * 1000; // 1 hour

function fallbackRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = fallbackMap.get(ip);
  if (!entry || now > entry.resetAt) {
    fallbackMap.set(ip, { count: 1, resetAt: now + FALLBACK_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > FALLBACK_LIMIT;
}

async function sendEmail(name: string, email: string, message: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_EMAIL || "contact@ciel-natal.com";

  if (!apiKey) {
    console.warn("[Contact] RESEND_API_KEY not set — email not sent, logging only.");
    return false;
  }

  // Escape every user-controlled field before interpolating into HTML/subject.
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");
  const subjectName = singleLine(name).slice(0, 80);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Ciel Natal <noreply@ciel-natal.vercel.app>",
        to: [toEmail],
        reply_to: email,
        subject: `[Ciel Natal] Message de ${subjectName}`,
        text: `De: ${name} <${email}>\n\n${message}`,
        html: `<p><strong>De:</strong> ${safeName} &lt;${safeEmail}&gt;</p><hr/><p>${safeMessage}</p>`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Contact] Resend error:", err);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Contact] Resend fetch error:", err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Defense-in-depth: refuse cross-origin browser POSTs. Server-to-server
    // callers without an Origin header pass through and are filtered by the
    // honeypot + rate limit + Resend signature.
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // Persistent rate limit via Upstash; fallback to in-memory only in dev.
    const limiter = getContactRateLimit();
    if (limiter) {
      const { success } = await limiter.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Too many messages. Please try again later." },
          { status: 429 }
        );
      }
    } else if (fallbackRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, message, honeypot } = body;

    // Honeypot — silently succeed if filled (bot)
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json({ error: "Message must be at least 10 characters" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim().slice(0, 2000);

    console.log("[Contact Form]", {
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
      timestamp: new Date().toISOString(),
      ip,
    });

    await sendEmail(trimmedName, trimmedEmail, trimmedMessage);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
