import { PrismaClient, AppointmentStatus, AppointmentPriority, DayOfWeek } from '@prisma/client';
import {
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AvailableSlot,
  AppointmentSlotRequest,
  ShopOperatingHoursRequest,
  ShopCapacitySettingsRequest,
  CannedServiceRequest,
  AppointmentWithServices,
} from './appointments.types';

const prisma = new PrismaClient();

export class AppointmentService {
  // Create a new appointment
  async createAppointment(data: CreateAppointmentRequest): Promise<AppointmentWithServices> {
    const { cannedServiceIds, quantities = [], prices = [], serviceNotes = [], ...appointmentData } = data;

    // Validate that all canned services exist and are available
    const cannedServices = await prisma.cannedService.findMany({
      where: {
        id: { in: cannedServiceIds },
        isAvailable: true,
      },
    });

    if (cannedServices.length !== cannedServiceIds.length) {
      throw new Error('One or more selected services are not available');
    }

    // Create appointment with services
    const appointment = await prisma.appointment.create({
      data: {
        ...appointmentData,
        cannedServices: {
          create: cannedServiceIds.map((serviceId, index) => ({
            cannedServiceId: serviceId,
            quantity: quantities[index] || 1,
            price: prices[index] || cannedServices.find(s => s.id === serviceId)?.price || 0,
            notes: serviceNotes[index],
          })),
        },
      },
      include: {
        cannedServices: {
          include: {
            cannedService: true,
          },
        },
        customer: true,
        vehicle: true,
        assignedTo: true,
      },
    });

    return this.formatAppointmentWithServices(appointment);
  }

  // Get available appointment slots for a given date and services
  async getAvailableSlots(request: AppointmentSlotRequest): Promise<AvailableSlot[]> {
    const { date, serviceIds } = request;

    // Get shop capacity settings
    const capacitySettings = await prisma.shopCapacitySettings.findFirst({
      where: { id: 'default' },
    });

    if (!capacitySettings) {
      throw new Error('Shop capacity settings not configured');
    }

    // Get shop operating hours for the day
    const dayOfWeek = this.getDayOfWeek(date);
    const operatingHours = await prisma.shopOperatingHours.findUnique({
      where: { dayOfWeek },
    });

    if (!operatingHours || !operatingHours.isOpen) {
      return []; // Shop is closed on this day
    }

    // Calculate total duration needed for the services
    const services = await prisma.cannedService.findMany({
      where: { id: { in: serviceIds } },
    });

    const totalDurationMinutes = services.reduce((sum, service) => sum + service.duration, 0);
    const totalDurationHours = Math.ceil(totalDurationMinutes / 60); // Round up to nearest hour

    // Generate time slots
    const slots: AvailableSlot[] = [];
    const startTime = this.parseTimeString(operatingHours.openTime!);
    const endTime = this.parseTimeString(operatingHours.closeTime!);
    const intervalMinutes = capacitySettings.timeBlockIntervalMinutes;

    let currentTime = new Date(date);
    currentTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

    while (currentTime < endTime) {
      const slotEndTime = new Date(currentTime);
      slotEndTime.setHours(currentTime.getHours() + totalDurationHours);

      if (slotEndTime <= endTime) {
        // Check existing appointments in this time slot
        const existingAppointments = await prisma.appointment.count({
          where: {
            startTime: { gte: currentTime },
            endTime: { lte: slotEndTime },
            status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
          },
        });

        const availableCapacity = capacitySettings.appointmentsPerTimeBlock - existingAppointments;

        if (availableCapacity > 0) {
          slots.push({
            startTime: new Date(currentTime),
            endTime: new Date(slotEndTime),
            availableCapacity,
            totalCapacity: capacitySettings.appointmentsPerTimeBlock,
          });
        }
      }

      // Move to next time slot
      currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
    }

    return slots;
  }

