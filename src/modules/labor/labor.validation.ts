import Joi from 'joi';

export const createLaborCatalogSchema = Joi.object({
  code: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().optional(),
  estimatedMinutes: Joi.number().min(1).max(10000).required(),
  skillLevel: Joi.string().optional(),
  category: Joi.string().optional(),
  isActive: Joi.boolean().default(true),
});

export const updateLaborCatalogSchema = Joi.object({
  code: Joi.string().optional(),
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  estimatedMinutes: Joi.number().min(1).max(10000).optional(),
  skillLevel: Joi.string().optional(),
  category: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

export const createWorkOrderLaborSchema = Joi.object({
  workOrderId: Joi.string().required(),
  serviceId: Joi.string().required(),  // Labor must belong to a service
  laborCatalogId: Joi.string().optional(),
  description: Joi.string().required(),
  estimatedMinutes: Joi.number().min(1).max(10000).optional(),
  technicianId: Joi.string().optional(),
  startTime: Joi.date().optional(),
  endTime: Joi.date().optional(),
  notes: Joi.string().optional(),
});

export const updateWorkOrderLaborSchema = Joi.object({
  serviceId: Joi.string().optional(),
  laborCatalogId: Joi.string().optional(),
  description: Joi.string().optional(),
  estimatedMinutes: Joi.number().min(1).max(10000).optional(),
  actualMinutes: Joi.number().min(1).max(10000).optional(),
  technicianId: Joi.string().optional(),
  startTime: Joi.date().optional(),
  endTime: Joi.date().optional(),
  status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').optional(),
  notes: Joi.string().optional(),
});

export const laborCatalogFilterSchema = Joi.object({
  category: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  search: Joi.string().optional(),
});

export const workOrderLaborFilterSchema = Joi.object({
  workOrderId: Joi.string().optional(),
  technicianId: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  category: Joi.string().optional(),
});

export const validateCreateLaborCatalog = (req: any, res: any, next: any) => {
  const { error } = createLaborCatalogSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateUpdateLaborCatalog = (req: any, res: any, next: any) => {
  const { error } = updateLaborCatalogSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateCreateWorkOrderLabor = (req: any, res: any, next: any) => {
  const { error } = createWorkOrderLaborSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateUpdateWorkOrderLabor = (req: any, res: any, next: any) => {
  const { error } = updateWorkOrderLaborSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateLaborCatalogFilter = (req: any, res: any, next: any) => {
  const { error } = laborCatalogFilterSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateWorkOrderLaborFilter = (req: any, res: any, next: any) => {
  const { error } = workOrderLaborFilterSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};
