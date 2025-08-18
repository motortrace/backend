import { LaborCatalog, WorkOrderLabour } from '@prisma/client';

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

export interface CreateWorkOrderLabourRequest {
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

export interface UpdateWorkOrderLabourRequest {
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
    labourItems: number;
  };
}

export interface WorkOrderLabourWithDetails extends WorkOrderLabour {
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
  laborItems: WorkOrderLabourWithDetails[];
}

export interface LaborCatalogFilter {
  category?: string;
  isActive?: boolean;
  search?: string;
}

export interface WorkOrderLabourFilter {
  workOrderId?: string;
  technicianId?: string;
  startDate?: Date;
  endDate?: Date;
  category?: string;
}
