# Appointment Scheduling System

A comprehensive appointment scheduling system inspired by ShopMonkey's approach, designed for automotive service centers. This system supports predefined "Canned Services", shop operating hours, capacity planning, and appointment management workflows.

## Features

### 🚗 Canned Services (Service Catalog)
- Predefined services with labor hour estimates
- Pricing and availability controls
- Service codes for easy identification
- Duration tracking in minutes

### 📅 Shop Operating Hours & Capacity Planning
- Configurable operating hours per day of the week
- Appointment capacity settings:
  - Appointments per day
  - Appointments per time block
  - Time block intervals (e.g., 30 minutes)
  - Minimum notice periods
  - Future scheduling cutoff dates

### 🎯 Appointment Booking Workflow
- Customer selects from available Canned Services
- Real-time availability checking
- Automatic slot calculation based on service duration
- Appointment creation with PENDING status
- Unassigned appointments appear in admin calendar

### 👥 Service Advisor Assignment
- Admin assigns service advisors to unassigned appointments
- Appointment status tracking (pending, confirmed, in-progress, completed, etc.)
- Priority levels (low, normal, high, urgent)

### 🔄 Work Order Integration
- Seamless transition from appointment to work order
- Support for walk-ins outside booked appointments
- Complete workflow from booking to payment

## Database Schema

### Key Models

#### CannedService
```typescript
{
  id: string
  code: string          // Unique service code
  name: string          // Service name
  description?: string  // Service description
  duration: number      // Labor time in minutes
  price: Decimal        // Service price
  isAvailable: boolean  // Available for booking
}
```

#### Appointment
```typescript
{
  id: string
  customerId: string
  vehicleId: string
  requestedAt: DateTime
  startTime?: DateTime  // Assigned by admin/system
  endTime?: DateTime    // Calculated based on services
  status: AppointmentStatus
  priority: AppointmentPriority
  assignedToId?: string // Service advisor
  cannedServices: AppointmentCannedService[]
}
```

#### ShopOperatingHours
```typescript
{
  dayOfWeek: DayOfWeek
  isOpen: boolean
  openTime?: string     // Format: "08:00"
  closeTime?: string    // Format: "17:00"
}
```

#### ShopCapacitySettings
```typescript
{
  appointmentsPerDay: number
  appointmentsPerTimeBlock: number
  timeBlockIntervalMinutes: number
  minimumNoticeHours: number
  futureSchedulingCutoffYears: number
}
```

## API Endpoints

### Appointment Management

#### Create Appointment
```http
POST /api/appointments
Content-Type: application/json

{
  "customerId": "string",
  "vehicleId": "string",
  "requestedAt": "2024-01-15T10:00:00Z",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T12:00:00Z",
  "notes": "Customer prefers morning appointment",
  "cannedServiceIds": ["service1", "service2"],
  "serviceNotes": ["Front brake pads", "Oil change with synthetic"]
}
```

#### Get Available Slots
```http
GET /api/appointments/slots/available?date=2024-01-15&serviceIds=service1,service2
```

#### Get Unassigned Appointments
```http
GET /api/appointments/unassigned
```

#### Get Confirmed Appointments Without Active Work Orders
```http
GET /api/appointments/confirmed-without-work-orders
```

**Description:** Retrieves appointments that are confirmed but don't have any active work orders (work orders that are not cancelled).

**Authentication:** Requires Supabase token + Service Advisor role

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "appointment_id",
      "customerId": "customer_id",
      "vehicleId": "vehicle_id",
      "requestedAt": "2024-01-15T10:00:00.000Z",
      "startTime": "2024-01-15T10:00:00.000Z",
      "endTime": "2024-01-15T12:00:00.000Z",
      "status": "CONFIRMED",
      "priority": "NORMAL",
      "notes": "Customer confirmed appointment",
      "createdAt": "2024-01-15T09:30:00.000Z",
      "updatedAt": "2024-01-15T10:15:00.000Z",
      "assignedToId": "service_advisor_id",
      "cannedServices": [
        {
          "id": "service_id",
          "code": "OIL001",
          "name": "Oil Change",
          "duration": 30,
          "price": 45.00,
          "quantity": 1,
          "notes": "Synthetic oil"
        }
      ],
      "customer": {
        "id": "customer_id",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "profileImage": "https://example.com/profile-image.jpg"
      },
      "vehicle": {
        "id": "vehicle_id",
        "make": "Toyota",
        "model": "Camry",
        "year": 2020,
        "licensePlate": "ABC123"
      },
      "assignedTo": {
        "id": "service_advisor_id",
        "supabaseUserId": "supabase_user_id",
        "profileImage": "https://example.com/advisor-image.jpg"
      }
    }
  ],
  "message": "Confirmed appointments without active work orders retrieved successfully"
}
```

#### Assign Appointment to Service Advisor
```http
POST /api/appointments/{id}/assign
Content-Type: application/json

