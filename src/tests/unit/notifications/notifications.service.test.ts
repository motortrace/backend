import { NotificationService } from '../../modules/notifications/notifications.service';
import { PrismaClient, WorkOrderStatus } from '@prisma/client';
import { NotificationEventType, NotificationChannel, NotificationPriority } from '../../modules/notifications/notifications.types';

// Mock nodemailer
const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });
const mockVerify = jest.fn().mockResolvedValue(true);

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: mockSendMail,
    verify: mockVerify,
  }),
}));

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

  describe('getPreferences', () => {
    it('should return default preferences', async () => {
      // Arrange
      const customerId = 'customer-123';

      // Act
      const result = await notificationService.getPreferences(customerId);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          customerId,
          emailEnabled: true,
          pushEnabled: false,
          workOrderStatusChanges: true,
          serviceApprovals: true,
          partApprovals: true,
          inspectionReports: true,
          paymentConfirmations: true,
          appointmentReminders: true,
          vehicleReadyAlerts: true,
          quietHoursEnabled: false,
        })
      );
    });
  });

  describe('updatePreferences', () => {
    it('should update customer notification preferences', async () => {
      // Arrange
      const customerId = 'customer-123';
      const updates = {
        emailEnabled: false,
        workOrderStatusChanges: false,
      };

      // Act
      const result = await notificationService.updatePreferences(customerId, updates);

      // Assert
      expect(result).toEqual(expect.objectContaining({
        customerId,
        emailEnabled: false,
        workOrderStatusChanges: false,
      }));
    });
  });

  describe('shouldSendNotification', () => {
    it('should return true for enabled notification types', async () => {
      // Arrange
      const customerId = 'customer-123';
      const eventType = NotificationEventType.WORK_ORDER_STATUS_CHANGED;

      // Act
      const result = await notificationService.shouldSendNotification(customerId, eventType);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if work order status changes are disabled', async () => {
      // Arrange
      const customerId = 'customer-123';
      const eventType = NotificationEventType.WORK_ORDER_STATUS_CHANGED;

      // Mock getPreferences to return disabled status
      jest.spyOn(notificationService, 'getPreferences').mockResolvedValueOnce({
        customerId,
        emailEnabled: true,
        pushEnabled: false,
        workOrderStatusChanges: false,
        serviceApprovals: true,
        partApprovals: true,
        inspectionReports: true,
        paymentConfirmations: true,
        appointmentReminders: true,
        vehicleReadyAlerts: true,
        quietHoursEnabled: false,
      });

      // Act
      const result = await notificationService.shouldSendNotification(customerId, eventType);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('verifyEmailConfig', () => {
    it('should verify email configuration successfully', async () => {
      // Act
      const result = await notificationService.verifyEmailConfig();

      // Assert
      expect(result).toBe(true);
      expect(mockVerify).toHaveBeenCalled();
    });

    it('should return false if verification fails', async () => {
      // Arrange
      mockVerify.mockRejectedValueOnce(new Error('Connection failed'));

      // Act
      const result = await notificationService.verifyEmailConfig();

      // Assert
      expect(result).toBe(false);
    });
  });
});
