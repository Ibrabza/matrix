import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { getCourseProgress, upsertLessonProgress } from "../controllers/progressController";

export const progressRouter = Router();

progressRouter.put(
  "/courses/:courseId/lessons/:lessonId/progress",
  authMiddleware,
  upsertLessonProgress
);

progressRouter.get("/courses/:courseId/progress", authMiddleware, getCourseProgress);


