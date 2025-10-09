export interface Customer {
  id: string;
  userProfileId?: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  userProfile?: {
    id: string;
    name?: string;
    phone?: string;
    profileImage?: string;
    role: string;
    isRegistrationComplete: boolean;
  };
  vehicles?: Vehicle[];
  workOrders?: WorkOrder[];
  appointments?: Appointment[];
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year?: number;
  vin?: string;
  licensePlate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  status: string;
  jobType: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  requestedAt: Date;
  startTime?: Date;
  endTime?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDto {
  userProfileId?: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CustomerFilters {
  search?: string;
  email?: string;
  phone?: string;
  hasVehicles?: boolean;
  hasWorkOrders?: boolean;
  limit?: number;
  offset?: number;
}

export interface CustomerResponse {
  success: boolean;
  data?: Customer | Customer[];
  message: string;
  error?: string;
}

// Service Interface (for Dependency Injection)
export interface ICustomerService {
  createCustomer(customerData: CreateCustomerDto): Promise<Customer>;
  getCustomerById(id: string): Promise<Customer | null>;
  getCustomerByUserProfileId(userProfileId: string): Promise<Customer | null>;
  getCustomers(filters: CustomerFilters): Promise<Customer[]>;
  updateCustomer(id: string, customerData: UpdateCustomerDto): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;
  getCustomerVehicles(customerId: string): Promise<any>;
  getCustomerWorkOrders(customerId: string): Promise<any>;
  getCustomerAppointments(customerId: string): Promise<any>;
  getCustomerStatistics(customerId: string): Promise<CustomerStatistics>;
}

export interface CustomerStatistics {
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    customerSince: Date;
    customerLifetimeDays: number;
  };
  financials: {
    totalSpent: number;
    totalPaid: number;
    outstandingBalance: number;
    averageTicket: number;
    currency: string;
  };
  visits: {
    totalWorkOrders: number;
    completedWorkOrders: number;
    lastVisit: Date | null;
    daysSinceLastVisit: number | null;
    averageVisitGapDays: number | null;
    predictedNextVisit: Date | null;
    firstVisit: Date;
    monthlyVisitTrend: Record<string, number>;
  };
  vehicles: {
    totalVehicles: number;
    vehicleList: Array<{
      id: string;
      display: string;
      addedOn: Date;
    }>;
    mostServicedVehicle: [string, number] | null;
  };
  appointments: {
    totalAppointments: number;
    completedAppointments: number;
    appointmentShowRate: number;
    statusBreakdown: Record<string, number>;
  };
  workOrderBreakdown: {
    byStatus: Record<string, number>;
    byJobType: Record<string, number>;
    byVehicle: Record<string, number>;
  };
  customerProfile: {
    isReturningCustomer: boolean;
    isActiveCustomer: boolean;
    isAtRisk: boolean;
    loyaltyScore: number;
  };
  paymentBehavior: {
    totalPayments: number;
    completedPayments: number;
    paymentCompletionRate: number;
  };
}
