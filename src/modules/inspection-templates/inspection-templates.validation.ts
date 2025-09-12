import Joi from 'joi';
import { ChecklistStatus } from '@prisma/client';


export const createTemplateItemSchema = Joi.object({
  name: Joi.string().required().min(1).max(255).messages({
    'string.empty': 'Item name is required',
    'string.min': 'Item name must be at least 1 character long',
    'string.max': 'Item name cannot exceed 255 characters'
  }),
  description: Joi.string().optional().max(1000).messages({
    'string.max': 'Description cannot exceed 1000 characters'
  }),
  category: Joi.string().optional().max(100).messages({
    'string.max': 'Category cannot exceed 100 characters'
  }),
  sortOrder: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Sort order must be a number',
    'number.integer': 'Sort order must be an integer',
    'number.min': 'Sort order cannot be negative'
  }),
  isRequired: Joi.boolean().default(true),
  allowsNotes: Joi.boolean().default(true)
});

// Base validation schemas
export const createInspectionTemplateSchema = Joi.object({
  name: Joi.string().required().min(1).max(255).messages({
    'string.empty': 'Template name is required',
    'string.min': 'Template name must be at least 1 character long',
    'string.max': 'Template name cannot exceed 255 characters'
  }),
  description: Joi.string().optional().max(1000).messages({
    'string.max': 'Description cannot exceed 1000 characters'
  }),
  category: Joi.string().optional().max(100).messages({
    'string.max': 'Category cannot exceed 100 characters'
  }),
  imageUrl: Joi.string().optional().uri().messages({
    'string.uri': 'Image URL must be a valid URL'
  }),
  sortOrder: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Sort order must be a number',
    'number.integer': 'Sort order must be an integer',
    'number.min': 'Sort order cannot be negative'
  }),
  templateItems: Joi.array().items(createTemplateItemSchema).optional()
});



export const updateInspectionTemplateSchema = Joi.object({
  name: Joi.string().optional().min(1).max(255).messages({
    'string.empty': 'Template name cannot be empty',
    'string.min': 'Template name must be at least 1 character long',
    'string.max': 'Template name cannot exceed 255 characters'
  }),
  description: Joi.string().optional().max(1000).messages({
    'string.max': 'Description cannot exceed 1000 characters'
  }),
  category: Joi.string().optional().max(100).messages({
    'string.max': 'Category cannot exceed 100 characters'
  }),
  imageUrl: Joi.string().optional().uri().messages({
    'string.uri': 'Image URL must be a valid URL'
  }),
  isActive: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Sort order must be a number',
    'number.integer': 'Sort order must be an integer',
    'number.min': 'Sort order cannot be negative'
  })
});

export const assignTemplateToWorkOrderSchema = Joi.object({
  workOrderId: Joi.string().required().messages({
    'string.empty': 'Work order ID is required',
    'any.required': 'Work order ID is required'
  }),
  templateId: Joi.string().required().messages({
    'string.empty': 'Template ID is required',
    'any.required': 'Template ID is required'
  }),
  inspectorId: Joi.string().required().messages({
    'string.empty': 'Inspector ID is required',
    'any.required': 'Inspector ID is required'
  }),
  notes: Joi.string().optional().max(1000).messages({
    'string.max': 'Notes cannot exceed 1000 characters'
  })
});

export const createChecklistItemSchema = Joi.object({
  templateItemId: Joi.string().optional().messages({
    'string.empty': 'Template item ID cannot be empty'
  }),
  category: Joi.string().optional().max(100).messages({
    'string.max': 'Category cannot exceed 100 characters'
  }),
  item: Joi.string().required().min(1).max(255).messages({
    'string.empty': 'Item name is required',
    'string.min': 'Item name must be at least 1 character long',
    'string.max': 'Item name cannot exceed 255 characters'
  }),
  status: Joi.string().valid(...Object.values(ChecklistStatus)).required().messages({
    'any.only': 'Status must be GREEN, YELLOW, or RED',
    'any.required': 'Status is required'
  }),
  notes: Joi.string().optional().max(1000).messages({
    'string.max': 'Notes cannot exceed 1000 characters'
  }),
  requiresFollowUp: Joi.boolean().default(false)
});

