import { EmailService } from '../../../shared/utils/email.helper';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn()
  })
}));

describe('EmailService', () => {
  let emailService: EmailService;
  let mockTransporter: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock environment variables
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_SECURE = 'false';
    process.env.SMTP_USER = 'test@example.com';
    process.env.SMTP_PASS = 'testpass';

    // Create service instance
    emailService = new EmailService();

    // Get the mocked transporter
    const nodemailer = require('nodemailer');
    mockTransporter = nodemailer.createTransport();
  });

  describe('constructor', () => {
    it('should create transporter with correct configuration', () => {
      const nodemailer = require('nodemailer');

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'testpass'
        }
      });
    });

    it('should use default values when environment variables are not set', () => {
      // Clear environment variables
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_PORT;
      delete process.env.SMTP_SECURE;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;

      const nodemailer = require('nodemailer');
      jest.clearAllMocks();

      new EmailService();

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: '',
          pass: ''
        }
      });
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      // Arrange
      const emailOptions = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML content</p>',
        text: 'Test text content'
      };

      const mockResult = { messageId: 'test-message-id' };
      mockTransporter.sendMail.mockResolvedValue(mockResult);

      // Act
      const result = await emailService.sendEmail(emailOptions);

      // Assert
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"MotorTrace" <test@example.com>',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML content</p>',
        text: 'Test text content'
      });
      expect(result).toBe(true);
    });

    it('should send email without text content', async () => {
      // Arrange
      const emailOptions = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML content</p>'
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      // Act
      const result = await emailService.sendEmail(emailOptions);

      // Assert
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"MotorTrace" <test@example.com>',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML content</p>',
        text: undefined
      });
      expect(result).toBe(true);
    });

    it('should throw error when email sending fails', async () => {
      // Arrange
      const emailOptions = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML content</p>'
      };

      const mockError = new Error('SMTP connection failed');
      mockTransporter.sendMail.mockRejectedValue(mockError);

      // Act & Assert
      await expect(emailService.sendEmail(emailOptions)).rejects.toThrow('Failed to send email');
    });
  });

  describe('generatePasswordResetEmail', () => {
    it('should generate password reset email HTML', () => {
      // Arrange
      const otp = '123456';
      const email = 'user@example.com';

      // Act
      const result = emailService.generatePasswordResetEmail(otp, email);

      // Assert
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('Password Reset Request');
      expect(result).toContain('123456');
      expect(result).toContain('user@example.com');
      expect(result).toContain('MotorTrace');
      expect(result).toContain('10 minutes');
      expect(result).toContain('MT'); // Logo text
    });

    it('should include all required sections in email', () => {
      // Arrange
      const otp = '789012';
      const email = 'test@example.com';

      // Act
      const result = emailService.generatePasswordResetEmail(otp, email);

      // Assert
      expect(result).toContain('Your verification code is:');
      expect(result).toContain('789012');
      expect(result).toContain('How to use this code:');
      expect(result).toContain('Open the MotorTrace app');
      expect(result).toContain('Security Notice');
      expect(result).toContain('© 2024 MotorTrace');
    });
  });

  describe('generatePasswordResetText', () => {
    it('should generate password reset text email', () => {
      // Arrange
      const otp = '654321';
      const email = 'user@example.com';

      // Act
      const result = emailService.generatePasswordResetText(otp, email);

      // Assert
      expect(result).toContain('MotorTrace - Password Reset Request');
      expect(result).toContain('654321');
      expect(result).toContain('user@example.com');
      expect(result).toContain('10 minutes');
      expect(result).toContain('© 2024 MotorTrace');
    });

    it('should include all required information in text format', () => {
      // Arrange
      const otp = '111111';
      const email = 'test@example.com';

      // Act
      const result = emailService.generatePasswordResetText(otp, email);

      // Assert
      expect(result).toContain('Hello,');
      expect(result).toContain('Your verification code is: 111111');
      expect(result).toContain('This code will expire in 10 minutes');
      expect(result).toContain('If you didn\'t request this password reset');
      expect(result).toContain('MotorTrace');
    });
  });
});