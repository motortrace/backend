import Joi from 'joi';

export const createLaborCatalogSchema = Joi.object({
  code: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().optional(),
  estimatedHours: Joi.number().min(0.1).max(100).required(),
  hourlyRate: Joi.number().min(0).required(),
  category: Joi.string().optional(),
  isActive: Joi.boolean().default(true),
});

export const updateLaborCatalogSchema = Joi.object({
  code: Joi.string().optional(),
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  estimatedHours: Joi.number().min(0.1).max(100).optional(),
  hourlyRate: Joi.number().min(0).optional(),
  category: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

export const createWorkOrderLabourSchema = Joi.object({
  workOrderId: Joi.string().required(),
  cannedServiceId: Joi.string().optional(),
  laborCatalogId: Joi.string().optional(),
  description: Joi.string().required(),
  hours: Joi.number().min(0.1).max(100).required(),
  rate: Joi.number().min(0).required(),
  technicianId: Joi.string().optional(),
  startTime: Joi.date().optional(),
  endTime: Joi.date().optional(),
  notes: Joi.string().optional(),
});

export const updateWorkOrderLabourSchema = Joi.object({
  cannedServiceId: Joi.string().optional(),
  laborCatalogId: Joi.string().optional(),
  description: Joi.string().optional(),
  hours: Joi.number().min(0.1).max(100).optional(),
  rate: Joi.number().min(0).optional(),
  technicianId: Joi.string().optional(),
  startTime: Joi.date().optional(),
  endTime: Joi.date().optional(),
  notes: Joi.string().optional(),
});

export const laborCatalogFilterSchema = Joi.object({
  category: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  search: Joi.string().optional(),
});

export const workOrderLabourFilterSchema = Joi.object({
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

export const validateCreateWorkOrderLabour = (req: any, res: any, next: any) => {
  const { error } = createWorkOrderLabourSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateUpdateWorkOrderLabour = (req: any, res: any, next: any) => {
  const { error } = updateWorkOrderLabourSchema.validate(req.body);
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

export const validateWorkOrderLabourFilter = (req: any, res: any, next: any) => {
  const { error } = workOrderLabourFilterSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};
