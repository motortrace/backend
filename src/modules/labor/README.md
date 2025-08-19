# Labor Module

A comprehensive module for managing labor operations in the automotive service system. This module handles both labor catalog management and work order labor tracking.

## Features

### Labor Catalog Management
- Create, read, update, and delete labor catalog items
- Search and filter labor catalogs by category, status, and keywords
- Track estimated hours and hourly rates for labor operations
- Categorize labor operations (Engine, Brakes, Electrical, etc.)

### Work Order Labor Tracking
- Add labor items to work orders
- Link labor to technicians and canned services
- Track start/end times for labor operations
- Calculate labor costs automatically
- Support both catalog-based and custom labor entries

### Analytics and Reporting
- Work order labor summaries
- Technician labor summaries
- Labor category management
- Time-based filtering and reporting

## API Endpoints

### Labor Catalog Management

#### Create Labor Catalog
```
POST /api/labor/catalog
```
**Body:**
```json
{
  "code": "ENG001",
  "name": "Engine Oil Change",
  "description": "Standard engine oil change service",
  "estimatedHours": 0.5,
  "hourlyRate": 85.00,
  "category": "Engine",
  "isActive": true
}
```

#### Get Labor Catalogs
```
GET /api/labor/catalog?category=Engine&isActive=true&search=oil
```

#### Get Labor Catalog by ID
```
GET /api/labor/catalog/:id
```

#### Update Labor Catalog
```
PUT /api/labor/catalog/:id
```

#### Delete Labor Catalog
```
DELETE /api/labor/catalog/:id
```

### Work Order Labor Management

#### Create Work Order Labor
```
POST /api/labor/work-order
```
**Body:**
```json
{
  "workOrderId": "wo_123",
  "laborCatalogId": "lc_456",
  "description": "Engine oil change and filter replacement",
  "hours": 1.5,
  "rate": 85.00,
  "technicianId": "tech_789",
  "startTime": "2024-01-15T09:00:00Z",
  "endTime": "2024-01-15T10:30:00Z",
  "notes": "Customer requested synthetic oil"
}
```

#### Get Work Order Labors
```
GET /api/labor/work-order?workOrderId=wo_123&technicianId=tech_789
```

#### Get Work Order Labor by ID
```
GET /api/labor/work-order/:id
```

#### Update Work Order Labor
```
PUT /api/labor/work-order/:id
```

#### Delete Work Order Labor
```
DELETE /api/labor/work-order/:id
```

### Analytics and Reporting

#### Get Work Order Labor Summary
```
GET /api/labor/work-order/:workOrderId/summary
```
**Response:**
```json
{
  "success": true,
  "data": {
    "totalHours": 3.5,
    "totalCost": 297.50,
    "laborItems": [...]
  }
}
```

#### Get Labor Categories
```
GET /api/labor/categories
```

#### Get Technician Labor Summary
```
GET /api/labor/technician/:technicianId/summary?startDate=2024-01-01&endDate=2024-01-31
```

## Data Models

### LaborCatalog
```typescript
{
  id: string;
  code: string;
  name: string;
  description?: string;
  estimatedHours: number;
  hourlyRate: number;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### WorkOrderLabor
```typescript
{
  id: string;
  workOrderId: string;
  cannedServiceId?: string;
  laborCatalogId?: string;
  description: string;
  hours: number;
  rate: number;
  subtotal: number;
  technicianId?: string;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Validation Rules

### Labor Catalog
- `code`: Required, unique
- `name`: Required
- `estimatedHours`: Required, 0.1-100 hours
- `hourlyRate`: Required, minimum 0
- `category`: Optional
- `isActive`: Optional, defaults to true

### Work Order Labor
- `workOrderId`: Required
- `description`: Required
- `hours`: Required, 0.1-100 hours
- `rate`: Required, minimum 0
- `laborCatalogId`: Optional
- `cannedServiceId`: Optional
- `technicianId`: Optional
- `startTime`/`endTime`: Optional dates

## Business Logic

### Automatic Calculations
- Subtotal is automatically calculated as `hours * rate`
- Work order totals are updated when labor items are added/modified

### Validation Checks
- Work order must exist before adding labor
- Labor catalog items must exist if referenced
- Technicians must exist if assigned
- Cannot delete labor catalog items that are in use

### Filtering and Search
- Labor catalogs can be filtered by category, active status, and search terms
- Work order labors can be filtered by work order, technician, date range, and category

## Integration Points

- **Work Orders**: Labor items are linked to work orders
- **Staff Members**: Technicians are assigned to labor operations
- **Canned Services**: Labor can be linked to predefined services
- **Inventory**: Parts used in labor operations are tracked separately

## Error Handling

The module provides comprehensive error handling for:
- Invalid data validation
- Missing related entities
- Constraint violations
- Business rule violations

All errors return appropriate HTTP status codes and descriptive error messages.
