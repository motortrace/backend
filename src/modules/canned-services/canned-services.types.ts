import Joi from 'joi';

export interface CreateCannedServiceRequest {
  code: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: number;
  isAvailable?: boolean;
}

export interface UpdateCannedServiceRequest {
  code?: string;
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  isAvailable?: boolean;
}

export interface CannedServiceFilters {
  isAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

// Detailed response interfaces for canned service with labor and parts
export interface CannedServiceLaborDetail {
  id: string;
  sequence: number;
  notes?: string;
  labor: {
    id: string;
    code: string;
    name: string;
    description?: string;
    estimatedHours: number | any; // Allow Prisma Decimal type
    hourlyRate: number | any; // Allow Prisma Decimal type
    category?: string;
    isActive: boolean;
  };
}

export interface CannedServicePartsCategoryDetail {
  id: string;
  isRequired: boolean;
  notes?: string;
  category: {
    id: string;
    name: string;
  };
}

export interface CannedServiceDetails {
  id: string;
  code: string;
  name: string;
  description?: string;
  duration: number;
  price: number | any; // Allow Prisma Decimal type
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  laborOperations: CannedServiceLaborDetail[];
  partsCategories: CannedServicePartsCategoryDetail[];
}

// Validation schemas
export const createCannedServiceSchema = Joi.object({
  code: Joi.string().required().min(2).max(20),
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().optional().max(500),
  duration: Joi.number().required().min(1).max(480), // 1 minute to 8 hours
  price: Joi.number().required().min(0).precision(2),
  isAvailable: Joi.boolean().optional().default(true),
});

export const updateCannedServiceSchema = Joi.object({
  code: Joi.string().optional().min(2).max(20),
  name: Joi.string().optional().min(2).max(100),
  description: Joi.string().optional().max(500),
  duration: Joi.number().optional().min(1).max(480),
  price: Joi.number().optional().min(0).precision(2),
  isAvailable: Joi.boolean().optional(),
});

export const cannedServiceFiltersSchema = Joi.object({
  isAvailable: Joi.boolean().optional(),
  category: Joi.string().optional(),
  minPrice: Joi.number().optional().min(0),
  maxPrice: Joi.number().optional().min(0),
  search: Joi.string().optional().min(1),
});

// Validation middleware function
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
