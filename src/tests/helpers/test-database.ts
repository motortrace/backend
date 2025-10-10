import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

/**
 * Set up test database with migrations and seed data
 */
export async function createTestDatabase() {
  console.log('🔧 Setting up test database...');

  try {
    // Run Prisma migrations
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'inherit',
    });

    // Seed essential test data
    await seedTestData();

    console.log('✅ Test database ready');
  } catch (error) {
    console.error('❌ Failed to set up test database:', error);
    throw error;
  }
}

/**
 * Clean up all data from test database
 */
export async function cleanupTestDatabase() {
  console.log('🧹 Cleaning up test database...');

  try {
    // Get all table names
    const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname='public'
    `;

    // Truncate all tables except migrations
    for (const { tablename } of tablenames) {
      if (tablename !== '_prisma_migrations') {
        try {
          await prisma.$executeRawUnsafe(
            `TRUNCATE TABLE "public"."${tablename}" CASCADE;`
          );
        } catch (error) {
          console.log(`⚠️  Could not truncate ${tablename}:`, error);
        }
      }
    }

    console.log('✅ Test database cleaned');
  } catch (error) {
    console.error('❌ Failed to clean test database:', error);
    throw error;
  }
}

/**
 * Reset test database (clean + reseed)
 */
export async function resetTestDatabase() {
  await cleanupTestDatabase();
  await seedTestData();
}

/**
 * Seed essential test data
 */
async function seedTestData() {
  console.log('🌱 Seeding test data...');

  try {
    // Seed Canned Services
    await prisma.cannedService.createMany({
      data: [
        {
          code: 'OIL_CHANGE',
          name: 'Oil Change',
          description: 'Standard oil change service',
          duration: 30,
          price: 49.99,
          isAvailable: true,
        },
        {
          code: 'TIRE_ROTATION',
          name: 'Tire Rotation',
          description: 'Rotate all four tires',
          duration: 45,
          price: 39.99,
          isAvailable: true,
        },
        {
          code: 'BRAKE_INSPECTION',
          name: 'Brake Inspection',
          description: 'Complete brake system inspection',
          duration: 60,
          price: 89.99,
          isAvailable: true,
        },
      ],
      skipDuplicates: true,
    });

    // Seed Inspection Templates
    await prisma.inspectionTemplate.createMany({
      data: [
        {
          name: 'Basic Vehicle Inspection',
          category: 'GENERAL',
          description: 'Standard vehicle inspection checklist',
          isActive: true,
        },
        {
          name: 'Pre-Purchase Inspection',
          category: 'GENERAL',
          description: 'Comprehensive inspection before purchase',
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });

    console.log('✅ Test data seeded');
  } catch (error) {
    console.error('❌ Failed to seed test data:', error);
    throw error;
  }
}

/**
 * Disconnect Prisma client
 */
export async function disconnectTestDatabase() {
  await prisma.$disconnect();
}

/**
 * Get test Prisma client instance
 */
export function getTestPrisma() {
  return prisma;
}

/**
 * Execute raw SQL query (useful for complex test setups)
 */
export async function executeRawSQL(query: string) {
  return await prisma.$executeRawUnsafe(query);
}

/**
 * Helper to create a test customer
 */
export async function createTestCustomer(overrides = {}) {
  return await prisma.customer.create({
    data: {
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '+1234567890',
      ...overrides,
    },
  });
}

/**
 * Helper to create a test vehicle
 */
export async function createTestVehicle(customerId: string, overrides = {}) {
  return await prisma.vehicle.create({
    data: {
      customerId,
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      vin: `TEST${Date.now()}`,
      ...overrides,
    },
  });
}

/**
 * Helper to create a test work order
 */
export async function createTestWorkOrder(
  customerId: string,
  vehicleId: string,
  overrides = {}
) {
  return await prisma.workOrder.create({
    data: {
      customerId,
      vehicleId,
      workOrderNumber: `WO-TEST-${Date.now()}`,
      status: 'PENDING',
      jobType: 'REPAIR',
      priority: 'NORMAL',
      ...overrides,
    },
  });
}

export { prisma as testPrisma };
