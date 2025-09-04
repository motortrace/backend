# Payment Module API Documentation

## Overview

The Payment Module provides comprehensive payment processing capabilities for the MotorTrace backend, supporting both manual payments and automated payment gateway integrations.

## Base URL

```
http://localhost:3000/api/payments
```

## Authentication

All endpoints require a valid Supabase authentication token in the Authorization header:

```
Authorization: Bearer <supabase_token>
```

## API Endpoints

### 1. Create Payment Intent

**Endpoint:** `POST /payment-intents`

**Description:** Create a payment intent for online payment processing.

**Request Body:**
```json
{
  "workOrderId": "work-order-id-123",
  "amount": 150.00,
  "currency": "USD",
  "description": "Payment for work order WO-20241201-001",
  "customerEmail": "customer@example.com",
  "customerPhone": "+1234567890",
  "metadata": {
    "workOrderNumber": "WO-20241201-001",
    "customerName": "John Doe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pi_1234567890",
    "clientSecret": "pi_1234567890_secret_abc123",
    "amount": 150.00,
    "currency": "USD",
    "status": "requires_payment_method",
    "metadata": {
      "workOrderId": "work-order-id-123",
      "workOrderNumber": "WO-20241201-001",
      "customerName": "John Doe"
    }
  },
  "message": "Payment intent created successfully"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/payments/payment-intents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <supabase_token>" \
  -d '{
    "workOrderId": "work-order-id-123",
    "amount": 150.00,
    "currency": "USD",
    "description": "Payment for work order WO-20241201-001",
    "customerEmail": "customer@example.com"
  }'
```

### 2. Create Manual Payment

**Endpoint:** `POST /manual`

**Description:** Create a manual payment record (requires service advisor role).

**Request Body:**
```json
{
  "workOrderId": "work-order-id-123",
  "method": "CASH",
  "amount": 150.00,
  "reference": "CASH-001",
  "notes": "Customer paid in cash",
  "processedById": "service-advisor-id-456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payment-id-123",
    "workOrderId": "work-order-id-123",
    "method": "CASH",
    "amount": 150.00,
    "status": "PAID",
    "reference": "CASH-001",
    "paidAt": "2024-12-01T10:30:00Z",
    "processedBy": {
      "id": "service-advisor-id-456",
      "employeeId": "SA001",
      "userProfile": {
        "id": "profile-id-123",
        "name": "John Smith"
      }
    },
    "notes": "Customer paid in cash",
    "createdAt": "2024-12-01T10:30:00Z",
    "updatedAt": "2024-12-01T10:30:00Z"
  },
  "message": "Manual payment created successfully"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/payments/manual \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <supabase_token>" \
  -d '{
    "workOrderId": "work-order-id-123",
    "method": "CASH",
    "amount": 150.00,
    "reference": "CASH-001",
    "notes": "Customer paid in cash",
    "processedById": "service-advisor-id-456"
  }'
```

### 3. Verify Payment

**Endpoint:** `POST /verify`

**Description:** Verify a payment from a payment gateway.

**Request Body:**
```json
{
  "paymentIntentId": "pi_1234567890",
  "provider": "stripe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "status": "PAID",
    "amount": 150.00,
    "currency": "USD",
    "transactionId": "pi_1234567890"
  },
  "message": "Payment verified successfully"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/payments/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <supabase_token>" \
  -d '{
    "paymentIntentId": "pi_1234567890",
    "provider": "stripe"
  }'
```

### 4. Get Payment

**Endpoint:** `GET /:paymentId`

**Description:** Retrieve a specific payment by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payment-id-123",
    "workOrderId": "work-order-id-123",
    "method": "CASH",
    "amount": 150.00,
    "status": "PAID",
    "reference": "CASH-001",
    "paidAt": "2024-12-01T10:30:00Z",
    "processedBy": {
      "id": "service-advisor-id-456",
      "employeeId": "SA001",
      "userProfile": {
        "id": "profile-id-123",
        "name": "John Smith"
      }
    },
    "notes": "Customer paid in cash",
    "createdAt": "2024-12-01T10:30:00Z",
    "updatedAt": "2024-12-01T10:30:00Z"
  },
  "message": "Payment retrieved successfully"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/payments/payment-id-123 \
  -H "Authorization: Bearer <supabase_token>"
```

### 5. Get Payments with Filters

**Endpoint:** `GET /`

**Description:** Retrieve payments with optional filters.

**Query Parameters:**
- `workOrderId` (string): Filter by work order ID
- `method` (string): Filter by payment method
- `status` (string): Filter by payment status
- `startDate` (string): Filter by start date (ISO format)
- `endDate` (string): Filter by end date (ISO format)
- `minAmount` (number): Filter by minimum amount
- `maxAmount` (number): Filter by maximum amount
- `processedById` (string): Filter by service advisor ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "payment-id-123",
      "workOrderId": "work-order-id-123",
      "method": "CASH",
      "amount": 150.00,
      "status": "PAID",
      "reference": "CASH-001",
      "paidAt": "2024-12-01T10:30:00Z",
      "processedBy": {
        "id": "service-advisor-id-456",
        "employeeId": "SA001",
        "userProfile": {
          "id": "profile-id-123",
          "name": "John Smith"
        }
      },
      "notes": "Customer paid in cash",
      "createdAt": "2024-12-01T10:30:00Z",
      "updatedAt": "2024-12-01T10:30:00Z"
    }
  ],
  "message": "Payments retrieved successfully",
  "count": 1
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/payments?method=CASH&status=PAID&startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer <supabase_token>"
```

