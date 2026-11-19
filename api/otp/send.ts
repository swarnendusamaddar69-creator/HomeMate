import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const SendOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = SendOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid email address' });
  }

  const email = parsed.data.email.toLowerCase().trim();

  if (supabase) {
    try {
      await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
    } catch (err) {
      console.error('[API Send OTP] Error sending OTP:', err);
    }
  } else {
    console.warn('[API Send OTP] Supabase not configured in Vercel settings.');
  }

  // Identical response whether or not account exists to prevent email enumeration
  return res.status(200).json({
    success: true,
    message: 'If an account exists, a 6-digit verification code has been sent.',
  });
}
