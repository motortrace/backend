import { AppointmentStatus, AppointmentPriority, DayOfWeek } from '@prisma/client';
import {
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AvailableSlot,
  AppointmentSlotRequest,
  ShopOperatingHoursRequest,
  ShopCapacitySettingsRequest,
  AppointmentWithServices,
  TimeBlockAvailabilityRequest,
  TimeBlockAvailability,
  DailyCapacityRequest,
  DailyCapacity,
  IAppointmentsService,
  CalendarAppointment,
  AdvisorAvailability,
} from './appointments.types';
import { PrismaClient } from '@prisma/client';

export class AppointmentService implements IAppointmentsService {
  constructor(private readonly prisma: PrismaClient) {}

  // Create a new appointment with ShopMonkey-style booking logic
  async createAppointment(data: CreateAppointmentRequest): Promise<AppointmentWithServices> {
    const { cannedServiceIds = [], serviceNotes = [], ...appointmentData } = data;

    // Convert string dates to Date objects
    const startTime = new Date(appointmentData.startTime);
    const endTime = appointmentData.endTime ? new Date(appointmentData.endTime) : undefined;
    const requestedAt = new Date(appointmentData.requestedAt);

    let cannedServices: any[] = [];

    // Only validate canned services if they are provided
    if (cannedServiceIds.length > 0) {
      // Validate that all canned services exist and are available
      cannedServices = await this.prisma.cannedService.findMany({
        where: {
          id: { in: cannedServiceIds },
          isAvailable: true,
        },
      });

      if (cannedServices.length !== cannedServiceIds.length) {
        throw new Error('One or more selected services are not available');
      }
    }

    // ShopMonkey Booking Logic: Check daily limit first
    const appointmentDate = new Date(startTime);
    appointmentDate.setHours(0, 0, 0, 0);
    
    const dailyBookings = await this.prisma.appointment.count({
      where: {
        startTime: {
          gte: appointmentDate,
          lt: new Date(appointmentDate.getTime() + 24 * 60 * 60 * 1000), // Next day
        },
        status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
      },
    });

    // Get shop capacity settings
    const capacitySettings = await this.prisma.shopCapacitySettings.findFirst({
      where: { id: 'default' },
    });

    if (!capacitySettings) {
      throw new Error('Shop capacity settings not configured');
    }

    // Check daily limit (ShopMonkey rule: max 6 appointments per day)
    if (dailyBookings >= capacitySettings.appointmentsPerDay) {
      throw new Error(`Daily appointment limit reached (${capacitySettings.appointmentsPerDay} appointments). Please select a different date.`);
    }

    // Check time block capacity (ShopMonkey rule: max 2 appointments per 30-min block)
    const timeBlockStart = this.getTimeBlockStart(startTime, capacitySettings.timeBlockIntervalMinutes);
    const timeBlockEnd = new Date(timeBlockStart.getTime() + capacitySettings.timeBlockIntervalMinutes * 60 * 1000);

    const timeBlockBookings = await this.prisma.appointment.count({
      where: {
        startTime: {
          gte: timeBlockStart,
          lt: timeBlockEnd,
        },
        status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
      },
    });

    if (timeBlockBookings >= capacitySettings.appointmentsPerTimeBlock) {
      throw new Error(`Time block is full (${capacitySettings.appointmentsPerTimeBlock} appointments per ${capacitySettings.timeBlockIntervalMinutes}-minute block). Please select a different time.`);
    }

    // Create appointment with services (ShopMonkey: duration ignored during booking)
    const appointment = await this.prisma.appointment.create({
      data: {
        customerId: appointmentData.customerId,
        vehicleId: appointmentData.vehicleId,
        requestedAt: requestedAt,
        startTime: startTime,
        endTime: endTime,
        notes: appointmentData.notes,
        status: AppointmentStatus.PENDING, // All appointments start as unassigned
        ...(cannedServiceIds.length > 0 && {
          cannedServices: {
            create: cannedServiceIds.map((serviceId, index) => ({
              cannedServiceId: serviceId,
              quantity: 1,
              price: cannedServices.find(s => s.id === serviceId)?.price || 0,
              notes: serviceNotes[index],
            })),
          },
        }),
      },
      include: {
        cannedServices: {
          include: {
            cannedService: true,
          },
        },
        customer: {
          include: {
            userProfile: {
              select: {
                profileImage: true
              }
            }
          }
        },
        vehicle: true,
        assignedTo: {
          include: {
            userProfile: {
              select: {
                name: true,
                phone: true,
                profileImage: true
              }
            }
          }
        },
      },
    });

    return this.formatAppointmentWithServices(appointment);
  }

