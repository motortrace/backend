# Labor Pricing Revamp - Implementation Summary

##  Completed: Database Schema Migration

### What Changed:
1. **LaborCatalog** - Changed from hourly to fixed pricing
   - ❌ Removed: `hourlyRate` (required)
   -  Added: `price` (fixed price per labor operation)
   -  Changed: `estimatedHours` → now optional (for scheduling only, not billing)

2. **WorkOrderLabor** - Changed from hours×rate to price×quantity
   - ❌ Removed: `hours` (required)
   - ❌ Removed: `rate` (required)
   -  Added: `price` (fixed price per unit)
   -  Added: `quantity` (default: 1)
   -  Added: `estimatedHours` (optional, for scheduling/tracking only)
   -  Formula changed: `subtotal = price × quantity` (was `hours × rate`)

3. **EstimateLabor** - Same changes as WorkOrderLabor
   - ❌ Removed: `hours` (required)
   - ❌ Removed: `rate` (required)
   -  Added: `price` (fixed price per unit)
   -  Added: `quantity` (default: 1)
   -  Added: `estimatedHours` (optional, for scheduling only)

### Data Migration:
- Existing data preserved by converting: `price = hours × rate`
- All existing records set: `quantity = 1`
- Old `hours` values copied to `estimatedHours` for tracking

### How Applied:
```bash
# 1. Ran migration script to add new columns and migrate data
npx ts-node scripts/migrate-labor-pricing.ts

# 2. Pushed schema changes to remove old columns
npx prisma db push
```

## 🔧 TODO: Code Updates Required

### 1. **labor.service.ts** - Major updates needed
   -  Line 44: `createLabor()` - Change `subtotal = hours * rate` → `price * quantity`
   -  Line 49-51: Remove `hours`, `rate` params, add `price`, `quantity`
   -  Line 85: `createLaborCatalog()` - Change `estimatedHours`, `hourlyRate` → `price`, `estimatedHours?`
   -  Line 91-92: Update field names
   -  Line 238: `createWorkOrderLabor()` - Change calculation
   -  Line 245-247: Update field names
   -  Line 403: `updateWorkOrderLabor()` - Fix subtotal calculation
   -  Line 407-409: Change `hours/rate` logic to `price/quantity`
   -  Line 458: `getWorkOrderLaborSummary()` - Change from `totalHours` to `totalQuantity`
   -  Line 468: Update aggregation logic
   -  Line 495: `getTechnicianLaborSummary()` - Same changes

### 2. **labor.types.ts** - Type definitions
   - Update `CreateLaborCatalogRequest`
   - Update `UpdateLaborCatalogRequest`
   - Update `CreateWorkOrderLaborRequest`
   - Update `UpdateWorkOrderLaborRequest`
   - Update `CreateLaborRequest`
   - Update `LaborSummary` (change `totalHours` → `totalQuantity`)

### 3. **labor.validation.ts** - Validation rules
   - Update field validations
   - Change from `hours` + `rate` → `price` + `quantity`

### 4. **labor.controller.ts** - API handlers
   - Update request/response handling
   - Fix any references to old fields

### 5. **Invoice generation** (invoices.service.ts)
   - Already updated!  PDF now shows: Type | Description | Qty | Unit Price | Total
   - InvoiceLineItem creation should use labor.price and labor.quantity

### 6. **Estimates** - If there's an estimates service
   - Update EstimateLabor creation/updates

### 7. **Mobile App** - Frontend changes needed
   - Change labor forms from hours/rate inputs → price/quantity
   - Update labor display to show fixed prices
   - Remove hourly rate calculations from UI

## Business Logic Summary

### OLD Model (Hours × Rate):
```
Labor: Oil Change
Hours: 1.5
Rate: Rs. 3,333/hr
Subtotal: Rs. 5,000
```

### NEW Model (Fixed Price × Quantity):
```
Labor: Oil Change
Price: Rs. 5,000
Quantity: 1
Subtotal: Rs. 5,000
```

### Benefits:
1.  Matches Sri Lankan business practices
2.  Simpler pricing (no hourly calculations)
3.  Clearer invoices for customers
4.  `estimatedHours` still available for scheduling
5.  Can charge for multiple of same labor (quantity > 1)

## Next Steps:
1. Update labor.types.ts
2. Update labor.validation.ts
3. Update labor.service.ts
4. Update labor.controller.ts
5. Test with existing work orders
6. Update mobile app forms
7. Update documentation
