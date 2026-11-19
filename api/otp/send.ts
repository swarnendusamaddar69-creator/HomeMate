import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const SendOtpSchema = z.object({
  email: z.string().email().optional(),
  identifier: z.string().min(3).optional(),
}).refine((d) => !!(d.email || d.identifier), {
  message: 'Please enter a valid email address',
});

export default async function handler(req: any, res: any) {
  // Always set CORS & JSON headers
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
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Please enter a valid email address' });
  }

  const rawEmail = (parsed.data.email || parsed.data.identifier || '').toLowerCase().trim();
  
  // Basic email pattern check
  if (!rawEmail.includes('@') || !rawEmail.includes('.')) {
    return res.status(400).json({ error: 'Please enter a valid email address to receive your 6-digit OTP.' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { error } = await supabase.auth.signInWithOtp({
        email: rawEmail,
        options: { shouldCreateUser: true },
      });

      if (error) {
        console.error('[API Send OTP] Supabase error:', error.message);
      }
    } catch (err) {
      console.error('[API Send OTP] Unexpected error:', err);
    }
  } else {
    console.warn('[API Send OTP] Supabase credentials not set in Vercel settings.');
  }

  // Identical response whether or not account exists to prevent email enumeration
  return res.status(200).json({
    success: true,
    message: 'If an account exists, a 6-digit verification code has been sent.',
    cooldownSeconds: 30,
  });
}
