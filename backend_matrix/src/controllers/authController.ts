import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma";
import { sendFailure, sendSuccess } from "../utils/response";

function getJwtSecret() {
  const secret = process.env["JWT_SECRET"];
  if (!secret) {
    const err = new Error("Missing JWT_SECRET");
    (err as Error & { statusCode?: number }).statusCode = 500;
    throw err;
  }
  return secret;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function register(req: Request, res: Response) {
  const { email, password, name } = (req.body ?? {}) as {
    email?: string;
    password?: string;
    name?: string;
  };

  if (!email || !password) return sendFailure(res, 400, "email and password are required");

  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) return sendFailure(res, 400, "Invalid email");
  if (password.length < 8) return sendFailure(res, 400, "Password must be at least 8 characters");

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existing) return sendFailure(res, 400, "Email already in use");

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email: normalizedEmail, passwordHash, name: name?.trim() || null },
    select: { id: true, email: true, name: true },
  });

  const token = jwt.sign({ userId: user.id, email: user.email }, getJwtSecret(), {
    expiresIn: "7d",
  });

  return sendSuccess(res, { token, user }, "Registered", 201);
}

export async function login(req: Request, res: Response) {
  const { email, password } = (req.body ?? {}) as { email?: string; password?: string };
  if (!email || !password) return sendFailure(res, 400, "email and password are required");

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, name: true, passwordHash: true },
  });

  if (!user) return sendFailure(res, 401, "Invalid credentials");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return sendFailure(res, 401, "Invalid credentials");

  const token = jwt.sign({ userId: user.id, email: user.email }, getJwtSecret(), {
    expiresIn: "7d",
  });

  return sendSuccess(res, { token, user: { id: user.id, email: user.email, name: user.name } }, "Logged in");
}


