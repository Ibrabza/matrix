import type { Request, Response } from "express";
import { sendSuccess } from "../utils/response";

export function getHealth(_req: Request, res: Response) {
  return sendSuccess(res, {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
}


