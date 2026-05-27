import { NextRequest, NextResponse } from "next/server";
import { getBillingPlan, getPlanPriceId, type BillingPlanId } from "@/lib/billing/plans";
import { getStripe } from "@/lib/billing/stripe";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

function getOrigin(request: NextRequest) {
  return process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
}

async function getUserFromRequest(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.replace("Bearer ", "");

  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;

  return data.user;
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Please sign up or log in first." }, { status: 401 });
  }

  const { planId } = await request.json();
  const plan = getBillingPlan(planId);

  if (!plan) {
    return NextResponse.json({ error: "Unknown billing plan." }, { status: 400 });
  }

  const priceId = getPlanPriceId(planId as BillingPlanId);

  if (!priceId) {
    return NextResponse.json({ error: `Missing ${plan.envKey} in environment variables.` }, { status: 500 });
  }

  const stripe = getStripe();
  let checkoutPriceId = priceId;

  if (priceId.startsWith("prod_")) {
    const product = await stripe.products.retrieve(priceId);
    const defaultPrice = product.default_price;

    if (!defaultPrice) {
      return NextResponse.json(
        { error: "This Stripe product does not have a default price. Add a recurring price in Stripe or use a price_ ID." },
        { status: 500 }
      );
    }

    checkoutPriceId = typeof defaultPrice === "string" ? defaultPrice : defaultPrice.id;
  }

  if (!checkoutPriceId.startsWith("price_")) {
    return NextResponse.json(
      { error: "Stripe plan IDs must be price_ IDs, or prod_ IDs with a default price." },
      { status: 500 }
    );
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        supabase_user_id: user.id,
      },
    });

    customerId = customer.id;

    await supabaseAdmin
      .from("profiles")
      .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
      .eq("id", user.id);
  }

  const origin = getOrigin(request);
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: checkoutPriceId, quantity: 1 }],
    metadata: {
      plan_id: planId,
      supabase_user_id: user.id,
    },
    mode: "subscription",
    subscription_data: {
      metadata: {
        plan_id: planId,
        supabase_user_id: user.id,
      },
    },
    success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/find-support`,
  });

  return NextResponse.json({ url: session.url });
}
