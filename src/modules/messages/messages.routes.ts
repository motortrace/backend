import { Router } from 'express';
import { MessageController } from './messages.controller';
import { validateRequest } from './messages.validation';
import {
  createMessageSchema,
  getMessagesSchema,
  markAsReadSchema,
  messageIdSchema,
  workOrderIdSchema
} from './messages.validation';
import { authenticateSupabaseToken } from '../auth/supabase/authSupabase.middleware';

const router = Router();
const messageController = new MessageController();

// All routes require authentication
router.use(authenticateSupabaseToken);

// POST /messages - Create a new message
router.post(
  '/',
  validateRequest(createMessageSchema),
  messageController.createMessage.bind(messageController)
);

// GET /messages/:workOrderId - Get messages for a work order
router.get(
  '/:workOrderId',
  validateRequest(workOrderIdSchema, 'params'),
  validateRequest(getMessagesSchema, 'query'),
  messageController.getMessages.bind(messageController)
);

// GET /messages/single/:messageId - Get a specific message
router.get(
  '/single/:messageId',
  validateRequest(messageIdSchema, 'params'),
  messageController.getMessageById.bind(messageController)
);

// PUT /messages/mark-read - Mark messages as read
router.put(
  '/mark-read',
  validateRequest(markAsReadSchema),
  messageController.markAsRead.bind(messageController)
);

// DELETE /messages/:messageId - Delete a message
router.delete(
  '/:messageId',
  validateRequest(messageIdSchema, 'params'),
  messageController.deleteMessage.bind(messageController)
);

export default router;