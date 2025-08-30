# Canned Services Module

A dedicated module for managing predefined automotive services that can be used across the system.

## Overview

The Canned Services module provides a centralized way to manage standard automotive services like oil changes, brake inspections, tire rotations, etc. These services can be referenced by:

- Work Orders
- Appointments
- Estimates
- Service Catalogs
- Customer Service Menus

## Features

- **CRUD Operations**: Create, read, update, and delete canned services
- **Availability Management**: Enable/disable services without deleting them
- **Search & Filtering**: Find services by name, description, code, or price range
- **Bulk Operations**: Update prices across multiple services
- **Validation**: Comprehensive input validation and error handling
- **Audit Trail**: Track creation and modification timestamps

## API Endpoints

### Base Path: `/canned-services`

#### GET `/canned-services`
Get all canned services with optional filters
- **Query Parameters:**
  - `isAvailable` (boolean): Filter by availability
  - `minPrice` (number): Minimum price filter
  - `maxPrice` (number): Maximum price filter
  - `search` (string): Search in name, description, or code

#### GET `/canned-services/available`
Get only available (enabled) canned services

#### GET `/canned-services/search`
Search canned services with filters
- **Query Parameters:** Same as above, plus `query` (required)

#### GET `/canned-services/:id`
Get a specific canned service by ID

#### GET `/canned-services/code/:code`
Get a specific canned service by code

#### POST `/canned-services`
Create a new canned service
- **Body:**
  ```json
  {
    "code": "OIL_CHANGE",
    "name": "Oil Change Service",
    "description": "Standard oil change with filter replacement",
    "duration": 30,
    "price": 49.99,
    "isAvailable": true
  }
  ```

#### PUT `/canned-services/:id`
Update an existing canned service
- **Body:** Same as POST, but all fields are optional

#### PATCH `/canned-services/:id/toggle-availability`
Toggle the availability of a canned service

#### PATCH `/canned-services/bulk-update-prices`
Bulk update prices across all services
- **Body:**
  ```json
  {
    "percentageIncrease": 5.5
  }
  ```

#### DELETE `/canned-services/:id`
Delete a canned service (only if not used in work orders or appointments)

## Data Model

```typescript
interface CannedService {
  id: string;
  code: string;           // Unique service code (e.g., "OIL_CHANGE")
  name: string;           // Service name
  description?: string;   // Service description
  duration: number;       // Duration in minutes
  price: number;          // Service price
  isAvailable: boolean;   // Whether service is currently available
  createdAt: Date;        // Creation timestamp
  updatedAt: Date;        // Last update timestamp
}
```

## Usage Examples

### Creating a New Service
```bash
curl -X POST "http://localhost:3000/canned-services" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "BRAKE_INSPECTION",
    "name": "Brake System Inspection",
    "description": "Complete brake system inspection and safety check",
    "duration": 45,
    "price": 89.99
  }'
```

### Getting Available Services
```bash
curl -X GET "http://localhost:3000/canned-services/available"
```

### Searching Services
```bash
curl -X GET "http://localhost:3000/canned-services/search?query=oil&maxPrice=100"
```

### Updating a Service
```bash
curl -X PUT "http://localhost:3000/canned-services/{id}" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 54.99
  }'
```

## Business Rules

1. **Unique Codes**: Service codes must be unique across the system
2. **Deletion Protection**: Services cannot be deleted if they're used in work orders or appointments
3. **Price Validation**: Prices must be non-negative numbers
4. **Duration Limits**: Duration must be between 1 minute and 8 hours (480 minutes)
5. **Availability Toggle**: Services can be disabled without deletion for seasonal or temporary unavailability

## Integration Points

- **Work Orders**: Services are referenced when creating work order line items
- **Appointments**: Services can be selected when booking appointments
- **Estimates**: Services contribute to estimate calculations
- **Inventory**: Services can be linked to required parts
- **Labor**: Services can have associated labor operations

## Future Enhancements

- **Categories**: Group services by type (maintenance, repair, inspection)
- **Seasonal Pricing**: Different prices for different times of year
- **Service Packages**: Combine multiple services into packages
- **Customer Pricing**: Different prices for different customer types
- **Service Templates**: Predefined service workflows and checklists
