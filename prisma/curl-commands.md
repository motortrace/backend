1. Create a Work Order

curl -X POST http://localhost:3000/work-orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer_123",
    "vehicleId": "vehicle_456",
    "complaint": "Engine making strange noise",
    "diagnosis": "Possible timing belt issue",
    "internalNotes": "Customer reported noise for past week"
  }'


2. Create an Estimate for the Work Order

curl -X POST http://localhost:3000/estimates \
  -H "Content-Type: application/json" \
  -d '{
    "workOrderId": "work_order_id_from_step_1",
    "description": "Timing belt replacement estimate",
    "totalAmount": 0,
    "laborAmount": 0,
    "partsAmount": 0,
    "taxAmount": 0,
    "discountAmount": 0,
    "notes": "Initial estimate for timing belt service"
  }'


3. Add a canned service to that estimate

curl -X POST http://localhost:3000/estimates/estimate_id_from_step_2/add-canned-service \
  -H "Content-Type: application/json" \
  -d '{
    "cannedServiceId": "canned_service_id"
  }'

4. View the Estimate with Added Labor Items

curl -X GET http://localhost:3000/estimates/estimate_id_from_step_2


5. Customer Approves Individual Labor Items

# Approve the first labor item
curl -X PUT http://localhost:3000/estimates/labor/labor_item_id_1/customer-approval \
  -H "Content-Type: application/json" \
  -d '{
    "customerApproved": true,
    "customerNotes": "Approved - this seems reasonable"
  }'

# Approve the second labor item
curl -X PUT http://localhost:3000/estimates/labor/labor_item_id_2/customer-approval \
  -H "Content-Type: application/json" \
  -d '{
    "customerApproved": true,
    "customerNotes": "Approved"
  }'


6. Adding the paprts to estimate, optional

curl -X POST http://localhost:3000/estimates/parts \
  -H "Content-Type: application/json" \
  -d '{
    "estimateId": "estimate_id_from_step_2",
    "inventoryItemId": "part_123",
    "quantity": 1,
    "unitPrice": 89.99,
    "source": "INVENTORY",
    "notes": "Timing belt kit"
  }'

7. customer approving the parts

curl -X PUT http://localhost:3000/estimates/parts/part_item_id/customer-approval \
  -H "Content-Type: application/json" \
  -d '{
    "customerApproved": true,
    "customerNotes": "Approved the timing belt kit"
  }'

8. Approve the Estimate (This Creates Work Order Labor/Parts)

curl -X POST http://localhost:3000/estimates/estimate_id_from_step_2/approve \
  -H "Content-Type: application/json" \
  -d '{
    "approvedById": "service_advisor_id"
  }'

9. Verify Work Order Labor Items Were Created

curl -X GET http://localhost:3000/work-orders/work_order_id_from_step_1