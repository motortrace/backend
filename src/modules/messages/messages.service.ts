import { PrismaClient } from '@prisma/client';
import { IMessageService, ICreateMessageRequest, IMessageQuery, IMessage } from './messages.types';
import { MessageType, MessageStatus } from './messages.types';

const prisma = new PrismaClient();

export class MessageService implements IMessageService {
  async createMessage(userId: string, data: ICreateMessageRequest): Promise<IMessage> {
    // Get user profile and role
    const userProfile = await prisma.userProfile.findUnique({
      where: { supabaseUserId: userId }
    });

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Verify user has access to this work order
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: data.workOrderId },
      include: {
        customer: {
          include: { userProfile: true }
        },
        serviceAdvisor: true
      }
    });

    if (!workOrder) {
      throw new Error('Work order not found');
    }

    // Check permissions: customer, advisor, or technician
    // TEMPORARILY DISABLED FOR TESTING
    // const isCustomer = workOrder.customer.userProfileId === userProfile.id;
    // const isAdvisor = workOrder.advisorId === userProfile.id;
    // const isTechnician = await prisma.technician.findFirst({
    //   where: {
    //     userProfileId: userProfile.id,
    //     inspections: {
    //       some: { workOrderId: data.workOrderId }
    //     }
    //   }
    // });

    // if (!isCustomer && !isAdvisor && !isTechnician) {
    //   throw new Error('Unauthorized to send messages for this work order');
    // }

    // Create message with attachments
    const message = await prisma.workOrderMessage.create({
      data: {
        workOrderId: data.workOrderId,
        senderId: userProfile.id,
        senderRole: userProfile.role,
        message: data.message,
        messageType: data.messageType || MessageType.TEXT,
        status: MessageStatus.SENT,
        attachments: data.attachments ? {
          create: data.attachments
        } : undefined
      },
      include: {
        attachments: true,
        sender: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    });

    return this.mapToIMessage(message);
  }

  async getMessages(query: IMessageQuery): Promise<IMessage[]> {
    const messages = await prisma.workOrderMessage.findMany({
      where: {
        workOrderId: query.workOrderId,
        ...(query.includeRead === false && { isRead: false })
      },
      include: {
        attachments: true,
        sender: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      take: query.limit || 50,
      skip: query.offset || 0
    });

    return messages.map(this.mapToIMessage);
  }

  async getMessageById(messageId: string): Promise<IMessage | null> {
    const message = await prisma.workOrderMessage.findUnique({
      where: { id: messageId },
      include: {
        attachments: true,
        sender: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    });

    return message ? this.mapToIMessage(message) : null;
  }

  async markAsRead(userId: string, messageIds: string[]): Promise<void> {
    // Get user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { supabaseUserId: userId }
    });

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Update messages as read (only if user is not the sender)
    await prisma.workOrderMessage.updateMany({
      where: {
        id: { in: messageIds },
        senderId: { not: userProfile.id }, // Don't mark own messages as read
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  async deleteMessage(userId: string, messageId: string): Promise<void> {
    // Get user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { supabaseUserId: userId }
    });

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Find message and check ownership
    const message = await prisma.workOrderMessage.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.senderId !== userProfile.id) {
      throw new Error('Can only delete your own messages');
    }

    // Delete message (attachments will be cascade deleted)
    await prisma.workOrderMessage.delete({
      where: { id: messageId }
    });
  }

  private mapToIMessage(message: any): IMessage {
    return {
      id: message.id,
      workOrderId: message.workOrderId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      message: message.message,
      messageType: message.messageType,
      status: message.status,
      isRead: message.isRead,
      readAt: message.readAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      attachments: message.attachments,
      sender: message.sender
    };
  }
}