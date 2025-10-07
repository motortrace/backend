# Work Orders Service Changes for Service-Based Pricing

## Overview
This document outlines all the changes needed in `work-orders.service.ts` to support the new service-based pricing architecture where:
- **Services** have prices (billable to customer)
- **Labor** tracks work only (NO prices - just who did what and how long)
- **Parts** are independent billable items

---

## 1. LaborCatalog References - Change Hours to Minutes

### Find and Replace:
```typescript
// OLD:
estimatedHours: true,
hourlyRate: true,

// NEW:
estimatedMinutes: true,
skillLevel: true,
```

### Affected Methods:
- `createWorkOrder()` - line ~217 (laborCatalog select)
- `getWorkOrders()` - line ~410 (laborCatalog select)
- `getWorkOrderById()` - line ~694 (laborCatalog select)
- `updateWorkOrder()` - line ~877 (laborCatalog select)
- `deleteWorkOrder()` - line ~1074 (laborCatalog select)
- `restoreWorkOrder()` - line ~1271 (laborCatalog select)
- `getCancelledWorkOrders()` - line ~1447 (laborCatalog select)
- `createWorkOrderService()` - line ~1597-1605 (calculation logic)

---

## 2. Remove Labor Pricing Logic from createWorkOrderService()

### Current Code (lines ~1597-1610):
```typescript
// Automatically create labor entries for this canned service
if (cannedService.laborOperations.length > 0) {
  const laborEntries = await Promise.all(
    cannedService.laborOperations.map(async (laborOp) => {
      return await this.prisma.workOrderLabor.create({
        data: {
          workOrderId: data.workOrderId,
          laborCatalogId: laborOp.laborCatalogId,
          description: laborOp.laborCatalog.name,
          hours: Number(laborOp.laborCatalog.estimatedHours),
          rate: Number(laborOp.laborCatalog.hourlyRate),
          subtotal: Number(laborOp.laborCatalog.estimatedHours) * Number(laborOp.laborCatalog.hourlyRate),
          notes: laborOp.notes || `Auto-generated from canned service: ${cannedService.name}`,
        },
```

### New Code:
```typescript
// Automatically create labor entries for this canned service (TRACKING ONLY - NO PRICING)
if (cannedService.laborOperations.length > 0) {
  const laborEntries = await Promise.all(
    cannedService.laborOperations.map(async (laborOp) => {
      return await this.prisma.workOrderLabor.create({
        data: {
          workOrderId: data.workOrderId,
          serviceId: service.id,  // Labor must belong to a service
          laborCatalogId: laborOp.laborCatalogId,
          description: laborOp.laborCatalog.name,
          estimatedMinutes: laborOp.estimatedMinutes || laborOp.laborCatalog.estimatedMinutes,
          notes: laborOp.notes || `Auto-generated from canned service: ${cannedService.name}`,
        },
```

**Key Changes:**
- Remove `hours`, `rate`, `subtotal`
- Add `serviceId: service.id` (required)
- Change to `estimatedMinutes`

---

## 3. Remove updateWorkOrderLaborSubtotal() Method

### Current Method (lines ~1811-1872):
This entire method should be **DELETED** or **STUBBED OUT** because labor no longer has subtotals.

### Option A - Delete Entirely:
Just delete the method.

### Option B - Stub Out (Recommended):
```typescript
// DEPRECATED: Labor no longer has pricing - pricing is at service level
// This method is no longer applicable in the new service-based pricing architecture
async updateWorkOrderLabor(laborId: string, data: UpdateWorkOrderLaborRequest) {
  return await this.prisma.workOrderLabor.update({
    where: { id: laborId },
    data: {
      ...data,
      // No pricing calculations - labor is for tracking only
    },
    include: {
      laborCatalog: {
        select: {
          id: true,
          code: true,
          name: true,
          estimatedMinutes: true,
          skillLevel: true,
        },
      },
      technician: {
        select: {
          id: true,
          employeeId: true,
          userProfile: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      workOrder: {
        select: {
          id: true,
          workOrderNumber: true,
        },
      },
    },
  });
}
```

---

## 4. Remove updateWorkOrderServiceSubtotal() Method

### Current Method (lines ~1874-1898):
This method calculates service subtotal from labor items - **NO LONGER VALID**.

### New Logic:
Service subtotal should ONLY be calculated from `unitPrice × quantity`, NOT from labor.

