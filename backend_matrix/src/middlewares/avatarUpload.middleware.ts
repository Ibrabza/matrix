import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { sendFailure } from "../utils/response";

const uploadsDir = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const safeExt = ext === ".png" ? ".png" : ".jpg";
    cb(null, `avatar_${Date.now()}_${Math.random().toString(16).slice(2)}${safeExt}`);
  },
});

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const ok = file.mimetype === "image/jpeg" || file.mimetype === "image/png";
  if (!ok) return cb(new Error("Only jpeg/png images are allowed"));
  return cb(null, true);
}

export const avatarUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
});

export function multerErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (!err) return next();
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Max file size is 2MB" : err.message;
    return sendFailure(res, 400, message);
  }
  if (err instanceof Error) return sendFailure(res, 400, err.message);
  return sendFailure(res, 400, "Upload failed");
}


