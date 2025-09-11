export interface CreateTechnicianDto {
  userProfileId: string;
  employeeId?: string;
  specialization?: string;
  certifications?: string[];
}

export interface UpdateTechnicianDto {
  employeeId?: string;
  specialization?: string;
  certifications?: string[];
}

export interface TechnicianFilters {
  search?: string;
  employeeId?: string;
  specialization?: string;
  hasInspections?: boolean;
  hasLaborItems?: boolean;
  limit?: number;
  offset?: number;
}

export interface TechnicianResponse {
  id: string;
  userProfileId: string;
  employeeId?: string;
  specialization?: string;
  certifications: string[];
  createdAt: Date;
  updatedAt: Date;
  userProfile?: {
    id: string;
    name?: string;
    phone?: string;
    profileImage?: string;
    role: string;
  };
  inspectionsCount?: number;
  qcChecksCount?: number;
  laborItemsCount?: number;
  partInstallationsCount?: number;
}

export interface TechnicianStats {
  totalTechnicians: number;
  techniciansBySpecialization: Array<{
    specialization: string;
    count: number;
  }>;
  activeTechnicians: number;
  recentHires: TechnicianResponse[];
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
  technicians?: {
    id: string;
    employeeId?: string;
    userProfile: {
      id: string;
      name?: string;
      phone?: string;
    };
  }[];
}
