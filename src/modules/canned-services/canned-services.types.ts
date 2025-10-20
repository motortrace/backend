import Joi from 'joi';

// Enum types from Prisma schema
type ServiceVariantLabel = 'FULL_SYNTHETIC' | 'SYNTHETIC_BLEND' | 'CONVENTIONAL' | 'HIGH_MILEAGE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'SUV' | 'TRUCK' | 'PERFORMANCE' | 'COMMERCIAL';
type VehicleType = 'SEDAN' | 'SUV' | 'TRUCK' | 'VAN' | 'HATCHBACK' | 'COUPE' | 'CONVERTIBLE' | 'WAGON' | 'MOTORCYCLE' | 'COMMERCIAL' | 'ELECTRIC' | 'HYBRID' | 'DIESEL' | 'GASOLINE';

// Jabirs updated interface
export interface CreateCannedServiceRequest {
  code: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  isAvailable?: boolean;
  variantLabel?: ServiceVariantLabel;
  vehicleType?: VehicleType;
  hasOptionalParts?: boolean;
  hasOptionalLabor?: boolean;
  category?: string;
  minVehicleAge?: number;
  maxVehicleMileage?: number;
  isArchived?: boolean;
  laborOperations?: Array<{
    laborCatalogId: string;
    sequence: number;
    notes?: string;
  }>;
}

// Jabirs updated interface
export interface UpdateCannedServiceRequest {
  code?: string;
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  isAvailable?: boolean;
  variantLabel?: ServiceVariantLabel;
  vehicleType?: VehicleType;
  hasOptionalParts?: boolean;
  hasOptionalLabor?: boolean;
  category?: string;
  minVehicleAge?: number;
  maxVehicleMileage?: number;
  isArchived?: boolean;
  laborOperations?: Array<{
    laborCatalogId: string;
    sequence: number;
    notes?: string;
  }>;
}

export interface CannedServiceFilters {
  isAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  category?: string;
  vehicleType?: VehicleType;
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
  variantLabel?: ServiceVariantLabel;
  vehicleType?: VehicleType;
  hasOptionalParts: boolean;
  hasOptionalLabor: boolean;
  category?: string;
  minVehicleAge?: number;
  maxVehicleMileage?: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  laborOperations: CannedServiceLaborDetail[];
  partsCategories: CannedServicePartsCategoryDetail[];
}

// New method added by jabir for frontend compatibilty
export interface CannedServiceResponse {
  id: string;
  code: string;
  name: string;
  description?: string;
  duration: number;
  price: number | any;
  isAvailable: boolean;
  variantLabel?: ServiceVariantLabel;
  vehicleType?: VehicleType;
  hasOptionalParts: boolean;
  hasOptionalLabor: boolean;
  category?: string;
  minVehicleAge?: number;
  maxVehicleMileage?: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  serviceIds: string[]; // For frontend compatibility
  laborOperations: Array<{
    id: string;
    sequence: number;
    notes?: string;
    laborCatalog: {
      id: string;
      code: string;
      name: string;
      estimatedHours: number | any;
      hourlyRate: number | any;
      isActive: boolean;
    };
  }>;
}

// Validation schemas

// Simak's old validation schema
// export const createCannedServiceSchema = Joi.object({
//   code: Joi.string().required().min(2).max(20),
//   name: Joi.string().required().min(2).max(100),
//   description: Joi.string().optional().max(500),
//   duration: Joi.number().required().min(1).max(480), // 1 minute to 8 hours
//   price: Joi.number().required().min(0).precision(2),
//   isAvailable: Joi.boolean().optional().default(true),
// });

