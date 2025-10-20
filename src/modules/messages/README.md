# Messages Module

This module provides messaging functionality for work orders, allowing customers, service advisors, and technicians to communicate in real-time.

## Features

- Send text messages with optional file attachments
- Retrieve message history for work orders
- Mark messages as read
- Delete own messages
- Role-based access control

## API Endpoints

### POST /messages
Create a new message for a work order.

**Request Body:**
```json
{
  "workOrderId": "uuid",
  "message": "Hello, how is the repair going?",
  "messageType": "TEXT",
  "attachments": [
    {
      "fileUrl": "https://...",
      "fileName": "photo.jpg",
      "fileType": "image/jpeg",
      "fileSize": 1024000
    }
  ]
}
```

### GET /messages/:workOrderId
Get messages for a specific work order.

**Query Parameters:**
- `limit` (optional): Number of messages to return (default: 50, max: 100)
- `offset` (optional): Number of messages to skip (default: 0)
- `includeRead` (optional): Include read messages (default: true)

### GET /messages/single/:messageId
Get a specific message by ID.

### PUT /messages/mark-read
Mark multiple messages as read.

**Request Body:**
```json
{
  "messageIds": ["uuid1", "uuid2"]
}
```

### DELETE /messages/:messageId
Delete a message (only the sender can delete their own messages).

## Permissions

- **Customers**: Can message work orders they own
- **Service Advisors**: Can message work orders they are assigned to
- **Technicians**: Can message work orders they are working on

## Real-time Updates

This module is designed to work with Supabase Realtime for live messaging. Subscribe to changes on the `workOrderMessage` table to receive real-time updates.

## File Attachments

Messages can include file attachments stored in Supabase Storage. The API expects pre-uploaded file URLs - handle file uploads separately through the storage module.