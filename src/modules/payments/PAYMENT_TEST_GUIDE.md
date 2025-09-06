# Payment System Test Guide

## Overview
The payment system now supports two main payment types:

1. **Manual Payments** - Service advisor records cash/check payments with receipt images
2. **Online Payments** - Credit card processing with sandbox testing (4242 4242 4242 4242)

## Setup Requirements

### 1. Environment Variables
Create a `.env` file with:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/your_database"
DIRECT_URL="postgresql://username:password@localhost:5432/your_database"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
```

### 2. Database Setup
```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### 3. Test Data Requirements
- Work order with `estimatedTotal` or `totalAmount`
- Service advisor account
- Customer and vehicle records

## API Endpoints

### Manual Payment (Cash/Check with Image)
```bash
POST /api/payments/manual
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json

{
  "workOrderId": "work_order_id",
  "method": "CASH",
  "amount": 150.00,
  "reference": "CASH_RECEIPT_001",
  "notes": "Customer paid in cash",
  "processedById": "service_advisor_id",
  "paymentImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..." // Base64 image
}
```

### Online Payment (Credit Card - Sandbox)
```bash
POST /api/payments/online
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json

{
  "workOrderId": "work_order_id",
  "amount": 150.00,
  "currency": "USD",
  "customerEmail": "customer@example.com"
}
```

### Sandbox Testing (4242 Card)
```bash
POST /api/payments/sandbox/test
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json

{
  "workOrderId": "work_order_id",
  "amount": 150.00,
  "cardNumber": "4242 4242 4242 4242"
}
```

### Get Payment Summary
```bash
GET /api/payments/work-orders/{workOrderId}/summary
Authorization: Bearer <supabase_jwt_token>
```

### Update Payment with Image
```bash
PUT /api/payments/{paymentId}
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json

{
  "status": "PAID",
  "notes": "Payment received",
  "paymentImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

## Work Order Status Updates

The system automatically updates work order payment status:

- **PENDING** - No payments made
- **PARTIALLY_PAID** - Some payments made but not full amount
- **PAID** - Full amount paid

## Sandbox Testing

### Valid Test Cards
- `4242 4242 4242 4242` - Successful payment
- `4000 0000 0000 0002` - Declined payment
- `4000 0000 0000 9995` - Insufficient funds

### Test Scenarios
1. **Successful Payment**: Use 4242 card number
2. **Failed Payment**: Use declined card numbers
3. **Partial Payment**: Pay less than total amount
4. **Refund**: Process refund after payment

## Image Upload

### Manual Payment Images
- Store as Base64 in `paymentImage` field
- Automatically extracted and returned in responses
- Can be updated later via PUT endpoint

### Image Storage Options
1. **Base64** (current implementation) - Store directly in database
2. **File Upload** (future) - Upload to cloud storage and store URL
3. **External Storage** - Store in Supabase Storage or AWS S3

## Testing Checklist

- [ ] Database connected and migrated
- [ ] Supabase authentication working
- [ ] Test work order exists with estimate
- [ ] Service advisor account created
- [ ] Manual payment with image works
- [ ] Online payment with sandbox card works
- [ ] Work order status updates correctly
- [ ] Payment summary shows correct amounts
- [ ] Refund processing works
- [ ] Payment statistics calculated correctly

## Error Handling

The system handles common errors:
- Invalid work order ID
- Missing service advisor
- Invalid payment amounts
- Invalid sandbox card numbers
- Database connection issues

## Production Considerations

When moving to production:
1. Replace sandbox with real Stripe integration
2. Implement proper image storage (AWS S3, Supabase Storage)
3. Add webhook signature verification
4. Implement proper error logging
5. Add payment reconciliation features
