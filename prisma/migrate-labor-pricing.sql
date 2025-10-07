-- Migration script to convert from hours×rate to fixed price model
-- Run this BEFORE doing prisma db push

-- Step 1: Add new columns with default values
ALTER TABLE "LaborCatalog" 
  ADD COLUMN IF NOT EXISTS "price" DECIMAL(10,2) DEFAULT 0;

ALTER TABLE "LaborCatalog" 
  ALTER COLUMN "estimatedHours" DROP NOT NULL,
  ALTER COLUMN "hourlyRate" DROP NOT NULL;

-- Step 2: Migrate LaborCatalog data
-- Set price = hourlyRate * estimatedHours (or just hourlyRate if estimatedHours = 0)
UPDATE "LaborCatalog" 
SET "price" = CASE 
  WHEN "estimatedHours" > 0 THEN "hourlyRate" * "estimatedHours"
  ELSE "hourlyRate"
END
WHERE "price" = 0;

-- Step 3: Add new columns to WorkOrderLabor
ALTER TABLE "WorkOrderLabor" 
  ADD COLUMN IF NOT EXISTS "price" DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "quantity" INTEGER DEFAULT 1;

-- Step 4: Migrate WorkOrderLabor data
-- Set price = rate * hours, quantity = 1
UPDATE "WorkOrderLabor" 
SET "price" = "rate" * "hours",
    "quantity" = 1
WHERE "price" = 0;

-- Rename hours to estimatedHours for WorkOrderLabor
ALTER TABLE "WorkOrderLabor" 
  ADD COLUMN IF NOT EXISTS "estimatedHours" DECIMAL(5,2);

UPDATE "WorkOrderLabor" 
SET "estimatedHours" = "hours"
WHERE "estimatedHours" IS NULL;

-- Step 5: Add new columns to EstimateLabor
ALTER TABLE "EstimateLabor" 
  ADD COLUMN IF NOT EXISTS "price" DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "quantity" INTEGER DEFAULT 1;

-- Step 6: Migrate EstimateLabor data
-- Set price = rate * hours, quantity = 1
UPDATE "EstimateLabor" 
SET "price" = "rate" * "hours",
    "quantity" = 1
WHERE "price" = 0;

-- Rename hours to estimatedHours for EstimateLabor
ALTER TABLE "EstimateLabor" 
  ADD COLUMN IF NOT EXISTS "estimatedHours" DECIMAL(5,2);

UPDATE "EstimateLabor" 
SET "estimatedHours" = "hours"
WHERE "estimatedHours" IS NULL;

-- Step 7: Now you can run: npx prisma db push
-- It will drop the old hours/rate columns and keep our new price/quantity columns
