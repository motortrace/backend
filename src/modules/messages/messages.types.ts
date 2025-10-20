import { UserRole } from '@prisma/client';

// Define enums locally since they might not be generated yet
export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM'
}

export enum MessageStatus {
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED'
}

export interface IMessage {
  id: string;
  workOrderId: string;
  senderId: string;
  senderRole: UserRole;
  message: string;
  messageType: MessageType;
  status: MessageStatus;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  attachments?: IMessageAttachment[];
  sender?: {
    id: string;
    name?: string;
    profileImage?: string;
  };
}

export interface IMessageAttachment {
  id: string;
  messageId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface ICreateMessageRequest {
  workOrderId: string;
  message: string;
  messageType?: MessageType;
  attachments?: ICreateAttachmentRequest[];
}

export interface ICreateAttachmentRequest {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface IMessageQuery {
  workOrderId: string;
  limit?: number;
  offset?: number;
  includeRead?: boolean;
}

export interface IMarkAsReadRequest {
  messageIds: string[];
}

export interface IMessageService {
  createMessage(userId: string, data: ICreateMessageRequest): Promise<IMessage>;
  getMessages(query: IMessageQuery): Promise<IMessage[]>;
  getMessageById(messageId: string): Promise<IMessage | null>;
  markAsRead(userId: string, messageIds: string[]): Promise<void>;
  deleteMessage(userId: string, messageId: string): Promise<void>;
}