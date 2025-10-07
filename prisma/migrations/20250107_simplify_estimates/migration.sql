-- Migration: Simplify Estimates Architecture
-- Remove EstimateLabor and EstimatePart tables
-- Add estimate tracking directly to WorkOrderService and WorkOrderPart

-- Step 1: Add new fields to WorkOrderService
ALTER TABLE "WorkOrderService" ADD COLUMN IF NOT EXISTS "estimateId" TEXT;
ALTER TABLE "WorkOrderService" ADD COLUMN IF NOT EXISTS "estimateVersion" INTEGER;
ALTER TABLE "WorkOrderService" ADD COLUMN IF NOT EXISTS "customerApproved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "WorkOrderService" ADD COLUMN IF NOT EXISTS "customerRejected" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "WorkOrderService" ADD COLUMN IF NOT EXISTS "customerNotes" TEXT;
ALTER TABLE "WorkOrderService" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);
ALTER TABLE "WorkOrderService" ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP(3);

-- Step 2: Add new fields to WorkOrderPart
ALTER TABLE "WorkOrderPart" ADD COLUMN IF NOT EXISTS "estimateId" TEXT;
ALTER TABLE "WorkOrderPart" ADD COLUMN IF NOT EXISTS "estimateVersion" INTEGER;
ALTER TABLE "WorkOrderPart" ADD COLUMN IF NOT EXISTS "customerApproved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "WorkOrderPart" ADD COLUMN IF NOT EXISTS "customerRejected" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "WorkOrderPart" ADD COLUMN IF NOT EXISTS "customerNotes" TEXT;
ALTER TABLE "WorkOrderPart" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);
ALTER TABLE "WorkOrderPart" ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP(3);

-- Step 3: Update WorkOrderEstimate to add status tracking
-- Create enum for EstimateStatus if not exists
DO $$ BEGIN
    CREATE TYPE "EstimateStatus" AS ENUM (
        'DRAFT',
        'SENT',
        'APPROVED',
        'REJECTED',
        'EXPIRED',
        'SUPERSEDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "WorkOrderEstimate" ADD COLUMN IF NOT EXISTS "status" "EstimateStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "WorkOrderEstimate" ADD COLUMN IF NOT EXISTS "sentAt" TIMESTAMP(3);
ALTER TABLE "WorkOrderEstimate" ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP(3);
ALTER TABLE "WorkOrderEstimate" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;

-- Step 4: Update ServiceStatus enum to include ESTIMATED
-- First, check if the value already exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ESTIMATED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ServiceStatus')) THEN
        ALTER TYPE "ServiceStatus" ADD VALUE 'ESTIMATED';
    END IF;
END $$;

-- Step 5: Update PartSource enum if needed (already exists, no changes needed)

-- Step 6: Migrate existing data from EstimateLabor and EstimatePart (if any)
-- Link existing estimate items to work order items if they match
-- This is optional - depends on if you have production data

-- Step 7: Remove old estimate item tables (commented out for safety - uncomment when ready)
-- DROP TABLE IF EXISTS "EstimateLabor" CASCADE;
-- DROP TABLE IF EXISTS "EstimatePart" CASCADE;

-- Step 8: Add indexes for performance
CREATE INDEX IF NOT EXISTS "WorkOrderService_estimateId_idx" ON "WorkOrderService"("estimateId");
CREATE INDEX IF NOT EXISTS "WorkOrderService_estimateVersion_idx" ON "WorkOrderService"("estimateVersion");
CREATE INDEX IF NOT EXISTS "WorkOrderService_customerApproved_idx" ON "WorkOrderService"("customerApproved");

CREATE INDEX IF NOT EXISTS "WorkOrderPart_estimateId_idx" ON "WorkOrderPart"("estimateId");
CREATE INDEX IF NOT EXISTS "WorkOrderPart_estimateVersion_idx" ON "WorkOrderPart"("estimateVersion");
CREATE INDEX IF NOT EXISTS "WorkOrderPart_customerApproved_idx" ON "WorkOrderPart"("customerApproved");

CREATE INDEX IF NOT EXISTS "WorkOrderEstimate_status_idx" ON "WorkOrderEstimate"("status");
CREATE INDEX IF NOT EXISTS "WorkOrderEstimate_workOrderId_version_idx" ON "WorkOrderEstimate"("workOrderId", "version");

-- Step 9: Add comments for documentation
COMMENT ON COLUMN "WorkOrderService"."estimateId" IS 'Links to WorkOrderEstimate - which estimate included this service';
COMMENT ON COLUMN "WorkOrderService"."estimateVersion" IS 'Estimate version number for tracking revisions';
COMMENT ON COLUMN "WorkOrderService"."customerApproved" IS 'Whether customer approved this specific service';
COMMENT ON COLUMN "WorkOrderService"."customerRejected" IS 'Whether customer rejected this specific service';

COMMENT ON COLUMN "WorkOrderPart"."estimateId" IS 'Links to WorkOrderEstimate - which estimate included this part';
COMMENT ON COLUMN "WorkOrderPart"."estimateVersion" IS 'Estimate version number for tracking revisions';
COMMENT ON COLUMN "WorkOrderPart"."customerApproved" IS 'Whether customer approved this specific part';
COMMENT ON COLUMN "WorkOrderPart"."customerRejected" IS 'Whether customer rejected this specific part';
