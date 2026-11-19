import crypto from 'crypto';
import { parseCookie } from 'cookie';

export interface SessionPayload {
  userId: string;
  email: string;
  householdId: string;
  mode: 'family' | 'elder' | 'hostel';
  exp: number; // Unix timestamp in seconds
}

const DEFAULT_SECRET = 'homemate_session_secret_fallback_key_2026';
const SESSION_SECRET = process.env.SESSION_SECRET || DEFAULT_SECRET;
const SESSION_COOKIE_NAME = 'homemate_session';
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

export function createSessionToken(payload: Omit<SessionPayload, 'exp'>): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const fullPayload: SessionPayload = { ...payload, exp };
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(encodedPayload);
  const signature = hmac.digest('base64url');

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [encodedPayload, signature] = parts;
    const hmac = crypto.createHmac('sha256', SESSION_SECRET);
    hmac.update(encodedPayload);
    const expectedSignature = hmac.digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    
    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

export function buildSessionCookie(token: string): string {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const secureFlag = isProd ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=${token}; HttpOnly${secureFlag}; SameSite=Lax; Path=/; Max-Age=${SESSION_DURATION_SECONDS}`;
}

export function buildClearSessionCookie(): string {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const secureFlag = isProd ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=; HttpOnly${secureFlag}; SameSite=Lax; Path=/; Max-Age=0`;
}

export function getSessionFromCookieHeader(cookieHeader?: string): SessionPayload | null {
  if (!cookieHeader) return null;
  try {
    const parsed = parseCookie(cookieHeader);
    const token = parsed[SESSION_COOKIE_NAME];
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}
