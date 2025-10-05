import { 
  WorkOrderStatus, 
  JobType, 
  JobPriority, 
  JobSource, 
  WarrantyStatus, 
  WorkflowStep, 
  PaymentStatus,
  ServiceStatus,
  PartSource,
  PaymentMethod,
  ApprovalStatus,
  ApprovalMethod,
  ChecklistStatus,
  TirePosition,
  AttachmentCategory
} from '@prisma/client';

export interface CreateWorkOrderRequest {
  customerId: string;
  vehicleId: string;
  appointmentId?: string;
  advisorId?: string;
  status?: WorkOrderStatus;
  jobType?: JobType;
  priority?: JobPriority;
  source?: JobSource;
  complaint?: string;
  odometerReading?: number;
  warrantyStatus?: WarrantyStatus;
  estimatedTotal?: number;
  estimateNotes?: string;
  promisedAt?: Date;
  internalNotes?: string;
  customerNotes?: string;
  cannedServiceIds?: string[];
  quantities?: number[];
  prices?: number[];
  serviceNotes?: string[];
}

export interface UpdateWorkOrderRequest {
  status?: WorkOrderStatus;
  jobType?: JobType;
  priority?: JobPriority;
  complaint?: string;
  odometerReading?: number;
  warrantyStatus?: WarrantyStatus;
  estimatedTotal?: number;
  estimateNotes?: string;
  promisedAt?: Date;
  internalNotes?: string;
  customerNotes?: string;
  advisorId?: string;
  openedAt?: Date;
  closedAt?: Date;
  workflowStep?: WorkflowStep;
  invoiceNumber?: string;
  finalizedAt?: Date;
  paymentStatus?: PaymentStatus;
  warrantyClaimNumber?: string;
  thirdPartyApprovalCode?: string;
  customerSignature?: string;
  customerFeedback?: string;
}

export interface WorkOrderFilters {
  status?: WorkOrderStatus;
  jobType?: JobType;
  priority?: JobPriority;
  source?: JobSource;
  customerId?: string;
  vehicleId?: string;
  advisorId?: string;
  startDate?: Date;
  endDate?: Date;
  workflowStep?: WorkflowStep;
  paymentStatus?: PaymentStatus;
}

export interface WorkOrderWithDetails {
  id: string;
  workOrderNumber: string;
  createdAt: Date;
  updatedAt: Date;
  customerId: string;
  vehicleId: string;
  appointmentId?: string;
  advisorId?: string;
  technicianId?: string;
  status: WorkOrderStatus;
  jobType: JobType;
  priority: JobPriority;
  source: JobSource;
  complaint?: string;
  odometerReading?: number;
  warrantyStatus: WarrantyStatus;
  estimatedTotal?: number;
  estimateNotes?: string;
  estimateApproved: boolean;
  subtotalLabor?: number;
  subtotalParts?: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
  paidAmount: number;
  openedAt?: Date;
  promisedAt?: Date;
  closedAt?: Date;
  workflowStep: WorkflowStep;
  internalNotes?: string;
  customerNotes?: string;
  invoiceNumber?: string;
  finalizedAt?: Date;
  paymentStatus: PaymentStatus;
  warrantyClaimNumber?: string;
  thirdPartyApprovalCode?: string;
  campaignId?: string;
  servicePackageId?: string;
  customerSignature?: string;
  customerFeedback?: string;
  
