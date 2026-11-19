import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const VerifyOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  token: z.string().length(6, 'Verification code must be exactly 6 digits'),
});

const DEFAULT_SECRET = 'homemate_session_secret_fallback_key_2026';
const SESSION_SECRET = process.env.SESSION_SECRET || DEFAULT_SECRET;
const SESSION_COOKIE_NAME = 'homemate_session';
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = VerifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid request body' });
  }

  const { email, token } = parsed.data;
  const cleanEmail = email.toLowerCase().trim();
  const cleanToken = token.trim();

  if (!supabase) {
    return res.status(503).json({
      error: 'Authentication provider is not yet configured on this instance. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel settings.',
    });
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email',
    });

    if (error || !data.user) {
      return res.status(400).json({
        error: error?.message || 'Invalid or expired 6-digit verification code.',
      });
    }

    const userId = data.user.id;
    const userMeta = data.user.user_metadata || {};
    const householdId = userMeta.householdId || `hh_${crypto.createHash('sha256').update(cleanEmail).digest('hex').substring(0, 16)}`;
    const mode = (userMeta.mode as string) || 'family';
    const displayName = userMeta.displayName || cleanEmail.split('@')[0];

    const sessionToken = createSessionToken({
      userId,
      email: cleanEmail,
      householdId,
      mode,
    });

    const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
    const secureFlag = isProd ? '; Secure' : '';
    const cookieHeader = `${SESSION_COOKIE_NAME}=${sessionToken}; HttpOnly${secureFlag}; SameSite=Lax; Path=/; Max-Age=${SESSION_DURATION_SECONDS}`;

    res.setHeader('Set-Cookie', cookieHeader);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      user: {
        id: userId,
        email: cleanEmail,
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