  // Get available appointment slots (ShopMonkey-style: simplified time blocks)
  async getAvailableSlots(request: AppointmentSlotRequest): Promise<AvailableSlot[]> {
    const { date, serviceIds } = request;

    // Get shop capacity settings
    const capacitySettings = await this.prisma.shopCapacitySettings.findFirst({
      where: { id: 'default' },
    });

    if (!capacitySettings) {
      throw new Error('Shop capacity settings not configured');
    }

    // Get shop operating hours for the day
    const dayOfWeek = this.getDayOfWeek(date);
    const operatingHours = await this.prisma.shopOperatingHours.findUnique({
      where: { dayOfWeek },
    });

    if (!operatingHours || !operatingHours.isOpen) {
      return []; // Shop is closed on this day
    }

    // ShopMonkey Logic: Generate 30-minute time blocks regardless of service duration
    // Service IDs are now optional - we show all available slots
    const slots: AvailableSlot[] = [];
    const startTime = this.parseTimeStringForDate(operatingHours.openTime!, date);
    const endTime = this.parseTimeStringForDate(operatingHours.closeTime!, date);
    const intervalMinutes = capacitySettings.timeBlockIntervalMinutes;

    let currentTime = new Date(date);
    currentTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

    while (currentTime < endTime) {
      const slotEndTime = new Date(currentTime);
      slotEndTime.setMinutes(currentTime.getMinutes() + intervalMinutes);

      if (slotEndTime <= endTime) {
        // Check existing appointments in this time block
        const existingAppointments = await this.prisma.appointment.count({
          where: {
            startTime: {
              gte: currentTime,
              lt: slotEndTime,
            },
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

      // Move to next time block
      currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
    }

    return slots;
  }

  // New method: Check time block availability
  async checkTimeBlockAvailability(request: TimeBlockAvailabilityRequest): Promise<TimeBlockAvailability> {
    const { date, timeBlock } = request;

    // Get shop capacity settings
    const capacitySettings = await this.prisma.shopCapacitySettings.findFirst({
      where: { id: 'default' },
    });

    if (!capacitySettings) {
      throw new Error('Shop capacity settings not configured');
    }

    // Parse time block and create proper date range
    const [hours, minutes] = timeBlock.split(':').map(Number);
    
    // Create start of the day in local time
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    // Create time block start by adding hours and minutes
    const timeBlockStart = new Date(dayStart.getTime() + (hours * 60 + minutes) * 60 * 1000);
    const timeBlockEnd = new Date(timeBlockStart.getTime() + capacitySettings.timeBlockIntervalMinutes * 60 * 1000);

    // Count existing bookings in this time block
    const currentBookings = await this.prisma.appointment.count({
      where: {
        startTime: {
          gte: timeBlockStart,
          lt: timeBlockEnd,
        },
        status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
      },
    });

    const isAvailable = currentBookings < capacitySettings.appointmentsPerTimeBlock;

    // Suggest alternative time blocks if not available
    let suggestedAlternatives: string[] = [];
    if (!isAvailable) {
      suggestedAlternatives = await this.getSuggestedTimeBlocks(date, timeBlock, capacitySettings);
    }

    return {
      timeBlock,
      isAvailable,
      currentBookings,
      maxCapacity: capacitySettings.appointmentsPerTimeBlock,
      suggestedAlternatives,
    };
  }

  // New method: Check daily capacity
  async checkDailyCapacity(request: DailyCapacityRequest): Promise<DailyCapacity> {
    const { date } = request;

    // Get shop capacity settings
    const capacitySettings = await this.prisma.shopCapacitySettings.findFirst({
      where: { id: 'default' },
    });

    if (!capacitySettings) {
      throw new Error('Shop capacity settings not configured');
    }

    // Count total bookings for the day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const totalBookings = await this.prisma.appointment.count({
      where: {
        startTime: {
          gte: dayStart,
          lt: dayEnd,
        },
        status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
      },
    });

    const isAvailable = totalBookings < capacitySettings.appointmentsPerDay;

    // Get all time blocks for the day
    const dayOfWeek = this.getDayOfWeek(date);
    const operatingHours = await this.prisma.shopOperatingHours.findUnique({
      where: { dayOfWeek },
    });

    const timeBlocks: TimeBlockAvailability[] = [];
    
    if (operatingHours && operatingHours.isOpen) {
      const startTime = this.parseTimeString(operatingHours.openTime!);
      const endTime = this.parseTimeString(operatingHours.closeTime!);
      const intervalMinutes = capacitySettings.timeBlockIntervalMinutes;

      let currentTime = new Date(date);
      currentTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

      while (currentTime < endTime) {
        const timeBlockEnd = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000);
        
        if (timeBlockEnd <= endTime) {
          const timeBlockBookings = await this.prisma.appointment.count({
            where: {
              startTime: {
                gte: currentTime,
                lt: timeBlockEnd,
              },
              status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
            },
          });

          timeBlocks.push({
            timeBlock: `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`,
            isAvailable: timeBlockBookings < capacitySettings.appointmentsPerTimeBlock,
            currentBookings: timeBlockBookings,
            maxCapacity: capacitySettings.appointmentsPerTimeBlock,
          });
        }

        currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
      }
    }

    return {
      date,
      totalBookings,
      maxDailyBookings: capacitySettings.appointmentsPerDay,
      isAvailable,
      timeBlocks,
    };
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

    const appointments = await this.prisma.appointment.findMany({
      where,
      include: {
        cannedServices: {
          include: {
            cannedService: true,
          },
        },
        customer: {
          include: {
            userProfile: {
              select: {
                profileImage: true
              }
            }
          }
        },
        vehicle: true,
        assignedTo: {
          include: {
            userProfile: {
              select: {
                name: true,
                phone: true,
                profileImage: true
              }
            }
          }
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return appointments.map(appointment => this.formatAppointmentWithServices(appointment));
  }

  // Get appointment by ID
  async getAppointmentById(id: string): Promise<AppointmentWithServices | null> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        cannedServices: {
          include: {
            cannedService: true,
          },
        },
        customer: {
          include: {
            userProfile: {
              select: {
                profileImage: true
              }
            }
          }
        },
        vehicle: true,
        assignedTo: {
          include: {
            userProfile: {
              select: {
                name: true,
                phone: true,
                profileImage: true,
              }
            }
          }
        },
      },
    });

    return appointment ? this.formatAppointmentWithServices(appointment) : null;
  }

  // Update appointment
  async updateAppointment(id: string, data: UpdateAppointmentRequest): Promise<AppointmentWithServices> {
    const appointment = await this.prisma.appointment.update({
      where: { id },
      data,
      include: {
        cannedServices: {
          include: {
            cannedService: true,
          },
        },
        customer: {
          include: {
            userProfile: {
              select: {
                profileImage: true
              }
            }
          }
        },
        vehicle: true,
        assignedTo: {
          include: {
            userProfile: {
              select: {
                name: true,
                phone: true,
                profileImage: true
              }
            }
          }
        },
      },
    });

    return this.formatAppointmentWithServices(appointment);
  }

  // Delete appointment
  async deleteAppointment(id: string): Promise<void> {
    await this.prisma.appointment.delete({
      where: { id },
    });
  }

  // Get unassigned appointments
  async getUnassignedAppointments(): Promise<AppointmentWithServices[]> {
    const appointments = await this.prisma.appointment.findMany({
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
        customer: {
          include: {
            userProfile: {
              select: {
                profileImage: true
              }
            }
          }
        },
        vehicle: true,
        assignedTo: {
          include: {
            userProfile: {
              select: {
                name: true,
                phone: true,
                profileImage: true
              }
            }
          }
        },
      },
      orderBy: { requestedAt: 'asc' },
    });

    return appointments.map(appointment => this.formatAppointmentWithServices(appointment));
  }

