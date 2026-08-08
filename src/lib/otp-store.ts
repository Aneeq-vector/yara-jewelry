/**
 * In-memory OTP store.
 * Keyed by email address. Each entry holds the OTP, its expiry, and the
 * original registration form data so we can create the account after verification.
 */

interface OtpEntry {
  otp: string;
  expires: Date;
  formData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    passwordConfirm: string;
  };
}

// Use a global variable so the Map persists across hot-reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var __otpStore: Map<string, OtpEntry> | undefined;
}

const otpStore: Map<string, OtpEntry> =
  global.__otpStore ?? (global.__otpStore = new Map());

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOtp(email: string, otp: string, formData: OtpEntry['formData']): void {
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  otpStore.set(email.toLowerCase(), { otp, expires, formData });
}

export function verifyOtp(email: string, otp: string): { valid: boolean; formData?: OtpEntry['formData']; error?: string } {
  const entry = otpStore.get(email.toLowerCase());

  if (!entry) {
    return { valid: false, error: 'No OTP found for this email. Please request a new one.' };
  }

  if (new Date() > entry.expires) {
    otpStore.delete(email.toLowerCase());
    return { valid: false, error: 'Your OTP has expired. Please request a new one.' };
  }

  if (entry.otp !== otp) {
    return { valid: false, error: 'Incorrect OTP. Please check your email and try again.' };
  }

  // Valid — consume the OTP so it can't be reused
  const { formData } = entry;
  otpStore.delete(email.toLowerCase());
  return { valid: true, formData };
}

export function clearOtp(email: string): void {
  otpStore.delete(email.toLowerCase());
}
