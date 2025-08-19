# Estimates Module

This module handles the complete estimate lifecycle for automotive service work orders, including estimate creation, labor and parts management, customer approvals, and the transition to actual work order items.

## Overview

The estimates module implements a two-phase approach:
1. **Estimate Phase**: Service advisors create estimates with labor and parts items that customers can review and approve
2. **Execution Phase**: Once approved, estimates are converted to actual work order labor and parts items

## Key Features

- **Estimate Management**: Create, update, and delete estimates
- **Labor Items**: Add, modify, and remove labor items from estimates
- **Parts Items**: Add, modify, and remove parts items from estimates
- **Customer Approval**: Individual approval of labor and parts items with notes
- **Estimate Approval**: Convert approved estimates to work order items
- **Statistics**: Track estimate performance and metrics

## Database Models

### WorkOrderEstimate
- Main estimate record linked to a work order
- Tracks version, totals, approval status, and metadata

### EstimateLabor
- Labor items within an estimate
- Includes customer approval status and notes
- Links to LaborCatalog for standardized operations

### EstimatePart
- Parts items within an estimate
- Includes customer approval status and notes
- Links to InventoryItem for part details

### WorkOrderApproval
- Tracks approval workflow and customer signatures
- Supports multiple approval methods

## API Endpoints

### Estimates

#### Create Estimate
```
POST /estimates
```
Creates a new estimate for a work order.

**Request Body:**
```json
{
  "workOrderId": "string",
  "description": "string",
  "totalAmount": 1000.00,
  "laborAmount": 500.00,
  "partsAmount": 400.00,
  "taxAmount": 100.00,
  "discountAmount": 0.00,
  "notes": "string",
  "createdById": "string"
}
```

#### Get Estimates
```
GET /estimates?workOrderId=string&approved=boolean&page=1&limit=10
```
Retrieves estimates with optional filtering and pagination.

#### Get Estimate by ID
```
GET /estimates/:id
```
Retrieves a specific estimate with all details.

#### Update Estimate
```
PUT /estimates/:id
```
Updates an existing estimate.

#### Delete Estimate
```
DELETE /estimates/:id
```
Deletes an unapproved estimate.

#### Approve Estimate
```
POST /estimates/:id/approve
```
Approves an estimate and creates work order labor/parts items.

**Request Body:**
```json
{
  "approvedById": "string"
}
```

### Estimate Labor Items

#### Create Labor Item
```
POST /estimates/labor
```
Adds a labor item to an estimate.

**Request Body:**
```json
{
  "estimateId": "string",
  "laborCatalogId": "string",
  "description": "string",
  "hours": 2.5,
  "rate": 100.00,
  "notes": "string"
}
```

#### Update Labor Item
```
PUT /estimates/labor/:id
```
Updates a labor item in an estimate.

#### Delete Labor Item
```
DELETE /estimates/labor/:id
```
Removes a labor item from an estimate.

#### Customer Approve Labor Item
```
PUT /estimates/labor/:id/customer-approval
```
Updates customer approval status for a labor item.

**Request Body:**
```json
{
  "customerApproved": true,
  "customerNotes": "string"
}
```

### Estimate Parts Items

#### Create Part Item
```
POST /estimates/parts
```
Adds a parts item to an estimate.

**Request Body:**
```json
{
  "estimateId": "string",
  "inventoryItemId": "string",
  "quantity": 1,
  "unitPrice": 150.00,
  "source": "INVENTORY",
  "supplierName": "string",
  "warrantyInfo": "string",
  "notes": "string"
}
```

#### Update Part Item
```
PUT /estimates/parts/:id
```
Updates a parts item in an estimate.

#### Delete Part Item
```
DELETE /estimates/parts/:id
```
Removes a parts item from an estimate.

#### Customer Approve Part Item
```
PUT /estimates/parts/:id/customer-approval
```
Updates customer approval status for a parts item.

**Request Body:**
```json
{
  "customerApproved": true,
  "customerNotes": "string"
}
```

### Estimate Approvals

#### Create Approval
```
POST /estimates/approvals
```
Creates an approval record for an estimate.

**Request Body:**
```json
{
  "workOrderId": "string",
  "estimateId": "string",
  "status": "PENDING",
  "method": "IN_PERSON",
  "notes": "string",
  "customerSignature": "string"
}
```

#### Update Approval
```
PUT /estimates/approvals/:id
```
Updates an approval record.

### Statistics

#### Get Estimate Statistics
```
GET /estimates/statistics
```
Retrieves overall estimate statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEstimates": 150,
    "approvedEstimates": 120,
    "pendingEstimates": 30,
    "averageEstimateAmount": 850.00,
    "totalEstimatedValue": 127500.00
  }
}
```

## Workflow

### 1. Estimate Creation
1. Service advisor creates an estimate for a work order
2. Adds labor items (from catalog or custom)
3. Adds parts items (from inventory or external)
4. System calculates totals automatically

### 2. Customer Review
1. Customer reviews individual labor and parts items
2. Can approve/reject items individually
3. Can add notes and comments
4. System tracks approval status per item

### 3. Estimate Approval
1. Service advisor reviews customer feedback
2. Makes adjustments if needed
3. Approves the estimate
4. System automatically creates work order labor and parts items

### 4. Work Execution
1. Technicians can now work with the actual labor and parts items
2. Original estimate remains for reference
3. Work order totals are updated from actual items

## Business Rules

- Estimates cannot be modified once approved
- Labor and parts items cannot be added directly to work orders (must go through estimates)
- Customer approval is tracked at the item level
- Estimate totals are automatically calculated from labor and parts items
- Work order items are created from approved estimates only

## Error Handling

The module includes comprehensive error handling for:
- Invalid work order references
- Missing required fields
- Attempts to modify approved estimates
- Invalid labor catalog or inventory item references
- Calculation mismatches between totals and subtotals

## Validation

All endpoints include request validation for:
- Required fields
- Data types and formats
- Business rule compliance
- Reference integrity

## Security

- Authentication required for all modification endpoints
- Role-based access control for different operations
- Input sanitization and validation
- Audit trail for all changes
