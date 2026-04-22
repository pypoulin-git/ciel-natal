import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// Free tier: 3 lifetime saved lectures. Premium: unlimited.
const FREE_TIER_LIMIT = 3;

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function verifyAuth(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.auth.getUser(token);
  return data?.user?.id ?? null;
}

async function getProfile(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("profiles")
    .select("is_premium, display_name")
    .eq("id", userId)
    .single();
  return data;
}

// POST — Save a PDF (multipart/form-data)
//   fields: file (blob, application/pdf), label (text), formData (JSON), chartData (JSON)
export async function POST(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    const label = form.get("label")?.toString() ?? "Lecture";
    const formDataRaw = form.get("formData")?.toString() ?? "{}";
    const chartDataRaw = form.get("chartData")?.toString() ?? "null";
    const sendEmail = form.get("sendEmail")?.toString() === "true";

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 });
    }

    const formData = JSON.parse(formDataRaw);
    const chartData = chartDataRaw !== "null" ? JSON.parse(chartDataRaw) : null;

    const supabase = getSupabaseAdmin();

    // ── Check free-tier limit ──
    const profile = await getProfile(userId);
    const isPremium = profile?.is_premium === true;

    if (!isPremium) {
      const { count } = await supabase
        .from("saved_charts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      if ((count ?? 0) >= FREE_TIER_LIMIT) {
        return NextResponse.json(
          { error: "FREE_LIMIT_REACHED", limit: FREE_TIER_LIMIT },
          { status: 403 }
        );
      }
    }

    // ── Upload to Storage ──
    const buffer = Buffer.from(await file.arrayBuffer());
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "lecture";
    const path = `${userId}/${Date.now()}-${slug}.pdf`;

    const { error: uploadErr } = await supabase.storage
      .from("pdfs")
      .upload(path, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadErr) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadErr.message}` },
        { status: 500 }
      );
    }

    // ── Insert saved_charts row ──
    const { data: row, error: insertErr } = await supabase
      .from("saved_charts")
      .insert({
        user_id: userId,
        label,
        form_data: formData,
        chart_data: chartData,
        pdf_url: path, // storage path, not public URL
      })
      .select("id, label, created_at, pdf_url")
      .single();

    if (insertErr) {
      // Attempt cleanup
      await supabase.storage.from("pdfs").remove([path]);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // ── Optional: send PDF link by email via Resend ──
    let emailStatus: "sent" | "skipped" | "failed" = "skipped";
    if (sendEmail && process.env.RESEND_API_KEY) {
      try {
        // Generate a signed URL valid for 7 days
        const { data: signed } = await supabase.storage
          .from("pdfs")
          .createSignedUrl(path, 60 * 60 * 24 * 7);

        if (signed?.signedUrl) {
          const { data: userInfo } = await supabase.auth.admin.getUserById(userId);
          const email = userInfo?.user?.email;
          const firstName = profile?.display_name || email?.split("@")[0] || "";

          if (email) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const from = process.env.RESEND_FROM || "Ciel Natal <onboarding@resend.dev>";
            await resend.emails.send({
              from,
              to: email,
              subject: `✦ Ta carte du ciel — ${label}`,
              html: emailTemplate({ firstName, label, pdfUrl: signed.signedUrl }),
            });
            emailStatus = "sent";

            await supabase
              .from("saved_charts")
              .update({ email_sent_at: new Date().toISOString() })
              .eq("id", row.id);
          }
        }
      } catch (err) {
        console.error("[pdf/save] email send failed:", err);
        emailStatus = "failed";
      }
    }

    return NextResponse.json(
      { chart: row, emailStatus, tierLimit: isPremium ? null : FREE_TIER_LIMIT },
      { status: 201 }
    );
  } catch (err) {
    console.error("[pdf/save] error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

function emailTemplate({
  firstName,
  label,
  pdfUrl,
}: {
  firstName: string;
  label: string;
  pdfUrl: string;
}) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#09090f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e5e5ec">
  <div style="max-width:560px;margin:0 auto;padding:48px 32px">
    <div style="text-align:center;margin-bottom:32px">
      <span style="font-size:32px;color:#b8a6ff">✦</span>
      <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:400;letter-spacing:3px;color:#e5e5ec;margin:12px 0 0;font-size:24px">CIEL NATAL</h1>
    </div>
    <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:400;color:#e5e5ec;font-size:22px;margin:0 0 8px">Bonjour ${firstName},</h2>
    <p style="color:#a8a8b3;font-size:15px;line-height:1.6;margin:0 0 24px">
      Voici ta carte du ciel : <strong style="color:#e5e5ec">${label}</strong>.
      Clique ci-dessous pour télécharger ton PDF.
    </p>
    <div style="text-align:center;margin:32px 0">
      <a href="${pdfUrl}" style="display:inline-block;padding:14px 28px;background:#b8a6ff;color:#09090f;text-decoration:none;border-radius:12px;font-weight:500;font-size:14px">
        Télécharger mon PDF
      </a>
    </div>
    <p style="color:#6b6b78;font-size:12px;line-height:1.6;margin:32px 0 0;text-align:center">
      Ce lien est valide 7 jours. Tu retrouveras toujours cette lecture dans
      <a href="https://ciel-natal.vercel.app/mon-compte/lectures" style="color:#b8a6ff">Mes lectures</a>
      sur ton compte.
    </p>
    <hr style="border:none;border-top:1px solid #2a2a35;margin:32px 0 16px" />
    <p style="color:#6b6b78;font-size:11px;line-height:1.5;text-align:center;margin:0">
      Ciel Natal — Astrologie psychologique inspirée de Jung<br />
      <a href="https://ciel-natal.vercel.app" style="color:#6b6b78">ciel-natal.vercel.app</a>
    </p>
  </div>
</body>
</html>`;
}