  // Relations
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
    vin?: string;
  };
  appointment?: {
    id: string;
    requestedAt: Date;
    startTime?: Date;
    endTime?: Date;
  };
  serviceAdvisor?: {
    id: string;
    employeeId?: string;
    department?: string;
    userProfile: {
      id: string;
      name?: string;
      phone?: string;
    };
  };
  services: {
    id: string;
    cannedServiceId: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    status: ServiceStatus;
    notes?: string;
    cannedService: {
      id: string;
      code: string;
      name: string;
      description?: string;
      duration: number;
      price: number;
    };
  }[];
  inspections: {
    id: string;
    inspectorId: string;
    date: Date;
    notes?: string;
    inspector: {
      id: string;
      employeeId?: string;
      userProfile: {
        id: string;
        name?: string;
      };
    };
  }[];
  laborItems: {
    id: string;
    laborCatalogId?: string;
    description: string;
    hours: number;
    rate: number;
    subtotal: number;
    technicianId?: string;
    startTime?: Date;
    endTime?: Date;
    status: ServiceStatus;
    notes?: string;
    laborCatalog?: {
      id: string;
      code: string;
      name: string;
      estimatedHours: number;
      hourlyRate: number;
    };
    technician?: {
      id: string;
      employeeId?: string;
      userProfile: {
        id: string;
        name?: string;
      };
    };
  }[];
  partsUsed: {
    id: string;
    inventoryItemId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    source: PartSource;
    supplierName?: string;
    supplierInvoice?: string;
    warrantyInfo?: string;
    notes?: string;
    installedAt?: Date;
    installedById?: string;
    part: {
      id: string;
      name: string;
      sku?: string;
      partNumber?: string;
      manufacturer?: string;
    };
    installedBy?: {
      id: string;
      employeeId?: string;
      userProfile: {
        id: string;
        name?: string;
      };
    };
  }[];
  payments: {
    id: string;
    method: PaymentMethod;
    amount: number;
    reference?: string;
    status: PaymentStatus;
    paidAt: Date;
    processedById?: string;
    notes?: string;
    refundAmount?: number;
    refundReason?: string;
    processedBy?: {
      id: string;
      employeeId?: string;
      userProfile: {
        id: string;
        name?: string;
      };
    };
  }[];
  estimates: {
    id: string;
    version: number;
    description?: string;
    totalAmount: number;
    laborAmount?: number;
    partsAmount?: number;
    taxAmount?: number;
    discountAmount?: number;
    notes?: string;
    createdById?: string;
    approved: boolean;
    approvedAt?: Date;
    approvedById?: string;
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
      employeeId?: string;
      userProfile: {
        id: string;
        name?: string;
      };
    };
  }[];
  attachments: {
    id: string;
    fileUrl: string;
    fileName?: string;
    fileType: string;
    fileSize?: number;
    description?: string;
    category: AttachmentCategory;
    uploadedById?: string;
    uploadedAt: Date;
    uploadedBy?: {
      id: string;
      employeeId?: string;
      userProfile: {
        id: string;
        name?: string;
      };
    };
  }[];
}



export interface CreateWorkOrderServiceRequest {
  workOrderId: string;
  cannedServiceId: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  notes?: string;
}

export interface UpdateWorkOrderLaborRequest {
  description?: string;
  hours?: number;
  rate?: number;
  subtotal?: number;
  technicianId?: string;
  startTime?: Date;
  endTime?: Date;
  status?: ServiceStatus;
  notes?: string;
}

export interface CreatePaymentRequest {
  workOrderId: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  notes?: string;
  processedById?: string;
}

export interface WorkOrderStatistics {
  totalWorkOrders: number;
  pendingWorkOrders: number;
  inProgressWorkOrders: number;
  completedWorkOrders: number;
  cancelledWorkOrders: number;
  totalRevenue: number;
  averageCompletionTime: number;
  topTechnicians: {
    technicianId: string;
    technicianName: string;
    completedWorkOrders: number;
    totalHours: number;
  }[];
  topServices: {
    serviceId: string;
    serviceName: string;
    usageCount: number;
    totalRevenue: number;
  }[];
}

// Service Interface (for Dependency Injection)
export interface IWorkOrderService {
  createWorkOrder(data: CreateWorkOrderRequest): Promise<any>;
  getWorkOrders(filters: WorkOrderFilters): Promise<any[]>;
  getWorkOrderById(id: string): Promise<any>;
  updateWorkOrder(id: string, data: UpdateWorkOrderRequest): Promise<any>;
  deleteWorkOrder(id: string): Promise<any>;
  restoreWorkOrder(id: string): Promise<any>;
  getCancelledWorkOrders(): Promise<any[]>;
  createWorkOrderService(data: CreateWorkOrderServiceRequest): Promise<any>;
  getWorkOrderServices(workOrderId: string): Promise<any>;
  createPayment(data: CreatePaymentRequest): Promise<any>;
  getWorkOrderPayments(workOrderId: string): Promise<any>;
  updateWorkOrderStatus(id: string, status: any, workflowStep?: any): Promise<any>;
  assignServiceAdvisor(id: string, advisorId: string): Promise<any>;
  assignTechnicianToLabor(laborId: string, technicianId: string): Promise<any>;
  updateWorkOrderLabor(laborId: string, data: UpdateWorkOrderLaborRequest): Promise<any>;
  resetWorkOrderLaborSubtotal(laborId: string): Promise<any>;
  getWorkOrderStatistics(filters: { startDate?: Date; endDate?: Date }): Promise<WorkOrderStatistics>;
  searchWorkOrders(query: string, filters: WorkOrderFilters): Promise<any>;
  uploadWorkOrderAttachment(workOrderId: string, data: any): Promise<any>;
  getWorkOrderAttachments(workOrderId: string, category?: string): Promise<any>;
  createWorkOrderInspection(workOrderId: string, inspectorId: string, notes?: string): Promise<any>;
  getWorkOrderInspections(workOrderId: string): Promise<any>;
  createWorkOrderQC(workOrderId: string, data: any): Promise<any>;
  getWorkOrderQC(workOrderId: string): Promise<any>;
  findServiceAdvisorBySupabaseUserId(supabaseUserId: string): Promise<any>;
  generateEstimateFromLaborAndParts(workOrderId: string, serviceAdvisorId: string): Promise<any>;
}
