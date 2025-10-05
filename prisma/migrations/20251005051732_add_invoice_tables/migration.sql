-- CreateEnum
CREATE TYPE "public"."ServiceRuleType" AS ENUM ('MILEAGE_BASED', 'TIME_BASED', 'CONDITION_BASED', 'DEPENDENCY_BASED', 'LIFECYCLE_BASED');

-- CreateEnum
CREATE TYPE "public"."ServicePriority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL');

-- CreateEnum
CREATE TYPE "public"."ServiceSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "public"."RecommendationStatus" AS ENUM ('PENDING', 'SCHEDULED', 'DISMISSED', 'COMPLETED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "public"."DrivingCondition" AS ENUM ('NORMAL', 'SEVERE', 'OFFROAD', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "public"."ServiceInterval" AS ENUM ('STANDARD', 'SEVERE', 'EXTENDED');

-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."LineItemType" AS ENUM ('SERVICE', 'LABOR', 'PART', 'DISCOUNT', 'TAX', 'OTHER');

-- CreateTable
CREATE TABLE "public"."ServiceRule" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ruleType" "public"."ServiceRuleType" NOT NULL,
    "priority" "public"."ServicePriority" NOT NULL DEFAULT 'MEDIUM',
    "severity" "public"."ServiceSeverity" NOT NULL DEFAULT 'MEDIUM',
    "mileageInterval" INTEGER,
    "timeIntervalMonths" INTEGER,
    "timeIntervalDays" INTEGER,
    "serviceType" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dependsOn" TEXT[],
    "conflictsWith" TEXT[],
    "canBundle" BOOLEAN NOT NULL DEFAULT false,
    "applicableVehicleTypes" TEXT[],
    "applicableDrivingConditions" TEXT[],
    "severeConditionMultiplier" DECIMAL(3,2),
    "offroadMultiplier" DECIMAL(3,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceRecommendation" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "status" "public"."RecommendationStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "public"."ServicePriority" NOT NULL,
    "severity" "public"."ServiceSeverity" NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentMileage" INTEGER,
    "dueMileage" INTEGER,
    "dueDate" TIMESTAMP(3),
    "lastServiceDate" TIMESTAMP(3),
    "lastServiceMileage" INTEGER,
    "reason" TEXT NOT NULL,
    "estimatedCost" DECIMAL(8,2),
    "estimatedDuration" INTEGER,
    "dismissedAt" TIMESTAMP(3),
    "dismissedReason" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VehicleServiceHistory" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "serviceMileage" INTEGER NOT NULL,
    "provider" TEXT,
    "cost" DECIMAL(8,2),
    "notes" TEXT,
    "workOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleServiceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VehicleProfile" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "drivingCondition" "public"."DrivingCondition" NOT NULL DEFAULT 'NORMAL',
    "averageDailyMileage" INTEGER,
    "primaryUse" TEXT,
    "engineType" TEXT,
    "transmissionType" TEXT,
    "fuelType" TEXT,
    "preferredServiceInterval" "public"."ServiceInterval" NOT NULL DEFAULT 'STANDARD',
    "notificationPreferences" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MileageEntry" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "mileage" INTEGER NOT NULL,
    "fuelUsed" DECIMAL(6,2),
    "distance" INTEGER,
    "efficiency" DECIMAL(4,2),
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "locationName" TEXT,
    "notes" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedById" TEXT,

    CONSTRAINT "MileageEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VehicleMileage" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "currentMileage" INTEGER NOT NULL DEFAULT 0,
    "totalDistance" INTEGER NOT NULL DEFAULT 0,
    "totalFuelUsed" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "averageEfficiency" DECIMAL(4,2),
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLocationLat" DECIMAL(10,8),
    "lastLocationLng" DECIMAL(11,8),
    "lastLocationName" TEXT,

    CONSTRAINT "VehicleMileage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "status" "public"."InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotalServices" DECIMAL(10,2) DEFAULT 0,
    "subtotalLabor" DECIMAL(10,2) DEFAULT 0,
    "subtotalParts" DECIMAL(10,2) DEFAULT 0,
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "balanceDue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "terms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InvoiceLineItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "type" "public"."LineItemType" NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "workOrderServiceId" TEXT,
    "workOrderLaborId" TEXT,
    "workOrderPartId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_MileageEntryToVehicleMileage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MileageEntryToVehicleMileage_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRule_code_key" ON "public"."ServiceRule"("code");

-- CreateIndex
CREATE INDEX "ServiceRecommendation_vehicleId_status_idx" ON "public"."ServiceRecommendation"("vehicleId", "status");

-- CreateIndex
CREATE INDEX "ServiceRecommendation_ruleId_status_idx" ON "public"."ServiceRecommendation"("ruleId", "status");

-- CreateIndex
CREATE INDEX "ServiceRecommendation_dueDate_idx" ON "public"."ServiceRecommendation"("dueDate");

-- CreateIndex
CREATE INDEX "ServiceRecommendation_dueMileage_idx" ON "public"."ServiceRecommendation"("dueMileage");

-- CreateIndex
CREATE INDEX "VehicleServiceHistory_vehicleId_serviceType_serviceDate_idx" ON "public"."VehicleServiceHistory"("vehicleId", "serviceType", "serviceDate");

-- CreateIndex
CREATE INDEX "VehicleServiceHistory_vehicleId_serviceMileage_idx" ON "public"."VehicleServiceHistory"("vehicleId", "serviceMileage");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleProfile_vehicleId_key" ON "public"."VehicleProfile"("vehicleId");

-- CreateIndex
CREATE INDEX "MileageEntry_vehicleId_recordedAt_idx" ON "public"."MileageEntry"("vehicleId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleMileage_vehicleId_key" ON "public"."VehicleMileage"("vehicleId");

-- CreateIndex
CREATE INDEX "VehicleMileage_vehicleId_idx" ON "public"."VehicleMileage"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "public"."Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_workOrderId_key" ON "public"."Invoice"("workOrderId");

-- CreateIndex
CREATE INDEX "Invoice_workOrderId_idx" ON "public"."Invoice"("workOrderId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "public"."Invoice"("status");

-- CreateIndex
CREATE INDEX "InvoiceLineItem_invoiceId_idx" ON "public"."InvoiceLineItem"("invoiceId");

-- CreateIndex
CREATE INDEX "_MileageEntryToVehicleMileage_B_index" ON "public"."_MileageEntryToVehicleMileage"("B");

-- AddForeignKey
ALTER TABLE "public"."ServiceRecommendation" ADD CONSTRAINT "ServiceRecommendation_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceRecommendation" ADD CONSTRAINT "ServiceRecommendation_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "public"."ServiceRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleServiceHistory" ADD CONSTRAINT "VehicleServiceHistory_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleServiceHistory" ADD CONSTRAINT "VehicleServiceHistory_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "public"."WorkOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleProfile" ADD CONSTRAINT "VehicleProfile_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MileageEntry" ADD CONSTRAINT "MileageEntry_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MileageEntry" ADD CONSTRAINT "MileageEntry_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "public"."UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleMileage" ADD CONSTRAINT "VehicleMileage_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "public"."WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_MileageEntryToVehicleMileage" ADD CONSTRAINT "_MileageEntryToVehicleMileage_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."MileageEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_MileageEntryToVehicleMileage" ADD CONSTRAINT "_MileageEntryToVehicleMileage_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."VehicleMileage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
