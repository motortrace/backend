import { Request, Response } from 'express';
import { AuthSupabaseController } from '../../../modules/auth/supabase/authSupabase.controller';
import { AuthSupabaseService } from '../../../modules/auth/supabase/authSupabase.service';
import { PrismaClient } from '@prisma/client';
import { emailService } from '../../../shared/utils/email.helper';
import { otpService } from '../../../shared/utils/otp.helper';

// Mock dependencies
jest.mock('../../../modules/auth/supabase/authSupabase.service');
jest.mock('../../../shared/utils/email.helper');
jest.mock('../../../shared/utils/otp.helper');
jest.mock('@prisma/client');

// Define custom types for mocked request
interface MockRequest extends Partial<Request> {
  user?: any;
}

describe('AuthSupabaseController', () => {
  let controller: AuthSupabaseController;
  let mockAuthService: jest.Mocked<AuthSupabaseService>;
  let mockEmailService: jest.Mocked<typeof emailService>;
  let mockOtpService: jest.Mocked<typeof otpService>;
  let mockPrisma: any; // Use any to avoid Prisma typing issues
  let mockRequest: MockRequest;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up environment variables for Supabase
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

    // Create mocks
    mockAuthService = {
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      validateToken: jest.fn(),
      getSession: jest.fn(),
      getAccessToken: jest.fn(),
      updateUserRole: jest.fn(),
      googleSignIn: jest.fn(),
      deleteUser: jest.fn(),
      deleteUserData: jest.fn(),
      softDeleteUser: jest.fn(),
      completeUserDeletion: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      changePassword: jest.fn(),
      verifyResetToken: jest.fn()
    } as any;

    mockEmailService = emailService as jest.Mocked<typeof emailService>;
    mockOtpService = otpService as jest.Mocked<typeof otpService>;

    // Create a simple mock for Prisma to avoid typing issues
    mockPrisma = {
      userProfile: {
        findUnique: jest.fn(),
        upsert: jest.fn()
      },
      customer: {
        upsert: jest.fn()
      }
    } as any;

    // Setup response mock
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    // Create controller instance
    controller = new AuthSupabaseController(
      mockAuthService,
      mockEmailService,
      mockOtpService,
      mockPrisma
    );
  });

  describe('signUp', () => {
    it('should sign up user successfully', async () => {
      // Arrange
      const userData = { email: 'test@example.com', password: 'password123', role: 'customer' };
      const mockUser = { id: 'user123', email: 'test@example.com' };

      mockRequest = { body: userData };
      mockAuthService.signUp.mockResolvedValue(mockUser);

      // Act
      await controller.signUp(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockAuthService.signUp).toHaveBeenCalledWith('test@example.com', 'password123', 'customer');
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'User registered successfully',
        data: mockUser,
        note: 'Customer users must complete onboarding. Staff users are created by admins.'
      });
    });

    it('should return 400 when email or password is missing', async () => {
      // Arrange
      mockRequest = { body: { email: 'test@example.com' } }; // Missing password

      // Act
      await controller.signUp(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Email and password are required' });
    });

    it('should handle signup errors', async () => {
      // Arrange
      const userData = { email: 'test@example.com', password: 'password123' };
      mockRequest = { body: userData };
      mockAuthService.signUp.mockRejectedValue(new Error('Signup failed'));

      // Act
      await controller.signUp(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Signup failed' });
    });
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      // Arrange
      const loginData = { email: 'test@example.com', password: 'password123' };
      const mockResult = {
        user: { id: 'user123', email: 'test@example.com', user_metadata: { role: 'customer' } },
        session: { access_token: 'token123', refresh_token: 'refresh123', expires_at: 123456 }
      };

      mockRequest = { body: loginData };
      mockAuthService.signIn.mockResolvedValue(mockResult);

      // Act
      await controller.signIn(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockAuthService.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Login successful',
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com',
            role: 'customer',
            isRegistrationComplete: false
          },
          access_token: 'token123',
          refresh_token: 'refresh123',
          expires_at: 123456
        }
      });
    });

    it('should return 400 when email or password is missing', async () => {
      // Arrange
      mockRequest = { body: { email: 'test@example.com' } }; // Missing password

      // Act
      await controller.signIn(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Email and password are required' });
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      // Arrange
      mockAuthService.signOut.mockResolvedValue(true);

      // Act
      await controller.signOut(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockAuthService.signOut).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Signed out successfully' });
    });
  });

  describe('getMe', () => {
    it('should return user profile successfully', async () => {
      // Arrange
      const mockUser = { id: 'user123', email: 'test@example.com' };
      const mockUserProfile = {
        id: 'profile123',
        supabaseUserId: 'user123',
        name: 'John Doe',
        phone: '+1234567890',
        profileImage: null,
        role: 'CUSTOMER',
        isRegistrationComplete: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        customer: { id: 'customer123' }
      };

      mockRequest = {
        user: mockUser,
        headers: { authorization: 'Bearer token123' }
      };
      mockAuthService.getUser.mockResolvedValue(mockUser);
      mockPrisma.userProfile.findUnique.mockResolvedValue(mockUserProfile);

      // Act
      await controller.getMe(mockRequest as any, mockResponse as Response);

      // Assert
      expect(mockPrisma.userProfile.findUnique).toHaveBeenCalledWith({
        where: { supabaseUserId: 'user123' },
        include: {
          customer: true,
          serviceAdvisor: true,
          technician: true,
          inventoryManager: true,
          manager: true,
          admin: true
        }
      });
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          supabaseUserId: 'user123',
          email: 'test@example.com',
          name: 'John Doe',
          role: 'CUSTOMER'
        }),
        message: 'User profile retrieved successfully'
      });
    });

    it('should return 401 when user not authenticated', async () => {
      // Arrange
      mockRequest = { user: null };

      // Act
      await controller.getMe(mockRequest as any, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User not authenticated' });
    });
  });

  describe('completeOnboarding', () => {
    it('should complete onboarding successfully', async () => {
      // Arrange
      const mockUser = { id: 'user123', email: 'test@example.com', role: 'customer' };
      const onboardingData = { name: 'John Doe', contact: '+1234567890', profileImageUrl: null };

      mockRequest = {
        user: mockUser,
        body: onboardingData
      };

      mockPrisma.userProfile.upsert.mockResolvedValue({
        id: 'profile123',
        supabaseUserId: 'user123',
        name: 'John Doe',
        phone: '+1234567890',
        profileImage: null,
        role: 'CUSTOMER',
        isRegistrationComplete: true
      });

      mockPrisma.customer.upsert.mockResolvedValue({
        id: 'customer123',
        userProfileId: 'profile123',
        name: 'John Doe',
        email: 'test@example.com',
        phone: '+1234567890'
      });

      // Act
      await controller.completeOnboarding(mockRequest as any, mockResponse as Response);

      // Assert
      expect(mockPrisma.userProfile.upsert).toHaveBeenCalled();
      expect(mockPrisma.customer.upsert).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Onboarding completed successfully',
        user: expect.objectContaining({
          id: 'user123',
          email: 'test@example.com',
          role: 'customer',
          name: 'John Doe',
          contact: '+1234567890',
          isRegistrationComplete: true
        })
      });
    });

    it('should return 403 for non-customer users', async () => {
      // Arrange
      const mockUser = { id: 'user123', email: 'test@example.com', role: 'admin' };
      mockRequest = { user: mockUser, body: {} };

      // Act
      await controller.completeOnboarding(mockRequest as any, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Onboarding is only for customer users',
        message: 'Staff users are created complete by admins'
      });
    });
  });

  describe('requestPasswordReset', () => {
    it('should send password reset email successfully', async () => {
      // Arrange
      const email = 'test@example.com';
      mockRequest = { body: { email } };

      // Mock Supabase admin listUsers
      const mockSupabaseAdmin = {
        auth: {
          admin: {
            listUsers: jest.fn().mockResolvedValue({
              users: [{ email: 'test@example.com' }]
            })
          }
        }
      };

      // Mock the supabaseAdmin in controller (we'll need to access private property)
      (controller as any).supabaseAdmin = mockSupabaseAdmin;

      mockOtpService.storeOTP.mockReturnValue('123456');
      mockEmailService.sendEmail.mockResolvedValue(true);

      // Act
      await controller.requestPasswordReset(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockSupabaseAdmin.auth.admin.listUsers).toHaveBeenCalled();
      expect(mockOtpService.storeOTP).toHaveBeenCalledWith('test@example.com');
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Password reset code sent to your email',
        data: expect.objectContaining({
          email: 'test@example.com',
          expiresIn: 600
        })
      });
    });

    it('should return 404 for non-existent user', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      mockRequest = { body: { email } };

      const mockSupabaseAdmin = {
        auth: {
          admin: {
            listUsers: jest.fn().mockResolvedValue({
              users: [{ email: 'different@example.com' }]
            })
          }
        }
      };

      (controller as any).supabaseAdmin = mockSupabaseAdmin;

      // Act
      await controller.requestPasswordReset(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockSupabaseAdmin.auth.admin.listUsers).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      // Arrange
      const resetData = { email: 'test@example.com', otp: '123456', newPassword: 'newpass123' };
      mockRequest = { body: resetData };

      mockOtpService.verifyOTP.mockReturnValue({ valid: true, message: 'OTP verified' });

      const mockSupabaseAdmin = {
        auth: {
          admin: {
            listUsers: jest.fn().mockResolvedValue({
              users: [{ id: 'user123', email: 'test@example.com' }]
            }),
            updateUserById: jest.fn().mockResolvedValue({ user: { id: 'user123' } })
          }
        }
      };

      (controller as any).supabaseAdmin = mockSupabaseAdmin;

      // Act
      await controller.resetPassword(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockOtpService.verifyOTP).toHaveBeenCalledWith('test@example.com', '123456');
      expect(mockSupabaseAdmin.auth.admin.listUsers).toHaveBeenCalled();
      expect(mockSupabaseAdmin.auth.admin.updateUserById).toHaveBeenCalledWith('user123', {
        password: 'newpass123'
      });
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Password updated successfully',
        data: expect.objectContaining({
          userId: 'user123',
          email: 'test@example.com'
        })
      });
    });

    it('should return 400 for invalid OTP', async () => {
      // Arrange
      const resetData = { email: 'test@example.com', otp: 'wrong', newPassword: 'newpass123' };
      mockRequest = { body: resetData };

      mockOtpService.verifyOTP.mockReturnValue({ valid: false, message: 'Invalid OTP' });

      // Act
      await controller.resetPassword(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid OTP',
        data: expect.any(Object)
      });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      // Arrange
      const mockUser = { id: 'user123' };
      const changeData = { currentPassword: 'oldpass', newPassword: 'newpass123' };
      mockRequest = { user: mockUser, body: changeData };

      mockAuthService.changePassword.mockResolvedValue({ id: 'user123' });

      // Act
      await controller.changePassword(mockRequest as any, mockResponse as Response);

      // Assert
      expect(mockAuthService.changePassword).toHaveBeenCalledWith('oldpass', 'newpass123');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Password changed successfully',
        data: expect.objectContaining({
          userId: 'user123'
        })
      });
    });

    it('should return 400 when passwords are the same', async () => {
      // Arrange
      const mockUser = { id: 'user123' };
      const changeData = { currentPassword: 'samepass', newPassword: 'samepass' };
      mockRequest = { user: mockUser, body: changeData };

      // Act
      await controller.changePassword(mockRequest as any, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'New password must be different from current password'
      });
    });
  });

  describe('verifyOTP', () => {
    it('should verify OTP successfully', async () => {
      // Arrange
      const verifyData = { email: 'test@example.com', otp: '123456' };
      mockRequest = { body: verifyData };

      mockOtpService.checkOTP.mockReturnValue({ valid: true, message: 'OTP is valid' });

      // Act
      await controller.verifyOTP(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockOtpService.checkOTP).toHaveBeenCalledWith('test@example.com', '123456');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'OTP verified successfully',
        data: expect.objectContaining({
          email: 'test@example.com',
          verified: true
        })
      });
    });

    it('should return 400 for invalid OTP', async () => {
      // Arrange
      const verifyData = { email: 'test@example.com', otp: 'wrong' };
      mockRequest = { body: verifyData };

      mockOtpService.checkOTP.mockReturnValue({ valid: false, message: 'Invalid OTP' });

      // Act
      await controller.verifyOTP(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid OTP',
        data: expect.objectContaining({
          verified: false
        })
      });
    });
  });
});
