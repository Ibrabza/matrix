import type { Request, Response } from "express";
import { sendFailure, sendSuccess } from "../utils/response";
import { prisma } from "../db/prisma";
import { createCheckoutSession } from "../services/stripeService";

export async function createCheckoutSessionHandler(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return sendFailure(res, 401, "Unauthorized");

  const { courseId } = (req.body ?? {}) as { courseId?: string };
  if (!courseId) return sendFailure(res, 400, "courseId is required");

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, description: true, price: true, imageUrl: true },
  });

  if (!course) return sendFailure(res, 404, "Course not found");

  const session = await createCheckoutSession({ userId, course });
  return sendSuccess(res, { url: session.url }, undefined, 201);
}


