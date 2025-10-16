import { MileageTrackingService } from '../../../modules/mileage-tracking/mileage-tracking.service';
import { PrismaClient } from '@prisma/client';
import { CreateMileageEntryRequest, UpdateMileageEntryRequest, MileageAnalyticsRequest, BulkMileageUpdateRequest } from '../../../modules/mileage-tracking/mileage-tracking.types';

// Mock Prisma Client
jest.mock('@prisma/client');

describe('MileageTrackingService', () => {
  let mileageService: MileageTrackingService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    mileageService = new MileageTrackingService();
  });

  describe('createMileageEntry', () => {
    it('should create mileage entry with distance calculation', async () => {
      // Arrange
      const entryData: CreateMileageEntryRequest = {
        vehicleId: 'vehicle123',
        mileage: 15000,
        fuelUsed: 50,
        latitude: 6.9271,
        longitude: 79.8612,
        locationName: 'Colombo'
      };

      const previousEntry = {
        id: 'prev123',
        vehicleId: 'vehicle123',
        mileage: 14500,
        recordedAt: new Date('2024-01-14')
      };

      const createdEntry = {
        id: 'entry123',
        ...entryData,
        distance: 500,
        efficiency: 10,
        recordedAt: new Date(),
        recordedBy: { id: 'user123', name: 'John Doe' }
      };

      mockPrisma.mileageEntry.findFirst.mockResolvedValue(previousEntry as any);
      mockPrisma.mileageEntry.create.mockResolvedValue(createdEntry as any);

      // Act
      const result = await mileageService.createMileageEntry(entryData, 'user123');

      // Assert
      expect(mockPrisma.mileageEntry.findFirst).toHaveBeenCalledWith({
        where: { vehicleId: 'vehicle123' },
        orderBy: { recordedAt: 'desc' }
      });
      expect(mockPrisma.mileageEntry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          vehicleId: 'vehicle123',
          mileage: 15000,
          fuelUsed: 50,
          distance: 500,
          efficiency: 10,
          recordedById: 'user123'
        }),
        include: { recordedBy: { select: { id: true, name: true } } }
      });
      expect(result.id).toBe('entry123');
      expect(result.distance).toBe(500);
      expect(result.efficiency).toBe(10);
    });

    it('should create first mileage entry without distance', async () => {
      // Arrange
      const entryData: CreateMileageEntryRequest = {
        vehicleId: 'vehicle123',
        mileage: 10000,
        fuelUsed: 40
      };

      const createdEntry = {
        id: 'entry123',
        ...entryData,
        distance: undefined,
        efficiency: undefined,
        recordedAt: new Date(),
        recordedBy: null
      };

      mockPrisma.mileageEntry.findFirst.mockResolvedValue(null);
      mockPrisma.mileageEntry.create.mockResolvedValue(createdEntry as any);

      // Act
      const result = await mileageService.createMileageEntry(entryData);

      // Assert
      expect(mockPrisma.mileageEntry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          vehicleId: 'vehicle123',
          mileage: 10000,
          fuelUsed: 40,
          distance: undefined,
          efficiency: undefined,
          recordedById: undefined
        }),
        include: { recordedBy: { select: { id: true, name: true } } }
      });
      expect(result.distance).toBeUndefined();
    });

    it('should handle mileage decrease gracefully', async () => {
      // Arrange
      const entryData: CreateMileageEntryRequest = {
        vehicleId: 'vehicle123',
        mileage: 14000, // Less than previous
        fuelUsed: 30
      };

      const previousEntry = {
        id: 'prev123',
        vehicleId: 'vehicle123',
        mileage: 15000,
        recordedAt: new Date('2024-01-14')
      };

      mockPrisma.mileageEntry.findFirst.mockResolvedValue(previousEntry as any);
      mockPrisma.mileageEntry.create.mockResolvedValue({
        id: 'entry123',
        ...entryData,
        distance: undefined,
        efficiency: undefined,
        recordedAt: new Date(),
        recordedBy: null
      } as any);

      // Act
      const result = await mileageService.createMileageEntry(entryData);

      // Assert
      expect(result.distance).toBeUndefined();
      expect(result.efficiency).toBeUndefined();
    });
  });

  describe('updateMileageEntry', () => {
    it('should update mileage entry successfully', async () => {
      // Arrange
      const entryId = 'entry123';
      const updateData: UpdateMileageEntryRequest = {
        mileage: 16000,
        fuelUsed: 60,
        notes: 'Updated entry'
      };

      const updatedEntry = {
        id: entryId,
        vehicleId: 'vehicle123',
        mileage: 16000,
        fuelUsed: 60,
        notes: 'Updated entry',
        recordedAt: new Date(),
        recordedBy: { id: 'user123', name: 'John Doe' }
      };

      mockPrisma.mileageEntry.update.mockResolvedValue(updatedEntry as any);

      // Act
      const result = await mileageService.updateMileageEntry(entryId, updateData);

      // Assert
      expect(mockPrisma.mileageEntry.update).toHaveBeenCalledWith({
        where: { id: entryId },
        data: updateData,
        include: { recordedBy: { select: { id: true, name: true } } }
      });
      expect(result.mileage).toBe(16000);
      expect(result.fuelUsed).toBe(60);
    });
  });

  describe('getMileageEntries', () => {
    it('should return mileage entries for vehicle', async () => {
      // Arrange
      const vehicleId = 'vehicle123';
      const mockEntries = [
        {
          id: 'entry1',
          vehicleId,
          mileage: 15000,
          fuelUsed: 50,
          recordedAt: new Date('2024-01-15'),
          recordedBy: { id: 'user123', name: 'John Doe' }
        },
        {
          id: 'entry2',
          vehicleId,
          mileage: 15500,
          fuelUsed: 45,
          recordedAt: new Date('2024-01-16'),
          recordedBy: { id: 'user456', name: 'Jane Smith' }
        }
      ];

      mockPrisma.mileageEntry.findMany.mockResolvedValue(mockEntries as any);

      // Act
      const result = await mileageService.getMileageEntries(vehicleId, 10, 0);

      // Assert
      expect(mockPrisma.mileageEntry.findMany).toHaveBeenCalledWith({
        where: { vehicleId },
        orderBy: { recordedAt: 'desc' },
        take: 10,
        skip: 0,
        include: { recordedBy: { select: { id: true, name: true } } }
      });
      expect(result).toHaveLength(2);
      expect(result[0].mileage).toBe(15000);
      expect(result[1].mileage).toBe(15500);
    });
  });

  describe('getVehicleMileageSummary', () => {
    it('should return vehicle mileage summary when exists', async () => {
      // Arrange
      const vehicleId = 'vehicle123';
      const mockSummary = {
        vehicleId,
        currentMileage: 15500,
        totalDistance: 2500,
        totalFuelUsed: 150,
        averageEfficiency: 16.67,
        lastUpdated: new Date('2024-01-16'),
        lastLocationLat: 6.9271,
        lastLocationLng: 79.8612,
        lastLocationName: 'Colombo'
      };

      mockPrisma.vehicleMileage.findUnique.mockResolvedValue(mockSummary as any);

      // Act
      const result = await mileageService.getVehicleMileageSummary(vehicleId);

      // Assert
      expect(mockPrisma.vehicleMileage.findUnique).toHaveBeenCalledWith({
        where: { vehicleId }
      });
      expect(result?.currentMileage).toBe(15500);
      expect(result?.totalDistance).toBe(2500);
      expect(result?.averageEfficiency).toBe(16.67);
    });

    it('should return null when summary does not exist', async () => {
      // Arrange
      const vehicleId = 'vehicle123';
      mockPrisma.vehicleMileage.findUnique.mockResolvedValue(null);

      // Act
      const result = await mileageService.getVehicleMileageSummary(vehicleId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getMileageAnalytics', () => {
    it('should return mileage analytics for day period', async () => {
      // Arrange
      const request: MileageAnalyticsRequest = {
        vehicleId: 'vehicle123',
        period: 'day'
      };

      const mockEntries = [
        {
          id: 'entry1',
          vehicleId: 'vehicle123',
          mileage: 15000,
          fuelUsed: 50,
          distance: 500,
          efficiency: 10,
          recordedAt: new Date('2024-01-15T10:00:00Z'),
          recordedBy: { id: 'user123', name: 'John Doe' }
        },
        {
          id: 'entry2',
          vehicleId: 'vehicle123',
          mileage: 15500,
          fuelUsed: 45,
          distance: 500,
          efficiency: 11.11,
          recordedAt: new Date('2024-01-16T10:00:00Z'),
          recordedBy: { id: 'user123', name: 'John Doe' }
        }
      ];

      mockPrisma.mileageEntry.findMany.mockResolvedValue(mockEntries as any);

      // Act
      const result = await mileageService.getMileageAnalytics(request);

      // Assert
      expect(result.period).toBe('day');
      expect(result.totalDistance).toBe(1000);
      expect(result.totalFuelUsed).toBe(95);
      expect(result.averageEfficiency).toBeCloseTo(10.56, 1);
      expect(result.entries).toHaveLength(2);
      expect(result.chartData).toBeDefined();
    });

    it('should return analytics for custom date range', async () => {
      // Arrange
      const request: MileageAnalyticsRequest = {
        vehicleId: 'vehicle123',
        period: 'month',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      const mockEntries = [
        {
          id: 'entry1',
          vehicleId: 'vehicle123',
          mileage: 15000,
          fuelUsed: 50,
          distance: 500,
          efficiency: 10,
          recordedAt: new Date('2024-01-15T10:00:00Z'),
          recordedBy: { id: 'user123', name: 'John Doe' }
        }
      ];

      mockPrisma.mileageEntry.findMany.mockResolvedValue(mockEntries as any);

      // Act
      const result = await mileageService.getMileageAnalytics(request);

      // Assert
      expect(result.entries).toHaveLength(1);
      expect(mockPrisma.mileageEntry.findMany).toHaveBeenCalledWith({
        where: {
          vehicleId: 'vehicle123',
          recordedAt: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-31')
          }
        },
        orderBy: { recordedAt: 'asc' },
        include: { recordedBy: { select: { id: true, name: true } } }
      });
    });
  });

  describe('bulkUpdateMileage', () => {
    it('should create multiple mileage entries', async () => {
      // Arrange
      const bulkData: BulkMileageUpdateRequest = {
        vehicleId: 'vehicle123',
        entries: [
          {
            mileage: 15000,
            fuelUsed: 50,
            latitude: 6.9271,
            longitude: 79.8612,
            locationName: 'Colombo',
            recordedAt: '2024-01-15T10:00:00Z'
          },
          {
            mileage: 15500,
            fuelUsed: 45,
            latitude: 6.9271,
            longitude: 79.8612,
            locationName: 'Colombo',
            recordedAt: '2024-01-16T10:00:00Z'
          }
        ]
      };

      const mockCreatedEntries = [
        {
          id: 'entry1',
          vehicleId: 'vehicle123',
          mileage: 15000,
          fuelUsed: 50,
          recordedAt: new Date('2024-01-15T10:00:00Z'),
          recordedBy: { id: 'user123', name: 'John Doe' }
        },
        {
          id: 'entry2',
          vehicleId: 'vehicle123',
          mileage: 15500,
          fuelUsed: 45,
          recordedAt: new Date('2024-01-16T10:00:00Z'),
          recordedBy: { id: 'user123', name: 'John Doe' }
        }
      ];

      mockPrisma.mileageEntry.create.mockResolvedValueOnce(mockCreatedEntries[0] as any);
      mockPrisma.mileageEntry.create.mockResolvedValueOnce(mockCreatedEntries[1] as any);
      mockPrisma.$transaction.mockResolvedValue(mockCreatedEntries as any);

      // Act
      const result = await mileageService.bulkUpdateMileage(bulkData, 'user123');

      // Assert
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].mileage).toBe(15000);
      expect(result[1].mileage).toBe(15500);
    });
  });

  describe('deleteMileageEntry', () => {
    it('should delete mileage entry successfully', async () => {
      // Arrange
      const entryId = 'entry123';
      const mockEntry = {
        id: entryId,
        vehicleId: 'vehicle123',
        mileage: 15000
      };

      mockPrisma.mileageEntry.findUnique.mockResolvedValue(mockEntry as any);

      // Act
      await mileageService.deleteMileageEntry(entryId);

      // Assert
      expect(mockPrisma.mileageEntry.findUnique).toHaveBeenCalledWith({
        where: { id: entryId }
      });
      expect(mockPrisma.mileageEntry.delete).toHaveBeenCalledWith({
        where: { id: entryId }
      });
    });

    it('should throw error when entry not found', async () => {
      // Arrange
      const entryId = 'nonexistent';
      mockPrisma.mileageEntry.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(mileageService.deleteMileageEntry(entryId)).rejects.toThrow('Mileage entry not found');
    });
  });

  describe('updateVehicleMileageSummary', () => {
    it('should update vehicle mileage summary', async () => {
      // Arrange
      const vehicleId = 'vehicle123';
      const mockEntries = [
        {
          id: 'entry1',
          vehicleId,
          mileage: 15000,
          fuelUsed: 50,
          distance: 500,
          efficiency: 10,
          recordedAt: new Date('2024-01-15'),
          latitude: 6.9271,
          longitude: 79.8612,
          locationName: 'Colombo'
        },
        {
          id: 'entry2',
          vehicleId,
          mileage: 15500,
          fuelUsed: 45,
          distance: 500,
          efficiency: 11.11,
          recordedAt: new Date('2024-01-16'),
          latitude: 6.9271,
          longitude: 79.8612,
          locationName: 'Colombo'
        }
      ];

      mockPrisma.mileageEntry.findMany.mockResolvedValue(mockEntries as any);

      // Act
      await (mileageService as any).updateVehicleMileageSummary(vehicleId);

      // Assert
      expect(mockPrisma.vehicleMileage.upsert).toHaveBeenCalledWith({
        where: { vehicleId },
        update: expect.objectContaining({
          currentMileage: 15500,
          totalDistance: 1000,
          totalFuelUsed: 95,
          averageEfficiency: 10.56,
          lastLocationLat: 6.9271,
          lastLocationLng: 79.8612,
          lastLocationName: 'Colombo'
        }),
        create: expect.objectContaining({
          vehicleId,
          currentMileage: 15500,
          totalDistance: 1000,
          totalFuelUsed: 95,
          averageEfficiency: 10.56
        })
      });
    });

    it('should skip update when no entries exist', async () => {
      // Arrange
      const vehicleId = 'vehicle123';
      mockPrisma.mileageEntry.findMany.mockResolvedValue([]);

      // Act
      await (mileageService as any).updateVehicleMileageSummary(vehicleId);

      // Assert
      expect(mockPrisma.vehicleMileage.upsert).not.toHaveBeenCalled();
    });
  });

  describe('generateChartData', () => {
    it('should generate daily chart data', () => {
      // Arrange
      const entries = [
        {
          recordedAt: new Date('2024-01-15T10:00:00Z'),
          distance: 500,
          fuelUsed: 50,
          efficiency: 10
        },
        {
          recordedAt: new Date('2024-01-15T15:00:00Z'),
          distance: 300,
          fuelUsed: 30,
          efficiency: 10
        },
        {
          recordedAt: new Date('2024-01-16T10:00:00Z'),
          distance: 400,
          fuelUsed: 35,
          efficiency: 11.43
        }
      ];

      const start = new Date('2024-01-14');
      const end = new Date('2024-01-17');

      // Act
      const result = (mileageService as any).generateChartData(entries, 'day', start, end);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-01-15');
      expect(result[0].distance).toBe(800);
      expect(result[0].fuel).toBe(80);
      expect(result[1].date).toBe('2024-01-16');
      expect(result[1].distance).toBe(400);
    });

    it('should generate monthly chart data', () => {
      // Arrange
      const entries = [
        {
          recordedAt: new Date('2024-01-15'),
          distance: 1000,
          fuelUsed: 80,
          efficiency: 12.5
        },
        {
          recordedAt: new Date('2024-02-15'),
          distance: 1200,
          fuelUsed: 90,
          efficiency: 13.33
        }
      ];

      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');

      // Act
      const result = (mileageService as any).generateChartData(entries, 'month', start, end);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].date).toContain('Jan 2024');
      expect(result[0].distance).toBe(1000);
      expect(result[1].date).toContain('Feb 2024');
      expect(result[1].distance).toBe(1200);
    });

    it('should return empty array when no entries', () => {
      // Arrange
      const entries: any[] = [];
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');

      // Act
      const result = (mileageService as any).generateChartData(entries, 'day', start, end);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('formatMileageEntry', () => {
    it('should format mileage entry correctly', () => {
      // Arrange
      const entry = {
        id: 'entry123',
        vehicleId: 'vehicle123',
        mileage: 15000,
        fuelUsed: 50,
        distance: 500,
        efficiency: 10,
        latitude: 6.9271,
        longitude: 79.8612,
        locationName: 'Colombo',
        notes: 'Regular fill-up',
        recordedAt: new Date('2024-01-15'),
        recordedBy: { id: 'user123', name: 'John Doe' }
      };

      // Act
      const result = (mileageService as any).formatMileageEntry(entry);

      // Assert
      expect(result.id).toBe('entry123');
      expect(result.vehicleId).toBe('vehicle123');
      expect(result.mileage).toBe(15000);
      expect(result.fuelUsed).toBe(50);
      expect(result.distance).toBe(500);
      expect(result.efficiency).toBe(10);
      expect(result.latitude).toBe(6.9271);
      expect(result.longitude).toBe(79.8612);
      expect(result.locationName).toBe('Colombo');
      expect(result.notes).toBe('Regular fill-up');
      expect(result.recordedBy?.id).toBe('user123');
      expect(result.recordedBy?.name).toBe('John Doe');
    });

    it('should handle null/undefined values', () => {
      // Arrange
      const entry = {
        id: 'entry123',
        vehicleId: 'vehicle123',
        mileage: 15000,
        fuelUsed: null,
        distance: null,
        efficiency: null,
        latitude: null,
        longitude: null,
        locationName: null,
        notes: null,
        recordedAt: new Date('2024-01-15'),
        recordedBy: null
      };

      // Act
      const result = (mileageService as any).formatMileageEntry(entry);

      // Assert
      expect(result.fuelUsed).toBeUndefined();
      expect(result.distance).toBeUndefined();
      expect(result.efficiency).toBeUndefined();
      expect(result.latitude).toBeUndefined();
      expect(result.longitude).toBeUndefined();
      expect(result.locationName).toBeUndefined();
      expect(result.notes).toBeUndefined();
      expect(result.recordedBy).toBeUndefined();
    });
  });
});