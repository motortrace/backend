# Invoices Module

This module handles the complete invoice lifecycle for automotive service work orders, including invoice creation, line item management, payment tracking, and invoice statistics.

## Overview

The invoices module implements a detailed invoice system with:
1. **Invoice Creation**: Automatically generates invoices from work order data
2. **Line Item Management**: Detailed breakdown of services, labor, parts, taxes, and discounts
3. **Payment Tracking**: Monitor invoice status and payment progress
4. **Statistics**: Track invoice performance and revenue metrics

## Key Features

- **Detailed Invoices**: Shows Services, Labor Items, Parts, Tax, and Discounts
- **Line Item Breakdown**: Each service/labor/part as separate line items
- **Automatic Totals**: Calculates subtotals and grand total
- **Payment Tracking**: Monitor paid amounts and balance due
- **Invoice Management**: Create, read, update, delete invoices
- **Work Order Integration**: Links invoices to work orders
- **Statistics**: Track invoice performance and revenue

## Database Models

### Invoice
- Main invoice record linked to a work order
- Tracks totals, payment status, and metadata
- Includes customer and vehicle information

### InvoiceLineItem
- Individual line items within an invoice
- Supports different types: SERVICE, LABOR, PART, TAX, DISCOUNT, OTHER
- Links back to original work order items for tracking

## API Endpoints

### Invoices

#### Create Invoice
```
POST /api/invoices
```
Creates a new invoice from a work order.

**Request Body:**
```json
{
  "workOrderId": "string",
  "dueDate": "2024-01-15T00:00:00Z",
  "notes": "string",
  "terms": "string"
}
```

#### Get Invoices
```
GET /api/invoices?workOrderId=string&status=SENT&page=1&limit=10
```
Retrieves invoices with optional filters.

#### Get Invoice by ID
```
GET /api/invoices/:id
```
Retrieves a specific invoice with all line items.

#### Update Invoice
```
PUT /api/invoices/:id
```
Updates an invoice (status, payment, notes, etc.).

**Request Body:**
```json
{
  "status": "PAID",
  "paidAmount": 1500.00,
  "notes": "Payment received"
}
```

#### Delete Invoice
```
DELETE /api/invoices/:id
```
Deletes an invoice (only if not paid).

### Work Order Invoices

#### Get Invoices for Work Order
```
GET /api/invoices/work-order/:workOrderId
```
Retrieves all invoices for a specific work order.

### Statistics

#### Get Invoice Statistics
```
GET /api/invoices/statistics
```
Retrieves overall invoice statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalInvoices": 150,
    "draftInvoices": 20,
    "sentInvoices": 30,
    "paidInvoices": 90,
    "overdueInvoices": 10,
    "totalRevenue": 125000.00,
    "averageInvoiceAmount": 833.33,
    "totalOutstandingAmount": 15000.00
  }
}
```

## Invoice Structure

### Line Item Types
- **SERVICE**: WorkOrderService items (flat rate services)
- **LABOR**: WorkOrderLabor items (individual labor operations)
- **PART**: WorkOrderPart items (parts used)
- **TAX**: Tax calculations
- **DISCOUNT**: Discounts applied
- **OTHER**: Additional charges or fees

### Invoice Status
- **DRAFT**: Invoice created but not sent
- **SENT**: Invoice sent to customer
- **PAID**: Invoice fully paid
- **OVERDUE**: Invoice past due date
- **CANCELLED**: Invoice cancelled

## Workflow

### 1. Invoice Creation
1. Service advisor creates invoice from work order
2. System automatically calculates totals from services, labor, and parts
3. Creates detailed line items for each component
4. Generates unique invoice number

### 2. Invoice Management
1. Invoice can be updated (status, payment, notes)
2. Payment tracking updates balance due
3. Invoice status changes based on payment progress

### 3. Invoice Reporting
1. Statistics track invoice performance
2. Revenue reporting and outstanding amounts
3. Customer payment history

## Business Rules

- Only one invoice per work order (prevents duplicates)
- Cannot delete paid invoices
- Invoice totals automatically sync with work order totals
- Line items maintain references to original work order items
- Payment tracking updates balance due automatically

## Integration

The invoice module integrates with:
- **Work Orders**: Source data for invoice creation
- **Services**: WorkOrderService items become SERVICE line items
- **Labor**: WorkOrderLabor items become LABOR line items  
- **Parts**: WorkOrderPart items become PART line items
- **Payments**: Payment tracking and status updates
