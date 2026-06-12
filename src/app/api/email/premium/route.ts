import { NextResponse } from "next/server";
import { escapeHtml, singleLine } from "@/lib/security";

/**
 * POST /api/email/premium
 * Body: { email: string, displayName?: string, locale?: "fr" | "en" }
 * Header: x-internal-secret (required) — prevents the endpoint from being
 *   used as a spam relay. Only the Stripe webhook should call this route.
 *
 * Sends the premium purchase confirmation email via Resend. Requires
 * RESEND_API_KEY and RESEND_FROM env vars. Fails gracefully with 503
 * when not configured.
 */
export async function POST(req: Request) {
  try {
    const internalSecret = process.env.INTERNAL_API_SECRET?.trim();
    if (!internalSecret) {
      return NextResponse.json({ error: "Service not configured" }, { status: 503 });
    }
    const provided = req.headers.get("x-internal-secret")?.trim();
    if (provided !== internalSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, displayName, locale } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM || "Natalune <onboarding@resend.dev>";

    if (!apiKey) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
    }

    const fr = locale !== "en";
    const rawName = displayName || (fr ? "étoile" : "star");
    const safeName = escapeHtml(rawName);
    const subjectName = singleLine(rawName).slice(0, 80);

    const subject = fr
      ? `Bienvenue dans Natalune Premium, ${subjectName} ✦`
      : `Welcome to Natalune Premium, ${subjectName} ✦`;

    const featuresFr = [
      ["✦", "Interprétations complètes", "toutes les planètes, maisons et aspects décryptés pour toi"],
      ["💬", "Chat IA illimité", "pose toutes tes questions à ton astrologue bienveillante"],
      ["📄", "Export PDF", "télécharge ta carte en format professionnel"],
      ["💾", "Sauvegarde de cartes", "enregistre jusqu'à 10 cartes (amis, famille, partenaire)"],
      ["🎧", "Narration audio", "écoute ta lecture comme si une astrologue te parlait"],
      ["💞", "Synastrie", "explore la compatibilité entre deux cartes du ciel"],
      ["🔮", "Transits personnalisés", "les mouvements planétaires actuels croisés avec ta carte"],
    ];
    const featuresEn = [
      ["✦", "Full interpretations", "all planets, houses and aspects decoded for you"],
      ["💬", "Unlimited AI chat", "ask all your questions to a caring astrologer"],
      ["📄", "PDF export", "download your chart in professional format"],
      ["💾", "Save charts", "save up to 10 charts (friends, family, partner)"],
      ["🎧", "Audio narration", "listen to your reading as if an astrologer were speaking to you"],
      ["💞", "Synastry", "explore compatibility between two birth charts"],
      ["🔮", "Personalized transits", "current planetary movements crossed with your chart"],
    ];
    const features = fr ? featuresFr : featuresEn;

    const featureList = features
      .map(
        ([icon, title, desc]) =>
          `<li style="margin:0 0 10px;">${icon} <strong>${title}</strong> — ${desc}</li>`
      )
      .join("\n            ");

    const intro = fr
      ? `Merci ${safeName} ! Ton accès Premium est activé — à vie, sans abonnement. Voici tout ce qui vient de s'ouvrir pour toi :`
      : `Thank you ${safeName}! Your Premium access is now active — lifetime, no subscription. Here is everything that just unlocked for you:`;
    const cta = fr ? "Explorer mon espace Premium" : "Explore my Premium space";
    const title = fr ? "Bienvenue dans Premium" : "Welcome to Premium";
    const footerNote = fr
      ? "Un souci avec ton achat ? Réponds simplement à cet email."
      : "Any issue with your purchase? Simply reply to this email.";

    const html = `
<!DOCTYPE html>
<html lang="${fr ? "fr" : "en"}">
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:'Cormorant Garamond',Georgia,serif;color:#e8e3f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01));border:1px solid rgba(167,139,250,0.15);border-radius:16px;overflow:hidden;">
        <tr><td style="padding:40px 32px;">
          <p style="font-size:32px;text-align:center;margin:0 0 16px;color:#a78bfa;opacity:0.4;">✦</p>
          <h1 style="font-size:28px;text-align:center;margin:0 0 12px;color:#e8e3f5;font-weight:400;">${title}</h1>
          <p style="font-size:16px;line-height:1.7;text-align:center;margin:0 0 24px;color:#a8a3b5;">
            ${intro}
          </p>
          <ul style="font-size:15px;line-height:1.6;color:#c8c3d5;padding-left:24px;margin:0 0 32px;list-style:none;">
            ${featureList}
          </ul>
          <div style="text-align:center;margin:32px 0;">
            <a href="https://natalune.com/mon-compte" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#a78bfa,#7c6ad8);color:#ffffff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:500;">${cta}</a>
          </div>
          <p style="font-size:13px;line-height:1.6;text-align:center;margin:32px 0 0;color:#6b6880;opacity:0.7;">
            ${footerNote}<br><br>
            Natalune — ${fr ? "astrologie psychologique inspirée de Jung et Liz Greene" : "psychological astrology inspired by Jung and Liz Greene"}<br>
            <a href="https://natalune.com" style="color:#a78bfa;text-decoration:none;">natalune.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const text = `${fr ? "Merci" : "Thank you"} ${singleLine(rawName)} !

${fr ? "Ton accès Natalune Premium est activé — à vie, sans abonnement." : "Your Natalune Premium access is now active — lifetime, no subscription."}

${features.map(([, title, desc]) => `- ${title} : ${desc}`).join("\n")}

${cta} : https://natalune.com/mon-compte

${footerNote}
Natalune — https://natalune.com`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [email],
        reply_to: process.env.CONTACT_EMAIL || "contact@natalune.com",
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Resend error (premium):", res.status, errBody);
      return NextResponse.json(
        { error: "Failed to send email", resendStatus: res.status, resendError: errBody.slice(0, 500) },
        { status: 502 }
      );
    }

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("premium email error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
