# Service Advisors Module

This module manages service advisors in the vehicle service management system. Service advisors are employees who handle customer interactions, work order management, and appointment scheduling.

## Overview

- **Purpose**: Manage service advisor profiles, assignments, and statistics
- **Database**: Uses Prisma with PostgreSQL
- **Authentication**: No authentication required (internal management)
- **Validation**: Zod schema validation for all inputs

## API Endpoints

### Service Advisor Management

#### GET `/service-advisors`
Get all service advisors with optional filtering.

**Query Parameters:**
- `search` (string, optional): Search by name, employee ID, or department
- `employeeId` (string, optional): Filter by employee ID
- `department` (string, optional): Filter by department
- `hasWorkOrders` (boolean, optional): Filter by work order assignment
- `hasAppointments` (boolean, optional): Filter by appointment assignment
- `limit` (number, optional): Number of results (default: 20, max: 100)
- `offset` (number, optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid_generated_id",
      "userProfileId": "user_profile_id",
      "employeeId": "EMP001",
      "department": "Service",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "userProfile": {
        "id": "user_profile_id",
        "name": "John Smith",
        "phone": "+1234567890",
        "profileImage": "https://example.com/image.jpg",
        "role": "SERVICE_ADVISOR"
      },
      "workOrdersCount": 15,
      "appointmentsCount": 8,
      "estimatesCount": 12
    }
  ],
  "message": "Service advisors retrieved successfully",
  "pagination": {
    "limit": 20,
    "offset": 0,
    "count": 1
  }
}
```

#### GET `/service-advisors/:id`
Get a specific service advisor by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid_generated_id",
    "userProfileId": "user_profile_id",
    "employeeId": "EMP001",
    "department": "Service",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "userProfile": {
      "id": "user_profile_id",
      "name": "John Smith",
      "phone": "+1234567890",
      "profileImage": "https://example.com/image.jpg",
      "role": "SERVICE_ADVISOR"
    },
    "workOrdersCount": 15,
    "appointmentsCount": 8,
    "estimatesCount": 12
  },
  "message": "Service advisor retrieved successfully"
}
```

#### GET `/service-advisors/employee/:employeeId`
Get a service advisor by employee ID.

**Response:** Same as above.

#### POST `/service-advisors`
Create a new service advisor.

**Request Body:**
```json
{
  "userProfileId": "user_profile_id",
  "employeeId": "EMP001",
  "department": "Service"
}
```

**Validation Rules:**
- `userProfileId`: Required, must be a valid CUID
- `employeeId`: Optional, max 50 characters, must be unique
- `department`: Optional, max 100 characters

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid_generated_id",
    "userProfileId": "user_profile_id",
    "employeeId": "EMP001",
    "department": "Service",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "userProfile": {
      "id": "user_profile_id",
      "name": "John Smith",
      "phone": "+1234567890",
      "profileImage": "https://example.com/image.jpg",
      "role": "SERVICE_ADVISOR"
    },
    "workOrdersCount": 0,
    "appointmentsCount": 0,
    "estimatesCount": 0
  },
  "message": "Service advisor created successfully"
}
```

#### PUT `/service-advisors/:id`
Update a service advisor.

**Request Body:**
```json
{
  "employeeId": "EMP002",
  "department": "Sales"
}
```

**Response:** Same as GET by ID.

#### DELETE `/service-advisors/:id`
Delete a service advisor.

**Response:**
```json
{
  "success": true,
  "message": "Service advisor deleted successfully"
}
```

**Note:** Cannot delete service advisors with existing work orders or appointments.

### Statistics and Search

#### GET `/service-advisors/statistics`
Get service advisor statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalServiceAdvisors": 25,
    "serviceAdvisorsByDepartment": [
      {
        "department": "Service",
        "count": 15
      },
      {
        "department": "Sales",
        "count": 8
      },
      {
        "department": "Unassigned",
        "count": 2
      }
    ],
    "activeServiceAdvisors": 20,
    "recentHires": [
      {
        "id": "cuid_generated_id",
        "userProfileId": "user_profile_id",
        "employeeId": "EMP025",
        "department": "Service",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "userProfile": {
          "id": "user_profile_id",
          "name": "Jane Doe",
          "phone": "+1234567890",
          "profileImage": "https://example.com/image.jpg",
          "role": "SERVICE_ADVISOR"
        },
        "workOrdersCount": 0,
        "appointmentsCount": 0,
        "estimatesCount": 0
      }
    ]
  },
  "message": "Service advisor statistics retrieved successfully"
}
```

#### GET `/service-advisors/search?q=query`
Search service advisors by name, employee ID, department, or phone.

**Response:** Same as GET all service advisors.

## Error Responses

### Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "userProfileId",
      "message": "Invalid user profile ID"
    }
  ]
}
```

### Service Advisor Not Found
```json
{
  "success": false,
  "error": "Service advisor not found"
}
```

### Employee ID Already Exists
```json
{
  "success": false,
  "error": "Failed to create service advisor",
  "message": "Employee ID already exists"
}
```

### Cannot Delete Service Advisor
```json
{
  "success": false,
  "error": "Cannot delete service advisor",
  "message": "Cannot delete service advisor with existing work orders"
}
```

## Business Rules

1. **User Profile Requirement**: Service advisors must be linked to a UserProfile with SERVICE_ADVISOR role
2. **Unique Employee ID**: Employee IDs must be unique across all service advisors
3. **Deletion Restrictions**: Cannot delete service advisors with:
   - Existing work orders
   - Assigned appointments
4. **Department Assignment**: Service advisors can be assigned to departments for organization
5. **Statistics Tracking**: System tracks work orders, appointments, and estimates per advisor

## Database Schema

The module uses the following Prisma models:

```prisma
model ServiceAdvisor {
  id             String        @id @default(cuid())
  userProfile    UserProfile   @relation(fields: [userProfileId], references: [id])
  userProfileId  String        @unique
  employeeId     String?       @unique
  department     String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  // Relations
  advisorWorkOrders WorkOrder[] @relation("AdvisorWorkOrders")
  assignedAppointments Appointment[] @relation("AssignedAppointments")
  createdEstimates WorkOrderEstimate[] @relation("CreatedEstimates")
  approvedEstimates WorkOrderEstimate[] @relation("ApprovedEstimates")
  approvals      WorkOrderApproval[] @relation("Approvals")
  processedPayments Payment[] @relation("ProcessedPayments")
}
```

## Usage Examples

### Creating a Service Advisor
```bash
curl -X POST http://localhost:3000/service-advisors \
  -H "Content-Type: application/json" \
  -d '{
    "userProfileId": "user_profile_id",
    "employeeId": "EMP001",
    "department": "Service"
  }'
```

### Getting Service Advisors by Department
```bash
curl -X GET "http://localhost:3000/service-advisors?department=Service"
```

### Searching Service Advisors
```bash
curl -X GET "http://localhost:3000/service-advisors/search?q=John"
```

### Getting Statistics
```bash
curl -X GET "http://localhost:3000/service-advisors/statistics"
```

## Notes

- All timestamps are in ISO 8601 format
- Employee IDs are optional but recommended for tracking
- Department assignments help organize service advisors
- The module integrates with the UserProfile system for authentication and profile management
- Service advisors can be assigned to work orders, appointments, and estimates
- Statistics provide insights into service advisor performance and workload
