import crypto from 'crypto';

export interface StoredOtpRecord {
  hash: string;
  attempts: number;
  maxAttempts: number;
  expiresAt: number;
  createdAt: number;
}

export interface RateLimitRecord {
  count: number;
  windowStart: number;
  lastSentAt: number;
}

const OTP_HASH_SECRET = process.env.OTP_HASH_SECRET || process.env.SESSION_SECRET || 'homemate_otp_hash_secret_key_2026';
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_SENDS_PER_WINDOW = 3; // 3 per hour
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_VERIFY_ATTEMPTS = 5;

// In-memory fallback storage for serverless runtime
const memoryOtpStore = new Map<string, StoredOtpRecord>();
const memoryRateLimitStore = new Map<string, RateLimitRecord>();

export function hashOtp(code: string): string {
  return crypto.createHmac('sha256', OTP_HASH_SECRET).update(code.trim()).digest('hex');
}

export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Upstash Redis helper using native fetch
async function upstashRequest(command: string[]): Promise<any> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const res = await fetch(`${url}/${command.map((c) => encodeURIComponent(c)).join('/')}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as any;
    return json.result;
  } catch (err) {
    console.warn('[Upstash Redis] Fetch error, falling back to in-memory:', err);
    return null;
  }
}

export async function checkRateLimit(
  identifier: string,
  ip: string
): Promise<{ allowed: boolean; reason?: string; cooldownSeconds?: number }> {
  const now = Date.now();
  const keys = [`ratelimit:id:${identifier.toLowerCase()}`, `ratelimit:ip:${ip}`];

  for (const key of keys) {
    let rec: RateLimitRecord | null = null;
    const upstashVal = await upstashRequest(['GET', key]);

    if (upstashVal) {
      try {
        rec = typeof upstashVal === 'string' ? JSON.parse(upstashVal) : upstashVal;
      } catch {
        rec = null;
      }
    }

    if (!rec) {
      rec = memoryRateLimitStore.get(key) || null;
    }

    if (rec) {
      // Check 30s resend cooldown
      const timeSinceLast = now - rec.lastSentAt;
      if (timeSinceLast < RESEND_COOLDOWN_MS) {
        const remaining = Math.ceil((RESEND_COOLDOWN_MS - timeSinceLast) / 1000);
        return {
          allowed: false,
          reason: `Please wait ${remaining}s before requesting another verification code.`,
          cooldownSeconds: remaining,
        };
      }

      // Check 1-hour rate limit window
      if (now - rec.windowStart < RATE_LIMIT_WINDOW_MS) {
        if (rec.count >= MAX_SENDS_PER_WINDOW) {
          const resetInMins = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - rec.windowStart)) / 60000);
          return {
            allowed: false,
            reason: `Maximum code requests exceeded (3 per hour). Please retry in ${resetInMins} minutes.`,
          };
        }
      }
    }
  }

  return { allowed: true };
}

export async function recordSend(identifier: string, ip: string): Promise<void> {
  const now = Date.now();
  const keys = [`ratelimit:id:${identifier.toLowerCase()}`, `ratelimit:ip:${ip}`];

  for (const key of keys) {
    let rec: RateLimitRecord | null = null;
    const upstashVal = await upstashRequest(['GET', key]);
    if (upstashVal) {
      try {
        rec = typeof upstashVal === 'string' ? JSON.parse(upstashVal) : upstashVal;
      } catch {
        rec = null;
      }
    }
    if (!rec) {
      rec = memoryRateLimitStore.get(key) || null;
    }

    if (rec && now - rec.windowStart < RATE_LIMIT_WINDOW_MS) {
      rec.count += 1;
      rec.lastSentAt = now;
    } else {
      rec = {
        count: 1,
        windowStart: now,
        lastSentAt: now,
      };
    }

    memoryRateLimitStore.set(key, rec);
    await upstashRequest(['SET', key, JSON.stringify(rec), 'EX', '3600']);
  }
}

export async function storeOtp(identifier: string, plainCode: string): Promise<void> {
  const now = Date.now();
  const key = `otp:${identifier.toLowerCase().trim()}`;
  const record: StoredOtpRecord = {
    hash: hashOtp(plainCode),
    attempts: 0,
    maxAttempts: MAX_VERIFY_ATTEMPTS,
    expiresAt: now + OTP_TTL_MS,
    createdAt: now,
  };

  memoryOtpStore.set(key, record);
  await upstashRequest(['SET', key, JSON.stringify(record), 'EX', '300']);
}

export async function getOtpRecord(identifier: string): Promise<StoredOtpRecord | null> {
  const key = `otp:${identifier.toLowerCase().trim()}`;
  const now = Date.now();

  const upstashVal = await upstashRequest(['GET', key]);
  let record: StoredOtpRecord | null = null;
  if (upstashVal) {
    try {
      record = typeof upstashVal === 'string' ? JSON.parse(upstashVal) : upstashVal;
    } catch {
      record = null;
    }
  }

  if (!record) {
    record = memoryOtpStore.get(key) || null;
  }

  if (!record) return null;
  if (now > record.expiresAt) {
    await deleteOtpRecord(identifier);
    return null;
  }

  return record;
}

export async function incrementOtpAttempts(identifier: string, record: StoredOtpRecord): Promise<number> {
  const key = `otp:${identifier.toLowerCase().trim()}`;
  record.attempts += 1;
  memoryOtpStore.set(key, record);

  const remainingSeconds = Math.max(1, Math.floor((record.expiresAt - Date.now()) / 1000));
  await upstashRequest(['SET', key, JSON.stringify(record), 'EX', remainingSeconds.toString()]);
  return record.attempts;
}

export async function deleteOtpRecord(identifier: string): Promise<void> {
  const key = `otp:${identifier.toLowerCase().trim()}`;
  memoryOtpStore.delete(key);
  await upstashRequest(['DEL', key]);
}
