import { Router } from "express";
import {
  purchaseCourse,
  checkCoursePurchase,
  getUserPurchases,
} from "../controllers/purchaseController";
import { authMiddleware } from "../middlewares/authMiddleware";

export const purchaseRouter = Router();

// Direct purchase endpoint (mock/testing - bypasses Stripe)
purchaseRouter.post("/courses/:courseId/purchase", authMiddleware, purchaseCourse);

// Check if user has purchased a course
purchaseRouter.get("/courses/:courseId/has-purchased", authMiddleware, checkCoursePurchase);

// Get user's purchases
purchaseRouter.get("/users/me/purchases", authMiddleware, getUserPurchases);

