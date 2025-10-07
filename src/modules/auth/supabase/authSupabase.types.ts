// Auth Service Interface for Dependency Injection
export interface IAuthSupabaseService {
  signUp(email: string, password: string, role?: string): Promise<any>;
  signIn(email: string, password: string): Promise<{ user: any; session: any }>;
  getUser(token: string): Promise<any>;
  signOut(): Promise<boolean>;
  validateToken(token: string): Promise<any>;
  getSession(): Promise<any>;
  getAccessToken(): Promise<string | undefined>;
  updateUserRole(userId: string, role: string): Promise<any>;
  googleSignIn(idToken: string, role?: string): Promise<{ user: any; session: any }>;
  deleteUser(userId: string): Promise<any>;
  deleteUserData(userId: string, tableName: string): Promise<any>;
  softDeleteUser(userId: string, tableName?: string): Promise<any>;
  completeUserDeletion(userId: string, relatedTables?: string[]): Promise<{ success: boolean; message: string }>;
  resetPassword(email: string): Promise<any>;
  updatePassword(token: string, newPassword: string): Promise<any>;
  changePassword(currentPassword: string, newPassword: string): Promise<any>;
  verifyResetToken(token: string): Promise<any>;
}

// Email Service Interface
export interface IEmailService {
  sendEmail(options: EmailOptions): Promise<boolean>;
  generatePasswordResetEmail(otp: string, email: string): string;
  generatePasswordResetText(otp: string, email: string): string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// OTP Service Interface
export interface IOTPService {
  storeOTP(email: string): string;
  checkOTP(email: string, inputOTP: string): { valid: boolean; message: string };
  verifyOTP(email: string, inputOTP: string): { valid: boolean; message: string };
  getRemainingAttempts(email: string): number;
}
