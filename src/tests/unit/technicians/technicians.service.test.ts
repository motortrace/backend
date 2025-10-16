import { TechnicianService } from '../../../modules/technicians/technicians.service';
import { PrismaClient } from '@prisma/client';
import { CreateTechnicianDto, UpdateTechnicianDto, TechnicianFilters } from '../../../modules/technicians/technicians.types';

// Mock Prisma Client
jest.mock('@prisma/client');

describe('TechnicianService', () => {
  let technicianService: TechnicianService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    technicianService = new TechnicianService(mockPrisma);
  });

  describe('createTechnician', () => {
    it('should create technician successfully', async () => {
      // Arrange
      const technicianData: CreateTechnicianDto = {
        userProfileId: 'profile123',
        employeeId: 'TECH001',
        specialization: 'Engine Repair',
        certifications: ['ASE Master Technician']
      };

      const mockUserProfile = { id: 'profile123', role: 'TECHNICIAN' };
      const mockTechnician = {
        id: 'tech123',
        userProfileId: 'profile123',
        employeeId: 'TECH001',
        specialization: 'Engine Repair',
        certifications: ['ASE Master Technician'],
        createdAt: new Date(),
        updatedAt: new Date(),
        userProfile: {
          id: 'profile123',
          name: 'John Doe',
          phone: '+1234567890',
          profileImage: null,
          role: 'TECHNICIAN'
        }
      };

      mockPrisma.userProfile.findUnique.mockResolvedValue(mockUserProfile);
      mockPrisma.technician.findUnique.mockResolvedValue(null); // No existing employee ID
      mockPrisma.technician.create.mockResolvedValue(mockTechnician as any);

      // Act
      const result = await technicianService.createTechnician(technicianData);

      // Assert
      expect(mockPrisma.userProfile.findUnique).toHaveBeenCalledWith({
        where: { id: 'profile123' },
        select: { id: true, role: true }
      });
      expect(mockPrisma.technician.findUnique).toHaveBeenCalledWith({
        where: { employeeId: 'TECH001' }
      });
      expect(mockPrisma.technician.create).toHaveBeenCalledWith({
        data: {
          userProfileId: 'profile123',
          employeeId: 'TECH001',
          specialization: 'Engine Repair',
          certifications: ['ASE Master Technician']
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
      expect(result.id).toBe('tech123');
      expect(result.employeeId).toBe('TECH001');
    });

    it('should throw error when user profile not found', async () => {
      // Arrange
      const technicianData: CreateTechnicianDto = {
        userProfileId: 'nonexistent',
        employeeId: 'TECH001'
      };

      mockPrisma.userProfile.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(technicianService.createTechnician(technicianData)).rejects.toThrow('User profile not found');
    });

    it('should throw error when user profile has wrong role', async () => {
      // Arrange
      const technicianData: CreateTechnicianDto = {
        userProfileId: 'profile123',
        employeeId: 'TECH001'
      };

      const mockUserProfile = { id: 'profile123', role: 'CUSTOMER' };
      mockPrisma.userProfile.findUnique.mockResolvedValue(mockUserProfile);

      // Act & Assert
      await expect(technicianService.createTechnician(technicianData)).rejects.toThrow('User profile must have TECHNICIAN role');
    });

    it('should throw error when employee ID already exists', async () => {
      // Arrange
      const technicianData: CreateTechnicianDto = {
        userProfileId: 'profile123',
        employeeId: 'TECH001'
      };

      const mockUserProfile = { id: 'profile123', role: 'TECHNICIAN' };
      const existingTechnician = { id: 'existing123', employeeId: 'TECH001' };

      mockPrisma.userProfile.findUnique.mockResolvedValue(mockUserProfile);
      mockPrisma.technician.findUnique.mockResolvedValue(existingTechnician as any);

      // Act & Assert
      await expect(technicianService.createTechnician(technicianData)).rejects.toThrow('Employee ID already exists');
    });
  });

  describe('getTechnicians', () => {
    it('should return technicians with filters', async () => {
      // Arrange
      const filters: TechnicianFilters = {
        search: 'John',
        specialization: 'Engine',
        hasLaborItems: true,
        limit: 10,
        offset: 0
      };

      const mockTechnicians = [
        {
          id: 'tech1',
          employeeId: 'TECH001',
          specialization: 'Engine Repair',
          userProfile: {
            id: 'profile1',
            name: 'John Doe',
            phone: '+1234567890',
            profileImage: null,
            role: 'TECHNICIAN'
          },
          _count: {
            inspections: 5,
            qcChecks: 2,
            laborItems: 15,
            partInstallations: 8
          }
        }
      ];

      mockPrisma.technician.findMany.mockResolvedValue(mockTechnicians as any);

      // Act
      const result = await technicianService.getTechnicians(filters);

      // Assert
      expect(mockPrisma.technician.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { employeeId: { contains: 'John', mode: 'insensitive' } },
            { specialization: { contains: 'John', mode: 'insensitive' } },
            { userProfile: { name: { contains: 'John', mode: 'insensitive' } } }
          ],
          specialization: { contains: 'Engine', mode: 'insensitive' },
          laborItems: { some: {} }
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
              inspections: true,
              qcChecks: true,
              laborItems: true,
              partInstallations: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0
      });
      expect(result).toHaveLength(1);
      expect(result[0].laborItemsCount).toBe(15);
    });
  });

  describe('getTechnicianById', () => {
    it('should return technician when found', async () => {
      // Arrange
      const technicianId = 'tech123';
      const mockTechnician = {
        id: technicianId,
        employeeId: 'TECH001',
        specialization: 'Engine Repair',
        userProfile: {
          id: 'profile123',
          name: 'John Doe',
          phone: '+1234567890',
          profileImage: null,
          role: 'TECHNICIAN'
        },
        _count: {
          inspections: 5,
          qcChecks: 2,
          laborItems: 15,
          partInstallations: 8
        }
      };

      mockPrisma.technician.findUnique.mockResolvedValue(mockTechnician as any);

      // Act
      const result = await technicianService.getTechnicianById(technicianId);

      // Assert
      expect(result?.id).toBe(technicianId);
      expect(result?.inspectionsCount).toBe(5);
      expect(result?.laborItemsCount).toBe(15);
    });

    it('should return null when technician not found', async () => {
      // Arrange
      const technicianId = 'nonexistent';
      mockPrisma.technician.findUnique.mockResolvedValue(null);

      // Act
      const result = await technicianService.getTechnicianById(technicianId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateTechnician', () => {
    it('should update technician successfully', async () => {
      // Arrange
      const technicianId = 'tech123';
      const updateData: UpdateTechnicianDto = {
        employeeId: 'TECH002',
        specialization: 'Transmission Repair',
        certifications: ['ASE Certified']
      };

      const mockUpdatedTechnician = {
        id: technicianId,
        employeeId: 'TECH002',
        specialization: 'Transmission Repair',
        certifications: ['ASE Certified'],
        userProfile: {
          id: 'profile123',
          name: 'John Doe',
          phone: '+1234567890',
          profileImage: null,
          role: 'TECHNICIAN'
        },
        _count: {
          inspections: 5,
          qcChecks: 2,
          laborItems: 15,
          partInstallations: 8
        }
      };

      mockPrisma.technician.findFirst.mockResolvedValue(null); // No duplicate employee ID
      mockPrisma.technician.update.mockResolvedValue(mockUpdatedTechnician as any);

      // Act
      const result = await technicianService.updateTechnician(technicianId, updateData);

      // Assert
      expect(result.employeeId).toBe('TECH002');
      expect(result.specialization).toBe('Transmission Repair');
      expect(result.certifications).toEqual(['ASE Certified']);
    });

    it('should throw error when updating to existing employee ID', async () => {
      // Arrange
      const technicianId = 'tech123';
      const updateData: UpdateTechnicianDto = {
        employeeId: 'TECH002'
      };

      const existingTechnician = { id: 'existing123', employeeId: 'TECH002' };
      mockPrisma.technician.findFirst.mockResolvedValue(existingTechnician as any);

      // Act & Assert
      await expect(technicianService.updateTechnician(technicianId, updateData)).rejects.toThrow('Employee ID already exists');
    });
  });

  describe('deleteTechnician', () => {
    it('should delete technician successfully', async () => {
      // Arrange
      const technicianId = 'tech123';
      const mockTechnician = {
        id: technicianId,
        _count: {
          inspections: 0,
          laborItems: 0,
          qcChecks: 0,
          partInstallations: 0
        }
      };

      mockPrisma.technician.findUnique.mockResolvedValue(mockTechnician as any);

      // Act
      await technicianService.deleteTechnician(technicianId);

      // Assert
      expect(mockPrisma.technician.delete).toHaveBeenCalledWith({
        where: { id: technicianId }
      });
    });

    it('should throw error when technician has inspections', async () => {
      // Arrange
      const technicianId = 'tech123';
      const mockTechnician = {
        id: technicianId,
        _count: {
          inspections: 3,
          laborItems: 0,
          qcChecks: 0,
          partInstallations: 0
        }
      };

      mockPrisma.technician.findUnique.mockResolvedValue(mockTechnician as any);

      // Act & Assert
      await expect(technicianService.deleteTechnician(technicianId)).rejects.toThrow('Cannot delete technician with existing inspections');
    });

    it('should throw error when technician has labor items', async () => {
      // Arrange
      const technicianId = 'tech123';
      const mockTechnician = {
        id: technicianId,
        _count: {
          inspections: 0,
          laborItems: 5,
          qcChecks: 0,
          partInstallations: 0
        }
      };

      mockPrisma.technician.findUnique.mockResolvedValue(mockTechnician as any);

      // Act & Assert
      await expect(technicianService.deleteTechnician(technicianId)).rejects.toThrow('Cannot delete technician with existing labor items');
    });
  });

  describe('getTechnicianStats', () => {
    it('should return technician statistics', async () => {
      // Arrange
      const mockSpecializationStats = [
        { specialization: 'Engine Repair', _count: { specialization: 5 } },
        { specialization: 'Transmission', _count: { specialization: 3 } }
      ];

      const mockRecentHires = [
        {
          id: 'tech1',
          employeeId: 'TECH001',
          specialization: 'Engine Repair',
          userProfile: {
            id: 'profile1',
            name: 'John Doe',
            phone: '+1234567890',
            profileImage: null,
            role: 'TECHNICIAN'
          }
        }
      ];

      mockPrisma.technician.count
        .mockResolvedValueOnce(10) // totalTechnicians
        .mockResolvedValueOnce(7); // activeTechnicians

      mockPrisma.technician.groupBy.mockResolvedValue(mockSpecializationStats as any);
      mockPrisma.technician.findMany.mockResolvedValue(mockRecentHires as any);

      // Act
      const result = await technicianService.getTechnicianStats();

      // Assert
      expect(result.totalTechnicians).toBe(10);
      expect(result.activeTechnicians).toBe(7);
      expect(result.techniciansBySpecialization).toHaveLength(2);
      expect(result.techniciansBySpecialization[0]).toEqual({
        specialization: 'Engine Repair',
        count: 5
      });
      expect(result.recentHires).toHaveLength(1);
    });
  });

  describe('getCurrentlyWorkingTechnicians', () => {
    it('should return currently working technicians', async () => {
      // Arrange
      const mockTechnicians = [
        {
          id: 'tech1',
          userProfile: {
            id: 'profile1',
            name: 'John Doe',
            phone: '+1234567890',
            profileImage: null,
            role: 'TECHNICIAN'
          },
          laborItems: [
            {
              id: 'labor1',
              description: 'Oil change',
              startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
              estimatedMinutes: 60,
              actualMinutes: null,
              status: 'IN_PROGRESS',
              workOrder: { workOrderNumber: 'WO-001' }
            }
          ],
          inspections: [],
          partInstallations: [],
          _count: {
            inspections: 5,
            qcChecks: 2,
            laborItems: 15,
            partInstallations: 8
          }
        }
      ];

      mockPrisma.technician.findMany.mockResolvedValue(mockTechnicians as any);

      // Act
      const result = await technicianService.getCurrentlyWorkingTechnicians();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].technician.id).toBe('tech1');
      expect(result[0].currentWork.activeLaborItems).toHaveLength(1);
      expect(result[0].currentWork.activeLaborItems[0].timeWorked).toBeGreaterThanOrEqual(30);
      expect(result[0].workSummary.totalActiveTasks).toBe(1);
    });
  });

  describe('getWorkingTechniciansSimple', () => {
    it('should return simplified working technicians data', async () => {
      // Arrange
      const mockTechnicians = [
        {
          userProfile: {
            name: 'John Doe',
            profileImage: 'john.jpg'
          },
          laborItems: [
            {
              workOrder: { workOrderNumber: 'WO-001' },
              description: 'Oil change',
              startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
              estimatedMinutes: 60
            }
          ],
          partInstallations: []
        }
      ];

      mockPrisma.technician.findMany.mockResolvedValue(mockTechnicians as any);

      // Act
      const result = await technicianService.getWorkingTechniciansSimple();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].technicianName).toBe('John Doe');
      expect(result[0].workOrderNumber).toBe('WO-001');
      expect(result[0].taskType).toBe('Labor');
      expect(result[0].timeWorkedMinutes).toBeGreaterThanOrEqual(30);
    });
  });

  describe('getTechnicianMonthlyPerformance', () => {
    it('should return technician monthly performance data', async () => {
      // Arrange
      const mockTechnicians = [
        {
          id: 'tech1',
          employeeId: 'TECH001',
          userProfile: { name: 'John Doe' }
        }
      ];

      mockPrisma.technician.findMany.mockResolvedValue(mockTechnicians as any);
      mockPrisma.workOrderInspection.count.mockResolvedValue(5);
      mockPrisma.workOrderLabor.count.mockResolvedValue(10);
      mockPrisma.workOrderPart.count.mockResolvedValue(8);
      mockPrisma.workOrderLabor.findMany.mockResolvedValue([
        { actualMinutes: 120 },
        { actualMinutes: 90 }
      ] as any);

      // Act
      const result = await technicianService.getTechnicianMonthlyPerformance();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].technicianId).toBe('tech1');
      expect(result[0].inspectionsCompleted).toBe(5);
      expect(result[0].laborTasksCompleted).toBe(10);
      expect(result[0].partsInstalled).toBe(8);
      expect(result[0].totalTasks).toBe(23);
      expect(result[0].totalHoursWorked).toBe(3.5); // (120 + 90) / 60
    });
  });

  describe('searchTechnicians', () => {
    it('should search technicians by query', async () => {
      // Arrange
      const query = 'John';
      const mockTechnicians = [
        {
          id: 'tech1',
          employeeId: 'TECH001',
          specialization: 'Engine Repair',
          userProfile: {
            id: 'profile1',
            name: 'John Doe',
            phone: '+1234567890',
            profileImage: null,
            role: 'TECHNICIAN'
          },
          _count: {
            inspections: 5,
            qcChecks: 2,
            laborItems: 15,
            partInstallations: 8
          }
        }
      ];

      mockPrisma.technician.findMany.mockResolvedValue(mockTechnicians as any);

      // Act
      const result = await technicianService.searchTechnicians(query);

      // Assert
      expect(mockPrisma.technician.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { employeeId: { contains: query, mode: 'insensitive' } },
            { specialization: { contains: query, mode: 'insensitive' } },
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

  describe('getWorkOrdersByTechnician', () => {
    it('should return work orders for technician', async () => {
      // Arrange
      const technicianId = 'tech123';
      const filters = { status: 'COMPLETED', limit: 10, offset: 0 };

      const mockTechnician = { id: technicianId };
      const mockLaborItems = [
        {
          workOrder: {
            id: 'wo1',
            workOrderNumber: 'WO-001',
            status: 'COMPLETED',
            customer: { id: 'c1', name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
            vehicle: { id: 'v1', make: 'Toyota', model: 'Camry', year: 2020, vin: 'VIN123', licensePlate: 'ABC123' },
            appointment: { id: 'a1', requestedAt: new Date(), startTime: new Date(), endTime: new Date(), status: 'COMPLETED', priority: 'NORMAL', notes: 'Test appointment' },
            laborItems: []
          }
        }
      ];

      mockPrisma.technician.findUnique.mockResolvedValue(mockTechnician as any);
      mockPrisma.workOrderLabor.findMany.mockResolvedValue(mockLaborItems as any);

      // Act
      const result = await technicianService.getWorkOrdersByTechnician(technicianId, filters);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].workOrderNumber).toBe('WO-001');
      expect(result[0].status).toBe('COMPLETED');
    });

    it('should throw error when technician not found', async () => {
      // Arrange
      const technicianId = 'nonexistent';
      mockPrisma.technician.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(technicianService.getWorkOrdersByTechnician(technicianId)).rejects.toThrow('Technician not found');
    });
  });

  describe('getTechnicianWorkingStatusCounts', () => {
    it('should return technician working status counts', async () => {
      // Arrange
      mockPrisma.technician.count
        .mockResolvedValueOnce(10) // totalTechnicians
        .mockResolvedValueOnce(7); // currentlyWorking

      // Act
      const result = await technicianService.getTechnicianWorkingStatusCounts();

      // Assert
      expect(result.totalTechnicians).toBe(10);
      expect(result.currentlyWorking).toBe(7);
      expect(result.notWorking).toBe(3);
    });
  });

  describe('getTechnicianDetailedInfo', () => {
    it('should return detailed technician information', async () => {
      // Arrange
      const technicianId = 'tech123';
      const mockTechnician = {
        id: technicianId,
        employeeId: 'TECH001',
        specialization: 'Engine Repair',
        userProfile: {
          id: 'profile123',
          name: 'John Doe',
          phone: '+1234567890',
          profileImage: null,
          role: 'TECHNICIAN'
        },
        _count: {
          inspections: 5,
          qcChecks: 2,
          laborItems: 15,
          partInstallations: 8
        }
      };

      mockPrisma.technician.findUnique.mockResolvedValue(mockTechnician as any);
      mockPrisma.workOrderLabor.findMany.mockResolvedValue([
        { actualMinutes: 120, createdAt: new Date() },
        { actualMinutes: 90, createdAt: new Date() }
      ] as any);

      mockPrisma.$queryRaw
        .mockResolvedValueOnce([{ count: 28 }]) // totalTasksCompleted
        .mockResolvedValueOnce([{ count: 15 }]) // last30DaysTasks
        .mockResolvedValueOnce([{ total: 2500 }]) // totalRevenueGenerated
        .mockResolvedValueOnce([{ total: 1200 }]) // last30DaysRevenue
        .mockResolvedValueOnce([{ count: 3 }]); // activeTasksCount

      mockPrisma.technician.count.mockResolvedValue(1); // currentWorkingStatus
      mockPrisma.workOrderLabor.findMany.mockResolvedValue([]); // active labor items
      mockPrisma.workOrderInspection.findMany.mockResolvedValue([]); // active inspections
      mockPrisma.workOrderPart.findMany.mockResolvedValue([]); // active parts

      // Act
      const result = await technicianService.getTechnicianDetailedInfo(technicianId);

      // Assert
      expect(result?.id).toBe(technicianId);
      expect(result?.stats.totalTasksCompleted).toBe(28);
      expect(result?.stats.totalHoursWorked).toBe(3.5); // (120 + 90) / 60
      expect(result?.stats.totalRevenueGenerated).toBe(2500);
      expect(result?.stats.currentWorkingStatus).toBe(true);
    });

    it('should return null when technician not found', async () => {
      // Arrange
      const technicianId = 'nonexistent';
      mockPrisma.technician.findUnique.mockResolvedValue(null);

      // Act
      const result = await technicianService.getTechnicianDetailedInfo(technicianId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('formatTechnicianResponse', () => {
    it('should format technician response correctly', () => {
      // Arrange
      const technician = {
        id: 'tech123',
        userProfileId: 'profile123',
        employeeId: 'TECH001',
        specialization: 'Engine Repair',
        certifications: ['ASE Certified'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        userProfile: {
          id: 'profile123',
          name: 'John Doe',
          phone: '+1234567890',
          profileImage: 'john.jpg',
          role: 'TECHNICIAN'
        },
        _count: {
          inspections: 5,
          qcChecks: 2,
          laborItems: 15,
          partInstallations: 8
        }
      };

      // Act
      const result = (technicianService as any).formatTechnicianResponse(technician);

      // Assert
      expect(result.id).toBe('tech123');
      expect(result.employeeId).toBe('TECH001');
      expect(result.specialization).toBe('Engine Repair');
      expect(result.certifications).toEqual(['ASE Certified']);
      expect(result.inspectionsCount).toBe(5);
      expect(result.qcChecksCount).toBe(2);
      expect(result.laborItemsCount).toBe(15);
      expect(result.partInstallationsCount).toBe(8);
    });

    it('should handle missing counts', () => {
      // Arrange
      const technician = {
        id: 'tech123',
        userProfileId: 'profile123',
        employeeId: 'TECH001',
        specialization: 'Engine Repair',
        certifications: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        userProfile: {
          id: 'profile123',
          name: 'John Doe',
          phone: '+1234567890',
          profileImage: null,
          role: 'TECHNICIAN'
        }
      };

      // Act
      const result = (technicianService as any).formatTechnicianResponse(technician);

      // Assert
      expect(result.inspectionsCount).toBe(0);
      expect(result.qcChecksCount).toBe(0);
      expect(result.laborItemsCount).toBe(0);
      expect(result.partInstallationsCount).toBe(0);
    });
  });
});