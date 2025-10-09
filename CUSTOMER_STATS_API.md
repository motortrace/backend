# Customer Statistics API

## Overview
The Customer Statistics API provides comprehensive analytics and metrics for auto repair shop customers, including financial data, visit patterns, loyalty scores, and predictive insights.

## Endpoints

### 1. Get All Customers (List View - For Tables)
**Endpoint:** `GET /customers`

Returns a paginated list of customers with basic information suitable for table displays.

**Query Parameters:**
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset (default: 0)
- `search` - Search by name, email, or phone
- `hasVehicles` - Filter customers with vehicles
- `hasWorkOrders` - Filter customers with work orders

**Curl Command (Git Bash):**
```bash
curl -X GET "http://localhost:3000/customers?limit=50&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Response:** Returns basic customer list with vehicles, work orders summary, and appointments.

---

### 2. Get Customer Details (Full Data)
**Endpoint:** `GET /customers/:customerId`

Returns comprehensive customer data including all related records (vehicles, work orders, invoices, appointments, inspections, parts, labor, payments, etc.)

**Curl Command (Git Bash):**
```bash
curl -X GET "http://localhost:3000/customers/CUSTOMER_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Response:** Returns everything about the customer - all raw data.

---

### 3. Get Customer Statistics (Analytics & Metrics) ⭐ NEW
**Endpoint:** `GET /customers/:customerId/statistics`

Returns calculated analytics and business metrics for a customer. This is what shops need for dashboards, graphs, and business insights.

**Curl Command (Git Bash):**
```bash
curl -X GET "http://localhost:3000/customers/CUSTOMER_ID_HERE/statistics" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Response Structure:**

```json
{
  "success": true,
  "data": {
    "customer": {
      "id": "customer_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "customerSince": "2023-01-15T00:00:00.000Z",
      "customerLifetimeDays": 650
    },
    "financials": {
      "totalSpent": 5420.50,
      "totalPaid": 5200.00,
      "outstandingBalance": 220.50,
      "averageTicket": 678.06,
      "currency": "USD"
    },
    "visits": {
      "totalWorkOrders": 8,
      "completedWorkOrders": 7,
      "lastVisit": "2024-11-20T10:30:00.000Z",
      "daysSinceLastVisit": 48,
      "averageVisitGapDays": 85,
      "predictedNextVisit": "2025-02-15T00:00:00.000Z",
      "firstVisit": "2023-01-15T00:00:00.000Z",
      "monthlyVisitTrend": {
        "2024-11": 2,
        "2024-10": 1,
        "2024-09": 0,
        "2024-08": 1
      }
    },
    "vehicles": {
      "totalVehicles": 2,
      "vehicleList": [
        {
          "id": "vehicle_id_1",
          "display": "2020 Toyota Camry",
          "addedOn": "2023-01-15T00:00:00.000Z"
        },
        {
          "id": "vehicle_id_2",
          "display": "2018 Honda Civic",
          "addedOn": "2023-06-10T00:00:00.000Z"
        }
      ],
      "mostServicedVehicle": ["2020 Toyota Camry", 5]
    },
    "appointments": {
      "totalAppointments": 10,
      "completedAppointments": 8,
      "appointmentShowRate": 80.00,
      "statusBreakdown": {
        "COMPLETED": 8,
        "CANCELLED": 1,
        "PENDING": 1
      }
    },
    "workOrderBreakdown": {
      "byStatus": {
        "COMPLETED": 7,
        "IN_PROGRESS": 1
      },
      "byJobType": {
        "REPAIR": 5,
        "MAINTENANCE": 3
      },
      "byVehicle": {
        "2020 Toyota Camry": 5,
        "2018 Honda Civic": 3
      }
    },
    "customerProfile": {
      "isReturningCustomer": true,
      "isActiveCustomer": true,
      "isAtRisk": false,
      "loyaltyScore": 78
    },
    "paymentBehavior": {
      "totalPayments": 8,
      "completedPayments": 7,
      "paymentCompletionRate": 87.50
    }
  },
  "message": "Customer statistics retrieved successfully"
}
```

---

## Metrics Explained

### Financial Metrics
- **totalSpent**: Total amount of all invoices
- **totalPaid**: Total amount customer has paid
- **outstandingBalance**: Remaining unpaid amount
- **averageTicket**: Average invoice amount per visit

### Visit Metrics (Auto Repair Shop Specific)
- **daysSinceLastVisit**: Days since customer's last completed work order
- **averageVisitGapDays**: Average number of days between visits (helps predict service intervals)
- **predictedNextVisit**: Estimated date of next visit based on historical patterns
- **monthlyVisitTrend**: Visit count by month (for graphs)

### Customer Profile
- **isReturningCustomer**: Has more than 1 work order
- **isActiveCustomer**: Visited within last 180 days
- **isAtRisk**: No visit in over 365 days (churn risk)
- **loyaltyScore**: 0-100 score based on:
  - Number of visits (max 40 points)
  - Customer tenure (max 20 points)
  - Visit frequency (max 20 points)
  - Payment completion rate (max 20 points)

### Vehicle Statistics
- **mostServicedVehicle**: Which vehicle comes in most often
- **vehicleList**: All customer vehicles with when they were added

### Payment Behavior
- **paymentCompletionRate**: Percentage of payments successfully completed
- Helps identify payment reliability

---

## Use Cases

### Dashboard Widgets
- Total customers
- Revenue metrics
- At-risk customers count
- Active vs inactive customers

### Customer Profile Page
- Customer lifetime value
- Visit history graph
- Loyalty score gauge
- Payment reliability indicator

### Predictive Analytics
- When customer should return for service
- Identify at-risk customers for retention campaigns
- Forecast revenue based on visit patterns

### Marketing & Retention
- Target at-risk customers with promotions
- Reward high-loyalty customers
- Send reminders based on predicted next visit

---

## Examples

### Check if a customer is due for service:
```bash
# Get stats
curl -X GET "http://localhost:3000/customers/cmeegjqmy000cuungykprix4g/statistics" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Look at:
# - daysSinceLastVisit (if > 90 days, may need follow-up)
# - predictedNextVisit (when they should return)
# - isAtRisk (if true, customer hasn't visited in a year)
```

### Find high-value customers:
Look for customers with:
- High `totalSpent`
- High `loyaltyScore`
- `isActiveCustomer` = true
- High `paymentCompletionRate`

### Identify churn risks:
Look for customers with:
- `isAtRisk` = true
- High `daysSinceLastVisit`
- Previously `isReturningCustomer` = true

---

## Notes

- All dates are in ISO 8601 format
- All monetary values are in the specified currency (default: USD)
- Statistics are calculated in real-time from the database
- The endpoint requires authentication
