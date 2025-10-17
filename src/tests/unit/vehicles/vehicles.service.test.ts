import { VehiclesService } from '../../../modules/vehicles/vehicles.service';
import { PrismaClient } from '@prisma/client';
import { CreateVehicleRequest, UpdateVehicleRequest, VehicleFilters } from '../../../modules/vehicles/vehicles.types';

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    customer: {
      findUnique: jest.fn(),
    },
    vehicle: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    vehicleMileage: {
      findUnique: jest.fn(),
    },
    serviceRecommendation: {
      findMany: jest.fn(),
    },
    workOrder: {
      findMany: jest.fn(),
    },
  })),
}));

describe('VehiclesService', () => {
  let vehiclesService: VehiclesService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    vehiclesService = new VehiclesService(mockPrisma);
  });

  describe('createVehicle', () => {
    it('should create a vehicle successfully', async () => {
      // Arrange
      const vehicleData: CreateVehicleRequest = {
        customerId: 'customer123',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        vin: '1HGBH41JXMN109186',
        licensePlate: 'ABC123',
        imageUrl: 'https://example.com/image.jpg'
      };

      const mockCustomer = { id: 'customer123', name: 'John Doe', email: 'john@example.com' };
      const mockVehicle = {
        id: 'vehicle123',
        ...vehicleData,
        customer: mockCustomer,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.vehicle.findUnique.mockResolvedValue(null); // No existing VIN
      mockPrisma.vehicle.create.mockResolvedValue(mockVehicle as any);

      // Act
      const result = await vehiclesService.createVehicle(vehicleData);

      // Assert
      expect(mockPrisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 'customer123' }
      });
      expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { vin: '1HGBH41JXMN109186' }
      });
      expect(mockPrisma.vehicle.create).toHaveBeenCalledWith({
        data: vehicleData,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      expect(result).toEqual(mockVehicle);
    });

    it('should throw error when customer not found', async () => {
      // Arrange
      const vehicleData: CreateVehicleRequest = {
        customerId: 'nonexistent',
        make: 'Toyota',
        model: 'Camry',
        year: 2020
      };

      mockPrisma.customer.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(vehiclesService.createVehicle(vehicleData)).rejects.toThrow('Customer not found');
    });

    it('should throw error when VIN already exists', async () => {
      // Arrange
      const vehicleData: CreateVehicleRequest = {
        customerId: 'customer123',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        vin: '1HGBH41JXMN109186'
      };

      const mockCustomer = { id: 'customer123', name: 'John Doe' };
      const existingVehicle = { id: 'existing123', vin: '1HGBH41JXMN109186' };

      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.vehicle.findUnique.mockResolvedValue(existingVehicle as any);

      // Act & Assert
      await expect(vehiclesService.createVehicle(vehicleData)).rejects.toThrow('Vehicle with this VIN already exists');
    });
  });

  describe('getVehicleById', () => {
    it('should return vehicle when found', async () => {
      // Arrange
      const vehicleId = 'vehicle123';
      const mockVehicle = {
        id: vehicleId,
        make: 'Toyota',
        model: 'Camry',
        customer: { id: 'customer123', name: 'John Doe', email: 'john@example.com' }
      };

      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle as any);

      // Act
      const result = await vehiclesService.getVehicleById(vehicleId);

      // Assert
      expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: vehicleId },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      expect(result).toEqual(mockVehicle);
    });

    it('should throw error when vehicle not found', async () => {
      // Arrange
      const vehicleId = 'nonexistent';
      mockPrisma.vehicle.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(vehiclesService.getVehicleById(vehicleId)).rejects.toThrow('Vehicle not found');
    });
  });

  describe('getVehicles', () => {
    it('should return vehicles with filters', async () => {
      // Arrange
      const filters: VehicleFilters = {
        customerId: 'customer123',
        make: 'Toyota',
        search: 'Camry'
      };

      const mockVehicles = [
        {
          id: 'vehicle1',
          make: 'Toyota',
          model: 'Camry',
          customer: { id: 'customer123', name: 'John Doe', email: 'john@example.com' }
        }
      ];

      mockPrisma.vehicle.findMany.mockResolvedValue(mockVehicles as any);

      // Act
      const result = await vehiclesService.getVehicles(filters);

      // Assert
      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith({
        where: {
          customerId: 'customer123',
          make: { contains: 'Toyota', mode: 'insensitive' },
          OR: [
            { make: { contains: 'Camry', mode: 'insensitive' } },
            { model: { contains: 'Camry', mode: 'insensitive' } },
            { vin: { contains: 'Camry', mode: 'insensitive' } },
            { licensePlate: { contains: 'Camry', mode: 'insensitive' } }
          ]
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      expect(result).toEqual(mockVehicles);
    });

    it('should return all vehicles when no filters provided', async () => {
      // Arrange
      const filters: VehicleFilters = {};
      const mockVehicles = [
        {
          id: 'vehicle1',
          make: 'Toyota',
          model: 'Camry',
          customer: { id: 'customer123', name: 'John Doe', email: 'john@example.com' }
        }
      ];

      mockPrisma.vehicle.findMany.mockResolvedValue(mockVehicles as any);

      // Act
      const result = await vehiclesService.getVehicles(filters);

      // Assert
      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      expect(result).toEqual(mockVehicles);
    });
  });

  describe('updateVehicle', () => {
    it('should update vehicle successfully', async () => {
      // Arrange
      const vehicleId = 'vehicle123';
      const updateData: UpdateVehicleRequest = {
        make: 'Honda',
        model: 'Civic',
        year: 2021
      };

      const existingVehicle = {
        id: vehicleId,
        make: 'Toyota',
        model: 'Camry',
        vin: 'old-vin'
      };

      const updatedVehicle = {
        id: vehicleId,
        ...existingVehicle,
        ...updateData,
        customer: { id: 'customer123', name: 'John Doe', email: 'john@example.com' }
      };

      mockPrisma.vehicle.findUnique.mockResolvedValue(existingVehicle as any);
      mockPrisma.vehicle.update.mockResolvedValue(updatedVehicle as any);

      // Act
      const result = await vehiclesService.updateVehicle(vehicleId, updateData);

      // Assert
      expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: vehicleId }
      });
      expect(mockPrisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: vehicleId },
        data: updateData,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      expect(result).toEqual(updatedVehicle);
    });

    it('should throw error when vehicle not found', async () => {
      // Arrange
      const vehicleId = 'nonexistent';
      const updateData: UpdateVehicleRequest = { make: 'Honda' };

      mockPrisma.vehicle.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(vehiclesService.updateVehicle(vehicleId, updateData)).rejects.toThrow('Vehicle not found');
    });

    it('should throw error when updating to existing VIN', async () => {
      // Arrange
      const vehicleId = 'vehicle123';
      const updateData: UpdateVehicleRequest = { vin: 'existing-vin' };

      const existingVehicle = {
        id: vehicleId,
        make: 'Toyota',
        model: 'Camry',
        vin: 'old-vin'
      };

      const duplicateVehicle = {
        id: 'other-vehicle',
        vin: 'existing-vin'
      };

      mockPrisma.vehicle.findUnique
        .mockResolvedValueOnce(existingVehicle as any) // First call for existence check
        .mockResolvedValueOnce(duplicateVehicle as any); // Second call for VIN uniqueness

      // Act & Assert
      await expect(vehiclesService.updateVehicle(vehicleId, updateData)).rejects.toThrow('Vehicle with this VIN already exists');
    });
  });

  describe('deleteVehicle', () => {
    it('should delete vehicle successfully', async () => {
      // Arrange
      const vehicleId = 'vehicle123';
      const mockVehicle = { id: vehicleId, make: 'Toyota', model: 'Camry' };

      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle as any);
      mockPrisma.workOrder.findMany.mockResolvedValue([]); // No associated work orders

      // Act
      await vehiclesService.deleteVehicle(vehicleId);

      // Assert
      expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: vehicleId }
      });
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith({
        where: { vehicleId }
      });
      expect(mockPrisma.vehicle.delete).toHaveBeenCalledWith({
        where: { id: vehicleId }
      });
    });

    it('should throw error when vehicle not found', async () => {
      // Arrange
      const vehicleId = 'nonexistent';

      mockPrisma.vehicle.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(vehiclesService.deleteVehicle(vehicleId)).rejects.toThrow('Vehicle not found');
    });

    it('should throw error when vehicle has associated work orders', async () => {
      // Arrange
      const vehicleId = 'vehicle123';
      const mockVehicle = { id: vehicleId, make: 'Toyota', model: 'Camry' };
      const mockWorkOrders = [{ id: 'workorder1', vehicleId }];

      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle as any);
      mockPrisma.workOrder.findMany.mockResolvedValue(mockWorkOrders as any);

      // Act & Assert
      await expect(vehiclesService.deleteVehicle(vehicleId)).rejects.toThrow('Cannot delete vehicle with associated work orders');
    });
  });

  describe('getVehiclesByCustomer', () => {
    it('should return vehicles for customer', async () => {
      // Arrange
      const customerId = 'customer123';
      const mockVehicles = [
        {
          id: 'vehicle1',
          make: 'Toyota',
          model: 'Camry',
          customer: { id: customerId, name: 'John Doe', email: 'john@example.com' }
        }
      ];

      mockPrisma.vehicle.findMany.mockResolvedValue(mockVehicles as any);

      // Act
      const result = await vehiclesService.getVehiclesByCustomer(customerId);

      // Assert
      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith({
        where: { customerId },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      expect(result).toEqual(mockVehicles);
    });
  });

  describe('getVehicleStatistics', () => {
    it('should return vehicle statistics', async () => {
      // Arrange
      const mockVehiclesByMake = [
        { make: 'Toyota', _count: { make: 5 } },
        { make: 'Honda', _count: { make: 3 } }
      ];

      const mockVehiclesByYear = [
        { year: 2020, _count: { year: 4 } },
        { year: 2021, _count: { year: 4 } }
      ];

      const mockRecentAdditions = [
        {
          id: 'vehicle1',
          make: 'Toyota',
          model: 'Camry',
          customer: { id: 'customer123', name: 'John Doe', email: 'john@example.com' }
        }
      ];

      mockPrisma.vehicle.count.mockResolvedValue(8);
      mockPrisma.vehicle.groupBy
        .mockResolvedValueOnce(mockVehiclesByMake as any)
        .mockResolvedValueOnce(mockVehiclesByYear as any);
      mockPrisma.vehicle.findMany.mockResolvedValue(mockRecentAdditions as any);

      // Act
      const result = await vehiclesService.getVehicleStatistics();

      // Assert
      expect(result).toEqual({
        totalVehicles: 8,
        vehiclesByMake: [
          { make: 'Toyota', count: 5 },
          { make: 'Honda', count: 3 }
        ],
        vehiclesByYear: [
          { year: 2020, count: 4 },
          { year: 2021, count: 4 }
        ],
        recentAdditions: mockRecentAdditions
      });
    });
  });

  describe('getVehicleMileage', () => {
    it('should return vehicle mileage', async () => {
      // Arrange
      const vehicleId = 'vehicle123';
      const mockVehicle = { id: vehicleId, make: 'Toyota', model: 'Camry' };
      const mockMileage = {
        currentMileage: 50000,
        lastUpdated: new Date('2024-01-15')
      };

      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle as any);
      mockPrisma.vehicleMileage.findUnique.mockResolvedValue(mockMileage as any);

      // Act
      const result = await vehiclesService.getVehicleMileage(vehicleId);

      // Assert
      expect(result).toEqual({
        currentMileage: 50000,
        lastUpdated: new Date('2024-01-15')
      });
    });

    it('should return zero mileage when no mileage record exists', async () => {
      // Arrange
      const vehicleId = 'vehicle123';
      const mockVehicle = { id: vehicleId, make: 'Toyota', model: 'Camry' };

      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle as any);
      mockPrisma.vehicleMileage.findUnique.mockResolvedValue(null);

      // Act
      const result = await vehiclesService.getVehicleMileage(vehicleId);

      // Assert
      expect(result).toEqual({
        currentMileage: 0,
        lastUpdated: null
      });
    });

    it('should throw error when vehicle not found', async () => {
      // Arrange
      const vehicleId = 'nonexistent';

      mockPrisma.vehicle.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(vehiclesService.getVehicleMileage(vehicleId)).rejects.toThrow('Vehicle not found');
    });
  });

  describe('getVehicleRecommendations', () => {
    it('should return vehicle recommendations', async () => {
      // Arrange
      const vehicleId = 'vehicle123';
      const mockVehicle = { id: vehicleId, make: 'Toyota', model: 'Camry' };
      const mockRecommendations = [
        {
          id: 'rec1',
          reason: 'Oil change due',
          status: 'pending',
          priority: 'high',
          severity: 'medium',
          dueMileage: 60000,
          dueDate: new Date('2024-06-01'),
          rule: {
            name: 'Oil Change',
            serviceType: 'maintenance',
            category: 'engine',
            priority: 'high',
            severity: 'medium'
          }
        }
      ];

      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle as any);
      mockPrisma.serviceRecommendation.findMany.mockResolvedValue(mockRecommendations as any);

      // Act
      const result = await vehiclesService.getVehicleRecommendations(vehicleId);

      // Assert
      expect(result).toEqual([
        {
          id: 'rec1',
          reason: 'Oil change due',
          status: 'pending',
          priority: 'high',
          severity: 'medium',
          dueMileage: 60000,
          dueDate: new Date('2024-06-01'),
          rule: {
            name: 'Oil Change',
            serviceType: 'maintenance',
            category: 'engine',
            priority: 'high',
            severity: 'medium'
          }
        }
      ]);
    });

    it('should filter recommendations by status', async () => {
      // Arrange
      const vehicleId = 'vehicle123';
      const status = 'completed';
      const mockVehicle = { id: vehicleId, make: 'Toyota', model: 'Camry' };
      const mockRecommendations = [
        {
          id: 'rec1',
          reason: 'Oil change completed',
          status: 'completed',
          priority: 'high',
          severity: 'medium',
          dueMileage: 60000,
          dueDate: new Date('2024-06-01'),
          rule: {
            name: 'Oil Change',
            serviceType: 'maintenance',
            category: 'engine',
            priority: 'high',
            severity: 'medium'
          }
        }
      ];

      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle as any);
      mockPrisma.serviceRecommendation.findMany.mockResolvedValue(mockRecommendations as any);

      // Act
      const result = await vehiclesService.getVehicleRecommendations(vehicleId, status);

      // Assert
      expect(mockPrisma.serviceRecommendation.findMany).toHaveBeenCalledWith({
        where: { vehicleId, status },
        include: {
          rule: {
            select: {
              name: true,
              serviceType: true,
              category: true,
              priority: true,
              severity: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      expect(result).toEqual(mockRecommendations.map(rec => ({
        id: rec.id,
        reason: rec.reason,
        status: rec.status,
        priority: rec.priority,
        severity: rec.severity,
        dueMileage: rec.dueMileage,
        dueDate: rec.dueDate,
        rule: rec.rule
      })));
    });
  });

  describe('searchVehicles', () => {
    it('should search vehicles by query', async () => {
      // Arrange
      const query = 'Toyota';
      const mockVehicles = [
        {
          id: 'vehicle1',
          make: 'Toyota',
          model: 'Camry',
          customer: { id: 'customer123', name: 'John Doe', email: 'john@example.com' }
        }
      ];

      mockPrisma.vehicle.findMany.mockResolvedValue(mockVehicles as any);

      // Act
      const result = await vehiclesService.searchVehicles(query);

      // Assert
      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { make: { contains: query, mode: 'insensitive' } },
            { model: { contains: query, mode: 'insensitive' } },
            { vin: { contains: query, mode: 'insensitive' } },
            { licensePlate: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        take: 20,
        orderBy: { createdAt: 'desc' }
      });
      expect(result).toEqual(mockVehicles);
    });
  });
});