import { z } from 'zod';

// Create vehicle schema
export const createVehicleSchema = z.object({
  customerId: z.string().cuid(),
  make: z.string().min(1, 'Make is required').max(100),
  model: z.string().min(1, 'Model is required').max(100),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  vin: z.string().length(17, 'VIN must be exactly 17 characters').optional(),
  licensePlate: z.string().max(20).optional(),
});

// Update vehicle schema
export const updateVehicleSchema = z.object({
  make: z.string().min(1).max(100).optional(),
  model: z.string().min(1).max(100).optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  vin: z.string().length(17).optional(),
  licensePlate: z.string().max(20).optional(),
});

// Vehicle ID schema
export const vehicleIdSchema = z.object({
  id: z.string().cuid(),
});

// Vehicle filters schema
export const vehicleFiltersSchema = z.object({
  customerId: z.string().cuid().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().optional(),
  vin: z.string().optional(),
  licensePlate: z.string().optional(),
  search: z.string().optional(),
});

// Validation middleware
export const validateRequest = (schema: z.ZodSchema, source: 'body' | 'params' | 'query' = 'body') => {
  return (req: any, res: any, next: any) => {
    try {
      const data = req[source];
      schema.parse(data);
      next();
    } catch (error: any) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }
  };
};