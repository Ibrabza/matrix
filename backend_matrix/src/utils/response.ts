import type { Response } from "express";

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
) {
  const payload: ApiResponse<T> = message
    ? { success: true, data, message }
    : { success: true, data };
  return res.status(statusCode).json(payload);
}

export function sendFailure(
  res: Response,
  statusCode: number,
  message: string,
  data: unknown = null
) {
  const payload: ApiResponse<unknown> = { success: false, data, message };
  return res.status(statusCode).json(payload);
}


