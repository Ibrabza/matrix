import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { avatarUpload, multerErrorHandler } from "../middlewares/avatarUpload.middleware";
import { changePassword, getMe, updateMe, updateMyAvatar } from "../controllers/userController";

export const userRouter = Router();

userRouter.get("/users/me", authMiddleware, getMe);
userRouter.patch("/users/me", authMiddleware, updateMe);

userRouter.patch(
  "/users/me/avatar",
  authMiddleware,
  avatarUpload.single("avatar"),
  multerErrorHandler,
  updateMyAvatar
);

userRouter.post("/users/me/change-password", authMiddleware, changePassword);


