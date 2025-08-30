# Canned Services Module

A comprehensive module for managing predefined service packages in the automotive service system. This module handles both basic service information and detailed breakdowns of labor operations and parts categories.

## Features

### Basic Service Management
- Create, read, update, and delete canned services
- Search and filter services by availability, price, and keywords
- Toggle service availability for booking UI
- Bulk price updates for annual adjustments

### Detailed Service Information
- **NEW**: Get complete service breakdown including labor operations and parts categories
- View labor operations with sequence, estimated hours, and hourly rates
- View required and optional parts categories
- Support for service notes and additional metadata

## API Endpoints

### Basic Service Management

#### Create Canned Service
```
POST /api/canned-services
```
**Body:**
```json
{
  "code": "OIL_CHANGE",
  "name": "Oil Change Service",
  "description": "Complete oil change with filter replacement",
  "duration": 30,
  "price": 89.99,
  "isAvailable": true
}
```

#### Get All Canned Services
```
GET /api/canned-services?isAvailable=true&minPrice=50&maxPrice=200&search=oil
```

#### Get Canned Service by ID
```
GET /api/canned-services/:id
```

#### Get Canned Service by Code
```
GET /api/canned-services/code/:code
```

#### Update Canned Service
```
PUT /api/canned-services/:id
```

#### Delete Canned Service
```
DELETE /api/canned-services/:id
```

### **NEW: Detailed Service Information**

#### Get Canned Service with Labor and Parts Details
```
GET /api/canned-services/:id/details
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cs_001",
    "code": "OIL_CHANGE",
    "name": "Oil Change Service",
    "description": "Complete oil change with filter replacement",
    "duration": 30,
    "price": 89.99,
    "isAvailable": true,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "laborOperations": [
      {
        "id": "csl_001",
        "sequence": 1,
        "notes": "Drain oil and replace filter",
        "labor": {
          "id": "labor_001",
          "code": "OIL_CHANGE_LABOR",
          "name": "Oil Change Labor",
          "description": "Standard oil change labor operation",
          "estimatedHours": 0.5,
          "hourlyRate": 75.00,
          "category": "Engine",
          "isActive": true
        }
      }
    ],
    "partsCategories": [
      {
        "id": "cspc_001",
        "isRequired": true,
        "notes": "Engine oil",
        "category": {
          "id": "cat_001",
          "name": "Engine Oil"
        }
      },
      {
        "id": "cspc_002",
        "isRequired": true,
        "notes": "Oil filter",
        "category": {
          "id": "cat_002",
          "name": "Oil Filters"
        }
      }
    ]
  },
  "message": "Canned service details retrieved successfully"
}
```

### Additional Operations

#### Toggle Service Availability
```
PATCH /api/canned-services/:id/toggle-availability
```

#### Get Available Services Only
```
GET /api/canned-services/available
```

#### Search Services
```
GET /api/canned-services/search?query=oil&isAvailable=true
```

#### Bulk Update Prices
```
PATCH /api/canned-services/bulk-update-prices
```
**Body:**
```json
{
  "percentageIncrease": 5.5
}
```

## Data Models

### CannedService
```typescript
{
  id: string;
  code: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### CannedServiceLaborDetail
```typescript
{
  id: string;
  sequence: number;
  notes?: string;
  labor: {
    id: string;
    code: string;
    name: string;
    description?: string;
    estimatedHours: number;
    hourlyRate: number;
    category?: string;
    isActive: boolean;
  };
}
```

### CannedServicePartsCategoryDetail
```typescript
{
  id: string;
  isRequired: boolean;
  notes?: string;
  category: {
    id: string;
    name: string;
  };
}
```

## Database Relationships

The `CannedService` model uses junction tables to maintain many-to-many relationships:

- **CannedServiceLabor**: Links services to labor operations with sequence and notes
- **CannedServicePartsCategory**: Links services to parts categories with required/optional flags

## Usage Examples

### Getting Service Details for Work Order Creation
```typescript
// Get complete service breakdown
const serviceDetails = await cannedServiceService.getCannedServiceDetails(serviceId);

// Access labor operations
const laborOperations = serviceDetails.laborOperations;
const totalLaborHours = laborOperations.reduce((sum, op) => sum + op.labor.estimatedHours, 0);

// Access parts categories
const requiredParts = serviceDetails.partsCategories.filter(pc => pc.isRequired);
const optionalParts = serviceDetails.partsCategories.filter(pc => !pc.isRequired);
```

### Creating Work Order from Canned Service
```typescript
// When creating a work order, you can now see exactly what labor and parts are needed
const serviceDetails = await cannedServiceService.getCannedServiceDetails(cannedServiceId);

// Copy labor operations to work order
for (const laborOp of serviceDetails.laborOperations) {
  await workOrderService.addLabor({
    workOrderId,
    laborCatalogId: laborOp.labor.id,
    description: laborOp.labor.name,
    hours: laborOp.labor.estimatedHours,
    rate: laborOp.labor.hourlyRate,
    notes: laborOp.notes
  });
}

// Show technician what parts categories they need to select from
const partsCategories = serviceDetails.partsCategories;
```

## Testing

Use the provided test script to verify the endpoint works:

```bash
node scripts/test-canned-service-details.js
```

This will test the new details endpoint and show you the complete breakdown of a canned service including its labor operations and parts categories.
