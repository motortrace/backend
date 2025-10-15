import { PrismaClient } from '@prisma/client';
import {
  CreateCarExpenseRequest,
  UpdateCarExpenseRequest,
  CarExpenseResponse,
  CarExpenseFilters,
  CarExpenseStatistics,
  VehicleExpenseSummary,
  ExpenseCategory
} from './car-expenses.types';

const prisma = new PrismaClient();

export class CarExpensesService {
  // Create a new car expense
  async createCarExpense(data: CreateCarExpenseRequest, userId?: string): Promise<CarExpenseResponse> {
    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    const expense = await prisma.carExpense.create({
      data: {
        vehicleId: data.vehicleId,
        category: data.category,
        description: data.description,
        amount: data.amount,
        date: data.date,
        provider: data.provider,
        receiptUrl: data.receiptUrl,
        notes: data.notes,
        createdById: userId,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            licensePlate: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Debug: Log the type of amount and category
    console.log('Expense amount type:', typeof expense.amount, 'value:', expense.amount);
    console.log('Expense category type:', typeof expense.category, 'value:', expense.category);

    // Convert Decimal to number and cast enum, handle null to undefined
    const response: CarExpenseResponse = {
      id: expense.id,
      vehicleId: expense.vehicleId,
      category: expense.category as ExpenseCategory,
      description: expense.description,
      amount: expense.amount.toNumber(),
      date: expense.date,
      provider: expense.provider ?? undefined,
      receiptUrl: expense.receiptUrl ?? undefined,
      notes: expense.notes ?? undefined,
      createdById: expense.createdById ?? undefined,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
      vehicle: expense.vehicle ? {
        id: expense.vehicle.id,
        make: expense.vehicle.make,
        model: expense.vehicle.model,
        year: expense.vehicle.year ?? undefined,
        licensePlate: expense.vehicle.licensePlate ?? undefined,
      } as { id: string; make: string; model: string; year?: number; licensePlate?: string; } : undefined,
      createdBy: expense.createdBy ? {
        id: expense.createdBy.id,
        name: expense.createdBy.name ?? undefined,
      } : undefined,
    };

    return response;
  }

  // Get car expense by ID
  async getCarExpenseById(id: string): Promise<CarExpenseResponse> {
    const expense = await prisma.carExpense.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            licensePlate: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!expense) {
      throw new Error('Car expense not found');
    }

    // Convert Decimal to number and cast enum, handle null to undefined
    const response: CarExpenseResponse = {
      id: expense.id,
      vehicleId: expense.vehicleId,
      category: expense.category as ExpenseCategory,
      description: expense.description,
      amount: expense.amount.toNumber(),
      date: expense.date,
      provider: expense.provider ?? undefined,
      receiptUrl: expense.receiptUrl ?? undefined,
      notes: expense.notes ?? undefined,
      createdById: expense.createdById ?? undefined,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
      vehicle: expense.vehicle ? {
        id: expense.vehicle.id,
        make: expense.vehicle.make,
        model: expense.vehicle.model,
        year: (expense.vehicle.year ?? undefined) as number | undefined,
        licensePlate: (expense.vehicle.licensePlate ?? undefined) as string | undefined,
      } : undefined,
      createdBy: expense.createdBy ? {
        id: expense.createdBy.id,
        name: expense.createdBy.name ?? undefined,
      } : undefined,
    };

    return response;
  }

  // Get all car expenses with filters
  async getCarExpenses(filters: CarExpenseFilters): Promise<CarExpenseResponse[]> {
    const where: any = {};

    if (filters.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters.category) where.category = filters.category;
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      where.amount = {};
      if (filters.minAmount !== undefined) where.amount.gte = filters.minAmount;
      if (filters.maxAmount !== undefined) where.amount.lte = filters.maxAmount;
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }

    // Search across description and notes
    if (filters.search) {
      where.OR = [
        { description: { contains: filters.search, mode: 'insensitive' } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
        { provider: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const expenses = await prisma.carExpense.findMany({
      where,
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            licensePlate: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Convert Decimal to number and cast enum for each expense
    const responses: CarExpenseResponse[] = expenses.map(expense => ({
      id: expense.id,
      vehicleId: expense.vehicleId,
      category: expense.category as ExpenseCategory,
      description: expense.description,
      amount: expense.amount.toNumber(),
      date: expense.date,
      provider: expense.provider ?? undefined,
      receiptUrl: expense.receiptUrl ?? undefined,
      notes: expense.notes ?? undefined,
      createdById: expense.createdById ?? undefined,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
      vehicle: expense.vehicle ? {
        id: expense.vehicle.id,
        make: expense.vehicle.make,
        model: expense.vehicle.model,
        year: expense.vehicle.year ?? undefined,
        licensePlate: expense.vehicle.licensePlate ?? undefined,
      } as { id: string; make: string; model: string; year?: number; licensePlate?: string; } : undefined,
      createdBy: expense.createdBy ? {
        id: expense.createdBy.id,
        name: expense.createdBy.name ?? undefined,
      } : undefined,
    }));

    return responses;
  }

  // Update car expense
  async updateCarExpense(id: string, data: UpdateCarExpenseRequest): Promise<CarExpenseResponse> {
    // Check if expense exists
    const existingExpense = await prisma.carExpense.findUnique({
      where: { id },
    });
    if (!existingExpense) {
      throw new Error('Car expense not found');
    }

    const expense = await prisma.carExpense.update({
      where: { id },
      data,
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            licensePlate: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Convert Decimal to number and cast enum, handle null to undefined
    const response: CarExpenseResponse = {
      id: expense.id,
      vehicleId: expense.vehicleId,
      category: expense.category as ExpenseCategory,
      description: expense.description,
      amount: expense.amount.toNumber(),
      date: expense.date,
      provider: expense.provider ?? undefined,
      receiptUrl: expense.receiptUrl ?? undefined,
      notes: expense.notes ?? undefined,
      createdById: expense.createdById ?? undefined,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
      vehicle: expense.vehicle ? {
        id: expense.vehicle.id,
        make: expense.vehicle.make,
        model: expense.vehicle.model,
        year: (expense.vehicle.year ?? undefined) as number | undefined,
        licensePlate: (expense.vehicle.licensePlate ?? undefined) as string | undefined,
      } : undefined,
      createdBy: expense.createdBy ? {
        id: expense.createdBy.id,
        name: expense.createdBy.name ?? undefined,
      } : undefined,
    };

    return response;
  }

  // Delete car expense
  async deleteCarExpense(id: string): Promise<void> {
    // Check if expense exists
    const expense = await prisma.carExpense.findUnique({
      where: { id },
    });
    if (!expense) {
      throw new Error('Car expense not found');
    }

    await prisma.carExpense.delete({
      where: { id },
    });
  }

  // Get expenses by vehicle
  async getExpensesByVehicle(vehicleId: string): Promise<CarExpenseResponse[]> {
    const expenses = await prisma.carExpense.findMany({
      where: { vehicleId },
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            licensePlate: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Convert Decimal to number and cast enum for each expense
    const responses: CarExpenseResponse[] = expenses.map(expense => ({
      id: expense.id,
      vehicleId: expense.vehicleId,
      category: expense.category as ExpenseCategory,
      description: expense.description,
      amount: expense.amount.toNumber(),
      date: expense.date,
      provider: expense.provider ?? undefined,
      receiptUrl: expense.receiptUrl ?? undefined,
      notes: expense.notes ?? undefined,
      createdById: expense.createdById ?? undefined,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
      vehicle: expense.vehicle ? {
        id: expense.vehicle.id,
        make: expense.vehicle.make,
        model: expense.vehicle.model,
        year: expense.vehicle.year ?? undefined,
        licensePlate: expense.vehicle.licensePlate ?? undefined,
      } as { id: string; make: string; model: string; year?: number; licensePlate?: string; } : undefined,
      createdBy: expense.createdBy ? {
        id: expense.createdBy.id,
        name: expense.createdBy.name ?? undefined,
      } : undefined,
    }));

    return responses;
  }

  // Get expense statistics
  async getExpenseStatistics(vehicleId?: string): Promise<CarExpenseStatistics> {
    const where = vehicleId ? { vehicleId } : {};

    const [totalExpenses, totalAmount, expensesByCategory, monthlyExpenses, highestExpense, recentExpenses] = await Promise.all([
      prisma.carExpense.count({ where }),
      prisma.carExpense.aggregate({
        where,
        _sum: { amount: true },
      }),
      prisma.carExpense.groupBy({
        by: ['category'],
        where,
        _count: { category: true },
        _sum: { amount: true },
      }),
      prisma.carExpense.findMany({
        where,
        select: {
          date: true,
          amount: true,
        },
        orderBy: { date: 'desc' },
        take: 100, // Last 100 expenses for monthly calculation
      }),
      prisma.carExpense.findFirst({
        where,
        orderBy: { amount: 'desc' },
        include: {
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              licensePlate: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.carExpense.findMany({
        where,
        take: 10,
        orderBy: { date: 'desc' },
        include: {
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              licensePlate: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    // Debug: Log aggregation result types
    console.log('totalAmount._sum.amount type:', typeof totalAmount._sum.amount, 'value:', totalAmount._sum.amount);
    console.log('expensesByCategory sample:', expensesByCategory.length > 0 ? {
      category: typeof expensesByCategory[0].category,
      amount: typeof expensesByCategory[0]._sum.amount
    } : 'empty');

    // Calculate monthly expenses
    const monthlyData: { [key: string]: { count: number; amount: number } } = {};
    monthlyExpenses.forEach(expense => {
      const monthKey = expense.date.toISOString().substring(0, 7); // YYYY-MM format
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, amount: 0 };
      }
      monthlyData[monthKey].count += 1;
      monthlyData[monthKey].amount += expense.amount.toNumber();
    });

    const monthlyExpensesArray = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12); // Last 12 months

    // Convert highestExpense and recentExpenses
    const highestExpenseResponse = highestExpense ? {
      id: highestExpense.id,
      vehicleId: highestExpense.vehicleId,
      category: highestExpense.category as ExpenseCategory,
      description: highestExpense.description,
      amount: highestExpense.amount.toNumber(),
      date: highestExpense.date,
      provider: highestExpense.provider ?? undefined,
      receiptUrl: highestExpense.receiptUrl ?? undefined,
      notes: highestExpense.notes ?? undefined,
      createdById: highestExpense.createdById ?? undefined,
      createdAt: highestExpense.createdAt,
      updatedAt: highestExpense.updatedAt,
      vehicle: highestExpense.vehicle ? {
        id: highestExpense.vehicle.id,
        make: highestExpense.vehicle.make,
        model: highestExpense.vehicle.model,
        year: highestExpense.vehicle.year ?? undefined,
        licensePlate: highestExpense.vehicle.licensePlate ?? undefined,
      } as { id: string; make: string; model: string; year?: number; licensePlate?: string; } : undefined,
      createdBy: highestExpense.createdBy ? {
        id: highestExpense.createdBy.id,
        name: highestExpense.createdBy.name ?? undefined,
      } : undefined,
    } : null;

    const recentExpensesResponse: CarExpenseResponse[] = recentExpenses.map(expense => ({
      id: expense.id,
      vehicleId: expense.vehicleId,
      category: expense.category as ExpenseCategory,
      description: expense.description,
      amount: expense.amount.toNumber(),
      date: expense.date,
      provider: expense.provider ?? undefined,
      receiptUrl: expense.receiptUrl ?? undefined,
      notes: expense.notes ?? undefined,
      createdById: expense.createdById ?? undefined,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
      vehicle: expense.vehicle ? {
        id: expense.vehicle.id,
        make: expense.vehicle.make,
        model: expense.vehicle.model,
        year: expense.vehicle.year ?? undefined,
        licensePlate: expense.vehicle.licensePlate ?? undefined,
      } as { id: string; make: string; model: string; year?: number; licensePlate?: string; } : undefined,
      createdBy: expense.createdBy ? {
        id: expense.createdBy.id,
        name: expense.createdBy.name ?? undefined,
      } : undefined,
    }));

    return {
      totalExpenses: totalExpenses,
      totalAmount: totalAmount._sum.amount ? totalAmount._sum.amount.toNumber() : 0,
      expensesByCategory: expensesByCategory.map(item => ({
        category: item.category as ExpenseCategory,
        count: item._count.category,
        amount: item._sum.amount ? item._sum.amount.toNumber() : 0,
      })),
      monthlyExpenses: monthlyExpensesArray,
      averageExpense: totalExpenses > 0 ? ((totalAmount._sum.amount ? totalAmount._sum.amount.toNumber() : 0) / totalExpenses) : 0,
      highestExpense: highestExpenseResponse,
      recentExpenses: recentExpensesResponse,
    };
  }

  // Get vehicle expense summary
  async getVehicleExpenseSummary(vehicleId: string): Promise<VehicleExpenseSummary> {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [allExpenses, thisMonthExpenses, lastMonthExpenses, categoriesBreakdown] = await Promise.all([
      prisma.carExpense.aggregate({
        where: { vehicleId },
        _count: true,
        _sum: { amount: true },
      }),
      prisma.carExpense.aggregate({
        where: {
          vehicleId,
          date: { gte: startOfThisMonth },
        },
        _count: true,
        _sum: { amount: true },
      }),
      prisma.carExpense.aggregate({
        where: {
          vehicleId,
          date: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _count: true,
        _sum: { amount: true },
      }),
      prisma.carExpense.groupBy({
        by: ['category'],
        where: { vehicleId },
        _count: { category: true },
        _sum: { amount: true },
      }),
    ]);

    return {
      vehicleId,
      totalExpenses: allExpenses._count,
      totalAmount: allExpenses._sum.amount ? allExpenses._sum.amount.toNumber() : 0,
      thisMonthCount: thisMonthExpenses._count,
      thisMonthAmount: thisMonthExpenses._sum.amount ? thisMonthExpenses._sum.amount.toNumber() : 0,
      lastMonthCount: lastMonthExpenses._count,
      lastMonthAmount: lastMonthExpenses._sum.amount ? lastMonthExpenses._sum.amount.toNumber() : 0,
      categoriesBreakdown: categoriesBreakdown.map(item => ({
        category: item.category as ExpenseCategory,
        count: item._count.category,
        amount: item._sum.amount ? item._sum.amount.toNumber() : 0,
      })),
    };
  }
}