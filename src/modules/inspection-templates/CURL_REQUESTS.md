# Inspection Templates - CURL Commands

curl -X POST http://localhost:3000/inspection-templates/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electrical System",
    "description": "Electrical system inspection covering battery, alternator, starter, lights, and wiring",
    "category": "Electrical",
    "sortOrder": 3,
    "templateItems": [
      {
        "name": "Battery condition",
        "description": "Check battery voltage, charge level, and overall condition",
        "category": "Electrical",
        "sortOrder": 1,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Battery terminals",
        "description": "Inspect battery terminals for corrosion and tight connections",
        "category": "Electrical",
        "sortOrder": 2,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Alternator output",
        "description": "Test alternator output voltage and charging system",
        "category": "Electrical",
        "sortOrder": 3,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Starter operation",
        "description": "Test starter motor operation and engagement",
        "category": "Electrical",
        "sortOrder": 4,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Lights operation",
        "description": "Check all exterior and interior lights for proper operation",
        "category": "Electrical",
        "sortOrder": 5,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Warning lights",
        "description": "Check dashboard warning lights and instrument cluster",
        "category": "Electrical",
        "sortOrder": 6,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Wiring condition",
        "description": "Inspect visible wiring for damage, corrosion, and proper routing",
        "category": "Electrical",
        "sortOrder": 7,
        "isRequired": true,
        "allowsNotes": true
      }
    ]
  }'
```

## 2. Create Engine (Mechanical Condition) Template

```bash
curl -X POST http://localhost:3000/inspection-templates/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Engine (Mechanical Condition)",
    "description": "Comprehensive mechanical inspection of engine components including oil, coolant, belts, and mounts",
    "category": "Mechanical",
    "sortOrder": 1,
    "templateItems": [
      {
        "name": "Oil in air cleaner",
        "description": "Check for oil contamination in the air cleaner/filter housing",
        "category": "Engine",
        "sortOrder": 1,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Water in oil",
        "description": "Check for water contamination in engine oil (milky appearance)",
        "category": "Engine",
        "sortOrder": 2,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Oil level",
        "description": "Check engine oil level using dipstick",
        "category": "Engine",
        "sortOrder": 3,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Oil condition",
        "description": "Assess oil color, smell, and contamination level",
        "category": "Engine",
        "sortOrder": 4,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Oil leaks",
        "description": "Inspect for oil leaks around engine, gaskets, and seals",
        "category": "Engine",
        "sortOrder": 5,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Coolant leaks",
        "description": "Check for coolant leaks around engine and cooling system",
        "category": "Engine",
        "sortOrder": 6,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Belt condition",
        "description": "Inspect drive belts for wear, cracks, and proper tension",
        "category": "Engine",
        "sortOrder": 7,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Hose condition",
        "description": "Check all engine hoses for cracks, leaks, and deterioration",
        "category": "Engine",
        "sortOrder": 8,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Engine mounts",
        "description": "Inspect engine mounts for wear, damage, and proper alignment",
        "category": "Engine",
        "sortOrder": 9,
        "isRequired": true,
        "allowsNotes": true
      }
    ]
  }'
```

## 3. Create Cooling System Template

```bash
curl -X POST http://localhost:3000/inspection-templates/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cooling System",
    "description": "Complete cooling system inspection including coolant, radiator, water pump, and related components",
    "category": "Mechanical",
    "sortOrder": 2,
    "templateItems": [
      {
        "name": "Coolant level",
        "description": "Check coolant level in radiator and overflow tank",
        "category": "Cooling",
        "sortOrder": 1,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Coolant condition",
        "description": "Assess coolant color, contamination, and freeze protection",
        "category": "Cooling",
        "sortOrder": 2,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Radiator condition",
        "description": "Inspect radiator for damage, corrosion, and debris",
        "category": "Cooling",
        "sortOrder": 3,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Water pump operation",
        "description": "Check water pump for leaks and proper operation",
        "category": "Cooling",
        "sortOrder": 4,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Thermostat operation",
        "description": "Test thermostat operation and temperature regulation",
        "category": "Cooling",
        "sortOrder": 5,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Cooling fan operation",
        "description": "Check electric cooling fan operation and temperature sensors",
        "category": "Cooling",
        "sortOrder": 6,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Hose condition",
        "description": "Inspect all cooling system hoses for damage and leaks",
        "category": "Cooling",
        "sortOrder": 7,
        "isRequired": true,
        "allowsNotes": true
      }
    ]
  }'
