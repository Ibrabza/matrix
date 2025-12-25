import type { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { sendFailure, sendSuccess } from "../utils/response";

export async function getLessonById(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return sendFailure(res, 401, "Unauthorized");

  const lessonId = req.params["id"];
  if (!lessonId) return sendFailure(res, 400, "Lesson id is required");

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      videoUrl: true,
      content: true,
      order: true,
      courseId: true,
      course: {
        select: { id: true },
      },
    },
  });

  if (!lesson) return sendFailure(res, 404, "Lesson not found");

  const purchase = await prisma.purchase.findUnique({
    where: { userId_courseId: { userId, courseId: lesson.courseId } },
    select: { id: true },
  });

  if (!purchase) return sendFailure(res, 403, "Forbidden");

  const [progress, nextLesson] = await Promise.all([
    prisma.userProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
      select: { completed: true, completedAt: true },
    }),
    prisma.lesson.findFirst({
      where: { courseId: lesson.courseId, order: { gt: lesson.order } },
      orderBy: { order: "asc" },
      select: { id: true },
    }),
  ]);

  return sendSuccess(res, {
    id: lesson.id,
    title: lesson.title,
    videoUrl: lesson.videoUrl,
    description: lesson.content ?? null,
    courseId: lesson.courseId,
    nextLessonId: nextLesson?.id ?? null,
    progress: {
      isCompleted: progress?.completed ?? false,
      completedAt: progress?.completedAt ?? null,
    },
  });
}


