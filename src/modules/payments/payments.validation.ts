import Joi from 'joi';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

// Online Payment Creation Schema (Credit Card)
export const createOnlinePaymentSchema = Joi.object({
  workOrderId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().default('USD'),
  cardToken: Joi.string().optional(),
  paymentMethodId: Joi.string().optional(),
  customerEmail: Joi.string().email().optional(),
  customerPhone: Joi.string().optional(),
});

// Manual Payment Creation Schema (with image)
export const createManualPaymentSchema = Joi.object({
  workOrderId: Joi.string().required(),
  method: Joi.string().valid(...Object.values(PaymentMethod)).required(),
  amount: Joi.number().positive().required(),
  reference: Joi.string().optional(),
  notes: Joi.string().optional(),
  processedById: Joi.string().required(),
  paymentImage: Joi.string().optional(), // Base64 or URL of payment receipt
});

// Payment Update Schema
export const updatePaymentSchema = Joi.object({
  status: Joi.string().valid(...Object.values(PaymentStatus)).optional(),
  reference: Joi.string().optional(),
  notes: Joi.string().optional(),
  refundAmount: Joi.number().positive().optional(),
  refundReason: Joi.string().optional(),
  paymentImage: Joi.string().optional(), // For updating payment image
});

// Payment Verification Schema
export const paymentVerificationSchema = Joi.object({
  paymentIntentId: Joi.string().required(),
  provider: Joi.string().valid('stripe', 'paypal', 'razorpay').required(),
});

// Refund Creation Schema
export const createRefundSchema = Joi.object({
  paymentId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  reason: Joi.string().required(),
  processedById: Joi.string().required(),
});

// Payment Filters Schema
export const paymentFiltersSchema = Joi.object({
  workOrderId: Joi.string().optional(),
  method: Joi.string().valid(...Object.values(PaymentMethod)).optional(),
  status: Joi.string().valid(...Object.values(PaymentStatus)).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  minAmount: Joi.number().positive().optional(),
  maxAmount: Joi.number().positive().optional(),
  processedById: Joi.string().optional(),
});

// Webhook Validation Schema
export const webhookValidationSchema = Joi.object({
  event: Joi.string().required(),
  data: Joi.object({
    id: Joi.string().required(),
    object: Joi.string().required(),
    amount: Joi.number().optional(),
    currency: Joi.string().optional(),
    status: Joi.string().optional(),
    metadata: Joi.object().optional(),
  }).required(),
});

// Sandbox Payment Test Schema
export const sandboxPaymentTestSchema = Joi.object({
  workOrderId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  cardNumber: Joi.string().optional(), // For validation
});

// Validation Middleware Functions
export const validateCreateOnlinePayment = (req: any, res: any, next: any) => {
  const { error } = createOnlinePaymentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message,
    });
  }
  next();
};

export const validateCreateManualPayment = (req: any, res: any, next: any) => {
  const { error } = createManualPaymentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message,
    });
  }
  next();
};

export const validateUpdatePayment = (req: any, res: any, next: any) => {
  const { error } = updatePaymentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message,
    });
  }
  next();
};

export const validatePaymentVerification = (req: any, res: any, next: any) => {
  const { error } = paymentVerificationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message,
    });
  }
  next();
};

export const validateCreateRefund = (req: any, res: any, next: any) => {
  const { error } = createRefundSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message,
    });
  }
  next();
};

export const validatePaymentFilters = (req: any, res: any, next: any) => {
  const { error } = paymentFiltersSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message,
    });
  }
  next();
};

export const validateWebhookData = (req: any, res: any, next: any) => {
  const { error } = webhookValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid webhook data',
      error: error.details[0].message,
    });
  }
  next();
};

export const validateSandboxPaymentTest = (req: any, res: any, next: any) => {
  const { error } = sandboxPaymentTestSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message,
    });
  }
  next();
};
