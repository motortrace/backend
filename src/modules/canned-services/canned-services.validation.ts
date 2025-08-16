import Joi from 'joi';

export const createCannedServiceSchema = Joi.object({
  code: Joi.string().required().min(1).max(50),
  name: Joi.string().required().min(1).max(200),
  description: Joi.string().optional().max(1000),
  duration: Joi.number().min(1).required(),
  price: Joi.number().min(0).required(),
  isAvailable: Joi.boolean().required(),
  laborOperations: Joi.array().items(
    Joi.object({
      laborCatalogId: Joi.string().required(),
      sequence: Joi.number().min(1).required(),
      notes: Joi.string().optional().max(500),
    })
  ).optional(),
  partsCategories: Joi.array().items(
    Joi.object({
      categoryId: Joi.string().required(),
      isRequired: Joi.boolean().required(),
      notes: Joi.string().optional().max(500),
    })
  ).optional(),
});

export const updateCannedServiceSchema = Joi.object({
  code: Joi.string().optional().min(1).max(50),
  name: Joi.string().optional().min(1).max(200),
  description: Joi.string().optional().max(1000),
  duration: Joi.number().min(1).optional(),
  price: Joi.number().min(0).optional(),
  isAvailable: Joi.boolean().optional(),
  laborOperations: Joi.array().items(
    Joi.object({
      laborCatalogId: Joi.string().required(),
      sequence: Joi.number().min(1).required(),
      notes: Joi.string().optional().max(500),
    })
  ).optional(),
  partsCategories: Joi.array().items(
    Joi.object({
      categoryId: Joi.string().required(),
      isRequired: Joi.boolean().required(),
      notes: Joi.string().optional().max(500),
    })
  ).optional(),
});

export const cannedServiceFilterSchema = Joi.object({
  search: Joi.string().optional(),
  isAvailable: Joi.boolean().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  minDuration: Joi.number().min(1).optional(),
  maxDuration: Joi.number().min(1).optional(),
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).max(100).optional(),
});

export const validateCreateCannedService = (req: any, res: any, next: any) => {
  const { error } = createCannedServiceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateUpdateCannedService = (req: any, res: any, next: any) => {
  const { error } = updateCannedServiceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateCannedServiceFilter = (req: any, res: any, next: any) => {
  const { error } = cannedServiceFilterSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};
