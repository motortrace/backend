import { CarExpensesService } from '../../../modules/car-expenses/car-expenses.service';
import { PrismaClient } from '@prisma/client';
import { CreateCarExpenseRequest, UpdateCarExpenseRequest, CarExpenseFilters, ExpenseCategory } from '../../../modules/car-expenses/car-expenses.types';

// Mock Prisma Client
jest.mock('@prisma/client');

describe('CarExpensesService', () => {
  let carExpensesService: CarExpensesService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    // Mock the singleton instance
    (carExpensesService as any) = new CarExpensesService();
    (carExpensesService as any).prisma = mockPrisma;
  });

  describe('createCarExpense', () => {
    it('should create a car expense successfully', async () => {
      // Arrange
      const expenseData: CreateCarExpenseRequest = {
        vehicleId: 'vehicle123',
        category: ExpenseCategory.FUEL,
        description: 'Gas fill-up',
        amount: 50.00,
        date: new Date('2024-01-15'),
        provider: 'Shell Station',
        receiptUrl: 'https://example.com/receipt.jpg',
        notes: 'Regular maintenance'
      };

      const mockVehicle = { id: 'vehicle123', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' };
      const mockUser = { id: 'user123', name: 'John Doe' };

      const mockExpense = {
        id: 'expense123',
        ...expenseData,
        amount: { toNumber: () => 50.00 },
        createdById: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
        vehicle: mockVehicle,
        createdBy: mockUser
      };

      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.carExpense.create.mockResolvedValue(mockExpense as any);

      // Act
      const result = await carExpensesService.createCarExpense(expenseData, 'user123');

      // Assert
      expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: 'vehicle123' }
      });
      expect(mockPrisma.carExpense.create).toHaveBeenCalledWith({
        data: {
          vehicleId: 'vehicle123',
          category: ExpenseCategory.FUEL,
          description: 'Gas fill-up',
          amount: 50.00,
          date: new Date('2024-01-15'),
          provider: 'Shell Station',
          receiptUrl: 'https://example.com/receipt.jpg',
          notes: 'Regular maintenance',
          createdById: 'user123'
        },
        include: expect.any(Object)
      });
      expect(result.id).toBe('expense123');
      expect(result.amount).toBe(50.00);
      expect(result.category).toBe(ExpenseCategory.FUEL);
    });

    it('should throw error when vehicle not found', async () => {
      // Arrange
      const expenseData: CreateCarExpenseRequest = {
        vehicleId: 'nonexistent',
        category: ExpenseCategory.FUEL,
        description: 'Gas fill-up',
        amount: 50.00,
        date: new Date()
      };

      mockPrisma.vehicle.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(carExpensesService.createCarExpense(expenseData)).rejects.toThrow('Vehicle not found');
    });
  });

  describe('getCarExpenseById', () => {
    it('should return car expense when found', async () => {
      // Arrange
      const expenseId = 'expense123';
      const mockVehicle = { id: 'vehicle123', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' };
      const mockUser = { id: 'user123', name: 'John Doe' };

      const mockExpense = {
        id: expenseId,
        vehicleId: 'vehicle123',
        category: ExpenseCategory.FUEL,
        description: 'Gas fill-up',
        amount: { toNumber: () => 50.00 },
        date: new Date('2024-01-15'),
        provider: 'Shell Station',
        receiptUrl: 'https://example.com/receipt.jpg',
        notes: 'Regular maintenance',
        createdById: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
        vehicle: mockVehicle,
        createdBy: mockUser
      };

      mockPrisma.carExpense.findUnique.mockResolvedValue(mockExpense as any);

      // Act
      const result = await carExpensesService.getCarExpenseById(expenseId);

      // Assert
      expect(mockPrisma.carExpense.findUnique).toHaveBeenCalledWith({
        where: { id: expenseId },
        include: expect.any(Object)
      });
      expect(result.id).toBe(expenseId);
      expect(result.amount).toBe(50.00);
      expect(result.category).toBe(ExpenseCategory.FUEL);
    });

    it('should throw error when expense not found', async () => {
      // Arrange
      const expenseId = 'nonexistent';
      mockPrisma.carExpense.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(carExpensesService.getCarExpenseById(expenseId)).rejects.toThrow('Car expense not found');
    });
  });

  describe('getCarExpenses', () => {
    it('should return car expenses with filters', async () => {
      // Arrange
      const filters: CarExpenseFilters = {
        vehicleId: 'vehicle123',
        category: ExpenseCategory.FUEL,
        minAmount: 10,
        maxAmount: 100,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        search: 'gas'
      };

      const mockExpenses = [
        {
          id: 'expense1',
          vehicleId: 'vehicle123',
          category: ExpenseCategory.FUEL,
          description: 'Gas fill-up',
          amount: { toNumber: () => 50.00 },
          date: new Date('2024-01-15'),
          provider: 'Shell Station',
          receiptUrl: null,
          notes: null,
          createdById: 'user123',
          createdAt: new Date(),
          updatedAt: new Date(),
          vehicle: { id: 'vehicle123', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' },
          createdBy: { id: 'user123', name: 'John Doe' }
        }
      ];

      mockPrisma.carExpense.findMany.mockResolvedValue(mockExpenses as any);

      // Act
      const result = await carExpensesService.getCarExpenses(filters);

      // Assert
      expect(mockPrisma.carExpense.findMany).toHaveBeenCalledWith({
        where: {
          vehicleId: 'vehicle123',
          category: ExpenseCategory.FUEL,
          amount: { gte: 10, lte: 100 },
          date: { gte: new Date('2024-01-01'), lte: new Date('2024-12-31') },
          OR: [
            { description: { contains: 'gas', mode: 'insensitive' } },
            { notes: { contains: 'gas', mode: 'insensitive' } },
            { provider: { contains: 'gas', mode: 'insensitive' } }
          ]
        },
        include: expect.any(Object),
        orderBy: { date: 'desc' }
      });
      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(50.00);
    });

    it('should return all expenses when no filters provided', async () => {
      // Arrange
      const filters: CarExpenseFilters = {};
      const mockExpenses = [
        {
          id: 'expense1',
          vehicleId: 'vehicle123',
          category: ExpenseCategory.FUEL,
          description: 'Gas fill-up',
          amount: { toNumber: () => 50.00 },
          date: new Date('2024-01-15'),
          provider: null,
          receiptUrl: null,
          notes: null,
          createdById: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          vehicle: { id: 'vehicle123', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' },
          createdBy: null
        }
      ];

      mockPrisma.carExpense.findMany.mockResolvedValue(mockExpenses as any);

      // Act
      const result = await carExpensesService.getCarExpenses(filters);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].provider).toBeUndefined();
      expect(result[0].notes).toBeUndefined();
      expect(result[0].createdById).toBeUndefined();
    });
  });

  describe('updateCarExpense', () => {
    it('should update car expense successfully', async () => {
      // Arrange
      const expenseId = 'expense123';
      const updateData: UpdateCarExpenseRequest = {
        description: 'Updated gas fill-up',
        amount: 60.00,
        provider: 'BP Station'
      };

      const existingExpense = {
        id: expenseId,
        vehicleId: 'vehicle123',
        category: ExpenseCategory.FUEL,
        description: 'Gas fill-up',
        amount: { toNumber: () => 50.00 },
        date: new Date('2024-01-15'),
        provider: 'Shell Station',
        receiptUrl: null,
        notes: null,
        createdById: 'user123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedExpense = {
        ...existingExpense,
        ...updateData,
        amount: { toNumber: () => 60.00 },
        vehicle: { id: 'vehicle123', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' },
        createdBy: { id: 'user123', name: 'John Doe' }
      };

      mockPrisma.carExpense.findUnique.mockResolvedValue(existingExpense as any);
      mockPrisma.carExpense.update.mockResolvedValue(updatedExpense as any);

      // Act
      const result = await carExpensesService.updateCarExpense(expenseId, updateData);

      // Assert
      expect(mockPrisma.carExpense.findUnique).toHaveBeenCalledWith({
        where: { id: expenseId }
      });
      expect(mockPrisma.carExpense.update).toHaveBeenCalledWith({
        where: { id: expenseId },
        data: updateData,
        include: expect.any(Object)
      });
      expect(result.description).toBe('Updated gas fill-up');
      expect(result.amount).toBe(60.00);
      expect(result.provider).toBe('BP Station');
    });

    it('should throw error when expense not found', async () => {
      // Arrange
      const expenseId = 'nonexistent';
      const updateData: UpdateCarExpenseRequest = { description: 'Updated' };

      mockPrisma.carExpense.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(carExpensesService.updateCarExpense(expenseId, updateData)).rejects.toThrow('Car expense not found');
    });
  });

  describe('deleteCarExpense', () => {
    it('should delete car expense successfully', async () => {
      // Arrange
      const expenseId = 'expense123';
      const mockExpense = {
        id: expenseId,
        vehicleId: 'vehicle123',
        category: ExpenseCategory.FUEL,
        description: 'Gas fill-up',
        amount: { toNumber: () => 50.00 },
        date: new Date('2024-01-15')
      };

      mockPrisma.carExpense.findUnique.mockResolvedValue(mockExpense as any);

      // Act
      await carExpensesService.deleteCarExpense(expenseId);

      // Assert
      expect(mockPrisma.carExpense.findUnique).toHaveBeenCalledWith({
        where: { id: expenseId }
      });
      expect(mockPrisma.carExpense.delete).toHaveBeenCalledWith({
        where: { id: expenseId }
      });
    });

    it('should throw error when expense not found', async () => {
      // Arrange
      const expenseId = 'nonexistent';
      mockPrisma.carExpense.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(carExpensesService.deleteCarExpense(expenseId)).rejects.toThrow('Car expense not found');
    });
  });

  describe('getExpensesByVehicle', () => {
    it('should return expenses for specific vehicle', async () => {
      // Arrange
      const vehicleId = 'vehicle123';
      const mockExpenses = [
        {
          id: 'expense1',
          vehicleId,
          category: ExpenseCategory.FUEL,
          description: 'Gas fill-up',
          amount: { toNumber: () => 50.00 },
          date: new Date('2024-01-15'),
          provider: 'Shell Station',
          receiptUrl: null,
          notes: null,
          createdById: 'user123',
          createdAt: new Date(),
          updatedAt: new Date(),
          vehicle: { id: vehicleId, make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' },
          createdBy: { id: 'user123', name: 'John Doe' }
        }
      ];

      mockPrisma.carExpense.findMany.mockResolvedValue(mockExpenses as any);

      // Act
      const result = await carExpensesService.getExpensesByVehicle(vehicleId);

      // Assert
      expect(mockPrisma.carExpense.findMany).toHaveBeenCalledWith({
        where: { vehicleId },
        include: expect.any(Object),
        orderBy: { date: 'desc' }
      });
      expect(result).toHaveLength(1);
      expect(result[0].vehicleId).toBe(vehicleId);
    });
  });

  describe('getExpenseStatistics', () => {
    it('should return expense statistics', async () => {
      // Arrange
      const mockExpensesByCategory = [
        { category: ExpenseCategory.FUEL, _count: { category: 5 }, _sum: { amount: { toNumber: () => 250 } } },
        { category: ExpenseCategory.MAINTENANCE, _count: { category: 3 }, _sum: { amount: { toNumber: () => 300 } } }
      ];

      const mockMonthlyExpenses = [
        { date: new Date('2024-01-15'), amount: { toNumber: () => 50 } },
        { date: new Date('2024-01-20'), amount: { toNumber: () => 75 } }
      ];

      const mockHighestExpense = {
        id: 'expense1',
        vehicleId: 'vehicle123',
        category: ExpenseCategory.MAINTENANCE,
        description: 'Major repair',
        amount: { toNumber: () => 200 },
        date: new Date('2024-01-15'),
        provider: 'Auto Shop',
        receiptUrl: null,
        notes: null,
        createdById: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
        vehicle: { id: 'vehicle123', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' },
        createdBy: { id: 'user123', name: 'John Doe' }
      };

      const mockRecentExpenses = [
        {
          id: 'expense1',
          vehicleId: 'vehicle123',
          category: ExpenseCategory.FUEL,
          description: 'Gas fill-up',
          amount: { toNumber: () => 50 },
          date: new Date('2024-01-15'),
          provider: null,
          receiptUrl: null,
          notes: null,
          createdById: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          vehicle: { id: 'vehicle123', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' },
          createdBy: null
        }
      ];

      mockPrisma.carExpense.count.mockResolvedValue(8);
      mockPrisma.carExpense.aggregate.mockResolvedValue({ _sum: { amount: { toNumber: () => 550 } } } as any);
      mockPrisma.carExpense.groupBy.mockResolvedValue(mockExpensesByCategory as any);
      mockPrisma.carExpense.findMany.mockResolvedValueOnce(mockMonthlyExpenses as any);
      mockPrisma.carExpense.findFirst.mockResolvedValue(mockHighestExpense as any);
      mockPrisma.carExpense.findMany.mockResolvedValueOnce(mockRecentExpenses as any);

      // Act
      const result = await carExpensesService.getExpenseStatistics();

      // Assert
      expect(result.totalExpenses).toBe(8);
      expect(result.totalAmount).toBe(550);
      expect(result.expensesByCategory).toHaveLength(2);
      expect(result.expensesByCategory[0].category).toBe(ExpenseCategory.FUEL);
      expect(result.expensesByCategory[0].count).toBe(5);
      expect(result.expensesByCategory[0].amount).toBe(250);
      expect(result.averageExpense).toBe(68.75); // 550 / 8
      expect(result.highestExpense?.amount).toBe(200);
      expect(result.recentExpenses).toHaveLength(1);
    });

    it('should return statistics for specific vehicle', async () => {
      // Arrange
      const vehicleId = 'vehicle123';

      mockPrisma.carExpense.count.mockResolvedValue(5);
      mockPrisma.carExpense.aggregate.mockResolvedValue({ _sum: { amount: { toNumber: () => 300 } } } as any);
      mockPrisma.carExpense.groupBy.mockResolvedValue([]);
      mockPrisma.carExpense.findMany.mockResolvedValue([]);
      mockPrisma.carExpense.findFirst.mockResolvedValue(null);
      mockPrisma.carExpense.findMany.mockResolvedValueOnce([]);

      // Act
      const result = await carExpensesService.getExpenseStatistics(vehicleId);

      // Assert
      expect(mockPrisma.carExpense.count).toHaveBeenCalledWith({ where: { vehicleId } });
      expect(mockPrisma.carExpense.aggregate).toHaveBeenCalledWith({
        where: { vehicleId },
        _sum: { amount: true }
      });
      expect(result.totalExpenses).toBe(5);
      expect(result.totalAmount).toBe(300);
    });
  });

  describe('getVehicleExpenseSummary', () => {
    it('should return vehicle expense summary', async () => {
      // Arrange
      const vehicleId = 'vehicle123';

      const mockAllExpenses = { _count: 10, _sum: { amount: { toNumber: () => 500 } } };
      const mockThisMonthExpenses = { _count: 3, _sum: { amount: { toNumber: () => 150 } } };
      const mockLastMonthExpenses = { _count: 2, _sum: { amount: { toNumber: () => 100 } } };
      const mockCategoriesBreakdown = [
        { category: ExpenseCategory.FUEL, _count: { category: 5 }, _sum: { amount: { toNumber: () => 250 } } },
        { category: ExpenseCategory.MAINTENANCE, _count: { category: 3 }, _sum: { amount: { toNumber: () => 150 } } }
      ];

      mockPrisma.carExpense.aggregate
        .mockResolvedValueOnce(mockAllExpenses as any)
        .mockResolvedValueOnce(mockThisMonthExpenses as any)
        .mockResolvedValueOnce(mockLastMonthExpenses as any);
      mockPrisma.carExpense.groupBy.mockResolvedValue(mockCategoriesBreakdown as any);

      // Act
      const result = await carExpensesService.getVehicleExpenseSummary(vehicleId);

      // Assert
      expect(result.vehicleId).toBe(vehicleId);
      expect(result.totalExpenses).toBe(10);
      expect(result.totalAmount).toBe(500);
      expect(result.thisMonthCount).toBe(3);
      expect(result.thisMonthAmount).toBe(150);
      expect(result.lastMonthCount).toBe(2);
      expect(result.lastMonthAmount).toBe(100);
      expect(result.categoriesBreakdown).toHaveLength(2);
      expect(result.categoriesBreakdown[0].category).toBe(ExpenseCategory.FUEL);
      expect(result.categoriesBreakdown[0].count).toBe(5);
      expect(result.categoriesBreakdown[0].amount).toBe(250);
    });
  });
});