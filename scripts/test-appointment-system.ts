import { PrismaClient, AppointmentStatus, AppointmentPriority, DayOfWeek } from '@prisma/client';
import { AppointmentService } from '../src/modules/appointments/appointments.service';

const prisma = new PrismaClient();
const appointmentService = new AppointmentService();

async function testAppointmentSystem() {
  console.log('🧪 Testing Appointment Scheduling System...\n');

  try {
    // 1. Test Canned Services
    console.log('1. Testing Canned Services...');
    const availableServices = await appointmentService.getAvailableCannedServices();
    console.log(`✅ Found ${availableServices.length} available services`);
    availableServices.forEach(service => {
      console.log(`   - ${service.code}: ${service.name} (${service.duration}min, $${service.price})`);
    });
    console.log('');

    // 2. Test Shop Settings
    console.log('2. Testing Shop Settings...');
    const operatingHours = await appointmentService.getOperatingHours();
    const capacitySettings = await appointmentService.getCapacitySettings();
    
    console.log('📅 Operating Hours:');
    operatingHours.forEach(hours => {
      if (hours.isOpen) {
        console.log(`   - ${hours.dayOfWeek}: ${hours.openTime} - ${hours.closeTime}`);
      } else {
        console.log(`   - ${hours.dayOfWeek}: Closed`);
      }
    });
    
    console.log('\n⚙️ Capacity Settings:');
    console.log(`   - Appointments per day: ${capacitySettings?.appointmentsPerDay}`);
    console.log(`   - Appointments per time block: ${capacitySettings?.appointmentsPerTimeBlock}`);
    console.log(`   - Time block interval: ${capacitySettings?.timeBlockIntervalMinutes} minutes`);
    console.log(`   - Minimum notice: ${capacitySettings?.minimumNoticeHours} hours`);
    console.log('');

    // 3. Test Available Slots
    console.log('3. Testing Available Slots...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const serviceIds = availableServices.slice(0, 2).map(s => s.id); // First 2 services
    const availableSlots = await appointmentService.getAvailableSlots({
      date: tomorrow,
      serviceIds,
    });
    
    console.log(`✅ Found ${availableSlots.length} available slots for tomorrow`);
    availableSlots.slice(0, 5).forEach((slot, index) => {
      console.log(`   ${index + 1}. ${slot.startTime.toLocaleTimeString()} - ${slot.endTime.toLocaleTimeString()} (${slot.availableCapacity}/${slot.totalCapacity} available)`);
    });
    console.log('');

    // 4. Test Appointment Creation
    console.log('4. Testing Appointment Creation...');
    
    // First, get a customer and vehicle
    const customer = await prisma.customer.findFirst();
    const vehicle = await prisma.vehicle.findFirst();
    
    if (!customer || !vehicle) {
      console.log('❌ No customer or vehicle found. Please create test data first.');
      return;
    }

    const appointmentData = {
      customerId: customer.id,
      vehicleId: vehicle.id,
      requestedAt: new Date(),
      startTime: availableSlots[0]?.startTime,
      endTime: availableSlots[0]?.endTime,
      notes: 'Test appointment for system validation',
      priority: AppointmentPriority.NORMAL,
      cannedServiceIds: serviceIds,
      quantities: [1, 1],
      prices: availableServices.slice(0, 2).map(s => s.price),
      serviceNotes: ['Test service 1', 'Test service 2'],
    };

    const appointment = await appointmentService.createAppointment(appointmentData);
    console.log(`✅ Created appointment: ${appointment.id}`);
    console.log(`   - Customer: ${appointment.customer.name}`);
    console.log(`   - Vehicle: ${appointment.vehicle.make} ${appointment.vehicle.model}`);
    console.log(`   - Status: ${appointment.status}`);
    console.log(`   - Services: ${appointment.cannedServices.map(s => s.name).join(', ')}`);
    console.log('');

    // 5. Test Unassigned Appointments
    console.log('5. Testing Unassigned Appointments...');
    const unassignedAppointments = await appointmentService.getUnassignedAppointments();
    console.log(`✅ Found ${unassignedAppointments.length} unassigned appointments`);
    unassignedAppointments.forEach(apt => {
      console.log(`   - ${apt.id}: ${apt.customer.name} - ${apt.cannedServices.map(s => s.name).join(', ')}`);
    });
    console.log('');

    // 6. Test Appointment Assignment
    console.log('6. Testing Appointment Assignment...');
    const staffMember = await prisma.staffMember.findFirst();
    
    if (staffMember && unassignedAppointments.length > 0) {
      const assignedAppointment = await appointmentService.assignAppointment(
        unassignedAppointments[0].id,
        staffMember.id
      );
      console.log(`✅ Assigned appointment ${assignedAppointment.id} to staff member ${staffMember.id}`);
      console.log(`   - New status: ${assignedAppointment.status}`);
      console.log(`   - Assigned to: ${assignedAppointment.assignedTo?.id}`);
    } else {
      console.log('⚠️ No staff member found or no unassigned appointments');
    }
    console.log('');

    // 7. Test Appointment Updates
    console.log('7. Testing Appointment Updates...');
    if (appointment) {
      const updatedAppointment = await appointmentService.updateAppointment(appointment.id, {
        status: AppointmentStatus.CONFIRMED,
        notes: 'Appointment confirmed and ready for service',
      });
      console.log(`✅ Updated appointment: ${updatedAppointment.id}`);
      console.log(`   - New status: ${updatedAppointment.status}`);
      console.log(`   - Updated notes: ${updatedAppointment.notes}`);
    }
    console.log('');

    // 8. Test Appointment Retrieval with Filters
    console.log('8. Testing Appointment Retrieval with Filters...');
    const pendingAppointments = await appointmentService.getAppointments({
      status: AppointmentStatus.PENDING,
    });
    const confirmedAppointments = await appointmentService.getAppointments({
      status: AppointmentStatus.CONFIRMED,
    });
    
    console.log(`✅ Found ${pendingAppointments.length} pending appointments`);
    console.log(`✅ Found ${confirmedAppointments.length} confirmed appointments`);
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Available services: ${availableServices.length}`);
    console.log(`   - Available slots tomorrow: ${availableSlots.length}`);
    console.log(`   - Total appointments: ${await prisma.appointment.count()}`);
    console.log(`   - Unassigned appointments: ${await prisma.appointment.count({ where: { assignedToId: null } })}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAppointmentSystem()
  .then(() => {
    console.log('\n✅ Appointment system test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }); 