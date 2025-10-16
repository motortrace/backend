import { CannedServiceService } from '../../../modules/canned-services/canned-services.service';
import { PrismaClient } from '@prisma/client';
import { CreateCannedServiceRequest, UpdateCannedServiceRequest, CannedServiceFilters } from '../../../modules/canned-services/canned-services.types';

// Mock Prisma Client
jest.mock('@prisma/client');

describe('CannedServiceService', () => {
  let cannedService: CannedServiceService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    cannedService = new CannedServiceService(mockPrisma);
  });

  describe('createCannedService', () => {
    it('should create a canned service successfully', async () => {
      // Arrange
      const serviceData: CreateCannedServiceRequest = {
        code: 'OIL001',
        name: 'Oil Change',
        description: 'Complete oil change service',
        duration: 60,
        price: 50.00,
        isAvailable: true
      };

      const mockCreatedService = {
        id: 'service123',
        ...serviceData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.cannedService.findUnique.mockResolvedValue(null); // No existing code
      mockPrisma.cannedService.create.mockResolvedValue(mockCreatedService as any);

      // Act
      const result = await cannedService.createCannedService(serviceData);

      // Assert
      expect(mockPrisma.cannedService.findUnique).toHaveBeenCalledWith({
        where: { code: 'OIL001' }
      });
      expect(mockPrisma.cannedService.create).toHaveBeenCalledWith({
        data: serviceData
      });
      expect(result).toEqual(mockCreatedService);
    });

    it('should throw error when code already exists', async () => {
      // Arrange
      const serviceData: CreateCannedServiceRequest = {
        code: 'OIL001',
        name: 'Oil Change',
        duration: 60,
        price: 50.00
      };

      const existingService = { id: 'existing123', code: 'OIL001' };
      mockPrisma.cannedService.findUnique.mockResolvedValue(existingService as any);

      // Act & Assert
      await expect(cannedService.createCannedService(serviceData)).rejects.toThrow("Canned service with code 'OIL001' already exists");
    });
  });

  describe('createCannedServiceWithLabor', () => {
    it('should create canned service with labor operations successfully', async () => {
      // Arrange
      const serviceData: CreateCannedServiceRequest = {
        code: 'OIL001',
        name: 'Oil Change',
        description: 'Complete oil change service',
        duration: 60,
        price: 50.00,
        variantLabel: 'Standard',
        vehicleType: 'SEDAN',
        hasOptionalParts: false,
        hasOptionalLabor: false,
        category: 'MAINTENANCE',
        minVehicleAge: 0,
        maxVehicleMileage: 10000,
        isArchived: false
      };

      const laborOperations = [
        { laborCatalogId: 'labor1', sequence: 1, notes: 'First step' },
        { laborCatalogId: 'labor2', sequence: 2, notes: 'Second step' }
      ];

      const mockLaborCatalogs = [
        { id: 'labor1', isActive: true },
        { id: 'labor2', isActive: true }
      ];

      const mockCreatedService = {
        id: 'service123',
        ...serviceData,
        laborOperations: [
          {
            id: 'op1',
            sequence: 1,
            notes: 'First step',
            laborCatalog: { id: 'labor1', code: 'LAB1', name: 'Labor 1', estimatedMinutes: 30, isActive: true }
          },
          {
            id: 'op2',
            sequence: 2,
            notes: 'Second step',
            laborCatalog: { id: 'labor2', code: 'LAB2', name: 'Labor 2', estimatedMinutes: 30, isActive: true }
          }
        ],
        partsCategories: []
      };

      mockPrisma.cannedService.findUnique.mockResolvedValue(null);
      mockPrisma.laborCatalog.findMany.mockResolvedValue(mockLaborCatalogs as any);
      mockPrisma.cannedService.create.mockResolvedValue(mockCreatedService as any);

      // Act
      const result = await cannedService.createCannedServiceWithLabor(serviceData, laborOperations);

      // Assert
      expect(mockPrisma.laborCatalog.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['labor1', 'labor2'] },
          isActive: true
        }
      });
      expect(mockPrisma.cannedService.create).toHaveBeenCalled();
      expect(result.laborOperations).toHaveLength(2);
      expect(result.hasOptionalParts).toBe(false);
    });

    it('should throw error when labor catalog IDs are invalid', async () => {
      // Arrange
      const serviceData: CreateCannedServiceRequest = {
        code: 'OIL001',
        name: 'Oil Change',
        duration: 60,
        price: 50.00
      };

      const laborOperations = [
        { laborCatalogId: 'invalid1', sequence: 1 },
        { laborCatalogId: 'invalid2', sequence: 2 }
      ];

      mockPrisma.cannedService.findUnique.mockResolvedValue(null);
      mockPrisma.laborCatalog.findMany.mockResolvedValue([]); // No valid labor catalogs

      // Act & Assert
      await expect(cannedService.createCannedServiceWithLabor(serviceData, laborOperations)).rejects.toThrow('Invalid or inactive labor catalog IDs: invalid1, invalid2');
    });
  });

  describe('getCannedServices', () => {
    it('should return canned services with filters', async () => {
      // Arrange
      const filters: CannedServiceFilters = {
        isAvailable: true,
        category: 'MAINTENANCE',
        search: 'oil'
      };

      const mockServices = [
        {
          id: 'service1',
          code: 'OIL001',
          name: 'Oil Change',
          isAvailable: true,
          category: 'MAINTENANCE',
          laborOperations: []
        }
      ];

      mockPrisma.cannedService.findMany.mockResolvedValue(mockServices as any);

      // Act
      const result = await cannedService.getCannedServices(filters);

      // Assert
      expect(mockPrisma.cannedService.findMany).toHaveBeenCalledWith({
        where: {
          isAvailable: true,
          isArchived: false,
          category: 'MAINTENANCE',
          OR: [
            { name: { contains: 'oil', mode: 'insensitive' } },
            { description: { contains: 'oil', mode: 'insensitive' } },
            { code: { contains: 'oil', mode: 'insensitive' } },
            { variantLabel: { contains: 'oil', mode: 'insensitive' } }
          ]
        },
        include: {
          laborOperations: {
            include: {
              laborCatalog: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  estimatedMinutes: true,
                  isActive: true
                }
              }
            },
            orderBy: {
              sequence: 'asc'
            }
          }
        },
        orderBy: [
          { isAvailable: 'desc' },
          { name: 'asc' }
        ]
      });
      expect(result).toEqual(mockServices);
    });

    it('should return all services when no filters provided', async () => {
      // Arrange
      const mockServices = [
        {
          id: 'service1',
          code: 'OIL001',
          name: 'Oil Change',
          laborOperations: []
        }
      ];

      mockPrisma.cannedService.findMany.mockResolvedValue(mockServices as any);

      // Act
      const result = await cannedService.getCannedServices();

      // Assert
      expect(mockPrisma.cannedService.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: expect.any(Array)
      });
      expect(result).toEqual(mockServices);
    });
  });

  describe('getCannedServiceById', () => {
    it('should return canned service when found', async () => {
      // Arrange
      const serviceId = 'service123';
      const mockService = {
        id: serviceId,
        code: 'OIL001',
        name: 'Oil Change',
        laborOperations: [
          {
            laborCatalog: { id: 'labor1' }
          }
        ]
      };

      mockPrisma.cannedService.findUnique.mockResolvedValue(mockService as any);

      // Act
      const result = await cannedService.getCannedServiceById(serviceId);

      // Assert
      expect(mockPrisma.cannedService.findUnique).toHaveBeenCalledWith({
        where: { id: serviceId },
        include: expect.any(Object)
      });
      expect(result?.serviceIds).toEqual(['labor1']);
    });

    it('should return null when service not found', async () => {
      // Arrange
      const serviceId = 'nonexistent';
      mockPrisma.cannedService.findUnique.mockResolvedValue(null);

      // Act
      const result = await cannedService.getCannedServiceById(serviceId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getCannedServiceByCode', () => {
    it('should return canned service when found by code', async () => {
      // Arrange
      const serviceCode = 'OIL001';
      const mockService = {
        id: 'service123',
        code: serviceCode,
        name: 'Oil Change',
        laborOperations: []
      };

      mockPrisma.cannedService.findUnique.mockResolvedValue(mockService as any);

      // Act
      const result = await cannedService.getCannedServiceByCode(serviceCode);

      // Assert
      expect(mockPrisma.cannedService.findUnique).toHaveBeenCalledWith({
        where: { code: serviceCode },
        include: expect.any(Object)
      });
      expect(result?.code).toBe(serviceCode);
    });
  });

  describe('getCannedServiceDetails', () => {
    it('should return detailed canned service information', async () => {
      // Arrange
      const serviceId = 'service123';
      const mockService = {
        id: serviceId,
        code: 'OIL001',
        name: 'Oil Change',
        description: 'Complete oil change',
        duration: 60,
        price: 50.00,
        isAvailable: true,
        variantLabel: 'Standard',
        vehicleType: 'SEDAN',
        hasOptionalParts: false,
        hasOptionalLabor: false,
        category: 'MAINTENANCE',
        minVehicleAge: 0,
        maxVehicleMileage: 10000,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        laborOperations: [
          {
            id: 'op1',
            sequence: 1,
            notes: 'First step',
            laborCatalog: {
              id: 'labor1',
              code: 'LAB1',
              name: 'Labor 1',
              description: 'Labor description',
              estimatedMinutes: 30,
              category: 'MAINTENANCE',
              isActive: true
            }
          }
        ],
        partsCategories: [
          {
            id: 'pc1',
            isRequired: true,
            notes: 'Required part',
            category: {
              id: 'cat1',
              name: 'Engine Parts'
            }
          }
        ]
      };

      mockPrisma.cannedService.findUnique.mockResolvedValue(mockService as any);

      // Act
      const result = await cannedService.getCannedServiceDetails(serviceId);

      // Assert
      expect(result?.id).toBe(serviceId);
      expect(result?.laborOperations).toHaveLength(1);
      expect(result?.partsCategories).toHaveLength(1);
      expect(result?.laborOperations[0].labor).toEqual(mockService.laborOperations[0].laborCatalog);
    });
  });

  describe('updateCannedService', () => {
    it('should update canned service successfully', async () => {
      // Arrange
      const serviceId = 'service123';
      const updateData: UpdateCannedServiceRequest = {
        name: 'Updated Oil Change',
        price: 55.00,
        laborOperations: [
          { laborCatalogId: 'labor1', sequence: 1, notes: 'Updated step' }
        ]
      };

      const mockLaborCatalogs = [{ id: 'labor1', isActive: true }];
      const mockUpdatedService = {
        id: serviceId,
        code: 'OIL001',
        name: 'Updated Oil Change',
        price: 55.00,
        laborOperations: [
          {
            id: 'op1',
            sequence: 1,
            notes: 'Updated step',
            laborCatalog: { id: 'labor1', code: 'LAB1', name: 'Labor 1', estimatedMinutes: 30, isActive: true }
          }
        ]
      };

      mockPrisma.cannedService.findFirst.mockResolvedValue(null); // No code conflict
      mockPrisma.cannedServiceLabor.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.laborCatalog.findMany.mockResolvedValue(mockLaborCatalogs as any);
      mockPrisma.cannedServiceLabor.createMany.mockResolvedValue({ count: 1 });
      mockPrisma.cannedService.update.mockResolvedValue(mockUpdatedService as any);

      // Act
      const result = await cannedService.updateCannedService(serviceId, updateData);

      // Assert
      expect(mockPrisma.cannedServiceLabor.deleteMany).toHaveBeenCalledWith({
        where: { cannedServiceId: serviceId }
      });
      expect(mockPrisma.cannedServiceLabor.createMany).toHaveBeenCalled();
      expect(mockPrisma.cannedService.update).toHaveBeenCalledWith({
        where: { id: serviceId },
        data: {
          name: 'Updated Oil Change',
          price: 55.00
        },
        include: expect.any(Object)
      });
      expect(result.serviceIds).toEqual(['labor1']);
    });

    it('should throw error when updating to existing code', async () => {
      // Arrange
      const serviceId = 'service123';
      const updateData: UpdateCannedServiceRequest = {
        code: 'EXISTING'
      };

      const existingService = { id: 'other123', code: 'EXISTING' };
      mockPrisma.cannedService.findFirst.mockResolvedValue(existingService as any);

      // Act & Assert
      await expect(cannedService.updateCannedService(serviceId, updateData)).rejects.toThrow("Canned service with code 'EXISTING' already exists");
    });
  });

  describe('deleteCannedService', () => {
    it('should delete canned service successfully', async () => {
      // Arrange
      const serviceId = 'service123';

      mockPrisma.workOrderService.findFirst.mockResolvedValue(null); // Not used in work orders
      mockPrisma.appointmentCannedService.findFirst.mockResolvedValue(null); // Not used in appointments

      // Act
      await cannedService.deleteCannedService(serviceId);

      // Assert
      expect(mockPrisma.workOrderService.findFirst).toHaveBeenCalledWith({
        where: { cannedServiceId: serviceId }
      });
      expect(mockPrisma.appointmentCannedService.findFirst).toHaveBeenCalledWith({
        where: { cannedServiceId: serviceId }
      });
      expect(mockPrisma.cannedService.delete).toHaveBeenCalledWith({
        where: { id: serviceId }
      });
    });

    it('should throw error when service is used in work orders', async () => {
      // Arrange
      const serviceId = 'service123';
      const workOrderService = { id: 'wo123', cannedServiceId: serviceId };

      mockPrisma.workOrderService.findFirst.mockResolvedValue(workOrderService as any);

      // Act & Assert
      await expect(cannedService.deleteCannedService(serviceId)).rejects.toThrow('Cannot delete canned service that is being used in work orders');
    });

    it('should throw error when service is used in appointments', async () => {
      // Arrange
      const serviceId = 'service123';
      const appointmentService = { id: 'appt123', cannedServiceId: serviceId };

      mockPrisma.workOrderService.findFirst.mockResolvedValue(null);
      mockPrisma.appointmentCannedService.findFirst.mockResolvedValue(appointmentService as any);

      // Act & Assert
      await expect(cannedService.deleteCannedService(serviceId)).rejects.toThrow('Cannot delete canned service that is being used in appointments');
    });
  });

  describe('toggleAvailability', () => {
    it('should toggle service availability', async () => {
      // Arrange
      const serviceId = 'service123';
      const currentService = {
        id: serviceId,
        code: 'OIL001',
        name: 'Oil Change',
        isAvailable: true
      };

      const updatedService = {
        ...currentService,
        isAvailable: false
      };

      mockPrisma.cannedService.findUnique.mockResolvedValue(currentService as any);
      mockPrisma.cannedService.update.mockResolvedValue(updatedService as any);

      // Act
      const result = await cannedService.toggleAvailability(serviceId);

      // Assert
      expect(mockPrisma.cannedService.update).toHaveBeenCalledWith({
        where: { id: serviceId },
        data: { isAvailable: false }
      });
      expect(result.isAvailable).toBe(false);
    });

    it('should throw error when service not found', async () => {
      // Arrange
      const serviceId = 'nonexistent';
      mockPrisma.cannedService.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(cannedService.toggleAvailability(serviceId)).rejects.toThrow('Canned service not found');
    });
  });

  describe('bulkUpdatePrices', () => {
    it('should update prices with percentage increase', async () => {
      // Arrange
      const percentageIncrease = 10; // 10% increase

      mockPrisma.cannedService.updateMany.mockResolvedValue({ count: 5 });

      // Act
      const result = await cannedService.bulkUpdatePrices(percentageIncrease);

      // Assert
      expect(mockPrisma.cannedService.updateMany).toHaveBeenCalledWith({
        data: {
          price: {
            multiply: 1.1 // 1 + (10/100)
          }
        }
      });
      expect(result).toBe(5);
    });

    it('should handle price decrease', async () => {
      // Arrange
      const percentageIncrease = -5; // 5% decrease

      mockPrisma.cannedService.updateMany.mockResolvedValue({ count: 3 });

      // Act
      const result = await cannedService.bulkUpdatePrices(percentageIncrease);

      // Assert
      expect(mockPrisma.cannedService.updateMany).toHaveBeenCalledWith({
        data: {
          price: {
            multiply: 0.95 // 1 + (-5/100)
          }
        }
      });
      expect(result).toBe(3);
    });

    it('should throw error for excessive decrease', async () => {
      // Arrange
      const percentageIncrease = -150; // 150% decrease (invalid)

      // Act & Assert
      await expect(cannedService.bulkUpdatePrices(percentageIncrease)).rejects.toThrow('Percentage decrease cannot exceed 100%');
    });
  });

  describe('getServicePopularity', () => {
    it('should return service popularity data', async () => {
      // Arrange
      const mockGroupByResult = [
        { cannedServiceId: 'service1', _count: { cannedServiceId: 10 } },
        { cannedServiceId: 'service2', _count: { cannedServiceId: 5 } }
      ];

      const mockServices = [
        { id: 'service1', name: 'Oil Change', code: 'OIL001' },
        { id: 'service2', name: 'Tire Rotation', code: 'TIRE001' }
      ];

      mockPrisma.appointmentCannedService.groupBy.mockResolvedValue(mockGroupByResult as any);
      mockPrisma.cannedService.findUnique
        .mockResolvedValueOnce(mockServices[0] as any)
        .mockResolvedValueOnce(mockServices[1] as any);

      // Act
      const result = await cannedService.getServicePopularity();

      // Assert
      expect(result).toEqual([
        {
          serviceId: 'service1',
          serviceName: 'Oil Change',
          serviceCode: 'OIL001',
          bookingCount: 10
        },
        {
          serviceId: 'service2',
          serviceName: 'Tire Rotation',
          serviceCode: 'TIRE001',
          bookingCount: 5
        }
      ]);
    });
  });

  describe('getRevenueByService', () => {
    it('should return revenue data by service', async () => {
      // Arrange
      const mockGroupByResult = [
        { cannedServiceId: 'service1', _sum: { subtotal: 500 }, _count: { cannedServiceId: 10 } },
        { cannedServiceId: 'service2', _sum: { subtotal: 300 }, _count: { cannedServiceId: 6 } }
      ];

      const mockServices = [
        { id: 'service1', name: 'Oil Change', code: 'OIL001' },
        { id: 'service2', name: 'Tire Rotation', code: 'TIRE001' }
      ];

      mockPrisma.workOrderService.groupBy.mockResolvedValue(mockGroupByResult as any);
      mockPrisma.cannedService.findUnique
        .mockResolvedValueOnce(mockServices[0] as any)
        .mockResolvedValueOnce(mockServices[1] as any);

      // Act
      const result = await cannedService.getRevenueByService();

      // Assert
      expect(result).toEqual([
        {
          serviceId: 'service1',
          serviceName: 'Oil Change',
          serviceCode: 'OIL001',
          totalRevenue: 500,
          bookingCount: 10,
          averageRevenue: 50
        },
        {
          serviceId: 'service2',
          serviceName: 'Tire Rotation',
          serviceCode: 'TIRE001',
          totalRevenue: 300,
          bookingCount: 6,
          averageRevenue: 50
        }
      ]);
    });
  });

  describe('getServiceCategories', () => {
    it('should return service categories with revenue', async () => {
      // Arrange
      const mockServices = [
        { id: 'service1', category: 'MAINTENANCE' },
        { id: 'service2', category: 'MAINTENANCE' },
        { id: 'service3', category: 'REPAIR' }
      ];

      mockPrisma.cannedService.findMany.mockResolvedValue(mockServices as any);
      mockPrisma.workOrderService.aggregate
        .mockResolvedValueOnce({ _sum: { subtotal: 800 } } as any) // MAINTENANCE revenue
        .mockResolvedValueOnce({ _sum: { subtotal: 200 } } as any); // REPAIR revenue

      // Act
      const result = await cannedService.getServiceCategories();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        category: 'MAINTENANCE',
        serviceCount: 2,
        totalRevenue: 800
      });
      expect(result[1]).toEqual({
        category: 'REPAIR',
        serviceCount: 1,
        totalRevenue: 200
      });
    });
  });
});