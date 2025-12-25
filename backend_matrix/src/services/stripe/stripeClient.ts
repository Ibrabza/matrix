import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe() {
  if (_stripe) return _stripe;

  const stripeSecretKey = process.env["STRIPE_SECRET_KEY"];
  if (!stripeSecretKey) {
    const err = new Error("Missing STRIPE_SECRET_KEY");
    (err as Error & { statusCode?: number }).statusCode = 500;
    throw err;
  }

  _stripe = new Stripe(stripeSecretKey, {
    // Let the installed Stripe SDK choose its pinned API version type.
  });

  return _stripe;
}