### 6. Update Payment

**Endpoint:** `PUT /:paymentId`

**Description:** Update a payment record (requires service advisor role).

**Request Body:**
```json
{
  "status": "PAID",
  "reference": "UPDATED-REF-001",
  "notes": "Updated payment notes",
  "refundAmount": 25.00,
  "refundReason": "Partial refund due to discount"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payment-id-123",
    "workOrderId": "work-order-id-123",
    "method": "CASH",
    "amount": 150.00,
    "status": "PARTIAL_REFUND",
    "reference": "UPDATED-REF-001",
    "paidAt": "2024-12-01T10:30:00Z",
    "processedBy": {
      "id": "service-advisor-id-456",
      "employeeId": "SA001",
      "userProfile": {
        "id": "profile-id-123",
        "name": "John Smith"
      }
    },
    "notes": "Updated payment notes",
    "refundAmount": 25.00,
    "refundReason": "Partial refund due to discount",
    "createdAt": "2024-12-01T10:30:00Z",
    "updatedAt": "2024-12-01T11:00:00Z"
  },
  "message": "Payment updated successfully"
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/api/payments/payment-id-123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <supabase_token>" \
  -d '{
    "status": "PAID",
    "reference": "UPDATED-REF-001",
    "notes": "Updated payment notes"
  }'
```

### 7. Create Refund

**Endpoint:** `POST /refunds`

**Description:** Create a refund for a payment (requires service advisor role).

**Request Body:**
```json
{
  "paymentId": "payment-id-123",
  "amount": 50.00,
  "reason": "Customer requested partial refund due to quality issue",
  "processedById": "service-advisor-id-456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payment-id-123",
    "workOrderId": "work-order-id-123",
    "method": "CASH",
    "amount": 150.00,
    "status": "PARTIAL_REFUND",
    "reference": "CASH-001",
    "paidAt": "2024-12-01T10:30:00Z",
    "processedBy": {
      "id": "service-advisor-id-456",
      "employeeId": "SA001",
      "userProfile": {
        "id": "profile-id-123",
        "name": "John Smith"
      }
    },
    "notes": "Customer paid in cash",
    "refundAmount": 50.00,
    "refundReason": "Customer requested partial refund due to quality issue",
    "createdAt": "2024-12-01T10:30:00Z",
    "updatedAt": "2024-12-01T12:00:00Z"
  },
  "message": "Refund created successfully"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/payments/refunds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <supabase_token>" \
  -d '{
    "paymentId": "payment-id-123",
    "amount": 50.00,
    "reason": "Customer requested partial refund due to quality issue",
    "processedById": "service-advisor-id-456"
  }'
```

### 8. Get Work Order Payment Summary

**Endpoint:** `GET /work-orders/:workOrderId/summary`

**Description:** Get payment summary for a specific work order.

**Response:**
```json
{
  "success": true,
  "data": {
    "workOrderId": "work-order-id-123",
    "workOrderNumber": "WO-20241201-001",
    "totalAmount": 200.00,
    "paidAmount": 150.00,
    "remainingAmount": 50.00,
    "paymentStatus": "PARTIALLY_PAID",
    "payments": [
      {
        "id": "payment-id-123",
        "workOrderId": "work-order-id-123",
        "method": "CASH",
        "amount": 150.00,
        "status": "PAID",
        "reference": "CASH-001",
        "paidAt": "2024-12-01T10:30:00Z",
        "processedBy": {
          "id": "service-advisor-id-456",
          "employeeId": "SA001",
          "userProfile": {
            "id": "profile-id-123",
            "name": "John Smith"
          }
        },
        "notes": "Customer paid in cash",
        "createdAt": "2024-12-01T10:30:00Z",
        "updatedAt": "2024-12-01T10:30:00Z"
      }
    ],
    "lastPaymentDate": "2024-12-01T10:30:00Z"
  },
  "message": "Payment summary retrieved successfully"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/payments/work-orders/work-order-id-123/summary \
  -H "Authorization: Bearer <supabase_token>"
```

### 9. Get Payment Statistics

**Endpoint:** `GET /statistics`

**Description:** Get payment statistics and analytics (requires manager role).

