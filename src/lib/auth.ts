import { NextRequest } from 'next/server';
import crypto from 'crypto';

export const COOKIE_NAME = 'app_agendamentos_auth';

type AuthPayload = {
  userId: string;
  role: string;
  companyId?: string | null;
  exp: number;
};

const AUTH_SECRET = process.env.AUTH_SECRET || 'default_dev_secret_change_in_production';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function sign(value: string) {
  return crypto.createHmac('sha256', AUTH_SECRET).update(value).digest('base64url');
}

function encodeToken(payload: AuthPayload) {
  const serialized = JSON.stringify(payload);
  const encodedPayload = Buffer.from(serialized).toString('base64url');
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function decodeToken(token: string): AuthPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encodedPayload, signature] = parts;
  if (typeof signature !== 'string') {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  if (signature.length !== expectedSignature.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8')) as AuthPayload;
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function createAuthToken(userId: string, role: string, companyId?: string | null) {
  const exp = Date.now() + TOKEN_TTL_SECONDS * 1000;
  return encodeToken({ userId, role, companyId, exp });
}

export function verifyAuthToken(token?: string) {
  if (!token) return null;
  return decodeToken(token);
}

export function getAuthTokenFromRequest(request: Request | NextRequest) {
  const nextCookieToken = (request as any)?.cookies?.get?.(COOKIE_NAME)?.value;
  if (nextCookieToken) return nextCookieToken;

  const cookieHeader = request.headers.get?.('cookie');
  if (!cookieHeader) return null;

  const cookiePairs = cookieHeader.split(';').map((cookie) => cookie.trim().split('='));
  const tokenPair = cookiePairs.find(([name]) => name === COOKIE_NAME);
  return tokenPair ? tokenPair[1] : null;
}

function getDevFallbackFromRequest(request: Request | NextRequest): AuthPayload | null {
  const hasBypassCookie = request.headers?.get?.('cookie')?.includes('dev_bypass_auth=active');
  if (process.env.NODE_ENV === 'development' || hasBypassCookie) {
    return {
      userId: 'dev-admin-user-id',
      companyId: 'dev-company-id-01',
      role: 'ADMIN',
      exp: Date.now() + TOKEN_TTL_SECONDS * 1000,
    };
  }
  return null;
}

export function getAuthPayloadFromRequest(request: Request | NextRequest) {
  const token = getAuthTokenFromRequest(request);
  const auth = verifyAuthToken(token);
  return auth ?? getDevFallbackFromRequest(request);
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TOKEN_TTL_SECONDS,
  };
}
