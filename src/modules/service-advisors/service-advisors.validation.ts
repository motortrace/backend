import { z } from 'zod';

// Create service advisor schema
export const createServiceAdvisorSchema = z.object({
  userProfileId: z.string().cuid('Invalid user profile ID'),
  employeeId: z.string().min(1, 'Employee ID is required').max(50).optional(),
  department: z.string().min(1, 'Department is required').max(100).optional(),
});

// Update service advisor schema
export const updateServiceAdvisorSchema = z.object({
  employeeId: z.string().min(1).max(50).optional(),
  department: z.string().min(1).max(100).optional(),
});

// Service advisor ID schema
export const serviceAdvisorIdSchema = z.object({
  id: z.string().min(1, 'Service advisor ID is required'),
});

// Service advisor filters schema
export const serviceAdvisorFiltersSchema = z.object({
  search: z.string().optional(),
  employeeId: z.string().optional(),
  department: z.string().optional(),
  hasWorkOrders: z.coerce.boolean().optional(),
  hasAppointments: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
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
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
    }
  };
};
