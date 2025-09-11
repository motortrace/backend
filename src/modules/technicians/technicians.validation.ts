import { z } from 'zod';

// Create technician schema
export const createTechnicianSchema = z.object({
  userProfileId: z.string().cuid('Invalid user profile ID'),
  employeeId: z.string().min(1, 'Employee ID is required').max(50).optional(),
  specialization: z.string().min(1, 'Specialization is required').max(100).optional(),
  certifications: z.array(z.string().min(1, 'Certification cannot be empty')).optional(),
});

// Update technician schema
export const updateTechnicianSchema = z.object({
  employeeId: z.string().min(1).max(50).optional(),
  specialization: z.string().min(1).max(100).optional(),
  certifications: z.array(z.string().min(1)).optional(),
});

// Technician ID schema
export const technicianIdSchema = z.object({
  id: z.string().min(1, 'Technician ID is required'),
});

// Technician filters schema
export const technicianFiltersSchema = z.object({
  search: z.string().optional(),
  employeeId: z.string().optional(),
  specialization: z.string().optional(),
  hasInspections: z.coerce.boolean().optional(),
  hasLaborItems: z.coerce.boolean().optional(),
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
