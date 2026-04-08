import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter (per deployment instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3; // max 3 messages per window
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// Send email via Resend API (no SDK required)
async function sendEmail(name: string, email: string, message: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_EMAIL || "contact@ciel-natal.com";

  if (!apiKey) {
    console.warn("[Contact] RESEND_API_KEY not set — email not sent, logging only.");
    return false;
  }

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
        subject: `[Ciel Natal] Message de ${name}`,
        text: `De: ${name} <${email}>\n\n${message}`,
        html: `<p><strong>De:</strong> ${name} &lt;${email}&gt;</p><hr/><p>${message.replace(/\n/g, "<br/>")}</p>`,
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
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, message, honeypot } = body;

    // Honeypot check — if filled, silently reject (bot)
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    // Validate
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

    // Always log
    console.log("[Contact Form]", {
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
      timestamp: new Date().toISOString(),
      ip,
    });

    // Send email if Resend is configured
    await sendEmail(trimmedName, trimmedEmail, trimmedMessage);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