  // Get confirmed appointments without active work orders
  async getConfirmedAppointmentsWithoutWorkOrders(): Promise<AppointmentWithServices[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.CONFIRMED,
        // Exclude appointments that have active work orders
        workOrder: {
          is: null // No work order exists for this appointment
        }
      },
      include: {
        cannedServices: {
          include: {
            cannedService: true,
          },
        },
        customer: {
          include: {
            userProfile: {
              select: {
                profileImage: true
              }
            }
          }
        },
        vehicle: true,
        assignedTo: {
          include: {
            userProfile: {
              select: {
                name: true,
                phone: true,
                profileImage: true
              }
            }
          }
        },
        workOrder: true
      },
      orderBy: { startTime: 'asc' },
    });

    return appointments.map(appointment => this.formatAppointmentWithServices(appointment));
  }

  // Get appointments for calendar view (PENDING, CONFIRMED, and COMPLETED)
  async getCalendarAppointments(): Promise<CalendarAppointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED]
        }
      },
      include: {
        cannedServices: {
          include: {
            cannedService: true,
          },
        },
        customer: true,
        vehicle: true,
      },
      orderBy: { startTime: 'asc' },
    });

    return appointments.map(appointment => {
      // Create title: "Customer Name – Service Name"
      const serviceName = appointment.cannedServices.length > 0 
        ? appointment.cannedServices[0].cannedService.name 
        : 'Appointment';
      const title = `${appointment.customer.name} – ${serviceName}`;

      return {
        id: appointment.id,
        title,
        startTime: appointment.startTime!,
        status: appointment.status,
        priority: appointment.priority,
        customer: {
          id: appointment.customer.id,
          name: appointment.customer.name,
        },
        vehicle: {
          make: appointment.vehicle.make,
          model: appointment.vehicle.model,
          licensePlate: appointment.vehicle.licensePlate,
        },
      };
    });
  }

  // Get service advisors availability for a specific date/time
  async getAdvisorsAvailability(dateTime: Date): Promise<AdvisorAvailability[]> {
    // Get all service advisors
    const advisors = await this.prisma.serviceAdvisor.findMany({
      include: {
        userProfile: {
          select: {
            name: true,
            phone: true,
            profileImage: true,
          },
        },
        assignedAppointments: {
          where: {
            status: {
              in: [AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS],
            },
            OR: [
              {
                startTime: {
                  lte: dateTime,
                },
                endTime: {
                  gte: dateTime,
                },
              },
            ],
          },
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        },
      },
    });

    // For each advisor, check availability and get last assignment
    const availabilityPromises = advisors.map(async (advisor) => {
      // Check if advisor is busy at the given time
      const isBusy = advisor.assignedAppointments.length > 0;

      // Get the last appointment assignment
      const lastAppointment = await this.prisma.appointment.findFirst({
        where: {
          assignedToId: advisor.id,
          status: {
            in: [AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED, AppointmentStatus.IN_PROGRESS],
          },
        },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          status: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      return {
        advisorId: advisor.id,
        employeeId: advisor.employeeId,
        name: advisor.userProfile?.name || 'Unknown',
        phone: advisor.userProfile?.phone || null,
        profileImage: advisor.userProfile?.profileImage || null,
        isAvailable: !isBusy,
        currentAppointment: isBusy ? advisor.assignedAppointments[0] : null,
        lastAssignedAt: lastAppointment?.updatedAt || null,
        lastAppointmentStatus: lastAppointment?.status || null,
        hasNeverBeenAssigned: !lastAppointment,
      };
    });

    return Promise.all(availabilityPromises);
  }

  // Assign appointment to service advisor
  async assignAppointment(appointmentId: string, assignedToId: string): Promise<AppointmentWithServices> {
    const appointment = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { assignedToId },
      include: {
        cannedServices: {
          include: {
            cannedService: true,
          },
        },
        customer: {
          include: {
            userProfile: {
              select: {
                profileImage: true
              }
            }
          }
        },
        vehicle: true,
        assignedTo: {
          include: {
            userProfile: {
              select: {
                name: true,
                phone: true,
                profileImage: true
              }
            }
          }
        },
      },
    });

    return this.formatAppointmentWithServices(appointment);
  }



  // Shop Settings Management
  async updateOperatingHours(data: ShopOperatingHoursRequest) {
    return await this.prisma.shopOperatingHours.upsert({
      where: { dayOfWeek: data.dayOfWeek },
      update: data,
      create: data,
    });
  }

  async getOperatingHours() {
    return await this.prisma.shopOperatingHours.findMany({
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async updateCapacitySettings(data: ShopCapacitySettingsRequest) {
    return await this.prisma.shopCapacitySettings.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });
  }

  async getCapacitySettings() {
    return await this.prisma.shopCapacitySettings.findFirst({
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
        profileImage: appointment.customer.userProfile?.profileImage || null,
        userProfileId: appointment.customer.userProfileId,
      },
      vehicle: {
        id: appointment.vehicle.id,
        make: appointment.vehicle.make,
        model: appointment.vehicle.model,
        year: appointment.vehicle.year,
        licensePlate: appointment.vehicle.licensePlate,
        imageUrl: appointment.vehicle.imageUrl,
      },

      assignedTo: appointment.assignedTo ? {
        id: appointment.assignedTo.id,
        employeeId: appointment.assignedTo.employeeId,
        supabaseUserId: appointment.assignedTo.supabaseUserId,
        name: appointment.assignedTo.userProfile?.name || 'Unknown',
        phone: appointment.assignedTo.userProfile?.phone || null,
        profileImage: appointment.assignedTo.userProfile?.profileImage || null,
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

  private parseTimeStringForDate(timeString: string, targetDate: Date): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date(targetDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  // New helper method: Get time block start time
  private getTimeBlockStart(dateTime: Date, intervalMinutes: number): Date {
    const minutes = dateTime.getMinutes();
    const adjustedMinutes = Math.floor(minutes / intervalMinutes) * intervalMinutes;
    const timeBlockStart = new Date(dateTime);
    timeBlockStart.setMinutes(adjustedMinutes, 0, 0);
    return timeBlockStart;
  }

  // New helper method: Get suggested alternative time blocks
  private async getSuggestedTimeBlocks(date: Date, requestedTimeBlock: string, capacitySettings: any): Promise<string[]> {
    const dayOfWeek = this.getDayOfWeek(date);
    const operatingHours = await this.prisma.shopOperatingHours.findUnique({
      where: { dayOfWeek },
    });

    if (!operatingHours || !operatingHours.isOpen) {
      return [];
    }

    const startTime = this.parseTimeStringForDate(operatingHours.openTime!, date);
    const endTime = this.parseTimeStringForDate(operatingHours.closeTime!, date);
    const intervalMinutes = capacitySettings.timeBlockIntervalMinutes;

    let currentTime = new Date(date);
    currentTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

    const suggestions: string[] = [];
    const maxSuggestions = 5;

    while (currentTime < endTime && suggestions.length < maxSuggestions) {
      const timeBlockEnd = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000);
      
      if (timeBlockEnd <= endTime) {
        const timeBlockBookings = await this.prisma.appointment.count({
          where: {
            startTime: {
              gte: currentTime,
              lt: timeBlockEnd,
            },
            status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
          },
        });

        if (timeBlockBookings < capacitySettings.appointmentsPerTimeBlock) {
          const timeBlockString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
          if (timeBlockString !== requestedTimeBlock) {
            suggestions.push(timeBlockString);
          }
        }
      }

      currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
    }

    return suggestions;
  }
}
