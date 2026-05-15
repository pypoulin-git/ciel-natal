import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-05-28.basil",
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

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
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
