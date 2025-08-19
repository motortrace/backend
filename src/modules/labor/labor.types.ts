import { LaborCatalog, WorkOrderLabor } from '@prisma/client';

export interface CreateLaborRequest {
  workOrderId: string;
  description: string;
  hours: number;
  rate: number;
  technicianId?: string;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

export interface CreateLaborCatalogRequest {
  code: string;
  name: string;
  description?: string;
  estimatedHours: number;
  hourlyRate: number;
  category?: string;
  isActive?: boolean;
}

export interface UpdateLaborCatalogRequest {
  code?: string;
  name?: string;
  description?: string;
  estimatedHours?: number;
  hourlyRate?: number;
  category?: string;
  isActive?: boolean;
}

export interface CreateWorkOrderLaborRequest {
  workOrderId: string;
  cannedServiceId?: string;
  laborCatalogId?: string;
  description: string;
  hours: number;
  rate: number;
  technicianId?: string;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

export interface UpdateWorkOrderLaborRequest {
  cannedServiceId?: string;
  laborCatalogId?: string;
  description?: string;
  hours?: number;
  rate?: number;
  technicianId?: string;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

export interface LaborCatalogWithUsage extends LaborCatalog {
  _count: {
    laborItems: number;
  };
}

export interface WorkOrderLaborWithDetails extends WorkOrderLabor {
  workOrder: {
    id: string;
    workOrderNumber: string;
    status: string;
  };
  laborCatalog: {
    id: string;
    code: string;
    name: string;
    category: string | null;
  } | null;
  technician: {
    id: string;
    userProfileId: string;
  } | null;
}

export interface LaborSummary {
  totalHours: number;
  totalCost: number;
  laborItems: WorkOrderLaborWithDetails[];
}

export interface LaborCatalogFilter {
  category?: string;
  isActive?: boolean;
  search?: string;
}

export interface WorkOrderLaborFilter {
  workOrderId?: string;
  technicianId?: string;
  startDate?: Date;
  endDate?: Date;
  category?: string;
}
