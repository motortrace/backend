# Vehicles Module - CURL Commands

## Overview
This document provides curl commands for testing all endpoints in the Vehicles module.

## Base URL
All commands assume the server is running on `http://localhost:3000`

## Authentication
If authentication is required, add the following header:
```bash
-H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 1. Create Vehicle

```bash
curl -X POST http://localhost:3000/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer_id_here",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "vin": "1HGBH41JXMN109186",
    "licensePlate": "ABC123"
  }'
```

## 2. Get All Vehicles

```bash
curl -X GET "http://localhost:3000/vehicles"
```

## 3. Get Vehicles with Filters

```bash
# Filter by customer
curl -X GET "http://localhost:3000/vehicles?customerId=customer_id_here"

# Filter by make
curl -X GET "http://localhost:3000/vehicles?make=Toyota"

# Filter by model
curl -X GET "http://localhost:3000/vehicles?model=Camry"

# Filter by year
curl -X GET "http://localhost:3000/vehicles?year=2020"

# Filter by VIN
curl -X GET "http://localhost:3000/vehicles?vin=1HGBH41JXMN109186"

# Filter by license plate
curl -X GET "http://localhost:3000/vehicles?licensePlate=ABC123"

# Multiple filters
curl -X GET "http://localhost:3000/vehicles?make=Toyota&year=2020&customerId=customer_id_here"
```

## 4. Search Vehicles

```bash
# Search by query string
curl -X GET "http://localhost:3000/vehicles/search?q=Toyota"

# Search by specific term
curl -X GET "http://localhost:3000/vehicles/search?q=Camry"

# Search by license plate
curl -X GET "http://localhost:3000/vehicles/search?q=ABC123"
```

## 5. Get Vehicle Statistics

```bash
curl -X GET "http://localhost:3000/vehicles/statistics"
```

## 6. Get Vehicles by Customer

```bash
# Replace customer_id_here with actual customer ID
curl -X GET "http://localhost:3000/vehicles/customer/customer_id_here"
```

## 7. Get Vehicle by ID

```bash
# Replace vehicle_id_here with actual vehicle ID
curl -X GET "http://localhost:3000/vehicles/vehicle_id_here"
```

## 8. Update Vehicle

```bash
# Replace vehicle_id_here with actual vehicle ID
curl -X PUT http://localhost:3000/vehicles/vehicle_id_here \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Honda",
    "model": "Accord",
    "year": 2021,
    "vin": "1HGBH41JXMN109187",
    "licensePlate": "XYZ789"
  }'
```

## 9. Delete Vehicle

```bash
# Replace vehicle_id_here with actual vehicle ID
curl -X DELETE "http://localhost:3000/vehicles/vehicle_id_here"
```

## 10. Upload Vehicle Image

```bash
# Replace vehicle_id_here with actual vehicle ID
# Replace YOUR_TOKEN_HERE with actual authentication token
curl -X POST http://localhost:3000/vehicles/vehicle_id_here/image \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "vehicleImage=@/path/to/vehicle/image.jpg"
```

## 11. Delete Vehicle Image

```bash
# Replace vehicle_id_here with actual vehicle ID
# Replace YOUR_TOKEN_HERE with actual authentication token
curl -X DELETE http://localhost:3000/vehicles/vehicle_id_here/image \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Example Data for Testing

### Sample Customer IDs
- `cm1234567890abcdef` (example customer ID)
- `cm0987654321fedcba` (example customer ID)

### Sample Vehicle Data
```json
{
  "customerId": "cm1234567890abcdef",
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "vin": "1HGBH41JXMN109186",
  "licensePlate": "ABC123"
}
```

```json
{
  "customerId": "cm1234567890abcdef",
  "make": "Honda",
  "model": "Civic",
  "year": 2019,
  "vin": "2HGBH41JXMN109187",
  "licensePlate": "DEF456"
}
```

```json
{
  "customerId": "cm0987654321fedcba",
  "make": "Ford",
  "model": "F-150",
  "year": 2021,
  "vin": "3HGBH41JXMN109188",
  "licensePlate": "GHI789"
}
```

---

## Response Examples

### Successful Vehicle Creation
```json
{
  "success": true,
  "data": {
    "id": "vehicle_id_here",
    "customerId": "cm1234567890abcdef",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "vin": "1HGBH41JXMN109186",
    "licensePlate": "ABC123",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "customer": {
      "id": "cm1234567890abcdef",
      "name": "John Doe",
      "email": "john.doe@example.com"
    }
  },
  "message": "Vehicle created successfully"
}
```

