import type { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { sendFailure, sendSuccess } from "../utils/response";

export async function upsertLessonProgress(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return sendFailure(res, 401, "Unauthorized");

  const courseId = req.params["courseId"];
  const lessonId = req.params["lessonId"];
  if (!courseId || !lessonId) return sendFailure(res, 400, "Invalid route params");

  const { isCompleted } = (req.body ?? {}) as { isCompleted?: boolean };
  if (typeof isCompleted !== "boolean") {
    return sendFailure(res, 400, "isCompleted must be a boolean");
  }

  const [purchase, lesson] = await Promise.all([
    prisma.purchase.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    }),
    prisma.lesson.findFirst({
      where: { id: lessonId, courseId },
      select: { id: true },
    }),
  ]);

  if (!lesson) return sendFailure(res, 404, "Lesson not found");
  if (!purchase) return sendFailure(res, 403, "Forbidden");

  const progress = await prisma.userProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: {
      userId,
      lessonId,
      completed: isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
    update: {
      completed: isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
    select: { completed: true, completedAt: true },
  });

  return sendSuccess(res, progress);
}

export async function getCourseProgress(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return sendFailure(res, 401, "Unauthorized");

  const courseId = req.params["courseId"];
  if (!courseId) return sendFailure(res, 400, "Invalid route params");

  const purchase = await prisma.purchase.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true },
  });

  if (!purchase) return sendFailure(res, 403, "Forbidden");

  const [totalLessons, completedLessons] = await Promise.all([
    prisma.lesson.count({ where: { courseId } }),
    prisma.userProgress.count({
      where: {
        userId,
        completed: true,
        lesson: { courseId },
      },
    }),
  ]);

  const progress =
    totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  return sendSuccess(res, { progress });
}


