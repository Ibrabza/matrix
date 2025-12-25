import type { NextFunction, Request, Response } from "express";
import { sendFailure } from "../utils/response";

type HttpErrorLike = Error & {
  statusCode?: number;
  status?: number;
};

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const e = err as HttpErrorLike;
  const statusCode = e.statusCode ?? e.status ?? 500;
  // Log full error for local debugging.
  console.error(e);

  const isProd = process.env["NODE_ENV"] === "production";
  const rawMessage = (e as Error).message ?? "Request failed";
  const sanitizedMessage = rawMessage
    // strip ANSI
    .replace(/\u001b\[[0-9;]*m/g, "")
    // drop other control chars (keep tab/newline/carriage return)
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");

  const maybeCode = (e as unknown as { code?: string }).code;
  const devHint =
    !isProd && maybeCode === "ECONNREFUSED"
      ? "Database connection refused. Is Postgres running and is DATABASE_URL correct?"
      : undefined;
  const message =
    statusCode >= 500
      ? isProd
        ? "Internal server error"
        : devHint ?? sanitizedMessage
      : sanitizedMessage;

  return sendFailure(res, statusCode, message);
}


