import { ServiceRecommendationsService } from '../../../modules/service-recommendations/service-recommendations.service';
import { PrismaClient, ServiceRuleType, ServicePriority, ServiceSeverity } from '@prisma/client';
import { GetRecommendationsRequest, UpdateRecommendationStatusRequest, BulkUpdateRecommendationsRequest } from '../../../modules/service-recommendations/service-recommendations.types';

// Mock Prisma Client
jest.mock('@prisma/client');

describe('ServiceRecommendationsService', () => {
  let service: ServiceRecommendationsService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    service = new ServiceRecommendationsService();
  });

  describe('generateRecommendations', () => {
    it('should generate recommendations successfully', async () => {
      // Arrange
      const request: GetRecommendationsRequest = {
        vehicleId: 'vehicle123',
        includeCompleted: false,
        includeDismissed: false
      };

      const mockVehicle = {
        id: 'vehicle123',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        vehicleMileage: [{ currentMileage: 55000 }],
        vehicleProfile: {
          drivingCondition: 'NORMAL',
          preferredServiceInterval: 'STANDARD'
        }
      };

      const mockServiceHistory = [
        {
          serviceType: 'oil_change',
          serviceDate: new Date('2024-01-01'),
          serviceMileage: 50000
        }
      ];

      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle as any);
      mockPrisma.vehicleServiceHistory.findMany.mockResolvedValue(mockServiceHistory as any);
      mockPrisma.serviceRecommendation.findMany.mockResolvedValue([]);
      mockPrisma.serviceRule.findUnique.mockResolvedValue({ id: 'rule123', code: 'oil_change' } as any);

      // Act
      const result = await service.generateRecommendations(request);

      // Assert
      expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: 'vehicle123' },
        include: {
          vehicleMileage: true,
          vehicleProfile: true
        }
      });
      expect(result.recommendations).toBeDefined();
      expect(result.vehicleContext.vehicleId).toBe('vehicle123');
      expect(result.vehicleContext.currentMileage).toBe(55000);
    });

    it('should throw error when vehicle not found', async () => {
      // Arrange
      const request: GetRecommendationsRequest = {
        vehicleId: 'nonexistent'
      };

      mockPrisma.vehicle.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.generateRecommendations(request)).rejects.toThrow('Vehicle not found');
    });
  });

  describe('getVehicleContext', () => {
    it('should return vehicle context successfully', async () => {
      // Arrange
      const vehicleId = 'vehicle123';
      const mockVehicle = {
        id: vehicleId,
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        vehicleMileage: [{ currentMileage: 45000 }],
        vehicleProfile: {
          drivingCondition: 'SEVERE',
          preferredServiceInterval: 'STANDARD',
          engineType: 'GASOLINE',
          transmissionType: 'AUTOMATIC',
          fuelType: 'PETROL'
        }
      };

      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle as any);

      // Act
      const result = await (service as any).getVehicleContext(vehicleId);

      // Assert
      expect(result.vehicleId).toBe(vehicleId);
      expect(result.make).toBe('Toyota');
      expect(result.model).toBe('Camry');
      expect(result.year).toBe(2020);
      expect(result.currentMileage).toBe(45000);
      expect(result.drivingCondition).toBe('SEVERE');
      expect(result.engineType).toBe('GASOLINE');
    });

    it('should handle missing vehicle mileage', async () => {
      // Arrange
      const vehicleId = 'vehicle123';
      const mockVehicle = {
        id: vehicleId,
        make: 'Honda',
        model: 'Civic',
        year: 2019,
        vehicleMileage: [],
        vehicleProfile: null
      };

      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle as any);

      // Act
      const result = await (service as any).getVehicleContext(vehicleId);

      // Assert
      expect(result.currentMileage).toBe(0);
      expect(result.drivingCondition).toBe('NORMAL');
    });
  });

  describe('getServiceHistory', () => {
    it('should return service history for vehicle', async () => {
      // Arrange
      const vehicleId = 'vehicle123';
      const mockHistory = [
        {
          serviceType: 'oil_change',
          serviceDate: new Date('2024-01-15'),
          serviceMileage: 50000,
          provider: 'Quick Lube',
          cost: 45.00
        },
        {
          serviceType: 'brake_inspection',
          serviceDate: new Date('2024-02-01'),
          serviceMileage: 52000,
          provider: null,
          cost: 35.00
        }
      ];

      mockPrisma.vehicleServiceHistory.findMany.mockResolvedValue(mockHistory as any);

      // Act
      const result = await (service as any).getServiceHistory(vehicleId);

      // Assert
      expect(mockPrisma.vehicleServiceHistory.findMany).toHaveBeenCalledWith({
        where: { vehicleId },
        orderBy: { serviceDate: 'desc' }
      });
      expect(result).toHaveLength(2);
      expect(result[0].serviceType).toBe('oil_change');
      expect(result[0].cost).toBe(45);
      expect(result[1].serviceType).toBe('brake_inspection');
    });
  });

  describe('evaluateRule', () => {
    it('should evaluate mileage-based rule as triggered', async () => {
      // Arrange
      const rule = {
        code: 'OIL_CHANGE_MILEAGE',
        name: 'Oil Change - Mileage Based',
        ruleType: ServiceRuleType.MILEAGE_BASED,
        priority: ServicePriority.MEDIUM,
        severity: ServiceSeverity.HIGH,
        mileageInterval: 5000,
        serviceType: 'oil_change',
        serviceName: 'Engine Oil Change',
        category: 'Maintenance',
        applicableVehicleTypes: ['sedan'],
        applicableDrivingConditions: ['normal']
      };

      const vehicleContext = {
        vehicleId: 'vehicle123',
        make: 'Toyota',
        model: 'Camry',
        currentMileage: 56000,
        drivingCondition: 'NORMAL'
      };

      const serviceHistory = [
        {
          serviceType: 'oil_change',
          serviceDate: new Date('2024-01-01'),
          serviceMileage: 51000
        }
      ];

      // Act
      const result = await (service as any).evaluateRule(rule, vehicleContext, serviceHistory);

      // Assert
      expect(result.triggered).toBe(true);
      expect(result.ruleCode).toBe('OIL_CHANGE_MILEAGE');
      expect(result.priority).toBe(ServicePriority.MEDIUM);
      expect(result.severity).toBe(ServiceSeverity.HIGH);
      expect(result.dueMileage).toBe(56000); // 51000 + 5000
      expect(result.reason).toContain('exceeds service interval');
    });

    it('should evaluate time-based rule as triggered', async () => {
      // Arrange
      const rule = {
        code: 'BATTERY_CHECK_TIME',
        name: 'Battery Health Check',
        ruleType: ServiceRuleType.TIME_BASED,
        priority: ServicePriority.LOW,
        severity: ServiceSeverity.MEDIUM,
        timeIntervalMonths: 12,
        serviceType: 'battery_check',
        serviceName: 'Battery Health Check',
        category: 'Electrical'
      };

      const vehicleContext = {
        vehicleId: 'vehicle123',
        make: 'Honda',
        model: 'Civic',
        currentMileage: 30000,
        drivingCondition: 'NORMAL'
      };

      const serviceHistory = [
        {
          serviceType: 'battery_check',
          serviceDate: new Date('2023-01-01'), // More than 12 months ago
          serviceMileage: 15000
        }
      ];

      // Act
      const result = await (service as any).evaluateRule(rule, vehicleContext, serviceHistory);

      // Assert
      expect(result.triggered).toBe(true);
      expect(result.ruleCode).toBe('BATTERY_CHECK_TIME');
      expect(result.dueDate).toBeDefined();
      expect(result.reason).toContain('Time since last service');
    });

    it('should not trigger rule when conditions not met', async () => {
      // Arrange
      const rule = {
        code: 'OIL_CHANGE_MILEAGE',
        ruleType: ServiceRuleType.MILEAGE_BASED,
        mileageInterval: 5000,
        serviceType: 'oil_change'
      };

      const vehicleContext = {
        vehicleId: 'vehicle123',
        currentMileage: 52000,
        drivingCondition: 'NORMAL'
      };

      const serviceHistory = [
        {
          serviceType: 'oil_change',
          serviceDate: new Date('2024-01-01'),
          serviceMileage: 50000
        }
      ];

      // Act
      const result = await (service as any).evaluateRule(rule, vehicleContext, serviceHistory);

      // Assert
      expect(result.triggered).toBe(false);
      expect(result.dueMileage).toBe(55000); // 50000 + 5000
    });
  });

  describe('processRuleResults', () => {
    it('should process rule evaluation results into recommendations', () => {
      // Arrange
      const ruleResults = [
        {
          ruleCode: 'OIL_CHANGE_MILEAGE',
          triggered: true,
          priority: ServicePriority.MEDIUM,
          severity: ServiceSeverity.HIGH,
          dueMileage: 55000,
          reason: 'Mileage exceeded',
          lastServiceDate: new Date('2024-01-01'),
          lastServiceMileage: 50000,
          estimatedCost: 45,
          estimatedDuration: 30
        }
      ];

      const vehicleContext = {
        vehicleId: 'vehicle123',
        make: 'Toyota',
        model: 'Camry',
        currentMileage: 55000
      };

      // Act
      const result = (service as any).processRuleResults(ruleResults, vehicleContext);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].vehicleId).toBe('vehicle123');
      expect(result[0].serviceType).toBe('oil_change');
      expect(result[0].serviceName).toBe('Engine Oil Change');
      expect(result[0].category).toBe('Maintenance');
      expect(result[0].priority).toBe(ServicePriority.MEDIUM);
      expect(result[0].dueMileage).toBe(55000);
    });
  });

  describe('applyBundlingLogic', () => {
    it('should bundle related services', () => {
      // Arrange
      const recommendations = [
        {
          vehicleId: 'vehicle123',
          serviceType: 'oil_change',
          serviceName: 'Engine Oil Change',
          category: 'Maintenance',
          priority: ServicePriority.MEDIUM,
          severity: ServiceSeverity.HIGH,
          reason: 'Mileage exceeded',
          estimatedCost: 45,
          estimatedDuration: 30,
          canBundle: true
        },
        {
          vehicleId: 'vehicle123',
          serviceType: 'air_filter',
          serviceName: 'Air Filter Replacement',
          category: 'Maintenance',
          priority: ServicePriority.LOW,
          severity: ServiceSeverity.LOW,
          reason: 'Mileage exceeded',
          estimatedCost: 20,
          estimatedDuration: 20,
          canBundle: true
        }
      ];

      // Act
      const result = (service as any).applyBundlingLogic(recommendations);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].serviceName).toBe('2 Services Bundle');
      expect(result[0].reason).toContain('Bundle of 2 related services');
      expect(result[0].estimatedCost).toBe(65); // 45 + 20
      expect(result[0].estimatedDuration).toBe(30); // max(30, 20)
    });

    it('should not bundle when bundling is disabled', () => {
      // Arrange
      const recommendations = [
        {
          vehicleId: 'vehicle123',
          serviceType: 'oil_change',
          serviceName: 'Engine Oil Change',
          category: 'Maintenance',
          priority: ServicePriority.MEDIUM,
          canBundle: true
        },
        {
          vehicleId: 'vehicle123',
          serviceType: 'brake_inspection',
          serviceName: 'Brake Inspection',
          category: 'Safety',
          priority: ServicePriority.HIGH,
          canBundle: false
        }
      ];

      // Disable bundling
      (service as any).config.enableBundling = false;

      // Act
      const result = (service as any).applyBundlingLogic(recommendations);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].serviceName).toBe('Engine Oil Change');
      expect(result[1].serviceName).toBe('Brake Inspection');
    });
  });

  describe('updateRecommendationStatus', () => {
    it('should update recommendation status successfully', async () => {
      // Arrange
      const request: UpdateRecommendationStatusRequest = {
        recommendationId: 'rec123',
        status: 'COMPLETED',
        completedAt: new Date('2024-01-15')
      };

      // Act
      await service.updateRecommendationStatus(request);

      // Assert
      expect(mockPrisma.serviceRecommendation.update).toHaveBeenCalledWith({
        where: { id: 'rec123' },
        data: {
          status: 'COMPLETED',
          dismissedAt: null,
          dismissedReason: undefined,
          scheduledAt: undefined,
          completedAt: new Date('2024-01-15'),
          updatedAt: expect.any(Date)
        }
      });
    });

    it('should handle dismissed status', async () => {
      // Arrange
      const request: UpdateRecommendationStatusRequest = {
        recommendationId: 'rec123',
        status: 'DISMISSED',
        dismissedReason: 'Customer declined'
      };

      // Act
      await service.updateRecommendationStatus(request);

      // Assert
      expect(mockPrisma.serviceRecommendation.update).toHaveBeenCalledWith({
        where: { id: 'rec123' },
        data: expect.objectContaining({
          status: 'DISMISSED',
          dismissedAt: expect.any(Date),
          dismissedReason: 'Customer declined'
        })
      });
    });
  });

  describe('bulkUpdateRecommendationStatuses', () => {
    it('should update multiple recommendation statuses', async () => {
      // Arrange
      const request: BulkUpdateRecommendationsRequest = {
        vehicleId: 'vehicle123',
        recommendations: [
          {
            ruleCode: 'OIL_CHANGE_MILEAGE',
            status: 'COMPLETED'
          },
          {
            ruleCode: 'BRAKE_INSPECTION_MILEAGE',
            status: 'DISMISSED',
            dismissedReason: 'Not needed'
          }
        ]
      };

      const mockRecommendations = [
        { id: 'rec1', rule: { code: 'OIL_CHANGE_MILEAGE' } },
        { id: 'rec2', rule: { code: 'BRAKE_INSPECTION_MILEAGE' } }
      ];

      mockPrisma.serviceRecommendation.findFirst
        .mockResolvedValueOnce(mockRecommendations[0] as any)
        .mockResolvedValueOnce(mockRecommendations[1] as any);

      // Act
      await service.bulkUpdateRecommendationStatuses(request);

      // Assert
      expect(mockPrisma.serviceRecommendation.findFirst).toHaveBeenCalledTimes(2);
      expect(mockPrisma.serviceRecommendation.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('vehicleMatchesType', () => {
    it('should match sedan vehicle types', () => {
      // Arrange
      const vehicleContext = {
        make: 'Toyota',
        model: 'Camry'
      };

      // Act & Assert
      expect((service as any).vehicleMatchesType(vehicleContext, 'sedan')).toBe(true);
      expect((service as any).vehicleMatchesType(vehicleContext, 'suv')).toBe(false);
    });

    it('should match SUV vehicle types', () => {
      // Arrange
      const vehicleContext = {
        make: 'Toyota',
        model: 'RAV4'
      };

      // Act & Assert
      expect((service as any).vehicleMatchesType(vehicleContext, 'suv')).toBe(true);
      expect((service as any).vehicleMatchesType(vehicleContext, 'truck')).toBe(false);
    });

    it('should return true for unknown vehicle types', () => {
      // Arrange
      const vehicleContext = {
        make: 'Unknown',
        model: 'Brand'
      };

      // Act & Assert
      expect((service as any).vehicleMatchesType(vehicleContext, 'unknown')).toBe(true);
    });
  });

  describe('getMileageMultiplier', () => {
    it('should return correct multipliers for driving conditions', () => {
      // Arrange
      const rule = {
        severeConditionMultiplier: 0.8,
        offroadMultiplier: 0.7
      };

      // Act & Assert
      expect((service as any).getMileageMultiplier('SEVERE', rule)).toBe(0.8);
      expect((service as any).getMileageMultiplier('OFFROAD', rule)).toBe(0.7);
      expect((service as any).getMileageMultiplier('COMMERCIAL', rule)).toBe(0.9);
      expect((service as any).getMileageMultiplier('NORMAL', rule)).toBe(1.0);
    });
  });

  describe('estimateServiceCost', () => {
    it('should return correct cost estimates', () => {
      // Act & Assert
      expect((service as any).estimateServiceCost('oil_change')).toBe(45);
      expect((service as any).estimateServiceCost('brake_inspection')).toBe(35);
      expect((service as any).estimateServiceCost('transmission_service')).toBe(120);
      expect((service as any).estimateServiceCost('unknown_service')).toBe(50);
    });
  });

  describe('estimateServiceDuration', () => {
    it('should return correct duration estimates', () => {
      // Act & Assert
      expect((service as any).estimateServiceDuration('oil_change')).toBe(30);
      expect((service as any).estimateServiceDuration('tire_rotation')).toBe(60);
      expect((service as any).estimateServiceDuration('transmission_service')).toBe(90);
      expect((service as any).estimateServiceDuration('unknown_service')).toBe(45);
    });
  });
});