export interface OtpResult {
  success: boolean;
  message: string;
}

export interface VerifyResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    displayName?: string;
    householdId?: string;
    mode?: 'family' | 'elder' | 'hostel';
  };
  sessionToken?: string;
}

export interface OtpProvider {
  name: string;
  sendOtp(identifier: string): Promise<OtpResult>;
  verifyOtp(identifier: string, token: string): Promise<VerifyResult>;
}
