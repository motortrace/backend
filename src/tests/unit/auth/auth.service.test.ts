import { AuthSupabaseService } from '../../../modules/auth/supabase/authSupabase.service';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      getUser: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUserToken: jest.fn(),
      admin: {
        updateUserById: jest.fn(),
        deleteUser: jest.fn(),
        listUsers: jest.fn()
      },
      signInWithIdToken: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      refreshSession: jest.fn()
    },
    from: jest.fn().mockReturnValue({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn()
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn()
      })
    })
  })
}));

describe('AuthSupabaseService', () => {
  let service: AuthSupabaseService;
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-anon-key';

    // Create service instance
    service = new AuthSupabaseService();

    // Get the mocked supabase client
    const { createClient } = require('@supabase/supabase-js');
    mockSupabase = createClient();
  });

  describe('constructor', () => {
    it('should throw error when SUPABASE_URL is missing', () => {
      delete process.env.SUPABASE_URL;
      process.env.SUPABASE_ANON_KEY = 'test-key';

      expect(() => new AuthSupabaseService()).toThrow('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables');
    });

    it('should throw error when SUPABASE_ANON_KEY is missing', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      delete process.env.SUPABASE_ANON_KEY;

      expect(() => new AuthSupabaseService()).toThrow('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables');
    });
  });

  describe('signUp', () => {
    it('should sign up user successfully', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const role = 'customer';
      const mockUser = { id: 'user123', email };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Act
      const result = await service.signUp(email, password, role);

      // Assert
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email,
        password,
        options: {
          data: {
            role: 'customer'
          }
        }
      });
      expect(result).toEqual(mockUser);
    });

    it('should use default role when not provided', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser = { id: 'user123', email };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Act
      const result = await service.signUp(email, password);

      // Assert
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email,
        password,
        options: {
          data: {
            role: 'customer'
          }
        }
      });
    });

    it('should throw error when signup fails', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const errorMessage = 'Email already registered';

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: errorMessage }
      });

      // Act & Assert
      await expect(service.signUp(email, password)).rejects.toThrow(errorMessage);
    });
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser = { id: 'user123', email };
      const mockSession = { access_token: 'token123', refresh_token: 'refresh123' };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      // Act
      const result = await service.signIn(email, password);

      // Assert
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({ email, password });
      expect(result).toEqual({
        user: mockUser,
        session: mockSession
      });
    });

    it('should throw error when signin fails', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const errorMessage = 'Invalid login credentials';

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: errorMessage }
      });

      // Act & Assert
      await expect(service.signIn(email, password)).rejects.toThrow(errorMessage);
    });
  });

  describe('getUser', () => {
    it('should get user successfully', async () => {
      // Arrange
      const token = 'jwt-token-123';
      const mockUser = { id: 'user123', email: 'test@example.com' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Act
      const result = await service.getUser(token);

      // Assert
      expect(mockSupabase.auth.getUser).toHaveBeenCalledWith(token);
      expect(result).toEqual(mockUser);
    });

    it('should throw error when getUser fails', async () => {
      // Arrange
      const token = 'invalid-token';
      const errorMessage = 'Invalid JWT';

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: errorMessage }
      });

      // Act & Assert
      await expect(service.getUser(token)).rejects.toThrow(errorMessage);
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      // Arrange
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      });

      // Act
      const result = await service.signOut();

      // Assert
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw error when signOut fails', async () => {
      // Arrange
      const errorMessage = 'Sign out failed';

      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: errorMessage }
      });

      // Act & Assert
      await expect(service.signOut()).rejects.toThrow(errorMessage);
    });
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      // Arrange
      const token = 'valid-token';
      const mockUser = { id: 'user123', email: 'test@example.com' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Act
      const result = await service.validateToken(token);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should refresh token when JWT expired', async () => {
      // Arrange
      const token = 'expired-token';
      const mockUser = { id: 'user123', email: 'test@example.com' };
      const jwtError = { message: 'JWT expired' };

      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: jwtError
      });

      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Act
      const result = await service.validateToken(token);

      // Assert
      expect(mockSupabase.auth.refreshSession).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw error when token refresh fails', async () => {
      // Arrange
      const token = 'expired-token';
      const jwtError = { message: 'JWT expired' };
      const refreshError = { message: 'Refresh failed' };

      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: jwtError
      });

      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { user: null },
        error: refreshError
      });

      // Act & Assert
      await expect(service.validateToken(token)).rejects.toThrow('Token is invalid and cannot be refreshed');
    });
  });

  describe('getSession', () => {
    it('should get session successfully', async () => {
      // Arrange
      const mockSession = { access_token: 'token123', user: { id: 'user123' } };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      // Act
      const result = await service.getSession();

      // Assert
      expect(result).toEqual(mockSession);
    });

    it('should throw error when getSession fails', async () => {
      // Arrange
      const errorMessage = 'No session found';

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: errorMessage }
      });

      // Act & Assert
      await expect(service.getSession()).rejects.toThrow(errorMessage);
    });
  });

  describe('getAccessToken', () => {
    it('should return access token when session exists', async () => {
      // Arrange
      const mockSession = { access_token: 'token123' };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      // Act
      const result = await service.getAccessToken();

      // Assert
      expect(result).toBe('token123');
    });

    it('should return undefined when no session', async () => {
      // Arrange
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      // Act
      const result = await service.getAccessToken();

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      // Arrange
      const userId = 'user123';
      const role = 'admin';
      const mockUser = { id: userId, user_metadata: { role } };

      mockSupabase.auth.admin.updateUserById.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Act
      const result = await service.updateUserRole(userId, role);

      // Assert
      expect(mockSupabase.auth.admin.updateUserById).toHaveBeenCalledWith(userId, {
        user_metadata: { role }
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error when updateUserRole fails', async () => {
      // Arrange
      const userId = 'user123';
      const role = 'admin';
      const errorMessage = 'User not found';

      mockSupabase.auth.admin.updateUserById.mockResolvedValue({
        data: { user: null },
        error: { message: errorMessage }
      });

      // Act & Assert
      await expect(service.updateUserRole(userId, role)).rejects.toThrow(errorMessage);
    });
  });

  describe('googleSignIn', () => {
    it('should sign in with Google successfully', async () => {
      // Arrange
      const idToken = 'google-id-token';
      const role = 'customer';
      const mockUser = { id: 'user123', email: 'test@example.com' };
      const mockSession = { access_token: 'token123' };

      mockSupabase.auth.signInWithIdToken.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      // Act
      const result = await service.googleSignIn(idToken, role);

      // Assert
      expect(mockSupabase.auth.signInWithIdToken).toHaveBeenCalledWith({
        provider: 'google',
        token: idToken
      });
      expect(result).toEqual({
        user: mockUser,
        session: mockSession
      });
    });

    it('should update user role after Google sign in', async () => {
      // Arrange
      const idToken = 'google-id-token';
      const role = 'customer';
      const mockUser = { id: 'user123', email: 'test@example.com' };
      const mockSession = { access_token: 'token123' };

      mockSupabase.auth.signInWithIdToken.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      mockSupabase.auth.admin.updateUserById.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Act
      await service.googleSignIn(idToken, role);

      // Assert
      expect(mockSupabase.auth.admin.updateUserById).toHaveBeenCalledWith('user123', {
        user_metadata: { role: 'customer' }
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const userId = 'user123';
      const mockData = { user: { id: userId } };

      mockSupabase.auth.admin.deleteUser.mockResolvedValue({
        data: mockData,
        error: null
      });

      // Act
      const result = await service.deleteUser(userId);

      // Assert
      expect(mockSupabase.auth.admin.deleteUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockData);
    });

    it('should throw error when deleteUser fails', async () => {
      // Arrange
      const userId = 'user123';
      const errorMessage = 'User not found';

      mockSupabase.auth.admin.deleteUser.mockResolvedValue({
        data: null,
        error: { message: errorMessage }
      });

      // Act & Assert
      await expect(service.deleteUser(userId)).rejects.toThrow(errorMessage);
    });
  });

  describe('deleteUserData', () => {
    it('should delete user data successfully', async () => {
      // Arrange
      const userId = 'user123';
      const tableName = 'profiles';
      const mockData = [{ id: 'profile123' }];

      const mockFrom = mockSupabase.from(tableName);
      mockFrom.delete().eq.mockResolvedValue({
        data: mockData,
        error: null
      });

      // Act
      const result = await service.deleteUserData(userId, tableName);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith(tableName);
      expect(mockFrom.delete).toHaveBeenCalled();
      expect(mockFrom.delete().eq).toHaveBeenCalledWith('user_id', userId);
      expect(result).toEqual(mockData);
    });

    it('should throw error when deleteUserData fails', async () => {
      // Arrange
      const userId = 'user123';
      const tableName = 'profiles';
      const errorMessage = 'Delete failed';

      const mockFrom = mockSupabase.from(tableName);
      mockFrom.delete().eq.mockResolvedValue({
        data: null,
        error: { message: errorMessage }
      });

      // Act & Assert
      await expect(service.deleteUserData(userId, tableName)).rejects.toThrow(errorMessage);
    });
  });

  describe('softDeleteUser', () => {
    it('should soft delete user successfully', async () => {
      // Arrange
      const userId = 'user123';
      const tableName = 'profiles';
      const mockData = [{ id: 'profile123' }];

      const mockFrom = mockSupabase.from(tableName);
      mockFrom.update().eq.mockResolvedValue({
        data: mockData,
        error: null
      });

      // Act
      const result = await service.softDeleteUser(userId, tableName);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith(tableName);
      expect(mockFrom.update).toHaveBeenCalledWith({
        is_deleted: true,
        deleted_at: expect.any(String)
      });
      expect(result).toEqual(mockData);
    });
  });

  describe('completeUserDeletion', () => {
    it('should complete user deletion successfully', async () => {
      // Arrange
      const userId = 'user123';
      const relatedTables = ['profiles', 'settings'];

      // Mock deleteUserData calls
      const mockFrom1 = mockSupabase.from('profiles');
      mockFrom1.delete().eq.mockResolvedValue({ data: [], error: null });

      const mockFrom2 = mockSupabase.from('settings');
      mockFrom2.delete().eq.mockResolvedValue({ data: [], error: null });

      mockSupabase.auth.admin.deleteUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null
      });

      // Act
      const result = await service.completeUserDeletion(userId, relatedTables);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'User completely deleted'
      });
    });

    it('should throw error when deletion fails', async () => {
      // Arrange
      const userId = 'user123';
      const relatedTables = ['profiles'];
      const errorMessage = 'Delete failed';

      const mockFrom = mockSupabase.from('profiles');
      mockFrom.delete().eq.mockResolvedValue({
        data: null,
        error: { message: errorMessage }
      });

      // Act & Assert
      await expect(service.completeUserDeletion(userId, relatedTables)).rejects.toThrow(`Failed to delete user: ${errorMessage}`);
    });
  });

  describe('resetPassword', () => {
    it('should send reset password email successfully', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockData = { user: null, session: null };

      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: mockData,
        error: null
      });

      // Act
      const result = await service.resetPassword(email);

      // Assert
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(email, {
        redirectTo: expect.stringContaining('/reset-password')
      });
      expect(result).toEqual(mockData);
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      // Arrange
      const token = 'reset-token';
      const newPassword = 'newpassword123';
      const mockUser = { id: 'user123' };

      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Act
      const result = await service.updatePassword(token, newPassword);

      // Assert
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: newPassword
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      // Arrange
      const currentPassword = 'oldpass';
      const newPassword = 'newpass';
      const mockUser = { id: 'user123' };

      // Mock sign in with current password
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null
      });

      // Mock password update
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Act
      const result = await service.changePassword(currentPassword, newPassword);

      // Assert
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: '',
        password: currentPassword
      });
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: newPassword
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error when current password is wrong', async () => {
      // Arrange
      const currentPassword = 'wrongpass';
      const newPassword = 'newpass';

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' }
      });

      // Act & Assert
      await expect(service.changePassword(currentPassword, newPassword)).rejects.toThrow('Current password is incorrect');
    });
  });

  describe('verifyResetToken', () => {
    it('should verify reset token successfully', async () => {
      // Arrange
      const token = 'reset-token';
      const mockUser = { id: 'user123', email: 'test@example.com' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Act
      const result = await service.verifyResetToken(token);

      // Assert
      expect(mockSupabase.auth.getUser).toHaveBeenCalledWith(token);
      expect(result).toEqual(mockUser);
    });
  });
});