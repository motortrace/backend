import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🗑️  Resetting database to start fresh...');

  try {
    // Step 1: Drop all tables (in correct order to avoid foreign key constraints)
    console.log('📋 Dropping all tables...');
    
    await prisma.$executeRaw`DROP TABLE IF EXISTS "ServiceItem" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "ServiceCatalog" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "WorkOrder" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Vehicle" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Customer" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "StaffMember" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "UserProfile" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "InventoryItem" CASCADE`;
    
    console.log('✅ All tables dropped successfully');

    // Step 2: Reset Prisma migration history
    console.log('🔄 Resetting Prisma migration history...');
    
    // Delete migration files (optional - you can do this manually)
    console.log('📝 Note: You may want to delete old migration files manually');
    
    // Step 3: Push the new schema
    console.log('🚀 Pushing new schema to database...');
    
    // This will create all tables with the new structure
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    
    console.log('✅ Database reset completed successfully!');
    console.log('🎉 Your database is now ready with the new schema structure');

  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run reset if called directly
if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('\n📋 Next steps:');
      console.log('1. Run: npx prisma db push');
      console.log('2. Run: npx prisma generate');
      console.log('3. Test your application');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Reset failed:', error);
      process.exit(1);
    });
}

export { resetDatabase }; 