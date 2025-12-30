import { getStripe } from "./stripe/stripeClient";
import type Stripe from "stripe";

type CreateCheckoutSessionInput = {
  userId: string;
  course: {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl?: string | null;
  };
};

export async function createCheckoutSession({
  userId,
  course,
}: CreateCheckoutSessionInput) {
  const frontendUrl = process.env["FRONTEND_URL"];
  if (!frontendUrl) {
    const err = new Error("Missing FRONTEND_URL");
    (err as Error & { statusCode?: number }).statusCode = 500;
    throw err;
  }

  // Development mode: bypass Stripe if using placeholder key
  const stripeKey = process.env["STRIPE_SECRET_KEY"];
  const isDevelopmentMode = !stripeKey || stripeKey.includes("placeholder") || stripeKey.length < 20;
  
  if (isDevelopmentMode) {
    // Return a mock checkout session for development
    return {
      id: `cs_dev_${Date.now()}`,
      url: `${frontendUrl}/course/${course.id}?success=1&dev_mode=true`,
      payment_status: 'unpaid',
      mode: 'payment' as const,
      metadata: {
        courseId: course.id,
        userId,
      },
    };
  }

  const stripe = getStripe();

  const unitAmount = Math.round(course.price * 100);
  if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
    const err = new Error("Invalid course price");
    (err as Error & { statusCode?: number }).statusCode = 400;
    throw err;
  }

  const productData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData =
    {
      name: course.title,
      description: course.description,
      metadata: { courseId: course.id },
    };

  if (course.imageUrl) productData.images = [course.imageUrl];

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: unitAmount,
          product_data: {
            ...productData,
          },
        },
      },
    ],
    metadata: {
      courseId: course.id,
      userId,
    },
    success_url: `${frontendUrl}/courses/${course.id}?success=1`,
    cancel_url: `${frontendUrl}/courses/${course.id}?canceled=1`,
  });

  if (!session.url) {
    const err = new Error("Stripe session URL missing");
    (err as Error & { statusCode?: number }).statusCode = 500;
    throw err;
  }

  return session;
}


