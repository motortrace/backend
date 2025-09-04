import { PaymentMethod, PaymentStatus } from '@prisma/client';

// Payment Processing Types
export interface PaymentProcessorConfig {
  provider: 'stripe' | 'paypal' | 'razorpay' | 'manual';
  apiKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  environment: 'test' | 'live';
}

// Payment Intent/Request Types
export interface CreatePaymentIntentRequest {
  workOrderId: string;
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
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

// Manual Payment Types
export interface CreateManualPaymentRequest {
  workOrderId: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  notes?: string;
  processedById: string;
}

export interface UpdatePaymentRequest {
  paymentId: string;
  status?: PaymentStatus;
  reference?: string;
  notes?: string;
  refundAmount?: number;
  refundReason?: string;
}

// Payment Verification Types
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

// Payment Refund Types
export interface CreateRefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
  processedById: string;
}

// Payment Statistics Types
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

// Payment Filters
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

// Webhook Types
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

// Payment Response Types
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
  createdAt: Date;
  updatedAt: Date;
}

// Payment Summary Types
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

// Stripe-specific Types
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

// PayPal-specific Types
export interface PayPalOrder {
  id: string;
  status: string;
  amount: {
    currency_code: string;
    value: string;
  };
  intent: string;
}

// Razorpay-specific Types
export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt: string;
}

// Payment Gateway Response
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
