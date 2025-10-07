# Service-Based Pricing Architecture

## 🎯 Core Principle

**Services have prices. Labor tracks work. Parts are independent.**

---

## 📐 Architecture Overview

### **3-Layer Model:**

```
┌─────────────────────────────────────────────────┐
│ LAYER 1: TEMPLATES (Catalog)                   │
├─────────────────────────────────────────────────┤
│ CannedService                                   │
│ - Has fixed price                               │
│ - Lists required labor operations               │
│ - For booking & estimating                      │
│                                                 │
│ LaborCatalog                                    │
│ - NO prices                                     │
│ - Just operation definitions                    │
│ - For tracking & workflow                       │
└─────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────┐
│ LAYER 2: WORK ORDER (Actual Work)              │
├─────────────────────────────────────────────────┤
│ WorkOrderService                                │
│ - Billable item (has price)                    │
│ - Customer pays for this                        │
│ - Contains child labor for tracking             │
│                                                 │
│ WorkOrderLabor                                  │
│ - Tracking only (NO price)                      │
│ - Links to parent service                       │
│ - Tracks technician & time                      │
│                                                 │
│ WorkOrderPart                                   │
│ - Independent billable item                     │
│ - Has its own price                             │
│ - Not linked to services                        │
└─────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────┐
│ LAYER 3: INVOICE (Billing)                     │
├─────────────────────────────────────────────────┤
│ Shows:                                          │
│ - Services (with prices)                        │
│ - Parts (with prices)                           │
│ - Discount (work order level)                   │
│ - Tax                                           │
│                                                 │
│ Does NOT show:                                  │
│ - Individual labor operations                   │
│ - Labor prices                                  │
└─────────────────────────────────────────────────┘
```

---

## 💰 Pricing Flow

### **Example: Oil Change Service**

#### **Step 1: Template Definition**
```javascript
CannedService {
  code: "OIL-CHANGE",
  name: "Oil Change Service",
  price: 5000,  // ← Service price
  duration: 60,
  
  laborOperations: [
    { laborCatalog: "Oil Drain & Fill", sequence: 1, estimatedMinutes: 30 },
    { laborCatalog: "Filter Installation", sequence: 2, estimatedMinutes: 15 },
    { laborCatalog: "Visual Inspection", sequence: 3, estimatedMinutes: 15 }
  ]
}

LaborCatalog {
  code: "OIL-DRAIN-FILL",
  name: "Oil Drain & Fill",
  // NO PRICE!
  estimatedMinutes: 30,
  category: "Engine"
}
```

#### **Step 2: Work Order Creation**
```javascript
// Customer books service
WorkOrderService {
  cannedServiceId: "oil-change",
  description: "Oil Change Service - Honda Civic 2020",
  quantity: 1,
  unitPrice: 5000,  // ← From template
  subtotal: 5000,
  
  // Auto-create labor items from template
  laborItems: [
    {
      laborCatalogId: "oil-drain-fill",
      description: "Oil Drain & Fill",
      // NO PRICE!
      technicianId: null,
      estimatedMinutes: 30
    },
    {
      laborCatalogId: "filter-install",
      description: "Filter Installation",
      // NO PRICE!
      technicianId: null,
      estimatedMinutes: 15
    },
    {
      laborCatalogId: "visual-check",
      description: "Visual Inspection",
      // NO PRICE!
      technicianId: null,
      estimatedMinutes: 15
    }
  ]
}

// Add parts separately
WorkOrderPart {
  inventoryItemId: "castrol-edge-5w30",
  quantity: 4,
  unitPrice: 850,
  subtotal: 3400
}

WorkOrderPart {
  inventoryItemId: "oil-filter-honda",
  quantity: 1,
  unitPrice: 600,
  subtotal: 600
}
```

#### **Step 3: Technician Assignment**
```javascript
// Assign tech to labor operation
WorkOrderLabor.update({
  technicianId: "tech-123",
  startTime: "2025-01-07T09:00:00Z",
  status: "IN_PROGRESS"
})

// Complete labor operation
WorkOrderLabor.update({
  endTime: "2025-01-07T09:28:00Z",
  actualMinutes: 28,  // Auto-calculated
  status: "COMPLETED"
})
```

#### **Step 4: Invoice Generation**
```
INVOICE #INV-001

SERVICES
────────────────────────────────────────────
Oil Change Service                 Rs. 5,000
                                   ─────────
Services Subtotal                  Rs. 5,000

PARTS
────────────────────────────────────────────
Engine Oil - Castrol Edge 5W-30
  4L @ Rs. 850/L                   Rs. 3,400
  
Oil Filter - Honda Civic           Rs.   600
                                   ─────────
Parts Subtotal                     Rs. 4,000
                                   ═════════
Subtotal                           Rs. 9,000
Discount (10%)                    -Rs.   900
Tax (VAT 18%)                     +Rs. 1,458
                                   ═════════
TOTAL                              Rs. 9,558
```

