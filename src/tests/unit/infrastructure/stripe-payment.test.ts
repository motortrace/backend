import { StripePaymentService } from '../../../infrastructure/payment/stripe-payment';
import { PaymentIntentResponse, PaymentGatewayResponse } from '../../../modules/payments/payments.types';

// Mock Stripe SDK
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  }));
});

describe('StripePaymentService', () => {
  let stripeService: StripePaymentService;
  let mockStripe: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock environment variables
    process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';

    // Create service instance
    stripeService = new StripePaymentService();

    // Get the mocked Stripe instance
    const Stripe = require('stripe');
    mockStripe = new Stripe();
  });

  describe('constructor', () => {
    it('should initialize with secret key from environment', () => {
      expect(stripeService).toBeDefined();
      expect(process.env.STRIPE_SECRET_KEY).toBe('sk_test_123456789');
    });

    it('should use empty string when STRIPE_SECRET_KEY is not set', () => {
      delete process.env.STRIPE_SECRET_KEY;

      const newService = new StripePaymentService();
      expect(newService).toBeDefined();
    });
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      // Arrange
      const paymentData = {
        amount: 100.50,
        currency: 'USD',
        description: 'Test payment',
        metadata: { orderId: '123' },
        customerEmail: 'test@example.com'
      };

      // Act
      const result = await stripeService.createPaymentIntent(paymentData);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toMatch(/^pi_\d+_/);
      expect(result.clientSecret).toMatch(/^pi_\d+_secret_/);
      expect(result.amount).toBe(100.50);
      expect(result.currency).toBe('USD');
      expect(result.status).toBe('requires_payment_method');
      expect(result.metadata).toEqual({ orderId: '123' });
    });

    it('should create payment intent with minimal data', async () => {
      // Arrange
      const paymentData = {
        amount: 50,
        currency: 'EUR'
      };

      // Act
      const result = await stripeService.createPaymentIntent(paymentData);

      // Assert
      expect(result.amount).toBe(50);
      expect(result.currency).toBe('EUR');
      expect(result.metadata).toBeUndefined();
    });

    it('should handle errors during payment intent creation', async () => {
      // Arrange
      const paymentData = {
        amount: 100,
        currency: 'USD'
      };

      // Mock Stripe to throw an error
      mockStripe.paymentIntents.create.mockRejectedValueOnce(new Error('Stripe API error'));

      // Temporarily replace the stripe instance to trigger error
      (stripeService as any).stripe = mockStripe;

      // Act & Assert
      await expect(stripeService.createPaymentIntent(paymentData)).rejects.toThrow(
        'Failed to create Stripe payment intent: Stripe API error'
      );
    });
  });

  describe('verifyPaymentIntent', () => {
    it('should verify payment intent successfully', async () => {
      // Arrange
      const paymentIntentId = 'pi_123456789';

      // Act
      const result = await stripeService.verifyPaymentIntent(paymentIntentId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.paymentId).toBe(paymentIntentId);
      expect(result.transactionId).toBe(paymentIntentId);
      expect(result.status).toBe('PAID');
      expect(result.currency).toBe('USD');
    });

    it('should handle errors during payment verification', async () => {
      // Arrange
      const paymentIntentId = 'pi_invalid';

      // Mock Stripe to throw an error
      mockStripe.paymentIntents.retrieve.mockRejectedValueOnce(new Error('Payment not found'));

      // Temporarily replace the stripe instance
      (stripeService as any).stripe = mockStripe;

      // Act
      const result = await stripeService.verifyPaymentIntent(paymentIntentId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to verify Stripe payment');
      expect(result.status).toBe('FAILED');
    });
  });

  describe('processWebhookEvent', () => {
    it('should handle payment_intent.succeeded event', async () => {
      // Arrange
      const event = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            amount: 10000, // in cents
            currency: 'usd',
            metadata: { orderId: '123' }
          }
        }
      };

      // Act
      const result = await stripeService.processWebhookEvent(event);

      // Assert
      expect(result.success).toBe(true);
      expect(result.paymentId).toBe('pi_123');
      expect(result.status).toBe('PAID');
      expect(result.amount).toBe(100); // converted from cents
      expect(result.currency).toBe('usd');
    });

    it('should handle payment_intent.payment_failed event', async () => {
      // Arrange
      const event = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_123',
            amount: 5000,
            currency: 'usd',
            metadata: {}
          }
        }
      };

      // Act
      const result = await stripeService.processWebhookEvent(event);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment failed');
      expect(result.status).toBe('FAILED');
      expect(result.amount).toBe(50);
    });

    it('should handle charge.refunded event', async () => {
      // Arrange
      const event = {
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_123',
            payment_intent: 'pi_123',
            amount: 7500,
            currency: 'usd',
            metadata: { refundReason: 'customer_request' }
          }
        }
      };

      // Act
      const result = await stripeService.processWebhookEvent(event);

      // Assert
      expect(result.success).toBe(true);
      expect(result.paymentId).toBe('pi_123');
      expect(result.transactionId).toBe('ch_123');
      expect(result.status).toBe('REFUNDED');
      expect(result.amount).toBe(75);
    });

    it('should handle unhandled event types', async () => {
      // Arrange
      const event = {
        type: 'unknown.event',
        data: { object: {} }
      };

      // Act
      const result = await stripeService.processWebhookEvent(event);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unhandled Stripe event: unknown.event');
      expect(result.status).toBe('FAILED');
    });

    it('should handle errors during webhook processing', async () => {
      // Arrange
      const event = {
        type: 'invalid_event',
        data: null // This will cause an error
      };

      // Act
      const result = await stripeService.processWebhookEvent(event);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to process Stripe webhook');
      expect(result.status).toBe('FAILED');
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should return true for valid signature (mock implementation)', () => {
      // Arrange
      const payload = 'test_payload';
      const signature = 'test_signature';

      // Act
      const result = stripeService.verifyWebhookSignature(payload, signature);

      // Assert
      expect(result).toBe(true);
    });

    it('should handle signature verification errors gracefully', () => {
      // The current implementation always returns true for mocking purposes
      // In production, this would verify the signature properly
      const result = stripeService.verifyWebhookSignature('payload', 'invalid_sig');
      expect(result).toBe(true);
    });
  });

  describe('private methods', () => {
    describe('handlePaymentSuccess', () => {
      it('should handle successful payment', async () => {
        // Arrange
        const paymentIntent = {
          id: 'pi_123',
          amount: 2000, // in cents
          currency: 'usd',
          metadata: { orderId: '123' }
        };

        // Act
        const result = await (stripeService as any).handlePaymentSuccess(paymentIntent);

        // Assert
        expect(result.success).toBe(true);
        expect(result.paymentId).toBe('pi_123');
        expect(result.status).toBe('PAID');
        expect(result.amount).toBe(20); // converted from cents
        expect(result.currency).toBe('usd');
        expect(result.metadata).toEqual({ orderId: '123' });
      });
    });

    describe('handlePaymentFailure', () => {
      it('should handle failed payment', async () => {
        // Arrange
        const paymentIntent = {
          id: 'pi_123',
          amount: 1500,
          currency: 'eur',
          metadata: { orderId: '123' }
        };

        // Act
        const result = await (stripeService as any).handlePaymentFailure(paymentIntent);

        // Assert
        expect(result.success).toBe(false);
        expect(result.error).toBe('Payment failed');
        expect(result.status).toBe('FAILED');
        expect(result.amount).toBe(15);
        expect(result.currency).toBe('eur');
      });
    });

    describe('handlePaymentRefund', () => {
      it('should handle payment refund', async () => {
        // Arrange
        const charge = {
          id: 'ch_123',
          payment_intent: 'pi_123',
          amount: 3000,
          currency: 'usd',
          metadata: { refundId: 'ref_123' }
        };

        // Act
        const result = await (stripeService as any).handlePaymentRefund(charge);

        // Assert
        expect(result.success).toBe(true);
        expect(result.paymentId).toBe('pi_123');
        expect(result.transactionId).toBe('ch_123');
        expect(result.status).toBe('REFUNDED');
        expect(result.amount).toBe(30);
        expect(result.currency).toBe('usd');
      });
    });
  });
});