### Delete or Replace With:
```typescript
// Service subtotal is calculated from unitPrice × quantity (NOT from labor)
// Labor is for tracking only and doesn't affect service pricing
private async updateWorkOrderServiceSubtotal(serviceId: string) {
  const service = await this.prisma.workOrderService.findUnique({
    where: { id: serviceId },
  });
  
  if (!service) return;
  
  // Simply recalculate from unitPrice and quantity
  const subtotal = Number(service.unitPrice) * Number(service.quantity);
  
  await this.prisma.workOrderService.update({
    where: { id: serviceId },
    data: { subtotal },
  });
}
```

---

## 5. Update updateWorkOrderTotals() Method

### Current Code (lines ~1900-1926):
```typescript
private async updateWorkOrderTotals(workOrderId: string) {
  const [laborItems, partItems, serviceItems] = await Promise.all([
    this.prisma.workOrderLabor.findMany({
      where: { workOrderId },
      select: { subtotal: true },
    }),
    // ...
  ]);

  const subtotalLabor = laborItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
  // ...
  
  await this.prisma.workOrder.update({
    where: { id: workOrderId },
    data: {
      subtotalLabor,
      subtotalParts,
      totalAmount,
    },
  });
}
```

### New Code:
```typescript
private async updateWorkOrderTotals(workOrderId: string) {
  // Calculate totals from SERVICES and PARTS only (NOT labor)
  const [serviceItems, partItems] = await Promise.all([
    this.prisma.workOrderService.findMany({
      where: { workOrderId },
      select: { subtotal: true },
    }),
    this.prisma.workOrderPart.findMany({
      where: { workOrderId },
      select: { subtotal: true },
    }),
  ]);

  const subtotalServices = serviceItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
  const subtotalParts = partItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
  const subtotal = subtotalServices + subtotalParts;

  // Get existing tax and discount amounts
  const existingWorkOrder = await this.prisma.workOrder.findUnique({
    where: { id: workOrderId },
    select: { taxAmount: true, discountAmount: true },
  });

  const taxAmount = Number(existingWorkOrder?.taxAmount || 0);
  const discountAmount = Number(existingWorkOrder?.discountAmount || 0);
  const totalAmount = subtotal + taxAmount - discountAmount;

  await this.prisma.workOrder.update({
    where: { id: workOrderId },
    data: {
      subtotalServices,
      subtotalParts,
      subtotal,
      totalAmount,
    },
  });
}
```

**Key Changes:**
- Remove `laborItems` query
- Remove `subtotalLabor` calculation
- Change to `subtotalServices`
- Add `subtotal` field (total before tax/discount)

---

## 6. Update resetWorkOrderLaborSubtotal() Method

### Current Code (lines ~1928-2004):
Delete entirely or stub out.

### New Code:
```typescript
// DEPRECATED: Labor no longer has pricing
// This method is no longer applicable in the new service-based pricing architecture
async resetWorkOrderLaborSubtotal(laborId: string) {
  throw new Error('Labor items no longer have pricing. Pricing is at the service level.');
}
```

---

## 7. Update getWorkOrderStatistics() Method

### Current Code (lines ~2006-2098):
```typescript
this.prisma.workOrderLabor.groupBy({
  by: ['technicianId'],
  where: { workOrder: where },
  _sum: { hours: true },
  _count: { workOrderId: true },
  orderBy: { _count: { workOrderId: 'desc' } },
  take: 5,
}),
```

### New Code:
```typescript
this.prisma.workOrderLabor.groupBy({
  by: ['technicianId'],
  where: { workOrder: where },
  _sum: { estimatedMinutes: true, actualMinutes: true },
  _count: { workOrderId: true },
  orderBy: { _count: { workOrderId: 'desc' } },
  take: 5,
}),
```

### And Update Return Mapping (lines ~2087-2098):
```typescript
topTechnicians: topTechnicians.map(t => {
  const technician = technicians.find(tech => tech.id === t.technicianId);
  return {
    technicianId: t.technicianId || '',
    technicianName: technician?.userProfile?.name || 'Unknown',
    completedWorkOrders: t._count?.workOrderId || 0,
    totalMinutes: Number(t._sum?.actualMinutes || t._sum?.estimatedMinutes || 0),
  };
}),
```

**Key Changes:**
- Change `hours: true` to `estimatedMinutes: true, actualMinutes: true`
- Change `totalHours` to `totalMinutes`

---

## 8. Update generateEstimateFromLaborAndParts() Method

### Current Code (lines ~2366-2483):
```typescript
const laborTotal = workOrder.laborItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
```

### New Code:
```typescript
// Calculate from SERVICES, not labor
const serviceTotal = workOrder.services.reduce((sum, item) => sum + Number(item.subtotal), 0);
```

