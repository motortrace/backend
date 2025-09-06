import { PaymentMethod, PaymentStatus } from '@prisma/client';

// Simplified Payment Types
export interface CreateManualPaymentRequest {
  workOrderId: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  notes?: string;
  processedById: string;
  paymentImage?: string; // Base64 or URL of payment receipt/image
}

export interface CreateOnlinePaymentRequest {
  workOrderId: string;
  amount: number;
  currency?: string;
  cardToken?: string; // For Stripe token
  paymentMethodId?: string; // For saved payment methods
  customerEmail?: string;
  customerPhone?: string;
}

export interface PaymentIntentResponse {
  id: string;
  clientSecret?: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  metadata?: Record<string, any>;
}

export interface UpdatePaymentRequest {
  paymentId: string;
  status?: PaymentStatus;
  reference?: string;
  notes?: string;
  refundAmount?: number;
  refundReason?: string;
  paymentImage?: string; // For manual payments
}

export interface PaymentVerificationRequest {
  paymentIntentId: string;
  provider: 'stripe' | 'paypal' | 'razorpay';
}

export interface PaymentVerificationResponse {
  verified: boolean;
  status: PaymentStatus;
  amount: number;
  currency: string;
  transactionId?: string;
  error?: string;
}

export interface CreateRefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
  processedById: string;
}

export interface PaymentStatistics {
  totalPayments: number;
  totalAmount: number;
  averagePaymentAmount: number;
  paymentsByMethod: Record<PaymentMethod, { count: number; amount: number }>;
  paymentsByStatus: Record<PaymentStatus, { count: number; amount: number }>;
  recentPayments: Array<{
    id: string;
    workOrderId: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    paidAt: Date;
  }>;
}

export interface PaymentFilters {
  workOrderId?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  processedById?: string;
}

export interface PaymentWebhookData {
  event: string;
  data: {
    id: string;
    object: string;
    amount?: number;
    currency?: string;
    status?: string;
    metadata?: Record<string, any>;
    [key: string]: any;
  };
}

export interface PaymentResponse {
  id: string;
  workOrderId: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  reference?: string;
  paidAt: Date;
  processedBy?: {
    id: string;
    employeeId?: string;
    userProfile: {
      id: string;
      name?: string;
    };
  };
  notes?: string;
  refundAmount?: number;
  refundReason?: string;
  paymentImage?: string; // URL to payment receipt image
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkOrderPaymentSummary {
  workOrderId: string;
  workOrderNumber: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  payments: PaymentResponse[];
  lastPaymentDate?: Date;
}

// Stripe-specific Types for sandbox testing
export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  metadata?: Record<string, any>;
}

export interface StripePaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export interface PaymentGatewayResponse {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  error?: string;
  metadata?: Record<string, any>;
}

// Simplified payment methods - only what's needed
export enum SimplifiedPaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  CHEQUE = 'CHEQUE',
  BANK_TRANSFER = 'BANK_TRANSFER',
}
