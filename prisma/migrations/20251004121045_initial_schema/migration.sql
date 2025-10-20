-- CreateEnum
CREATE TYPE "public"."DayOfWeek" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('CUSTOMER', 'ADMIN', 'MANAGER', 'SERVICE_ADVISOR', 'INVENTORY_MANAGER', 'TECHNICIAN');

-- CreateEnum
CREATE TYPE "public"."WorkOrderStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'WAITING_FOR_PARTS', 'QC_PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."JobType" AS ENUM ('REPAIR', 'MAINTENANCE', 'INSPECTION', 'WARRANTY', 'RECALL');

-- CreateEnum
CREATE TYPE "public"."JobPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."JobSource" AS ENUM ('WALK_IN', 'APPOINTMENT', 'PHONE', 'ROADSIDE_ASSIST');

-- CreateEnum
CREATE TYPE "public"."WarrantyStatus" AS ENUM ('NONE', 'MANUFACTURER', 'EXTENDED');

-- CreateEnum
CREATE TYPE "public"."AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "public"."AppointmentPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."ChecklistStatus" AS ENUM ('GREEN', 'YELLOW', 'RED');

-- CreateEnum
CREATE TYPE "public"."TirePosition" AS ENUM ('LF', 'RF', 'LR', 'RR', 'SPARE');

-- CreateEnum
CREATE TYPE "public"."ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."ApprovalMethod" AS ENUM ('IN_PERSON', 'PHONE', 'EMAIL', 'APP', 'SMS', 'DIGITAL_SIGNATURE');

-- CreateEnum
CREATE TYPE "public"."PartSource" AS ENUM ('INVENTORY', 'SUPPLIER', 'CUSTOMER_SUPPLIED', 'WARRANTY', 'SALVAGE');

