import type { Request, Response } from "express";
import { sendFailure, sendSuccess } from "../utils/response";
import { prisma } from "../db/prisma";
import { createCheckoutSession } from "../services/stripeService";

export async function createCheckoutSessionHandler(req: Request, res: Response) {
  console.log("🛒 [Checkout Handler] Request received", {
    hasUser: !!req.user,
    userId: req.user?.id,
    body: req.body,
    headers: {
      authorization: req.headers["authorization"] ? '✅ Present' : '❌ Missing'
    }
  });

  const userId = req.user?.id;
  if (!userId) {
    console.error("❌ [Checkout] Unauthorized access attempt - req.user is missing", {
      user: req.user,
      hasUser: !!req.user
    });
    return sendFailure(res, 401, "Unauthorized");
  }

  const { courseId } = (req.body ?? {}) as { courseId?: string };
  if (!courseId) {
    console.error("❌ [Checkout] Missing courseId in request body", { body: req.body });
    return sendFailure(res, 400, "courseId is required");
  }

  console.log("🛒 [Checkout] Creating checkout session", { userId, courseId });

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, description: true, price: true, imageUrl: true },
  });

  if (!course) {
    console.error("❌ [Checkout] Course not found", { courseId });
    return sendFailure(res, 404, "Course not found");
  }

  console.log("✅ [Checkout] Course found", { courseId, title: course.title, price: course.price });

  try {
    const session = await createCheckoutSession({ userId, course });
    
    console.log("✅ [Checkout] Stripe session created", { 
      sessionId: session.id, 
      url: session.url 
    });

    return sendSuccess(res, { url: session.url, sessionId: session.id }, "Checkout session created", 201);
  } catch (error) {
    console.error("❌ [Checkout] Failed to create Stripe session:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Failed to create checkout session";
    
    // Check for common Stripe configuration errors
    if (errorMessage.includes("API key") || errorMessage.includes("STRIPE")) {
      return sendFailure(
        res, 
        500, 
        "Stripe payment system is not configured. Please contact support or use the mock purchase option in development."
      );
    }

    return sendFailure(res, 500, errorMessage);
  }
}


