import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Node runtime required for the Stripe SDK + crypto used by signature verify.
export const runtime = "nodejs";
export const maxDuration = 30;

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-05-28.basil",
    // See checkout route for rationale — Vercel's outbound https module is
    // unreliable; the fetch HTTP client uses the platform's global fetch.
    httpClient: Stripe.createFetchHttpClient(),
    timeout: 20_000,
    maxNetworkRetries: 2,
  });
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  // Diagnostic log — surfaces ANY mismatch between the secret loaded by the
  // function and the one Stripe used to sign. Logged values are intentionally
  // truncated: never the full secret, just a fingerprint.
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  console.log("[stripe-webhook] hit", {
    bodyLen: body.length,
    hasSig: !!sig,
    sigPrefix: sig?.slice(0, 30),
    secretSet: !!secret,
    secretLen: secret?.length,
    secretFingerprint: secret ? `${secret.slice(0, 8)}…${secret.slice(-4)}` : null,
  });

  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    // Async variant uses Web Crypto under the hood, which avoids subtle Buffer
    // vs string encoding mismatches that can plague constructEvent on certain
    // Vercel function pools.
    const stripe = getStripe();
    event = await stripe.webhooks.constructEventAsync(body, sig, secret);
  } catch (err) {
    const e = err as { message?: string };
    console.error("[stripe-webhook] signature verification failed:", e?.message);
    return NextResponse.json(
      { error: "Invalid signature", detail: e?.message || "unknown" },
      { status: 400 }
    );
  }

  const supabaseAdmin = getSupabaseAdmin();

  // ── Premium activation: paid checkout completed ──
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const paymentIntent = session.payment_intent as string | null;

    if (userId && session.payment_status === "paid" && paymentIntent) {
      // Idempotence: if a profile already records this payment_intent,
      // skip the update. Prevents double-processing on Stripe replay.
      const { data: existing } = await supabaseAdmin
        .from("profiles")
        .select("id, stripe_payment_id")
        .eq("id", userId)
        .single();

      if (existing?.stripe_payment_id === paymentIntent) {
        return NextResponse.json({ received: true, idempotent: true });
      }

      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          is_premium: true,
          premium_at: new Date().toISOString(),
          stripe_payment_id: paymentIntent,
        })
        .eq("id", userId);

      if (error) {
        console.error("Failed to activate premium:", error);
        return NextResponse.json({ error: "DB update failed" }, { status: 500 });
      }

      // Premium confirmation email. Awaited (a fire-and-forget fetch can be
      // frozen with the lambda before it completes) but never blocks the 200:
      // Stripe must see success once the DB update above has gone through —
      // the stripe_payment_id idempotency guard would skip a replay anyway.
      try {
        const { data: userRes } = await supabaseAdmin.auth.admin.getUserById(userId);
        const user = userRes?.user;
        const email = session.customer_details?.email || user?.email;
        if (email && process.env.RESEND_API_KEY) {
          const displayName =
            user?.user_metadata?.display_name ||
            user?.user_metadata?.full_name ||
            email.split("@")[0];
          const origin = new URL(req.url).origin;
          const res = await fetch(`${origin}/api/email/premium`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-secret": (process.env.INTERNAL_API_SECRET || "").trim(),
            },
            body: JSON.stringify({ email, displayName, locale: "fr" }),
          });
          if (!res.ok) {
            console.error("[stripe-webhook] premium email failed:", res.status, await res.text());
          }
        }
      } catch (err) {
        console.error("[stripe-webhook] premium email error:", err);
      }
    }

    return NextResponse.json({ received: true });
  }

  // ── Premium revocation: payment was refunded ──
  // Triggered when a charge is fully or partially refunded via Stripe Dashboard
  // or API. We flip is_premium=false for the user whose stripe_payment_id
  // matches the refunded payment_intent.
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntent =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent?.id;

    if (!paymentIntent) {
      return NextResponse.json({ received: true, skipped: "no_payment_intent" });
    }

    const { data: profile, error: findErr } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("stripe_payment_id", paymentIntent)
      .maybeSingle();

    if (findErr) {
      console.error("Failed to look up profile by payment_intent:", findErr);
      return NextResponse.json({ error: "DB lookup failed" }, { status: 500 });
    }

    if (!profile) {
      // No matching profile — possibly already refunded and revoked, or
      // payment from a different system. Acknowledge without action.
      return NextResponse.json({ received: true, skipped: "no_match" });
    }

    const { error: updateErr } = await supabaseAdmin
      .from("profiles")
      .update({
        is_premium: false,
        // Keep premium_at as historical record; clear stripe_payment_id so
        // a future re-purchase by the same user re-activates cleanly.
        stripe_payment_id: null,
      })
      .eq("id", profile.id);

    if (updateErr) {
      console.error("Failed to revoke premium after refund:", updateErr);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true, revoked: true });
  }

  // Any other event type is acknowledged but ignored.
  return NextResponse.json({ received: true });
}
