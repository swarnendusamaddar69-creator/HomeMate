import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const VerifyOtpSchema = z.object({
  email: z.string().email().optional(),
  identifier: z.string().min(3).optional(),
  token: z.string().min(4).max(10).optional(),
  otp: z.string().min(4).max(10).optional(),
}).refine((d) => !!(d.email || d.identifier) && !!(d.token || d.otp), {
  message: 'Email and 6-digit verification code are required',
});

const DEFAULT_SECRET = 'homemate_session_secret_fallback_key_2026';
const SESSION_SECRET = process.env.SESSION_SECRET || DEFAULT_SECRET;
const SESSION_COOKIE_NAME = 'homemate_session';
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

function createSessionToken(payload: { userId: string; email: string; householdId: string; mode: string }) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const fullPayload = { ...payload, exp };
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(encodedPayload);
  const signature = hmac.digest('base64url');

  return `${encodedPayload}.${signature}`;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON request body' });
    }
  }

  const parsed = VerifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid request body' });
  }

  const email = (parsed.data.email || parsed.data.identifier || '').toLowerCase().trim();
  const token = (parsed.data.token || parsed.data.otp || '').trim();

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(503).json({
      error: 'Authentication provider is not yet configured on this instance. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel settings.',
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error || !data.user) {
      return res.status(400).json({
        error: error?.message || 'Invalid or expired 6-digit verification code.',
      });
    }

    const userId = data.user.id;
    const userMeta = data.user.user_metadata || {};
    const householdId = userMeta.householdId || `hh_${crypto.createHash('sha256').update(email).digest('hex').substring(0, 16)}`;
    const mode = (userMeta.mode as string) || 'family';
    const displayName = userMeta.displayName || email.split('@')[0];

    const sessionToken = createSessionToken({
      userId,
      email,
      householdId,
      mode,
    });

    const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
    const secureFlag = isProd ? '; Secure' : '';
    const cookieHeader = `${SESSION_COOKIE_NAME}=${sessionToken}; HttpOnly${secureFlag}; SameSite=Lax; Path=/; Max-Age=${SESSION_DURATION_SECONDS}`;

    res.setHeader('Set-Cookie', cookieHeader);

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Authentication successful.',
      user: {
        id: userId,
        email,
        displayName,
        householdId,
        mode,
      },
    });
  } catch (err: any) {
    console.error('[API Verify OTP] Verification error:', err);
    return res.status(500).json({ error: 'Internal server error during verification' });
  }
}
