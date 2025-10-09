import { NotificationService } from '../../../modules/notifications/notifications.service';
import { PrismaClient, WorkOrderStatus } from '@prisma/client';
import { NotificationEventType, NotificationChannel, NotificationPriority } from '../../../modules/notifications/notifications.types';

// Mock nodemailer - must be defined before jest.mock
jest.mock('nodemailer', () => {
  const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });
  const mockVerify = jest.fn().mockResolvedValue(true);
  
  return {
    createTransport: jest.fn().mockReturnValue({
      sendMail: mockSendMail,
      verify: mockVerify,
    }),
  };
});

// Get the mocked functions for use in tests
const nodemailer = require('nodemailer');
const mockTransport = nodemailer.createTransport();
const mockSendMail = mockTransport.sendMail;
const mockVerify = mockTransport.verify;

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mockPrisma: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockSendMail.mockClear();
    mockVerify.mockClear();

    // Create mock Prisma client with proper typing
    mockPrisma = {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    };

    notificationService = new NotificationService(mockPrisma as PrismaClient);
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      // Arrange
      const recipient = 'test@example.com';
      const templateData = {
        subject: 'Test Email',
        heading: 'Test Notification',
        body: '<p>This is a test email</p>',
      };

      // Act
      await notificationService.sendEmail(recipient, templateData);

      // Assert
      expect(mockSendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to: recipient,
        subject: templateData.subject,
        html: expect.any(String),
      });
    });

    it('should throw error if email sending fails', async () => {
      // Arrange
      const recipient = 'test@example.com';
      const templateData = {
        subject: 'Test Email',
        heading: 'Test Notification',
        body: '<p>This is a test email</p>',
      };

      mockSendMail.mockRejectedValueOnce(new Error('SMTP error'));

      // Act & Assert
      await expect(
        notificationService.sendEmail(recipient, templateData)
      ).rejects.toThrow('SMTP error');
    });
  });
});
