import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function migrateToServicePricing() {
  console.log('🔄 Starting migration to service-based pricing...\n');

  try {
    // Step 0: Regenerate Prisma client to match current database
    console.log('📝 Step 0: Regenerating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Step 0 complete\n');
    // Step 1: Add new columns and make old ones nullable
    console.log('📝 Step 1: Adding new columns...');
    
    // Add columns to WorkOrderService
    await prisma.$executeRaw`
      ALTER TABLE "WorkOrderService"
      ADD COLUMN IF NOT EXISTS "unitPrice" DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "subtotal" DECIMAL(10,2) DEFAULT 0;
    `;
    
    // Make cannedServiceId nullable in WorkOrderService
    await prisma.$executeRaw`
      ALTER TABLE "WorkOrderService"
      ALTER COLUMN "cannedServiceId" DROP NOT NULL;
    `;
    
    // Add serviceId to WorkOrderLabor (nullable for now)
    await prisma.$executeRaw`
      ALTER TABLE "WorkOrderLabor"
      ADD COLUMN IF NOT EXISTS "serviceId" TEXT;
    `;
    
    // Add new tracking fields to WorkOrderLabor
    await prisma.$executeRaw`
      ALTER TABLE "WorkOrderLabor"
      ADD COLUMN IF NOT EXISTS "estimatedMinutes" INTEGER,
      ADD COLUMN IF NOT EXISTS "actualMinutes" INTEGER;
    `;
    
    // Add discount fields to WorkOrder
    await prisma.$executeRaw`
      ALTER TABLE "WorkOrder"
      ADD COLUMN IF NOT EXISTS "subtotalServices" DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS "subtotal" DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS "discountType" TEXT,
      ADD COLUMN IF NOT EXISTS "discountReason" TEXT;
    `;
    
    // Rename subtotalLabor to subtotalServices if it exists
    await prisma.$executeRaw`
      ALTER TABLE "WorkOrder"
      DROP COLUMN IF EXISTS "subtotalLabor";
    `;
    
    console.log('✅ Step 1 complete\n');

    // Step 2: Migrate WorkOrderService data
    console.log('📝 Step 2: Migrating WorkOrderService pricing...');
    
    // Get all services using raw SQL
    const services = await prisma.$queryRaw<Array<{
      id: string;
      workOrderId: string;
      cannedServiceId: string | null;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }>>`SELECT * FROM "WorkOrderService"`;
    
    for (const service of services) {
      let unitPrice = 0;
      
      // Get labor for this work order using raw SQL
      const workOrderLabor = await prisma.$queryRaw<Array<{
        price: number | null;
        subtotal: number | null;
      }>>`
        SELECT "price", "subtotal" 
        FROM "WorkOrderLabor" 
        WHERE "workOrderId" = ${service.workOrderId}
      `;
      
      // If service has associated labor with prices, sum them up
      if (workOrderLabor.length > 0) {
        const laborWithPrices = workOrderLabor.filter(l => l.price && l.subtotal);
        if (laborWithPrices.length > 0) {
          unitPrice = laborWithPrices.reduce((sum: number, labor) => 
            sum + Number(labor.subtotal), 0
          );
        }
      }
      
      // If no labor prices, use canned service price
      if (unitPrice === 0 && service.cannedServiceId) {
        const cannedService = await prisma.$queryRaw<Array<{price: number}>>`
          SELECT "price" FROM "CannedService" WHERE "id" = ${service.cannedServiceId}
        `;
        if (cannedService.length > 0) {
          unitPrice = Number(cannedService[0].price);
        }
      }
      
      // If still no price, set a default or skip
      if (unitPrice === 0) {
        console.log(`  ⚠️  Service ${service.id} has no price, setting to 0...`);
      }
      
      const subtotal = unitPrice * service.quantity;
      
      await prisma.$executeRaw`
        UPDATE "WorkOrderService"
        SET "unitPrice" = ${unitPrice},
            "subtotal" = ${subtotal}
        WHERE "id" = ${service.id}
      `;
      
      console.log(`  ✓ Updated service ${service.id}: Rs. ${unitPrice} × ${service.quantity} = Rs. ${subtotal}`);
    }
    
    console.log('✅ Step 2 complete\n');

    // Step 3: Link WorkOrderLabor to WorkOrderService
    console.log('📝 Step 3: Linking labor to services...');
    
    const allLabor = await prisma.$queryRaw<Array<{
      id: string;
      workOrderId: string;
      cannedServiceId: string | null;
      estimatedHours: number | null;
      startTime: Date | null;
      endTime: Date | null;
      subtotal: number | null;
      status: string;
    }>>`SELECT * FROM "WorkOrderLabor"`;
    
    for (const labor of allLabor) {
      // If labor has cannedServiceId, find matching service
      let serviceId = null;
      
      // Get services for this work order using raw SQL
      const workOrderServices = await prisma.$queryRaw<Array<{
        id: string;
        cannedServiceId: string | null;
      }>>`
        SELECT "id", "cannedServiceId" 
        FROM "WorkOrderService" 
        WHERE "workOrderId" = ${labor.workOrderId}
      `;
      
      if (labor.cannedServiceId) {
        const matchingService = workOrderServices.find(
          s => s.cannedServiceId === labor.cannedServiceId
        );
        if (matchingService) {
          serviceId = matchingService.id;
        }
      }
      
      // If no match, link to first service in work order
      if (!serviceId && workOrderServices.length > 0) {
        serviceId = workOrderServices[0].id;
      }
      
      // If still no service, create a default one using raw SQL
      if (!serviceId) {
        const serviceIdResult = await prisma.$queryRaw<Array<{id: string}>>`
          INSERT INTO "WorkOrderService" 
          ("id", "workOrderId", "description", "quantity", "unitPrice", "subtotal", "status", "createdAt", "updatedAt")
          VALUES (
            gen_random_uuid()::text,
            ${labor.workOrderId},
            'Labor Services',
            1,
            ${(labor as any).subtotal || 0},
            ${(labor as any).subtotal || 0},
            ${labor.status}::text,
            NOW(),
            NOW()
          )
          RETURNING "id"
        `;
        serviceId = serviceIdResult[0].id;
        console.log(`  ✓ Created new service for orphan labor ${labor.id}`);
      }
      
      // Update labor with serviceId and time conversion
      const estimatedMinutes = labor.estimatedHours 
        ? Math.round(Number(labor.estimatedHours) * 60) 
        : null;
      
      let actualMinutes = null;
      if (labor.startTime && labor.endTime) {
        actualMinutes = Math.round(
          (new Date(labor.endTime).getTime() - new Date(labor.startTime).getTime()) / (1000 * 60)
        );
      }
      
      await prisma.$executeRaw`
        UPDATE "WorkOrderLabor"
        SET "serviceId" = ${serviceId},
            "estimatedMinutes" = ${estimatedMinutes},
            "actualMinutes" = ${actualMinutes}
        WHERE "id" = ${labor.id}
      `;
    }
    
    console.log(`✅ Step 3 complete - linked ${allLabor.length} labor items to services\n`);

    // Step 4: Calculate WorkOrder totals
    console.log('📝 Step 4: Calculating work order totals...');
    
    const workOrders = await prisma.$queryRaw<Array<{
      id: string;
      workOrderNumber: string;
    }>>`SELECT "id", "workOrderNumber" FROM "WorkOrder"`;
    
    for (const workOrder of workOrders) {
      // Get services for this work order
      const services = await prisma.$queryRaw<Array<{subtotal: number}>>`
        SELECT "subtotal" FROM "WorkOrderService" WHERE "workOrderId" = ${workOrder.id}
      `;
      
      const subtotalServices = services.reduce(
        (sum: number, service) => sum + Number(service.subtotal || 0), 0
      );
      
      // Get parts for this work order
      const parts = await prisma.$queryRaw<Array<{subtotal: number}>>`
        SELECT "subtotal" FROM "WorkOrderPart" WHERE "workOrderId" = ${workOrder.id}
      `;
      
      const subtotalParts = parts.reduce(
        (sum: number, part) => sum + Number(part.subtotal || 0), 0
      );
      
      const subtotal = subtotalServices + subtotalParts;
      
      await prisma.$executeRaw`
        UPDATE "WorkOrder"
        SET "subtotalServices" = ${subtotalServices},
            "subtotal" = ${subtotal}
        WHERE "id" = ${workOrder.id}
      `;
      
      console.log(`  ✓ Work Order ${workOrder.workOrderNumber}: Services Rs. ${subtotalServices} + Parts Rs. ${subtotalParts} = Rs. ${subtotal}`);
    }
    
    console.log('✅ Step 4 complete\n');

    // Step 5: Convert LaborCatalog hours to minutes
    console.log('📝 Step 5: Converting LaborCatalog to minutes...');
    
    await prisma.$executeRaw`
      ALTER TABLE "LaborCatalog"
      ADD COLUMN IF NOT EXISTS "estimatedMinutes" INTEGER;
    `;
    
    await prisma.$executeRaw`
      UPDATE "LaborCatalog"
      SET "estimatedMinutes" = CASE 
        WHEN "estimatedHours" IS NOT NULL THEN ROUND("estimatedHours" * 60)
        ELSE NULL
      END
      WHERE "estimatedMinutes" IS NULL;
    `;
    
    console.log('✅ Step 5 complete\n');

    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('👉 Next steps:');
    console.log('   1. Review the migrated data');
    console.log('   2. Run: npx prisma db push');
    console.log('   3. This will:');
    console.log('      - Remove price/quantity/subtotal from WorkOrderLabor');
    console.log('      - Remove price from LaborCatalog');
    console.log('      - Remove estimatedHours from LaborCatalog and WorkOrderLabor');
    console.log('      - Remove discount fields from WorkOrderLabor and WorkOrderPart');
    console.log('      - Make serviceId required in WorkOrderLabor');
    console.log('');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateToServicePricing()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
