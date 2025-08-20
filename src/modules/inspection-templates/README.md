# Inspection Templates Module

This module provides comprehensive functionality for managing vehicle inspection templates and work order inspections. Service advisors can assign predefined inspection templates to work orders, and technicians can perform inspections using these templates.

## Features

- **Template Management**: Create, read, update, and delete inspection templates
- **Template Assignment**: Assign templates to work orders for systematic inspections
- **Inspection Execution**: Perform inspections using templates with checklist items
- **Results Tracking**: Track inspection results with status (GREEN/YELLOW/RED) and notes
- **Follow-up Management**: Flag items requiring follow-up attention

## API Endpoints

### Template Management

#### Create Inspection Template
```http
POST /api/inspection-templates/templates
```

**Request Body:**
```json
{
  "name": "Engine (Mechanical Condition)",
  "description": "Comprehensive mechanical inspection of engine components",
  "category": "Mechanical",
  "sortOrder": 1,
  "templateItems": [
    {
      "name": "Oil Level",
      "description": "Check engine oil level using dipstick",
      "category": "Engine",
      "sortOrder": 1,
      "isRequired": true,
      "allowsNotes": true
    }
  ]
}
```

#### Get All Templates
```http
GET /api/inspection-templates/templates?page=1&limit=10&category=Mechanical&isActive=true&search=engine
```

#### Get Available Templates
```http
GET /api/inspection-templates/templates/available
```

#### Get Templates by Category
```http
GET /api/inspection-templates/templates/category/Mechanical
```

#### Get Template by ID
```http
GET /api/inspection-templates/templates/:id
```

#### Update Template
```http
PUT /api/inspection-templates/templates/:id
```

**Request Body:**
```json
{
  "name": "Updated Engine Inspection",
  "description": "Updated description",
  "isActive": true
}
```

#### Delete Template
```http
DELETE /api/inspection-templates/templates/:id
```

### Work Order Inspection Management

#### Assign Template to Work Order
```http
POST /api/inspection-templates/work-orders/assign-template
```

**Request Body:**
```json
{
  "workOrderId": "work_order_id",
  "templateId": "template_id",
  "inspectorId": "technician_id",
  "notes": "Initial inspection notes"
}
```

#### Create Inspection from Template
```http
POST /api/inspection-templates/work-orders/create-inspection
```

**Request Body:**
```json
{
  "workOrderId": "work_order_id",
  "templateId": "template_id",
  "inspectorId": "technician_id",
  "notes": "Custom inspection notes",
  "checklistItems": [
    {
      "templateItemId": "template_item_id",
      "status": "GREEN",
      "notes": "Item is in good condition",
      "requiresFollowUp": false
    }
  ]
}
```

#### Get Work Order Inspections
```http
GET /api/inspection-templates/work-orders/inspections?page=1&limit=10&workOrderId=work_order_id&isCompleted=false
```

#### Get Inspections by Work Order
```http
GET /api/inspection-templates/work-orders/:workOrderId/inspections
```

#### Get Inspections by Inspector
```http
GET /api/inspection-templates/inspectors/:inspectorId/inspections
```

#### Get Inspection by ID
```http
GET /api/inspection-templates/inspections/:id
```

#### Update Inspection
```http
PUT /api/inspection-templates/inspections/:id
```

**Request Body:**
```json
{
  "notes": "Updated inspection notes",
  "isCompleted": true
}
```

### Checklist Item Management

#### Add Checklist Item
```http
POST /api/inspection-templates/inspections/:inspectionId/checklist-items
```

**Request Body:**
```json
{
  "templateItemId": "template_item_id",
  "category": "Engine",
  "item": "Custom Check",
  "status": "YELLOW",
  "notes": "Needs attention",
  "requiresFollowUp": true
}
```

#### Update Checklist Item
```http
PUT /api/inspection-templates/checklist-items/:id
```

**Request Body:**
```json
{
  "status": "RED",
  "notes": "Critical issue found",
  "requiresFollowUp": true
}
```

#### Delete Checklist Item
```http
DELETE /api/inspection-templates/checklist-items/:id
```

## Data Models

### InspectionTemplate
```typescript
{
  id: string;
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
  templateItems?: InspectionTemplateItem[];
}
```

### InspectionTemplateItem
```typescript
{
  id: string;
  templateId: string;
  name: string;
  description?: string;
  category?: string;
  sortOrder?: number;
  isRequired: boolean;
  allowsNotes: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### WorkOrderInspection
```typescript
{
  id: string;
  workOrderId: string;
  inspectorId: string;
  templateId?: string;
  date: Date;
  notes?: string;
  isCompleted: boolean;
  template?: InspectionTemplate;
  checklistItems?: InspectionChecklistItem[];
}
```

### InspectionChecklistItem
```typescript
{
  id: string;
  inspectionId: string;
  templateItemId?: string;
  category?: string;
  item: string;
  status: ChecklistStatus; // GREEN, YELLOW, RED
  notes?: string;
  requiresFollowUp: boolean;
  createdAt: Date;
  templateItem?: InspectionTemplateItem;
}
```

## Usage Examples

### 1. Service Advisor Assigns Template to Work Order

```typescript
// Service advisor assigns an engine inspection template to a work order
const assignment = await fetch('/api/inspection-templates/work-orders/assign-template', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workOrderId: 'wo_123',
    templateId: 'template_engine_mechanical',
    inspectorId: 'tech_456',
    notes: 'Perform comprehensive engine inspection'
  })
});
```

### 2. Technician Performs Inspection

```typescript
// Technician updates checklist items during inspection
const updateItem = await fetch('/api/inspection-templates/checklist-items/item_789', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'YELLOW',
    notes: 'Oil level is slightly low, needs topping up',
    requiresFollowUp: true
  })
});
```

### 3. Complete Inspection

```typescript
// Mark inspection as completed
const completeInspection = await fetch('/api/inspection-templates/inspections/inspection_123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    notes: 'Inspection completed. Found 2 items requiring follow-up.',
    isCompleted: true
  })
});
```

## Response Format

All endpoints return responses in the following format:

```typescript
{
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

## Error Handling

The module includes comprehensive error handling:

- **Validation Errors**: Returns 400 with detailed validation messages
- **Not Found Errors**: Returns 404 for missing resources
- **Business Logic Errors**: Returns 400 with specific error messages
- **Server Errors**: Returns 500 for internal server errors

## Integration

This module integrates with:

- **Work Orders Module**: Links inspections to work orders
- **Users Module**: Associates inspections with technicians
- **Authentication**: Requires proper user authentication and authorization

## Security

- All endpoints require authentication
- Service advisors can assign templates and view inspections
- Technicians can perform inspections and update checklist items
- Proper validation prevents unauthorized access

## Database Relationships

- `InspectionTemplate` → `InspectionTemplateItem` (One-to-Many)
- `WorkOrder` → `WorkOrderInspection` (One-to-Many)
- `WorkOrderInspection` → `InspectionChecklistItem` (One-to-Many)
- `InspectionTemplate` → `WorkOrderInspection` (One-to-Many)
- `InspectionTemplateItem` → `InspectionChecklistItem` (One-to-Many)
