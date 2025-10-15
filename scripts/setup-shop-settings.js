const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupShopSettings() {
  console.log('🚗 Setting up shop settings...');

  try {
    // Set up operating hours for all days
    const operatingHours = [
      { dayOfWeek: 'MONDAY', isOpen: true, openTime: '08:00', closeTime: '17:00' },
      { dayOfWeek: 'TUESDAY', isOpen: true, openTime: '08:00', closeTime: '17:00' },
      { dayOfWeek: 'WEDNESDAY', isOpen: true, openTime: '08:00', closeTime: '17:00' },
      { dayOfWeek: 'THURSDAY', isOpen: true, openTime: '08:00', closeTime: '17:00' },
      { dayOfWeek: 'FRIDAY', isOpen: true, openTime: '08:00', closeTime: '17:00' },
      { dayOfWeek: 'SATURDAY', isOpen: true, openTime: '08:00', closeTime: '16:00' },
      { dayOfWeek: 'SUNDAY', isOpen: false, openTime: null, closeTime: null },
    ];

    console.log('📅 Setting up operating hours...');
    for (const hours of operatingHours) {
      await prisma.shopOperatingHours.upsert({
        where: { dayOfWeek: hours.dayOfWeek },
        update: hours,
        create: hours,
      });
    }
    console.log('✅ Operating hours set up successfully');

    // Set up capacity settings
    console.log('⚙️ Setting up capacity settings...');
    const capacitySettings = {
      appointmentsPerDay: 6,
      appointmentsPerTimeBlock: 2,
      timeBlockIntervalMinutes: 30,
      minimumNoticeHours: 48,
      futureSchedulingCutoffYears: 3,
    };

    await prisma.shopCapacitySettings.upsert({
      where: { id: 'default' },
      update: capacitySettings,
      create: { id: 'default', ...capacitySettings },
    });
    console.log('✅ Capacity settings set up successfully');

    console.log('🎉 Shop settings setup completed successfully!');
    console.log('📋 Summary:');
    console.log('   - Operating hours: Mon-Fri 8AM-5PM, Sat 8AM-4PM, Sun Closed');
    console.log('   - Daily capacity: 6 appointments');
    console.log('   - Time block capacity: 2 appointments per 30-minute slot');
    console.log('   - Minimum notice: 48 hours');

  } catch (error) {
    console.error('❌ Error setting up shop settings:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupShopSettings();