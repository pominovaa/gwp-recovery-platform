import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/billing/stripe";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function upsertSubscription(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const userId = subscription.metadata.supabase_user_id;
  const planId = subscription.metadata.plan_id;
  const subscriptionWithPeriod = subscription as Stripe.Subscription & {
    current_period_end?: number;
    items?: {
      data?: Array<{
        current_period_end?: number;
      }>;
    };
  };
  const currentPeriodEnd =
    subscriptionWithPeriod.current_period_end || subscriptionWithPeriod.items?.data?.[0]?.current_period_end;

  if (!userId) return;

  await supabaseAdmin.from("subscriptions").upsert(
    {
      id: subscription.id,
      user_id: userId,
      stripe_customer_id: customerId,
      plan_id: planId,
      status: subscription.status,
      current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing Stripe webhook signature or secret." }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.supabase_user_id;
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

    if (userId && customerId) {
      await supabaseAdmin
        .from("profiles")
        .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
        .eq("id", userId);
    }
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    await upsertSubscription(event.data.object as Stripe.Subscription);
  }

  return NextResponse.json({ received: true });
}
