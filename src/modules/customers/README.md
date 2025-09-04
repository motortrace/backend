# Customer Module

This module handles all customer-related operations for the vehicle service management system.

## Overview

The Customer module provides comprehensive customer management functionality including:
- Customer CRUD operations
- Customer search and filtering
- Customer-specific data retrieval (vehicles, work orders, appointments)
- Support for both app users and walk-in customers

## API Endpoints

### Customer Management

#### GET `/customers`
Retrieve all customers with optional filtering.

**Query Parameters:**
- `search` - Search by name, email, or phone
- `email` - Filter by email
- `phone` - Filter by phone number
- `hasVehicles` - Filter customers with/without vehicles (true/false)
- `hasWorkOrders` - Filter customers with/without work orders (true/false)
- `limit` - Number of results (default: 20, max: 100)
- `offset` - Pagination offset (default: 0)

**cURL Example:**
```bash
# Get all customers
curl -X GET "http://localhost:3000/customers" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjU0MzIxL2F1dGgvdjEiLCJzdWIiOiIzODVhMTBmZS03YTcyLTQ0Y2YtYmEwMS03NDZjN2YwNWQ3YTEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU2OTc3MDU1LCJpYXQiOjE3NTY5NzM0NTUsImVtYWlsIjoiYWRtaW5AbW90b3J0cmFjZS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiU3lzdGVtIEFkbWluaXN0cmF0b3IiLCJwaG9uZSI6IisxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTY5NzM0NTV9XSwic2Vzc2lvbl9pZCI6IjIyNDc1OTgxLTFmMGQtNGQ2YS05YjliLTQ0YzQxY2RiNTZjYyIsImlzX2Fub255bW91cyI6ZmFsc2V9.rwxKzvsDcn89IHHQnc912oVJ5RvXsS1t-390QaU-Kcw"

# Search customers by name
curl -X GET "http://localhost:3000/customers?search=John" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjU0MzIxL2F1dGgvdjEiLCJzdWIiOiIzODVhMTBmZS03YTcyLTQ0Y2YtYmEwMS03NDZjN2YwNWQ3YTEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU2OTc3MDU1LCJpYXQiOjE3NTY5NzM0NTUsImVtYWlsIjoiYWRtaW5AbW90b3J0cmFjZS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiU3lzdGVtIEFkbWluaXN0cmF0b3IiLCJwaG9uZSI6IisxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTY5NzM0NTV9XSwic2Vzc2lvbl9pZCI6IjIyNDc1OTgxLTFmMGQtNGQ2YS05YjliLTQ0YzQxY2RiNTZjYyIsImlzX2Fub255bW91cyI6ZmFsc2V9.rwxKzvsDcn89IHHQnc912oVJ5RvXsS1t-390QaU-Kcw"

# Filter customers with vehicles
curl -X GET "http://localhost:3000/customers?hasVehicles=true&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjU0MzIxL2F1dGgvdjEiLCJzdWIiOiIzODVhMTBmZS03YTcyLTQ0Y2YtYmEwMS03NDZjN2YwNWQ3YTEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU2OTc3MDU1LCJpYXQiOjE3NTY5NzM0NTUsImVtYWlsIjoiYWRtaW5AbW90b3J0cmFjZS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiU3lzdGVtIEFkbWluaXN0cmF0b3IiLCJwaG9uZSI6IisxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTY5NzM0NTV9XSwic2Vzc2lvbl9pZCI6IjIyNDc1OTgxLTFmMGQtNGQ2YS05YjliLTQ0YzQxY2RiNTZjYyIsImlzX2Fub255bW91cyI6ZmFsc2V9.rwxKzvsDcn89IHHQnc912oVJ5RvXsS1t-390QaU-Kcw"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "customer_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "userProfile": {
        "id": "profile_id",
        "name": "John Doe",
        "role": "customer",
        "isRegistrationComplete": true
      },
      "vehicles": [...],
      "workOrders": [...],
      "appointments": [...]
    }
  ],
  "message": "Customers retrieved successfully",
  "pagination": {
    "limit": 20,
    "offset": 0,
    "count": 1
  }
}
```

