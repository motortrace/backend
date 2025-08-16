# Inventory Management Module

A comprehensive inventory management system for automotive service centers, providing complete control over parts inventory, stock levels, and usage tracking.

## Features

### Core Inventory Management
- **CRUD Operations**: Create, read, update, and delete inventory items
- **Stock Tracking**: Real-time quantity tracking with minimum/maximum stock levels
- **Location Management**: Organize inventory by physical locations
- **Supplier Management**: Track suppliers and supplier part numbers
- **Core Charges**: Handle core charges for exchange parts

### Advanced Features
- **Stock Adjustments**: Add, remove, or set quantities with audit trail
- **Inventory Transfers**: Move items between locations
- **Bulk Operations**: Update multiple items simultaneously
- **Search & Filtering**: Advanced search with multiple criteria
- **Pagination**: Efficient handling of large inventory datasets

### Stock Monitoring
- **Low Stock Alerts**: Automatic detection of items below reorder points
- **Out of Stock Tracking**: Monitor items with zero quantity
- **Reorder Suggestions**: Intelligent suggestions for restocking
- **Stock Status**: Categorize items as IN_STOCK, LOW_STOCK, OUT_OF_STOCK, or OVERSTOCK

### Analytics & Reporting
- **Inventory Summary**: Overview of total items, value, and categories
- **Usage Tracking**: Monitor how often items are used in work orders
- **Inventory Reports**: Comprehensive reports with status and usage data
- **Work Order Integration**: Track parts used in specific work orders

## API Endpoints

### Basic CRUD Operations
```
POST   /inventory                    - Create new inventory item
GET    /inventory                    - Get inventory items (with filtering)
GET    /inventory/:id                - Get specific inventory item
PUT    /inventory/:id                - Update inventory item
DELETE /inventory/:id                - Delete inventory item
```

### Inventory Management
```
POST   /inventory/adjust             - Adjust stock quantities
POST   /inventory/transfer           - Transfer items between locations
PUT    /inventory/bulk-update        - Bulk update multiple items
```

### Stock Monitoring
```
GET    /inventory/low-stock/items    - Get items below reorder points
GET    /inventory/out-of-stock/items - Get items with zero quantity
GET    /inventory/reorder-suggestions - Get intelligent reorder suggestions
```

### Analytics & Reports
```
GET    /inventory/summary            - Get inventory overview
GET    /inventory/report/inventory   - Get comprehensive inventory report
GET    /inventory/report/work-order-parts - Get parts usage in work orders
```

### Reference Data
```
GET    /inventory/categories         - Get all categories
GET    /inventory/manufacturers      - Get all manufacturers
GET    /inventory/suppliers          - Get all suppliers
GET    /inventory/locations          - Get all locations
```

## Data Models

### InventoryItem
```typescript
{
  id: string;
  name: string;
  sku?: string;
  partNumber?: string;
  manufacturer?: string;
  category?: string;
  location?: string;
  quantity: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  unitPrice: number;
  supplier?: string;
  supplierPartNumber?: string;
  core: boolean;
  corePrice?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### InventoryAdjustmentRequest
```typescript
{
  inventoryItemId: string;
  adjustmentType: 'ADD' | 'REMOVE' | 'SET';
  quantity: number;
  reason: string;
  notes?: string;
  workOrderId?: string;
}
```

### InventoryTransferRequest
```typescript
{
  fromLocation: string;
  toLocation: string;
  items: Array<{
    inventoryItemId: string;
    quantity: number;
  }>;
  notes?: string;
}
```

## Usage Examples

### Creating an Inventory Item
```typescript
const newItem = await inventoryService.createInventoryItem({
  name: "Brake Pad Set - Front",
  sku: "BP-FRONT-001",
  partNumber: "BP12345",
  manufacturer: "Brembo",
  category: "Brakes",
  location: "Shelf A1",
  quantity: 10,
  minStockLevel: 2,
  maxStockLevel: 20,
  reorderPoint: 5,
  unitPrice: 89.99,
  supplier: "AutoZone",
  supplierPartNumber: "AZ-BP12345",
  core: false
});
```

### Adjusting Stock
```typescript
await inventoryService.adjustInventory({
  inventoryItemId: "item-id",
  adjustmentType: "REMOVE",
  quantity: 2,
  reason: "Used in work order WO-2024-001",
  workOrderId: "work-order-id"
});
```

### Getting Low Stock Items
```typescript
const lowStockItems = await inventoryService.getLowStockItems();
// Returns items where quantity <= reorderPoint or minStockLevel
```

### Getting Reorder Suggestions
```typescript
const suggestions = await inventoryService.getReorderSuggestions();
// Returns items that need reordering with urgency levels
```

## Filtering Options

The inventory list endpoint supports comprehensive filtering:

```typescript
// Query parameters
{
  category?: string;        // Filter by category
  manufacturer?: string;    // Filter by manufacturer
  supplier?: string;        // Filter by supplier
  location?: string;        // Filter by location
  lowStock?: boolean;       // Only low stock items
  outOfStock?: boolean;     // Only out of stock items
  search?: string;          // Search in name, sku, partNumber, manufacturer
  minPrice?: number;        // Minimum unit price
  maxPrice?: number;        // Maximum unit price
  page?: number;           // Page number (default: 1)
  limit?: number;          // Items per page (default: 20, max: 100)
}
```

## Integration with Work Orders

The inventory module integrates seamlessly with work orders:

- **Automatic Stock Reduction**: When parts are added to work orders
- **Usage Tracking**: Monitor which parts are used most frequently
- **Work Order History**: Track parts used in specific work orders
- **Installation Tracking**: Record who installed which parts

## Error Handling

The module includes comprehensive error handling:

- **Validation Errors**: Input validation with detailed error messages
- **Business Logic Errors**: Proper handling of insufficient stock, invalid transfers
- **Database Errors**: Graceful handling of database constraints and conflicts
- **Transaction Safety**: Atomic operations for critical inventory changes

## Performance Considerations

- **Pagination**: Efficient handling of large datasets
- **Indexed Queries**: Optimized database queries for filtering and searching
- **Caching**: Consider implementing Redis caching for frequently accessed data
- **Batch Operations**: Bulk updates for improved performance

## Security Considerations

- **Input Validation**: Comprehensive validation of all inputs
- **SQL Injection Prevention**: Using Prisma ORM for safe database operations
- **Access Control**: Implement role-based access control (RBAC)
- **Audit Trail**: Track all inventory changes for accountability

## Future Enhancements

- **Barcode Integration**: QR code/barcode scanning support
- **Automated Reordering**: Integration with supplier APIs
- **Inventory Forecasting**: Predictive analytics for demand
- **Multi-location Support**: Support for multiple service center locations
- **Mobile App Integration**: Real-time inventory updates on mobile devices