export const createInspectionFromTemplateSchema = Joi.object({
  workOrderId: Joi.string().required().messages({
    'string.empty': 'Work order ID is required',
    'any.required': 'Work order ID is required'
  }),
  templateId: Joi.string().required().messages({
    'string.empty': 'Template ID is required',
    'any.required': 'Template ID is required'
  }),
  inspectorId: Joi.string().required().messages({
    'string.empty': 'Inspector ID is required',
    'any.required': 'Inspector ID is required'
  }),
  notes: Joi.string().optional().max(1000).messages({
    'string.max': 'Notes cannot exceed 1000 characters'
  }),
  checklistItems: Joi.array().items(createChecklistItemSchema).optional()
});



export const updateChecklistItemSchema = Joi.object({
  status: Joi.string().valid(...Object.values(ChecklistStatus)).optional().messages({
    'any.only': 'Status must be GREEN, YELLOW, or RED'
  }),
  notes: Joi.string().optional().max(1000).messages({
    'string.max': 'Notes cannot exceed 1000 characters'
  }),
  requiresFollowUp: Joi.boolean().optional()
});

// Query validation schemas
export const inspectionTemplateFiltersSchema = Joi.object({
  category: Joi.string().optional().max(100).messages({
    'string.max': 'Category cannot exceed 100 characters'
  }),
  isActive: Joi.boolean().optional(),
  search: Joi.string().optional().max(255).messages({
    'string.max': 'Search term cannot exceed 255 characters'
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  })
});

export const workOrderInspectionFiltersSchema = Joi.object({
  workOrderId: Joi.string().optional().messages({
    'string.empty': 'Work order ID cannot be empty'
  }),
  inspectorId: Joi.string().optional().messages({
    'string.empty': 'Inspector ID cannot be empty'
  }),
  templateId: Joi.string().optional().messages({
    'string.empty': 'Template ID cannot be empty'
  }),
  isCompleted: Joi.boolean().optional(),
  dateFrom: Joi.date().optional().messages({
    'date.base': 'Date from must be a valid date'
  }),
  dateTo: Joi.date().optional().messages({
    'date.base': 'Date to must be a valid date'
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  })
});

// ID validation schemas
export const templateIdSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'Template ID is required',
    'any.required': 'Template ID is required'
  })
});

export const inspectionIdSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'Inspection ID is required',
    'any.required': 'Inspection ID is required'
  })
});

export const checklistItemIdSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'Checklist item ID is required',
    'any.required': 'Checklist item ID is required'
  })
});

// Validation helper functions
export const validateCreateInspectionTemplate = (data: any) => {
  return createInspectionTemplateSchema.validate(data, { abortEarly: false });
};

export const validateUpdateInspectionTemplate = (data: any) => {
  return updateInspectionTemplateSchema.validate(data, { abortEarly: false });
};

export const validateAssignTemplateToWorkOrder = (data: any) => {
  return assignTemplateToWorkOrderSchema.validate(data, { abortEarly: false });
};

export const validateCreateInspectionFromTemplate = (data: any) => {
  return createInspectionFromTemplateSchema.validate(data, { abortEarly: false });
};

export const validateUpdateChecklistItem = (data: any) => {
  return updateChecklistItemSchema.validate(data, { abortEarly: false });
};

export const validateInspectionTemplateFilters = (data: any) => {
  return inspectionTemplateFiltersSchema.validate(data, { abortEarly: false });
};

export const validateWorkOrderInspectionFilters = (data: any) => {
  return workOrderInspectionFiltersSchema.validate(data, { abortEarly: false });
};
