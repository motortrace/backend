import { UserRole } from './auth.types';

// UserProfile - stores additional profile data only
// Identity data (email, role) is managed by Supabase Auth
export interface UserProfile {
  id: string;
  supabaseUserId: string;  // Links to auth.users.id (UUID)
  name?: string;
  phone?: string;
  profileImage?: string;
  isRegistrationComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Customer - supports both app users and walk-ins
export interface Customer {
  id: string;
  userProfileId?: string;  // Nullable - links to UserProfile for app users, null for walk-ins
  name: string;
  email?: string;          // Optional for walk-ins, not unique
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  userProfile?: UserProfile;
  vehicles?: Vehicle[];
  workOrders?: WorkOrder[];
}

// StaffMember - extends Supabase auth for staff
export interface StaffMember {
  id: string;
  supabaseUserId: string;  // Links to auth.users.id (UUID)
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  workOrders?: WorkOrder[];
}

// Vehicle - belongs to a customer
export interface Vehicle {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year?: number;
  vin?: string;
  licensePlate?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  customer?: Customer;
  workOrders?: WorkOrder[];
}

// WorkOrder - service work for a vehicle
export interface WorkOrder {
  id: string;
  vehicleId: string;
  customerId: string;
  technicianId?: string;
  status: WorkOrderStatus;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  vehicle?: Vehicle;
  customer?: Customer;
  technician?: StaffMember;
  serviceItems?: ServiceItem[];
}

export enum WorkOrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// ServiceItem - individual service performed
export interface ServiceItem {
  id: string;
  workOrderId: string;
  serviceCatalogId?: string;
  description: string;
  cost: number;
  createdAt: Date;
  
  // Relations
  workOrder?: WorkOrder;
  serviceCatalog?: ServiceCatalog;
}

// ServiceCatalog - predefined services
export interface ServiceCatalog {
  id: string;
  code: string;
  name: string;
  description?: string;
  standardCost: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  serviceItems?: ServiceItem[];
}

// Create/Update DTOs
export interface CreateUserProfileDto {
  supabaseUserId: string;
  name?: string;
  phone?: string;
  profileImage?: string;
}

export interface UpdateUserProfileDto {
  name?: string;
  phone?: string;
  profileImage?: string;
  isRegistrationComplete?: boolean;
}

export interface CreateCustomerDto {
  userProfileId?: string;  // For app users
  name: string;
  email?: string;          // For walk-ins
  phone?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
}