{
  "assignedToId": "advisor_id"
}
```

### Canned Service Management

#### Create Canned Service
```http
POST /api/canned-services
Content-Type: application/json

{
  "code": "DYN001",
  "name": "Dyno Tuning - 3 Pulls",
  "description": "Dyno tuning with 3 pulls for performance optimization",
  "duration": 120,
  "price": 250.00,
  "isAvailable": true
}
```

#### Get Available Services
```http
GET /api/canned-services/available
```

### Shop Settings Management

#### Update Operating Hours
```http
PUT /api/shop/operating-hours
Content-Type: application/json

{
  "dayOfWeek": "MONDAY",
  "isOpen": true,
  "openTime": "08:00",
  "closeTime": "17:00"
}
```

#### Update Capacity Settings
```http
PUT /api/shop/capacity-settings
Content-Type: application/json

{
  "appointmentsPerDay": 6,
  "appointmentsPerTimeBlock": 2,
  "timeBlockIntervalMinutes": 30,
  "minimumNoticeHours": 48,
  "futureSchedulingCutoffYears": 3
}
```

## Usage Examples

### 1. Setting Up Shop Hours (ShopMonkey Style)
```typescript
// Monday-Friday: 8AM-5PM, Sunday/Saturday: Closed
const operatingHours = [
  { dayOfWeek: 'SUNDAY', isOpen: false },
  { dayOfWeek: 'MONDAY', isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { dayOfWeek: 'TUESDAY', isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { dayOfWeek: 'WEDNESDAY', isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { dayOfWeek: 'THURSDAY', isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { dayOfWeek: 'FRIDAY', isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { dayOfWeek: 'SATURDAY', isOpen: false },
];
```

### 2. Creating Canned Services
```typescript
const services = [
  {
    code: 'DYN001',
    name: 'Dyno Tuning - 3 Pulls',
    description: 'Dyno tuning with 3 pulls for performance optimization',
    duration: 120, // 2 hours
    price: 250.00,
    isAvailable: true,
  },
  {
    code: 'BRAKE001',
    name: 'Basic Brake Package',
    description: 'Complete brake inspection and basic brake service',
    duration: 60, // 1 hour
    price: 150.00,
    isAvailable: true,
  },
];
```

### 3. Booking Workflow
1. **Customer selects services**: Choose from available Canned Services
2. **Check availability**: System calculates available slots based on service duration
3. **Create appointment**: Appointment created with PENDING status, no assigned advisor
4. **Admin assignment**: Service advisor assigned to appointment
5. **Work order creation**: Appointment converts to work order when service starts

## Setup

### 1. Run Database Migration
```bash
npx prisma migrate dev --name add-appointment-scheduling
```

### 2. Initialize Shop Settings
```bash
npm run setup-appointment-system
```

### 3. Add Routes to Main App
```typescript
import appointmentRoutes from './modules/appointments/appointments.routes';

app.use('/api', appointmentRoutes);
```

## Status Tracking

Appointments follow this status flow:
- `PENDING` - Initial state when created
- `CONFIRMED` - Assigned to service advisor
- `IN_PROGRESS` - Service has started
- `COMPLETED` - Service finished
- `CANCELLED` - Appointment cancelled
- `NO_SHOW` - Customer didn't show up

## Priority Levels

- `LOW` - Non-urgent services
- `NORMAL` - Standard appointments
- `HIGH` - Urgent repairs
- `URGENT` - Emergency services

## Integration with Work Orders

When an appointment is ready to start service:
1. Update appointment status to `IN_PROGRESS`
2. Create work order linked to the appointment
3. Assign technicians to work order
4. Track labor and parts usage
5. Complete work order and payment

This system provides a complete ShopMonkey-inspired appointment scheduling solution with capacity planning, service catalog management, and seamless workflow integration. 