**Query Parameters:** Same as Get Payments endpoint.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPayments": 100,
    "totalAmount": 15000.00,
    "averagePaymentAmount": 150.00,
    "paymentsByMethod": {
      "CASH": {
        "count": 50,
        "amount": 7500.00
      },
      "CREDIT_CARD": {
        "count": 30,
        "amount": 4500.00
      },
      "DEBIT_CARD": {
        "count": 20,
        "amount": 3000.00
      }
    },
    "paymentsByStatus": {
      "PAID": {
        "count": 80,
        "amount": 12000.00
      },
      "PARTIALLY_PAID": {
        "count": 15,
        "amount": 2250.00
      },
      "PENDING": {
        "count": 5,
        "amount": 750.00
      }
    },
    "recentPayments": [
      {
        "id": "payment-id-123",
        "workOrderId": "work-order-id-123",
        "amount": 150.00,
        "method": "CASH",
        "status": "PAID",
        "paidAt": "2024-12-01T10:30:00Z"
      }
    ]
  },
  "message": "Payment statistics retrieved successfully"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/payments/statistics?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer <supabase_token>"
```

### 10. Mark Payment as Paid

**Endpoint:** `POST /:paymentId/mark-as-paid`

**Description:** Mark a payment as paid manually (for service advisors).

**Request Body:**
```json
{
  "processedById": "service-advisor-id-456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payment-id-123",
    "workOrderId": "work-order-id-123",
    "method": "CASH",
    "amount": 150.00,
    "status": "PAID",
    "reference": "CASH-001",
    "paidAt": "2024-12-01T10:30:00Z",
    "processedBy": {
      "id": "service-advisor-id-456",
      "employeeId": "SA001",
      "userProfile": {
        "id": "profile-id-123",
        "name": "John Smith"
      }
    },
    "notes": "Marked as paid manually by service advisor",
    "createdAt": "2024-12-01T10:30:00Z",
    "updatedAt": "2024-12-01T12:00:00Z"
  },
  "message": "Payment marked as paid successfully"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/payments/payment-id-123/mark-as-paid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <supabase_token>" \
  -d '{
    "processedById": "service-advisor-id-456"
  }'
```

### 11. Get Payment Methods

**Endpoint:** `GET /methods`

**Description:** Get available payment methods.

**Response:**
```json
{
  "success": true,
  "data": [
    { "value": "CASH", "label": "Cash" },
    { "value": "CREDIT_CARD", "label": "Credit Card" },
    { "value": "DEBIT_CARD", "label": "Debit Card" },
    { "value": "BANK_TRANSFER", "label": "Bank Transfer" },
    { "value": "UPI", "label": "UPI" },
    { "value": "CHEQUE", "label": "Cheque" },
    { "value": "DIGITAL_WALLET", "label": "Digital Wallet" },
    { "value": "INSURANCE", "label": "Insurance" },
    { "value": "WARRANTY", "label": "Warranty" }
  ],
  "message": "Payment methods retrieved successfully"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/payments/methods \
  -H "Authorization: Bearer <supabase_token>"
```

### 12. Get Payment Statuses

**Endpoint:** `GET /statuses`

**Description:** Get available payment statuses.

**Response:**
```json
{
  "success": true,
  "data": [
    { "value": "PENDING", "label": "Pending" },
    { "value": "PARTIALLY_PAID", "label": "Partially Paid" },
    { "value": "PAID", "label": "Paid" },
    { "value": "OVERDUE", "label": "Overdue" },
    { "value": "COMPLETED", "label": "Completed" },
    { "value": "FAILED", "label": "Failed" },
    { "value": "REFUNDED", "label": "Refunded" },
    { "value": "PARTIAL_REFUND", "label": "Partial Refund" },
    { "value": "CANCELLED", "label": "Cancelled" }
  ],
  "message": "Payment statuses retrieved successfully"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/payments/statuses \
  -H "Authorization: Bearer <supabase_token>"
```

## Webhook Endpoints

### Stripe Webhook

**Endpoint:** `POST /webhooks/stripe`

**Description:** Process webhooks from Stripe payment gateway.

**Request Body:** Raw webhook payload from Stripe.

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "paymentId": "payment-id-123",
    "transactionId": "pi_1234567890",
    "status": "PAID",
    "amount": 150.00,
    "currency": "USD",
    "metadata": {
      "workOrderId": "work-order-id-123"
    }
  },
  "message": "Webhook processed successfully"
}
```

### PayPal Webhook

**Endpoint:** `POST /webhooks/paypal`

**Description:** Process webhooks from PayPal payment gateway.

### Razorpay Webhook

**Endpoint:** `POST /webhooks/razorpay`

**Description:** Process webhooks from Razorpay payment gateway.

## Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation error",
  "error": "workOrderId is required"
}
```

### Authentication Error
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "Invalid or missing authentication token"
}
```

### Authorization Error
```json
{
  "success": false,
  "message": "Forbidden",
  "error": "Service advisor role required"
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Payment not found"
}
```

### Business Logic Error
```json
{
  "success": false,
  "message": "Refund amount cannot exceed payment amount"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. Limits are applied per IP address and authentication token.

## Pagination

For endpoints that return lists, pagination is supported through query parameters:

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

## Environment Variables

Configure the following environment variables for payment gateway integration:

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
