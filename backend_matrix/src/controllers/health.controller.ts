import type { Request, Response } from "express";
import { sendSuccess } from "../utils/response";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getHealth(_req: Request, res: Response) {
  try {
    // Check database connectivity and get basic stats
    const [userCount, courseCount, purchaseCount] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.purchase.count(),
    ]);

    const isSeeded = userCount > 0 && courseCount > 0;

    return sendSuccess(res, {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        connected: true,
        seeded: isSeeded,
        stats: {
          users: userCount,
          courses: courseCount,
          purchases: purchaseCount,
        },
      },
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    return sendSuccess(res, {
      status: "error",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        connected: false,
        error: "Database connection failed",
      },
      environment: process.env.NODE_ENV || "development",
    });
  }
}


