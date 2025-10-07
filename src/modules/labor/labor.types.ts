import { LaborCatalog, WorkOrderLabor } from '@prisma/client';

// Labor is for tracking only - pricing happens at service level
export interface CreateLaborRequest {
  workOrderId: string;
  serviceId: string;  // Labor must belong to a service
  laborCatalogId?: string;
  description: string;
  estimatedMinutes?: number;
  technicianId?: string;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

export interface CreateLaborCatalogRequest {
  code: string;
  name: string;
  description?: string;
  estimatedMinutes: number;
  skillLevel?: string;
  category?: string;
  isActive?: boolean;
}

export interface UpdateLaborCatalogRequest {
  code?: string;
  name?: string;
  description?: string;
  estimatedMinutes?: number;
  skillLevel?: string;
  category?: string;
  isActive?: boolean;
}

export interface CreateWorkOrderLaborRequest {
  workOrderId: string;
  serviceId: string;  // Required - labor must belong to a service
  laborCatalogId?: string;
  description: string;
  estimatedMinutes?: number;
  technicianId?: string;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

export interface UpdateWorkOrderLaborRequest {
  serviceId?: string;
  laborCatalogId?: string;
  description?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  technicianId?: string;
  startTime?: Date;
  endTime?: Date;
  status?: string;
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
  totalMinutes: number;
  totalEstimatedMinutes: number;
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
