import { Router } from 'express';
import { PaymentController } from './payments.controller';
import {
  validateCreatePaymentIntent,
  validateCreateManualPayment,
  validateUpdatePayment,
  validatePaymentVerification,
  validateCreateRefund,
  validatePaymentFilters,
  validateWebhookData,
} from './payments.validation';
import { authenticateSupabaseToken, requireServiceAdvisor, requireManager } from '../auth/supabase/authSupabase.middleware';

const router = Router();
const paymentController = new PaymentController();

// Payment Intent Routes (for online payments)
router.post(
  '/payment-intents',
  authenticateSupabaseToken,
  validateCreatePaymentIntent,
  paymentController.createPaymentIntent.bind(paymentController)
);

// Manual Payment Routes (for cash, check, etc.)
router.post(
  '/manual',
  authenticateSupabaseToken,
  requireServiceAdvisor,
  validateCreateManualPayment,
  paymentController.createManualPayment.bind(paymentController)
);

// Payment Verification Routes
router.post(
  '/verify',
  authenticateSupabaseToken,
  validatePaymentVerification,
  paymentController.verifyPayment.bind(paymentController)
);

// Webhook Routes (for payment gateway callbacks)
router.post(
  '/webhooks/stripe',
  validateWebhookData,
  paymentController.processWebhook.bind(paymentController)
);

router.post(
  '/webhooks/paypal',
  validateWebhookData,
  paymentController.processWebhook.bind(paymentController)
);

router.post(
  '/webhooks/razorpay',
  validateWebhookData,
  paymentController.processWebhook.bind(paymentController)
);

// Payment Management Routes
router.get(
  '/',
  authenticateSupabaseToken,
  validatePaymentFilters,
  paymentController.getPayments.bind(paymentController)
);

router.get(
  '/:paymentId',
  authenticateSupabaseToken,
  paymentController.getPayment.bind(paymentController)
);

router.put(
  '/:paymentId',
  authenticateSupabaseToken,
  requireServiceAdvisor,
  validateUpdatePayment,
  paymentController.updatePayment.bind(paymentController)
);

// Refund Routes
router.post(
  '/refunds',
  authenticateSupabaseToken,
  requireServiceAdvisor,
  validateCreateRefund,
  paymentController.createRefund.bind(paymentController)
);

// Work Order Payment Summary Routes
router.get(
  '/work-orders/:workOrderId/summary',
  authenticateSupabaseToken,
  paymentController.getWorkOrderPaymentSummary.bind(paymentController)
);

// Payment Statistics Routes
router.get(
  '/statistics',
  authenticateSupabaseToken,
  requireManager,
  validatePaymentFilters,
  paymentController.getPaymentStatistics.bind(paymentController)
);

// Manual Payment Marking Routes
router.post(
  '/:paymentId/mark-as-paid',
  authenticateSupabaseToken,
  requireServiceAdvisor,
  paymentController.markAsPaid.bind(paymentController)
);

// Utility Routes
router.get(
  '/methods',
  authenticateSupabaseToken,
  paymentController.getPaymentMethods.bind(paymentController)
);

router.get(
  '/statuses',
  authenticateSupabaseToken,
  paymentController.getPaymentStatuses.bind(paymentController)
);

export default router;