  // Get all appointments with optional filters
  async getAppointments(filters?: {
    status?: AppointmentStatus;
    assignedToId?: string;
    customerId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AppointmentWithServices[]> {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.assignedToId) where.assignedToId = filters.assignedToId;
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.startDate || filters?.endDate) {
      where.startTime = {};
      if (filters?.startDate) where.startTime.gte = filters.startDate;
      if (filters?.endDate) where.startTime.lte = filters.endDate;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        cannedServices: {
          include: {
            cannedService: true,
          },
        },
        customer: true,
        vehicle: true,
        assignedTo: true,
      },
      orderBy: { startTime: 'asc' },
    });

    return appointments.map(appointment => this.formatAppointmentWithServices(appointment));
  }

  // Get appointment by ID
  async getAppointmentById(id: string): Promise<AppointmentWithServices | null> {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        cannedServices: {
          include: {
            cannedService: true,
          },
        },
        customer: true,
        vehicle: true,
        assignedTo: true,
      },
    });

    return appointment ? this.formatAppointmentWithServices(appointment) : null;
  }

  // Update appointment
  async updateAppointment(id: string, data: UpdateAppointmentRequest): Promise<AppointmentWithServices> {
    const appointment = await prisma.appointment.update({
      where: { id },
      data,
      include: {
        cannedServices: {
          include: {
            cannedService: true,
          },
        },
        customer: true,
        vehicle: true,
        assignedTo: true,
      },
    });

    return this.formatAppointmentWithServices(appointment);
  }

  // Delete appointment
  async deleteAppointment(id: string): Promise<void> {
    await prisma.appointment.delete({
      where: { id },
    });
  }

  // Get unassigned appointments
  async getUnassignedAppointments(): Promise<AppointmentWithServices[]> {
    const appointments = await prisma.appointment.findMany({
      where: {
        assignedToId: null,
        status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
      },
      include: {
        cannedServices: {
          include: {
            cannedService: true,
          },
        },
        customer: true,
        vehicle: true,
        assignedTo: true,
      },
      orderBy: { requestedAt: 'asc' },
    });

    return appointments.map(appointment => this.formatAppointmentWithServices(appointment));
  }

  // Assign appointment to service advisor
  async assignAppointment(appointmentId: string, assignedToId: string): Promise<AppointmentWithServices> {
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { assignedToId },
      include: {
        cannedServices: {
          include: {
            cannedService: true,
          },
        },
        customer: true,
        vehicle: true,
        assignedTo: true,
      },
    });

    return this.formatAppointmentWithServices(appointment);
  }

  // Canned Service Management
  async createCannedService(data: CannedServiceRequest) {
    return await prisma.cannedService.create({
      data,
    });
  }

  async getAvailableCannedServices() {
    return await prisma.cannedService.findMany({
      where: { isAvailable: true },
      orderBy: { name: 'asc' },
    });
  }

  async updateCannedService(id: string, data: Partial<CannedServiceRequest>) {
    return await prisma.cannedService.update({
      where: { id },
      data,
    });
  }

  async deleteCannedService(id: string) {
    await prisma.cannedService.delete({
      where: { id },
    });
  }

  // Shop Settings Management
  async updateOperatingHours(data: ShopOperatingHoursRequest) {
    return await prisma.shopOperatingHours.upsert({
      where: { dayOfWeek: data.dayOfWeek },
      update: data,
      create: data,
    });
  }

  async getOperatingHours() {
    return await prisma.shopOperatingHours.findMany({
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async updateCapacitySettings(data: ShopCapacitySettingsRequest) {
    return await prisma.shopCapacitySettings.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });
  }

  async getCapacitySettings() {
    return await prisma.shopCapacitySettings.findFirst({
      where: { id: 'default' },
    });
  }

  // Helper methods
  private formatAppointmentWithServices(appointment: any): AppointmentWithServices {
    return {
      id: appointment.id,
      customerId: appointment.customerId,
      vehicleId: appointment.vehicleId,
      requestedAt: appointment.requestedAt,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      priority: appointment.priority,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      assignedToId: appointment.assignedToId,
      cannedServices: appointment.cannedServices.map((acs: any) => ({
        id: acs.cannedService.id,
        code: acs.cannedService.code,
        name: acs.cannedService.name,
        duration: acs.cannedService.duration,
        price: acs.price,
        quantity: acs.quantity,
        notes: acs.notes,
      })),
      customer: {
        id: appointment.customer.id,
        name: appointment.customer.name,
        email: appointment.customer.email,
        phone: appointment.customer.phone,
      },
      vehicle: {
        id: appointment.vehicle.id,
        make: appointment.vehicle.make,
        model: appointment.vehicle.model,
        year: appointment.vehicle.year,
        licensePlate: appointment.vehicle.licensePlate,
      },
      assignedTo: appointment.assignedTo ? {
        id: appointment.assignedTo.id,
        supabaseUserId: appointment.assignedTo.supabaseUserId,
      } : undefined,
    };
  }

  private getDayOfWeek(date: Date): DayOfWeek {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getDay()] as DayOfWeek;
  }

  private parseTimeString(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
} 