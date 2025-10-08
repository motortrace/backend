# Service-Based Pricing Migration Status

##  Completed

### 1. Database Schema Changes
-  Removed `price`, `quantity`, `subtotal` from `WorkOrderLabor`
-  Made `serviceId` required in `WorkOrderLabor`
-  Changed `estimatedHours` to `estimatedMinutes` in `WorkOrderLabor`
-  Added `actualMinutes` to `WorkOrderLabor`
-  Removed `price` from `LaborCatalog`
-  Changed `estimatedHours` to `estimatedMinutes` in `LaborCatalog`
-  Added `skillLevel` to `LaborCatalog`
-  Made `cannedServiceId` optional in `WorkOrderService`
-  Added `laborItems` relation to `WorkOrderService`
-  Removed `serviceId` from `WorkOrderPart`
-  Removed discount fields from `WorkOrderLabor` and `WorkOrderPart`
-  Removed `subtotalLabor` from `WorkOrder`
-  Added `subtotalServices`, `subtotal`, `discountType`, `discountReason` to `WorkOrder`
-  Removed `ServiceDiscountType` enum
-  Schema pushed to database successfully

### 2. Data Migration
-  Created migration script (`scripts/migrate-service-pricing.ts`)
-  Migrated existing `WorkOrderService` records to have prices
-  Linked all `WorkOrderLabor` records to their parent services
-  Converted hours to minutes in labor tracking
-  Calculated work order totals (services + parts)
-  Migration executed successfully (1 labor item, 1 work order)

##  In Progress

### 3. Code Updates Required

The server currently won't start due to TypeScript errors. The following files need updates:

#### High Priority - Blocking Server Start:

**Labor Module:**
- `src/modules/labor/labor.service.ts` - Remove pricing logic, change estimatedHours → estimatedMinutes
- `src/modules/labor/labor.types.ts` - Update types (remove price, change hours → minutes)
- `src/modules/labor/labor.validation.ts` - Update validation (remove price, change hours → minutes)

**Work Orders Module:**
- `src/modules/work-orders/work-orders.service.ts` - Multiple issues:
  - Change `estimatedHours` to `estimatedMinutes` in all queries
  - Remove `cannedServiceId` from `WorkOrderLabor` queries
  - Remove `subtotal` updates on `WorkOrderLabor`
  - Update labor calculations to not include pricing
  - Fix work order summary calculations (use `subtotalServices` instead of `subtotalLabor`)
  
- `src/modules/work-orders/work-orders.types.ts` - Update type definitions

**Estimates Module:**
- `src/modules/estimates/estimates.types.ts` - Change `estimatedHours` to `estimatedMinutes`
- `src/modules/estimates/estimates.service.ts` - Update estimate calculations

#### Medium Priority:

**Invoices Module:**
- `src/modules/invoices/invoices.service.ts` - Update to generate invoices with:
  - Services section (showing service name, quantity, unit price, total)
  - Parts section (showing part name, quantity, unit price, total)
  - Single discount at work order level
  - Already uses pdfmake, just needs structure update

**Canned Services:**
- `src/modules/canned-services/canned-services.service.ts` - Verify service templates have prices

## 📋 Code Update Plan

### Phase 1: Fix Type Errors (Required to Start Server)

1. **Labor Module** (3 files):
   ```typescript
   // Change estimatedHours → estimatedMinutes
   // Remove price, quantity, subtotal fields
   // Update validation rules
   ```

2. **Work Orders Module** (2 files):
   ```typescript
   // Update all queries to use estimatedMinutes
   // Remove cannedServiceId from labor queries
   // Remove subtotal updates on labor
   // Change subtotalLabor → subtotalServices
   ```

3. **Estimates Module** (2 files):
   ```typescript
   // Change estimatedHours → estimatedMinutes
   // Update estimate calculations
   ```

### Phase 2: Update Invoice Generation

4. **Invoices Module** (1 file):
   ```typescript
   // Update PDF structure to show:
   // - Services section (with prices)
   // - Parts section (with prices)
   // - Single discount line
   ```

### Phase 3: Testing

5. **Create test work order** with new structure
6. **Generate invoice** and verify PDF format
7. **Test estimates** with new pricing model

## 🎯 Next Steps

1. Run through all TypeScript files and replace:
   - `estimatedHours` → `estimatedMinutes`
   - Remove references to `price`, `quantity`, `subtotal` on labor
   - Remove references to `cannedServiceId` on labor
   - Remove references to `subtotalLabor` on work orders
   - Update to use `subtotalServices` instead

2. Once type errors are fixed, start the server

3. Test invoice generation with existing work order

4. Update invoice PDF format if needed

##  Impact Summary

- **Database**:  Complete and tested
- **Data Migration**:  Complete (1 work order migrated)
- **TypeScript Code**:  ~20 files need updates
- **Invoice Generation**:  Needs structure update
- **Testing**: ❌ Not started

## 🔍 Architecture Summary

**Final Model (Implemented):**
- **Services** = Billable packages (have prices)
- **Labor** = Work tracking only (who, what, how long - NO prices)
- **Parts** = Independent billable items
- **Discounts** = Applied at WorkOrder level only
- **Invoice** = Services + Parts - Discount + Tax
