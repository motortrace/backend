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