-- CreateEnum
CREATE TYPE "public"."ServiceDiscountType" AS ENUM ('FIXED', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "public"."AttachmentCategory" AS ENUM ('GENERAL', 'INVOICE', 'RECEIPT', 'WARRANTY', 'INSPECTION', 'BEFORE_AFTER', 'DIAGNOSTIC', 'MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'DIGITAL_WALLET', 'INSURANCE', 'WARRANTY');

-- CreateEnum
CREATE TYPE "public"."WorkflowStep" AS ENUM ('RECEIVED', 'INSPECTION', 'ESTIMATE', 'APPROVAL', 'REPAIR', 'QC', 'READY', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIAL_REFUND', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ServiceStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."UserProfile" (
    "id" TEXT NOT NULL,
    "supabaseUserId" UUID NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "profileImage" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "isRegistrationComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceAdvisor" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "employeeId" TEXT,
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceAdvisor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Technician" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "employeeId" TEXT,
    "specialization" TEXT,
    "certifications" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Technician_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventoryManager" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "employeeId" TEXT,
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Manager" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "employeeId" TEXT,
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Admin" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "employeeId" TEXT,
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT,
    "name" VARCHAR(255) NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vehicle" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER,
    "vin" TEXT,
    "licensePlate" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkOrder" (
    "id" TEXT NOT NULL,
    "workOrderNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "advisorId" TEXT,
    "status" "public"."WorkOrderStatus" NOT NULL,
    "jobType" "public"."JobType" NOT NULL DEFAULT 'REPAIR',
    "priority" "public"."JobPriority" NOT NULL DEFAULT 'NORMAL',
    "source" "public"."JobSource" NOT NULL DEFAULT 'WALK_IN',
    "complaint" TEXT,
    "odometerReading" INTEGER,
    "warrantyStatus" "public"."WarrantyStatus" NOT NULL DEFAULT 'NONE',
    "estimatedTotal" DECIMAL(10,2),
    "estimateNotes" TEXT,
    "estimateApproved" BOOLEAN NOT NULL DEFAULT false,
    "subtotalLabor" DECIMAL(10,2),
    "subtotalParts" DECIMAL(10,2),
    "discountAmount" DECIMAL(10,2),
    "taxAmount" DECIMAL(10,2),
    "totalAmount" DECIMAL(10,2),
    "paidAmount" DECIMAL(10,2) DEFAULT 0,
    "openedAt" TIMESTAMP(3),
    "promisedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "workflowStep" "public"."WorkflowStep" NOT NULL DEFAULT 'RECEIVED',
    "internalNotes" TEXT,
    "customerNotes" TEXT,
    "invoiceNumber" TEXT,
    "finalizedAt" TIMESTAMP(3),
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "warrantyClaimNumber" TEXT,
    "thirdPartyApprovalCode" TEXT,
    "campaignId" TEXT,
    "servicePackageId" TEXT,
    "customerSignature" TEXT,
    "customerFeedback" TEXT,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CannedService" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CannedService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CannedServiceLabor" (
    "id" TEXT NOT NULL,
    "cannedServiceId" TEXT NOT NULL,
    "laborCatalogId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,

    CONSTRAINT "CannedServiceLabor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CannedServicePartsCategory" (
    "id" TEXT NOT NULL,
    "cannedServiceId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "CannedServicePartsCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LaborCatalog" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "estimatedHours" DECIMAL(5,2) NOT NULL,
    "hourlyRate" DECIMAL(10,2) NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaborCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShopOperatingHours" (
    "id" TEXT NOT NULL,
    "dayOfWeek" "public"."DayOfWeek" NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "openTime" TEXT,
    "closeTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopOperatingHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShopCapacitySettings" (
    "id" TEXT NOT NULL,
    "appointmentsPerDay" INTEGER NOT NULL DEFAULT 6,
    "appointmentsPerTimeBlock" INTEGER NOT NULL DEFAULT 2,
    "timeBlockIntervalMinutes" INTEGER NOT NULL DEFAULT 30,
    "minimumNoticeHours" INTEGER NOT NULL DEFAULT 48,
    "futureSchedulingCutoffYears" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopCapacitySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventoryItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "partNumber" TEXT,
    "manufacturer" TEXT,
    "location" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "minStockLevel" INTEGER DEFAULT 0,
    "maxStockLevel" INTEGER DEFAULT 0,
    "reorderPoint" INTEGER DEFAULT 0,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "supplier" TEXT,
    "supplierPartNumber" TEXT,
    "core" BOOLEAN NOT NULL DEFAULT false,
    "corePrice" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Appointment" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "status" "public"."AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "public"."AppointmentPriority" NOT NULL DEFAULT 'NORMAL',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignedToId" TEXT,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AppointmentCannedService" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "cannedServiceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "AppointmentCannedService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InspectionTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InspectionTemplateItem" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "sortOrder" INTEGER,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "allowsNotes" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionTemplateItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkOrderInspection" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "templateId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WorkOrderInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InspectionChecklistItem" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "templateItemId" TEXT,
    "category" TEXT,
    "item" TEXT NOT NULL,
    "status" "public"."ChecklistStatus" NOT NULL,
    "notes" TEXT,
    "requiresFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InspectionChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TireInspection" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "position" "public"."TirePosition" NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "size" TEXT,
    "psi" INTEGER,
    "treadDepth" DECIMAL(4,2),
    "damageNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TireInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkOrderInspectionAttachment" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "description" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkOrderInspectionAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkOrderEstimate" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "laborAmount" DECIMAL(10,2),
    "partsAmount" DECIMAL(10,2),
    "taxAmount" DECIMAL(10,2),
    "discountAmount" DECIMAL(10,2),
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,

    CONSTRAINT "WorkOrderEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EstimateLabor" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "laborCatalogId" TEXT,
    "description" TEXT NOT NULL,
    "hours" DECIMAL(5,2) NOT NULL,
    "rate" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "customerApproved" BOOLEAN NOT NULL DEFAULT false,
    "customerNotes" TEXT,
    "cannedServiceId" TEXT,
    "serviceDiscountAmount" DECIMAL(10,2),
    "serviceDiscountType" "public"."ServiceDiscountType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstimateLabor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EstimatePart" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "source" "public"."PartSource" NOT NULL DEFAULT 'INVENTORY',
    "supplierName" TEXT,
    "warrantyInfo" TEXT,
    "notes" TEXT,
    "customerApproved" BOOLEAN NOT NULL DEFAULT false,
    "customerNotes" TEXT,
    "cannedServiceId" TEXT,
    "serviceDiscountAmount" DECIMAL(10,2),
    "serviceDiscountType" "public"."ServiceDiscountType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstimatePart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkOrderLabor" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "laborCatalogId" TEXT,
    "description" TEXT NOT NULL,
    "hours" DECIMAL(5,2) NOT NULL,
    "rate" DECIMAL(10,2) NOT NULL,
    "technicianId" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "notes" TEXT,
    "cannedServiceId" TEXT,
    "serviceDiscountAmount" DECIMAL(10,2),
    "serviceDiscountType" "public"."ServiceDiscountType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrderLabor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkOrderPart" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "source" "public"."PartSource" NOT NULL DEFAULT 'INVENTORY',
    "supplierName" TEXT,
    "supplierInvoice" TEXT,
    "warrantyInfo" TEXT,
    "notes" TEXT,
    "installedAt" TIMESTAMP(3),
    "installedById" TEXT,
    "cannedServiceId" TEXT,
    "serviceDiscountAmount" DECIMAL(10,2),
    "serviceDiscountType" "public"."ServiceDiscountType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrderPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkOrderApproval" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "estimateId" TEXT,
    "status" "public"."ApprovalStatus" NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "method" "public"."ApprovalMethod",
    "notes" TEXT,
    "customerSignature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrderApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkOrderQC" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "inspectorId" TEXT,
    "notes" TEXT,
    "qcDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reworkRequired" BOOLEAN NOT NULL DEFAULT false,
    "reworkNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrderQC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkOrderAttachment" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "description" TEXT,
    "category" "public"."AttachmentCategory" NOT NULL DEFAULT 'GENERAL',
    "uploadedById" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkOrderAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reference" TEXT,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedById" TEXT,
    "notes" TEXT,
    "refundAmount" DECIMAL(10,2),
    "refundReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkOrderService" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "cannedServiceId" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "status" "public"."ServiceStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrderService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventoryCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "InventoryCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_supabaseUserId_key" ON "public"."UserProfile"("supabaseUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceAdvisor_userProfileId_key" ON "public"."ServiceAdvisor"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceAdvisor_employeeId_key" ON "public"."ServiceAdvisor"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Technician_userProfileId_key" ON "public"."Technician"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Technician_employeeId_key" ON "public"."Technician"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryManager_userProfileId_key" ON "public"."InventoryManager"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryManager_employeeId_key" ON "public"."InventoryManager"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Manager_userProfileId_key" ON "public"."Manager"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Manager_employeeId_key" ON "public"."Manager"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userProfileId_key" ON "public"."Admin"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_employeeId_key" ON "public"."Admin"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userProfileId_key" ON "public"."Customer"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "public"."Vehicle"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrder_workOrderNumber_key" ON "public"."WorkOrder"("workOrderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrder_appointmentId_key" ON "public"."WorkOrder"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "CannedService_code_key" ON "public"."CannedService"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CannedServiceLabor_cannedServiceId_laborCatalogId_key" ON "public"."CannedServiceLabor"("cannedServiceId", "laborCatalogId");

-- CreateIndex
CREATE UNIQUE INDEX "CannedServicePartsCategory_cannedServiceId_categoryId_key" ON "public"."CannedServicePartsCategory"("cannedServiceId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "LaborCatalog_code_key" ON "public"."LaborCatalog"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ShopOperatingHours_dayOfWeek_key" ON "public"."ShopOperatingHours"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_sku_key" ON "public"."InventoryItem"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_partNumber_key" ON "public"."InventoryItem"("partNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentCannedService_appointmentId_cannedServiceId_key" ON "public"."AppointmentCannedService"("appointmentId", "cannedServiceId");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionTemplate_name_key" ON "public"."InspectionTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionTemplateItem_templateId_name_key" ON "public"."InspectionTemplateItem"("templateId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionChecklistItem_inspectionId_templateItemId_key" ON "public"."InspectionChecklistItem"("inspectionId", "templateItemId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryCategory_name_key" ON "public"."InventoryCategory"("name");

-- AddForeignKey
ALTER TABLE "public"."ServiceAdvisor" ADD CONSTRAINT "ServiceAdvisor_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "public"."UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Technician" ADD CONSTRAINT "Technician_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "public"."UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryManager" ADD CONSTRAINT "InventoryManager_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "public"."UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Manager" ADD CONSTRAINT "Manager_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "public"."UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Admin" ADD CONSTRAINT "Admin_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "public"."UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "public"."UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vehicle" ADD CONSTRAINT "Vehicle_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrder" ADD CONSTRAINT "WorkOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrder" ADD CONSTRAINT "WorkOrder_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrder" ADD CONSTRAINT "WorkOrder_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrder" ADD CONSTRAINT "WorkOrder_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "public"."ServiceAdvisor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CannedServiceLabor" ADD CONSTRAINT "CannedServiceLabor_cannedServiceId_fkey" FOREIGN KEY ("cannedServiceId") REFERENCES "public"."CannedService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CannedServiceLabor" ADD CONSTRAINT "CannedServiceLabor_laborCatalogId_fkey" FOREIGN KEY ("laborCatalogId") REFERENCES "public"."LaborCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CannedServicePartsCategory" ADD CONSTRAINT "CannedServicePartsCategory_cannedServiceId_fkey" FOREIGN KEY ("cannedServiceId") REFERENCES "public"."CannedService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CannedServicePartsCategory" ADD CONSTRAINT "CannedServicePartsCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."InventoryCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryItem" ADD CONSTRAINT "InventoryItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."InventoryCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."ServiceAdvisor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AppointmentCannedService" ADD CONSTRAINT "AppointmentCannedService_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AppointmentCannedService" ADD CONSTRAINT "AppointmentCannedService_cannedServiceId_fkey" FOREIGN KEY ("cannedServiceId") REFERENCES "public"."CannedService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InspectionTemplateItem" ADD CONSTRAINT "InspectionTemplateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."InspectionTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderInspection" ADD CONSTRAINT "WorkOrderInspection_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "public"."WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderInspection" ADD CONSTRAINT "WorkOrderInspection_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "public"."Technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderInspection" ADD CONSTRAINT "WorkOrderInspection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."InspectionTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InspectionChecklistItem" ADD CONSTRAINT "InspectionChecklistItem_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "public"."WorkOrderInspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InspectionChecklistItem" ADD CONSTRAINT "InspectionChecklistItem_templateItemId_fkey" FOREIGN KEY ("templateItemId") REFERENCES "public"."InspectionTemplateItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TireInspection" ADD CONSTRAINT "TireInspection_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "public"."WorkOrderInspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderInspectionAttachment" ADD CONSTRAINT "WorkOrderInspectionAttachment_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "public"."WorkOrderInspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderEstimate" ADD CONSTRAINT "WorkOrderEstimate_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "public"."WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderEstimate" ADD CONSTRAINT "WorkOrderEstimate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."ServiceAdvisor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderEstimate" ADD CONSTRAINT "WorkOrderEstimate_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."ServiceAdvisor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EstimateLabor" ADD CONSTRAINT "EstimateLabor_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "public"."WorkOrderEstimate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EstimateLabor" ADD CONSTRAINT "EstimateLabor_laborCatalogId_fkey" FOREIGN KEY ("laborCatalogId") REFERENCES "public"."LaborCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EstimatePart" ADD CONSTRAINT "EstimatePart_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "public"."WorkOrderEstimate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EstimatePart" ADD CONSTRAINT "EstimatePart_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "public"."InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderLabor" ADD CONSTRAINT "WorkOrderLabor_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "public"."WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderLabor" ADD CONSTRAINT "WorkOrderLabor_laborCatalogId_fkey" FOREIGN KEY ("laborCatalogId") REFERENCES "public"."LaborCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderLabor" ADD CONSTRAINT "WorkOrderLabor_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderPart" ADD CONSTRAINT "WorkOrderPart_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "public"."WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderPart" ADD CONSTRAINT "WorkOrderPart_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "public"."InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderPart" ADD CONSTRAINT "WorkOrderPart_installedById_fkey" FOREIGN KEY ("installedById") REFERENCES "public"."Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderApproval" ADD CONSTRAINT "WorkOrderApproval_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "public"."WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderApproval" ADD CONSTRAINT "WorkOrderApproval_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "public"."WorkOrderEstimate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderApproval" ADD CONSTRAINT "WorkOrderApproval_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."ServiceAdvisor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderQC" ADD CONSTRAINT "WorkOrderQC_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "public"."WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderQC" ADD CONSTRAINT "WorkOrderQC_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "public"."Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderAttachment" ADD CONSTRAINT "WorkOrderAttachment_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "public"."WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderAttachment" ADD CONSTRAINT "WorkOrderAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."InventoryManager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "public"."WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "public"."ServiceAdvisor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderService" ADD CONSTRAINT "WorkOrderService_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "public"."WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderService" ADD CONSTRAINT "WorkOrderService_cannedServiceId_fkey" FOREIGN KEY ("cannedServiceId") REFERENCES "public"."CannedService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
