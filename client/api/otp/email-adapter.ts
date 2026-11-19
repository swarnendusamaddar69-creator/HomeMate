import nodemailer from 'nodemailer';

export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface OtpEmailAdapter {
  name: string;
  sendOtp(email: string, code: string): Promise<SendOtpResult>;
}

function getEmailHtml(code: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your HomeMate Verification Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px 20px; margin: 0;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 36px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="font-size: 24px; font-weight: 900; color: #10b981; margin: 0;">🏡 HomeMate</h1>
      <p style="color: #94a3b8; font-size: 13px; margin-top: 6px;">AI Household Operating System</p>
    </div>

    <div style="text-align: center; margin-bottom: 28px;">
      <p style="font-size: 15px; color: #cbd5e1; line-height: 1.5; margin: 0 0 16px 0;">
        Use the one-time verification code below to sign in to your household workspace:
      </p>
      
      <div style="display: inline-block; background: linear-gradient(135deg, #064e3b, #0f766e); padding: 16px 36px; border-radius: 14px; border: 1px solid #10b981; margin: 12px 0;">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${code}</span>
      </div>

      <p style="font-size: 12px; color: #94a3b8; margin-top: 14px;">
        ⏳ This code expires in <strong>5 minutes</strong> and can only be used once.
      </p>
    </div>

    <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;" />

    <div style="font-size: 11px; color: #64748b; line-height: 1.5; text-align: center;">
      <p style="margin: 0 0 6px 0;">If you did not request this code, you can safely ignore this email.</p>
      <p style="margin: 0;">HomeMate Helpline: <a href="tel:+917439542543" style="color: #10b981; text-decoration: none;">+91 74395 42543</a> &bull; <a href="mailto:swarnendusamaddar69@gmail.com" style="color: #10b981; text-decoration: none;">swarnendusamaddar69@gmail.com</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ─── SMTP Adapter (Gmail, Brevo, SendGrid, Mailgun) ───
export class SmtpEmailAdapter implements OtpEmailAdapter {
  name = 'SMTP';
  private host: string;
  private port: number;
  private secure: boolean;
  private user: string;
  private pass: string;
  private from: string;

  constructor() {
    this.host = process.env.SMTP_HOST || 'smtp.gmail.com';
    this.port = parseInt(process.env.SMTP_PORT || '465', 10);
    this.secure = this.port === 465;
    this.user = process.env.SMTP_USER || '';
    // Clean password of any spaces (e.g. from Google 4-chunk app password format "xxxx xxxx xxxx xxxx")
    this.pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
    this.from = process.env.SMTP_FROM || `"HomeMate" <${this.user}>`;
  }

  isConfigured(): boolean {
    return !!(this.user && this.pass);
  }

  async sendOtp(email: string, code: string): Promise<SendOtpResult> {
    if (!this.user || !this.pass) {
      return {
        success: false,
        error: 'SMTP credentials (SMTP_USER and SMTP_PASS) not configured in Vercel environment variables.',
      };
    }

    try {
      const transporter = nodemailer.createTransport({
        host: this.host,
        port: this.port,
        secure: this.secure,
        auth: {
          user: this.user,
          pass: this.pass,
        },
      });

      const info = await transporter.sendMail({
        from: this.from,
        to: email,
        subject: `${code} is your HomeMate verification code`,
        text: `Your HomeMate 6-digit verification code is: ${code}. It expires in 5 minutes.`,
        html: getEmailHtml(code),
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: any) {
      console.error('[SMTP Send Error]', err);
      return {
        success: false,
        error: err.message || 'Failed to dispatch email via SMTP.',
      };
    }
  }
}

// ─── Resend Adapter ───
export class ResendEmailAdapter implements OtpEmailAdapter {
  name = 'Resend';
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey?: string, fromEmail?: string) {
    this.apiKey = apiKey || process.env.RESEND_API_KEY || '';
    this.fromEmail = fromEmail || process.env.RESEND_FROM_EMAIL || 'HomeMate <onboarding@resend.dev>';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async sendOtp(email: string, code: string): Promise<SendOtpResult> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'RESEND_API_KEY is not configured in Vercel environment variables.',
      };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [email],
          subject: `${code} is your HomeMate verification code`,
          html: getEmailHtml(code),
          text: `Your HomeMate 6-digit verification code is: ${code}. It expires in 5 minutes.`,
        }),
      });

      const data = (await response.json()) as any;
      if (!response.ok) {
        console.error('[Resend Error]', data);
        return {
          success: false,
          error: data.message || 'Failed to dispatch email via Resend.',
        };
      }

      return {
        success: true,
        messageId: data.id,
      };
    } catch (err: any) {
      console.error('[Resend Fetch Exception]', err);
      return {
        success: false,
        error: err.message || 'Network error connecting to Resend API.',
      };
    }
  }
}

// ─── Primary Dispatcher: Prioritizes Configured Adapter ───
export function getEmailAdapter(): OtpEmailAdapter {
  // If SMTP (Gmail) is configured, prioritize it because it has no recipient restriction
  const smtp = new SmtpEmailAdapter();
  if (smtp.isConfigured()) return smtp;

  const resend = new ResendEmailAdapter();
  if (resend.isConfigured()) return resend;

  // Defaults to SMTP
  return smtp;
}
