import { UserRole } from './auth.types';
import { InventoryItem } from '@prisma/client';

// User Profile - extends Supabase auth.users
// Only stores additional profile data, not identity data
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
  services?: WorkOrderService[];
}

export enum WorkOrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// WorkOrderService - individual service performed with better tracking
export interface WorkOrderService {
  id: string;
  workOrderId: string;
  cannedServiceId: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  status: ServiceStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  workOrder?: WorkOrder;
  cannedService?: CannedService;
}

export enum ServiceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// CannedService - predefined services (renamed from ServiceCatalog)
export interface CannedService {
  id: string;
  code: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  laborOperations?: CannedServiceLabor[];
  partsCategories?: CannedServicePartsCategory[];
  services?: WorkOrderService[];
}

// Junction table for CannedService to LaborCatalog
export interface CannedServiceLabor {
  id: string;
  cannedServiceId: string;
  laborCatalogId: string;
  sequence: number;
  notes?: string;
  
  // Relations
  cannedService?: CannedService;
  laborCatalog?: LaborCatalog;
}

// Junction table for CannedService to InventoryCategory
export interface CannedServicePartsCategory {
  id: string;
  cannedServiceId: string;
  categoryId: string;
  isRequired: boolean;
  notes?: string;
  
  // Relations
  cannedService?: CannedService;
  category?: InventoryCategory;
}

// LaborCatalog - blueprint labor operations
export interface LaborCatalog {
  id: string;
  code: string;
  name: string;
  description?: string;
  estimatedHours: number;
  hourlyRate: number;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  cannedServices?: CannedService[];
}

// InventoryCategory - parts categories
export interface InventoryCategory {
  id: string;
  name: string;
  
  // Relations
  inventoryItems?: InventoryItem[];
  cannedServices?: CannedService[];
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