#### GET `/customers/:id`
Get customer by ID.

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/customers/customer_id_here" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjU0MzIxL2F1dGgvdjEiLCJzdWIiOiIzODVhMTBmZS03YTcyLTQ0Y2YtYmEwMS03NDZjN2YwNWQ3YTEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU2OTc3MDU1LCJpYXQiOjE3NTY5NzM0NTUsImVtYWlsIjoiYWRtaW5AbW90b3J0cmFjZS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiU3lzdGVtIEFkbWluaXN0cmF0b3IiLCJwaG9uZSI6IisxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTY5NzM0NTV9XSwic2Vzc2lvbl9pZCI6IjIyNDc1OTgxLTFmMGQtNGQ2YS05YjliLTQ0YzQxY2RiNTZjYyIsImlzX2Fub255bW91cyI6ZmFsc2V9.rwxKzvsDcn89IHHQnc912oVJ5RvXsS1t-390QaU-Kcw"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "customer_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "userProfile": {...},
    "vehicles": [...],
    "workOrders": [...],
    "appointments": [...]
  },
  "message": "Customer retrieved successfully"
}
```

#### GET `/customers/profile/:userProfileId`
Get customer by user profile ID (useful for mobile app users).

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/customers/profile/user_profile_id_here" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjU0MzIxL2F1dGgvdjEiLCJzdWIiOiIzODVhMTBmZS03YTcyLTQ0Y2YtYmEwMS03NDZjN2YwNWQ3YTEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU2OTc3MDU1LCJpYXQiOjE3NTY5NzM0NTUsImVtYWlsIjoiYWRtaW5AbW90b3J0cmFjZS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiU3lzdGVtIEFkbWluaXN0cmF0b3IiLCJwaG9uZSI6IisxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTY5NzM0NTV9XSwic2Vzc2lvbl9pZCI6IjIyNDc1OTgxLTFmMGQtNGQ2YS05YjliLTQ0YzQxY2RiNTZjYyIsImlzX2Fub255bW91cyI6ZmFsc2V9.rwxKzvsDcn89IHHQnc912oVJ5RvXsS1t-390QaU-Kcw"
```

#### POST `/customers`
Create a new customer.

**Request Body:**
```json
{
  "userProfileId": "optional_profile_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:3000/customers" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjU0MzIxL2F1dGgvdjEiLCJzdWIiOiIzODVhMTBmZS03YTcyLTQ0Y2YtYmEwMS03NDZjN2YwNWQ3YTEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU2OTc3MDU1LCJpYXQiOjE3NTY5NzM0NTUsImVtYWlsIjoiYWRtaW5AbW90b3J0cmFjZS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiU3lzdGVtIEFkbWluaXN0cmF0b3IiLCJwaG9uZSI6IisxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTY5NzM0NTV9XSwic2Vzc2lvbl9pZCI6IjIyNDc1OTgxLTFmMGQtNGQ2YS05YjliLTQ0YzQxY2RiNTZjYyIsImlzX2Fub255bW91cyI6ZmFsc2V9.rwxKzvsDcn89IHHQnc912oVJ5RvXsS1t-390QaU-Kcw" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }'
```

#### PUT `/customers/:id`
Update customer information.

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "phone": "+1234567890"
}
```

**cURL Example:**
```bash
curl -X PUT "http://localhost:3000/customers/customer_id_here" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjU0MzIxL2F1dGgvdjEiLCJzdWIiOiIzODVhMTBmZS03YTcyLTQ0Y2YtYmEwMS03NDZjN2YwNWQ3YTEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU2OTc3MDU1LCJpYXQiOjE3NTY5NzM0NTUsImVtYWlsIjoiYWRtaW5AbW90b3J0cmFjZS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiU3lzdGVtIEFkbWluaXN0cmF0b3IiLCJwaG9uZSI6IisxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTY5NzM0NTV9XSwic2Vzc2lvbl9pZCI6IjIyNDc1OTgxLTFmMGQtNGQ2YS05YjliLTQ0YzQxY2RiNTZjYyIsImlzX2Fub255bW91cyI6ZmFsc2V9.rwxKzvsDcn89IHHQnc912oVJ5RvXsS1t-390QaU-Kcw" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "phone": "+1234567890"
  }'
