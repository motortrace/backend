import Joi from 'joi';
import { 
  ApprovalStatus, 
  ApprovalMethod, 
  PartSource 
} from '@prisma/client';

export const createEstimateSchema = Joi.object({
  workOrderId: Joi.string().required(),
  description: Joi.string().optional(),
  totalAmount: Joi.number().min(0).required(),
  laborAmount: Joi.number().min(0).optional(),
  partsAmount: Joi.number().min(0).optional(),
  taxAmount: Joi.number().min(0).optional(),
  discountAmount: Joi.number().min(0).optional(),
  notes: Joi.string().optional(),
  createdById: Joi.string().optional(),
});

export const updateEstimateSchema = Joi.object({
  description: Joi.string().optional(),
  totalAmount: Joi.number().min(0).optional(),
  laborAmount: Joi.number().min(0).optional(),
  partsAmount: Joi.number().min(0).optional(),
  taxAmount: Joi.number().min(0).optional(),
  discountAmount: Joi.number().min(0).optional(),
  notes: Joi.string().optional(),
  approved: Joi.boolean().optional(),
  approvedAt: Joi.date().optional(),
  approvedById: Joi.string().optional(),
});

export const createEstimateLaborSchema = Joi.object({
  estimateId: Joi.string().required(),
  laborCatalogId: Joi.string().optional(),
  description: Joi.string().required(),
  hours: Joi.number().positive().required(),
  rate: Joi.number().positive().required(),
  notes: Joi.string().optional(),
});

export const updateEstimateLaborSchema = Joi.object({
  laborCatalogId: Joi.string().optional(),
  description: Joi.string().optional(),
  hours: Joi.number().positive().optional(),
  rate: Joi.number().positive().optional(),
  notes: Joi.string().optional(),
  customerApproved: Joi.boolean().optional(),
  customerNotes: Joi.string().optional(),
});

export const createEstimatePartSchema = Joi.object({
  estimateId: Joi.string().required(),
  inventoryItemId: Joi.string().required(),
  quantity: Joi.number().integer().positive().required(),
  unitPrice: Joi.number().positive().required(),
  source: Joi.string().valid(...Object.values(PartSource)).optional(),
  supplierName: Joi.string().optional(),
  warrantyInfo: Joi.string().optional(),
  notes: Joi.string().optional(),
});

export const updateEstimatePartSchema = Joi.object({
  inventoryItemId: Joi.string().optional(),
  quantity: Joi.number().integer().positive().optional(),
  unitPrice: Joi.number().positive().optional(),
  source: Joi.string().valid(...Object.values(PartSource)).optional(),
  supplierName: Joi.string().optional(),
  warrantyInfo: Joi.string().optional(),
  notes: Joi.string().optional(),
  customerApproved: Joi.boolean().optional(),
  customerNotes: Joi.string().optional(),
});

export const createEstimateApprovalSchema = Joi.object({
  workOrderId: Joi.string().required(),
  estimateId: Joi.string().optional(),
  status: Joi.string().valid(...Object.values(ApprovalStatus)).required(),
  method: Joi.string().valid(...Object.values(ApprovalMethod)).optional(),
  notes: Joi.string().optional(),
  customerSignature: Joi.string().optional(),
});

export const updateEstimateApprovalSchema = Joi.object({
  status: Joi.string().valid(...Object.values(ApprovalStatus)).optional(),
  approvedAt: Joi.date().optional(),
  approvedById: Joi.string().optional(),
  method: Joi.string().valid(...Object.values(ApprovalMethod)).optional(),
  notes: Joi.string().optional(),
  customerSignature: Joi.string().optional(),
});

export const estimateFiltersSchema = Joi.object({
  workOrderId: Joi.string().optional(),
  createdById: Joi.string().optional(),
  approved: Joi.boolean().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
});

// ID validation schemas
export const estimateIdSchema = Joi.object({
  id: Joi.string().required(),
});

export const estimateIdParamSchema = Joi.object({
  estimateId: Joi.string().required(),
});

export const estimateLaborIdSchema = Joi.object({
  id: Joi.string().required(),
});

export const estimatePartIdSchema = Joi.object({
  id: Joi.string().required(),
});

export const estimateApprovalIdSchema = Joi.object({
  id: Joi.string().required(),
});

// Validation middleware functions
export const validateRequest = (schema: Joi.ObjectSchema, location: 'body' | 'query' | 'params' = 'body') => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req[location]);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }
    next();
  };
};