// Jabir's new validation schema
export const createCannedServiceSchema = Joi.object({
  code: Joi.string().required().min(2).max(20),
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().optional().max(500),
  duration: Joi.number().required().min(1).max(480),
  price: Joi.number().required().min(0).precision(2),
  isAvailable: Joi.boolean().optional().default(true),
  variantLabel: Joi.string().optional().valid(
    'FULL_SYNTHETIC', 'SYNTHETIC_BLEND', 'CONVENTIONAL', 'HIGH_MILEAGE', 'DIESEL',
    'ELECTRIC', 'HYBRID', 'SUV', 'TRUCK', 'PERFORMANCE', 'COMMERCIAL'
  ),
  vehicleType: Joi.string().optional().valid(
    'SEDAN', 'SUV', 'TRUCK', 'VAN', 'HATCHBACK', 'COUPE', 'CONVERTIBLE',
    'WAGON', 'MOTORCYCLE', 'COMMERCIAL', 'ELECTRIC', 'HYBRID', 'DIESEL', 'GASOLINE'
  ),
  hasOptionalParts: Joi.boolean().optional().default(false),
  hasOptionalLabor: Joi.boolean().optional().default(false),
  category: Joi.string().optional().max(50),
  minVehicleAge: Joi.number().optional().min(0).max(50),
  maxVehicleMileage: Joi.number().optional().min(0),
  isArchived: Joi.boolean().optional().default(false),
  laborOperations: Joi.array().items(
    Joi.object({
      laborCatalogId: Joi.string().required(),
      sequence: Joi.number().required().min(1),
      notes: Joi.string().optional().max(500)
    })
  ).optional()
});

// Simak's schema
// export const updateCannedServiceSchema = Joi.object({
//   code: Joi.string().optional().min(2).max(20),
//   name: Joi.string().optional().min(2).max(100),
//   description: Joi.string().optional().max(500),
//   duration: Joi.number().optional().min(1).max(480),
//   price: Joi.number().optional().min(0).precision(2),
//   isAvailable: Joi.boolean().optional(),
// });

// Jabirs updated schema
export const updateCannedServiceSchema = Joi.object({
  code: Joi.string().optional().min(2).max(20),
  name: Joi.string().optional().min(2).max(100),
  description: Joi.string().optional().max(500),
  duration: Joi.number().optional().min(1).max(480),
  price: Joi.number().optional().min(0).precision(2),
  isAvailable: Joi.boolean().optional(),
  variantLabel: Joi.string().optional().valid(
    'FULL_SYNTHETIC', 'SYNTHETIC_BLEND', 'CONVENTIONAL', 'HIGH_MILEAGE', 'DIESEL',
    'ELECTRIC', 'HYBRID', 'SUV', 'TRUCK', 'PERFORMANCE', 'COMMERCIAL'
  ),
  vehicleType: Joi.string().optional().valid(
    'SEDAN', 'SUV', 'TRUCK', 'VAN', 'HATCHBACK', 'COUPE', 'CONVERTIBLE',
    'WAGON', 'MOTORCYCLE', 'COMMERCIAL', 'ELECTRIC', 'HYBRID', 'DIESEL', 'GASOLINE'
  ),
  hasOptionalParts: Joi.boolean().optional(),
  hasOptionalLabor: Joi.boolean().optional(),
  category: Joi.string().optional().max(50),
  minVehicleAge: Joi.number().optional().min(0).max(50),
  maxVehicleMileage: Joi.number().optional().min(0),
  isArchived: Joi.boolean().optional(),
  laborOperations: Joi.array().items(
    Joi.object({
      laborCatalogId: Joi.string().required(),
      sequence: Joi.number().required().min(1),
      notes: Joi.string().optional().max(500)
    })
  ).optional()
});

export const cannedServiceFiltersSchema = Joi.object({
  isAvailable: Joi.boolean().optional(),
  category: Joi.string().optional(),
  vehicleType: Joi.string().optional().valid(
    'SEDAN', 'SUV', 'TRUCK', 'VAN', 'HATCHBACK', 'COUPE', 'CONVERTIBLE',
    'WAGON', 'MOTORCYCLE', 'COMMERCIAL', 'ELECTRIC', 'HYBRID', 'DIESEL', 'GASOLINE'
  ),
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

// Inspection Template Recommendation interface for work order services
export interface InspectionTemplateRecommendation {
  id: string;
  image: string | null;
  name: string;
  itemCount: number;
  category: string | null;
}
