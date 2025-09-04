import Joi from 'joi';

export const createCustomerSchema = Joi.object({
  userProfileId: Joi.string().optional(),
  name: Joi.string().min(1).max(255).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
});

export const updateCustomerSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
});

export const customerFiltersSchema = Joi.object({
  search: Joi.string().trim().empty('').optional(),
  email: Joi.string().trim().empty('').optional(), // Allow partial email searches, but not empty strings
  phone: Joi.string().trim().empty('').optional(),
  hasVehicles: Joi.boolean().optional(),
  hasWorkOrders: Joi.boolean().optional(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});

export const validateCreateCustomer = (req: any, res: any, next: any) => {
  const { error } = createCustomerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message: error.details[0].message,
    });
  }
  next();
};

export const validateUpdateCustomer = (req: any, res: any, next: any) => {
  const { error } = updateCustomerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message: error.details[0].message,
    });
  }
  next();
};

export const validateCustomerFilters = (req: any, res: any, next: any) => {
  const { error } = customerFiltersSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message: error.details[0].message,
    });
  }
  next();
};
