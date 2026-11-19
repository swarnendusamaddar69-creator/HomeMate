import { z } from 'zod';
import crypto from 'crypto';
import { getOtpRecord, incrementOtpAttempts, deleteOtpRecord, hashOtp, timingSafeCompare } from './storage.js';

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

  // ─── 1. Retrieve Stored OTP Record ───
  const record = await getOtpRecord(email);
  if (!record) {
    return res.status(400).json({
      error: 'Invalid or expired verification code. Please request a new code.',
    });
  }

  // ─── 2. Increment & Check Max 5 Attempts ───
  const attempts = await incrementOtpAttempts(email, record);
  if (attempts > record.maxAttempts) {
    await deleteOtpRecord(email);
    return res.status(429).json({
      error: 'Too many incorrect attempts. For security, this code has been invalidated. Please request a new code.',
    });
  }

  // ─── 3. Constant-Time Hash Comparison ───
  const candidateHash = hashOtp(token);
  const isMatch = timingSafeCompare(candidateHash, record.hash);

  if (!isMatch) {
    const remaining = Math.max(0, record.maxAttempts - attempts);
    return res.status(400).json({
      error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    });
  }

  // ─── 4. Delete Record Immediately After Successful Use ───
  await deleteOtpRecord(email);

  // ─── 5. Issue Secure httpOnly Cookie Session ───
  const userId = `u_${crypto.createHash('sha256').update(email).digest('hex').substring(0, 16)}`;
  const householdId = `hh_${crypto.createHash('sha256').update(email).digest('hex').substring(0, 16)}`;
  const displayName = email.split('@')[0];
  const mode = 'family';

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
}
