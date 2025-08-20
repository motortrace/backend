# MotorTrace API Documentation

## Overview

MotorTrace is an automotive service management system that handles everything from customer appointments to work order completion. This document explains the data models, relationships, and API endpoints that frontend developers need to understand.

## Core Concepts

### 1. User Management & Authentication
- **UserProfile**: Extended profile data linked to Supabase auth
- **Role-based access**: Different user types (Customer, ServiceAdvisor, Technician, etc.)
- **Walk-in customers**: Support for customers without registered accounts

### 2. Service Management
- **Canned Services**: Pre-defined service packages (like oil change, brake service)
- **Estimates**: Customer approval workflow for service costs
- **Work Orders**: Complete service job tracking

### 3. Appointment System
- **ShopMonkey-style scheduling**: Time-block based appointment management
- **Service linking**: Appointments can include multiple canned services
- **Capacity planning**: Configurable shop hours and appointment limits

## Data Models & Relationships

### User & Authentication Models

#### UserProfile
```typescript
{
  id: string                    // Unique identifier
  supabaseUserId: string        // Links to Supabase auth.users.id
  name: string                  // User's full name
  phone: string                 // Contact phone
  profileImage: string          // Profile picture URL
  role: UserRole               // CUSTOMER, SERVICE_ADVISOR, TECHNICIAN, etc.
  isRegistrationComplete: boolean // Profile completion status
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Key Relationships:**
- One-to-one with role-specific models (ServiceAdvisor, Technician, etc.)
- One-to-one with Customer (if role is CUSTOMER)

#### Role-Specific Models
Each role extends UserProfile with additional fields:

- **ServiceAdvisor**: Employee ID, department, manages work orders and appointments
- **Technician**: Employee ID, specializations, certifications, performs inspections and labor
- **InventoryManager**: Employee ID, department, manages file uploads
- **Manager**: Employee ID, department, administrative role
- **Admin**: Employee ID, permissions array, highest access level

### Customer & Vehicle Management

#### Customer
```typescript
{
  id: string
  userProfileId: string?        // NULL for walk-in customers
  name: string                  // Required for all customers
  email: string?                // Optional for walk-ins
  phone: string?
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Key Relationships:**
- One-to-many with Vehicle
- One-to-many with WorkOrder
- One-to-many with Appointment

#### Vehicle
```typescript
{
  id: string
  customerId: string            // Links to Customer
  make: string                  // Vehicle manufacturer
  model: string                 // Vehicle model
  year: number?                 // Manufacturing year
  vin: string?                  // Vehicle Identification Number (unique)
  licensePlate: string?         // License plate number
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Service Management Models

#### CannedService
Pre-defined service packages that customers can book:

```typescript
{
  id: string
  code: string                  // Unique service code
  name: string                  // Service name (e.g., "Oil Change & Filter")
  description: string?          // Service description
  duration: number              // Estimated time in minutes
  price: Decimal                // Service price
  isAvailable: boolean          // Whether to show in booking UI
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Key Relationships:**
- Many-to-many with LaborCatalog (via CannedServiceLabor)
- Many-to-many with InventoryCategory (via CannedServicePartsCategory)
- One-to-many with WorkOrderService

#### LaborCatalog
Individual billable labor operations:

```typescript
{
  id: string
  code: string                  // Unique labor code
  name: string                  // Operation name (e.g., "Cooling System Pressure Test")
  description: string?
  estimatedHours: Decimal       // Estimated time (e.g., 0.7, 1.2 hours)
  hourlyRate: Decimal           // Standard hourly rate
  category: string?             // e.g., "Engine", "Brakes", "Electrical"
  isActive: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Appointment System

#### Appointment
```typescript
{
  id: string
  customerId: string            // Links to Customer
  vehicleId: string             // Links to Vehicle
  requestedAt: DateTime         // When appointment was requested
  startTime: DateTime?          // Scheduled start time
  endTime: DateTime?            // Scheduled end time
  status: AppointmentStatus     // PENDING, CONFIRMED, IN_PROGRESS, etc.
  priority: AppointmentPriority // LOW, NORMAL, HIGH, URGENT
  notes: string?
  assignedToId: string?         // Links to ServiceAdvisor
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Key Relationships:**
- Many-to-many with CannedService (via AppointmentCannedService)
- One-to-one with WorkOrder (when appointment becomes a work order)

#### AppointmentCannedService (Junction Table)
```typescript
{
  id: string
  appointmentId: string         // Links to Appointment
  cannedServiceId: string       // Links to CannedService
  quantity: number              // How many of this service
  price: Decimal                // Price at time of booking
  notes: string?                // Additional notes
}
```

### Work Order System

#### WorkOrder
The central model that tracks a complete service job:

```typescript
{
  id: string
  workOrderNumber: string       // Unique work order number
  customerId: string            // Links to Customer
  vehicleId: string             // Links to Vehicle
  appointmentId: string?        // Links to Appointment (if appointment-based)
  advisorId: string?            // Links to ServiceAdvisor
  
  // Status & Type
  status: WorkOrderStatus       // PENDING, IN_PROGRESS, COMPLETED, etc.
  jobType: JobType              // REPAIR, MAINTENANCE, INSPECTION, etc.
  priority: JobPriority         // LOW, NORMAL, HIGH, URGENT
  source: JobSource             // WALK_IN, APPOINTMENT, PHONE, etc.
  
  // Customer Information
  complaint: string?            // Customer's description of the problem
  odometerReading: number?      // Vehicle mileage
  
  // Financial Information
  estimatedTotal: Decimal?      // Total estimate amount
  subtotalLabor: Decimal?       // Labor portion
  subtotalParts: Decimal?       // Parts portion
  discountAmount: Decimal?      // Any discounts applied
  taxAmount: Decimal?           // Tax amount
  totalAmount: Decimal?         // Final total
  paidAmount: Decimal?          // Amount paid so far
  
  // Timing
  openedAt: DateTime?           // When work began
  promisedAt: DateTime?         // Promise date to customer
  closedAt: DateTime?           // When work was completed
  
  // Workflow
  workflowStep: WorkflowStep    // RECEIVED, INSPECTION, ESTIMATE, etc.
  
  // Additional Fields
  internalNotes: string?        // Internal staff notes
  customerNotes: string?        // Notes visible to customer
  invoiceNumber: string?        // Invoice reference
  paymentStatus: PaymentStatus  // PENDING, PAID, etc.
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Key Relationships:**
- One-to-many with WorkOrderInspection
- One-to-many with WorkOrderEstimate
- One-to-many with WorkOrderService
- One-to-many with WorkOrderLabor
- One-to-many with WorkOrderPart
- One-to-many with Payment
- One-to-many with WorkOrderAttachment

### Inspection System

#### InspectionTemplate
Pre-defined inspection categories:

```typescript
{
  id: string
  name: string                  // e.g., "Engine (Mechanical Condition)"
  description: string?          // What this template covers
  category: string?             // e.g., "Mechanical", "Electrical", "Safety"
  isActive: boolean
  sortOrder: number?            // Display order in UI
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### InspectionTemplateItem
Individual inspection items within a template:

```typescript
{
  id: string
  templateId: string            // Links to InspectionTemplate
  name: string                  // e.g., "Oil in air cleaner"
  description: string?          // Detailed description
  category: string?             // Sub-category
  sortOrder: number?            // Order within template
  isRequired: boolean           // Must this be checked?
  allowsNotes: boolean          // Can technician add notes?
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### WorkOrderInspection
Actual inspection performed on a work order:

```typescript
{
  id: string
  workOrderId: string           // Links to WorkOrder
  inspectorId: string           // Links to Technician
  templateId: string?           // Links to InspectionTemplate used
  date: DateTime                // When inspection was performed
  notes: string?                // Overall inspection summary
  isCompleted: boolean          // Inspection completion status
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Estimate & Approval System

#### WorkOrderEstimate
```typescript
{
  id: string
  workOrderId: string           // Links to WorkOrder
  version: number               // Estimate version number
  description: string?          // What this estimate covers
  totalAmount: Decimal          // Total estimate amount
  laborAmount: Decimal?         // Labor portion
  partsAmount: Decimal?         // Parts portion
  taxAmount: Decimal?           // Tax amount
  discountAmount: Decimal?      // Discount amount
  notes: string?                // Additional notes
  createdById: string?          // Links to ServiceAdvisor
  approved: boolean             // Customer approval status
  approvedAt: DateTime?         // When approved
  approvedById: string?         // Who approved it
  createdAt: DateTime
}
```

**Key Relationships:**
- One-to-many with EstimateLabor
- One-to-many with EstimatePart
- One-to-many with WorkOrderApproval

### Labor & Parts Tracking

#### WorkOrderLabor
Actual labor performed on a work order:

```typescript
{
  id: string
  workOrderId: string           // Links to WorkOrder
  laborCatalogId: string?       // Links to LaborCatalog (if catalog-based)
  description: string            // Description of work performed
  hours: Decimal                 // Hours worked
  rate: Decimal                  // Hourly rate
  technicianId: string?         // Links to Technician
  subtotal: Decimal             // hours * rate
  startTime: DateTime?           // When work started
  endTime: DateTime?             // When work ended
  notes: string?                 // Additional notes
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### WorkOrderPart
Parts used on a work order:

```typescript
{
  id: string
  workOrderId: string           // Links to WorkOrder
  inventoryItemId: string       // Links to InventoryItem
  quantity: number               // How many parts used
  unitPrice: Decimal            // Price at time of use
  subtotal: Decimal             // quantity * unitPrice
  source: PartSource            // INVENTORY, SUPPLIER, etc.
  supplierName: string?         // Supplier if not from inventory
  installedAt: DateTime?        // When part was installed
  installedById: string?        // Who installed it
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Payment System

#### Payment
```typescript
{
  id: string
  workOrderId: string           // Links to WorkOrder
  method: PaymentMethod         // CASH, CREDIT_CARD, etc.
  amount: Decimal                // Payment amount
  reference: string?             // Payment reference number
  status: PaymentStatus          // PENDING, PAID, etc.
  paidAt: DateTime               // When payment was received
  processedById: string?         // Links to ServiceAdvisor
  notes: string?                 // Payment notes
  refundAmount: Decimal?         // For partial refunds
  refundReason: string?          // Reason for refund
  createdAt: DateTime
  updatedAt: DateTime
}
```

## Key Enums

### UserRole
- `CUSTOMER` - Regular customer
- `SERVICE_ADVISOR` - Service advisor/consultant
- `TECHNICIAN` - Service technician
- `INVENTORY_MANAGER` - Parts/inventory manager
- `MANAGER` - Shop manager
- `ADMIN` - System administrator

### WorkOrderStatus
- `PENDING` - Work order created, waiting to start
- `IN_PROGRESS` - Work is actively being performed
- `WAITING_FOR_PARTS` - Waiting for parts to arrive
- `QC_PENDING` - Quality control inspection needed
- `COMPLETED` - Work order finished
- `CANCELLED` - Work order cancelled

### WorkflowStep
- `RECEIVED` - Vehicle received
- `INSPECTION` - Initial inspection phase
- `ESTIMATE` - Creating/approving estimate
- `APPROVAL` - Customer approval phase
- `REPAIR` - Active repair work
- `QC` - Quality control
- `READY` - Ready for customer pickup
- `CLOSED` - Work order closed

### AppointmentStatus
- `PENDING` - Appointment requested
- `CONFIRMED` - Appointment confirmed
- `IN_PROGRESS` - Appointment in progress
- `COMPLETED` - Appointment completed
- `CANCELLED` - Appointment cancelled
- `NO_SHOW` - Customer didn't show up

### PaymentStatus
- `PENDING` - Payment pending
- `PARTIALLY_PAID` - Partial payment received
- `PAID` - Full payment received
- `OVERDUE` - Payment overdue
- `COMPLETED` - Payment completed
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded
- `PARTIAL_REFUND` - Partial refund given

## API Endpoints Structure

### Authentication & Users
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### Customers & Vehicles
- `GET /customers` - List customers
- `POST /customers` - Create customer
- `GET /customers/:id` - Get customer details
- `PUT /customers/:id` - Update customer
- `GET /customers/:id/vehicles` - Get customer vehicles
- `POST /customers/:id/vehicles` - Add vehicle to customer

### Appointments
- `GET /appointments` - List appointments
- `POST /appointments` - Create appointment
- `GET /appointments/:id` - Get appointment details
- `PUT /appointments/:id` - Update appointment
- `DELETE /appointments/:id` - Cancel appointment
- `GET /appointments/available-slots` - Get available time slots

### Work Orders
- `GET /work-orders` - List work orders
- `POST /work-orders` - Create work order
- `GET /work-orders/:id` - Get work order details
- `PUT /work-orders/:id` - Update work order
- `GET /work-orders/:id/inspections` - Get work order inspections
- `POST /work-orders/:id/inspections` - Add inspection to work order

### Estimates
- `GET /work-orders/:id/estimates` - Get work order estimates
- `POST /work-orders/:id/estimates` - Create estimate
- `PUT /estimates/:id/approve` - Approve estimate
- `GET /estimates/:id` - Get estimate details

### Services & Labor
- `GET /canned-services` - List available services
- `GET /labor-catalog` - List labor operations
- `POST /work-orders/:id/labor` - Add labor to work order
- `POST /work-orders/:id/parts` - Add parts to work order

### Inspections
- `GET /inspection-templates` - List inspection templates
- `GET /inspection-templates/:id` - Get template details
- `POST /work-orders/:id/inspections` - Create inspection
- `PUT /inspections/:id/complete` - Mark inspection complete

### Payments
- `GET /work-orders/:id/payments` - Get work order payments
- `POST /payments` - Process payment
- `PUT /payments/:id/refund` - Process refund

## Frontend Implementation Tips

### 1. State Management
- Use separate stores for different domains (appointments, work orders, customers)
- Implement optimistic updates for better UX
- Cache frequently accessed data (customer info, vehicle details)

### 2. Real-time Updates
- Implement WebSocket connections for live updates
- Show real-time status changes for work orders
- Update appointment status in real-time

### 3. Form Handling
- Use multi-step forms for complex operations (work order creation)
- Implement validation based on the schema requirements
- Handle file uploads for attachments and images

### 4. UI Components
- Create reusable components for common patterns
- Implement role-based UI rendering
- Use consistent status indicators and badges

### 5. Error Handling
- Implement proper error boundaries
- Show user-friendly error messages
- Handle network failures gracefully

### 6. Performance
- Implement pagination for large lists
- Use virtual scrolling for long tables
- Implement search and filtering on the frontend

## Common Workflows

### 1. Customer Appointment Booking
1. Customer selects services (CannedService)
2. Choose available time slot
3. Create Appointment with AppointmentCannedService links
4. Send confirmation

### 2. Work Order Creation
1. Create WorkOrder from Appointment or walk-in
2. Perform initial inspection (WorkOrderInspection)
3. Create estimate (WorkOrderEstimate)
4. Get customer approval (WorkOrderApproval)
5. Begin work (update status to IN_PROGRESS)

### 3. Service Completion
1. Record labor performed (WorkOrderLabor)
2. Record parts used (WorkOrderPart)
3. Perform QC inspection (WorkOrderQC)
4. Process payment (Payment)
5. Close work order (update status to COMPLETED)

This documentation should give your frontend developers a solid understanding of the system architecture and how to implement the various features. Let me know if you need any clarification or additional details!
