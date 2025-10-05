import { PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import {
  CreateManualPaymentRequest,
  CreateOnlinePaymentRequest,
  PaymentIntentResponse,
  UpdatePaymentRequest,
  PaymentVerificationRequest,
  PaymentVerificationResponse,
  CreateRefundRequest,
  PaymentStatistics,
  PaymentFilters,
  PaymentResponse,
  WorkOrderPaymentSummary,
  PaymentGatewayResponse,
  PaymentWebhookData,
} from './payments.types';
import prisma from '../../infrastructure/database/prisma';

export class PaymentService {
  // Create payment intent for online credit card payments (Stripe sandbox)
  async createPaymentIntent(data: CreateOnlinePaymentRequest): Promise<PaymentIntentResponse> {
    // Verify work order exists and get estimate amount
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: data.workOrderId },
      include: {
        customer: true,
        vehicle: true,
      },
    });

    if (!workOrder) {
      throw new Error('Work order not found');
    }

    // Use estimate amount if available, otherwise use provided amount
    const amount = workOrder.estimatedTotal ? Number(workOrder.estimatedTotal) : data.amount;

    // For sandbox testing, return a mock Stripe payment intent
    // In production, this would create a real Stripe payment intent
    const paymentIntent: PaymentIntentResponse = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency: data.currency || 'USD',
      status: 'requires_payment_method',
      metadata: {
        workOrderId: data.workOrderId,
        workOrderNumber: workOrder.workOrderNumber,
        customerName: workOrder.customer.name,
        vehicleInfo: `${workOrder.vehicle.make} ${workOrder.vehicle.model}`,
      },
    };

    return paymentIntent;
  }

  // Create manual payment (cash, check, etc.) with image upload
  async createManualPayment(data: CreateManualPaymentRequest): Promise<PaymentResponse> {
    // Verify work order exists
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: data.workOrderId },
    });

    if (!workOrder) {
      throw new Error('Work order not found');
    }

    // Verify service advisor exists
    const serviceAdvisor = await prisma.serviceAdvisor.findUnique({
      where: { id: data.processedById },
    });

    if (!serviceAdvisor) {
      throw new Error('Service advisor not found');
    }

    // Create payment record with image
    const payment = await prisma.payment.create({
      data: {
        workOrderId: data.workOrderId,
        method: data.method,
        amount: data.amount,
        reference: data.reference,
        status: PaymentStatus.PAID,
        processedById: data.processedById,
        notes: data.notes,
        paidAt: new Date(),
        // Store payment image URL in notes or create a separate field
        // For now, we'll store it in notes with a prefix
        ...(data.paymentImage && {
          notes: `${data.notes || ''}\n[PAYMENT_IMAGE:${data.paymentImage}]`,
        }),
      },
      include: {
        processedBy: {
          select: {
            id: true,
            employeeId: true,
            userProfile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Update work order payment status
    await this.updateWorkOrderPaymentStatus(data.workOrderId);

    return this.mapPaymentToResponse(payment);
  }

  // Process online payment (credit card) - sandbox mode
  async processOnlinePayment(data: CreateOnlinePaymentRequest): Promise<PaymentResponse> {
    // Verify work order exists
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: data.workOrderId },
    });

    if (!workOrder) {
      throw new Error('Work order not found');
    }

    // For sandbox testing, simulate successful payment
    // In production, this would process with Stripe
    const amount = workOrder.estimatedTotal ? Number(workOrder.estimatedTotal) : data.amount;
    
    // Generate mock transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        workOrderId: data.workOrderId,
        method: PaymentMethod.CREDIT_CARD,
        amount: amount,
        reference: transactionId,
        status: PaymentStatus.PAID,
        paidAt: new Date(),
        notes: 'Online payment processed via credit card',
      },
    });

    // Update work order payment status
    await this.updateWorkOrderPaymentStatus(data.workOrderId);

    return this.mapPaymentToResponse(payment);
  }

  // Verify payment from payment gateway (sandbox mode)
  async verifyPayment(data: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
    try {
      // In sandbox mode, always return successful verification
      // In production, this would verify with the actual payment provider
      const verification: PaymentVerificationResponse = {
        verified: true,
        status: PaymentStatus.PAID,
        amount: 0, // This would come from the payment provider
        currency: 'USD',
        transactionId: data.paymentIntentId,
      };

      return verification;
    } catch (error) {
      return {
        verified: false,
        status: PaymentStatus.FAILED,
        amount: 0,
        currency: 'USD',
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  // Process webhook from payment gateway (sandbox mode)
  async processWebhook(webhookData: PaymentWebhookData): Promise<PaymentGatewayResponse> {
    try {
      const { event, data } = webhookData;

      // Handle different webhook events
      switch (event) {
        case 'payment_intent.succeeded':
          return await this.handlePaymentSuccess(data);
        case 'payment_intent.payment_failed':
          return await this.handlePaymentFailure(data);
        case 'charge.refunded':
          return await this.handlePaymentRefund(data);
        default:
          return {
            success: false,
            error: `Unhandled event: ${event}`,
            status: PaymentStatus.FAILED,
            amount: 0,
            currency: 'USD',
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed',
        status: PaymentStatus.FAILED,
        amount: 0,
        currency: 'USD',
      };
    }
  }

  // Update payment record
  async updatePayment(paymentId: string, data: UpdatePaymentRequest): Promise<PaymentResponse> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: data.status,
        reference: data.reference,
        notes: data.notes,
        refundAmount: data.refundAmount,
        refundReason: data.refundReason,
        // Update payment image if provided
        ...(data.paymentImage && {
          notes: `${data.notes || payment.notes || ''}\n[PAYMENT_IMAGE:${data.paymentImage}]`,
        }),
      },
      include: {
        processedBy: {
          select: {
            id: true,
            employeeId: true,
            userProfile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Update work order payment status if payment status changed
    if (data.status && data.status !== payment.status) {
      await this.updateWorkOrderPaymentStatus(payment.workOrderId);
    }

    return this.mapPaymentToResponse(updatedPayment);
  }

  // Create refund
  async createRefund(data: CreateRefundRequest): Promise<PaymentResponse> {
    const payment = await prisma.payment.findUnique({
      where: { id: data.paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (data.amount > Number(payment.amount)) {
      throw new Error('Refund amount cannot exceed payment amount');
    }

    // Verify service advisor exists
    const serviceAdvisor = await prisma.serviceAdvisor.findUnique({
      where: { id: data.processedById },
    });

    if (!serviceAdvisor) {
      throw new Error('Service advisor not found');
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: data.paymentId },
      data: {
        refundAmount: data.amount,
        refundReason: data.reason,
        status: data.amount === Number(payment.amount) ? PaymentStatus.REFUNDED : PaymentStatus.PARTIAL_REFUND,
      },
      include: {
        processedBy: {
          select: {
            id: true,
            employeeId: true,
            userProfile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Update work order payment status
    await this.updateWorkOrderPaymentStatus(payment.workOrderId);

    return this.mapPaymentToResponse(updatedPayment);
  }

  // Get payment by ID
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        processedBy: {
          select: {
            id: true,
            employeeId: true,
            userProfile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return this.mapPaymentToResponse(payment);
  }

  // Get payments with filters
  async getPayments(filters: PaymentFilters): Promise<PaymentResponse[]> {
    const where: Prisma.PaymentWhereInput = {};

    if (filters.workOrderId) where.workOrderId = filters.workOrderId;
    if (filters.method) where.method = filters.method;
    if (filters.status) where.status = filters.status;
    if (filters.processedById) where.processedById = filters.processedById;
    if (filters.minAmount || filters.maxAmount) {
      where.amount = {};
      if (filters.minAmount) where.amount.gte = filters.minAmount;
      if (filters.maxAmount) where.amount.lte = filters.maxAmount;
    }
    if (filters.startDate || filters.endDate) {
      where.paidAt = {};
      if (filters.startDate) where.paidAt.gte = filters.startDate;
      if (filters.endDate) where.paidAt.lte = filters.endDate;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        processedBy: {
          select: {
            id: true,
            employeeId: true,
            userProfile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    return payments.map(payment => this.mapPaymentToResponse(payment));
  }

  // Get work order payment summary
  async getWorkOrderPaymentSummary(workOrderId: string): Promise<WorkOrderPaymentSummary> {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        payments: {
          include: {
            processedBy: {
              select: {
                id: true,
                employeeId: true,
                userProfile: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { paidAt: 'desc' },
        },
      },
    });

    if (!workOrder) {
      throw new Error('Work order not found');
    }

    const totalAmount = workOrder.totalAmount ? Number(workOrder.totalAmount) : 0;
    const paidAmount = workOrder.payments.reduce((sum, payment) => {
      const paymentAmount = Number(payment.amount);
      const refundAmount = payment.refundAmount ? Number(payment.refundAmount) : 0;
      return sum + paymentAmount - refundAmount;
    }, 0);

    const remainingAmount = totalAmount - paidAmount;
    const lastPaymentDate = workOrder.payments.length > 0 ? workOrder.payments[0].paidAt : undefined;

    return {
      workOrderId: workOrder.id,
      workOrderNumber: workOrder.workOrderNumber,
      totalAmount,
      paidAmount,
      remainingAmount,
      paymentStatus: workOrder.paymentStatus,
      payments: workOrder.payments.map(payment => this.mapPaymentToResponse(payment)),
      lastPaymentDate,
    };
  }

  // Get payment statistics
  async getPaymentStatistics(filters?: PaymentFilters): Promise<PaymentStatistics> {
    const where: Prisma.PaymentWhereInput = {};

    if (filters) {
      if (filters.workOrderId) where.workOrderId = filters.workOrderId;
      if (filters.method) where.method = filters.method;
      if (filters.status) where.status = filters.status;
      if (filters.processedById) where.processedById = filters.processedById;
      if (filters.startDate || filters.endDate) {
        where.paidAt = {};
        if (filters.startDate) where.paidAt.gte = filters.startDate;
        if (filters.endDate) where.paidAt.lte = filters.endDate;
      }
    }

    const payments = await prisma.payment.findMany({ where });

    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const averagePaymentAmount = totalPayments > 0 ? totalAmount / totalPayments : 0;

    // Group by payment method
    const paymentsByMethod: Record<PaymentMethod, { count: number; amount: number }> = {} as any;
    Object.values(PaymentMethod).forEach(method => {
      const methodPayments = payments.filter(p => p.method === method);
      paymentsByMethod[method] = {
        count: methodPayments.length,
        amount: methodPayments.reduce((sum, p) => sum + Number(p.amount), 0),
      };
    });

    // Group by payment status
    const paymentsByStatus: Record<PaymentStatus, { count: number; amount: number }> = {} as any;
    Object.values(PaymentStatus).forEach(status => {
      const statusPayments = payments.filter(p => p.status === status);
      paymentsByStatus[status] = {
        count: statusPayments.length,
        amount: statusPayments.reduce((sum, p) => sum + Number(p.amount), 0),
      };
    });

    // Recent payments
    const recentPayments = payments
      .slice(0, 10)
      .map(payment => ({
        id: payment.id,
        workOrderId: payment.workOrderId,
        amount: Number(payment.amount),
        method: payment.method,
        status: payment.status,
        paidAt: payment.paidAt,
      }));

    return {
      totalPayments,
      totalAmount,
      averagePaymentAmount,
      paymentsByMethod,
      paymentsByStatus,
      recentPayments,
    };
  }

  // Private helper methods
  private async updateWorkOrderPaymentStatus(workOrderId: string): Promise<void> {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: { payments: true },
    });

    if (!workOrder) return;

    const totalAmount = workOrder.totalAmount ? Number(workOrder.totalAmount) : 0;
    const totalPaid = workOrder.payments.reduce((sum, payment) => {
      const paymentAmount = Number(payment.amount);
      const refundAmount = payment.refundAmount ? Number(payment.refundAmount) : 0;
      return sum + paymentAmount - refundAmount;
    }, 0);

    let paymentStatus: PaymentStatus;
    if (totalPaid >= totalAmount) {
      paymentStatus = PaymentStatus.PAID;
    } else if (totalPaid > 0) {
      paymentStatus = PaymentStatus.PARTIALLY_PAID;
    } else {
      paymentStatus = PaymentStatus.PENDING;
    }

    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: { paymentStatus },
    });
  }

  private async handlePaymentSuccess(data: any): Promise<PaymentGatewayResponse> {
    // Extract work order ID from metadata
    const workOrderId = data.metadata?.workOrderId;
    if (!workOrderId) {
      return {
        success: false,
        error: 'Work order ID not found in payment metadata',
        status: PaymentStatus.FAILED,
        amount: 0,
        currency: 'USD',
      };
    }

    const payment = await this.createPaymentFromGateway({
      workOrderId,
      amount: data.amount / 100, // Convert from cents
      method: PaymentMethod.CREDIT_CARD,
      transactionId: data.id,
      status: PaymentStatus.PAID,
    });

    return {
      success: true,
      paymentId: payment.id,
      transactionId: data.id,
      status: PaymentStatus.PAID,
      amount: payment.amount,
      currency: 'USD',
      metadata: data.metadata,
    };
  }

  private async handlePaymentFailure(data: any): Promise<PaymentGatewayResponse> {
    return {
      success: false,
      error: 'Payment failed',
      status: PaymentStatus.FAILED,
      amount: data.amount / 100,
      currency: 'USD',
      metadata: data.metadata,
    };
  }

  private async handlePaymentRefund(data: any): Promise<PaymentGatewayResponse> {
    // Find payment by transaction ID
    const payment = await prisma.payment.findFirst({
      where: { reference: data.id },
    });

    if (!payment) {
      return {
        success: false,
        error: 'Payment not found for refund',
        status: PaymentStatus.FAILED,
        amount: 0,
        currency: 'USD',
      };
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        refundAmount: data.amount_refunded / 100,
        status: PaymentStatus.REFUNDED,
      },
    });

    await this.updateWorkOrderPaymentStatus(payment.workOrderId);

    return {
      success: true,
      paymentId: payment.id,
      transactionId: data.id,
      status: PaymentStatus.REFUNDED,
      amount: Number(updatedPayment.amount),
      currency: 'USD',
    };
  }

  private async createPaymentFromGateway(data: {
    workOrderId: string;
    amount: number;
    method: PaymentMethod;
    transactionId: string;
    status: PaymentStatus;
  }): Promise<PaymentResponse> {
    const payment = await prisma.payment.create({
      data: {
        workOrderId: data.workOrderId,
        method: data.method,
        amount: data.amount,
        reference: data.transactionId,
        status: data.status,
        paidAt: new Date(),
      },
      include: {
        processedBy: {
          select: {
            id: true,
            employeeId: true,
            userProfile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    await this.updateWorkOrderPaymentStatus(data.workOrderId);
    return this.mapPaymentToResponse(payment);
  }

  private mapPaymentToResponse(payment: any): PaymentResponse {
    // Extract payment image from notes if present
    let paymentImage: string | undefined;
    if (payment.notes) {
      const imageMatch = payment.notes.match(/\[PAYMENT_IMAGE:(.*?)\]/);
      if (imageMatch) {
        paymentImage = imageMatch[1];
      }
    }

    return {
      id: payment.id,
      workOrderId: payment.workOrderId,
      method: payment.method,
      amount: Number(payment.amount),
      status: payment.status,
      reference: payment.reference,
      paidAt: payment.paidAt,
      processedBy: payment.processedBy,
      notes: payment.notes,
      refundAmount: payment.refundAmount ? Number(payment.refundAmount) : undefined,
      refundReason: payment.refundReason,
      paymentImage,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
