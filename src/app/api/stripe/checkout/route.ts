import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Force Node.js runtime — the Stripe SDK relies on the Node `https` module
// and Edge runtime emits StripeConnectionError on outbound requests.
export const runtime = "nodejs";
// Bump the function budget: Stripe's default is to retry network errors
// twice with backoff; we want enough headroom for that without timing out
// the function itself (Vercel free tier defaults to 10s).
export const maxDuration = 30;

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-05-28.basil",
    // 20s per attempt (Stripe SDK default is 80s but Vercel function would
    // already have died); 2 retries on transient network errors.
    timeout: 20_000,
    maxNetworkRetries: 2,
  });
}

// Verify the caller's Bearer token and return the authenticated userId.
// Refuses anonymous calls — checkout sessions MUST be tied to a real account
// so the webhook can flip the right `is_premium` flag.
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

export async function POST(req: NextRequest) {
  try {
    // ── Auth FIRST: trust only the userId from the verified Bearer token ──
    // (Body-supplied userId is ignored — it was a IDOR vector that let any
    //  caller open a checkout session "as" another account.)
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const origin = req.headers.get("origin") || "https://ciel-natal.vercel.app";

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: "Ciel Natal Premium",
              description: "Accès à vie — Interprétations complètes, Chat IA, PDF, Audio, Synastrie et plus",
            },
            unit_amount: 999, // 9.99 CAD in cents
          },
          quantity: 1,
        },
      ],
      metadata: { userId },
      success_url: `${origin}/premium/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/premium`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Surface the actual Stripe error type/message to the browser console so
    // we can diagnose "Payment initialization failed" without server access.
    // (The Stripe error never contains the secret key or PII — it's safe.)
    const e = err as { message?: string; type?: string; code?: string; statusCode?: number };
    console.error("Stripe checkout error:", {
      message: e?.message,
      type: e?.type,
      code: e?.code,
      statusCode: e?.statusCode,
    });
    return NextResponse.json(
      {
        error: "Payment initialization failed",
        detail: e?.message || "unknown",
        code: e?.code || e?.type || null,
      },
      { status: 500 }
    );
  }
}
