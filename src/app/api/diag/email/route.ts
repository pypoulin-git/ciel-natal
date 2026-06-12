import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Internal diagnostic endpoint — sends a real test email through Resend and
 * returns Resend's raw response, so delivery blockers (unverified domain,
 * RESEND_FROM mismatch, invalid API key) are visible without digging through
 * Vercel logs. Protected by INTERNAL_API_SECRET like /api/diag/env.
 *
 * Use:
 *   curl -H "x-internal-secret: $S" "https://natalune.com/api/diag/email?to=you@example.com"
 */
export async function GET(req: NextRequest) {
  const secret = process.env.INTERNAL_API_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "Service not configured" }, { status: 503 });
  }
  const provided = req.headers.get("x-internal-secret")?.trim();
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const to = req.nextUrl.searchParams.get("to")?.trim() || "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json(
      { error: "Missing or invalid ?to= email address" },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Natalune <onboarding@resend.dev>";
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, from, hint: "RESEND_API_KEY absent du runtime — ajoute la variable sur Vercel puis redéploie." },
      { status: 503 }
    );
  }

  const now = new Date().toISOString();
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Test de délivrabilité Natalune ✦ ${now}`,
      html: `<p>Test d'envoi Natalune via Resend.</p><p>From: ${from}<br>Horodatage: ${now}</p>`,
      text: `Test d'envoi Natalune via Resend.\nFrom: ${from}\nHorodatage: ${now}`,
    }),
  });

  let resendBody: unknown;
  const raw = await res.text();
  try {
    resendBody = JSON.parse(raw);
  } catch {
    resendBody = raw.slice(0, 1000);
  }

  let hint: string;
  if (res.ok) {
    hint = "Resend a accepté l'email — vérifie la boîte de réception (et les spams), puis l'onglet Emails du dashboard Resend pour le statut delivered/bounced.";
  } else if (res.status === 401) {
    hint = "Clé API invalide — régénère RESEND_API_KEY sur resend.com/api-keys, mets à jour la variable Vercel et redéploie.";
  } else if (/not verified|verify a domain|domain is not/i.test(raw)) {
    hint = "Le domaine de RESEND_FROM n'est pas vérifié sur Resend — va sur resend.com/domains, ajoute natalune.com et pose les enregistrements DNS demandés.";
  } else if (res.status === 403) {
    hint = "Resend refuse cet expéditeur — vérifie que RESEND_FROM utilise exactement le domaine vérifié sur resend.com/domains.";
  } else {
    hint = "Voir le détail de l'erreur Resend ci-dessus.";
  }

  return NextResponse.json({
    ok: res.ok,
    from,
    to,
    resendStatus: res.status,
    resend: resendBody,
    hint,
  });
}
