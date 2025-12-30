import type { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { sendFailure, sendSuccess } from "../utils/response";

export async function upsertLessonProgress(req: Request, res: Response) {
  console.log("✏️ [Progress Update] Request received", {
    url: req.url,
    courseId: req.params["courseId"],
    lessonId: req.params["lessonId"],
    body: req.body,
    hasUser: !!req.user,
    userId: req.user?.id
  });

  const userId = req.user?.id;
  if (!userId) {
    console.error("❌ [Progress Update] Unauthorized - req.user is missing");
    return sendFailure(res, 401, "Unauthorized");
  }

  const courseId = req.params["courseId"];
  const lessonId = req.params["lessonId"];
  if (!courseId || !lessonId) {
    console.error("❌ [Progress Update] Missing route params", { courseId, lessonId });
    return sendFailure(res, 400, "Invalid route params");
  }

  const { isCompleted } = (req.body ?? {}) as { isCompleted?: boolean };
  if (typeof isCompleted !== "boolean") {
    console.error("❌ [Progress Update] Invalid isCompleted value", { 
      isCompleted, 
      type: typeof isCompleted 
    });
    return sendFailure(res, 400, "isCompleted must be a boolean");
  }

  console.log("✏️ [Progress Update] Validating purchase and lesson", {
    userId,
    courseId,
    lessonId,
    isCompleted
  });

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

  if (!lesson) {
    console.error("❌ [Progress Update] Lesson not found", { lessonId, courseId });
    return sendFailure(res, 404, "Lesson not found");
  }
  
  if (!purchase) {
    console.error("❌ [Progress Update] User has not purchased this course", { 
      userId, 
      courseId 
    });
    return sendFailure(res, 403, "Forbidden: You must purchase this course to update progress");
  }

  console.log("✅ [Progress Update] Validation passed, updating progress...");

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

  console.log("✅ [Progress Update] Progress updated successfully", {
    lessonId,
    completed: progress.completed,
    completedAt: progress.completedAt
  });

  return sendSuccess(res, progress);
}

export async function getCourseProgress(req: Request, res: Response) {
  console.log("📊 [Progress] Request received", {
    url: req.url,
    courseId: req.params["courseId"],
    hasUser: !!req.user,
    userId: req.user?.id,
    headers: {
      authorization: req.headers["authorization"] ? '✅ Present' : '❌ Missing'
    }
  });

  const userId = req.user?.id;
  if (!userId) {
    console.error("❌ [Progress] Unauthorized - req.user is missing");
    return sendFailure(res, 401, "Unauthorized");
  }

  const courseId = req.params["courseId"];
  if (!courseId) {
    console.error("❌ [Progress] Missing courseId in route params");
    return sendFailure(res, 400, "Invalid route params");
  }

  console.log("📊 [Progress] Checking purchase with compound key", { 
    userId, 
    courseId,
    userIdType: typeof userId,
    courseIdType: typeof courseId,
    userIdLength: userId?.length,
    courseIdLength: courseId?.length
  });

  // Execute the purchase check query
  const purchase = await prisma.purchase.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { 
      id: true, 
      userId: true, 
      courseId: true, 
      createdAt: true,
      stripeSessionId: true 
    },
  });

  console.log("🔍 [Progress] Purchase query result:", {
    found: !!purchase,
    purchase: purchase || null
  });

  if (!purchase) {
    // DEBUG: Let's see what purchases this user DOES have
    const userPurchases = await prisma.purchase.findMany({
      where: { userId },
      select: { 
        id: true, 
        courseId: true, 
        createdAt: true 
      },
      take: 10
    });

    console.error("❌ [Progress] Purchase NOT FOUND", {
      searchedFor: {
        userId,
        courseId,
      },
      userHasPurchases: userPurchases.length > 0,
      userPurchaseCount: userPurchases.length,
      userPurchasedCourses: userPurchases.map(p => ({
        courseId: p.courseId,
        purchasedAt: p.createdAt
      }))
    });

    // DEBUG: Check if the course even exists
    const courseExists = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true }
    });

    console.error("❌ [Progress] Course existence check:", {
      courseId,
      exists: !!courseExists,
      course: courseExists || null
    });

    // DEBUG: Check for similar courseIds (maybe a typo/formatting issue)
    if (userPurchases.length > 0) {
      console.error("❌ [Progress] COMPARISON CHECK:");
      userPurchases.forEach(p => {
        console.error({
          purchasedCourseId: p.courseId,
          requestedCourseId: courseId,
          match: p.courseId === courseId,
          purchasedLength: p.courseId.length,
          requestedLength: courseId.length
        });
      });
    }

    return sendFailure(
      res, 
      403, 
      `Forbidden: You must purchase this course to view progress. Found ${userPurchases.length} purchase(s) for this user, but not for this course.`
    );
  }

  console.log("✅ [Progress] Purchase verified", { 
    purchaseId: purchase.id,
    userId: purchase.userId,
    courseId: purchase.courseId,
    purchasedAt: purchase.createdAt
  });

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

  console.log("✅ [Progress] Progress calculated", {
    totalLessons,
    completedLessons,
    progress: `${progress}%`
  });

  return sendSuccess(res, { progress });
}


