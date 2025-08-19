# Payment Module

A comprehensive payment processing module for the MotorTrace backend that supports both manual payments (cash, check, etc.) and automated payment gateway integrations (Stripe, PayPal, Razorpay).

## Features

### Manual Payment Processing
- **Service Advisor Manual Payments**: Service advisors can manually mark payments as paid for in-person cash transactions
- **Multiple Payment Methods**: Support for cash, credit card, debit card, bank transfer, UPI, cheque, digital wallet, insurance, and warranty payments
- **Payment Tracking**: Complete tracking of payment status, amounts, and processing history

### Automated Payment Gateway Integration
- **Payment Intents**: Create payment intents for online payments
- **Webhook Processing**: Automatic payment verification through webhooks
- **Multiple Providers**: Support for Stripe, PayPal, and Razorpay
- **Automatic Status Updates**: Work order payment status automatically updated based on payment processing

### Payment Management
- **Payment Summaries**: Get comprehensive payment summaries for work orders
- **Payment Statistics**: Detailed analytics and reporting
- **Refund Processing**: Support for full and partial refunds
- **Payment History**: Complete audit trail of all payment activities

## API Endpoints

### Payment Intents (Online Payments)
```
POST /api/payments/payment-intents
```
Create a payment intent for online payment processing.

**Request Body:**
```json
{
  "workOrderId": "string",
  "amount": 150.00,
  "currency": "USD",
  "description": "Payment for work order WO-20241201-001",
  "customerEmail": "customer@example.com",
  "customerPhone": "+1234567890"
}
```

### Manual Payments
```
POST /api/payments/manual
```
Create a manual payment record (requires service advisor role).

**Request Body:**
```json
{
  "workOrderId": "string",
  "method": "CASH",
  "amount": 150.00,
  "reference": "CASH-001",
  "notes": "Customer paid in cash",
  "processedById": "service-advisor-id"
}
```

### Payment Verification
```
POST /api/payments/verify
```
Verify a payment from a payment gateway.

**Request Body:**
```json
{
  "paymentIntentId": "pi_1234567890",
  "provider": "stripe"
}
```

### Webhook Processing
```
POST /api/payments/webhooks/stripe
POST /api/payments/webhooks/paypal
POST /api/payments/webhooks/razorpay
```
Process webhooks from payment gateways.

### Payment Management
```
GET /api/payments
GET /api/payments/:paymentId
PUT /api/payments/:paymentId
```
Retrieve and update payment records.

### Refunds
```
POST /api/payments/refunds
```
Create a refund for a payment.

**Request Body:**
```json
{
  "paymentId": "string",
  "amount": 50.00,
  "reason": "Customer requested partial refund",
  "processedById": "service-advisor-id"
}
```

### Work Order Payment Summary
```
GET /api/payments/work-orders/:workOrderId/summary
```
Get payment summary for a specific work order.

### Payment Statistics
```
GET /api/payments/statistics
```
Get payment statistics and analytics (requires manager role).

### Manual Payment Marking
```
POST /api/payments/:paymentId/mark-as-paid
```
Mark a payment as paid manually (for service advisors).

**Request Body:**
```json
{
  "processedById": "service-advisor-id"
}
```

### Utility Endpoints
```
GET /api/payments/methods
GET /api/payments/statuses
```
Get available payment methods and statuses.

## Payment Methods

The module supports the following payment methods:

- **CASH**: Cash payments
- **CREDIT_CARD**: Credit card payments
- **DEBIT_CARD**: Debit card payments
- **BANK_TRANSFER**: Bank transfer payments
- **UPI**: UPI payments
- **CHEQUE**: Cheque payments
- **DIGITAL_WALLET**: Digital wallet payments
- **INSURANCE**: Insurance payments
- **WARRANTY**: Warranty payments

## Payment Statuses

- **PENDING**: Payment is pending
- **PARTIALLY_PAID**: Partial payment received
- **PAID**: Payment completed
- **OVERDUE**: Payment is overdue
- **COMPLETED**: Payment process completed
- **FAILED**: Payment failed
- **REFUNDED**: Payment refunded
- **PARTIAL_REFUND**: Partial refund issued
- **CANCELLED**: Payment cancelled

## Authentication & Authorization

- **Authentication**: All endpoints require valid Supabase authentication token
- **Service Advisor Role**: Required for creating manual payments, updating payments, and creating refunds
- **Manager Role**: Required for accessing payment statistics

## Integration with Work Orders

The payment module automatically:

1. **Updates Work Order Payment Status**: When payments are processed, the work order's payment status is automatically updated
2. **Uses Estimate Amount**: Payment intents use the work order's estimated total amount
3. **Tracks Payment History**: All payments are linked to work orders for complete audit trails
4. **Calculates Remaining Amount**: Automatically calculates remaining amounts for partial payments

## Webhook Integration

The module supports webhook processing for automated payment verification:

### Stripe Webhook Events
- `payment_intent.succeeded`: Payment completed successfully
- `payment_intent.payment_failed`: Payment failed
- `charge.refunded`: Payment refunded

### PayPal Webhook Events
- Payment completion events
- Refund events

### Razorpay Webhook Events
- Payment success events
- Refund events

## Error Handling

The module includes comprehensive error handling:

- **Validation Errors**: Input validation with detailed error messages
- **Business Logic Errors**: Proper error handling for business rules
- **Database Errors**: Graceful handling of database operations
- **Payment Gateway Errors**: Error handling for external payment provider issues

## Usage Examples

### Creating a Manual Cash Payment
```typescript
const paymentData = {
  workOrderId: "work-order-id",
  method: "CASH",
  amount: 150.00,
  reference: "CASH-001",
  notes: "Customer paid in cash",
  processedById: "service-advisor-id"
};

const response = await fetch('/api/payments/manual', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(paymentData)
});
```

### Getting Work Order Payment Summary
```typescript
const response = await fetch('/api/payments/work-orders/work-order-id/summary', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const summary = await response.json();
console.log(`Total Amount: $${summary.data.totalAmount}`);
console.log(`Paid Amount: $${summary.data.paidAmount}`);
console.log(`Remaining: $${summary.data.remainingAmount}`);
```

### Creating a Refund
```typescript
const refundData = {
  paymentId: "payment-id",
  amount: 50.00,
  reason: "Customer requested partial refund",
  processedById: "service-advisor-id"
};

const response = await fetch('/api/payments/refunds', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(refundData)
});
```

## Configuration

The payment module can be configured for different payment providers by updating the environment variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal Configuration
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...

# Razorpay Configuration
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

## Security Considerations

- All payment endpoints require authentication
- Service advisor role required for manual payment operations
- Webhook signatures are verified for payment gateway callbacks
- Payment amounts are validated against work order estimates
- Refund amounts cannot exceed original payment amounts
- Complete audit trail maintained for all payment operations
