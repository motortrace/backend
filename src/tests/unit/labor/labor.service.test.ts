import { LaborService } from '../../../modules/labor/labor.service';
import { PrismaClient } from '@prisma/client';
import { CreateLaborCatalogRequest, UpdateLaborCatalogRequest, CreateWorkOrderLaborRequest, UpdateWorkOrderLaborRequest, LaborCatalogFilter, WorkOrderLaborFilter, CreateLaborRequest } from '../../../modules/labor/labor.types';

// Mock Prisma Client
jest.mock('@prisma/client');

describe('LaborService', () => {
  let laborService: LaborService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    laborService = new LaborService(mockPrisma);
  });

  describe('createLabor', () => {
    it('should create labor successfully', async () => {
      // Arrange
      const laborData: CreateLaborRequest = {
        workOrderId: 'wo123',
        serviceId: 'service123',
        laborCatalogId: 'labor123',
        description: 'Oil change labor',
        estimatedMinutes: 60,
        technicianId: 'tech123',
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T11:00:00Z'),
        notes: 'Completed successfully'
      };

      const mockWorkOrder = { id: 'wo123', workOrderNumber: 'WO-001', status: 'IN_PROGRESS' };
      const mockService = { id: 'service123', workOrderId: 'wo123' };
      const mockTechnician = { id: 'tech123', userProfileId: 'profile123' };
      const mockLaborCatalog = { id: 'labor123', code: 'OIL', name: 'Oil Change', category: 'MAINTENANCE' };

      const mockCreatedLabor = {
        id: 'labor123',
        ...laborData,
        workOrder: mockWorkOrder,
        laborCatalog: mockLaborCatalog,
        technician: mockTechnician
      };

      mockPrisma.workOrder.findUnique.mockResolvedValue(mockWorkOrder as any);
      mockPrisma.workOrderService.findFirst.mockResolvedValue(mockService as any);
      mockPrisma.technician.findUnique.mockResolvedValue(mockTechnician as any);
      mockPrisma.workOrderLabor.create.mockResolvedValue(mockCreatedLabor as any);

      // Act
      const result = await laborService.createLabor(laborData);

      // Assert
      expect(mockPrisma.workOrder.findUnique).toHaveBeenCalledWith({
        where: { id: 'wo123' }
      });
      expect(mockPrisma.workOrderService.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'service123',
          workOrderId: 'wo123'
        }
      });
      expect(mockPrisma.technician.findUnique).toHaveBeenCalledWith({
        where: { id: 'tech123' }
      });
      expect(mockPrisma.workOrderLabor.create).toHaveBeenCalledWith({
        data: laborData,
        include: expect.any(Object)
      });
      expect(result.id).toBe('labor123');
    });

    it('should throw error when work order not found', async () => {
      // Arrange
      const laborData: CreateLaborRequest = {
        workOrderId: 'nonexistent',
        serviceId: 'service123',
        laborCatalogId: 'labor123',
        description: 'Test labor'
      };

      mockPrisma.workOrder.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(laborService.createLabor(laborData)).rejects.toThrow("Work order with ID 'nonexistent' not found");
    });

    it('should throw error when service not found in work order', async () => {
      // Arrange
      const laborData: CreateLaborRequest = {
        workOrderId: 'wo123',
        serviceId: 'nonexistent',
        laborCatalogId: 'labor123',
        description: 'Test labor'
      };

      const mockWorkOrder = { id: 'wo123' };

      mockPrisma.workOrder.findUnique.mockResolvedValue(mockWorkOrder as any);
      mockPrisma.workOrderService.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(laborService.createLabor(laborData)).rejects.toThrow("Service with ID 'nonexistent' not found in this work order");
    });

    it('should throw error when technician not found', async () => {
      // Arrange
      const laborData: CreateLaborRequest = {
        workOrderId: 'wo123',
        serviceId: 'service123',
        laborCatalogId: 'labor123',
        description: 'Test labor',
        technicianId: 'nonexistent'
      };

      const mockWorkOrder = { id: 'wo123' };
      const mockService = { id: 'service123', workOrderId: 'wo123' };

      mockPrisma.workOrder.findUnique.mockResolvedValue(mockWorkOrder as any);
      mockPrisma.workOrderService.findFirst.mockResolvedValue(mockService as any);
      mockPrisma.technician.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(laborService.createLabor(laborData)).rejects.toThrow("Technician with ID 'nonexistent' not found");
    });
  });

  describe('createLaborCatalog', () => {
    it('should create labor catalog successfully', async () => {
      // Arrange
      const catalogData: CreateLaborCatalogRequest = {
        code: 'OIL001',
        name: 'Oil Change',
        description: 'Standard oil change procedure',
        estimatedMinutes: 60,
        skillLevel: 'INTERMEDIATE',
        category: 'MAINTENANCE',
        isActive: true
      };

      const mockCreatedCatalog = {
        id: 'catalog123',
        ...catalogData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.laborCatalog.findUnique.mockResolvedValue(null); // No existing code
      mockPrisma.laborCatalog.create.mockResolvedValue(mockCreatedCatalog as any);

      // Act
      const result = await laborService.createLaborCatalog(catalogData);

      // Assert
      expect(mockPrisma.laborCatalog.findUnique).toHaveBeenCalledWith({
        where: { code: 'OIL001' }
      });
      expect(mockPrisma.laborCatalog.create).toHaveBeenCalledWith({
        data: catalogData
      });
      expect(result.id).toBe('catalog123');
    });

    it('should throw error when code already exists', async () => {
      // Arrange
      const catalogData: CreateLaborCatalogRequest = {
        code: 'OIL001',
        name: 'Oil Change',
        estimatedMinutes: 60
      };

      const existingCatalog = { id: 'existing123', code: 'OIL001' };
      mockPrisma.laborCatalog.findUnique.mockResolvedValue(existingCatalog as any);

      // Act & Assert
      await expect(laborService.createLaborCatalog(catalogData)).rejects.toThrow("Labor catalog with code 'OIL001' already exists");
    });
  });

  describe('getLaborCatalogs', () => {
    it('should return labor catalogs with filters', async () => {
      // Arrange
      const filter: LaborCatalogFilter = {
        category: 'MAINTENANCE',
        isActive: true,
        search: 'oil'
      };

      const mockCatalogs = [
        {
          id: 'catalog1',
          code: 'OIL001',
          name: 'Oil Change',
          category: 'MAINTENANCE',
          isActive: true,
          _count: { laborItems: 5 }
        }
      ];

      mockPrisma.laborCatalog.findMany.mockResolvedValue(mockCatalogs as any);

      // Act
      const result = await laborService.getLaborCatalogs(filter);

      // Assert
      expect(mockPrisma.laborCatalog.findMany).toHaveBeenCalledWith({
        where: {
          category: 'MAINTENANCE',
          isActive: true,
          OR: [
            { name: { contains: 'oil', mode: 'insensitive' } },
            { code: { contains: 'oil', mode: 'insensitive' } },
            { description: { contains: 'oil', mode: 'insensitive' } }
          ]
        },
        include: {
          _count: { select: { laborItems: true } }
        },
        orderBy: { name: 'asc' }
      });
      expect(result).toHaveLength(1);
    });

    it('should return all catalogs when no filters provided', async () => {
      // Arrange
      const mockCatalogs = [
        {
          id: 'catalog1',
          code: 'OIL001',
          name: 'Oil Change',
          _count: { laborItems: 5 }
        }
      ];

      mockPrisma.laborCatalog.findMany.mockResolvedValue(mockCatalogs as any);

      // Act
      const result = await laborService.getLaborCatalogs();

      // Assert
      expect(mockPrisma.laborCatalog.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { name: 'asc' }
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getLaborCatalogById', () => {
    it('should return labor catalog when found', async () => {
      // Arrange
      const catalogId = 'catalog123';
      const mockCatalog = {
        id: catalogId,
        code: 'OIL001',
        name: 'Oil Change',
        _count: { laborItems: 5 }
      };

      mockPrisma.laborCatalog.findUnique.mockResolvedValue(mockCatalog as any);

      // Act
      const result = await laborService.getLaborCatalogById(catalogId);

      // Assert
      expect(mockPrisma.laborCatalog.findUnique).toHaveBeenCalledWith({
        where: { id: catalogId },
        include: { _count: { select: { laborItems: true } } }
      });
      expect(result.id).toBe(catalogId);
    });

    it('should throw error when catalog not found', async () => {
      // Arrange
      const catalogId = 'nonexistent';
      mockPrisma.laborCatalog.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(laborService.getLaborCatalogById(catalogId)).rejects.toThrow("Labor catalog with ID 'nonexistent' not found");
    });
  });

  describe('updateLaborCatalog', () => {
    it('should update labor catalog successfully', async () => {
      // Arrange
      const catalogId = 'catalog123';
      const updateData: UpdateLaborCatalogRequest = {
        name: 'Updated Oil Change',
        estimatedMinutes: 75,
        category: 'MAINTENANCE'
      };

      const existingCatalog = {
        id: catalogId,
        code: 'OIL001',
        name: 'Oil Change',
        estimatedMinutes: 60
      };

      const updatedCatalog = {
        ...existingCatalog,
        ...updateData
      };

      mockPrisma.laborCatalog.findUnique.mockResolvedValue(existingCatalog as any);
      mockPrisma.laborCatalog.update.mockResolvedValue(updatedCatalog as any);

      // Act
      const result = await laborService.updateLaborCatalog(catalogId, updateData);

      // Assert
      expect(mockPrisma.laborCatalog.findUnique).toHaveBeenCalledWith({
        where: { id: catalogId }
      });
      expect(mockPrisma.laborCatalog.update).toHaveBeenCalledWith({
        where: { id: catalogId },
        data: updateData
      });
      expect(result.name).toBe('Updated Oil Change');
      expect(result.estimatedMinutes).toBe(75);
    });

    it('should throw error when catalog not found', async () => {
      // Arrange
      const catalogId = 'nonexistent';
      const updateData: UpdateLaborCatalogRequest = { name: 'Updated' };

      mockPrisma.laborCatalog.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(laborService.updateLaborCatalog(catalogId, updateData)).rejects.toThrow("Labor catalog with ID 'nonexistent' not found");
    });

    it('should throw error when updating to existing code', async () => {
      // Arrange
      const catalogId = 'catalog123';
      const updateData: UpdateLaborCatalogRequest = { code: 'EXISTING' };

      const existingCatalog = { id: catalogId, code: 'OIL001' };
      const duplicateCatalog = { id: 'other123', code: 'EXISTING' };

      mockPrisma.laborCatalog.findUnique
        .mockResolvedValueOnce(existingCatalog as any) // First call for existence check
        .mockResolvedValueOnce(duplicateCatalog as any); // Second call for code uniqueness

      // Act & Assert
      await expect(laborService.updateLaborCatalog(catalogId, updateData)).rejects.toThrow("Labor catalog with code 'EXISTING' already exists");
    });
  });

  describe('deleteLaborCatalog', () => {
    it('should delete labor catalog successfully', async () => {
      // Arrange
      const catalogId = 'catalog123';
      const mockCatalog = {
        id: catalogId,
        code: 'OIL001',
        name: 'Oil Change',
        _count: { laborItems: 0 }
      };

      mockPrisma.laborCatalog.findUnique.mockResolvedValue(mockCatalog as any);

      // Act
      const result = await laborService.deleteLaborCatalog(catalogId);

      // Assert
      expect(mockPrisma.laborCatalog.findUnique).toHaveBeenCalledWith({
        where: { id: catalogId },
        include: { _count: { select: { laborItems: true } } }
      });
      expect(mockPrisma.laborCatalog.delete).toHaveBeenCalledWith({
        where: { id: catalogId }
      });
      expect(result.id).toBe(catalogId);
    });

    it('should throw error when catalog has labor items', async () => {
      // Arrange
      const catalogId = 'catalog123';
      const mockCatalog = {
        id: catalogId,
        code: 'OIL001',
        name: 'Oil Change',
        _count: { laborItems: 3 }
      };

      mockPrisma.laborCatalog.findUnique.mockResolvedValue(mockCatalog as any);

      // Act & Assert
      await expect(laborService.deleteLaborCatalog(catalogId)).rejects.toThrow('Cannot delete labor catalog that is being used in 3 work orders');
    });
  });

  describe('createWorkOrderLabor', () => {
    it('should create work order labor successfully', async () => {
      // Arrange
      const laborData: CreateWorkOrderLaborRequest = {
        workOrderId: 'wo123',
        serviceId: 'service123',
        laborCatalogId: 'labor123',
        description: 'Oil change labor',
        estimatedMinutes: 60,
        technicianId: 'tech123'
      };

      const mockWorkOrder = { id: 'wo123' };
      const mockService = { id: 'service123', workOrderId: 'wo123' };
      const mockLaborCatalog = { id: 'labor123', code: 'OIL', name: 'Oil Change' };
      const mockTechnician = { id: 'tech123' };

      const mockCreatedLabor = {
        id: 'labor123',
        ...laborData,
        workOrder: { id: 'wo123', workOrderNumber: 'WO-001', status: 'IN_PROGRESS' },
        laborCatalog: { id: 'labor123', code: 'OIL', name: 'Oil Change', category: 'MAINTENANCE' },
        technician: { id: 'tech123', userProfileId: 'profile123' }
      };

      mockPrisma.workOrder.findUnique.mockResolvedValue(mockWorkOrder as any);
      mockPrisma.workOrderService.findFirst.mockResolvedValue(mockService as any);
      mockPrisma.laborCatalog.findUnique.mockResolvedValue(mockLaborCatalog as any);
      mockPrisma.technician.findUnique.mockResolvedValue(mockTechnician as any);
      mockPrisma.workOrderLabor.create.mockResolvedValue(mockCreatedLabor as any);

      // Act
      const result = await laborService.createWorkOrderLabor(laborData);

      // Assert
      expect(mockPrisma.workOrder.findUnique).toHaveBeenCalledWith({
        where: { id: 'wo123' }
      });
      expect(mockPrisma.workOrderService.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'service123',
          workOrderId: 'wo123'
        }
      });
      expect(mockPrisma.laborCatalog.findUnique).toHaveBeenCalledWith({
        where: { id: 'labor123' }
      });
      expect(mockPrisma.technician.findUnique).toHaveBeenCalledWith({
        where: { id: 'tech123' }
      });
      expect(result.id).toBe('labor123');
    });

    it('should throw error when work order not found', async () => {
      // Arrange
      const laborData: CreateWorkOrderLaborRequest = {
        workOrderId: 'nonexistent',
        serviceId: 'service123',
        description: 'Test labor'
      };

      mockPrisma.workOrder.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(laborService.createWorkOrderLabor(laborData)).rejects.toThrow("Work order with ID 'nonexistent' not found");
    });
  });

  describe('getWorkOrderLabors', () => {
    it('should return work order labors with filters', async () => {
      // Arrange
      const filter: WorkOrderLaborFilter = {
        workOrderId: 'wo123',
        technicianId: 'tech123',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        category: 'MAINTENANCE'
      };

      const mockLabors = [
        {
          id: 'labor1',
          workOrderId: 'wo123',
          technicianId: 'tech123',
          workOrder: { id: 'wo123', workOrderNumber: 'WO-001', status: 'IN_PROGRESS' },
          laborCatalog: { id: 'labor123', code: 'OIL', name: 'Oil Change', category: 'MAINTENANCE' },
          technician: {
            id: 'tech123',
            userProfileId: 'profile123',
            employeeId: 'EMP001',
            specialization: 'Engine Repair',
            certifications: ['ASE Certified'],
            userProfile: {
              id: 'profile123',
              name: 'John Doe',
              profileImage: 'image.jpg',
              phone: '1234567890'
            }
          }
        }
      ];

      mockPrisma.workOrderLabor.findMany.mockResolvedValue(mockLabors as any);

      // Act
      const result = await laborService.getWorkOrderLabors(filter);

      // Assert
      expect(mockPrisma.workOrderLabor.findMany).toHaveBeenCalledWith({
        where: {
          workOrderId: 'wo123',
          technicianId: 'tech123',
          createdAt: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-12-31')
          },
          laborCatalog: {
            category: 'MAINTENANCE'
          }
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' }
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getWorkOrderLaborById', () => {
    it('should return work order labor when found', async () => {
      // Arrange
      const laborId = 'labor123';
      const mockLabor = {
        id: laborId,
        workOrderId: 'wo123',
        workOrder: { id: 'wo123', workOrderNumber: 'WO-001', status: 'IN_PROGRESS' },
        laborCatalog: { id: 'labor123', code: 'OIL', name: 'Oil Change', category: 'MAINTENANCE' },
        technician: { id: 'tech123', userProfileId: 'profile123' }
      };

      mockPrisma.workOrderLabor.findUnique.mockResolvedValue(mockLabor as any);

      // Act
      const result = await laborService.getWorkOrderLaborById(laborId);

      // Assert
      expect(mockPrisma.workOrderLabor.findUnique).toHaveBeenCalledWith({
        where: { id: laborId },
        include: expect.any(Object)
      });
      expect(result.id).toBe(laborId);
    });

    it('should throw error when labor not found', async () => {
      // Arrange
      const laborId = 'nonexistent';
      mockPrisma.workOrderLabor.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(laborService.getWorkOrderLaborById(laborId)).rejects.toThrow("Work order labor with ID 'nonexistent' not found");
    });
  });

  describe('updateWorkOrderLabor', () => {
    it('should update work order labor successfully', async () => {
      // Arrange
      const laborId = 'labor123';
      const updateData: UpdateWorkOrderLaborRequest = {
        description: 'Updated labor description',
        estimatedMinutes: 75,
        technicianId: 'tech456',
        status: 'COMPLETED'
      };

      const existingLabor = {
        id: laborId,
        workOrderId: 'wo123',
        description: 'Original description',
        estimatedMinutes: 60
      };

      const mockTechnician = { id: 'tech456' };
      const updatedLabor = {
        id: laborId,
        ...existingLabor,
        ...updateData,
        workOrder: { id: 'wo123', workOrderNumber: 'WO-001', status: 'IN_PROGRESS' },
        laborCatalog: { id: 'labor123', code: 'OIL', name: 'Oil Change', category: 'MAINTENANCE' },
        technician: { id: 'tech456', userProfileId: 'profile456' }
      };

      mockPrisma.workOrderLabor.findUnique.mockResolvedValue(existingLabor as any);
      mockPrisma.technician.findUnique.mockResolvedValue(mockTechnician as any);
      mockPrisma.workOrderLabor.update.mockResolvedValue(updatedLabor as any);

      // Act
      const result = await laborService.updateWorkOrderLabor(laborId, updateData);

      // Assert
      expect(mockPrisma.workOrderLabor.findUnique).toHaveBeenCalledWith({
        where: { id: laborId }
      });
      expect(mockPrisma.technician.findUnique).toHaveBeenCalledWith({
        where: { id: 'tech456' }
      });
      expect(mockPrisma.workOrderLabor.update).toHaveBeenCalledWith({
        where: { id: laborId },
        data: updateData,
        include: expect.any(Object)
      });
      expect(result.description).toBe('Updated labor description');
      expect(result.estimatedMinutes).toBe(75);
    });

    it('should throw error when labor not found', async () => {
      // Arrange
      const laborId = 'nonexistent';
      const updateData: UpdateWorkOrderLaborRequest = { description: 'Updated' };

      mockPrisma.workOrderLabor.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(laborService.updateWorkOrderLabor(laborId, updateData)).rejects.toThrow("Work order labor with ID 'nonexistent' not found");
    });
  });

  describe('deleteWorkOrderLabor', () => {
    it('should delete work order labor successfully', async () => {
      // Arrange
      const laborId = 'labor123';
      const mockLabor = {
        id: laborId,
        workOrderId: 'wo123',
        description: 'Test labor'
      };

      mockPrisma.workOrderLabor.findUnique.mockResolvedValue(mockLabor as any);

      // Act
      const result = await laborService.deleteWorkOrderLabor(laborId);

      // Assert
      expect(mockPrisma.workOrderLabor.findUnique).toHaveBeenCalledWith({
        where: { id: laborId }
      });
      expect(mockPrisma.workOrderLabor.delete).toHaveBeenCalledWith({
        where: { id: laborId }
      });
      expect(result.id).toBe(laborId);
    });

    it('should throw error when labor not found', async () => {
      // Arrange
      const laborId = 'nonexistent';
      mockPrisma.workOrderLabor.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(laborService.deleteWorkOrderLabor(laborId)).rejects.toThrow("Work order labor with ID 'nonexistent' not found");
    });
  });

  describe('getWorkOrderLaborSummary', () => {
    it('should return labor summary for work order', async () => {
      // Arrange
      const workOrderId = 'wo123';
      const mockLaborItems = [
        {
          id: 'labor1',
          actualMinutes: 65,
          estimatedMinutes: 60,
          workOrder: { id: workOrderId, workOrderNumber: 'WO-001', status: 'IN_PROGRESS' },
          laborCatalog: { id: 'labor123', code: 'OIL', name: 'Oil Change', category: 'MAINTENANCE' },
          technician: { id: 'tech123', userProfileId: 'profile123' }
        },
        {
          id: 'labor2',
          actualMinutes: 45,
          estimatedMinutes: 50,
          workOrder: { id: workOrderId, workOrderNumber: 'WO-001', status: 'IN_PROGRESS' },
          laborCatalog: { id: 'labor456', code: 'FLT', name: 'Filter Change', category: 'MAINTENANCE' },
          technician: { id: 'tech456', userProfileId: 'profile456' }
        }
      ];

      mockPrisma.workOrderLabor.findMany.mockResolvedValue(mockLaborItems as any);

      // Act
      const result = await laborService.getWorkOrderLaborSummary(workOrderId);

      // Assert
      expect(mockPrisma.workOrderLabor.findMany).toHaveBeenCalledWith({
        where: { workOrderId },
        include: expect.any(Object)
      });
      expect(result.totalMinutes).toBe(110); // 65 + 45
      expect(result.totalEstimatedMinutes).toBe(110); // 60 + 50
      expect(result.laborItems).toHaveLength(2);
    });
  });

  describe('getLaborCategories', () => {
    it('should return unique labor categories', async () => {
      // Arrange
      const mockCategories = [
        { category: 'MAINTENANCE' },
        { category: 'REPAIR' },
        { category: 'MAINTENANCE' } // duplicate
      ];

      mockPrisma.laborCatalog.findMany.mockResolvedValue(mockCategories as any);

      // Act
      const result = await laborService.getLaborCategories();

      // Assert
      expect(mockPrisma.laborCatalog.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        select: { category: true },
        distinct: ['category']
      });
      expect(result).toEqual(['MAINTENANCE', 'REPAIR']);
    });
  });

  describe('getTechnicianLaborSummary', () => {
    it('should return labor summary for technician', async () => {
      // Arrange
      const technicianId = 'tech123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const mockLaborItems = [
        {
          id: 'labor1',
          actualMinutes: 65,
          estimatedMinutes: 60,
          workOrder: { id: 'wo123', workOrderNumber: 'WO-001', status: 'COMPLETED' },
          laborCatalog: { id: 'labor123', code: 'OIL', name: 'Oil Change', category: 'MAINTENANCE' }
        }
      ];

      mockPrisma.workOrderLabor.findMany.mockResolvedValue(mockLaborItems as any);

      // Act
      const result = await laborService.getTechnicianLaborSummary(technicianId, startDate, endDate);

      // Assert
      expect(mockPrisma.workOrderLabor.findMany).toHaveBeenCalledWith({
        where: {
          technicianId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: expect.any(Object)
      });
      expect(result.totalMinutes).toBe(65);
      expect(result.totalEstimatedMinutes).toBe(60);
      expect(result.laborItems).toHaveLength(1);
    });
  });
});