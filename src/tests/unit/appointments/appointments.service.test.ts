import { AppointmentService } from '../../../modules/appointments/appointments.service';
import { PrismaClient, AppointmentStatus, DayOfWeek } from '@prisma/client';
import { CreateAppointmentRequest, UpdateAppointmentRequest, AppointmentSlotRequest, TimeBlockAvailabilityRequest, DailyCapacityRequest, ShopOperatingHoursRequest, ShopCapacitySettingsRequest } from '../../../modules/appointments/appointments.types';

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    cannedService: {
      findMany: jest.fn(),
    },
    appointment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    shopCapacitySettings: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
    },
    shopOperatingHours: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
  })),
}));

describe('AppointmentService', () => {
  let appointmentService: AppointmentService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    appointmentService = new AppointmentService(mockPrisma);
  });

  describe('createAppointment', () => {
    it('should create an appointment successfully', async () => {
      // Arrange
      const appointmentData: CreateAppointmentRequest = {
        customerId: 'customer123',
        vehicleId: 'vehicle123',
        requestedAt: new Date('2024-01-15T10:00:00Z'),
        startTime: new Date('2024-01-16T10:00:00Z'),
        endTime: new Date('2024-01-16T11:00:00Z'),
        notes: 'Regular maintenance',
        cannedServiceIds: ['service1', 'service2'],
        serviceNotes: ['Oil change', 'Filter replacement']
      };

      const mockCapacitySettings = {
        id: 'default',
        appointmentsPerDay: 6,
        appointmentsPerTimeBlock: 2,
        timeBlockIntervalMinutes: 30
      };

      const mockCannedServices = [
        { id: 'service1', name: 'Oil Change', price: 50.00 },
        { id: 'service2', name: 'Filter Replacement', price: 25.00 }
      ];

      const mockAppointment = {
        id: 'appointment123',
        ...appointmentData,
        status: AppointmentStatus.PENDING,
        cannedServices: [
          { cannedService: mockCannedServices[0], quantity: 1, price: 50.00, notes: 'Oil change' },
          { cannedService: mockCannedServices[1], quantity: 1, price: 25.00, notes: 'Filter replacement' }
        ],
        customer: { id: 'customer123', name: 'John Doe', email: 'john@example.com', phone: '1234567890', userProfile: { profileImage: 'image.jpg' } },
        vehicle: { id: 'vehicle123', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' },
        assignedTo: null
      };

      mockPrisma.cannedService.findMany.mockResolvedValue(mockCannedServices);
      mockPrisma.appointment.count.mockResolvedValue(3); // 3 existing appointments, under daily limit
      mockPrisma.shopCapacitySettings.findFirst.mockResolvedValue(mockCapacitySettings);
      mockPrisma.appointment.count.mockResolvedValueOnce(1); // 1 in time block, under limit
      mockPrisma.appointment.create.mockResolvedValue(mockAppointment as any);

      // Act
      const result = await appointmentService.createAppointment(appointmentData);

      // Assert
      expect(mockPrisma.cannedService.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['service1', 'service2'] },
          isAvailable: true
        }
      });
      expect(mockPrisma.appointment.create).toHaveBeenCalled();
      expect(result.id).toBe('appointment123');
      expect(result.status).toBe(AppointmentStatus.PENDING);
    });

    it('should throw error when daily limit is reached', async () => {
      // Arrange
      const appointmentData: CreateAppointmentRequest = {
        customerId: 'customer123',
        vehicleId: 'vehicle123',
        requestedAt: new Date(),
        startTime: new Date(),
        notes: 'Test appointment',
        cannedServiceIds: ['service1', 'service2']
      };

      const mockCapacitySettings = {
        id: 'default',
        appointmentsPerDay: 6,
        appointmentsPerTimeBlock: 2,
        timeBlockIntervalMinutes: 30
      };

      mockPrisma.cannedService.findMany.mockResolvedValue([]);
      mockPrisma.appointment.count.mockResolvedValue(6); // At daily limit
      mockPrisma.shopCapacitySettings.findFirst.mockResolvedValue(mockCapacitySettings);

      // Act & Assert
      await expect(appointmentService.createAppointment(appointmentData)).rejects.toThrow('Daily appointment limit reached (6 appointments). Please select a different date.');
    });

    it('should throw error when time block is full', async () => {
      // Arrange
      const appointmentData: CreateAppointmentRequest = {
        customerId: 'customer123',
        vehicleId: 'vehicle123',
        requestedAt: new Date(),
        startTime: new Date(),
        notes: 'Test appointment',
        cannedServiceIds: ['service1', 'service2']
      };

      const mockCapacitySettings = {
        id: 'default',
        appointmentsPerDay: 6,
        appointmentsPerTimeBlock: 2,
        timeBlockIntervalMinutes: 30
      };

      mockPrisma.cannedService.findMany.mockResolvedValue([]);
      mockPrisma.appointment.count.mockResolvedValue(3); // Under daily limit
      mockPrisma.shopCapacitySettings.findFirst.mockResolvedValue(mockCapacitySettings);
      mockPrisma.appointment.count.mockResolvedValueOnce(2); // At time block limit

      // Act & Assert
      await expect(appointmentService.createAppointment(appointmentData)).rejects.toThrow('Time block is full (2 appointments per 30-minute block). Please select a different time.');
    });

    it('should throw error when service is not available', async () => {
      // Arrange
      const appointmentData: CreateAppointmentRequest = {
        customerId: 'customer123',
        vehicleId: 'vehicle123',
        requestedAt: new Date(),
        startTime: new Date(),
        cannedServiceIds: ['service1'],
        serviceNotes: ['Test service']
      };

      mockPrisma.cannedService.findMany.mockResolvedValue([]); // Service not found or not available

      // Act & Assert
      await expect(appointmentService.createAppointment(appointmentData)).rejects.toThrow('One or more selected services are not available');
    });
  });

  describe('getAvailableSlots', () => {
    it('should return available time slots', async () => {
      // Arrange
      const request: AppointmentSlotRequest = {
        date: new Date('2024-01-15'),
        serviceIds: ['service1']
      };

      const mockCapacitySettings = {
        id: 'default',
        appointmentsPerDay: 6,
        appointmentsPerTimeBlock: 2,
        timeBlockIntervalMinutes: 30
      };

      const mockOperatingHours = {
        dayOfWeek: DayOfWeek.MONDAY,
        isOpen: true,
        openTime: '09:00',
        closeTime: '17:00'
      };

      mockPrisma.shopCapacitySettings.findFirst.mockResolvedValue(mockCapacitySettings);
      mockPrisma.shopOperatingHours.findUnique.mockResolvedValue(mockOperatingHours);
      mockPrisma.appointment.count.mockResolvedValue(1); // 1 appointment in each block

      // Act
      const result = await appointmentService.getAvailableSlots(request);

      // Assert
      expect(mockPrisma.shopCapacitySettings.findFirst).toHaveBeenCalled();
      expect(mockPrisma.shopOperatingHours.findUnique).toHaveBeenCalledWith({
        where: { dayOfWeek: DayOfWeek.MONDAY }
      });
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('startTime');
      expect(result[0]).toHaveProperty('endTime');
      expect(result[0]).toHaveProperty('availableCapacity');
      expect(result[0]).toHaveProperty('totalCapacity');
    });

    it('should return empty array when shop is closed', async () => {
      // Arrange
      const request: AppointmentSlotRequest = {
        date: new Date('2024-01-15')
      };

      const mockCapacitySettings = {
        id: 'default',
        appointmentsPerDay: 6,
        appointmentsPerTimeBlock: 2,
        timeBlockIntervalMinutes: 30
      };

      const mockOperatingHours = {
        dayOfWeek: DayOfWeek.MONDAY,
        isOpen: false,
        openTime: null,
        closeTime: null
      };

      mockPrisma.shopCapacitySettings.findFirst.mockResolvedValue(mockCapacitySettings);
      mockPrisma.shopOperatingHours.findUnique.mockResolvedValue(mockOperatingHours);

      // Act
      const result = await appointmentService.getAvailableSlots(request);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('checkTimeBlockAvailability', () => {
    it('should return time block availability', async () => {
      // Arrange
      const request: TimeBlockAvailabilityRequest = {
        date: new Date('2024-01-15'),
        timeBlock: '10:00'
      };

      const mockCapacitySettings = {
        id: 'default',
        appointmentsPerDay: 6,
        appointmentsPerTimeBlock: 2,
        timeBlockIntervalMinutes: 30
      };

      mockPrisma.shopCapacitySettings.findFirst.mockResolvedValue(mockCapacitySettings);
      mockPrisma.appointment.count.mockResolvedValue(1); // 1 appointment in time block

      // Act
      const result = await appointmentService.checkTimeBlockAvailability(request);

      // Assert
      expect(result.timeBlock).toBe('10:00');
      expect(result.isAvailable).toBe(true);
      expect(result.currentBookings).toBe(1);
      expect(result.maxCapacity).toBe(2);
    });

    it('should return unavailable when time block is full', async () => {
      // Arrange
      const request: TimeBlockAvailabilityRequest = {
        date: new Date('2024-01-15'),
        timeBlock: '10:00'
      };

      const mockCapacitySettings = {
        id: 'default',
        appointmentsPerDay: 6,
        appointmentsPerTimeBlock: 2,
        timeBlockIntervalMinutes: 30
      };

      mockPrisma.shopCapacitySettings.findFirst.mockResolvedValue(mockCapacitySettings);
      mockPrisma.appointment.count.mockResolvedValue(2); // At capacity
      mockPrisma.appointment.count.mockResolvedValueOnce(1); // For alternative suggestions

      // Act
      const result = await appointmentService.checkTimeBlockAvailability(request);

      // Assert
      expect(result.isAvailable).toBe(false);
      expect(result.currentBookings).toBe(2);
      expect(result.suggestedAlternatives).toBeDefined();
    });
  });

  describe('checkDailyCapacity', () => {
    it('should return daily capacity information', async () => {
      // Arrange
      const request: DailyCapacityRequest = {
        date: new Date('2024-01-15')
      };

      const mockCapacitySettings = {
        id: 'default',
        appointmentsPerDay: 6,
        appointmentsPerTimeBlock: 2,
        timeBlockIntervalMinutes: 30
      };

      const mockOperatingHours = {
        dayOfWeek: DayOfWeek.MONDAY,
        isOpen: true,
        openTime: '09:00',
        closeTime: '17:00'
      };

      mockPrisma.shopCapacitySettings.findFirst.mockResolvedValue(mockCapacitySettings);
      mockPrisma.appointment.count.mockResolvedValue(3); // 3 appointments today
      mockPrisma.shopOperatingHours.findUnique.mockResolvedValue(mockOperatingHours);
      mockPrisma.appointment.count.mockResolvedValueOnce(1); // For time blocks

      // Act
      const result = await appointmentService.checkDailyCapacity(request);

      // Assert
      expect(result.totalBookings).toBe(3);
      expect(result.maxDailyBookings).toBe(6);
      expect(result.isAvailable).toBe(true);
      expect(result.timeBlocks).toBeDefined();
      expect(result.timeBlocks.length).toBeGreaterThan(0);
    });
  });

  describe('getAppointments', () => {
    it('should return appointments with filters', async () => {
      // Arrange
      const filters = {
        status: AppointmentStatus.CONFIRMED,
        customerId: 'customer123',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };

      const mockAppointments = [
        {
          id: 'appointment1',
          status: AppointmentStatus.CONFIRMED,
          cannedServices: [],
          customer: { id: 'customer123', name: 'John Doe', email: 'john@example.com', phone: '1234567890', userProfile: { profileImage: null } },
          vehicle: { id: 'vehicle123', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' },
          assignedTo: null
        }
      ];

      mockPrisma.appointment.findMany.mockResolvedValue(mockAppointments as any);

      // Act
      const result = await appointmentService.getAppointments(filters);

      // Assert
      expect(mockPrisma.appointment.findMany).toHaveBeenCalledWith({
        where: {
          status: AppointmentStatus.CONFIRMED,
          customerId: 'customer123',
          startTime: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-12-31')
          }
        },
        include: expect.any(Object),
        orderBy: { startTime: 'asc' }
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getAppointmentById', () => {
    it('should return appointment when found', async () => {
      // Arrange
      const appointmentId = 'appointment123';
      const mockAppointment = {
        id: appointmentId,
        status: AppointmentStatus.PENDING,
        cannedServices: [],
        customer: { id: 'customer123', name: 'John Doe', email: 'john@example.com', phone: '1234567890', userProfile: { profileImage: null } },
        vehicle: { id: 'vehicle123', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' },
        assignedTo: null
      };

      mockPrisma.appointment.findUnique.mockResolvedValue(mockAppointment as any);

      // Act
      const result = await appointmentService.getAppointmentById(appointmentId);

      // Assert
      expect(mockPrisma.appointment.findUnique).toHaveBeenCalledWith({
        where: { id: appointmentId },
        include: expect.any(Object)
      });
      expect(result?.id).toBe(appointmentId);
    });

    it('should return null when appointment not found', async () => {
      // Arrange
      const appointmentId = 'nonexistent';
      mockPrisma.appointment.findUnique.mockResolvedValue(null);

      // Act
      const result = await appointmentService.getAppointmentById(appointmentId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateAppointment', () => {
    it('should update appointment successfully', async () => {
      // Arrange
      const appointmentId = 'appointment123';
      const updateData: UpdateAppointmentRequest = {
        status: AppointmentStatus.CONFIRMED,
        notes: 'Updated notes'
      };

      const mockAppointment = {
        id: appointmentId,
        status: AppointmentStatus.CONFIRMED,
        notes: 'Updated notes',
        cannedServices: [],
        customer: { id: 'customer123', name: 'John Doe', email: 'john@example.com', phone: '1234567890', userProfile: { profileImage: null } },
        vehicle: { id: 'vehicle123', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' },
        assignedTo: null
      };

      mockPrisma.appointment.update.mockResolvedValue(mockAppointment as any);

      // Act
      const result = await appointmentService.updateAppointment(appointmentId, updateData);

      // Assert
      expect(mockPrisma.appointment.update).toHaveBeenCalledWith({
        where: { id: appointmentId },
        data: updateData,
        include: expect.any(Object)
      });
      expect(result.status).toBe(AppointmentStatus.CONFIRMED);
      expect(result.notes).toBe('Updated notes');
    });
  });

  describe('deleteAppointment', () => {
    it('should delete appointment successfully', async () => {
      // Arrange
      const appointmentId = 'appointment123';

      // Act
      await appointmentService.deleteAppointment(appointmentId);

      // Assert
      expect(mockPrisma.appointment.delete).toHaveBeenCalledWith({
        where: { id: appointmentId }
      });
    });
  });

  describe('getUnassignedAppointments', () => {
    it('should return unassigned appointments', async () => {
      // Arrange
      const mockAppointments = [
        {
          id: 'appointment1',
          assignedToId: null,
          status: AppointmentStatus.PENDING,
          cannedServices: [],
          customer: { id: 'customer123', name: 'John Doe', email: 'john@example.com', phone: '1234567890', userProfile: { profileImage: null } },
          vehicle: { id: 'vehicle123', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' },
          assignedTo: null,
          requestedAt: new Date('2024-01-15')
        }
      ];

      mockPrisma.appointment.findMany.mockResolvedValue(mockAppointments as any);

      // Act
      const result = await appointmentService.getUnassignedAppointments();

      // Assert
      expect(mockPrisma.appointment.findMany).toHaveBeenCalledWith({
        where: {
          assignedToId: null,
          status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] }
        },
        include: expect.any(Object),
        orderBy: { requestedAt: 'asc' }
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getConfirmedAppointmentsWithoutWorkOrders', () => {
    it('should return confirmed appointments without work orders', async () => {
      // Arrange
      const mockAppointments = [
        {
          id: 'appointment1',
          status: AppointmentStatus.CONFIRMED,
          workOrder: null,
          cannedServices: [],
          customer: { id: 'customer123', name: 'John Doe', email: 'john@example.com', phone: '1234567890', userProfile: { profileImage: null } },
          vehicle: { id: 'vehicle123', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' },
          assignedTo: null,
          startTime: new Date('2024-01-16')
        }
      ];

      mockPrisma.appointment.findMany.mockResolvedValue(mockAppointments as any);

      // Act
      const result = await appointmentService.getConfirmedAppointmentsWithoutWorkOrders();

      // Assert
      expect(mockPrisma.appointment.findMany).toHaveBeenCalledWith({
        where: {
          status: AppointmentStatus.CONFIRMED,
          workOrder: { is: null }
        },
        include: expect.any(Object),
        orderBy: { startTime: 'asc' }
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('assignAppointment', () => {
    it('should assign appointment to service advisor', async () => {
      // Arrange
      const appointmentId = 'appointment123';
      const assignedToId = 'advisor123';

      const mockAppointment = {
        id: appointmentId,
        assignedToId: assignedToId,
        cannedServices: [],
        customer: { id: 'customer123', name: 'John Doe', email: 'john@example.com', phone: '1234567890', userProfile: { profileImage: null } },
        vehicle: { id: 'vehicle123', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' },
        assignedTo: {
          id: assignedToId,
          supabaseUserId: 'user123',
          userProfile: { profileImage: 'advisor.jpg' }
        }
      };

      mockPrisma.appointment.update.mockResolvedValue(mockAppointment as any);

      // Act
      const result = await appointmentService.assignAppointment(appointmentId, assignedToId);

      // Assert
      expect(mockPrisma.appointment.update).toHaveBeenCalledWith({
        where: { id: appointmentId },
        data: { assignedToId },
        include: expect.any(Object)
      });
      expect(result.assignedToId).toBe(assignedToId);
    });
  });

  describe('updateOperatingHours', () => {
    it('should update operating hours', async () => {
      // Arrange
      const operatingHoursData: ShopOperatingHoursRequest = {
        dayOfWeek: DayOfWeek.MONDAY,
        isOpen: true,
        openTime: '09:00',
        closeTime: '17:00'
      };

      const mockOperatingHours = {
        id: 'hours123',
        ...operatingHoursData
      };

      mockPrisma.shopOperatingHours.upsert.mockResolvedValue(mockOperatingHours as any);

      // Act
      const result = await appointmentService.updateOperatingHours(operatingHoursData);

      // Assert
      expect(mockPrisma.shopOperatingHours.upsert).toHaveBeenCalledWith({
        where: { dayOfWeek: DayOfWeek.MONDAY },
        update: operatingHoursData,
        create: operatingHoursData
      });
      expect(result.dayOfWeek).toBe(DayOfWeek.MONDAY);
    });
  });

  describe('getOperatingHours', () => {
    it('should return all operating hours', async () => {
      // Arrange
      const mockOperatingHours = [
        { dayOfWeek: DayOfWeek.MONDAY, isOpen: true, openTime: '09:00', closeTime: '17:00' },
        { dayOfWeek: DayOfWeek.TUESDAY, isOpen: true, openTime: '09:00', closeTime: '17:00' }
      ];

      mockPrisma.shopOperatingHours.findMany.mockResolvedValue(mockOperatingHours as any);

      // Act
      const result = await appointmentService.getOperatingHours();

      // Assert
      expect(mockPrisma.shopOperatingHours.findMany).toHaveBeenCalledWith({
        orderBy: { dayOfWeek: 'asc' }
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('updateCapacitySettings', () => {
    it('should update capacity settings', async () => {
      // Arrange
      const capacityData: ShopCapacitySettingsRequest = {
        appointmentsPerDay: 8,
        appointmentsPerTimeBlock: 3,
        timeBlockIntervalMinutes: 30,
        minimumNoticeHours: 24,
        futureSchedulingCutoffYears: 1
      };

      const mockCapacitySettings = {
        id: 'default',
        ...capacityData
      };

      mockPrisma.shopCapacitySettings.upsert.mockResolvedValue(mockCapacitySettings as any);

      // Act
      const result = await appointmentService.updateCapacitySettings(capacityData);

      // Assert
      expect(mockPrisma.shopCapacitySettings.upsert).toHaveBeenCalledWith({
        where: { id: 'default' },
        update: capacityData,
        create: { id: 'default', ...capacityData }
      });
      expect(result.appointmentsPerDay).toBe(8);
    });
  });

  describe('getCapacitySettings', () => {
    it('should return capacity settings', async () => {
      // Arrange
      const mockCapacitySettings = {
        id: 'default',
        appointmentsPerDay: 6,
        appointmentsPerTimeBlock: 2,
        timeBlockIntervalMinutes: 30
      };

      mockPrisma.shopCapacitySettings.findFirst.mockResolvedValue(mockCapacitySettings as any);

      // Act
      const result = await appointmentService.getCapacitySettings();

      // Assert
      expect(mockPrisma.shopCapacitySettings.findFirst).toHaveBeenCalledWith({
        where: { id: 'default' }
      });
      expect(result?.appointmentsPerDay).toBe(6);
    });
  });
});