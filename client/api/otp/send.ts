import { z } from 'zod';
import crypto from 'crypto';
import { checkRateLimit, recordSend, storeOtp, createOtpChallengeToken } from './storage.js';
import { getEmailAdapter } from './email-adapter.js';

const SendOtpSchema = z.object({
  email: z.string().email().optional(),
  identifier: z.string().min(3).optional(),
  turnstileToken: z.string().optional(),
}).refine((d) => !!(d.email || d.identifier), {
  message: 'Please enter a valid email address',
});

function getClientIp(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1';
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

  const parsed = SendOtpSchema.safeParse(body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues[0]?.message || 'Please enter a valid email address',
    });
  }

  const email = (parsed.data.email || parsed.data.identifier || '').toLowerCase().trim();
  if (!email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ error: 'Please enter a valid email address to receive your 6-digit OTP.' });
  }

  const ip = getClientIp(req);

  // ─── Rate Limiting (3 per hour per email/IP, 30s resend cooldown) ───
  const rateLimit = await checkRateLimit(email, ip);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: rateLimit.reason,
      cooldownSeconds: rateLimit.cooldownSeconds || 30,
    });
  }

  // ─── 6-Digit Cryptographic Code Generation ───
  const code = crypto.randomInt(100000, 1000000).toString();

  // Store HMAC-SHA256 hash in storage (Upstash Redis or in-memory fallback, 5-minute TTL)
  await storeOtp(email, code);
  await recordSend(email, ip);

  // Generate stateless HMAC challenge token for serverless resilience
  const challengeToken = createOtpChallengeToken(email, code);

  // ─── Dispatch via Email Provider Adapter (SMTP / Resend) ───
  const emailAdapter = getEmailAdapter();
  const dispatchResult = await emailAdapter.sendOtp(email, code);

  // If email provider is unconfigured, notify clearly
  if (!dispatchResult.success) {
    console.error(`[OTP Send] Dispatch failed via ${emailAdapter.name}:`, dispatchResult.error);
    return res.status(503).json({
      error: dispatchResult.error || 'Failed to dispatch verification email. Please check provider settings.',
      providerConfigured: false,
    });
  }

  // Set httpOnly challenge cookie so verify can read it automatically across any serverless instance
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const secureFlag = isProd ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `homemate_otp_challenge=${challengeToken}; HttpOnly${secureFlag}; SameSite=Lax; Path=/; Max-Age=300`
  );

  // Never return or log the raw OTP code
  return res.status(200).json({
    success: true,
    message: `A 6-digit verification code has been dispatched to ${email}.`,
    cooldownSeconds: 30,
    challengeToken,
  });
}
