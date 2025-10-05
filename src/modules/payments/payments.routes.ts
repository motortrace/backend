import { Router } from 'express';
import { PaymentController } from './payments.controller';
import { PaymentService } from './payments.service';
import {
  validateCreateOnlinePayment,
  validateCreateManualPayment,
  validateUpdatePayment,
  validatePaymentVerification,
  validateCreateRefund,
  validatePaymentFilters,
  validateWebhookData,
  validateSandboxPaymentTest,
} from './payments.validation';
import { authenticateSupabaseToken, requireServiceAdvisor, requireManager } from '../auth/supabase/authSupabase.middleware';
import prisma from '../../infrastructure/database/prisma';

const router = Router();
const paymentService = new PaymentService(prisma);
const paymentController = new PaymentController(paymentService);

// Online Payment Routes (Credit Card)
router.post(
  '/payment-intents',
  authenticateSupabaseToken,
  validateCreateOnlinePayment,
  paymentController.createPaymentIntent.bind(paymentController)
);

router.post(
  '/online',
  authenticateSupabaseToken,
  validateCreateOnlinePayment,
  paymentController.processOnlinePayment.bind(paymentController)
);

// Sandbox Testing Route
router.post(
  '/sandbox/test',
  authenticateSupabaseToken,
  validateSandboxPaymentTest,
  paymentController.testSandboxPayment.bind(paymentController)
);

// Manual Payment Routes (Cash, Check, etc. with image)
router.post(
  '/manual',
  authenticateSupabaseToken,
  requireServiceAdvisor,
  validateCreateManualPayment,
  paymentController.createManualPayment.bind(paymentController)
);

// Payment Verification Routes (Sandbox mode)
router.post(
  '/verify',
  authenticateSupabaseToken,
  validatePaymentVerification,
  paymentController.verifyPayment.bind(paymentController)
);

// Webhook Routes (for payment gateway callbacks - sandbox mode)
router.post(
  '/webhooks/stripe',
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

// Manual Payment Marking Routes (with image)
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
