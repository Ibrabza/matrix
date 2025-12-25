import type Stripe from "stripe";
import { getStripe } from "./stripeClient";

export function constructStripeEvent(rawBody: Buffer, signatureHeader: unknown) {
  const stripe = getStripe();
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!webhookSecret) {
    const err = new Error("Missing STRIPE_WEBHOOK_SECRET");
    (err as Error & { statusCode?: number }).statusCode = 500;
    throw err;
  }

  const signature =
    typeof signatureHeader === "string" ? signatureHeader : undefined;
  if (!signature) {
    const err = new Error("Missing Stripe-Signature header");
    (err as Error & { statusCode?: number }).statusCode = 400;
    throw err;
  }

  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    webhookSecret
  ) as Stripe.Event;
}


