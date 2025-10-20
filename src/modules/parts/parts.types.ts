import { WorkOrderPart, PartSource, ServiceStatus } from '@prisma/client';

export interface CreateWorkOrderPartRequest {
  workOrderId: string;
  inventoryItemId: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  source?: PartSource;
  supplierName?: string;
  supplierInvoice?: string;
  warrantyInfo?: string;
  notes?: string;
}

export interface WorkOrderPartWithDetails extends WorkOrderPart {
  workOrder: {
    id: string;
    workOrderNumber: string;
    status: string;
  };
  part: {
    id: string;
    name: string;
    sku: string | null;
    partNumber: string | null;
    manufacturer: string | null;
  };
  installedBy?: {
    id: string;
    userProfile: {
      id: string;
      name: string | null;
    };
  } | null;
}

export interface UpdateWorkOrderPartRequest {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  source?: PartSource;
  supplierName?: string;
  supplierInvoice?: string;
  warrantyInfo?: string;
  notes?: string;
  status?: ServiceStatus;
  startTime?: Date;
  endTime?: Date;
  installedById?: string;
  installedAt?: Date;
}

// Service Interface (for Dependency Injection)
export interface IWorkOrderPartService {
  createWorkOrderPart(data: CreateWorkOrderPartRequest): Promise<WorkOrderPartWithDetails>;
  getWorkOrderParts(workOrderId: string): Promise<WorkOrderPartWithDetails[]>;
  getWorkOrderPartById(id: string): Promise<WorkOrderPartWithDetails | null>;
  updateWorkOrderPart(id: string, data: UpdateWorkOrderPartRequest): Promise<WorkOrderPartWithDetails>;
  deleteWorkOrderPart(id: string): Promise<void>;
}