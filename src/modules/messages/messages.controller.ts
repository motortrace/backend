import { Request, Response } from 'express';
import { MessageService } from './messages.service';
import { ICreateMessageRequest, IMessageQuery, IMarkAsReadRequest } from './messages.types';

const messageService = new MessageService();

export class MessageController {
  async createMessage(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data: ICreateMessageRequest = req.body;
      const message = await messageService.createMessage(userId, data);

      res.status(201).json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('Create message error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create message'
      });
    }
  }

  async getMessages(req: Request, res: Response) {
    try {
      const query: IMessageQuery = {
        workOrderId: req.params.workOrderId,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
        includeRead: req.query.includeRead === 'false' ? false : true
      };

      const messages = await messageService.getMessages(query);

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get messages'
      });
    }
  }

  async getMessageById(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const message = await messageService.getMessageById(messageId);

      if (!message) {
        return res.status(404).json({
          success: false,
          error: 'Message not found'
        });
      }

      res.json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('Get message error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get message'
      });
    }
  }

  async markAsRead(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data: IMarkAsReadRequest = req.body;
      await messageService.markAsRead(userId, data.messageIds);

      res.json({
        success: true,
        message: 'Messages marked as read'
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark messages as read'
      });
    }
  }

  async deleteMessage(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { messageId } = req.params;
      await messageService.deleteMessage(userId, messageId);

      res.json({
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (error) {
      console.error('Delete message error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete message'
      });
    }
  }
}