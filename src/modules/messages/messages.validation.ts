import Joi from 'joi';
import { MessageType } from './messages.types';

export const createMessageSchema = Joi.object({
  workOrderId: Joi.string().required(),
  message: Joi.string().min(1).max(2000).required(),
  messageType: Joi.string().valid(...Object.values(MessageType)).default(MessageType.TEXT),
  attachments: Joi.array().items(
    Joi.object({
      fileUrl: Joi.string().uri().required(),
      fileName: Joi.string().min(1).max(255).required(),
      fileType: Joi.string().min(1).max(100).required(),
      fileSize: Joi.number().integer().min(1).max(10 * 1024 * 1024).required() // 10MB max
    })
  ).optional()
});

export const getMessagesSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
  includeRead: Joi.boolean().default(true)
});

export const markAsReadSchema = Joi.object({
  messageIds: Joi.array().items(Joi.string()).min(1).required()
});

export const messageIdSchema = Joi.object({
  messageId: Joi.string().required()
});

export const workOrderIdSchema = Joi.object({
  workOrderId: Joi.string().required()
});

// Validation middleware
export const validateRequest = (schema: Joi.ObjectSchema, location: 'body' | 'query' | 'params' = 'body') => {
  return (req: any, res: any, next: any) => {
    try {
      const data = req[location];
      const { error } = schema.validate(data);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.details,
        });
      }
      next();
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.message,
      });
    }
  };
};