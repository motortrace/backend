# Work Orders Module

This module handles all work order operations for the automotive service management system. It follows a modular monolithic architecture pattern and integrates with the Prisma database schema.

## Overview

The work orders module provides comprehensive functionality for managing automotive service work orders, including:

- Work order creation and management
- Estimates and approvals
- Labour tracking
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

### 3. Labour Tracking
- Record labour hours and rates
- Link labour to technicians
- Track start and end times
- Support both catalog and manual labour entries

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
- `labourAmount`: Labour portion
- `partsAmount`: Parts portion
- `taxAmount`: Tax amount
- `discountAmount`: Discount amount
- `notes`: Additional notes

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

### Labour

#### Create Work Order Labour
```
POST /api/work-orders/:workOrderId/labour
```
Records labour performed on a work order.

**Required Fields:**
- `description`: Labour description
- `hours`: Hours worked
- `rate`: Hourly rate

**Optional Fields:**
- `laborCatalogId`: Labour catalog entry ID
- `technicianId`: Technician ID
- `startTime`: Start time
- `endTime`: End time
- `notes`: Additional notes

#### Get Work Order Labour
```
GET /api/work-orders/:workOrderId/labour
```
Retrieves all labour entries for a work order.

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
- `reworkRequired`: Whether rework is required
- `reworkNotes`: Rework notes

#### Get Work Order QC
```
GET /api/work-orders/:workOrderId/qc
```
Retrieves all QC records for a work order.

### Statistics

#### Get Work Order Statistics
```
GET /api/work-orders/statistics/overview
```
Retrieves work order statistics and metrics.

**Query Parameters:**
- `startDate`: Start date for statistics
- `endDate`: End date for statistics

### Search

#### Search Work Orders
```
POST /api/work-orders/search
```
Searches work orders by various criteria.

**Required Fields:**
- `query`: Search query

**Optional Fields:**
- `filters`: Additional filters

## Authentication and Authorization

The work orders module uses role-based access control:

- **Service Advisors**: Can create, update, and manage work orders, estimates, and payments
- **Technicians**: Can record labour, parts, inspections, and QC
- **Managers**: Can delete work orders and access statistics
- **Inventory Managers**: Can upload attachments

## Data Models

The module uses the following Prisma models:

- `WorkOrder`: Main work order entity
- `WorkOrderEstimate`: Estimates with line items
- `WorkOrderLabour`: Labour entries
- `WorkOrderPart`: Parts used
- `WorkOrderService`: Services performed
- `Payment`: Payment records
- `WorkOrderAttachment`: File attachments
- `WorkOrderInspection`: Inspection records
- `WorkOrderQC`: Quality control records

## Error Handling

The module provides comprehensive error handling:

- Input validation using Joi schemas
- Database constraint validation
- Business rule validation
- Proper HTTP status codes
- Detailed error messages

## Integration

The work orders module integrates with:

- **Appointments Module**: Links work orders to appointments
- **Users Module**: Uses role-based authentication
- **Inventory Module**: References inventory items
- **Canned Services**: Links to predefined services

## Usage Examples

### Creating a Work Order

```typescript
const workOrderData = {
  customerId: "customer-123",
  vehicleId: "vehicle-456",
  complaint: "Engine making strange noise",
  jobType: "REPAIR",
  priority: "HIGH",
  source: "WALK_IN",
  cannedServiceIds: ["service-1", "service-2"],
  quantities: [1, 1],
  prices: [150.00, 75.00],
  serviceNotes: ["Diagnostic required", "Check engine light on"]
};

const response = await fetch('/api/work-orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(workOrderData)
});
```

### Adding Labour

```typescript
const labourData = {
  description: "Engine diagnostic",
  hours: 2.5,
  rate: 85.00,
  technicianId: "tech-789",
  notes: "Found faulty sensor"
};

const response = await fetch('/api/work-orders/work-order-123/labour', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(labourData)
});
```

### Recording a Payment

```typescript
const paymentData = {
  method: "CREDIT_CARD",
  amount: 500.00,
  reference: "TXN-123456",
  notes: "Payment received"
};

const response = await fetch('/api/work-orders/work-order-123/payments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(paymentData)
});
```

## Future Enhancements

Potential future enhancements include:

- Real-time notifications for work order updates
- Integration with external parts suppliers
- Advanced reporting and analytics
- Mobile app support
- Integration with accounting systems
- Automated workflow triggers
- Customer portal integration
