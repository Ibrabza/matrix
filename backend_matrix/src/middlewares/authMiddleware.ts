import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sendFailure } from "../utils/response";

type JwtPayload = {
  userId: string;
  email?: string;
  iat?: number;
  exp?: number;
};

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers["authorization"];
  if (!header || typeof header !== "string") return sendFailure(res, 401, "Unauthorized");

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return sendFailure(res, 401, "Unauthorized");

  const secret = process.env["JWT_SECRET"];
  if (!secret) return sendFailure(res, 500, "Missing JWT_SECRET");

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    if (!payload.userId) return sendFailure(res, 401, "Unauthorized");

    req.user = payload.email
      ? { id: payload.userId, email: payload.email }
      : { id: payload.userId };
    return next();
  } catch {
    return sendFailure(res, 401, "Unauthorized");
  }
}


