import { PaymentService } from './payments.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import prisma from '../../infrastructure/database/prisma';

// This is a demonstration file showing how to use the payment module
// In a real application, you would use a proper testing framework like Jest

export class PaymentModuleDemo {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService(prisma);
  }

  // Demo: Create a manual cash payment
  async demoManualCashPayment() {
    console.log('=== Manual Cash Payment Demo ===');
    
    try {
      const paymentData = {
        workOrderId: 'work-order-id-123',
        method: PaymentMethod.CASH,
        amount: 150.00,
        reference: 'CASH-001',
        notes: 'Customer paid in cash',
        processedById: 'service-advisor-id-456',
      };

      const payment = await this.paymentService.createManualPayment(paymentData);
      
      console.log(' Manual cash payment created successfully');
      console.log('Payment ID:', payment.id);
      console.log('Amount:', payment.amount);
      console.log('Status:', payment.status);
      console.log('Processed by:', payment.processedBy?.userProfile?.name);
      
      return payment;
    } catch (error) {
      console.error('❌ Failed to create manual payment:', error);
      throw error;
    }
  }

  // Demo: Create a payment intent for online payment
  async demoPaymentIntent() {
    console.log('=== Payment Intent Demo ===');
    
    try {
      const paymentIntentData = {
        workOrderId: 'work-order-id-123',
        amount: 200.00,
        currency: 'USD',
        description: 'Payment for work order WO-20241201-001',
        customerEmail: 'customer@example.com',
        customerPhone: '+1234567890',
        metadata: {
          workOrderNumber: 'WO-20241201-001',
          customerName: 'John Doe',
        },
      };

      const paymentIntent = await this.paymentService.createPaymentIntent(paymentIntentData);
      
      console.log(' Payment intent created successfully');
      console.log('Payment Intent ID:', paymentIntent.id);
      console.log('Client Secret:', paymentIntent.clientSecret);
      console.log('Amount:', paymentIntent.amount);
      console.log('Status:', paymentIntent.status);
      
      return paymentIntent;
    } catch (error) {
      console.error('❌ Failed to create payment intent:', error);
      throw error;
    }
  }

  // Demo: Get work order payment summary
  async demoPaymentSummary() {
    console.log('=== Payment Summary Demo ===');
    
    try {
      const workOrderId = 'work-order-id-123';
      const summary = await this.paymentService.getWorkOrderPaymentSummary(workOrderId);
      
      console.log(' Payment summary retrieved successfully');
      console.log('Work Order:', summary.workOrderNumber);
      console.log('Total Amount:', summary.totalAmount);
      console.log('Paid Amount:', summary.paidAmount);
      console.log('Remaining Amount:', summary.remainingAmount);
      console.log('Payment Status:', summary.paymentStatus);
      console.log('Number of Payments:', summary.payments.length);
      
      return summary;
    } catch (error) {
      console.error('❌ Failed to get payment summary:', error);
      throw error;
    }
  }

  // Demo: Create a refund
  async demoRefund() {
    console.log('=== Refund Demo ===');
    
    try {
      const refundData = {
        paymentId: 'payment-id-123',
        amount: 50.00,
        reason: 'Customer requested partial refund due to quality issue',
        processedById: 'service-advisor-id-456',
      };

      const refund = await this.paymentService.createRefund(refundData);
      
      console.log(' Refund created successfully');
      console.log('Refund Amount:', refund.refundAmount);
      console.log('Refund Reason:', refund.refundReason);
      console.log('Payment Status:', refund.status);
      
      return refund;
    } catch (error) {
      console.error('❌ Failed to create refund:', error);
      throw error;
    }
  }

  // Demo: Get payment statistics
  async demoPaymentStatistics() {
    console.log('=== Payment Statistics Demo ===');
    
    try {
      const filters = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        method: PaymentMethod.CASH,
      };

      const statistics = await this.paymentService.getPaymentStatistics(filters);
      
      console.log(' Payment statistics retrieved successfully');
      console.log('Total Payments:', statistics.totalPayments);
      console.log('Total Amount:', statistics.totalAmount);
      console.log('Average Payment Amount:', statistics.averagePaymentAmount);
      console.log('Recent Payments:', statistics.recentPayments.length);
      
      // Show breakdown by payment method
      console.log('\nPayments by Method:');
      Object.entries(statistics.paymentsByMethod).forEach(([method, data]) => {
        if (data.count > 0) {
          console.log(`  ${method}: ${data.count} payments, $${data.amount}`);
        }
      });
      
      return statistics;
    } catch (error) {
      console.error('❌ Failed to get payment statistics:', error);
      throw error;
    }
  }

  // Demo: Process webhook from payment gateway
  async demoWebhookProcessing() {
    console.log('=== Webhook Processing Demo ===');
    
    try {
      const webhookData = {
        event: 'payment_intent.succeeded',
        data: {
          id: 'pi_1234567890',
          object: 'payment_intent',
          amount: 20000, // $200.00 in cents
          currency: 'usd',
          status: 'succeeded',
          metadata: {
            workOrderId: 'work-order-id-123',
            workOrderNumber: 'WO-20241201-001',
          },
        },
      };

      const result = await this.paymentService.processWebhook(webhookData);
      
      if (result.success) {
        console.log(' Webhook processed successfully');
        console.log('Payment ID:', result.paymentId);
        console.log('Transaction ID:', result.transactionId);
        console.log('Status:', result.status);
        console.log('Amount:', result.amount);
      } else {
        console.log('❌ Webhook processing failed:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Failed to process webhook:', error);
      throw error;
    }
  }

  // Demo: Get payments with filters
  async demoGetPayments() {
    console.log('=== Get Payments Demo ===');
    
    try {
      const filters = {
        method: PaymentMethod.CASH,
        status: PaymentStatus.PAID,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        minAmount: 100,
        maxAmount: 500,
      };

      const payments = await this.paymentService.getPayments(filters);
      
      console.log(' Payments retrieved successfully');
      console.log('Number of payments:', payments.length);
      
      payments.forEach((payment, index) => {
        console.log(`\nPayment ${index + 1}:`);
        console.log(`  ID: ${payment.id}`);
        console.log(`  Amount: $${payment.amount}`);
        console.log(`  Method: ${payment.method}`);
        console.log(`  Status: ${payment.status}`);
        console.log(`  Date: ${payment.paidAt}`);
        console.log(`  Processed by: ${payment.processedBy?.userProfile?.name}`);
      });
      
      return payments;
    } catch (error) {
      console.error('❌ Failed to get payments:', error);
      throw error;
    }
  }

  // Run all demos
  async runAllDemos() {
    console.log(' Starting Payment Module Demos\n');
    
    try {
      // Note: These demos require actual database data to work properly
      // In a real scenario, you would set up test data first
      
      console.log('Note: These demos require actual database data to work properly.');
      console.log('In a real scenario, you would set up test data first.\n');
      
      // Uncomment the demos you want to run:
      
      // await this.demoManualCashPayment();
      // await this.demoPaymentIntent();
      // await this.demoPaymentSummary();
      // await this.demoRefund();
      // await this.demoPaymentStatistics();
      // await this.demoWebhookProcessing();
      // await this.demoGetPayments();
      
      console.log(' All demos completed successfully!');
    } catch (error) {
      console.error('❌ Demo failed:', error);
    }
  }
}

// Example usage:
// const demo = new PaymentModuleDemo();
// demo.runAllDemos();
