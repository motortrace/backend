import { z } from 'zod';

export const createMileageEntrySchema = z.object({
  vehicleId: z.string().cuid('Invalid vehicle ID'),
  mileage: z.number().int().min(0, 'Mileage must be a positive number'),
  fuelUsed: z.number().min(0).optional(),
  distance: z.number().int().min(0).optional(),
  efficiency: z.number().min(0).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  locationName: z.string().optional(),
  notes: z.string().optional(),
});

export const updateMileageEntrySchema = z.object({
  mileage: z.number().int().min(0).optional(),
  fuelUsed: z.number().min(0).optional(),
  distance: z.number().int().min(0).optional(),
  efficiency: z.number().min(0).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  locationName: z.string().optional(),
  notes: z.string().optional(),
});

export const mileageAnalyticsSchema = z.object({
  vehicleId: z.string().cuid('Invalid vehicle ID'),
  period: z.enum(['day', 'week', 'month', 'year']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const bulkMileageUpdateSchema = z.object({
  vehicleId: z.string().cuid('Invalid vehicle ID'),
  entries: z.array(z.object({
    mileage: z.number().int().min(0),
    fuelUsed: z.number().min(0).optional(),
    recordedAt: z.string().datetime().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    locationName: z.string().optional(),
    notes: z.string().optional(),
  })).min(1, 'At least one entry is required'),
});

export type CreateMileageEntryInput = z.infer<typeof createMileageEntrySchema>;
export type UpdateMileageEntryInput = z.infer<typeof updateMileageEntrySchema>;
export type MileageAnalyticsInput = z.infer<typeof mileageAnalyticsSchema>;
export type BulkMileageUpdateInput = z.infer<typeof bulkMileageUpdateSchema>;