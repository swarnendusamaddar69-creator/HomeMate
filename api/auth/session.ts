import crypto from 'crypto';
import { parseCookie } from 'cookie';

const DEFAULT_SECRET = 'homemate_session_secret_fallback_key_2026';
const SESSION_SECRET = process.env.SESSION_SECRET || DEFAULT_SECRET;
const SESSION_COOKIE_NAME = 'homemate_session';

function verifySessionToken(token: string) {
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

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export default async function handler(req: any, res: any) {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const secureFlag = isProd ? '; Secure' : '';

  if (req.method === 'POST') {
    // Logout: Clear cookie
    const clearHeader = `${SESSION_COOKIE_NAME}=; HttpOnly${secureFlag}; SameSite=Lax; Path=/; Max-Age=0`;
    res.setHeader('Set-Cookie', clearHeader);
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  }

  if (req.method === 'GET') {
    const cookies = parseCookie(req.headers.cookie || '');
    const token = cookies[SESSION_COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ authenticated: false });
    }

    const session = verifySessionToken(token);
    if (!session) {
      return res.status(401).json({ authenticated: false });
    }

    return res.status(200).json({
      authenticated: true,
      user: {
        id: session.userId,
        email: session.email,
        householdId: session.householdId,
        mode: session.mode,
      },
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
