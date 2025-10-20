import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateLaborPricing() {
  console.log('🔄 Starting labor pricing migration...');

  try {
    // Step 1: Add price column to LaborCatalog with default
    console.log('📝 Adding price column to LaborCatalog...');
    await prisma.$executeRaw`
      ALTER TABLE "LaborCatalog" 
      ADD COLUMN IF NOT EXISTS "price" DECIMAL(10,2) DEFAULT 0
    `;

    // Step 2: Make estimatedHours and hourlyRate nullable
    console.log('📝 Making old columns nullable...');
    await prisma.$executeRaw`
      ALTER TABLE "LaborCatalog" 
      ALTER COLUMN "estimatedHours" DROP NOT NULL
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "LaborCatalog" 
      ALTER COLUMN "hourlyRate" DROP NOT NULL
    `;

    // Step 3: Migrate LaborCatalog data (price = hourlyRate * estimatedHours)
    console.log('📝 Migrating LaborCatalog data...');
    await prisma.$executeRaw`
      UPDATE "LaborCatalog" 
      SET "price" = CASE 
        WHEN "estimatedHours" > 0 THEN "hourlyRate" * "estimatedHours"
        ELSE "hourlyRate"
      END
      WHERE "price" = 0
    `;

    // Step 4: Add new columns to WorkOrderLabor
    console.log('📝 Adding columns to WorkOrderLabor...');
    await prisma.$executeRaw`
      ALTER TABLE "WorkOrderLabor" 
      ADD COLUMN IF NOT EXISTS "price" DECIMAL(10,2) DEFAULT 0
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "WorkOrderLabor" 
      ADD COLUMN IF NOT EXISTS "quantity" INTEGER DEFAULT 1
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "WorkOrderLabor" 
      ADD COLUMN IF NOT EXISTS "estimatedHours" DECIMAL(5,2)
    `;

    // Step 5: Migrate WorkOrderLabor data
    console.log('📝 Migrating WorkOrderLabor data...');
    await prisma.$executeRaw`
      UPDATE "WorkOrderLabor" 
      SET "price" = "rate" * "hours",
          "quantity" = 1,
          "estimatedHours" = "hours"
      WHERE "price" = 0
    `;

    // Step 6: Add new columns to EstimateLabor
    console.log('📝 Adding columns to EstimateLabor...');
    await prisma.$executeRaw`
      ALTER TABLE "EstimateLabor" 
      ADD COLUMN IF NOT EXISTS "price" DECIMAL(10,2) DEFAULT 0
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "EstimateLabor" 
      ADD COLUMN IF NOT EXISTS "quantity" INTEGER DEFAULT 1
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "EstimateLabor" 
      ADD COLUMN IF NOT EXISTS "estimatedHours" DECIMAL(5,2)
    `;

    // Step 7: Migrate EstimateLabor data
    console.log('📝 Migrating EstimateLabor data...');
    await prisma.$executeRaw`
      UPDATE "EstimateLabor" 
      SET "price" = "rate" * "hours",
          "quantity" = 1,
          "estimatedHours" = "hours"
      WHERE "price" = 0
    `;

    console.log(' Migration completed successfully!');
    console.log('👉 Now run: npx prisma db push');
    console.log('   This will remove the old hours/rate columns and finalize the schema.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateLaborPricing()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
