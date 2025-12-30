import type { Request, Response } from "express";
import { sendFailure, sendSuccess } from "../utils/response";
import { prisma } from "../db/prisma";

/**
 * Direct Purchase Endpoint (Mock/Testing)
 * POST /api/courses/:courseId/purchase
 * 
 * This endpoint allows direct course purchase without Stripe integration.
 * Useful for development/testing or when implementing a custom payment flow.
 * 
 * In production, you would:
 * 1. Verify payment through your payment provider
 * 2. Then call this logic to grant access
 */
export async function purchaseCourse(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return sendFailure(res, 401, "Unauthorized");

  const courseId = req.params["courseId"];
  if (!courseId) return sendFailure(res, 400, "Course ID is required");

  console.log("🛒 [Purchase] User attempting to purchase", { userId, courseId });

  // 1. Check if course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, price: true },
  });

  if (!course) {
    console.error("❌ [Purchase] Course not found", { courseId });
    return sendFailure(res, 404, "Course not found");
  }

  console.log("✅ [Purchase] Course found", { courseId, title: course.title, price: course.price });

  // 2. Check if user already purchased
  const existingPurchase = await prisma.purchase.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    select: { id: true, createdAt: true },
  });

  if (existingPurchase) {
    console.log("⚠️ [Purchase] User already owns this course", { userId, courseId, purchaseId: existingPurchase.id });
    return sendSuccess(res, {
      message: "You already own this course",
      purchase: {
        id: existingPurchase.id,
        courseId,
        courseName: course.title,
        purchasedAt: existingPurchase.createdAt,
        alreadyOwned: true,
      },
    });
  }

  // 3. Create purchase record
  // Note: In production, this would only happen AFTER successful payment
  try {
    const purchase = await prisma.purchase.create({
      data: {
        userId,
        courseId,
        stripeSessionId: `mock_${userId}_${courseId}_${Date.now()}`, // Mock session ID for development
      },
      select: {
        id: true,
        createdAt: true,
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    console.log("🎉 [Purchase] Purchase created successfully!", {
      purchaseId: purchase.id,
      userId,
      courseId,
      courseName: purchase.course.title,
    });

    return sendSuccess(
      res,
      {
        message: "Course purchased successfully!",
        purchase: {
          id: purchase.id,
          courseId: purchase.course.id,
          courseName: purchase.course.title,
          courseDescription: purchase.course.description,
          purchasedAt: purchase.createdAt,
          alreadyOwned: false,
        },
      },
      "Purchase successful",
      201
    );
  } catch (error) {
    console.error("❌ [Purchase] Failed to create purchase", { error, userId, courseId });
    
    // Check if it's a unique constraint error (race condition)
    if ((error as { code?: string }).code === "P2002") {
      return sendFailure(res, 409, "Purchase already exists");
    }

    return sendFailure(res, 500, "Failed to process purchase");
  }
}

/**
 * Check if user has purchased a course
 * GET /api/courses/:courseId/has-purchased
 */
export async function checkCoursePurchase(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return sendFailure(res, 401, "Unauthorized");

  const courseId = req.params["courseId"];
  if (!courseId) return sendFailure(res, 400, "Course ID is required");

  const purchase = await prisma.purchase.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  return sendSuccess(res, {
    hasPurchased: !!purchase,
    purchaseDate: purchase?.createdAt || null,
  });
}

/**
 * Get user's purchased courses
 * GET /api/users/me/purchases
 */
export async function getUserPurchases(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return sendFailure(res, 401, "Unauthorized");

  const purchases = await prisma.purchase.findMany({
    where: { userId },
    select: {
      id: true,
      createdAt: true,
      course: {
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          imageUrl: true,
          instructorName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return sendSuccess(res, {
    purchases: purchases.map((p) => ({
      purchaseId: p.id,
      purchasedAt: p.createdAt,
      course: p.course,
    })),
    total: purchases.length,
  });
}