#### **Step 5: Internal Reporting**
```javascript
// Backend tracking (not shown to customer)
{
  service: "Oil Change Service",
  servicePrice: 5000,
  laborBreakdown: [
    {
      operation: "Oil Drain & Fill",
      technician: "John Doe",
      estimatedMinutes: 30,
      actualMinutes: 28,
      status: "COMPLETED"
    },
    {
      operation: "Filter Installation",
      technician: "John Doe",
      estimatedMinutes: 15,
      actualMinutes: 12,
      status: "COMPLETED"
    },
    {
      operation: "Visual Inspection",
      technician: "Jane Smith",
      estimatedMinutes: 15,
      actualMinutes: 10,
      status: "COMPLETED"
    }
  ],
  totalEstimatedTime: 60,
  totalActualTime: 50,  // 10 minutes ahead of schedule!
  efficiency: 120%
}
```

---

## 🗄️ Schema Changes

### **Changes Summary:**

| Model | Old | New | Reason |
|-------|-----|-----|--------|
| **CannedService** | `price` exists | Keep `price` | ✅ Services have prices |
| **LaborCatalog** | `price`, `hourlyRate` | Remove all pricing | ❌ Labor is tracking only |
| **WorkOrderService** | No `unitPrice` | Add `unitPrice`, `subtotal` | ✅ Services are billable |
| **WorkOrderLabor** | `price`, `quantity`, `subtotal` | Remove all pricing | ❌ Labor is tracking only |
| **WorkOrderLabor** | `serviceId` optional | Make `serviceId` required | ✅ Labor must belong to service |
| **WorkOrderLabor** | `estimatedHours` | Change to `estimatedMinutes` | ✅ More practical unit |
| **WorkOrderPart** | `serviceId` exists | Remove `serviceId` | ✅ Parts are independent |
| **WorkOrderPart** | Discount fields | Remove discounts | ✅ Discounts at work order level |
| **WorkOrderLabor** | Discount fields | Remove discounts | ✅ Discounts at work order level |

---

## 🎨 Benefits

### **For Customers:**
- ✅ Simple, clear pricing
- ✅ Easy-to-understand invoices
- ✅ Package-based pricing (standard industry practice)
- ✅ No confusing labor breakdowns

### **For Service Advisors:**
- ✅ Easy to quote services
- ✅ Quick work order creation
- ✅ Simple price adjustments
- ✅ Professional invoices

### **For Technicians:**
- ✅ Clear task list
- ✅ Time tracking for each operation
- ✅ Performance metrics
- ✅ No confusion about pricing

### **For Management:**
- ✅ Track labor efficiency
- ✅ Analyze service profitability
- ✅ Monitor technician performance
- ✅ Simple pricing updates

### **For System:**
- ✅ Clean data model
- ✅ No arbitrary price allocations
- ✅ Easy to maintain
- ✅ Scalable architecture

---

## 🔄 Migration Strategy

### **Phase 1: Schema Updates**
1. Remove price/quantity/subtotal from WorkOrderLabor
2. Remove price from LaborCatalog
3. Add unitPrice/subtotal to WorkOrderService
4. Make serviceId required in WorkOrderLabor
5. Remove discount fields from labor/parts

### **Phase 2: Data Migration**
1. For existing WorkOrderLabor with prices:
   - Group by serviceId
   - Sum labor prices → Set parent service price
   - Remove labor prices
2. For orphan WorkOrderLabor (no serviceId):
   - Create parent WorkOrderService
   - Link labor to new service

### **Phase 3: Code Updates**
1. Update service layer to use service pricing
2. Update invoice generation to show services
3. Update API endpoints
4. Update validation rules

### **Phase 4: Testing**
1. Test work order creation
2. Test invoice generation
3. Test with multiple services
4. Test discount application

---

## 📊 Invoice Examples

### **Simple Invoice (One Service + Parts)**
```
Oil Change Service                 Rs. 5,000
Engine Oil (4L)                    Rs. 3,400
Oil Filter                         Rs.   600
────────────────────────────────────────────
Subtotal                           Rs. 9,000
Tax (VAT 18%)                     +Rs. 1,620
────────────────────────────────────────────
TOTAL                              Rs.10,620
```

### **Complex Invoice (Multiple Services + Parts + Discount)**
```
SERVICES
────────────────────────────────────────────
Oil Change Service                 Rs. 5,000
Brake Inspection                   Rs. 2,500
Engine Diagnostic                  Rs. 3,500
────────────────────────────────────────────
Services Subtotal                  Rs.11,000

PARTS
────────────────────────────────────────────
Engine Oil - Castrol (4L)          Rs. 3,400
Oil Filter                         Rs.   600
Brake Pads - Front                 Rs. 4,500
Brake Fluid                        Rs.   800
────────────────────────────────────────────
Parts Subtotal                     Rs. 9,300
────────────────────────────────────────────
Subtotal                           Rs.20,300
Discount (10% - Loyal Customer)   -Rs. 2,030
Tax (VAT 18%)                     +Rs. 3,289
────────────────────────────────────────────
TOTAL                              Rs.21,559
```

---

## 🎯 Key Principles

1. **Services have prices** - Customer pays for services, not individual labor operations
2. **Labor tracks work** - Who did what, how long it took
3. **Parts are independent** - Not tied to services, vehicle-specific pricing
4. **One discount** - At work order level, not per item
5. **Simple invoices** - Services + Parts = Total

---

## 🚀 Implementation Status

- [ ] Schema updated
- [ ] Migration script created
- [ ] Data migrated
- [ ] Service layer updated
- [ ] Invoice generation updated
- [ ] API endpoints updated
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Production deployed