### Vehicle Statistics Response
```json
{
  "success": true,
  "data": {
    "totalVehicles": 150,
    "vehiclesByMake": [
      { "make": "Toyota", "count": 45 },
      { "make": "Honda", "count": 38 },
      { "make": "Ford", "count": 32 },
      { "make": "Chevrolet", "count": 25 },
      { "make": "Nissan", "count": 10 }
    ],
    "vehiclesByYear": [
      { "year": 2021, "count": 25 },
      { "year": 2020, "count": 30 },
      { "year": 2019, "count": 28 },
      { "year": 2018, "count": 22 },
      { "year": 2017, "count": 20 }
    ],
    "recentAdditions": [
      {
        "id": "vehicle_id_1",
        "customerId": "customer_id_1",
        "make": "Toyota",
        "model": "Camry",
        "year": 2021,
        "vin": "1HGBH41JXMN109186",
        "licensePlate": "ABC123",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

## Error Responses

### Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "customerId",
      "message": "Customer ID is required"
    }
  ]
}
```

### Vehicle Not Found
```json
{
  "success": false,
  "error": "Vehicle not found",
  "message": "No vehicle found with the provided ID"
}
```

### VIN Already Exists
```json
{
  "success": false,
  "error": "VIN already exists",
  "message": "A vehicle with this VIN already exists"
}
```

---

## Vehicle Images

### Image Upload Features
- **Supabase Storage**: Images are stored in the `car-images` bucket
- **File Size Limit**: 5MB maximum
- **Supported Formats**: JPEG, PNG, WebP
- **Authentication Required**: All image operations require valid authentication token
- **Unique Naming**: Images are named with pattern `vehicle-{vehicleId}-{originalName}`

### Image Upload Response
```json
{
  "success": true,
  "data": {
    "vehicle": {
      "id": "vehicle_id_here",
      "customerId": "customer_id_here",
      "make": "Toyota",
      "model": "Camry",
      "year": 2020,
      "vin": "1HGBH41JXMN109186",
      "licensePlate": "ABC123",
      "imageUrl": "https://supabase-url.com/storage/v1/object/public/car-images/vehicle-vehicle_id_here-image.jpg",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "imageUrl": "https://supabase-url.com/storage/v1/object/public/car-images/vehicle-vehicle_id_here-image.jpg",
    "fileName": "image.jpg",
    "fileSize": 1024000,
    "mimeType": "image/jpeg"
  },
  "message": "Vehicle image uploaded successfully"
}
```

## Notes

- Replace `vehicle_id_here`, `customer_id_here` with actual IDs from your database
- VIN numbers should be unique across all vehicles
- License plates should be unique within the system
- All date fields are returned in ISO 8601 format
- The `year` field is optional but recommended for better vehicle identification
- When updating a vehicle, only include the fields you want to change
- The delete operation will fail if the vehicle has associated work orders
- **Image uploads require authentication** - include the Authorization header
- **Image files must be actual image files** (JPEG, PNG, WebP)
- **Maximum file size is 5MB** for image uploads

## Testing Workflow

1. **Create a customer first** (if not already exists)
2. **Create vehicles** using the customer ID
3. **Test filtering and search** functionality
4. **Update vehicle information** as needed
5. **Check statistics** to verify data
6. **Delete vehicles** (only if no work orders exist)

## Common Use Cases

### Adding Multiple Vehicles for a Customer
```bash
# Create first vehicle
curl -X POST http://localhost:3000/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cm1234567890abcdef",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "vin": "1HGBH41JXMN109186",
    "licensePlate": "ABC123"
  }'

# Create second vehicle for same customer
curl -X POST http://localhost:3000/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cm1234567890abcdef",
    "make": "Honda",
    "model": "Civic",
    "year": 2019,
    "vin": "2HGBH41JXMN109187",
    "licensePlate": "DEF456"
  }'
```

### Finding All Vehicles for a Customer
```bash
curl -X GET "http://localhost:3000/vehicles/customer/cm1234567890abcdef"
```

### Updating Vehicle Information
```bash
# Update license plate
curl -X PUT http://localhost:3000/vehicles/vehicle_id_here \
  -H "Content-Type: application/json" \
  -d '{
    "licensePlate": "NEW123"
  }'
```