```

#### DELETE `/customers/:id`
Delete customer (requires manager role).

**cURL Example:**
```bash
curl -X DELETE "http://localhost:3000/customers/customer_id_here" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjU0MzIxL2F1dGgvdjEiLCJzdWIiOiIzODVhMTBmZS03YTcyLTQ0Y2YtYmEwMS03NDZjN2YwNWQ3YTEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU2OTc3MDU1LCJpYXQiOjE3NTY5NzM0NTUsImVtYWlsIjoiYWRtaW5AbW90b3J0cmFjZS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiU3lzdGVtIEFkbWluaXN0cmF0b3IiLCJwaG9uZSI6IisxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTY5NzM0NTV9XSwic2Vzc2lvbl9pZCI6IjIyNDc1OTgxLTFmMGQtNGQ2YS05YjliLTQ0YzQxY2RiNTZjYyIsImlzX2Fub255bW91cyI6ZmFsc2V9.rwxKzvsDcn89IHHQnc912oVJ5RvXsS1t-390QaU-Kcw"
```

### Customer-Specific Data

#### GET `/customers/:customerId/vehicles`
Get all vehicles for a specific customer.

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/customers/customer_id_here/vehicles" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjU0MzIxL2F1dGgvdjEiLCJzdWIiOiIzODVhMTBmZS03YTcyLTQ0Y2YtYmEwMS03NDZjN2YwNWQ3YTEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU2OTc3MDU1LCJpYXQiOjE3NTY5NzM0NTUsImVtYWlsIjoiYWRtaW5AbW90b3J0cmFjZS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiU3lzdGVtIEFkbWluaXN0cmF0b3IiLCJwaG9uZSI6IisxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTY5NzM0NTV9XSwic2Vzc2lvbl9pZCI6IjIyNDc1OTgxLTFmMGQtNGQ2YS05YjliLTQ0YzQxY2RiNTZjYyIsImlzX2Fub255bW91cyI6ZmFsc2V9.rwxKzvsDcn89IHHQnc912oVJ5RvXsS1t-390QaU-Kcw"
```

#### GET `/customers/:customerId/work-orders`
Get all work orders for a specific customer.

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/customers/customer_id_here/work-orders" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjU0MzIxL2F1dGgvdjEiLCJzdWIiOiIzODVhMTBmZS03YTcyLTQ0Y2YtYmEwMS03NDZjN2YwNWQ3YTEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU2OTc3MDU1LCJpYXQiOjE3NTY5NzM0NTUsImVtYWlsIjoiYWRtaW5AbW90b3J0cmFjZS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiU3lzdGVtIEFkbWluaXN0cmF0b3IiLCJwaG9uZSI6IisxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTY5NzM0NTV9XSwic2Vzc2lvbl9pZCI6IjIyNDc1OTgxLTFmMGQtNGQ2YS05YjliLTQ0YzQxY2RiNTZjYyIsImlzX2Fub255bW91cyI6ZmFsc2V9.rwxKzvsDcn89IHHQnc912oVJ5RvXsS1t-390QaU-Kcw"
```

#### GET `/customers/:customerId/appointments`
Get all appointments for a specific customer.

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/customers/customer_id_here/appointments" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjU0MzIxL2F1dGgvdjEiLCJzdWIiOiIzODVhMTBmZS03YTcyLTQ0Y2YtYmEwMS03NDZjN2YwNWQ3YTEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU2OTc3MDU1LCJpYXQiOjE3NTY5NzM0NTUsImVtYWlsIjoiYWRtaW5AbW90b3J0cmFjZS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiU3lzdGVtIEFkbWluaXN0cmF0b3IiLCJwaG9uZSI6IisxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTY5NzM0NTV9XSwic2Vzc2lvbl9pZCI6IjIyNDc1OTgxLTFmMGQtNGQ2YS05YjliLTQ0YzQxY2RiNTZjYyIsImlzX2Fub255bW91cyI6ZmFsc2V9.rwxKzvsDcn89IHHQnc912oVJ5RvXsS1t-390QaU-Kcw"
```

## Authentication & Authorization

- **All endpoints require authentication** via Supabase JWT token
- **DELETE operations require manager role**
- **Other operations are available to all authenticated users**

## Data Models

### Customer
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

### Vehicle
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

## Features

### 1. **Flexible Customer Support**
- Supports both app users (with userProfileId) and walk-in customers
- Seamless integration with existing user authentication system

### 2. **Comprehensive Data Retrieval**
- Includes related vehicles, work orders, and appointments
- Rich customer profile information

### 3. **Advanced Filtering**
- Search across multiple fields
- Filter by customer characteristics
- Pagination support

### 4. **Mobile App Integration**
- Special endpoint for getting customer by user profile ID
- Optimized for mobile app user experience

### 5. **Role-Based Access Control**
- Different permission levels for different operations
- Secure customer data access

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
```

### Backend Integration

```typescript
import { CustomerService } from './customers/customers.service';

const customerService = new CustomerService();

// Get customer with all related data
const customer = await customerService.getCustomerById(customerId);

// Create new customer
const newCustomer = await customerService.createCustomer({
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+1234567890'
});
```

## Error Handling

The module provides comprehensive error handling with:
- HTTP status codes (400, 401, 403, 404, 500)
- Descriptive error messages
- Consistent error response format

## Validation

All input data is validated using Joi schemas:
- Customer creation and update validation
- Query parameter validation
- Phone number format validation
- Email format validation

## Testing

The module includes comprehensive testing:
- Unit tests for service layer
- Integration tests for API endpoints
- Validation tests
- Error handling tests
