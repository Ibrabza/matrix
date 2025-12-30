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
  console.log('🔐 [Auth Middleware] Checking authentication', {
    url: req.url,
    method: req.method,
    headers: {
      authorization: req.headers["authorization"] ? '✅ Present' : '❌ Missing',
      authPreview: req.headers["authorization"]?.substring(0, 30) + '...'
    }
  });

  const header = req.headers["authorization"];
  if (!header || typeof header !== "string") {
    console.error('❌ [Auth Middleware] No authorization header found');
    return sendFailure(res, 401, "Unauthorized");
  }

  const [scheme, token] = header.split(" ");
  console.log('🔐 [Auth Middleware] Parsing token', {
    scheme,
    hasToken: !!token,
    tokenLength: token?.length || 0
  });

  if (scheme !== "Bearer" || !token) {
    console.error('❌ [Auth Middleware] Invalid authorization format', { scheme, hasToken: !!token });
    return sendFailure(res, 401, "Unauthorized");
  }

  const secret = process.env["JWT_SECRET"];
  if (!secret) {
    console.error('❌ [Auth Middleware] JWT_SECRET not configured');
    return sendFailure(res, 500, "Missing JWT_SECRET");
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    console.log('✅ [Auth Middleware] Token verified', {
      userId: payload.userId,
      email: payload.email,
      exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'no expiry'
    });

    if (!payload.userId) {
      console.error('❌ [Auth Middleware] Token missing userId');
      return sendFailure(res, 401, "Unauthorized");
    }

    req.user = payload.email
      ? { id: payload.userId, email: payload.email }
      : { id: payload.userId };
    
    console.log('✅ [Auth Middleware] Authentication successful', { userId: payload.userId });
    return next();
  } catch (error) {
    console.error('❌ [Auth Middleware] Token verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown'
    });
    return sendFailure(res, 401, "Unauthorized");
  }
}


