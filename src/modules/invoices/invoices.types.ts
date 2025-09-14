import { 
  InvoiceStatus,
  LineItemType
} from '@prisma/client';

// Invoice Types
export interface CreateInvoiceRequest {
  workOrderId: string;
  dueDate?: Date;
  notes?: string;
  terms?: string;
}

export interface UpdateInvoiceRequest {
  status?: InvoiceStatus;
  dueDate?: Date;
  notes?: string;
  terms?: string;
  paidAmount?: number;
}

export interface InvoiceWithDetails {
  id: string;
  invoiceNumber: string;
  workOrderId: string;
  issueDate: Date;
  dueDate?: Date;
  status: InvoiceStatus;
  subtotalServices: number;
  subtotalLabor: number;
  subtotalParts: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  notes?: string;
  terms?: string;
  createdAt: Date;
  updatedAt: Date;
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
  lineItems: InvoiceLineItemWithDetails[];
}

export interface InvoiceLineItemWithDetails {
  id: string;
  invoiceId: string;
  type: LineItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  workOrderServiceId?: string;
  workOrderLaborId?: string;
  workOrderPartId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceFilters {
  workOrderId?: string;
  status?: InvoiceStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface InvoiceStatistics {
  totalInvoices: number;
  draftInvoices: number;
  sentInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  averageInvoiceAmount: number;
  totalOutstandingAmount: number;
}
