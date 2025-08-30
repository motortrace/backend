# Vehicles Module

## Overview
Manages vehicle information and customer-vehicle relationships.

## Endpoints

### Basic CRUD
- `POST /vehicles` - Create a new vehicle
- `GET /vehicles` - Get all vehicles with filters
- `GET /vehicles/:id` - Get vehicle by ID
- `PUT /vehicles/:id` - Update vehicle
- `DELETE /vehicles/:id` - Delete vehicle

### Customer Operations
- `GET /vehicles/customer/:customerId` - Get vehicles by customer

### Analytics
- `GET /vehicles/statistics` - Get vehicle statistics

### Search
- `GET /vehicles/search?q=query` - Search vehicles

## Features
- VIN uniqueness validation
- Customer relationship management
- Search across multiple fields
- Statistics and analytics
- Work order dependency checking