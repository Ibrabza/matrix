import type { Request, Response } from "express";
import type Stripe from "stripe";
import { sendFailure, sendSuccess } from "../utils/response";
import { constructStripeEvent } from "../services/stripe/stripeWebhook.service";
import { prisma } from "../db/prisma";

export function handleStripeWebhook(req: Request, res: Response) {
  // IMPORTANT: this route must be mounted with express.raw({ type: "application/json" })
  // so req.body is a Buffer.
  let event: Stripe.Event;
  try {
    event = constructStripeEvent(
      req.body as Buffer,
      req.headers["stripe-signature"]
    );
  } catch (e) {
    const statusCode = (e as Error & { statusCode?: number }).statusCode ?? 400;
    const message = (e as Error).message ?? "Invalid webhook signature";
    return sendFailure(res, statusCode, message);
  }

  if (event.type !== "checkout.session.completed") {
    // Acknowledge all other events for now.
    return sendSuccess(res, { received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.["userId"];
  const courseId = session.metadata?.["courseId"];
  const stripeSessionId = session.id;

  if (!userId || !courseId) {
    // Acknowledge (200) so Stripe doesn't retry forever; log/alert in real app.
    return sendSuccess(res, { received: true, ignored: true });
  }

  // Idempotent write: Stripe may retry the same event.
  prisma.purchase
    .upsert({
      where: { stripeSessionId },
      create: { stripeSessionId, userId, courseId },
      update: {},
      select: { id: true },
    })
    .then(() => undefined)
    .catch(() => undefined);

  return sendSuccess(res, { received: true });
}


