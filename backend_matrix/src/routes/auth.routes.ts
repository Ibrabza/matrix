import { Router } from "express";
import { login, register } from "../controllers/authController";

export const authRouter = Router();

authRouter.post("/auth/register", register);
authRouter.post("/auth/login", login);


