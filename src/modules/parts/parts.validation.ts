import Joi from 'joi';

export const createWorkOrderPartSchema = Joi.object({
  workOrderId: Joi.string().required(),
  inventoryItemId: Joi.string().required(),
  description: Joi.string().max(500).optional(),
  quantity: Joi.number().integer().min(1).default(1),
  unitPrice: Joi.number().min(0).optional(),
  source: Joi.string().valid('INVENTORY', 'SUPPLIER', 'CUSTOMER_SUPPLIED', 'WARRANTY', 'SALVAGE').default('INVENTORY'),
  supplierName: Joi.string().max(255).optional(),
  supplierInvoice: Joi.string().max(255).optional(),
  warrantyInfo: Joi.string().max(1000).optional(),
  notes: Joi.string().max(1000).optional(),
});

export const updateWorkOrderPartSchema = Joi.object({
  description: Joi.string().max(500).optional(),
  quantity: Joi.number().integer().min(1).optional(),
  unitPrice: Joi.number().min(0).optional(),
  source: Joi.string().valid('INVENTORY', 'SUPPLIER', 'CUSTOMER_SUPPLIED', 'WARRANTY', 'SALVAGE').optional(),
  supplierName: Joi.string().max(255).optional(),
  supplierInvoice: Joi.string().max(255).optional(),
  warrantyInfo: Joi.string().max(1000).optional(),
  notes: Joi.string().max(1000).optional(),
  status: Joi.string().valid('PENDING', 'ESTIMATED', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').optional(),
  startTime: Joi.date().optional(),
  endTime: Joi.date().optional(),
  installedById: Joi.string().optional(),
  installedAt: Joi.date().optional(),
});

export const validateCreateWorkOrderPart = (req: any, res: any, next: any) => {
  const { error } = createWorkOrderPartSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateUpdateWorkOrderPart = (req: any, res: any, next: any) => {
  const { error } = updateWorkOrderPartSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};