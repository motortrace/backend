# Parts Workflow & System Design

## 📦 Endpoint to Check All Parts in System

```bash
GET http://localhost:3000/inventory
```

**Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page
- `search` (optional): Search by part number, name, or description
- `category` (optional): Filter by category
- `status` (optional): ACTIVE, INACTIVE, DISCONTINUED
- `lowStock` (optional): true/false - show only low stock items

**Example:**
```bash
curl -X GET "http://localhost:3000/inventory?limit=50&search=filter" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response includes:**
- Part details (partNumber, name, description)
- Pricing (cost, retailPrice, wholesalePrice)
- Stock levels (quantityOnHand, minStockLevel, maxStockLevel)
- Location information
- Manufacturer & supplier details
- Category information

---

## 🔄 Current Parts Workflow (Analysis)

### **Problem: Dual Entry Points Causing Confusion**

Currently, there are **TWO** different ways parts can be added to a work order:

#### Method 1: Via Estimate (Service Advisor) ✅ **CORRECT**
```
Service Advisor creates Estimate
  ↓
Adds EstimatePart (estimated parts needed)
  ↓
Customer approves estimate
  ↓
System automatically creates WorkOrderPart (actual parts to use)
```

#### Method 2: Direct WorkOrderPart Creation ❌ **PROBLEMATIC**
```
Technician adds WorkOrderPart directly
  ↓
Bypasses estimate and approval process
  ↓
Customer never saw or approved these parts
```

---

## ✅ RECOMMENDED PROPER WORKFLOW

### **Phase 1: Estimate Creation (Service Advisor)**

1. **Service Advisor** inspects vehicle or reviews inspection results
2. **Service Advisor** creates `WorkOrderEstimate`
3. **Service Advisor** adds parts via `EstimatePart`:
   ```json
   POST /estimates/{estimateId}/parts
   {
     "inventoryItemId": "part_123",
     "quantity": 2,
     "unitPrice": 45.99,
     "source": "INVENTORY",
     "notes": "Oil filter for oil change"
   }
   ```

### **Phase 2: Customer Approval**

4. **Customer** reviews estimate (via app/email)
5. **Customer** approves estimate
   ```json
   POST /estimates/{estimateId}/approve
   {
     "approvedById": "customer_id"
   }
   ```

### **Phase 3: Automatic Work Order Population**

6. **System automatically**:
   - Converts all `EstimatePart` → `WorkOrderPart`
   - Converts all `EstimateLabor` → `WorkOrderLabor`
   - Updates work order totals
   - Sets `estimateApproved = true`

### **Phase 4: Work Execution (Technician)**

7. **Technician** views assigned work order with approved parts
8. **Technician** performs work and installs parts
9. **Technician** marks parts as installed:
   ```json
   PUT /work-orders/{workOrderId}/parts/{partId}
   {
     "installedAt": "2025-10-07T10:30:00Z",
     "installedById": "tech_123",
     "notes": "Installed successfully"
   }
   ```

### **Phase 5: Additional Parts (If Needed)**

10. **Technician** discovers additional parts needed
11. **Technician** requests additional parts via notes/communication
12. **Service Advisor** adds new estimate parts
13. **Customer** approves updated estimate
14. **System** adds new parts to work order

---

## 🚫 What Should NOT Happen

### ❌ Technician Directly Adding Parts
- Technicians should **NOT** directly create `WorkOrderPart` entries
- This bypasses customer approval
- Creates billing disputes
- Inventory tracking issues

### ❌ Service Advisor Adding Parts Without Estimate
- Parts should **ALWAYS** go through the estimate process
- Even for "quick fixes" or warranty work
- Creates paper trail and approval record

---

## 📋 Data Models Explained

### **InventoryItem** (Master Parts Catalog)
```typescript
{
  id: string,
  partNumber: string,        // OEM/aftermarket part number
  name: string,             // Display name
  description: string,      // Detailed description
  quantityOnHand: number,   // Current stock
  retailPrice: Decimal,     // Customer price
  cost: Decimal,           // Shop's cost
  // ... more fields
}
```

### **EstimatePart** (Proposed Parts - Service Advisor Creates)
```typescript
{
  id: string,
  estimateId: string,
  inventoryItemId: string,
  quantity: number,
  unitPrice: Decimal,           // Price shown to customer
  subtotal: Decimal,
  source: PartSource,           // INVENTORY, SUPPLIER, etc.
  customerApproved: boolean,    // Customer approved this part?
  // ... more fields
}
```

### **WorkOrderPart** (Actual Parts - Auto-created on Approval)
```typescript
{
  id: string,
  workOrderId: string,
  inventoryItemId: string,
  quantity: number,
  unitPrice: Decimal,
  subtotal: Decimal,
  installedAt: DateTime?,       // When installed
  installedById: string?,       // Which technician
  cannedServiceId: string?,     // If part of service package
  // ... more fields
}
```

---

## 🔧 Implementation Recommendations

### 1. **Remove Direct WorkOrderPart Creation**
- Remove endpoints that allow technicians to add parts directly
- All parts must go through estimates

### 2. **Add Part Request Feature for Technicians**
```typescript
// New endpoint
POST /work-orders/{workOrderId}/part-requests
{
  "inventoryItemId": "part_123",
  "quantity": 1,
  "reason": "Discovered damaged part during inspection",
  "urgency": "HIGH"
}
```

This creates a request that:
- Notifies Service Advisor
- Service Advisor adds to estimate
- Customer approves
- Part is added to work order

### 3. **Add Permission Controls**
```typescript
// Only Service Advisors can:
- Create estimates
- Add/remove estimate parts
- Modify pricing

