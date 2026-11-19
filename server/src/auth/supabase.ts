import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { OtpProvider, OtpResult, VerifyResult } from './provider.js';
import { createSessionToken } from './session.js';
import crypto from 'crypto';

interface AttemptRecord {
  count: number;
  resetAt: number;
}

export class SupabaseOtpProvider implements OtpProvider {
  public name = 'supabase';
  private client: SupabaseClient | null = null;
  private attemptTracker = new Map<string, AttemptRecord>();

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      this.client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
  }

  private checkAttemptLimit(identifier: string): boolean {
    const now = Date.now();
    const clean = identifier.toLowerCase().trim();
    const record = this.attemptTracker.get(clean);

    if (!record || now > record.resetAt) {
      this.attemptTracker.set(clean, { count: 1, resetAt: now + 5 * 60 * 1000 });
      return true;
    }

    if (record.count >= 5) {
      return false;
    }

    record.count += 1;
    return true;
  }

  private clearAttemptLimit(identifier: string): void {
    this.attemptTracker.delete(identifier.toLowerCase().trim());
  }

  public async sendOtp(identifier: string): Promise<OtpResult> {
    const cleanEmail = identifier.toLowerCase().trim();

    if (!this.client) {
      console.warn(
        '[SupabaseOtpProvider] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/ANON_KEY not configured. Please add them to your Vercel or server environment.'
      );
      // Return identical response to prevent enumeration
      return {
        success: true,
        message: 'If an account exists, a 6-digit verification code has been sent.',
      };
    }

    try {
      const { error } = await this.client.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        console.error('[SupabaseOtpProvider] Send OTP error:', error.message);
      }
    } catch (err) {
      console.error('[SupabaseOtpProvider] Unexpected send OTP error:', err);
    }

    // Always return identical response whether or not account exists
    return {
      success: true,
      message: 'If an account exists, a 6-digit verification code has been sent.',
    };
  }

  public async verifyOtp(identifier: string, token: string): Promise<VerifyResult> {
    const cleanEmail = identifier.toLowerCase().trim();
    const cleanToken = token.trim();

    // Check maximum 5 attempts per 5-minute window
    if (!this.checkAttemptLimit(cleanEmail)) {
      return {
        success: false,
        message: 'Too many failed verification attempts. Please wait 5 minutes and request a new code.',
      };
    }

    if (!this.client) {
      console.warn('[SupabaseOtpProvider] Supabase credentials missing during verification.');
      return {
        success: false,
        message: 'Authentication provider is not yet configured on this instance. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      };
    }

    try {
      const { data, error } = await this.client.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email',
      });

      if (error || !data.user) {
        return {
          success: false,
          message: error?.message || 'Invalid or expired 6-digit verification code.',
        };
      }

      this.clearAttemptLimit(cleanEmail);

      const userId = data.user.id;
      // Derive a stable, isolated householdId for this user
      const userMeta = data.user.user_metadata || {};
      const householdId = userMeta.householdId || `hh_${crypto.createHash('sha256').update(cleanEmail).digest('hex').substring(0, 16)}`;
      const mode = (userMeta.mode as 'family' | 'elder' | 'hostel') || 'family';
      const displayName = userMeta.displayName || cleanEmail.split('@')[0];

      // Issue signed session token
      const sessionToken = createSessionToken({
        userId,
        email: cleanEmail,
        householdId,
        mode,
      });

      return {
        success: true,
        message: 'Authentication successful.',
        user: {
          id: userId,
          email: cleanEmail,
          displayName,
          householdId,
          mode,
        },
        sessionToken,
      };
    } catch (err: any) {
      console.error('[SupabaseOtpProvider] Unexpected verification error:', err);
      return {
        success: false,
        message: 'Verification failed due to a server error. Please try again.',
      };
    }
  }
}
