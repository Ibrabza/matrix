import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../db/prisma";
import { sendFailure, sendSuccess } from "../utils/response";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function updateMe(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return sendFailure(res, 401, "Unauthorized");

  const { email, name } = (req.body ?? {}) as { email?: string; name?: string };
  if (email === undefined && name === undefined) {
    return sendFailure(res, 400, "Nothing to update");
  }

  const data: { email?: string; name?: string | null } = {};

  if (email !== undefined) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) return sendFailure(res, 400, "Invalid email");

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existing && existing.id !== userId) {
      return sendFailure(res, 400, "Email already in use");
    }
    data.email = normalizedEmail;
  }

  if (name !== undefined) data.name = name.trim() || null;

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, name: true, avatarUrl: true },
  });

  return sendSuccess(res, user, "Profile updated");
}

export async function updateMyAvatar(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return sendFailure(res, 401, "Unauthorized");

  const file = req.file;
  if (!file) return sendFailure(res, 400, "avatar file is required");

  const avatarUrl = `/uploads/${file.filename}`;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: { id: true, email: true, name: true, avatarUrl: true },
  });

  return sendSuccess(res, user, "Avatar updated");
}

export async function changePassword(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return sendFailure(res, 401, "Unauthorized");

  const { oldPassword, newPassword } = (req.body ?? {}) as {
    oldPassword?: string;
    newPassword?: string;
  };

  if (!oldPassword || !newPassword) {
    return sendFailure(res, 400, "oldPassword and newPassword are required");
  }
  if (newPassword.length < 8) {
    return sendFailure(res, 400, "newPassword must be at least 8 characters");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true },
  });
  if (!user) return sendFailure(res, 404, "User not found");

  const ok = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!ok) return sendFailure(res, 400, "oldPassword is incorrect");

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  // Optional: token revocation not implemented (would require a token blacklist or rotating token version)
  return sendSuccess(res, { changed: true }, "Password updated");
}