```

## 4. Create Steering & Suspension Template

```bash
curl -X POST http://localhost:3000/inspection-templates/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Steering & Suspension",
    "description": "Steering and suspension system inspection including steering components, shocks, and alignment",
    "category": "Mechanical",
    "sortOrder": 4,
    "templateItems": [
      {
        "name": "Steering wheel play",
        "description": "Check steering wheel for excessive play and responsiveness",
        "category": "Steering",
        "sortOrder": 1,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Power steering fluid",
        "description": "Check power steering fluid level and condition",
        "category": "Steering",
        "sortOrder": 2,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Tie rod ends",
        "description": "Inspect tie rod ends for wear and play",
        "category": "Steering",
        "sortOrder": 3,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Ball joints",
        "description": "Check ball joints for wear, play, and grease condition",
        "category": "Suspension",
        "sortOrder": 4,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Struts/Shocks",
        "description": "Inspect struts and shock absorbers for leaks and condition",
        "category": "Suspension",
        "sortOrder": 5,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Springs",
        "description": "Check coil springs and leaf springs for damage and sagging",
        "category": "Suspension",
        "sortOrder": 6,
        "isRequired": true,
        "allowsNotes": true
      },
      {
        "name": "Alignment check",
        "description": "Perform basic alignment check and measure toe settings",
        "category": "Suspension",
        "sortOrder": 7,
        "isRequired": true,
        "allowsNotes": true
      }
    ]
  }'
```

## 5. Get All Templates

```bash
curl -X GET "http://localhost:3000/inspection-templates/templates"
```

## 6. Get Available Templates

```bash
curl -X GET "http://localhost:3000/inspection-templates/templates/available"
```

## 7. Get Templates by Category

```bash
curl -X GET "http://localhost:3000/inspection-templates/templates/category/Mechanical"
```

## 8. Get Template by ID

```bash
# Replace TEMPLATE_ID with the actual ID from the create response
curl -X GET "http://localhost:3000/inspection-templates/templates/TEMPLATE_ID"
```

## 9. Assign Template to Work Order

```bash
curl -X POST http://localhost:3000/inspection-templates/work-orders/assign-template \
  -H "Content-Type: application/json" \
  -d '{
    "workOrderId": "WORK_ORDER_ID",
    "templateId": "TEMPLATE_ID",
    "inspectorId": "TECHNICIAN_ID",
    "notes": "Perform comprehensive electrical system inspection"
  }'
```

## 10. Get Work Order Inspections

```bash
curl -X GET "http://localhost:3000/inspection-templates/work-orders/inspections"
```

## 11. Update Checklist Item

```bash
curl -X PUT http://localhost:3000/inspection-templates/checklist-items/CHECKLIST_ITEM_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "YELLOW",
    "notes": "Battery terminals show some corrosion, needs cleaning",
    "requiresFollowUp": true
  }'
```

## 12. Complete Inspection

```bash
curl -X PUT http://localhost:3000/inspection-templates/inspections/INSPECTION_ID \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Inspection completed. Found 2 items requiring follow-up.",
    "isCompleted": true
  }'
```

## Notes

- Replace `WORK_ORDER_ID`, `TEMPLATE_ID`, `TECHNICIAN_ID`, `CHECKLIST_ITEM_ID`, and `INSPECTION_ID` with actual IDs from your database
- If you're using authentication, add the appropriate headers:
  ```bash
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
  ```
- The base URL assumes your server is running on `localhost:3000`. Adjust if needed.

