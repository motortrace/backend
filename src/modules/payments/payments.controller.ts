import { Request, Response } from 'express';
import { PaymentService } from './payments.service';
import {
  CreatePaymentIntentRequest,
  CreateManualPaymentRequest,
  UpdatePaymentRequest,
  PaymentVerificationRequest,
  CreateRefundRequest,
  PaymentFilters,
  PaymentWebhookData,
} from './payments.types';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  // Create payment intent for online payments
  async createPaymentIntent(req: Request, res: Response) {
    try {
      const paymentIntentData: CreatePaymentIntentRequest = req.body;
      const paymentIntent = await this.paymentService.createPaymentIntent(paymentIntentData);

      res.status(201).json({
        success: true,
        data: paymentIntent,
        message: 'Payment intent created successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create payment intent',
      });
    }
  }

  // Create manual payment (for cash, check, etc.)
  async createManualPayment(req: Request, res: Response) {
    try {
      const paymentData: CreateManualPaymentRequest = req.body;
      const payment = await this.paymentService.createManualPayment(paymentData);

      res.status(201).json({
        success: true,
        data: payment,
        message: 'Manual payment created successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create manual payment',
      });
    }
  }

  // Verify payment from payment gateway
  async verifyPayment(req: Request, res: Response) {
    try {
      const verificationData: PaymentVerificationRequest = req.body;
      const verification = await this.paymentService.verifyPayment(verificationData);

      res.status(200).json({
        success: true,
        data: verification,
        message: verification.verified ? 'Payment verified successfully' : 'Payment verification failed',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to verify payment',
      });
    }
  }

  // Process webhook from payment gateway
  async processWebhook(req: Request, res: Response) {
    try {
      const webhookData: PaymentWebhookData = req.body;
      const result = await this.paymentService.processWebhook(webhookData);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result,
          message: 'Webhook processed successfully',
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Webhook processing failed',
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Webhook processing failed',
      });
    }
  }

  // Get payment by ID
  async getPayment(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const payment = await this.paymentService.getPayment(paymentId);

      res.status(200).json({
        success: true,
        data: payment,
        message: 'Payment retrieved successfully',
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : 'Payment not found',
      });
    }
  }

  // Get payments with filters
  async getPayments(req: Request, res: Response) {
    try {
      const filters: PaymentFilters = {
        workOrderId: req.query.workOrderId as string,
        method: req.query.method as any,
        status: req.query.status as any,
        processedById: req.query.processedById as string,
        minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
        maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      };

      const payments = await this.paymentService.getPayments(filters);

      res.status(200).json({
        success: true,
        data: payments,
        message: 'Payments retrieved successfully',
        count: payments.length,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve payments',
      });
    }
  }

  // Update payment
  async updatePayment(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const updateData: UpdatePaymentRequest = req.body;
      const payment = await this.paymentService.updatePayment(paymentId, updateData);

      res.status(200).json({
        success: true,
        data: payment,
        message: 'Payment updated successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update payment',
      });
    }
  }

  // Create refund
  async createRefund(req: Request, res: Response) {
    try {
      const refundData: CreateRefundRequest = req.body;
      const payment = await this.paymentService.createRefund(refundData);

      res.status(201).json({
        success: true,
        data: payment,
        message: 'Refund created successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create refund',
      });
    }
  }

  // Get work order payment summary
  async getWorkOrderPaymentSummary(req: Request, res: Response) {
    try {
      const { workOrderId } = req.params;
      const summary = await this.paymentService.getWorkOrderPaymentSummary(workOrderId);

      res.status(200).json({
        success: true,
        data: summary,
        message: 'Payment summary retrieved successfully',
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : 'Work order not found',
      });
    }
  }

  // Get payment statistics
  async getPaymentStatistics(req: Request, res: Response) {
    try {
      const filters: PaymentFilters = {
        workOrderId: req.query.workOrderId as string,
        method: req.query.method as any,
        status: req.query.status as any,
        processedById: req.query.processedById as string,
        minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
        maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      };

      const statistics = await this.paymentService.getPaymentStatistics(filters);

      res.status(200).json({
        success: true,
        data: statistics,
        message: 'Payment statistics retrieved successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve payment statistics',
      });
    }
  }

  // Mark payment as paid (for manual cash payments)
  async markAsPaid(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const { processedById } = req.body;

      if (!processedById) {
        return res.status(400).json({
          success: false,
          message: 'Service advisor ID is required',
        });
      }

      const payment = await this.paymentService.updatePayment(paymentId, {
        status: 'PAID',
        notes: 'Marked as paid manually by service advisor',
        paymentId: paymentId,
      });

      res.status(200).json({
        success: true,
        data: payment,
        message: 'Payment marked as paid successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark payment as paid',
      });
    }
  }

  // Get payment methods available
  async getPaymentMethods(req: Request, res: Response) {
    try {
      const paymentMethods = [
        { value: 'CASH', label: 'Cash' },
        { value: 'CREDIT_CARD', label: 'Credit Card' },
        { value: 'DEBIT_CARD', label: 'Debit Card' },
        { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
        { value: 'UPI', label: 'UPI' },
        { value: 'CHEQUE', label: 'Cheque' },
        { value: 'DIGITAL_WALLET', label: 'Digital Wallet' },
        { value: 'INSURANCE', label: 'Insurance' },
        { value: 'WARRANTY', label: 'Warranty' },
      ];

      res.status(200).json({
        success: true,
        data: paymentMethods,
        message: 'Payment methods retrieved successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment methods',
      });
    }
  }

  // Get payment statuses available
  async getPaymentStatuses(req: Request, res: Response) {
    try {
      const paymentStatuses = [
        { value: 'PENDING', label: 'Pending' },
        { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
        { value: 'PAID', label: 'Paid' },
        { value: 'OVERDUE', label: 'Overdue' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'FAILED', label: 'Failed' },
        { value: 'REFUNDED', label: 'Refunded' },
        { value: 'PARTIAL_REFUND', label: 'Partial Refund' },
        { value: 'CANCELLED', label: 'Cancelled' },
      ];

      res.status(200).json({
        success: true,
        data: paymentStatuses,
        message: 'Payment statuses retrieved successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment statuses',
      });
    }
  }
}
