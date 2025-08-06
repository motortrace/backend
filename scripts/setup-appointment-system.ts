import { PrismaClient, DayOfWeek } from '@prisma/client';

const prisma = new PrismaClient();

async function setupAppointmentSystem() {
  console.log('Setting up appointment scheduling system...');

  try {
    // Set up shop operating hours (Monday-Friday 8AM-5PM, Sunday closed)
    const operatingHours = [
      { dayOfWeek: DayOfWeek.SUNDAY, isOpen: false },
      { dayOfWeek: DayOfWeek.MONDAY, isOpen: true, openTime: '08:00', closeTime: '17:00' },
      { dayOfWeek: DayOfWeek.TUESDAY, isOpen: true, openTime: '08:00', closeTime: '17:00' },
      { dayOfWeek: DayOfWeek.WEDNESDAY, isOpen: true, openTime: '08:00', closeTime: '17:00' },
      { dayOfWeek: DayOfWeek.THURSDAY, isOpen: true, openTime: '08:00', closeTime: '17:00' },
      { dayOfWeek: DayOfWeek.FRIDAY, isOpen: true, openTime: '08:00', closeTime: '17:00' },
      { dayOfWeek: DayOfWeek.SATURDAY, isOpen: false },
    ];

    for (const hours of operatingHours) {
      await prisma.shopOperatingHours.upsert({
        where: { dayOfWeek: hours.dayOfWeek },
        update: hours,
        create: hours,
      });
    }

    // Set up shop capacity settings (ShopMonkey defaults)
    await prisma.shopCapacitySettings.upsert({
      where: { id: 'default' },
      update: {
        appointmentsPerDay: 6,
        appointmentsPerTimeBlock: 2,
        timeBlockIntervalMinutes: 30,
        minimumNoticeHours: 48,
        futureSchedulingCutoffYears: 3,
      },
      create: {
        id: 'default',
        appointmentsPerDay: 6,
        appointmentsPerTimeBlock: 2,
        timeBlockIntervalMinutes: 30,
        minimumNoticeHours: 48,
        futureSchedulingCutoffYears: 3,
      },
    });

    // Create sample canned services
    const sampleServices = [
      {
        code: 'DYN001',
        name: 'Dyno Tuning - 3 Pulls',
        description: 'Dyno tuning with 3 pulls for performance optimization',
        duration: 120, // 2 hours in minutes
        price: 250.00,
        isAvailable: true,
      },
      {
        code: 'BRAKE001',
        name: 'Basic Brake Package',
        description: 'Complete brake inspection and basic brake service',
        duration: 60, // 1 hour in minutes
        price: 150.00,
        isAvailable: true,
      },
      {
        code: 'OIL001',
        name: 'Oil Change Service',
        description: 'Standard oil change with filter replacement',
        duration: 30, // 30 minutes
        price: 45.00,
        isAvailable: true,
      },
      {
        code: 'INSP001',
        name: 'General Inspection',
        description: 'Comprehensive vehicle inspection and diagnostic',
        duration: 45, // 45 minutes
        price: 75.00,
        isAvailable: true,
      },
    ];

    for (const service of sampleServices) {
      await prisma.cannedService.upsert({
        where: { code: service.code },
        update: service,
        create: service,
      });
    }

    console.log('✅ Appointment scheduling system setup completed!');
    console.log('📅 Shop operating hours configured');
    console.log('⚙️  Capacity settings configured');
    console.log('🔧 Sample canned services created');

  } catch (error) {
    console.error('❌ Error setting up appointment system:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupAppointmentSystem()
  .then(() => {
    console.log('Setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  }); 