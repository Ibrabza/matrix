import { Router } from "express";
import { getCourseById, listCourses } from "../controllers/courseController";
import { optionalAuthMiddleware } from "../middlewares/optionalAuth.middleware";

export const courseRouter = Router();

courseRouter.get("/courses", listCourses);
courseRouter.get("/courses/:id", optionalAuthMiddleware, getCourseById);


