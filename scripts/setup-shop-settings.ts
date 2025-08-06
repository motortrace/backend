import { PrismaClient, DayOfWeek } from '@prisma/client';

const prisma = new PrismaClient();

async function setupShopSettings() {
  try {
    console.log('Setting up shop capacity settings...');
    
    // Set up capacity settings
    const capacitySettings = await prisma.shopCapacitySettings.upsert({
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

    console.log('Capacity settings created:', capacitySettings);

    // Set up operating hours for weekdays
    const weekdays: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    
    for (const day of weekdays) {
      const operatingHours = await prisma.shopOperatingHours.upsert({
        where: { dayOfWeek: day },
        update: {
          isOpen: true,
          openTime: '08:00',
          closeTime: '17:00',
        },
        create: {
          dayOfWeek: day,
          isOpen: true,
          openTime: '08:00',
          closeTime: '17:00',
        },
      });

      console.log(`Operating hours for ${day}:`, operatingHours);
    }

    // Set up weekend hours (closed)
    const weekends: DayOfWeek[] = ['SATURDAY', 'SUNDAY'];
    
    for (const day of weekends) {
      const operatingHours = await prisma.shopOperatingHours.upsert({
        where: { dayOfWeek: day },
        update: {
          isOpen: false,
        },
        create: {
          dayOfWeek: day,
          isOpen: false,
        },
      });

      console.log(`Operating hours for ${day}:`, operatingHours);
    }

    console.log('Shop settings setup completed successfully!');
  } catch (error) {
    console.error('Error setting up shop settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupShopSettings(); 