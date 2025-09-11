# Technicians Module

This module manages technicians in the vehicle service management system. Technicians are employees who perform inspections, labor work, quality control checks, and part installations.

## Overview

- **Purpose**: Manage technician profiles, specializations, certifications, and work assignments
- **Database**: Uses Prisma with PostgreSQL
- **Authentication**: No authentication required (internal management)
- **Validation**: Zod schema validation for all inputs

## API Endpoints

### Technician Management

#### GET `/technicians`
Get all technicians with optional filtering.

**Query Parameters:**
- `search` (string, optional): Search by name, employee ID, or specialization
- `employeeId` (string, optional): Filter by employee ID
- `specialization` (string, optional): Filter by specialization
- `hasInspections` (boolean, optional): Filter by inspection assignments
- `hasLaborItems` (boolean, optional): Filter by labor work assignments
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
      "employeeId": "TECH001",
      "specialization": "Engine Specialist",
      "certifications": ["ASE A1", "ASE A8"],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "userProfile": {
        "id": "user_profile_id",
        "name": "Mike Johnson",
        "phone": "+1234567890",
        "profileImage": "https://example.com/image.jpg",
        "role": "TECHNICIAN"
      },
      "inspectionsCount": 25,
      "qcChecksCount": 15,
      "laborItemsCount": 45,
      "partInstallationsCount": 30
    }
  ],
  "message": "Technicians retrieved successfully",
  "pagination": {
    "limit": 20,
    "offset": 0,
    "count": 1
  }
}
```

#### GET `/technicians/:id`
Get a specific technician by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid_generated_id",
    "userProfileId": "user_profile_id",
    "employeeId": "TECH001",
    "specialization": "Engine Specialist",
    "certifications": ["ASE A1", "ASE A8"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "userProfile": {
      "id": "user_profile_id",
      "name": "Mike Johnson",
      "phone": "+1234567890",
      "profileImage": "https://example.com/image.jpg",
      "role": "TECHNICIAN"
    },
    "inspectionsCount": 25,
    "qcChecksCount": 15,
    "laborItemsCount": 45,
    "partInstallationsCount": 30
  },
  "message": "Technician retrieved successfully"
}
```

#### GET `/technicians/employee/:employeeId`
Get a technician by employee ID.

**Response:** Same as above.

#### POST `/technicians`
Create a new technician.

**Request Body:**
```json
{
  "userProfileId": "user_profile_id",
  "employeeId": "TECH001",
  "specialization": "Engine Specialist",
  "certifications": ["ASE A1", "ASE A8"]
}
```

**Validation Rules:**
- `userProfileId`: Required, must be a valid CUID
- `employeeId`: Optional, max 50 characters, must be unique
- `specialization`: Optional, max 100 characters
- `certifications`: Optional array of strings

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid_generated_id",
    "userProfileId": "user_profile_id",
    "employeeId": "TECH001",
    "specialization": "Engine Specialist",
    "certifications": ["ASE A1", "ASE A8"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "userProfile": {
      "id": "user_profile_id",
      "name": "Mike Johnson",
      "phone": "+1234567890",
      "profileImage": "https://example.com/image.jpg",
      "role": "TECHNICIAN"
    },
    "inspectionsCount": 0,
    "qcChecksCount": 0,
    "laborItemsCount": 0,
    "partInstallationsCount": 0
  },
  "message": "Technician created successfully"
}
```

#### PUT `/technicians/:id`
Update a technician.

**Request Body:**
```json
{
  "employeeId": "TECH002",
  "specialization": "Transmission Specialist",
  "certifications": ["ASE A2", "ASE A3"]
}
```

**Response:** Same as GET by ID.

#### DELETE `/technicians/:id`
Delete a technician.

**Response:**
```json
{
  "success": true,
  "message": "Technician deleted successfully"
}
```

**Note:** Cannot delete technicians with existing inspections, labor items, QC checks, or part installations.

### Statistics and Search

#### GET `/technicians/statistics`
Get technician statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTechnicians": 15,
    "techniciansBySpecialization": [
      {
        "specialization": "Engine Specialist",
        "count": 5
      },
      {
        "specialization": "Transmission Specialist",
        "count": 3
      },
      {
        "specialization": "Electrical Specialist",
        "count": 4
      },
      {
        "specialization": "Unassigned",
        "count": 3
      }
    ],
    "activeTechnicians": 12,
    "recentHires": [
      {
        "id": "cuid_generated_id",
        "userProfileId": "user_profile_id",
        "employeeId": "TECH015",
        "specialization": "Brake Specialist",
        "certifications": ["ASE A5"],
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "userProfile": {
          "id": "user_profile_id",
          "name": "Sarah Wilson",
          "phone": "+1234567890",
          "profileImage": "https://example.com/image.jpg",
          "role": "TECHNICIAN"
        },
        "inspectionsCount": 0,
        "qcChecksCount": 0,
        "laborItemsCount": 0,
        "partInstallationsCount": 0
      }
    ]
  },
  "message": "Technician statistics retrieved successfully"
}
```

#### GET `/technicians/search?q=query`
Search technicians by name, employee ID, specialization, or phone.

**Response:** Same as GET all technicians.

