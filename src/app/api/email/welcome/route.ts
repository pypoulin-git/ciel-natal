import { NextResponse } from "next/server";
import { escapeHtml, singleLine } from "@/lib/security";

/**
 * POST /api/email/welcome
 * Body: { email: string, displayName?: string, locale?: "fr" | "en" }
 * Header: x-internal-secret (required) — prevents the endpoint from being
 *   used as a spam relay against arbitrary email addresses. Only the
 *   /auth/callback handler should call this route.
 *
 * Sends a welcome email via Resend REST API. Requires RESEND_API_KEY
 * and RESEND_FROM env vars. Fails gracefully with 503 when not configured.
 */
export async function POST(req: Request) {
  try {
    // Internal-only: refuse calls that don't carry the shared secret.
    const internalSecret = process.env.INTERNAL_API_SECRET;
    if (!internalSecret) {
      return NextResponse.json({ error: "Service not configured" }, { status: 503 });
    }
    const provided = req.headers.get("x-internal-secret");
    if (provided !== internalSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, displayName, locale } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM || "Ciel Natal <onboarding@resend.dev>";

    if (!apiKey) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
    }

    const fr = locale !== "en";
    // Escape EVERY interpolation point — displayName comes from the user.
    const rawName = displayName || (fr ? "étoile" : "star");
    const safeName = escapeHtml(rawName);
    const subjectName = singleLine(rawName).slice(0, 80);

    const subject = fr
      ? `Bienvenue chez Ciel Natal, ${subjectName} ✦`
      : `Welcome to Ciel Natal, ${subjectName} ✦`;

    const html = fr
      ? `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:'Cormorant Garamond',Georgia,serif;color:#e8e3f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01));border:1px solid rgba(167,139,250,0.15);border-radius:16px;overflow:hidden;">
        <tr><td style="padding:40px 32px;">
          <p style="font-size:32px;text-align:center;margin:0 0 16px;color:#a78bfa;opacity:0.4;">✦</p>
          <h1 style="font-size:28px;text-align:center;margin:0 0 12px;color:#e8e3f5;font-weight:400;">Bienvenue chez Ciel Natal</h1>
          <p style="font-size:16px;line-height:1.7;text-align:center;margin:0 0 24px;color:#a8a3b5;">
            Bonjour ${safeName}, et merci d'avoir rejoint Ciel Natal. Ton espace personnel est prêt pour explorer les étoiles qui t'habitent.
          </p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 24px;color:#c8c3d5;">
            Voici ce que tu peux faire dès maintenant :
          </p>
          <ul style="font-size:15px;line-height:1.8;color:#c8c3d5;padding-left:24px;margin:0 0 32px;">
            <li>Calculer ton <strong>thème natal</strong> complet avec ton heure de naissance</li>
            <li>Lire un <strong>portrait cosmique</strong> écrit pour toi</li>
            <li>Poser tes questions à <strong>l'astrologue IA</strong> bienveillante</li>
            <li>Explorer la <strong>synastrie</strong> et la <strong>révolution solaire</strong> (Premium)</li>
          </ul>
          <div style="text-align:center;margin:32px 0;">
            <a href="https://ciel-natal.vercel.app/" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#a78bfa,#7c6ad8);color:#ffffff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:500;">Calculer mon thème natal</a>
          </div>
          <p style="font-size:13px;line-height:1.6;text-align:center;margin:32px 0 0;color:#6b6880;opacity:0.7;">
            Ciel Natal — astrologie psychologique inspirée de Jung et Liz Greene<br>
            <a href="https://ciel-natal.vercel.app" style="color:#a78bfa;text-decoration:none;">ciel-natal.vercel.app</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
      : `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:'Cormorant Garamond',Georgia,serif;color:#e8e3f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01));border:1px solid rgba(167,139,250,0.15);border-radius:16px;overflow:hidden;">
        <tr><td style="padding:40px 32px;">
          <p style="font-size:32px;text-align:center;margin:0 0 16px;color:#a78bfa;opacity:0.4;">✦</p>
          <h1 style="font-size:28px;text-align:center;margin:0 0 12px;color:#e8e3f5;font-weight:400;">Welcome to Ciel Natal</h1>
          <p style="font-size:16px;line-height:1.7;text-align:center;margin:0 0 24px;color:#a8a3b5;">
            Hello ${safeName}, and thank you for joining Ciel Natal. Your personal space is ready to explore the stars within you.
          </p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 24px;color:#c8c3d5;">
            Here is what you can do right now:
          </p>
          <ul style="font-size:15px;line-height:1.8;color:#c8c3d5;padding-left:24px;margin:0 0 32px;">
            <li>Calculate your full <strong>birth chart</strong> with your time of birth</li>
            <li>Read a <strong>cosmic portrait</strong> written for you</li>
            <li>Ask questions to the caring <strong>AI astrologer</strong></li>
            <li>Explore <strong>synastry</strong> and <strong>solar return</strong> (Premium)</li>
          </ul>
          <div style="text-align:center;margin:32px 0;">
            <a href="https://ciel-natal.vercel.app/" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#a78bfa,#7c6ad8);color:#ffffff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:500;">Calculate my birth chart</a>
          </div>
          <p style="font-size:13px;line-height:1.6;text-align:center;margin:32px 0 0;color:#6b6880;opacity:0.7;">
            Ciel Natal — psychological astrology inspired by Jung and Liz Greene<br>
            <a href="https://ciel-natal.vercel.app" style="color:#a78bfa;text-decoration:none;">ciel-natal.vercel.app</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Resend error:", errBody);
      return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
    }

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("welcome email error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
