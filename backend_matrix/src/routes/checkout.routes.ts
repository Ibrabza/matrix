import { Router } from "express";
import { createCheckoutSessionHandler } from "../controllers/checkoutController";
import { authMiddleware } from "../middlewares/authMiddleware";

export const checkoutRouter = Router();

checkoutRouter.post("/checkout/create-session", authMiddleware, createCheckoutSessionHandler);