### Work Orders

#### GET `/technicians/:id/work-orders`
Get work orders for a specific technician (through labor items).

**Query Parameters:**
- `status` (string, optional): Filter by work order status
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "work_order_id",
      "workOrderNumber": "WO-2024-001",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "customerId": "customer_id",
      "vehicleId": "vehicle_id",
      "appointmentId": "appointment_id",
      "advisorId": "advisor_id",
      "status": "IN_PROGRESS",
      "jobType": "REPAIR",
      "priority": "NORMAL",
      "source": "APPOINTMENT",
      "complaint": "Engine making strange noise",
      "odometerReading": 50000,
      "warrantyStatus": "NONE",
      "estimatedTotal": 500.00,
      "estimateNotes": "Engine diagnostic required",
      "estimateApproved": true,
      "subtotalLabor": 300.00,
      "subtotalParts": 200.00,
      "discountAmount": 0.00,
      "taxAmount": 50.00,
      "totalAmount": 550.00,
      "paidAmount": 0.00,
      "openedAt": "2024-01-15T11:00:00.000Z",
      "promisedAt": "2024-01-16T17:00:00.000Z",
      "closedAt": null,
      "workflowStep": "REPAIR",
      "internalNotes": "Customer reported noise during acceleration",
      "customerNotes": "Please call before starting work",
      "invoiceNumber": null,
      "finalizedAt": null,
      "paymentStatus": "PENDING",
      "warrantyClaimNumber": null,
      "thirdPartyApprovalCode": null,
      "campaignId": null,
      "servicePackageId": null,
      "customerSignature": null,
      "customerFeedback": null,
      "customer": {
        "id": "customer_id",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890"
      },
      "vehicle": {
        "id": "vehicle_id",
        "make": "Toyota",
        "model": "Camry",
        "year": 2020,
        "vin": "1HGBH41JXMN109186",
        "licensePlate": "ABC123"
      },
      "appointment": {
        "id": "appointment_id",
        "requestedAt": "2024-01-15T09:00:00.000Z",
        "startTime": "2024-01-15T10:00:00.000Z",
        "endTime": "2024-01-15T12:00:00.000Z",
        "status": "CONFIRMED",
        "priority": "NORMAL",
        "notes": "Customer requested morning appointment"
      }
    }
  ],
  "message": "Technician work orders retrieved successfully",
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 1
  }
}
```

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

### Technician Not Found
```json
{
  "success": false,
  "error": "Technician not found"
}
```

### Employee ID Already Exists
```json
{
  "success": false,
  "error": "Failed to create technician",
  "message": "Employee ID already exists"
}
```

### Cannot Delete Technician
```json
{
  "success": false,
  "error": "Cannot delete technician",
  "message": "Cannot delete technician with existing inspections"
}
```

## Business Rules

1. **User Profile Requirement**: Technicians must be linked to a UserProfile with TECHNICIAN role
2. **Unique Employee ID**: Employee IDs must be unique across all technicians
3. **Deletion Restrictions**: Cannot delete technicians with:
   - Existing inspections
   - Labor items
   - QC checks
   - Part installations
4. **Specialization Assignment**: Technicians can be assigned specializations for skill tracking
5. **Certifications Tracking**: System tracks technician certifications and qualifications
6. **Work Assignment Tracking**: System tracks inspections, labor work, QC checks, and part installations per technician

## Database Schema

The module uses the following Prisma models:

```prisma
model Technician {
  id             String        @id @default(cuid())
  userProfile    UserProfile   @relation(fields: [userProfileId], references: [id])
  userProfileId  String        @unique
  employeeId     String?       @unique
  specialization String?
  certifications String[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  // Relations
  inspections    WorkOrderInspection[] @relation("Inspections")
  qcChecks       WorkOrderQC[] @relation("QCInspections")
  laborItems     WorkOrderLabor[] @relation("LaborWork")
  partInstallations WorkOrderPart[] @relation("PartInstallations")
}
```

## Usage Examples

### Creating a Technician
```bash
curl -X POST http://localhost:3000/technicians \
  -H "Content-Type: application/json" \
  -d '{
    "userProfileId": "user_profile_id",
    "employeeId": "TECH001",
    "specialization": "Engine Specialist",
    "certifications": ["ASE A1", "ASE A8"]
  }'
```

### Getting Technicians by Specialization
```bash
curl -X GET "http://localhost:3000/technicians?specialization=Engine"
```

### Searching Technicians
```bash
curl -X GET "http://localhost:3000/technicians/search?q=Mike"
```

### Getting Technician Work Orders
```bash
curl -X GET "http://localhost:3000/technicians/technician_id/work-orders"
```

### Getting Statistics
```bash
curl -X GET "http://localhost:3000/technicians/statistics"
```

## Notes

- All timestamps are in ISO 8601 format
- Employee IDs are optional but recommended for tracking
- Specialization assignments help organize technicians by skill
- Certifications array tracks all technician qualifications
- The module integrates with the UserProfile system for authentication and profile management
- Technicians can be assigned to inspections, labor work, QC checks, and part installations
- Statistics provide insights into technician performance and workload
- Work orders are retrieved through labor items (technicians work on specific labor tasks within work orders)
