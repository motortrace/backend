# Work Orders Module

This module handles all work order operations for the automotive service management system. It follows a modular monolithic architecture pattern and integrates with the Prisma database schema.

## Overview

The work orders module provides comprehensive functionality for managing automotive service work orders, including:

- Work order creation and management
- Estimates and approvals
- Labor tracking
- Parts management
- Service tracking
- Payment processing
- Quality control (QC)
- Inspections
- File attachments
- Statistics and reporting

## Architecture

The module follows the same pattern as the appointments module:

```
work-orders/
├── work-orders.types.ts      # TypeScript interfaces and types
├── work-orders.service.ts    # Business logic and database operations
├── work-orders.controller.ts # HTTP request handling
├── work-orders.routes.ts     # Route definitions
├── work-orders.validation.ts # Input validation schemas
├── index.ts                  # Module exports
└── README.md                 # This documentation
```

## Key Features

### 1. Work Order Management
- Create work orders with customer and vehicle information
- Update work order status and details
- Assign work orders to service advisors and technicians
- Track workflow steps from received to completed

### 2. Estimates and Approvals
- Create detailed estimates with line items
- Track estimate versions
- Approve estimates with digital signatures
- Link estimates to work orders

### 3. Labor Tracking
- Record labor hours and rates
- Link labor to technicians
- Track start and end times
- Support both catalog and manual labor entries

### 4. Parts Management
- Track parts used in work orders
- Support multiple part sources (inventory, supplier, customer-supplied)
- Record installation details
- Track warranty information

### 5. Service Tracking
- Link canned services to work orders
- Track service status and completion
- Support custom service descriptions

### 6. Payment Processing
- Record multiple payment methods
- Track payment status
- Support partial payments and refunds
- Link payments to service advisors

### 7. Quality Control
- Perform QC inspections
- Record pass/fail status
- Track rework requirements
- Link QC to technicians

### 8. Inspections
- Create detailed inspection reports
- Track inspection checklists
- Record tire inspections
- Support file attachments

### 9. File Attachments
- Upload and manage work order documents
- Categorize attachments (invoices, receipts, etc.)
- Track file metadata
- Link to inventory managers

### 10. Statistics and Reporting
- Generate work order statistics
- Track technician performance
- Monitor service usage
- Calculate revenue metrics

## API Endpoints

### Work Order Management

#### Create Work Order
```
POST /api/work-orders
```
Creates a new work order with customer, vehicle, and service information.

**Required Fields:**
- `customerId`: Customer ID
- `vehicleId`: Vehicle ID

**Optional Fields:**
- `appointmentId`: Associated appointment ID
- `advisorId`: Service advisor ID
- `technicianId`: Technician ID
- `status`: Work order status
- `jobType`: Type of job (REPAIR, MAINTENANCE, etc.)
- `priority`: Job priority
- `source`: Source of work order
- `complaint`: Customer complaint
- `odometerReading`: Vehicle odometer reading
- `warrantyStatus`: Warranty status
- `estimatedTotal`: Estimated total cost
- `estimateNotes`: Notes for estimate
- `promisedAt`: Promised completion date
- `internalNotes`: Internal notes
- `customerNotes`: Customer notes
- `cannedServiceIds`: Array of canned service IDs
- `quantities`: Array of service quantities
- `prices`: Array of service prices
- `serviceNotes`: Array of service notes

#### Get Work Orders
```
GET /api/work-orders
```
Retrieves work orders with optional filtering.

**Query Parameters:**
- `status`: Filter by work order status
- `jobType`: Filter by job type
- `priority`: Filter by priority
- `source`: Filter by source
- `customerId`: Filter by customer ID
- `vehicleId`: Filter by vehicle ID
- `advisorId`: Filter by service advisor ID
- `technicianId`: Filter by technician ID
- `startDate`: Filter by start date
- `endDate`: Filter by end date
- `workflowStep`: Filter by workflow step
- `paymentStatus`: Filter by payment status

#### Get Work Order by ID
```
GET /api/work-orders/:id
```
Retrieves a specific work order with all related data.

#### Update Work Order
```
PUT /api/work-orders/:id
```
Updates an existing work order.

#### Delete Work Order
```
DELETE /api/work-orders/:id
```
Deletes a work order (requires manager role).

### Work Order Status Management

#### Update Work Order Status
```
PUT /api/work-orders/:id/status
```
Updates the status and workflow step of a work order.

**Required Fields:**
- `status`: New work order status

**Optional Fields:**
- `workflowStep`: New workflow step

#### Assign Work Order
```
PUT /api/work-orders/:id/assign
```
Assigns a work order to a service advisor and/or technician.

**Optional Fields:**
- `advisorId`: Service advisor ID
- `technicianId`: Technician ID

### Estimates

#### Create Work Order Estimate
```
POST /api/work-orders/:workOrderId/estimates
```
Creates a new estimate for a work order.

**Required Fields:**
- `totalAmount`: Total estimate amount
- `items`: Array of estimate items

**Optional Fields:**
- `description`: Estimate description
- `laborAmount`: Labor portion
- `partsAmount`: Parts portion
- `taxAmount`: Tax amount
- `discountAmount`: Discount amount
- `notes`: Additional notes

