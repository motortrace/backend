import { ServiceAdvisorService } from '../../../modules/service-advisors/service-advisors.service';
import { PrismaClient } from '@prisma/client';
import { CreateServiceAdvisorDto, UpdateServiceAdvisorDto, ServiceAdvisorFilters } from '../../../modules/service-advisors/service-advisors.types';

// Mock Prisma Client
jest.mock('@prisma/client');

describe('ServiceAdvisorService', () => {
  let serviceAdvisorService: ServiceAdvisorService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    serviceAdvisorService = new ServiceAdvisorService(mockPrisma);
  });

  describe('createServiceAdvisor', () => {
    it('should create service advisor successfully', async () => {
      // Arrange
      const advisorData: CreateServiceAdvisorDto = {
        userProfileId: 'profile123',
        employeeId: 'SA001',
        department: 'Service Department'
      };

      const mockUserProfile = { id: 'profile123', role: 'SERVICE_ADVISOR' };
      const mockAdvisor = {
        id: 'advisor123',
        userProfileId: 'profile123',
        employeeId: 'SA001',
        department: 'Service Department',
        createdAt: new Date(),
        updatedAt: new Date(),
        userProfile: {
          id: 'profile123',
          name: 'John Doe',
          phone: '+1234567890',
          profileImage: null,
          role: 'SERVICE_ADVISOR'
        }
      };

      mockPrisma.userProfile.findUnique.mockResolvedValue(mockUserProfile);
      mockPrisma.serviceAdvisor.findUnique.mockResolvedValue(null); // No existing employee ID
      mockPrisma.serviceAdvisor.create.mockResolvedValue(mockAdvisor as any);

      // Act
      const result = await serviceAdvisorService.createServiceAdvisor(advisorData);

      // Assert
      expect(mockPrisma.userProfile.findUnique).toHaveBeenCalledWith({
        where: { id: 'profile123' },
        select: { id: true, role: true }
      });
      expect(mockPrisma.serviceAdvisor.findUnique).toHaveBeenCalledWith({
        where: { employeeId: 'SA001' }
      });
      expect(mockPrisma.serviceAdvisor.create).toHaveBeenCalledWith({
        data: {
          userProfileId: 'profile123',
          employeeId: 'SA001',
          department: 'Service Department'
        },
        include: {
          userProfile: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true,
              role: true
            }
          }
        }
      });
      expect(result.id).toBe('advisor123');
      expect(result.employeeId).toBe('SA001');
    });

    it('should throw error when user profile not found', async () => {
      // Arrange
      const advisorData: CreateServiceAdvisorDto = {
        userProfileId: 'nonexistent',
        employeeId: 'SA001'
      };

      mockPrisma.userProfile.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(serviceAdvisorService.createServiceAdvisor(advisorData)).rejects.toThrow('User profile not found');
    });

    it('should throw error when user profile has wrong role', async () => {
      // Arrange
      const advisorData: CreateServiceAdvisorDto = {
        userProfileId: 'profile123',
        employeeId: 'SA001'
      };

      const mockUserProfile = { id: 'profile123', role: 'CUSTOMER' };
      mockPrisma.userProfile.findUnique.mockResolvedValue(mockUserProfile);

      // Act & Assert
      await expect(serviceAdvisorService.createServiceAdvisor(advisorData)).rejects.toThrow('User profile must have SERVICE_ADVISOR role');
    });

    it('should throw error when employee ID already exists', async () => {
      // Arrange
      const advisorData: CreateServiceAdvisorDto = {
        userProfileId: 'profile123',
        employeeId: 'SA001'
      };

      const mockUserProfile = { id: 'profile123', role: 'SERVICE_ADVISOR' };
      const existingAdvisor = { id: 'existing123', employeeId: 'SA001' };

      mockPrisma.userProfile.findUnique.mockResolvedValue(mockUserProfile);
      mockPrisma.serviceAdvisor.findUnique.mockResolvedValue(existingAdvisor as any);

      // Act & Assert
      await expect(serviceAdvisorService.createServiceAdvisor(advisorData)).rejects.toThrow('Employee ID already exists');
    });
  });

  describe('getServiceAdvisors', () => {
    it('should return service advisors with filters', async () => {
      // Arrange
      const filters: ServiceAdvisorFilters = {
        search: 'John',
        department: 'Service',
        hasWorkOrders: true,
        limit: 10,
        offset: 0
      };

      const mockAdvisors = [
        {
          id: 'advisor1',
          employeeId: 'SA001',
          department: 'Service Department',
          userProfile: {
            id: 'profile1',
            name: 'John Doe',
            phone: '+1234567890',
            profileImage: null,
            role: 'SERVICE_ADVISOR'
          },
          _count: {
            advisorWorkOrders: 5,
            assignedAppointments: 3
          }
        }
      ];

      mockPrisma.serviceAdvisor.findMany.mockResolvedValue(mockAdvisors as any);

      // Act
      const result = await serviceAdvisorService.getServiceAdvisors(filters);

      // Assert
      expect(mockPrisma.serviceAdvisor.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { employeeId: { contains: 'John', mode: 'insensitive' } },
            { department: { contains: 'John', mode: 'insensitive' } },
            { userProfile: { name: { contains: 'John', mode: 'insensitive' } } }
          ],
          department: { contains: 'Service', mode: 'insensitive' },
          advisorWorkOrders: { some: {} }
        },
        include: {
          userProfile: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true,
              role: true
            }
          },
          _count: {
            select: {
              advisorWorkOrders: true,
              assignedAppointments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0
      });
      expect(result).toHaveLength(1);
      expect(result[0].workOrdersCount).toBe(5);
    });

    it('should return all service advisors when no filters provided', async () => {
      // Arrange
      const filters: ServiceAdvisorFilters = {};
      const mockAdvisors = [
        {
          id: 'advisor1',
          employeeId: 'SA001',
          department: 'Service Department',
          userProfile: {
            id: 'profile1',
            name: 'John Doe',
            phone: '+1234567890',
            profileImage: null,
            role: 'SERVICE_ADVISOR'
          },
          _count: {
            advisorWorkOrders: 0,
            assignedAppointments: 0
          }
        }
      ];

      mockPrisma.serviceAdvisor.findMany.mockResolvedValue(mockAdvisors as any);

      // Act
      const result = await serviceAdvisorService.getServiceAdvisors(filters);

      // Assert
      expect(mockPrisma.serviceAdvisor.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: undefined,
        skip: undefined
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getServiceAdvisorById', () => {
    it('should return service advisor when found', async () => {
      // Arrange
      const advisorId = 'advisor123';
      const mockAdvisor = {
        id: advisorId,
        employeeId: 'SA001',
        department: 'Service Department',
        userProfile: {
          id: 'profile123',
          name: 'John Doe',
          phone: '+1234567890',
          profileImage: null,
          role: 'SERVICE_ADVISOR'
        },
        _count: {
          advisorWorkOrders: 5,
          assignedAppointments: 3
        }
      };

      mockPrisma.serviceAdvisor.findUnique.mockResolvedValue(mockAdvisor as any);

      // Act
      const result = await serviceAdvisorService.getServiceAdvisorById(advisorId);

      // Assert
      expect(mockPrisma.serviceAdvisor.findUnique).toHaveBeenCalledWith({
        where: { id: advisorId },
        include: expect.any(Object)
      });
      expect(result?.id).toBe(advisorId);
      expect(result?.workOrdersCount).toBe(5);
    });

    it('should return null when service advisor not found', async () => {
      // Arrange
      const advisorId = 'nonexistent';
      mockPrisma.serviceAdvisor.findUnique.mockResolvedValue(null);

      // Act
      const result = await serviceAdvisorService.getServiceAdvisorById(advisorId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getServiceAdvisorByEmployeeId', () => {
    it('should return service advisor by employee ID', async () => {
      // Arrange
      const employeeId = 'SA001';
      const mockAdvisor = {
        id: 'advisor123',
        employeeId,
        department: 'Service Department',
        userProfile: {
          id: 'profile123',
          name: 'John Doe',
          phone: '+1234567890',
          profileImage: null,
          role: 'SERVICE_ADVISOR'
        },
        _count: {
          advisorWorkOrders: 2,
          assignedAppointments: 1
        }
      };

      mockPrisma.serviceAdvisor.findUnique.mockResolvedValue(mockAdvisor as any);

      // Act
      const result = await serviceAdvisorService.getServiceAdvisorByEmployeeId(employeeId);

      // Assert
      expect(mockPrisma.serviceAdvisor.findUnique).toHaveBeenCalledWith({
        where: { employeeId },
        include: expect.any(Object)
      });
      expect(result?.employeeId).toBe(employeeId);
    });
  });

  describe('updateServiceAdvisor', () => {
    it('should update service advisor successfully', async () => {
      // Arrange
      const advisorId = 'advisor123';
      const updateData: UpdateServiceAdvisorDto = {
        employeeId: 'SA002',
        department: 'Updated Department'
      };

      const mockUpdatedAdvisor = {
        id: advisorId,
        employeeId: 'SA002',
        department: 'Updated Department',
        userProfile: {
          id: 'profile123',
          name: 'John Doe',
          phone: '+1234567890',
          profileImage: null,
          role: 'SERVICE_ADVISOR'
        },
        _count: {
          advisorWorkOrders: 5,
          assignedAppointments: 3
        }
      };

      mockPrisma.serviceAdvisor.findFirst.mockResolvedValue(null); // No duplicate employee ID
      mockPrisma.serviceAdvisor.update.mockResolvedValue(mockUpdatedAdvisor as any);

      // Act
      const result = await serviceAdvisorService.updateServiceAdvisor(advisorId, updateData);

      // Assert
      expect(mockPrisma.serviceAdvisor.findFirst).toHaveBeenCalledWith({
        where: {
          employeeId: 'SA002',
          id: { not: advisorId }
        }
      });
      expect(mockPrisma.serviceAdvisor.update).toHaveBeenCalledWith({
        where: { id: advisorId },
        data: updateData,
        include: expect.any(Object)
      });
      expect(result.employeeId).toBe('SA002');
      expect(result.department).toBe('Updated Department');
    });

    it('should throw error when updating to existing employee ID', async () => {
      // Arrange
      const advisorId = 'advisor123';
      const updateData: UpdateServiceAdvisorDto = {
        employeeId: 'SA002'
      };

      const existingAdvisor = { id: 'existing123', employeeId: 'SA002' };
      mockPrisma.serviceAdvisor.findFirst.mockResolvedValue(existingAdvisor as any);

      // Act & Assert
      await expect(serviceAdvisorService.updateServiceAdvisor(advisorId, updateData)).rejects.toThrow('Employee ID already exists');
    });
  });

  describe('deleteServiceAdvisor', () => {
    it('should delete service advisor successfully', async () => {
      // Arrange
      const advisorId = 'advisor123';
      const mockAdvisor = {
        id: advisorId,
        _count: {
          advisorWorkOrders: 0,
          assignedAppointments: 0
        }
      };

      mockPrisma.serviceAdvisor.findUnique.mockResolvedValue(mockAdvisor as any);

      // Act
      await serviceAdvisorService.deleteServiceAdvisor(advisorId);

      // Assert
      expect(mockPrisma.serviceAdvisor.findUnique).toHaveBeenCalledWith({
        where: { id: advisorId },
        include: {
          _count: {
            select: {
              advisorWorkOrders: true,
              assignedAppointments: true
            }
          }
        }
      });
      expect(mockPrisma.serviceAdvisor.delete).toHaveBeenCalledWith({
        where: { id: advisorId }
      });
    });

    it('should throw error when service advisor has work orders', async () => {
      // Arrange
      const advisorId = 'advisor123';
      const mockAdvisor = {
        id: advisorId,
        _count: {
          advisorWorkOrders: 3,
          assignedAppointments: 0
        }
      };

      mockPrisma.serviceAdvisor.findUnique.mockResolvedValue(mockAdvisor as any);

      // Act & Assert
      await expect(serviceAdvisorService.deleteServiceAdvisor(advisorId)).rejects.toThrow('Cannot delete service advisor with existing work orders');
    });

    it('should throw error when service advisor has appointments', async () => {
      // Arrange
      const advisorId = 'advisor123';
      const mockAdvisor = {
        id: advisorId,
        _count: {
          advisorWorkOrders: 0,
          assignedAppointments: 2
        }
      };

      mockPrisma.serviceAdvisor.findUnique.mockResolvedValue(mockAdvisor as any);

      // Act & Assert
      await expect(serviceAdvisorService.deleteServiceAdvisor(advisorId)).rejects.toThrow('Cannot delete service advisor with existing appointments');
    });
  });

  describe('getServiceAdvisorStats', () => {
    it('should return service advisor statistics', async () => {
      // Arrange
      const mockDepartmentStats = [
        { department: 'Service Department', _count: { department: 5 } },
        { department: 'Parts Department', _count: { department: 3 } }
      ];

      const mockRecentHires = [
        {
          id: 'advisor1',
          employeeId: 'SA001',
          department: 'Service Department',
          userProfile: {
            id: 'profile1',
            name: 'John Doe',
            phone: '+1234567890',
            profileImage: null,
            role: 'SERVICE_ADVISOR'
          }
        }
      ];

      mockPrisma.serviceAdvisor.count
        .mockResolvedValueOnce(10) // totalServiceAdvisors
        .mockResolvedValueOnce(7); // activeServiceAdvisors

      mockPrisma.serviceAdvisor.groupBy.mockResolvedValue(mockDepartmentStats as any);
      mockPrisma.serviceAdvisor.findMany.mockResolvedValue(mockRecentHires as any);

      // Act
      const result = await serviceAdvisorService.getServiceAdvisorStats();

      // Assert
      expect(result.totalServiceAdvisors).toBe(10);
      expect(result.activeServiceAdvisors).toBe(7);
      expect(result.serviceAdvisorsByDepartment).toHaveLength(2);
      expect(result.serviceAdvisorsByDepartment[0]).toEqual({
        department: 'Service Department',
        count: 5
      });
      expect(result.recentHires).toHaveLength(1);
    });
  });

  describe('searchServiceAdvisors', () => {
    it('should search service advisors by query', async () => {
      // Arrange
      const query = 'John';
      const mockAdvisors = [
        {
          id: 'advisor1',
          employeeId: 'SA001',
          department: 'Service Department',
          userProfile: {
            id: 'profile1',
            name: 'John Doe',
            phone: '+1234567890',
            profileImage: null,
            role: 'SERVICE_ADVISOR'
          },
          _count: {
            advisorWorkOrders: 5,
            assignedAppointments: 3
          }
        }
      ];

      mockPrisma.serviceAdvisor.findMany.mockResolvedValue(mockAdvisors as any);

      // Act
      const result = await serviceAdvisorService.searchServiceAdvisors(query);

      // Assert
      expect(mockPrisma.serviceAdvisor.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { employeeId: { contains: query, mode: 'insensitive' } },
            { department: { contains: query, mode: 'insensitive' } },
            { userProfile: { name: { contains: query, mode: 'insensitive' } } },
            { userProfile: { phone: { contains: query, mode: 'insensitive' } } }
          ]
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: 20
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getWorkOrdersByServiceAdvisor', () => {
    it('should return work orders for service advisor', async () => {
      // Arrange
      const advisorId = 'advisor123';
      const filters = { status: 'IN_PROGRESS', limit: 10, offset: 0 };

      const mockAdvisor = { id: advisorId };
      const mockWorkOrders = [
        {
          id: 'wo1',
          workOrderNumber: 'WO-001',
          status: 'IN_PROGRESS',
          customer: { id: 'c1', name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
          vehicle: { id: 'v1', make: 'Toyota', model: 'Camry', year: 2020, vin: 'VIN123', licensePlate: 'ABC123' },
          appointment: { id: 'a1', requestedAt: new Date(), startTime: new Date(), endTime: new Date(), status: 'CONFIRMED', priority: 'NORMAL', notes: 'Test appointment' },
          laborItems: [
            {
              technician: {
                id: 'tech1',
                employeeId: 'T001',
                userProfile: { id: 'profile1', name: 'Jane Smith', phone: '0987654321' }
              }
            }
          ]
        }
      ];

      mockPrisma.serviceAdvisor.findUnique.mockResolvedValue(mockAdvisor as any);
      mockPrisma.workOrder.findMany.mockResolvedValue(mockWorkOrders as any);

      // Act
      const result = await serviceAdvisorService.getWorkOrdersByServiceAdvisor(advisorId, filters);

      // Assert
      expect(mockPrisma.serviceAdvisor.findUnique).toHaveBeenCalledWith({
        where: { id: advisorId }
      });
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith({
        where: {
          advisorId,
          status: 'IN_PROGRESS'
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0
      });
      expect(result).toHaveLength(1);
      expect(result[0].workOrderNumber).toBe('WO-001');
    });

    it('should throw error when service advisor not found', async () => {
      // Arrange
      const advisorId = 'nonexistent';
      mockPrisma.serviceAdvisor.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(serviceAdvisorService.getWorkOrdersByServiceAdvisor(advisorId)).rejects.toThrow('Service advisor not found');
    });
  });

  describe('formatServiceAdvisorResponse', () => {
    it('should format service advisor response correctly', () => {
      // Arrange
      const advisor = {
        id: 'advisor123',
        userProfileId: 'profile123',
        employeeId: 'SA001',
        department: 'Service Department',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        userProfile: {
          id: 'profile123',
          name: 'John Doe',
          phone: '+1234567890',
          profileImage: 'image.jpg',
          role: 'SERVICE_ADVISOR'
        },
        _count: {
          advisorWorkOrders: 5,
          assignedAppointments: 3,
          createdEstimates: 2
        }
      };

      // Act
      const result = (serviceAdvisorService as any).formatServiceAdvisorResponse(advisor);

      // Assert
      expect(result.id).toBe('advisor123');
      expect(result.employeeId).toBe('SA001');
      expect(result.department).toBe('Service Department');
      expect(result.workOrdersCount).toBe(5);
      expect(result.appointmentsCount).toBe(3);
      expect(result.estimatesCount).toBe(2);
      expect(result.userProfile.name).toBe('John Doe');
    });

    it('should handle missing counts', () => {
      // Arrange
      const advisor = {
        id: 'advisor123',
        userProfileId: 'profile123',
        employeeId: 'SA001',
        department: 'Service Department',
        createdAt: new Date(),
        updatedAt: new Date(),
        userProfile: {
          id: 'profile123',
          name: 'John Doe',
          phone: '+1234567890',
          profileImage: null,
          role: 'SERVICE_ADVISOR'
        }
      };

      // Act
      const result = (serviceAdvisorService as any).formatServiceAdvisorResponse(advisor);

      // Assert
      expect(result.workOrdersCount).toBe(0);
      expect(result.appointmentsCount).toBe(0);
      expect(result.estimatesCount).toBe(0);
    });
  });
});