// Only Customers can:
- Approve estimates

// Technicians can:
- View assigned parts
- Mark parts as installed
- Request additional parts
- Add installation notes
```

### 4. **Add Audit Trail**
```typescript
// Track all part changes
{
  "action": "PART_ADDED",
  "actor": "service_advisor_123",
  "timestamp": "2025-10-07T10:00:00Z",
  "details": {
    "partId": "part_123",
    "addedTo": "estimate_456",
    "reason": "Customer requested upgrade"
  }
}
```

---

## 📊 Workflow Diagram

```
┌─────────────────┐
│  Service Advisor │
└────────┬────────┘
         │
         ↓
   Creates Estimate
         │
         ↓
┌─────────────────┐
│  Adds Parts to  │
│    Estimate     │ ← From Inventory Catalog
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Customer      │
│   Reviews &     │
│   Approves      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│    SYSTEM       │
│  Auto-creates   │
│  WorkOrderParts │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Technician    │
│   Views Parts   │
│   Installs      │
│   Marks Done    │
└─────────────────┘
```

---

## 🎯 Benefits of Proper Workflow

### ✅ **For Business:**
- Clear approval trail
- No surprise charges
- Better inventory tracking
- Reduced billing disputes

### ✅ **For Customers:**
- Know exactly what parts are needed
- See prices before approval
- Track what was installed
- Easy to verify on invoice

### ✅ **For Service Advisors:**
- Control over pricing
- Professional estimates
- Easy to communicate with customers
- Track approval status

### ✅ **For Technicians:**
- Clear list of approved parts
- No confusion about what to use
- Easy to request additional parts
- Installation tracking

---

## 🔐 API Endpoints Summary

### **Inventory (Parts Catalog)**
```
GET    /inventory                    # List all parts
GET    /inventory/:id               # Get part details
POST   /inventory                    # Create new part (admin)
PUT    /inventory/:id               # Update part (admin)
GET    /inventory/low-stock/items   # Low stock alerts
```

### **Estimate Parts (Service Advisor)**
```
GET    /estimates/:id                       # Get estimate with parts
POST   /estimates/:id/parts                 # Add part to estimate
PUT    /estimates/:id/parts/:partId         # Update estimate part
DELETE /estimates/:id/parts/:partId         # Remove estimate part
POST   /estimates/:id/approve               # Approve (creates WorkOrderParts)
```

### **Work Order Parts (Read-Only for Technicians)**
```
GET    /work-orders/:id/parts               # View assigned parts
PUT    /work-orders/:id/parts/:partId       # Mark as installed
POST   /work-orders/:id/part-requests       # Request additional parts
```

---

## 🚀 Next Steps

1. **Review Current Codebase**: Identify any direct WorkOrderPart creation endpoints
2. **Add Permission Middleware**: Ensure only Service Advisors can modify estimates
3. **Implement Part Request Feature**: Allow technicians to request parts properly
4. **Update Frontend**: Make workflow clear in UI
5. **Add Documentation**: API docs with workflow examples
6. **Training**: Train staff on proper workflow

---

## 💡 Example Scenarios

### Scenario 1: Standard Oil Change
```
1. SA creates estimate with:
   - Oil filter (EstimatePart)
   - 5 quarts synthetic oil (EstimatePart)
   - Oil change labor (EstimateLabor)
2. Customer approves
3. System creates WorkOrderParts automatically
4. Tech installs and marks complete
```

### Scenario 2: Additional Part Needed
```
1. Tech discovers worn belt during work
2. Tech creates part request via app
3. SA receives notification
4. SA adds belt to new/updated estimate
5. Customer approves additional work
6. System adds belt to work order
7. Tech installs belt
```

### Scenario 3: Customer-Supplied Part
```
1. Customer brings own air filter
2. SA creates estimate with:
   - Air filter (source: CUSTOMER_SUPPLIED, price: $0)
   - Installation labor (EstimateLabor)
3. Customer approves
4. System creates WorkOrderPart with CUSTOMER_SUPPLIED flag
5. Tech installs customer's part
```

---

**Last Updated**: October 7, 2025
**Status**: Workflow Analysis & Recommendations
