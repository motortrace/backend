import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../shared/types/auth.types';
import { PrismaClient } from '@prisma/client';
import { IAuthSupabaseService, IEmailService, IOTPService } from './authSupabase.types';
import { createClient } from '@supabase/supabase-js';

export class AuthSupabaseController {
  private readonly supabaseAdmin: ReturnType<typeof createClient>;

  constructor(
    private readonly authService: IAuthSupabaseService,
    private readonly emailService: IEmailService,
    private readonly otpService: IOTPService,
    private readonly prisma: PrismaClient
  ) {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }

  async signUp(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, role } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }
      const data = await this.authService.signUp(email, password, role);
      res.status(201).json({ message: 'User registered successfully', data });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Registration failed' });
    }
  }

  async signIn(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }
      const data = await this.authService.signIn(email, password);
      
      // Debug: Log what the service returned
      console.log('🔍 Service returned:', JSON.stringify(data, null, 2));
      
      // Return user data with flattened metadata used by mobile app
      res.status(200).json({ 
        message: 'Login successful', 
        data: {
          user: {
            id: data.user?.id,
            email: data.user?.email,
            role: (data.user as any)?.user_metadata?.role || 'customer',
            isRegistrationComplete: (data.user as any)?.user_metadata?.isRegistrationComplete === true
          },
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          expires_at: data.session?.expires_at
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Login failed' });
    }
  }

  async signOut(req: Request, res: Response): Promise<void> {
    try {
      await this.authService.signOut();
      res.status(200).json({ message: 'Signed out successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Sign out failed' });
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Get the full user data from Supabase
      const supabaseUser = await this.authService.getUser(req.headers.authorization?.replace('Bearer ', '') || '');

      // Load profile from Prisma
      const userProfile = await this.prisma.userProfile.findUnique({
        where: { supabaseUserId: req.user.id },
        select: {
          name: true,
          phone: true,
          profileImage: true,
          isRegistrationComplete: true
        }
      });

      // For now, we'll return Supabase user data plus Prisma profile data
      console.log('🔍 Supabase user:', supabaseUser);
      res.json({
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
          // Additional Supabase user data
          emailConfirmed: supabaseUser?.email_confirmed_at ? true : false,
          createdAt: supabaseUser?.created_at,
          lastSignIn: supabaseUser?.last_sign_in_at,
          // Prisma profile data
          fullName: userProfile?.name || undefined,
          phone: userProfile?.phone || undefined,
          profileImage: userProfile?.profileImage || undefined,
          isRegistrationComplete: userProfile?.isRegistrationComplete ?? false
        },
        message: 'User profile retrieved successfully'
      });
    } catch (error: any) {
      console.error('getMe error:', error);
      res.status(500).json({ 
        error: 'Could not retrieve user profile',
        message: error.message 
      });
    }
  }

  async completeOnboarding(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('🔍 Onboarding request received:', {
        headers: req.headers,
        body: req.body,
        user: req.user
      });

      if (!req.user) {
        console.log('❌ No user found in request');
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { name, contact, profileImageUrl } = req.body;

      console.log('📝 Onboarding data:', { name, contact, profileImageUrl });

      // Validate required fields
      if (!name || !contact) {
        console.log('❌ Missing required fields');
        res.status(400).json({ error: 'Name and contact are required' });
        return;
      }

      // Save onboarding data to database
      try {
        // Create or update user profile
        const userProfile = await this.prisma.userProfile.upsert({
          where: { supabaseUserId: req.user.id },
          update: {
            name,
            phone: contact,
            profileImage: profileImageUrl || null,
            isRegistrationComplete: true
          },
          create: {
            supabaseUserId: req.user.id,
            name,
            phone: contact,
            profileImage: profileImageUrl || null,
            isRegistrationComplete: true
          }
        });

        console.log('✅ User profile saved:', userProfile);

        // If user is a customer, create customer record
        if (req.user.role === 'customer') {
          const customer = await this.prisma.customer.upsert({
            where: { userProfileId: userProfile.id },
            update: {
              name,
              email: req.user.email,
              phone: contact
            },
            create: {
              userProfileId: userProfile.id,
              name,
              email: req.user.email,
              phone: contact
            }
          });

          console.log('✅ Customer record saved:', customer);
        }

        // Also mark registration complete in Supabase user metadata so login returns it
        try {
          await this.supabaseAdmin.auth.admin.updateUserById(req.user.id, {
            user_metadata: {
              ...(typeof (req.user as any).user_metadata === 'object' ? (req.user as any).user_metadata : {}),
              isRegistrationComplete: true,
              name,
              phone: contact,
              profileImageUrl: profileImageUrl || null
            }
          });
          console.log('✅ Supabase user metadata updated with registration completion');
        } catch (metaErr) {
          console.warn('⚠️ Failed to update Supabase user metadata:', metaErr);
        }

        const response = {
          message: 'Onboarding completed successfully',
          user: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role,
            name,
            contact,
            profileImageUrl,
            isRegistrationComplete: true
          }
        };

        console.log('✅ Sending onboarding response:', response);
        res.json(response);
      } catch (dbError: any) {
        console.error('❌ Database error:', dbError);
        res.status(500).json({ 
          error: 'Database error during onboarding',
          message: dbError.message 
        });
      }
    } catch (error: any) {
      console.error('❌ Onboarding error:', error);
      res.status(500).json({ 
        error: 'Could not complete onboarding',
        message: error.message 
      });
    }
  }

  async getHeader(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('🔍 Header request received for user:', req.user?.id);

      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Get user profile from database
      const userProfile = await this.prisma.userProfile.findUnique({
        where: { supabaseUserId: req.user.id },
        select: {
          name: true,
          profileImage: true,
          isRegistrationComplete: true
        }
      });

      if (!userProfile) {
        res.status(404).json({ 
          error: 'User profile not found',
          message: 'Please complete your profile setup'
        });
        return;
      }

      // Build absolute profile image URL for mobile clients (Android emulator cannot resolve localhost)
      const apiBaseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
      const normalizeImageUrl = (imagePath: string | null | undefined): string | null => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        const base = apiBaseUrl;
        const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `${base}${path}`;
      };

      const response = {
        success: true,
        user: {
          fullname: userProfile.name || 'User',
          profile_image: normalizeImageUrl(userProfile.profileImage),
          isRegistrationComplete: userProfile.isRegistrationComplete
        },
        message: 'User header data retrieved successfully'
      };

      res.json(response);
    } catch (error: any) {
      console.error('❌ Header error:', error);
      res.status(500).json({ 
        error: 'Could not retrieve user header data',
        message: error.message 
      });
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const userProfile = await this.prisma.userProfile.findUnique({
        where: { supabaseUserId: req.user.id },
        select: {
          name: true,
          phone: true,
          profileImage: true,
          isRegistrationComplete: true
        }
      });

      console.log('🔍 User profile:', userProfile);

      if (!userProfile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }

      const apiBaseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
      const normalizeImageUrl = (imagePath: string | null | undefined): string | null => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `${apiBaseUrl}${path}`;
      };

      res.json({
        success: true,
        profile: {
          fullName: userProfile.name || '',
          phoneNumber: userProfile.phone || '',
          profileImageUrl: normalizeImageUrl(userProfile.profileImage),
          isRegistrationComplete: userProfile.isRegistrationComplete
        }
      });
    } catch (error: any) {
      console.error('❌ getProfile error:', error);
      res.status(500).json({ error: 'Failed to load profile', message: error.message });
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { name, phone, profileImageUrl } = req.body as { name?: string; phone?: string; profileImageUrl?: string | null };

      const updated = await this.prisma.userProfile.upsert({
        where: { supabaseUserId: req.user.id },
        update: {
          name: name ?? undefined,
          phone: phone ?? undefined,
          profileImage: profileImageUrl === undefined ? undefined : (profileImageUrl || null)
        },
        create: {
          supabaseUserId: req.user.id,
          name: name || '',
          phone: phone || '',
          profileImage: profileImageUrl || null,
          isRegistrationComplete: true
        }
      });

      const apiBaseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
      const normalizeImageUrl = (imagePath: string | null | undefined): string | null => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `${apiBaseUrl}${path}`;
      };

      res.json({
        success: true,
        profile: {
          fullName: updated.name || '',
          phoneNumber: updated.phone || '',
          profileImageUrl: normalizeImageUrl(updated.profileImage),
          isRegistrationComplete: updated.isRegistrationComplete
        }
      });
    } catch (error: any) {
      console.error('❌ updateProfile error:', error);
      res.status(500).json({ error: 'Failed to update profile', message: error.message });
    }
  }

  async googleAuth(req: Request, res: Response): Promise<void> {
    try {
      const { idToken, role = 'customer' } = req.body;

      if (!idToken) {
        res.status(400).json({ error: 'Google ID token is required' });
        return;
      }

      console.log('🔍 Google auth request received:', { role });

      // Use Supabase to verify the Google ID token
      const data = await this.authService.googleSignIn(idToken, role);
      
      console.log('✅ Google auth successful:', { 
        userId: data.user?.id, 
        email: data.user?.email,
        hasSession: !!data.session 
      });

      res.json({
        message: 'Google authentication successful',
        data: {
          user: {
            id: data.user?.id,
            email: data.user?.email,
            role: data.user?.user_metadata?.role || role,
            isRegistrationComplete: data.user?.user_metadata?.isRegistrationComplete || false
          },
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          expires_at: data.session?.expires_at
        }
      });
    } catch (error: any) {
      console.error('❌ Google auth error:', error);
      res.status(400).json({ 
        error: 'Google authentication failed',
        message: error.message 
      });
    }
  }

  async deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('🔍 Delete account request received for user:', req.user?.id);

      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const userId = req.user.id;

      // Start a transaction to ensure data consistency
      await this.prisma.$transaction(async (prismaTransaction) => {
        console.log('🗑️ Starting account deletion process...');

        // 1. Get user profile to check if exists and get related IDs
        const userProfile = await prismaTransaction.userProfile.findUnique({
          where: { supabaseUserId: userId },
          include: {
            customer: true,
          }
        });

        if (userProfile) {
          console.log('📋 User profile found, deleting related data...');

          // 2. Delete customer-related data if user is a customer
          if (userProfile.customer) {
            console.log('🏷️ Deleting customer-related records...');
            
            // Delete appointments (if you have this table)
            try {
              await prismaTransaction.appointment.deleteMany({
                where: { customerId: userProfile.customer.id }
              });
              console.log('✅ Appointments deleted');
            } catch (error) {
              console.warn('⚠️ No appointments to delete or table does not exist');
            }

            // Delete customer vehicles first (due to foreign key constraints)
            try {
              await prismaTransaction.vehicle.deleteMany({
                where: { customerId: userProfile.customer.id }
              });
              console.log('✅ Customer vehicles deleted');
            } catch (error) {
              console.warn('⚠️ No vehicles to delete or error occurred:', error);
            }

            // Delete customer record
            await prismaTransaction.customer.delete({
              where: { id: userProfile.customer.id }
            });
            console.log('✅ Customer record deleted');
          }

          // 4. Delete user profile
          await prismaTransaction.userProfile.delete({
            where: { id: userProfile.id }
          });
          console.log('✅ User profile deleted');
        } else {
          console.log('⚠️ No user profile found, proceeding with auth deletion only');
        }
      });

      // 5. Delete user from Supabase Auth (this should be done last)
      try {
        await this.authService.deleteUser(userId);
        console.log('✅ User deleted from Supabase Auth');
      } catch (authError: any) {
        console.error('❌ Failed to delete user from Supabase Auth:', authError);
        console.warn('⚠️ Database cleanup completed but Supabase Auth deletion failed');
      }

      console.log('✅ Account deletion completed successfully');

      res.json({
        success: true,
        message: 'Account deleted successfully',
        data: {
          deletedUserId: userId,
          deletedAt: new Date().toISOString()
        }
      });

    } catch (error: any) {
      console.error('❌ Account deletion error:', error);
      
      // Check if it's a Prisma transaction error
      if (error.code === 'P2025') {
        res.status(404).json({
          error: 'User profile not found',
          message: 'Account may have already been deleted'
        });
        return;
      }

      res.status(500).json({
        error: 'Could not delete account',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json({ 
          success: false,
          error: 'Email is required' 
        });
        return;
      }

      console.log('🔍 Password reset request for:', email);

      // Check if user exists in Supabase
      try {
        // Try to get user from Supabase to verify they exist
        const { data: users, error } = await this.supabaseAdmin.auth.admin.listUsers();
        
        if (error) {
          console.error('❌ Error checking users:', error);
          res.status(500).json({
            success: false,
            error: 'Unable to verify user account'
          });
          return;
        }

        const userExists = users.users.some(user => user.email === email.toLowerCase());
        
        if (!userExists) {
          console.log('❌ User not found:', email);
          res.status(404).json({
            success: false,
            error: 'User not found'
          });
          return;
        }

        // Generate OTP
        const otp = this.otpService.storeOTP(email);
        
        // Send email with OTP
        const emailHtml = this.emailService.generatePasswordResetEmail(otp, email);
        const emailText = this.emailService.generatePasswordResetText(otp, email);
        
        await this.emailService.sendEmail({
          to: email,
          subject: 'MotorTrace - Password Reset Code',
          html: emailHtml,
          text: emailText
        });

        console.log('✅ Password reset email sent to:', email);

        res.json({
          success: true,
          message: 'Password reset code sent to your email',
          data: {
            email,
            sentAt: new Date().toISOString(),
            expiresIn: 600 // 10 minutes in seconds
          }
        });

      } catch (error: any) {
        console.error('❌ Password reset error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to send password reset email',
          message: error.message
        });
      }

    } catch (error: any) {
      console.error('❌ Password reset request error:', error);
      res.status(400).json({
        success: false,
        error: 'Could not process password reset request',
        message: error.message
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp, newPassword } = req.body;
      
      if (!email || !otp || !newPassword) {
        res.status(400).json({ 
          success: false,
          error: 'Email, OTP, and new password are required' 
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long'
        });
        return;
      }

      console.log('🔍 Password reset request for:', email);

      // First verify the OTP
      const verification = this.otpService.verifyOTP(email, otp);
      
      if (!verification.valid) {
        res.status(400).json({
          success: false,
          error: verification.message,
          data: {
            remainingAttempts: this.otpService.getRemainingAttempts(email)
          }
        });
        return;
      }

      // OTP is valid, now reset the password using Supabase
      try {
        // Get user by email to get their ID
        const { data: users, error: listError } = await this.supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
          throw new Error('Unable to find user account');
        }

        const user = users.users.find(u => u.email === email.toLowerCase());
        
        if (!user) {
          throw new Error('User not found');
        }

        // Update password using Supabase admin
        const { data, error: updateError } = await this.supabaseAdmin.auth.admin.updateUserById(user.id, {
          password: newPassword
        });

        if (updateError) {
          throw new Error(updateError.message);
        }

        console.log('✅ Password reset successfully for:', email);

        res.json({
          success: true,
          message: 'Password updated successfully',
          data: {
            userId: user.id,
            email: user.email,
            updatedAt: new Date().toISOString()
          }
        });

      } catch (error: any) {
        console.error('❌ Password update error:', error);
        res.status(500).json({
          success: false,
          error: 'Could not update password',
          message: error.message
        });
      }

    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      res.status(400).json({
        success: false,
        error: 'Could not reset password',
        message: error.message
      });
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ 
          success: false,
          error: 'User not authenticated' 
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        res.status(400).json({ 
          success: false,
          error: 'Current password and new password are required' 
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          error: 'New password must be at least 6 characters long'
        });
        return;
      }

      if (currentPassword === newPassword) {
        res.status(400).json({
          success: false,
          error: 'New password must be different from current password'
        });
        return;
      }

      const user = await this.authService.changePassword(currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully',
        data: {
          userId: user?.id,
          changedAt: new Date().toISOString()
        }
      });

    } catch (error: any) {
      console.error('❌ Password change error:', error);
      res.status(400).json({
        success: false,
        error: 'Could not change password',
        message: error.message
      });
    }
  }

  async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      
      if (!email || !otp) {
        res.status(400).json({ 
          success: false,
          error: 'Email and OTP are required' 
        });
        return;
      }

      console.log('🔍 OTP verification request for:', email);

      // Do a non-consuming check so user can proceed to reset
      const verification = this.otpService.checkOTP(email, otp);

      if (verification.valid) {
        res.json({
          success: true,
          message: 'OTP verified successfully',
          data: {
            email,
            verified: true,
            verifiedAt: new Date().toISOString()
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: verification.message,
          data: {
            email,
            verified: false,
            remainingAttempts: this.otpService.getRemainingAttempts(email)
          }
        });
      }

    } catch (error: any) {
      console.error('❌ OTP verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Could not verify OTP',
        message: error.message
      });
    }
  }

  async verifyResetToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      
      if (!token) {
        res.status(400).json({ 
          success: false,
          error: 'Token is required' 
        });
        return;
      }

      const user = await this.authService.verifyResetToken(token);

      res.json({
        success: true,
        message: 'Token is valid',
        data: {
          userId: user?.id,
          email: user?.email,
          isValid: true
        }
      });

    } catch (error: any) {
      console.error('❌ Token verification error:', error);
      res.status(400).json({
        success: false,
        error: 'Invalid or expired token',
        message: error.message
      });
    }
  }
}
