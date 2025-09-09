import crypto from 'crypto';

interface OTPData {
  code: string;
  email: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

class OTPService {
  private otpStorage: Map<string, OTPData> = new Map();
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;

  generateOTP(): string {
    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    return otp;
  }

  storeOTP(email: string): string {
    // Clean up expired OTPs
    this.cleanupExpiredOTPs();

    // Generate new OTP
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP data
    const otpData: OTPData = {
      code: otp,
      email: email.toLowerCase(),
      expiresAt,
      attempts: 0,
      createdAt: new Date(),
    };

    this.otpStorage.set(email.toLowerCase(), otpData);

    console.log(`✅ OTP generated for ${email}: ${otp} (expires at ${expiresAt.toISOString()})`);
    return otp;
  }

  // Check OTP without consuming it (used for verification screen)
  checkOTP(email: string, inputOTP: string): { valid: boolean; message: string } {
    const emailKey = email.toLowerCase();
    const otpData = this.otpStorage.get(emailKey);

    if (!otpData) {
      return { valid: false, message: 'No OTP found for this email' };
    }

    // Check if OTP has expired
    if (new Date() > otpData.expiresAt) {
      this.otpStorage.delete(emailKey);
      return { valid: false, message: 'OTP has expired. Please request a new one.' };
    }

    // Check if max attempts exceeded
    if (otpData.attempts >= this.MAX_ATTEMPTS) {
      this.otpStorage.delete(emailKey);
      return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }

    // Do not increment attempts or consume on positive check here
    if (otpData.code === inputOTP) {
      return { valid: true, message: 'OTP is valid' };
    }

    // On wrong code, increment attempts and potentially lock out
    otpData.attempts++;
    console.log(`❌ Invalid OTP attempt for ${email}. Attempt ${otpData.attempts}/${this.MAX_ATTEMPTS}`);
    return { valid: false, message: `Invalid OTP. ${this.MAX_ATTEMPTS - otpData.attempts} attempts remaining.` };
  }

  // Verify and consume OTP (used when actually resetting password)
  verifyOTP(email: string, inputOTP: string): { valid: boolean; message: string } {
    const emailKey = email.toLowerCase();
    const otpData = this.otpStorage.get(emailKey);

    if (!otpData) {
      return { valid: false, message: 'No OTP found for this email' };
    }

    // Check if OTP has expired
    if (new Date() > otpData.expiresAt) {
      this.otpStorage.delete(emailKey);
      return { valid: false, message: 'OTP has expired. Please request a new one.' };
    }

    // Check if max attempts exceeded
    if (otpData.attempts >= this.MAX_ATTEMPTS) {
      this.otpStorage.delete(emailKey);
      return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }

    // Increment attempts
    otpData.attempts++;

    // Verify OTP
    if (otpData.code === inputOTP) {
      // OTP is valid, remove it from storage
      this.otpStorage.delete(emailKey);
      console.log(`✅ OTP verified and consumed for ${email}`);
      return { valid: true, message: 'OTP verified successfully' };
    } else {
      console.log(`❌ Invalid OTP attempt for ${email}. Attempt ${otpData.attempts}/${this.MAX_ATTEMPTS}`);
      return { valid: false, message: `Invalid OTP. ${this.MAX_ATTEMPTS - otpData.attempts} attempts remaining.` };
    }
  }

  getOTPData(email: string): OTPData | null {
    return this.otpStorage.get(email.toLowerCase()) || null;
  }

  isOTPValid(email: string): boolean {
    const emailKey = email.toLowerCase();
    const otpData = this.otpStorage.get(emailKey);

    if (!otpData) return false;
    if (new Date() > otpData.expiresAt) return false;
    if (otpData.attempts >= this.MAX_ATTEMPTS) return false;

    return true;
  }

  cleanupExpiredOTPs(): void {
    const now = new Date();
    for (const [email, otpData] of this.otpStorage.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStorage.delete(email);
        console.log(`🧹 Cleaned up expired OTP for ${email}`);
      }
    }
  }

  // Get remaining time for OTP (in seconds)
  getRemainingTime(email: string): number {
    const emailKey = email.toLowerCase();
    const otpData = this.otpStorage.get(emailKey);

    if (!otpData) return 0;

    const remainingMs = otpData.expiresAt.getTime() - Date.now();
    return Math.max(0, Math.floor(remainingMs / 1000));
  }

  // Get remaining attempts
  getRemainingAttempts(email: string): number {
    const emailKey = email.toLowerCase();
    const otpData = this.otpStorage.get(emailKey);

    if (!otpData) return 0;

    return Math.max(0, this.MAX_ATTEMPTS - otpData.attempts);
  }
}

export const otpService = new OTPService();
export default otpService;