#### Generate Estimate from Labor and Parts
```
POST /api/work-orders/:workOrderId/generate-estimate
```
Automatically generates an estimate from existing labor and parts entries, and updates work order status to APPROVAL.

**Features:**
- Calculates totals from all recorded labor, parts, and services
- Creates estimate items for each labor and part entry
- Automatically approves the estimate
- Updates work order status from ESTIMATE to APPROVAL
- Updates work order totals (subtotalLabor, subtotalParts, totalAmount, taxAmount)

**Response:**
```json
{
  "success": true,
  "data": {
    "estimate": {
      "id": "est_123",
      "version": 1,
      "totalAmount": 1500.00,
      "laborAmount": 800.00,
      "partsAmount": 500.00,
      "taxAmount": 150.00,
      "approved": true,
      "estimateItems": [...]
    },
    "workOrderUpdate": {
      "status": "IN_PROGRESS",
      "workflowStep": "APPROVAL",
      "estimatedTotal": 1500.00,
      "subtotalLabor": 800.00,
      "subtotalParts": 500.00,
      "totalAmount": 1500.00,
      "taxAmount": 150.00
    }
  },
  "message": "Estimate generated successfully and work order status updated to APPROVAL"
}
```

**Example Usage:**
```bash
curl -X POST http://localhost:3000/api/work-orders/wo-123/generate-estimate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Work Order Estimates
```
GET /api/work-orders/:workOrderId/estimates
```
Retrieves all estimates for a work order.

#### Approve Work Order Estimate
```
PUT /api/work-orders/:workOrderId/estimates/:estimateId/approve
```
Approves an estimate.

**Required Fields:**
- `approvedById`: ID of the person approving

### Labor

#### Create Work Order Labor
```
POST /api/work-orders/:workOrderId/labor
```
Records labor performed on a work order.

**Required Fields:**
- `description`: Labor description
- `hours`: Hours worked
- `rate`: Hourly rate

**Optional Fields:**
- `laborCatalogId`: Labor catalog entry ID
- `technicianId`: Technician ID
- `startTime`: Start time
- `endTime`: End time
- `notes`: Additional notes

#### Get Work Order Labor
```
GET /api/work-orders/:workOrderId/labor
```
Retrieves all labor entries for a work order.

### Parts

#### Create Work Order Part
```
POST /api/work-orders/:workOrderId/parts
```
Records parts used in a work order.

**Required Fields:**
- `inventoryItemId`: Inventory item ID
- `quantity`: Quantity used
- `unitPrice`: Unit price

**Optional Fields:**
- `source`: Part source
- `supplierName`: Supplier name
- `supplierInvoice`: Supplier invoice
- `warrantyInfo`: Warranty information
- `notes`: Additional notes
- `installedAt`: Installation date
- `installedById`: Installer ID

#### Get Work Order Parts
```
GET /api/work-orders/:workOrderId/parts
```
Retrieves all parts used in a work order.

### Services

#### Create Work Order Service
```
POST /api/work-orders/:workOrderId/services
```
Adds a service to a work order.

**Required Fields:**
- `cannedServiceId`: Canned service ID

**Optional Fields:**
- `description`: Custom description
- `quantity`: Service quantity
- `unitPrice`: Unit price
- `notes`: Additional notes

#### Get Work Order Services
```
GET /api/work-orders/:workOrderId/services
```
Retrieves all services for a work order.

### Payments

#### Create Payment
```
POST /api/work-orders/:workOrderId/payments
```
Records a payment for a work order.

**Required Fields:**
- `method`: Payment method
- `amount`: Payment amount

**Optional Fields:**
- `reference`: Payment reference
- `notes`: Payment notes
- `processedById`: Processor ID

#### Get Work Order Payments
```
GET /api/work-orders/:workOrderId/payments
```
Retrieves all payments for a work order.

### Attachments

#### Upload Work Order Attachment
```
POST /api/work-orders/:workOrderId/attachments
```
Uploads a file attachment to a work order.

**Required Fields:**
- `fileUrl`: File URL
- `fileType`: File type
- `category`: Attachment category

**Optional Fields:**
- `fileName`: Original file name
- `fileSize`: File size
- `description`: File description
- `uploadedById`: Uploader ID

#### Get Work Order Attachments
```
GET /api/work-orders/:workOrderId/attachments
```
Retrieves all attachments for a work order.

**Query Parameters:**
- `category`: Filter by attachment category

### Inspections

#### Create Work Order Inspection
```
POST /api/work-orders/:workOrderId/inspections
```
Creates an inspection for a work order.

**Required Fields:**
- `inspectorId`: Inspector ID

**Optional Fields:**
- `notes`: Inspection notes

#### Get Work Order Inspections
```
GET /api/work-orders/:workOrderId/inspections
```
Retrieves all inspections for a work order.

### Quality Control

#### Create Work Order QC
```
POST /api/work-orders/:workOrderId/qc
```
Creates a QC record for a work order.

**Required Fields:**
- `passed`: QC pass/fail status

**Optional Fields:**
- `inspectorId`: Inspector ID
- `notes`: QC notes
- `