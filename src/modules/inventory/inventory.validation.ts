import Joi from 'joi';

export const createInventoryItemSchema = Joi.object({
  name: Joi.string().required(),
  sku: Joi.string().optional(),
  partNumber: Joi.string().optional(),
  manufacturer: Joi.string().optional(),
  category: Joi.string().optional(),
  location: Joi.string().optional(),
  quantity: Joi.number().min(0).required(),
  minStockLevel: Joi.number().min(0).optional(),
  maxStockLevel: Joi.number().min(0).optional(),
  reorderPoint: Joi.number().min(0).optional(),
  unitPrice: Joi.number().min(0).required(),
  supplier: Joi.string().optional(),
  supplierPartNumber: Joi.string().optional(),
  core: Joi.boolean().default(false),
  corePrice: Joi.number().min(0).optional(),
});

export const updateInventoryItemSchema = Joi.object({
  name: Joi.string().optional(),
  sku: Joi.string().optional(),
  partNumber: Joi.string().optional(),
  manufacturer: Joi.string().optional(),
  category: Joi.string().optional(),
  location: Joi.string().optional(),
  quantity: Joi.number().min(0).optional(),
  minStockLevel: Joi.number().min(0).optional(),
  maxStockLevel: Joi.number().min(0).optional(),
  reorderPoint: Joi.number().min(0).optional(),
  unitPrice: Joi.number().min(0).optional(),
  supplier: Joi.string().optional(),
  supplierPartNumber: Joi.string().optional(),
  core: Joi.boolean().optional(),
  corePrice: Joi.number().min(0).optional(),
});

export const inventoryAdjustmentSchema = Joi.object({
  inventoryItemId: Joi.string().required(),
  adjustmentType: Joi.string().valid('ADD', 'REMOVE', 'SET').required(),
  quantity: Joi.number().min(0).required(),
  reason: Joi.string().required(),
  notes: Joi.string().optional(),
  workOrderId: Joi.string().optional(),
});

export const inventoryTransferSchema = Joi.object({
  fromLocation: Joi.string().required(),
  toLocation: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      inventoryItemId: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
    })
  ).min(1).required(),
  notes: Joi.string().optional(),
});

export const inventoryFilterSchema = Joi.object({
  category: Joi.string().optional(),
  manufacturer: Joi.string().optional(),
  supplier: Joi.string().optional(),
  location: Joi.string().optional(),
  lowStock: Joi.boolean().optional(),
  outOfStock: Joi.boolean().optional(),
  search: Joi.string().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).max(100).optional(),
});

export const bulkUpdateSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      quantity: Joi.number().min(0).optional(),
      unitPrice: Joi.number().min(0).optional(),
      location: Joi.string().optional(),
      minStockLevel: Joi.number().min(0).optional(),
      maxStockLevel: Joi.number().min(0).optional(),
      reorderPoint: Joi.number().min(0).optional(),
    })
  ).min(1).required(),
});

export const validateCreateInventoryItem = (req: any, res: any, next: any) => {
  const { error } = createInventoryItemSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateUpdateInventoryItem = (req: any, res: any, next: any) => {
  const { error } = updateInventoryItemSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateInventoryAdjustment = (req: any, res: any, next: any) => {
  const { error } = inventoryAdjustmentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateInventoryTransfer = (req: any, res: any, next: any) => {
  const { error } = inventoryTransferSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateInventoryFilter = (req: any, res: any, next: any) => {
  const { error } = inventoryFilterSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateBulkUpdate = (req: any, res: any, next: any) => {
  const { error } = bulkUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};
