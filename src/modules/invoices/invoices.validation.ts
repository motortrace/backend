import Joi from 'joi';
import { InvoiceStatus } from '@prisma/client';

// Invoice Creation Schema
export const createInvoiceSchema = Joi.object({
  workOrderId: Joi.string().required(),
  dueDate: Joi.date().optional(),
  notes: Joi.string().optional(),
  terms: Joi.string().optional(),
});

// Invoice Update Schema
export const updateInvoiceSchema = Joi.object({
  status: Joi.string().valid(...Object.values(InvoiceStatus)).optional(),
  dueDate: Joi.date().optional(),
  notes: Joi.string().optional(),
  terms: Joi.string().optional(),
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
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };
};
