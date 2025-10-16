import { otpService } from '../../../shared/utils/otp.helper';

// Create a new instance for testing
class TestOTPService extends (otpService as any).constructor {}

describe('OTPService', () => {
  let otpServiceInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    otpServiceInstance = new TestOTPService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('generateOTP', () => {
    it('should generate a 6-digit OTP', () => {
      // Act
      const otp = (otpService as any).generateOTP();

      // Assert
      expect(otp).toMatch(/^\d{6}$/);
      expect(otp.length).toBe(6);
    });

    it('should generate different OTPs on multiple calls', () => {
      // Act
      const otp1 = (otpService as any).generateOTP();
      const otp2 = (otpService as any).generateOTP();

      // Assert
      expect(otp1).not.toBe(otp2);
      expect(otp1).toMatch(/^\d{6}$/);
      expect(otp2).toMatch(/^\d{6}$/);
    });
  });

  describe('storeOTP', () => {
    it('should store OTP with correct data', () => {
      // Arrange
      const email = 'test@example.com';
      jest.spyOn(otpService as any, 'generateOTP').mockReturnValue('123456');

      // Act
      const result = otpService.storeOTP(email);

      // Assert
      expect(result).toBe('123456');
      expect((otpService as any).otpStorage.has(email.toLowerCase())).toBe(true);

      const storedData = (otpService as any).otpStorage.get(email.toLowerCase());
      expect(storedData.code).toBe('123456');
      expect(storedData.email).toBe(email.toLowerCase());
      expect(storedData.attempts).toBe(0);
      expect(storedData.createdAt).toBeInstanceOf(Date);
      expect(storedData.expiresAt).toBeInstanceOf(Date);
    });

    it('should set expiration time to 10 minutes from now', () => {
      // Arrange
      const email = 'test@example.com';
      const now = new Date('2024-01-01T10:00:00Z');
      jest.setSystemTime(now);

      // Act
      otpService.storeOTP(email);

      // Assert
      const storedData = (otpService as any).otpStorage.get(email.toLowerCase());
      const expectedExpiry = new Date(now.getTime() + 10 * 60 * 1000);
      expect(storedData.expiresAt).toEqual(expectedExpiry);
    });

    it('should clean up expired OTPs before storing new one', () => {
      // Arrange
      const expiredEmail = 'expired@example.com';
      const validEmail = 'valid@example.com';

      // Store an expired OTP
      const pastTime = new Date(Date.now() - 11 * 60 * 1000); // 11 minutes ago
      (otpService as any).otpStorage.set(expiredEmail.toLowerCase(), {
        code: '111111',
        email: expiredEmail.toLowerCase(),
        expiresAt: pastTime,
        attempts: 0,
        createdAt: pastTime
      });

      // Act
      otpService.storeOTP(validEmail);

      // Assert
      expect((otpService as any).otpStorage.has(expiredEmail.toLowerCase())).toBe(false);
      expect((otpService as any).otpStorage.has(validEmail.toLowerCase())).toBe(true);
    });
  });

  describe('checkOTP', () => {
    beforeEach(() => {
      // Store a test OTP
      (otpService as any).otpStorage.set('test@example.com', {
        code: '123456',
        email: 'test@example.com',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
        createdAt: new Date()
      });
    });

    it('should return valid result for correct OTP', () => {
      // Act
      const result = otpService.checkOTP('test@example.com', '123456');

      // Assert
      expect(result.valid).toBe(true);
      expect(result.message).toBe('OTP is valid');
    });

    it('should return invalid result for incorrect OTP', () => {
      // Act
      const result = otpService.checkOTP('test@example.com', 'wrong');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Invalid OTP');
      expect(result.message).toContain('2 attempts remaining');
    });

    it('should increment attempts on wrong OTP', () => {
      // Act
      otpService.checkOTP('test@example.com', 'wrong');

      // Assert
      const storedData = (otpService as any).otpStorage.get('test@example.com');
      expect(storedData.attempts).toBe(1);
    });

    it('should return invalid result for expired OTP', () => {
      // Arrange
      const expiredTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
      (otpService as any).otpStorage.set('expired@example.com', {
        code: '123456',
        email: 'expired@example.com',
        expiresAt: expiredTime,
        attempts: 0,
        createdAt: expiredTime
      });

      // Act
      const result = otpService.checkOTP('expired@example.com', '123456');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.message).toBe('OTP has expired. Please request a new one.');
      expect((otpService as any).otpStorage.has('expired@example.com')).toBe(false);
    });

    it('should return invalid result when max attempts exceeded', () => {
      // Arrange
      (otpService as any).otpStorage.set('blocked@example.com', {
        code: '123456',
        email: 'blocked@example.com',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 3, // Max attempts
        createdAt: new Date()
      });

      // Act
      const result = otpService.checkOTP('blocked@example.com', '123456');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Too many failed attempts. Please request a new OTP.');
      expect((otpService as any).otpStorage.has('blocked@example.com')).toBe(false);
    });

    it('should return invalid result for non-existent email', () => {
      // Act
      const result = otpService.checkOTP('nonexistent@example.com', '123456');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.message).toBe('No OTP found for this email');
    });

    it('should handle case-insensitive email matching', () => {
      // Act
      const result = otpService.checkOTP('TEST@EXAMPLE.COM', '123456');

      // Assert
      expect(result.valid).toBe(true);
      expect(result.message).toBe('OTP is valid');
    });
  });

  describe('verifyOTP', () => {
    beforeEach(() => {
      // Store a test OTP
      (otpService as any).otpStorage.set('test@example.com', {
        code: '123456',
        email: 'test@example.com',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
        createdAt: new Date()
      });
    });

    it('should return valid result and consume OTP for correct OTP', () => {
      // Act
      const result = otpService.verifyOTP('test@example.com', '123456');

      // Assert
      expect(result.valid).toBe(true);
      expect(result.message).toBe('OTP verified successfully');
      expect((otpService as any).otpStorage.has('test@example.com')).toBe(false);
    });

    it('should return invalid result for incorrect OTP', () => {
      // Act
      const result = otpService.verifyOTP('test@example.com', 'wrong');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Invalid OTP');
      expect(result.message).toContain('2 attempts remaining');
    });

    it('should increment attempts on wrong OTP', () => {
      // Act
      otpService.verifyOTP('test@example.com', 'wrong');

      // Assert
      const storedData = (otpService as any).otpStorage.get('test@example.com');
      expect(storedData.attempts).toBe(1);
    });

    it('should return invalid result for expired OTP', () => {
      // Arrange
      const expiredTime = new Date(Date.now() - 10 * 60 * 1000);
      (otpService as any).otpStorage.set('expired@example.com', {
        code: '123456',
        email: 'expired@example.com',
        expiresAt: expiredTime,
        attempts: 0,
        createdAt: expiredTime
      });

      // Act
      const result = otpService.verifyOTP('expired@example.com', '123456');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.message).toBe('OTP has expired. Please request a new one.');
      expect((otpService as any).otpStorage.has('expired@example.com')).toBe(false);
    });

    it('should return invalid result when max attempts exceeded', () => {
      // Arrange
      (otpService as any).otpStorage.set('blocked@example.com', {
        code: '123456',
        email: 'blocked@example.com',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 3,
        createdAt: new Date()
      });

      // Act
      const result = otpService.verifyOTP('blocked@example.com', '123456');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Too many failed attempts. Please request a new OTP.');
      expect((otpService as any).otpStorage.has('blocked@example.com')).toBe(false);
    });

    it('should return invalid result for non-existent email', () => {
      // Act
      const result = otpService.verifyOTP('nonexistent@example.com', '123456');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.message).toBe('No OTP found for this email');
    });
  });

  describe('getOTPData', () => {
    it('should return OTP data for existing email', () => {
      // Arrange
      const testData = {
        code: '123456',
        email: 'test@example.com',
        expiresAt: new Date(),
        attempts: 0,
        createdAt: new Date()
      };
      (otpService as any).otpStorage.set('test@example.com', testData);

      // Act
      const result = (otpService as any).getOTPData('test@example.com');

      // Assert
      expect(result).toEqual(testData);
    });

    it('should return null for non-existent email', () => {
      // Act
      const result = (otpService as any).getOTPData('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle case-insensitive email lookup', () => {
      // Arrange
      const testData = {
        code: '123456',
        email: 'test@example.com',
        expiresAt: new Date(),
        attempts: 0,
        createdAt: new Date()
      };
      (otpService as any).otpStorage.set('test@example.com', testData);

      // Act
      const result = (otpService as any).getOTPData('TEST@EXAMPLE.COM');

      // Assert
      expect(result).toEqual(testData);
    });
  });

  describe('isOTPValid', () => {
    it('should return true for valid OTP', () => {
      // Arrange
      (otpService as any).otpStorage.set('test@example.com', {
        code: '123456',
        email: 'test@example.com',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
        createdAt: new Date()
      });

      // Act
      const result = (otpService as any).isOTPValid('test@example.com');

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for expired OTP', () => {
      // Arrange
      (otpService as any).otpStorage.set('expired@example.com', {
        code: '123456',
        email: 'expired@example.com',
        expiresAt: new Date(Date.now() - 10 * 60 * 1000),
        attempts: 0,
        createdAt: new Date()
      });

      // Act
      const result = (otpService as any).isOTPValid('expired@example.com');

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for OTP with max attempts', () => {
      // Arrange
      (otpService as any).otpStorage.set('blocked@example.com', {
        code: '123456',
        email: 'blocked@example.com',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 3,
        createdAt: new Date()
      });

      // Act
      const result = (otpService as any).isOTPValid('blocked@example.com');

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for non-existent email', () => {
      // Act
      const result = (otpService as any).isOTPValid('nonexistent@example.com');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('cleanupExpiredOTPs', () => {
    it('should remove expired OTPs', () => {
      // Arrange
      const expiredEmail = 'expired@example.com';
      const validEmail = 'valid@example.com';

      const pastTime = new Date(Date.now() - 11 * 60 * 1000);
      const futureTime = new Date(Date.now() + 10 * 60 * 1000);

      (otpService as any).otpStorage.set(expiredEmail, {
        code: '111111',
        email: expiredEmail,
        expiresAt: pastTime,
        attempts: 0,
        createdAt: pastTime
      });

      (otpService as any).otpStorage.set(validEmail, {
        code: '222222',
        email: validEmail,
        expiresAt: futureTime,
        attempts: 0,
        createdAt: new Date()
      });

      // Act
      (otpService as any).cleanupExpiredOTPs();

      // Assert
      expect((otpService as any).otpStorage.has(expiredEmail)).toBe(false);
      expect((otpService as any).otpStorage.has(validEmail)).toBe(true);
    });
  });

  describe('getRemainingTime', () => {
    it('should return remaining time in seconds', () => {
      // Arrange
      const futureTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      (otpService as any).otpStorage.set('test@example.com', {
        code: '123456',
        email: 'test@example.com',
        expiresAt: futureTime,
        attempts: 0,
        createdAt: new Date()
      });

      // Act
      const result = otpService.getRemainingTime('test@example.com');

      // Assert
      expect(result).toBeGreaterThan(290); // Should be around 300 seconds (5 minutes)
      expect(result).toBeLessThan(310);
    });

    it('should return 0 for expired OTP', () => {
      // Arrange
      const pastTime = new Date(Date.now() - 10 * 60 * 1000);
      (otpService as any).otpStorage.set('expired@example.com', {
        code: '123456',
        email: 'expired@example.com',
        expiresAt: pastTime,
        attempts: 0,
        createdAt: pastTime
      });

      // Act
      const result = otpService.getRemainingTime('expired@example.com');

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 for non-existent email', () => {
      // Act
      const result = otpService.getRemainingTime('nonexistent@example.com');

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('getRemainingAttempts', () => {
    it('should return remaining attempts', () => {
      // Arrange
      (otpService as any).otpStorage.set('test@example.com', {
        code: '123456',
        email: 'test@example.com',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 1,
        createdAt: new Date()
      });

      // Act
      const result = otpService.getRemainingAttempts('test@example.com');

      // Assert
      expect(result).toBe(2); // 3 max - 1 used = 2 remaining
    });

    it('should return 0 for non-existent email', () => {
      // Act
      const result = otpService.getRemainingAttempts('nonexistent@example.com');

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 when max attempts reached', () => {
      // Arrange
      (otpService as any).otpStorage.set('blocked@example.com', {
        code: '123456',
        email: 'blocked@example.com',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 3,
        createdAt: new Date()
      });

      // Act
      const result = otpService.getRemainingAttempts('blocked@example.com');

      // Assert
      expect(result).toBe(0);
    });
  });
});