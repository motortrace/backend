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

export class NotificationService {
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
   * Get notifications for a user
   */
  async getNotifications(userId: string, limit?: number): Promise<any[]> {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: {
          userProfileId: userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await this.prisma.notification.count({
        where: {
          userProfileId: userId,
          isRead: false,
        },
      });

      return count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await this.prisma.notification.updateMany({
        where: {
          id: notificationId,
          userProfileId: userId,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await this.prisma.notification.updateMany({
        where: {
          userProfileId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      await this.prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userProfileId: userId,
        },
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences for a user
   */
  async getPreferences(userId: string): Promise<any | null> {
    try {
      // For now, return default preferences
      // In a real implementation, you'd have a NotificationPreferences table
      return {
        userProfileId: userId,
        emailEnabled: true,
        pushEnabled: true,
        workOrderStatusChanges: true,
        serviceApprovals: true,
        partApprovals: true,
        inspectionReports: true,
        paymentConfirmations: true,
        appointmentReminders: true,
        vehicleReadyAlerts: true,
        quietHoursEnabled: false,
      };
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences for a user
   */
  async updatePreferences(userId: string, preferences: any): Promise<any> {
    try {
      // For now, just return the preferences
      // In a real implementation, you'd save to a NotificationPreferences table
      return {
        userProfileId: userId,
        ...preferences,
      };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  /**
   * Main method to send notifications through appropriate channels
   */
  async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      const { recipient, eventType, data, channels, priority } = payload;



      // Determine which channels to use
      const activeChannels = channels || [NotificationChannel.EMAIL];

      // Track which channels were used
      let sentViaEmail = false;
      let sentViaPush = false;

      // Send through each channel
      for (const channel of activeChannels) {
        try {
          switch (channel) {
            case NotificationChannel.EMAIL:
              if (recipient.email) {
                await this.sendEmailNotification(payload);
                sentViaEmail = true;
              }
              break;
            case NotificationChannel.PUSH:
              // Implement push notifications here (e.g., Firebase FCM)
              console.log('[Notification] Push notifications not yet implemented');
              sentViaPush = false; // Will be true when implemented
              break;
            case NotificationChannel.IN_APP:
              // Create in-app notification record
              if (recipient.userProfileId) {
                await this.createInAppNotification(payload, sentViaEmail, sentViaPush);
                console.log('[Notification] In-app notification created');
              }
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
   * Create in-app notification record in database
   */
  private async createInAppNotification(
    payload: NotificationPayload,
    sentViaEmail: boolean = false,
    sentViaPush: boolean = false
  ): Promise<void> {
    const { recipient, eventType, data, priority } = payload;

    if (!recipient.userProfileId) {
      console.warn('[Notification] Cannot create in-app notification without userProfileId');
      return;
    }

    // Generate notification title and message
    const templateData = this.emailTemplates.getTemplate(eventType, data);
    
    // Extract workOrderId from data if available
    const workOrderId = (data as any).workOrderId || null;

    try {
      await this.prisma.notification.create({
        data: {
          userProfileId: recipient.userProfileId,
          workOrderId: workOrderId,
          type: eventType as any,
          title: templateData.subject,
          message: this.stripHtmlTags(templateData.body),
          priority: priority || 'NORMAL',
          sentViaEmail: sentViaEmail,
          sentViaPush: sentViaPush,
          isRead: false,
          actionUrl: templateData.actionUrl || null,
          actionText: templateData.actionText || null,
        },
      });

      console.log(`[Notification] In-app notification created for user ${recipient.userProfileId}`);
    } catch (error) {
      console.error('[Notification] Failed to create in-app notification:', error);
      throw error;
    }
  }

  /**
   * Helper to strip HTML tags from text
   */
  private stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
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

}

// Export singleton instance
export let notificationService: NotificationService;

export function initializeNotificationService(prisma: PrismaClient): NotificationService {
  notificationService = new NotificationService(prisma);
  return notificationService;
}
