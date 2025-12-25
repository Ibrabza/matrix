import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { getLessonById } from "../controllers/lessonController";

export const lessonRouter = Router();

lessonRouter.get("/lessons/:id", authMiddleware, getLessonById);


