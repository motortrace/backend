import nodemailer, { Transporter } from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import {
  INotificationService,
  NotificationPayload,
  EmailTemplateData,
  NotificationPreferences,
  NotificationHistory,
  NotificationEventType,
  NotificationChannel,
} from './notifications.types';
import { EmailTemplates } from './email-templates';

export class NotificationService implements INotificationService {
  private emailTransporter: Transporter;
  private prisma: PrismaClient;
  private emailTemplates: EmailTemplates;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.emailTemplates = new EmailTemplates();
    
    // Configure nodemailer
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Main method to send notifications through appropriate channels
   */
  async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      const { recipient, eventType, data, channels, priority } = payload;

      // Check if customer has opted in for this notification type
      if (recipient.customerId) {
        const shouldSend = await this.shouldSendNotification(
          recipient.customerId,
          eventType
        );
        if (!shouldSend) {
          console.log(
            `[Notification] Skipped ${eventType} for customer ${recipient.customerId} (preferences)`
          );
          return;
        }
      }

      // Determine which channels to use
      const activeChannels = channels || [NotificationChannel.EMAIL];

      // Send through each channel
      for (const channel of activeChannels) {
        try {
          switch (channel) {
            case NotificationChannel.EMAIL:
              if (recipient.email) {
                await this.sendEmailNotification(payload);
              }
              break;
            case NotificationChannel.PUSH:
              // Implement push notifications here (e.g., Firebase FCM)
              console.log('[Notification] Push notifications not yet implemented');
              break;
            case NotificationChannel.IN_APP:
              // Supabase Realtime handles this automatically via RLS
              console.log('[Notification] In-app via Supabase Realtime');
              break;
          }
        } catch (channelError) {
          console.error(`[Notification] Failed to send via ${channel}:`, channelError);
          // Continue with other channels even if one fails
        }
      }
    } catch (error) {
      console.error('[Notification] Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(payload: NotificationPayload): Promise<void> {
    const { recipient, eventType, data } = payload;

    if (!recipient.email) {
      throw new Error('No email address provided for recipient');
    }

    // Generate email template based on event type
    const templateData = this.emailTemplates.getTemplate(eventType, data);

    await this.sendEmail(recipient.email, templateData);

    // Log to history
    await this.logNotification({
      customerId: recipient.customerId!,
      eventType,
      channel: NotificationChannel.EMAIL,
      status: 'SENT',
      recipient: recipient.email,
      subject: templateData.subject,
      sentAt: new Date(),
    });
  }

  /**
   * Send email using nodemailer
   */
  async sendEmail(recipient: string, templateData: EmailTemplateData): Promise<void> {
    try {
      const htmlContent = this.emailTemplates.renderHTML(templateData);

      await this.emailTransporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'MotorTrace'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: recipient,
        subject: templateData.subject,
        html: htmlContent,
      });

      console.log(`[Email] Sent to ${recipient}: ${templateData.subject}`);
    } catch (error) {
      console.error('[Email] Failed to send:', error);
      throw error;
    }
  }

  /**
   * Get customer notification preferences
   */
  async getPreferences(customerId: string): Promise<NotificationPreferences | null> {
    // TODO: Fetch from database once NotificationPreferences table is created
    // For now, return default preferences
    return {
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
    };
  }

  /**
   * Update customer notification preferences
   */
  async updatePreferences(
    customerId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    // TODO: Implement database update once NotificationPreferences table is created
    console.log(`[Preferences] Updated for customer ${customerId}:`, preferences);
    
    const currentPreferences = await this.getPreferences(customerId);
    return { ...currentPreferences!, ...preferences };
  }

  /**
   * Get notification history for a customer
   */
  async getHistory(customerId: string, limit: number = 50): Promise<NotificationHistory[]> {
    // TODO: Implement database query once NotificationHistory table is created
    console.log(`[History] Fetching for customer ${customerId}, limit: ${limit}`);
    return [];
  }

  /**
   * Check if notification should be sent based on preferences
   */
  async shouldSendNotification(
    customerId: string,
    eventType: NotificationEventType
  ): Promise<boolean> {
    const preferences = await this.getPreferences(customerId);

    if (!preferences) {
      return true; // Send by default if no preferences found
    }

    // Check if notifications are globally disabled
    if (!preferences.emailEnabled && !preferences.pushEnabled) {
      return false;
    }

    // Check event-specific preferences
    switch (eventType) {
      case NotificationEventType.WORK_ORDER_STATUS_CHANGED:
      case NotificationEventType.WORK_ORDER_COMPLETED:
        return preferences.workOrderStatusChanges;

      case NotificationEventType.SERVICE_APPROVAL_REQUIRED:
      case NotificationEventType.SERVICE_APPROVED:
      case NotificationEventType.SERVICE_REJECTED:
        return preferences.serviceApprovals;

      case NotificationEventType.PART_APPROVAL_REQUIRED:
      case NotificationEventType.PART_APPROVED:
      case NotificationEventType.PART_REJECTED:
        return preferences.partApprovals;

      case NotificationEventType.INSPECTION_COMPLETED:
      case NotificationEventType.INSPECTION_ISSUE_FOUND:
        return preferences.inspectionReports;

      case NotificationEventType.PAYMENT_RECEIVED:
      case NotificationEventType.INVOICE_GENERATED:
        return preferences.paymentConfirmations;

      case NotificationEventType.APPOINTMENT_REMINDER:
      case NotificationEventType.APPOINTMENT_CONFIRMED:
        return preferences.appointmentReminders;

      case NotificationEventType.VEHICLE_READY_FOR_PICKUP:
        return preferences.vehicleReadyAlerts;

      default:
        return true; // Send by default for other events
    }
  }

  /**
   * Check if current time is within quiet hours
   */
  private isQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quietHoursEnabled || !preferences.quietHoursStart || !preferences.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = preferences.quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = preferences.quietHoursEnd.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  /**
   * Log notification to history
   */
  private async logNotification(historyData: Omit<NotificationHistory, 'id'>): Promise<void> {
    // TODO: Implement database insert once NotificationHistory table is created
    console.log('[History] Logged notification:', historyData);
  }

  /**
   * Verify email configuration
   */
  async verifyEmailConfig(): Promise<boolean> {
    try {
      await this.emailTransporter.verify();
      console.log('[Email] Configuration verified successfully');
      return true;
    } catch (error) {
      console.error('[Email] Configuration verification failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export let notificationService: NotificationService;

export function initializeNotificationService(prisma: PrismaClient): NotificationService {
  notificationService = new NotificationService(prisma);
  return notificationService;
}
