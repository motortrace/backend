import { CannedService, LaborCatalog, InventoryCategory } from '@prisma/client';

export interface CreateCannedServiceRequest {
  code: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  isAvailable: boolean;
  laborOperations?: Array<{
    laborCatalogId: string;
    sequence: number;
    notes?: string;
  }>;
  partsCategories?: Array<{
    categoryId: string;
    isRequired: boolean;
    notes?: string;
  }>;
}

export interface UpdateCannedServiceRequest {
  code?: string;
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  isAvailable?: boolean;
  laborOperations?: Array<{
    laborCatalogId: string;
    sequence: number;
    notes?: string;
  }>;
  partsCategories?: Array<{
    categoryId: string;
    isRequired: boolean;
    notes?: string;
  }>;
}

export interface CannedServiceWithDetails extends CannedService {
  laborOperations: Array<{
    id: string;
    sequence: number;
    notes: string | null;
    laborCatalog: {
      id: string;
      name: string;
      description: string | null;
      estimatedHours: number;
      hourlyRate: number;
    };
  }>;
  partsCategories: Array<{
    id: string;
    isRequired: boolean;
    notes: string | null;
    category: {
      id: string;
      name: string;
    };
  }>;
  _count: {
    appointmentServices: number;
    services: number;
  };
}

export interface CannedServiceFilter {
  search?: string;
  isAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  page?: number;
  limit?: number;
}

export interface CannedServiceSummary {
  totalServices: number;
  availableServices: number;
  totalValue: number;
  averagePrice: number;
  averageDuration: number;
}
