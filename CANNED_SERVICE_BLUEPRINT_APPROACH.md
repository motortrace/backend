# CannedService Blueprint Approach

## Overview

This approach treats `CannedService` as a blueprint that defines what labor operations and parts categories are typically used for a service, using proper relational database junction tables.

## How It Works

### 1. CannedService as Blueprint

```typescript
// Example: "Oil Change" CannedService
{
  id: "cs_001",
  code: "OIL_CHANGE",
  name: "Oil Change Service",
  description: "Complete oil change with filter",
  duration: 30, // minutes
  price: 89.99,
  isAvailable: true,
  laborOperations: [
    { laborCatalogId: "labor_001", sequence: 1, notes: "Drain oil and replace filter" }
  ],
  partsCategories: [
    { categoryId: "cat_001", isRequired: true, notes: "Engine oil" },
    { categoryId: "cat_002", isRequired: true, notes: "Oil filter" }
  ]
}
```

### 2. Junction Tables for Relational Integrity

#### CannedServiceLabor Table
```sql
-- Links CannedService to LaborCatalog with additional metadata
CREATE TABLE "CannedServiceLabor" (
  id TEXT PRIMARY KEY,
  cannedServiceId TEXT REFERENCES "CannedService"(id) ON DELETE CASCADE,
  laborCatalogId TEXT REFERENCES "LaborCatalog"(id) ON DELETE CASCADE,
  sequence INTEGER DEFAULT 1,
  notes TEXT,
  UNIQUE(cannedServiceId, laborCatalogId)
);
```

#### CannedServicePartsCategory Table
```sql
-- Links CannedService to InventoryCategory with additional metadata
CREATE TABLE "CannedServicePartsCategory" (
  id TEXT PRIMARY KEY,
  cannedServiceId TEXT REFERENCES "CannedService"(id) ON DELETE CASCADE,
  categoryId TEXT REFERENCES "InventoryCategory"(id) ON DELETE CASCADE,
  isRequired BOOLEAN DEFAULT true,
  notes TEXT,
  UNIQUE(cannedServiceId, categoryId)
);
```

### 3. Work Order Implementation

When a technician adds this service to a work order:

#### Step 1: Create WorkOrderService
```typescript
{
  id: "ws_001",
  workOrderId: "wo_001",
  cannedServiceId: "cs_001",
  quantity: 1,
  unitPrice: 89.99,
  subtotal: 89.99,
  status: "PENDING"
}
```

#### Step 2: Copy Labor Operations to WorkOrderLabour
```typescript
// For each labor operation in the canned service
{
  id: "wl_001",
  workOrderId: "wo_001",
  laborCatalogId: "labor_001", // From CannedServiceLabor
  description: "Oil Change Service",
  hours: 0.5,
  rate: 75.00,
  subtotal: 37.50,
  technicianId: "tech_001"
}
```

#### Step 3: Select Parts from Categories
The technician sees available parts from the required categories and selects specific items:

```typescript
// From "Engine Oil" category (required)
{
  id: "wp_001",
  workOrderId: "wo_001",
  inventoryItemId: "inv_001", // 5W-30 Synthetic Oil
  quantity: 5,
  unitPrice: 12.99,
  subtotal: 64.95
}

// From "Oil Filter" category (required)
{
  id: "wp_002",
  workOrderId: "wo_001",
  inventoryItemId: "inv_002", // Oil Filter
  quantity: 1,
  unitPrice: 8.99,
  subtotal: 8.99
}
```

## Benefits of Junction Table Approach

1. **Relational Integrity**: Proper foreign key constraints
2. **Performance**: Can use indexes on junction table columns
3. **Flexibility**: Additional metadata (sequence, isRequired, notes)
4. **Query Efficiency**: Standard SQL joins work optimally
5. **Data Validation**: Database enforces referential integrity
6. **Scalability**: Follows relational database best practices

## Database Schema

```sql
-- CannedService references LaborCatalog via junction table
CannedService <-> CannedServiceLabor <-> LaborCatalog

-- CannedService references InventoryCategory via junction table  
CannedService <-> CannedServicePartsCategory <-> InventoryCategory

-- WorkOrderLabor copies from LaborCatalog
WorkOrderLabor.laborCatalogId -> LaborCatalog.id

-- WorkOrderPart selects from InventoryItem
WorkOrderPart.inventoryItemId -> InventoryItem.id
```

## Flow Summary

1. **Setup**: Create CannedService with labor and parts category references via junction tables
2. **Booking**: Customer books CannedService (creates Appointment)
3. **Work Order**: Service advisor creates WorkOrder from Appointment
4. **Implementation**: Technician copies labor operations and selects specific parts
5. **Tracking**: All actual work tracked in WorkOrderLabor and WorkOrderPart
