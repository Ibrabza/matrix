import type { Request, Response } from "express";
import { sendFailure } from "../utils/response";

export function notFoundHandler(_req: Request, res: Response) {
  return sendFailure(res, 404, "Route not found");
}


