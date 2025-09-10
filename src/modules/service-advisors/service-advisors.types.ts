export interface CreateServiceAdvisorDto {
  userProfileId: string;
  employeeId?: string;
  department?: string;
}

export interface UpdateServiceAdvisorDto {
  employeeId?: string;
  department?: string;
}

export interface ServiceAdvisorFilters {
  search?: string;
  employeeId?: string;
  department?: string;
  hasWorkOrders?: boolean;
  hasAppointments?: boolean;
  limit?: number;
  offset?: number;
}

export interface ServiceAdvisorResponse {
  id: string;
  userProfileId: string;
  employeeId?: string;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
  userProfile?: {
    id: string;
    name?: string;
    phone?: string;
    profileImage?: string;
    role: string;
  };
  workOrdersCount?: number;
  appointmentsCount?: number;
  estimatesCount?: number;
}

export interface ServiceAdvisorStats {
  totalServiceAdvisors: number;
  serviceAdvisorsByDepartment: Array<{
    department: string;
    count: number;
  }>;
  activeServiceAdvisors: number;
  recentHires: ServiceAdvisorResponse[];
}

export interface WorkOrderResponse {
  id: string;
  workOrderNumber: string;
  createdAt: Date;
  updatedAt: Date;
  customerId: string;
  vehicleId: string;
  appointmentId?: string;
  advisorId?: string;
  status: string;
  jobType: string;
  priority: string;
  source: string;
  complaint?: string;
  odometerReading?: number;
  warrantyStatus: string;
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
  workflowStep: string;
  internalNotes?: string;
  customerNotes?: string;
  invoiceNumber?: string;
  finalizedAt?: Date;
  paymentStatus: string;
  warrantyClaimNumber?: string;
  thirdPartyApprovalCode?: string;
  campaignId?: string;
  servicePackageId?: string;
  customerSignature?: string;
  customerFeedback?: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year?: number;
    vin?: string;
    licensePlate?: string;
  };
  appointment?: {
    id: string;
    requestedAt: Date;
    startTime?: Date;
    endTime?: Date;
    status: string;
    priority: string;
    notes?: string;
  };
}
