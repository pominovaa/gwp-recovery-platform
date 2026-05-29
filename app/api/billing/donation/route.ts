import { NextRequest, NextResponse } from "next/server";
import { CHECKOUT_UNAVAILABLE_MESSAGE, getErrorMessage } from "@/lib/billing/errors";
import { getStripe } from "@/lib/billing/stripe";

export const runtime = "nodejs";

const MIN_DONATION_CENTS = 100;
const SUGGESTED_DONATION_CENTS = 10000;

function getOrigin(request: NextRequest) {
  return process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  try {
    const origin = getOrigin(request);
    const stripe = getStripe();
    const donationPrice = await stripe.prices.create({
      currency: "usd",
      custom_unit_amount: {
        enabled: true,
        minimum: MIN_DONATION_CENTS,
        preset: SUGGESTED_DONATION_CENTS,
      },
      product_data: {
        name: "Get Whole Project donation",
      },
    });

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: donationPrice.id,
          quantity: 1,
        },
      ],
      metadata: {
        checkout_kind: "donation",
      },
      mode: "payment",
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}&donation=1`,
      cancel_url: `${origin}/find-support`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Donation checkout failed", error);
    return NextResponse.json({ error: getErrorMessage(error, CHECKOUT_UNAVAILABLE_MESSAGE) }, { status: 503 });
  }
}
