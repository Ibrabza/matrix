import type { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { sendFailure, sendSuccess } from "../utils/response";

export async function listCourses(req: Request, res: Response) {
  const pageRaw = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;
  const limitRaw = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
  const searchRaw = Array.isArray(req.query.search) ? req.query.search[0] : req.query.search;
  const categoryIdRaw = Array.isArray(req.query.categoryId)
    ? req.query.categoryId[0]
    : req.query.categoryId;

  const page = Math.max(1, Number(pageRaw ?? 1) || 1);
  const limit = Math.min(100, Math.max(1, Number(limitRaw ?? 10) || 10));
  const skip = (page - 1) * limit;

  const search = typeof searchRaw === "string" ? searchRaw.trim() : "";
  const categoryId = typeof categoryIdRaw === "string" ? categoryIdRaw.trim() : "";

  const where = {
    ...(categoryId ? { categoryId } : {}),
    ...(search
      ? {
          title: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
      : {}),
  };

  const [total, courses] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        price: true,
        imageUrl: true,
        instructorName: true,
      },
    }),
  ]);

  const data = courses.map((c) => ({
    id: c.id,
    title: c.title,
    price: c.price,
    thumbnail: c.imageUrl,
    instructorName: c.instructorName,
  }));

  const last_page = Math.max(1, Math.ceil(total / limit));

  return sendSuccess(res, {
    data,
    meta: {
      total,
      page,
      last_page,
    },
  });
}

export async function getCourseById(req: Request, res: Response) {
  const courseId = req.params["id"];
  if (!courseId) return sendFailure(res, 400, "Course id is required");

  const userId = req.user?.id;

  console.log("📚 [Course Details] Fetching course", { courseId, userId: userId || "guest" });

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      instructorName: true,
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!course) {
    console.error("❌ [Course Details] Course not found", { courseId });
    return sendFailure(res, 404, "Course not found");
  }

  const hasPurchased = userId
    ? Boolean(
        await prisma.purchase.findUnique({
          where: { userId_courseId: { userId, courseId } },
          select: { id: true },
        })
      )
    : false;

  console.log("🔍 [Course Details] Purchase check", { 
    courseId, 
    userId: userId || "guest", 
    hasPurchased,
    lessonsCount: course.lessons.length 
  });

  const progressByLessonId =
    userId && hasPurchased && course.lessons.length
      ? new Map(
          (
            await prisma.userProgress.findMany({
              where: {
                userId,
                lessonId: { in: course.lessons.map((l) => l.id) },
              },
              select: { lessonId: true, completed: true },
            })
          ).map((p) => [p.lessonId, p.completed] as const)
        )
      : new Map<string, boolean>();

  const lessons = course.lessons.map((lesson) => {
    if (hasPurchased) {
      const isCompleted = Boolean(progressByLessonId.get(lesson.id));
      return {
        id: lesson.id,
        title: lesson.title,
        isCompleted,
        type: "video" as const,
      };
    }

    return {
      id: lesson.id,
      title: lesson.title,
      isLocked: true,
    };
  });

  console.log("✅ [Course Details] Returning course data", { 
    courseId, 
    title: course.title,
    hasPurchased,
    lessonsCount: lessons.length 
  });

  return sendSuccess(res, {
    id: course.id,
    title: course.title,
    description: course.description,
    price: course.price,
    instructor: { name: course.instructorName ?? null },
    hasPurchased,
    isEnrolled: hasPurchased, // Add isEnrolled for frontend compatibility
    lessons,
  });
}


