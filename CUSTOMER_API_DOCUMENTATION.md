# Customer API Documentation

## Overview

The Customer API provides comprehensive customer management functionality for the vehicle service management system. It supports both app users and walk-in customers with full CRUD operations and advanced filtering capabilities.

## Base URL

```
http://localhost:3000/customers
```

## Authentication

All endpoints require authentication via Supabase JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Get All Customers

**GET** `/customers`

Retrieve all customers with optional filtering and pagination.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search by name, email, or phone |
| `email` | string | No | Filter by email address |
| `phone` | string | No | Filter by phone number |
| `hasVehicles` | boolean | No | Filter customers with/without vehicles |
| `hasWorkOrders` | boolean | No | Filter customers with/without work orders |
| `limit` | number | No | Number of results (default: 20, max: 100) |
| `offset` | number | No | Pagination offset (default: 0) |

#### Example Request

```bash
curl -X GET "http://localhost:3000/customers?search=john&limit=10&offset=0" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json"
```

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890abcdef",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "userProfile": {
        "id": "clx0987654321fedcba",
        "name": "John Doe",
        "phone": "+1234567890",
        "profileImage": null,
        "role": "customer",
        "isRegistrationComplete": true
      },
      "vehicles": [
        {
          "id": "clx1111111111111111",
          "make": "Toyota",
          "model": "Camry",
          "year": 2020,
          "vin": "1HGBH41JXMN109186",
          "licensePlate": "ABC123",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "workOrders": [],
      "appointments": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Customers retrieved successfully",
  "pagination": {
    "limit": 10,
    "offset": 0,
    "count": 1
  }
}
```

### 2. Get Customer by ID

**GET** `/customers/:id`

Retrieve a specific customer by their ID.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Customer ID |

#### Example Request

```bash
curl -X GET "http://localhost:3000/customers/clx1234567890abcdef" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json"
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": "clx1234567890abcdef",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "userProfile": {
      "id": "clx0987654321fedcba",
      "name": "John Doe",
      "phone": "+1234567890",
      "profileImage": null,
      "role": "customer",
      "isRegistrationComplete": true
    },
    "vehicles": [...],
    "workOrders": [...],
    "appointments": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Customer retrieved successfully"
}
```

### 3. Get Customer by User Profile ID

**GET** `/customers/profile/:userProfileId`

Retrieve a customer by their user profile ID. This is particularly useful for mobile app users.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userProfileId` | string | Yes | User Profile ID |

#### Example Request

```bash
curl -X GET "http://localhost:3000/customers/profile/clx0987654321fedcba" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json"
```

### 4. Create Customer

**POST** `/customers`

Create a new customer record.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userProfileId` | string | No | User Profile ID (for app users) |
| `name` | string | Yes | Customer name (max 255 characters) |
| `email` | string | No | Email address (must be valid format) |
| `phone` | string | No | Phone number (international format) |

#### Example Request

```bash
curl -X POST "http://localhost:3000/customers" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890"
  }'
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": "clx2222222222222222",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "userProfile": null,
    "vehicles": [],
    "workOrders": [],
    "appointments": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Customer created successfully"
}
```

### 5. Update Customer

**PUT** `/customers/:id`

Update an existing customer's information.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Customer ID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Customer name (max 255 characters) |
| `email` | string | No | Email address (must be valid format) |
| `phone` | string | No | Phone number (international format) |

#### Example Request

```bash
curl -X PUT "http://localhost:3000/customers/clx2222222222222222" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith-Jones",
    "phone": "+1987654321"
  }'
```

### 6. Delete Customer

**DELETE** `/customers/:id`

Delete a customer record. **Requires manager role.**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Customer ID |

#### Example Request

```bash
curl -X DELETE "http://localhost:3000/customers/clx2222222222222222" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json"
```

#### Example Response

```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

### 7. Get Customer Vehicles

**GET** `/customers/:customerId/vehicles`

Retrieve all vehicles for a specific customer.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customerId` | string | Yes | Customer ID |

#### Example Request

```bash
curl -X GET "http://localhost:3000/customers/clx1234567890abcdef/vehicles" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json"
```

### 8. Get Customer Work Orders

**GET** `/customers/:customerId/work-orders`

Retrieve all work orders for a specific customer.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customerId` | string | Yes | Customer ID |

#### Example Request

```bash
curl -X GET "http://localhost:3000/customers/clx1234567890abcdef/work-orders" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json"
```

### 9. Get Customer Appointments

**GET** `/customers/:customerId/appointments`

Retrieve all appointments for a specific customer.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customerId` | string | Yes | Customer ID |

#### Example Request

```bash
curl -X GET "http://localhost:3000/customers/clx1234567890abcdef/appointments" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json"
```

## Error Responses

### Validation Error (400)

```json
{
  "success": false,
  "error": "Validation error",
  "message": "\"email\" must be a valid email"
}
```

### Authentication Error (401)

```json
{
  "success": false,
  "error": "Missing Authorization header",
  "message": "Please provide a valid Bearer token"
}
```

### Authorization Error (403)

```json
{
  "success": false,
  "error": "Access denied",
  "message": "Manager role required"
}
```

### Not Found Error (404)

```json
{
  "success": false,
  "error": "Customer not found",
  "message": "No customer found with the provided ID"
}
```

### Server Error (500)

```json
{
  "success": false,
  "error": "Failed to get customers",
  "message": "Database connection failed"
}
```

## Data Models

### Customer Object

```typescript
interface Customer {
  id: string;
  userProfileId?: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  userProfile?: UserProfile;
  vehicles?: Vehicle[];
  workOrders?: WorkOrder[];
  appointments?: Appointment[];
}
```

### UserProfile Object

```typescript
interface UserProfile {
  id: string;
  name?: string;
  phone?: string;
  profileImage?: string;
  role: string;
  isRegistrationComplete: boolean;
}
```

### Vehicle Object

```typescript
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year?: number;
  vin?: string;
  licensePlate?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Usage Examples

### Frontend Integration

```typescript
// Get current customer (for mobile app)
const getCurrentCustomer = async (userProfileId: string) => {
  const response = await fetch(`/customers/profile/${userProfileId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Search customers
const searchCustomers = async (searchTerm: string) => {
  const response = await fetch(`/customers?search=${searchTerm}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Create new customer
const createCustomer = async (customerData: any) => {
  const response = await fetch('/customers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(customerData)
  });
  return response.json();
};
```

### Mobile App Integration

```typescript
// Get customer profile after login
const getCustomerProfile = async () => {
  const userProfileId = await getCurrentUserProfileId();
  const response = await fetch(`/customers/profile/${userProfileId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.data;
  }
  
  throw new Error('Failed to get customer profile');
};

// Update customer information
const updateCustomerProfile = async (updates: any) => {
  const customerId = await getCurrentCustomerId();
  const response = await fetch(`/customers/${customerId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  return response.json();
};
```

## Testing

Use the provided test script to verify all endpoints:

```bash
node scripts/test-customer-endpoints.js
```

**Note:** Update the `TEST_TOKEN` variable in the script with a valid JWT token before running.

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## Security Considerations

1. **Authentication Required**: All endpoints require valid JWT tokens
2. **Role-Based Access**: Delete operations require manager role
3. **Input Validation**: All input is validated using Joi schemas
4. **SQL Injection Protection**: Uses Prisma ORM for safe database queries
5. **Data Privacy**: Customer data is only accessible to authenticated users
