import { 
  WorkOrderEstimate,
  EstimateLabor,
  EstimatePart,
  WorkOrderApproval,
  ApprovalStatus,
  ApprovalMethod,
  PartSource
} from '@prisma/client';

export interface CreateEstimateRequest {
  workOrderId: string;
  description?: string;
  totalAmount: number;
  laborAmount?: number;
  partsAmount?: number;
  taxAmount?: number;
  discountAmount?: number;
  notes?: string;
  isVisibleToCustomer?: boolean;
  createdById?: string;
}

export interface UpdateEstimateRequest {
  description?: string;
  totalAmount?: number;
  laborAmount?: number;
  partsAmount?: number;
  taxAmount?: number;
  discountAmount?: number;
  notes?: string;
  isVisibleToCustomer?: boolean;
  approved?: boolean;
  approvedAt?: Date;
  approvedById?: string;
}

export interface CreateEstimateLaborRequest {
  estimateId: string;
  laborCatalogId?: string;
  description: string;
  hours: number;
  rate: number;
  notes?: string;
}

export interface UpdateEstimateLaborRequest {
  laborCatalogId?: string;
  description?: string;
  hours?: number;
  rate?: number;
  notes?: string;
  customerApproved?: boolean;
  customerNotes?: string;
}

export interface CreateEstimatePartRequest {
  estimateId: string;
  inventoryItemId: string;
  quantity: number;
  unitPrice: number;
  source?: PartSource;
  supplierName?: string;
  warrantyInfo?: string;
  notes?: string;
}

export interface UpdateEstimatePartRequest {
  inventoryItemId?: string;
  quantity?: number;
  unitPrice?: number;
  source?: PartSource;
  supplierName?: string;
  warrantyInfo?: string;
  notes?: string;
  customerApproved?: boolean;
  customerNotes?: string;
}

export interface CreateEstimateApprovalRequest {
  workOrderId: string;
  estimateId?: string;
  status: ApprovalStatus;
  method?: ApprovalMethod;
  notes?: string;
  customerSignature?: string;
}

export interface UpdateEstimateApprovalRequest {
  status?: ApprovalStatus;
  approvedAt?: Date;
  approvedById?: string;
  method?: ApprovalMethod;
  notes?: string;
  customerSignature?: string;
}

export interface EstimateFilters {
  workOrderId?: string;
  createdById?: string;
  approved?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface EstimateWithDetails {
  id: string;
  workOrderId: string;
  version: number;
  description?: string;
  totalAmount: number;
  laborAmount?: number;
  partsAmount?: number;
  taxAmount?: number;
  discountAmount?: number;
  notes?: string;
  isVisibleToCustomer: boolean;
  createdById?: string;
  createdAt: Date;
  approved: boolean;
  approvedAt?: Date;
  approvedById?: string;
  workOrder: {
    id: string;
    workOrderNumber: string;
    customer: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
    };
    vehicle: {
      id: string;
      make: string;
      model: string;
      year?: number;
      licensePlate?: string;
    };
  };
  createdBy?: {
    id: string;
    employeeId?: string;
    userProfile: {
      id: string;
      name?: string;
    };
  };
  approvedBy?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    userProfile?: {
      id: string;
      name: string | null;
    };
  };
  estimateLaborItems: EstimateLaborWithDetails[];
  estimatePartItems: EstimatePartWithDetails[];
  approvals: WorkOrderApproval[];
}

export interface EstimateLaborWithDetails {
  id: string;
  estimateId: string;
  laborCatalogId?: string | null;
  description: string;
  hours: number;
  rate: number;
  subtotal: number;
  notes?: string | null;
  customerApproved: boolean;
  customerNotes?: string | null;
  cannedServiceId?: string | null;
  serviceDiscountAmount?: number | null;
  serviceDiscountType?: 'FIXED' | 'PERCENTAGE' | null;
  createdAt: Date;
  updatedAt: Date;
  laborCatalog?: {
    id: string;
    code: string;
    name: string;
    estimatedHours: number;
    hourlyRate: number;
    category?: string;
  };
}

export interface EstimatePartWithDetails {
  id: string;
  estimateId: string;
  inventoryItemId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  source: PartSource;
  supplierName?: string | null;
  warrantyInfo?: string | null;
  notes?: string | null;
  customerApproved: boolean;
  customerNotes?: string | null;
  cannedServiceId?: string | null;
  serviceDiscountAmount?: number | null;
  serviceDiscountType?: 'FIXED' | 'PERCENTAGE' | null;
  createdAt: Date;
  updatedAt: Date;
  part: {
    id: string;
    name: string;
    sku?: string | null;
    partNumber?: string | null;
    manufacturer?: string | null;
  };
}

export interface EstimateStatistics {
  totalEstimates: number;
  approvedEstimates: number;
  pendingEstimates: number;
  averageEstimateAmount: number;
  totalEstimatedValue: number;
}

// Service Interface (for Dependency Injection)
export interface IEstimatesService {
  createEstimate(data: CreateEstimateRequest): Promise<EstimateWithDetails>;
  getEstimateById(id: string): Promise<EstimateWithDetails>;
  getEstimates(filters: EstimateFilters, page: number, limit: number): Promise<{ estimates: EstimateWithDetails[]; total: number }>;
  updateEstimate(id: string, data: UpdateEstimateRequest): Promise<EstimateWithDetails>;
  deleteEstimate(id: string): Promise<void>;
  createEstimateLabor(data: CreateEstimateLaborRequest): Promise<any>;
  updateEstimateLabor(id: string, data: UpdateEstimateLaborRequest): Promise<any>;
  deleteEstimateLabor(id: string): Promise<void>;
  createEstimatePart(data: CreateEstimatePartRequest): Promise<any>;
  updateEstimatePart(id: string, data: UpdateEstimatePartRequest): Promise<any>;
  deleteEstimatePart(id: string): Promise<void>;
  createEstimateApproval(data: CreateEstimateApprovalRequest): Promise<any>;
  updateEstimateApproval(id: string, data: UpdateEstimateApprovalRequest): Promise<any>;
  getEstimateStatistics(): Promise<EstimateStatistics>;
  approveEstimate(estimateId: string, approvedById: string): Promise<void>;
  addCannedServiceToEstimate(estimateId: string, cannedServiceId: string): Promise<EstimateWithDetails>;
  toggleEstimateVisibility(estimateId: string, isVisible: boolean): Promise<EstimateWithDetails>;
  getCustomerVisibleEstimates(workOrderId: string): Promise<EstimateWithDetails[]>;
}
