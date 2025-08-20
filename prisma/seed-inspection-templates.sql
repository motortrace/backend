-- Inspection Templates Seed Data
-- Run this after creating the inspection template tables

-- Insert Inspection Templates
INSERT INTO "InspectionTemplate" (id, name, description, category, "isActive", "sortOrder", "createdAt", "updatedAt") VALUES
('template_engine_mechanical', 'Engine (Mechanical Condition)', 'Comprehensive mechanical inspection of engine components including oil, coolant, belts, and mounts', 'Mechanical', true, 1, NOW(), NOW()),
('template_cooling_system', 'Cooling System', 'Complete cooling system inspection including coolant, radiator, water pump, and related components', 'Mechanical', true, 2, NOW(), NOW()),
('template_electrical_system', 'Electrical System', 'Electrical system inspection covering battery, alternator, starter, lights, and wiring', 'Electrical', true, 3, NOW(), NOW()),
('template_steering_suspension', 'Steering & Suspension', 'Steering and suspension system inspection including steering components, shocks, and alignment', 'Mechanical', true, 4, NOW(), NOW());

-- Insert Inspection Template Items for Engine (Mechanical Condition)
INSERT INTO "InspectionTemplateItem" (id, "templateId", name, description, category, "sortOrder", "isRequired", "allowsNotes", "createdAt", "updatedAt") VALUES
('item_engine_01', 'template_engine_mechanical', 'Oil in air cleaner', 'Check for oil contamination in the air cleaner/filter housing', 'Engine', 1, true, true, NOW(), NOW()),
('item_engine_02', 'template_engine_mechanical', 'Water in oil', 'Check for water contamination in engine oil (milky appearance)', 'Engine', 2, true, true, NOW(), NOW()),
('item_engine_03', 'template_engine_mechanical', 'Oil level', 'Check engine oil level using dipstick', 'Engine', 3, true, true, NOW(), NOW()),
('item_engine_04', 'template_engine_mechanical', 'Oil condition', 'Assess oil color, smell, and contamination level', 'Engine', 4, true, true, NOW(), NOW()),
('item_engine_05', 'template_engine_mechanical', 'Oil leaks', 'Inspect for oil leaks around engine, gaskets, and seals', 'Engine', 5, true, true, NOW(), NOW()),
('item_engine_06', 'template_engine_mechanical', 'Coolant leaks', 'Check for coolant leaks around engine and cooling system', 'Engine', 6, true, true, NOW(), NOW()),
('item_engine_07', 'template_engine_mechanical', 'Belt condition', 'Inspect drive belts for wear, cracks, and proper tension', 'Engine', 7, true, true, NOW(), NOW()),
('item_engine_08', 'template_engine_mechanical', 'Hose condition', 'Check all engine hoses for cracks, leaks, and deterioration', 'Engine', 8, true, true, NOW(), NOW()),
('item_engine_09', 'template_engine_mechanical', 'Engine mounts', 'Inspect engine mounts for wear, damage, and proper alignment', 'Engine', 9, true, true, NOW(), NOW());

-- Insert Inspection Template Items for Cooling System
INSERT INTO "InspectionTemplateItem" (id, "templateId", name, description, category, "sortOrder", "isRequired", "allowsNotes", "createdAt", "updatedAt") VALUES
('item_cooling_01', 'template_cooling_system', 'Coolant level', 'Check coolant level in radiator and overflow tank', 'Cooling', 1, true, true, NOW(), NOW()),
('item_cooling_02', 'template_cooling_system', 'Coolant condition', 'Assess coolant color, contamination, and freeze protection', 'Cooling', 2, true, true, NOW(), NOW()),
('item_cooling_03', 'template_cooling_system', 'Radiator condition', 'Inspect radiator for damage, corrosion, and debris', 'Cooling', 3, true, true, NOW(), NOW()),
('item_cooling_04', 'template_cooling_system', 'Water pump operation', 'Check water pump for leaks and proper operation', 'Cooling', 4, true, true, NOW(), NOW()),
('item_cooling_05', 'template_cooling_system', 'Thermostat operation', 'Test thermostat operation and temperature regulation', 'Cooling', 5, true, true, NOW(), NOW()),
('item_cooling_06', 'template_cooling_system', 'Cooling fan operation', 'Check electric cooling fan operation and temperature sensors', 'Cooling', 6, true, true, NOW(), NOW()),
('item_cooling_07', 'template_cooling_system', 'Hose condition', 'Inspect all cooling system hoses for damage and leaks', 'Cooling', 7, true, true, NOW(), NOW());

-- Insert Inspection Template Items for Electrical System
INSERT INTO "InspectionTemplateItem" (id, "templateId", name, description, category, "sortOrder", "isRequired", "allowsNotes", "createdAt", "updatedAt") VALUES
('item_electrical_01', 'template_electrical_system', 'Battery condition', 'Check battery voltage, charge level, and overall condition', 'Electrical', 1, true, true, NOW(), NOW()),
('item_electrical_02', 'template_electrical_system', 'Battery terminals', 'Inspect battery terminals for corrosion and tight connections', 'Electrical', 2, true, true, NOW(), NOW()),
('item_electrical_03', 'template_electrical_system', 'Alternator output', 'Test alternator output voltage and charging system', 'Electrical', 3, true, true, NOW(), NOW()),
('item_electrical_04', 'template_electrical_system', 'Starter operation', 'Test starter motor operation and engagement', 'Electrical', 4, true, true, NOW(), NOW()),
('item_electrical_05', 'template_electrical_system', 'Lights operation', 'Check all exterior and interior lights for proper operation', 'Electrical', 5, true, true, NOW(), NOW()),
('item_electrical_06', 'template_electrical_system', 'Warning lights', 'Check dashboard warning lights and instrument cluster', 'Electrical', 6, true, true, NOW(), NOW()),
('item_electrical_07', 'template_electrical_system', 'Wiring condition', 'Inspect visible wiring for damage, corrosion, and proper routing', 'Electrical', 7, true, true, NOW(), NOW());

-- Insert Inspection Template Items for Steering & Suspension
INSERT INTO "InspectionTemplateItem" (id, "templateId", name, description, category, "sortOrder", "isRequired", "allowsNotes", "createdAt", "updatedAt") VALUES
('item_steering_01', 'template_steering_suspension', 'Steering wheel play', 'Check steering wheel for excessive play and responsiveness', 'Steering', 1, true, true, NOW(), NOW()),
('item_steering_02', 'template_steering_suspension', 'Power steering fluid', 'Check power steering fluid level and condition', 'Steering', 2, true, true, NOW(), NOW()),
('item_steering_03', 'template_steering_suspension', 'Tie rod ends', 'Inspect tie rod ends for wear and play', 'Steering', 3, true, true, NOW(), NOW()),
('item_steering_04', 'template_steering_suspension', 'Ball joints', 'Check ball joints for wear, play, and grease condition', 'Suspension', 4, true, true, NOW(), NOW()),
('item_steering_05', 'template_steering_suspension', 'Struts/Shocks', 'Inspect struts and shock absorbers for leaks and condition', 'Suspension', 5, true, true, NOW(), NOW()),
('item_steering_06', 'template_steering_suspension', 'Springs', 'Check coil springs and leaf springs for damage and sagging', 'Suspension', 6, true, true, NOW(), NOW()),
('item_steering_07', 'template_steering_suspension', 'Alignment check', 'Perform basic alignment check and measure toe settings', 'Suspension', 7, true, true, NOW(), NOW());
