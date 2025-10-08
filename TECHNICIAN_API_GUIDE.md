# Technician API Endpoints Guide

##  Complete Guide for Technician Workflow

This guide covers all endpoints technicians need to view, accept, and complete their work.

---

## 📋 Table of Contents
1. [Get Current User Info](#get-current-user-info)
2. [View Assigned Work Orders](#view-assigned-work-orders)
3. [View Inspections](#view-inspections)
4. [View Labor/Services](#view-laborservices)
5. [View Parts](#view-parts)
6. [Complete Inspections](#complete-inspections)
7. [Complete Labor Work](#complete-labor-work)
8. [Install Parts](#install-parts)
9. [Add Images/Attachments](#add-imagesattachments)

---

## 1. Get Current User Info

### Get My Profile (includes technicianId)
```bash
GET /auth/me
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userProfileId": "profile_123",
    "name": "John Technician",
    "role": "TECHNICIAN",
    "roleDetails": {
      "type": "technician",
      "technicianId": "tech_456",
      "employeeId": "EMP001",
      "specialization": "Engine Repair",
      "certifications": ["ASE Certified"]
    }
  }
}
```

**Use the `technicianId` for all subsequent calls.**

---

## 2. View Assigned Work Orders

### Get All My Work Orders
```bash
GET /technicians/{technicianId}/work-orders?status=IN_PROGRESS&limit=20
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
- `status` (optional): Filter by work order status
  - `OPEN`, `IN_PROGRESS`, `AWAITING_PARTS`, `COMPLETED`, `CLOSED`
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "wo_123",
      "workOrderNumber": "WO-2025-001",
      "status": "IN_PROGRESS",
      "customer": {
        "name": "Steve Smith",
        "phone": "+1234567890"
      },
      "vehicle": {
        "make": "Toyota",
        "model": "Camry",
        "year": 2020,
        "vin": "1234567890ABC"
      },
      "laborItems": [
        {
          "id": "labor_1",
          "description": "Oil Change",
          "hours": 0.5,
          "status": "PENDING",
          "technicianId": "tech_456"
        }
      ]
    }
  ]
}
```

### Get Specific Work Order Details
```bash
GET /work-orders/{workOrderId}
Authorization: Bearer YOUR_TOKEN
```

**Response includes:**
- Customer & vehicle info
- All labor items assigned to you
- All parts for this work order
- Inspection results
- Attachments

---

## 3. View Inspections

### Get My Inspections
```bash
GET /inspection-templates/inspectors/{technicianId}/inspections
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "insp_123",
      "workOrderId": "wo_123",
      "template": {
        "name": "Multi-Point Inspection",
        "category": "GENERAL"
      },
      "status": "PENDING",
      "inspectorId": "tech_456",
      "checklistItems": [
        {
          "id": "item_1",
          "description": "Check tire pressure",
          "status": "PENDING",
          "notes": null
        }
      ]
    }
  ]
}
```

### Get Specific Inspection
```bash
GET /inspection-templates/inspections/{inspectionId}
Authorization: Bearer YOUR_TOKEN
```

### Get Inspection Status for Work Order
```bash
GET /inspection-templates/work-orders/{workOrderId}/inspection-status
Authorization: Bearer YOUR_TOKEN
```

---

## 4. View Labor/Services

### Get Labor Items for Work Order
```bash
GET /labor/work-order?workOrderId={workOrderId}
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "labor_1",
      "workOrderId": "wo_123",
      "description": "Oil Change",
      "hours": 0.5,
      "rate": 120.00,
      "subtotal": 60.00,
      "status": "PENDING",
      "technicianId": "tech_456",
      "startTime": null,
      "endTime": null,
      "notes": "Use synthetic oil"
    }
  ]
}
```

### Get Specific Labor Item
```bash
GET /labor/work-order/{laborId}
Authorization: Bearer YOUR_TOKEN
```

### Get My Labor Summary
```bash
GET /labor/technician/{technicianId}/summary
Authorization: Bearer YOUR_TOKEN
```

**Response includes:**
- Total hours worked
- Number of jobs completed
- Average completion time
- Status breakdown

---

## 5. View Parts

### Get Parts for Work Order
```bash
GET /work-orders/{workOrderId}/parts
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "part_1",
      "workOrderId": "wo_123",
      "part": {
        "id": "inv_1",
        "partNumber": "12345",
        "name": "Oil Filter",
        "description": "Standard oil filter"
      },
      "quantity": 1,
      "unitPrice": 15.99,
      "subtotal": 15.99,
      "installedAt": null,
      "installedById": null,
      "source": "INVENTORY"
    }
  ]
}
```

### View All Parts in Inventory (for reference)
```bash
GET /inventory?search=filter&limit=20
Authorization: Bearer YOUR_TOKEN
```

---

## 6. Complete Inspections

### Update Inspection Status
```bash
PUT /inspection-templates/inspections/{inspectionId}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "COMPLETED",
  "completedAt": "2025-10-07T10:30:00Z",
  "notes": "All items checked and passed"
}
```

### Update Individual Checklist Item
```bash
PUT /inspection-templates/checklist-items/{checklistItemId}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "PASS",
  "notes": "Tire pressure is good - 35 PSI",
  "recommendation": "NO_ACTION_NEEDED"
}
```

**Status Options:**
- `PASS` - Item is good
- `FAIL` - Item needs attention
- `WARNING` - Item needs monitoring
- `NOT_APPLICABLE` - Item doesn't apply

**Recommendation Options:**
- `NO_ACTION_NEEDED`
- `MONITOR`
- `RECOMMEND_SERVICE`
- `IMMEDIATE_ATTENTION`

### Add Inspection Attachment (Photos)
```bash
POST /inspection-templates/inspections/{inspectionId}/attachments
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

file: <image_file>
description: "Brake pad wear - front left"
```

---

## 7. Complete Labor Work

### Start Labor Work
```bash
PUT /labor/work-order/{laborId}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "startTime": "2025-10-07T10:00:00Z"
}
```

### Complete Labor Work
```bash
PUT /labor/work-order/{laborId}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "COMPLETED",
  "endTime": "2025-10-07T10:30:00Z",
  "notes": "Oil change completed. Used synthetic 5W-30"
}
```

**Status Options:**
- `PENDING` - Not started yet
- `IN_PROGRESS` - Currently working on it
- `COMPLETED` - Work finished
- `CANCELLED` - Work cancelled

### Update Labor Hours (if needed)
```bash
PUT /labor/work-order/{laborId}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "hours": 0.75,
  "notes": "Took longer than expected due to stripped drain plug"
}
```

---

## 8. Install Parts

### Mark Part as Installed
```bash
PUT /work-orders/{workOrderId}/parts/{partId}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "installedAt": "2025-10-07T10:15:00Z",
  "installedById": "tech_456",
  "notes": "Part installed successfully"
}
```

### Request Additional Parts (if needed)
```bash
POST /work-orders/{workOrderId}/part-requests
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "inventoryItemId": "inv_999",
  "quantity": 1,
  "reason": "Discovered damaged belt during inspection",
  "urgency": "HIGH"
}
```

**Note:** This creates a request for the Service Advisor to add to estimate and get customer approval.

---

## 9. Add Images/Attachments

### Upload Work Order Attachment
```bash
POST /work-orders/{workOrderId}/attachments
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

file: <image_or_document>
description: "Before photo - dirty air filter"
category: "BEFORE_PHOTO"
```

**Category Options:**
- `BEFORE_PHOTO` - Before work photos
- `AFTER_PHOTO` - After work photos
- `DAMAGE_PHOTO` - Photos of damage/issues
- `PART_PHOTO` - Photos of parts
- `GENERAL` - General attachments
- `DOCUMENT` - PDF documents
- `VIDEO` - Video files

### Upload Inspection Attachment
```bash
POST /inspection-templates/inspections/{inspectionId}/attachments
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

file: <image_file>
description: "Tire tread depth measurement"
```

### Get All Attachments for Work Order
```bash
GET /work-orders/{workOrderId}/attachments
Authorization: Bearer YOUR_TOKEN
```

### Get Inspection Attachments
```bash
GET /inspection-templates/inspections/{inspectionId}/attachments
Authorization: Bearer YOUR_TOKEN
```

---

## 📱 Complete Workflow Example

### Scenario: Technician completes an oil change

#### Step 1: Get my profile and technicianId
```bash
GET /auth/me
```

#### Step 2: View assigned work orders
```bash
GET /technicians/tech_456/work-orders?status=IN_PROGRESS
```

#### Step 3: View specific work order details
```bash
GET /work-orders/wo_123
```
This shows:
- Labor items assigned to me
- Parts I need to install
- Any inspections to complete

#### Step 4: Complete inspection (if required)
```bash
# Update checklist items
PUT /inspection-templates/checklist-items/item_1
{
  "status": "PASS",
  "notes": "Oil level is low"
}

# Add inspection photo
POST /inspection-templates/inspections/insp_123/attachments
file: before_oil.jpg
description: "Oil level before change"

# Mark inspection complete
PUT /inspection-templates/inspections/insp_123
{
  "status": "COMPLETED",
  "completedAt": "2025-10-07T10:00:00Z"
}
```

#### Step 5: Start labor work
```bash
PUT /labor/work-order/labor_1
{
  "status": "IN_PROGRESS",
  "startTime": "2025-10-07T10:05:00Z"
}
```

#### Step 6: Take before photos
```bash
POST /work-orders/wo_123/attachments
file: dirty_filter.jpg
description: "Dirty oil filter"
category: "BEFORE_PHOTO"
```

#### Step 7: Mark parts as installed
```bash
PUT /work-orders/wo_123/parts/part_1
{
  "installedAt": "2025-10-07T10:15:00Z",
  "installedById": "tech_456",
  "notes": "New oil filter installed"
}
```

#### Step 8: Take after photos
```bash
POST /work-orders/wo_123/attachments
file: clean_filter.jpg
description: "New oil filter installed"
category: "AFTER_PHOTO"
```

#### Step 9: Complete labor work
```bash
PUT /labor/work-order/labor_1
{
  "status": "COMPLETED",
  "endTime": "2025-10-07T10:30:00Z",
  "hours": 0.5,
  "notes": "Oil change completed. Used Mobil 1 5W-30 synthetic oil. No issues found."
}
```

---

## 🔍 Advanced Queries

### Get Only My Pending Work
```bash
GET /labor/work-order?technicianId=tech_456&status=PENDING
```

### Get Work Orders Awaiting Parts
```bash
GET /technicians/tech_456/work-orders?status=AWAITING_PARTS
```

### Get Today's Work
```bash
GET /technicians/tech_456/work-orders?date=2025-10-07
```

---

## 🚨 Common Issues & Solutions

### Issue: Can't see assigned work orders
**Solution:** Make sure you're using your correct `technicianId` from `/auth/me` endpoint.

### Issue: Can't upload photos
**Solution:** 
- Ensure `Content-Type: multipart/form-data` header
- File field name should be `file`
- Check file size (max 10MB)

### Issue: Can't update labor status
**Solution:** 
- Labor must be assigned to you (`technicianId` matches)
- Use valid status values: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

### Issue: Parts not showing
**Solution:**
- Parts are only added after estimate is approved by customer
- Check if work order has `estimateApproved = true`

---

##  Status Flow Reference

### Inspection Status Flow
```
PENDING → IN_PROGRESS → COMPLETED
         ↓
      CANCELLED
```

### Labor Status Flow
```
PENDING → IN_PROGRESS → COMPLETED
         ↓
      CANCELLED
```

### Work Order Status Flow (for reference)
```
OPEN → IN_PROGRESS → AWAITING_PARTS → IN_PROGRESS → COMPLETED → CLOSED
      ↓
   CANCELLED
```

---

## 🔐 Authentication

All endpoints require:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

Get your token from:
- Login: `POST /auth/login`
- Or from your mobile app's stored session

---

## 📝 Notes for Mobile App Development

### State Management
- Store `technicianId` after login
- Cache work orders list
- Update UI when labor status changes
- Show photo upload progress

### Offline Support
- Queue photo uploads when offline
- Sync when connection returns
- Store work order data locally

### Push Notifications
- New work assigned
- Parts arrived (AWAITING_PARTS → IN_PROGRESS)
- Customer approved additional work

### UI Suggestions
- Show work orders grouped by status
- Quick action buttons: Start, Complete, Add Photo
- Timer for tracking actual work time
- Checklist UI for inspections

---

**Last Updated**: October 7, 2025
**API Version**: 1.0