### And Update the Work Order Update (lines ~2463):
```typescript
// OLD:
data: {
  subtotalLabor: laborTotal,
  // ...
}

// NEW:
data: {
  subtotalServices: serviceTotal,
  subtotalParts: partTotal,
  subtotal: serviceTotal + partTotal,
  // ...
}
```

---

## 9. Remove cannedServiceId References from Labor

**CRITICAL:** The regex replacement `cannedServiceId:` → `// cannedServiceId:` was TOO BROAD.

### Keep cannedServiceId in:
- ✅ `WorkOrderService` (services DO link to canned services)
- ✅ `CannedService` queries

### Remove cannedServiceId from:
- ❌ `WorkOrderLabor` (labor belongs to services via `serviceId`, not canned services)

### Example - Method updateWorkOrderLabor (lines ~1811-1872):
```typescript
// OLD:
const currentLabor = await this.prisma.workOrderLabor.findUnique({
  where: { id: laborId },
  select: { 
    id: true,
    workOrderId: true,
    cannedServiceId: true,  // ❌ REMOVE THIS
    subtotal: true  // ❌ REMOVE THIS
  },
});

// If this labor item is associated with a canned service, update the service subtotal
if (currentLabor.cannedServiceId) {  // ❌ REMOVE THIS
  await this.updateWorkOrderServiceSubtotal(currentLabor.workOrderId, currentLabor.cannedServiceId);
}

// NEW:
const currentLabor = await this.prisma.workOrderLabor.findUnique({
  where: { id: laborId },
  select: { 
    id: true,
    workOrderId: true,
    serviceId: true,  // ✅ USE THIS INSTEAD
  },
});

// Labor belongs to a service, not directly to a canned service
if (currentLabor.serviceId) {
  // Update the parent service if needed
  await this.updateWorkOrderTotals(currentLabor.workOrderId);
}
```

---

## 10. Summary of All Changes

### Global Find & Replace:
1. `estimatedHours: true` → `estimatedMinutes: true`
2. `hourlyRate: true` → `skillLevel: true`
3. `subtotalLabor` → `subtotalServices`
4. `.hours` (in labor context) → `.estimatedMinutes` or `.actualMinutes`
5. `item.subtotal` (in labor context) → Remove or set to 0

### Methods to Delete/Stub:
- `resetWorkOrderLaborSubtotal()` - Line ~1928
- `updateWorkOrderServiceSubtotal()` - Line ~1874 (or rewrite completely)

### Methods to Rewrite:
- `createWorkOrderService()` - Remove labor pricing calculations
- `updateWorkOrderTotals()` - Remove labor totals, add service totals
- `updateWorkOrderLabor()` - Remove subtotal calculations
- `getWorkOrderStatistics()` - Change hours to minutes
- `generateEstimateFromLaborAndParts()` - Use services instead of labor

### Schema Fields Changed:
```typescript
// WorkOrderLabor - REMOVED:
- hours
- rate  
- subtotal
- cannedServiceId
- serviceDiscountAmount
- serviceDiscountType

// WorkOrderLabor - ADDED:
+ serviceId (REQUIRED)
+ estimatedMinutes
+ actualMinutes

// WorkOrder - REMOVED:
- subtotalLabor

// WorkOrder - ADDED:
+ subtotalServices
+ subtotal
+ discountType
+ discountReason

// LaborCatalog - CHANGED:
- estimatedHours → estimatedMinutes
- hourlyRate → REMOVED
+ skillLevel
```

---

## Quick Reference: Line Numbers for Key Changes

| Method | Approx Line | Change Type |
|--------|-------------|-------------|
| `createWorkOrder()` | 217, 410, 694, 877, etc. | Change `estimatedHours` to `estimatedMinutes` |
| `createWorkOrderService()` | 1597-1610 | Remove labor pricing, add `serviceId` |
| `updateWorkOrderLabor()` | 1811-1872 | Remove `subtotal` calculation |
| `updateWorkOrderServiceSubtotal()` | 1874-1898 | Delete or rewrite completely |
| `updateWorkOrderTotals()` | 1900-1926 | Remove labor, add services |
| `resetWorkOrderLaborSubtotal()` | 1928-2004 | Delete or stub out |
| `getWorkOrderStatistics()` | 2006-2098 | Change hours to minutes |
| `generateEstimateFromLaborAndParts()` | 2366-2483 | Use services instead of labor |

---

## Testing Checklist

After making changes:
- [ ] Server starts without TypeScript errors
- [ ] Can create work order with services
- [ ] Can add labor to track work (no pricing)
- [ ] Can add parts independently
- [ ] Work order totals calculate correctly (services + parts, NOT labor)
- [ ] Invoice generation works
- [ ] Statistics show minutes instead of hours

