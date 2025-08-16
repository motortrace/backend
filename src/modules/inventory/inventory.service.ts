import { PrismaClient, InventoryItem, WorkOrderPart } from '@prisma/client';
import {
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  InventoryAdjustmentRequest,
  InventoryTransferRequest,
  InventoryItemWithUsage,
  WorkOrderPartWithDetails,
  InventorySummary,
  InventoryFilter,
  InventoryReport,
  StockMovement,
  ReorderSuggestion,
  CreateInventoryCategoryRequest,
  UpdateInventoryCategoryRequest,
  InventoryCategoryWithItems,
} from './inventory.types';

const prisma = new PrismaClient();

export class InventoryService {
  // InventoryCategory Methods
  async createInventoryCategory(data: CreateInventoryCategoryRequest) {
    return await prisma.inventoryCategory.create({
      data: {
        name: data.name,
      },
    });
  }

  async getInventoryCategory(id: string): Promise<InventoryCategoryWithItems | null> {
    return await prisma.inventoryCategory.findUnique({
      where: { id },
      include: {
        inventoryItems: true,
        _count: {
          select: {
            inventoryItems: true,
          },
        },
      },
    });
  }

  async getInventoryCategories(): Promise<InventoryCategoryWithItems[]> {
    return await prisma.inventoryCategory.findMany({
      include: {
        inventoryItems: true,
        _count: {
          select: {
            inventoryItems: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async updateInventoryCategory(id: string, data: UpdateInventoryCategoryRequest) {
    return await prisma.inventoryCategory.update({
      where: { id },
      data: {
        name: data.name,
      },
    });
  }

  async deleteInventoryCategory(id: string): Promise<boolean> {
    try {
      // Check if category has any inventory items
      const category = await prisma.inventoryCategory.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              inventoryItems: true,
            },
          },
        },
      });

      if (!category) {
        throw new Error('Inventory category not found');
      }

      if (category._count.inventoryItems > 0) {
        throw new Error(`Cannot delete category that has ${category._count.inventoryItems} inventory items`);
      }

      await prisma.inventoryCategory.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  async createInventoryItem(data: CreateInventoryItemRequest): Promise<InventoryItem> {
    return await (prisma as any).inventoryItem.create({
      data: {
        name: data.name,
        sku: data.sku,
        partNumber: data.partNumber,
        manufacturer: data.manufacturer,
        categoryId: data.categoryId,
        location: data.location,
        quantity: data.quantity,
        minStockLevel: data.minStockLevel,
        maxStockLevel: data.maxStockLevel,
        reorderPoint: data.reorderPoint,
        unitPrice: data.unitPrice,
        supplier: data.supplier,
        supplierPartNumber: data.supplierPartNumber,
        core: data.core || false,
        corePrice: data.corePrice,
      },
    });
  }

  async getInventoryItem(id: string): Promise<InventoryItemWithUsage | null> {
    return await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            workOrderParts: true,
          },
        },
      },
    });
  }

  async getInventoryItems(filter: InventoryFilter = {}, page = 1, limit = 20): Promise<{
    items: InventoryItemWithUsage[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (filter.category) {
      where.categoryId = filter.category;
    }
    
    if (filter.manufacturer) {
      where.manufacturer = filter.manufacturer;
    }
    
    if (filter.supplier) {
      where.supplier = filter.supplier;
    }
    
    if (filter.location) {
      where.location = filter.location;
    }
    
    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { sku: { contains: filter.search, mode: 'insensitive' } },
        { partNumber: { contains: filter.search, mode: 'insensitive' } },
        { manufacturer: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    
    if (filter.lowStock) {
      where.AND = [
        { quantity: { gt: 0 } },
        {
          OR: [
            { reorderPoint: { not: null } },
            { minStockLevel: { not: null } },
          ],
        },
      ];
    }
    
    if (filter.outOfStock) {
      where.quantity = 0;
    }
    
    if (filter.minPrice !== undefined) {
      where.unitPrice = { gte: filter.minPrice };
    }
    
    if (filter.maxPrice !== undefined) {
      where.unitPrice = { ...where.unitPrice, lte: filter.maxPrice };
    }

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        include: {
          _count: {
            select: {
              workOrderParts: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateInventoryItem(id: string, data: UpdateInventoryItemRequest): Promise<InventoryItem> {
    return await prisma.inventoryItem.update({
      where: { id },
      data,
    });
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await prisma.inventoryItem.delete({
      where: { id },
    });
  }

  async adjustInventory(data: InventoryAdjustmentRequest): Promise<InventoryItem> {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: data.inventoryItemId },
    });

    if (!item) {
      throw new Error('Inventory item not found');
    }

    let newQuantity: number;
    
    switch (data.adjustmentType) {
      case 'ADD':
        newQuantity = item.quantity + data.quantity;
        break;
      case 'REMOVE':
        if (item.quantity < data.quantity) {
          throw new Error('Insufficient stock for removal');
        }
        newQuantity = item.quantity - data.quantity;
        break;
      case 'SET':
        newQuantity = data.quantity;
        break;
      default:
        throw new Error('Invalid adjustment type');
    }

    if (newQuantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    return await prisma.inventoryItem.update({
      where: { id: data.inventoryItemId },
      data: { quantity: newQuantity },
    });
  }

  async transferInventory(data: InventoryTransferRequest): Promise<void> {
    await prisma.$transaction(async (tx) => {
      for (const transferItem of data.items) {
        const item = await tx.inventoryItem.findUnique({
          where: { id: transferItem.inventoryItemId },
        });

        if (!item) {
          throw new Error(`Inventory item ${transferItem.inventoryItemId} not found`);
        }

        if (item.quantity < transferItem.quantity) {
          throw new Error(`Insufficient stock for item ${item.name}`);
        }

        if (item.location !== data.fromLocation) {
          throw new Error(`Item ${item.name} is not in location ${data.fromLocation}`);
        }

        await tx.inventoryItem.update({
          where: { id: transferItem.inventoryItemId },
          data: {
            quantity: item.quantity - transferItem.quantity,
            location: data.toLocation,
          },
        });
      }
    });
  }

  async getInventorySummary(): Promise<InventorySummary> {
    const [
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      categoryStats,
    ] = await Promise.all([
      prisma.inventoryItem.count(),
      prisma.inventoryItem.aggregate({
        _sum: {
          quantity: true,
        },
      }),
      prisma.inventoryItem.count({
        where: {
          AND: [
            { quantity: { gt: 0 } },
            {
              OR: [
                { reorderPoint: { not: null } },
                { minStockLevel: { not: null } },
              ],
            },
          ],
        },
      }),
      prisma.inventoryItem.count({
        where: { quantity: 0 },
      }),
      prisma.inventoryItem.groupBy({
        by: ['categoryId'],
        _count: {
          id: true,
        },
        _sum: {
          quantity: true,
        },
        where: {
          categoryId: { not: null } as any,
        },
      }),
    ]);

    const categories = categoryStats.map((stat) => ({
      category: stat.categoryId!,
      count: stat._count?.id || 0,
      value: Number(stat._sum?.quantity) || 0,
    }));

    return {
      totalItems,
      totalValue: Number(totalValue._sum.quantity) || 0,
      lowStockItems,
      outOfStockItems,
      categories,
    };
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    const items = await prisma.inventoryItem.findMany({
      where: {
        AND: [
          { quantity: { gt: 0 } },
          {
            OR: [
              { reorderPoint: { not: null } },
              { minStockLevel: { not: null } },
            ],
          },
        ],
      },
      orderBy: { quantity: 'asc' },
    });

    return items.filter(item => {
      const isLowStock = (item.reorderPoint && item.quantity <= item.reorderPoint) ||
                        (item.minStockLevel && item.quantity <= item.minStockLevel);
      return isLowStock;
    });
  }

  async getOutOfStockItems(): Promise<InventoryItem[]> {
    return await prisma.inventoryItem.findMany({
      where: { quantity: 0 },
      orderBy: { name: 'asc' },
    });
  }

  async getInventoryReport(): Promise<InventoryReport[]> {
    const items = await prisma.inventoryItem.findMany({
      include: {
        workOrderParts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
        _count: {
          select: { workOrderParts: true },
        },
      },
    });

    return items.map((item) => {
      const lastUsed = item.workOrderParts[0]?.createdAt;
      const totalValue = Number(item.quantity) * Number(item.unitPrice);
      
      let status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK';
      
      if (item.quantity === 0) {
        status = 'OUT_OF_STOCK';
      } else if (item.reorderPoint && item.quantity <= item.reorderPoint) {
        status = 'LOW_STOCK';
      } else if (item.maxStockLevel && item.quantity > item.maxStockLevel) {
        status = 'OVERSTOCK';
      } else {
        status = 'IN_STOCK';
      }

      return {
        itemId: item.id,
        name: item.name,
        sku: item.sku,
        partNumber: item.partNumber,
        currentStock: item.quantity,
        minStockLevel: item.minStockLevel,
        maxStockLevel: item.maxStockLevel,
        reorderPoint: item.reorderPoint,
        unitPrice: Number(item.unitPrice),
        totalValue,
        status,
        lastUsed,
        usageCount: item._count.workOrderParts,
      };
    });
  }

  async getReorderSuggestions(): Promise<ReorderSuggestion[]> {
    const items = await prisma.inventoryItem.findMany({
      where: {
        OR: [
          { quantity: 0 },
          { reorderPoint: { not: null } },
          { minStockLevel: { not: null } },
        ],
      },
      include: {
        workOrderParts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
        _count: {
          select: { workOrderParts: true },
        },
      },
    });

    return items
      .filter(item => {
        const reorderPoint = item.reorderPoint || item.minStockLevel;
        return !reorderPoint || item.quantity <= reorderPoint;
      })
      .map((item) => {
        const lastUsed = item.workOrderParts[0]?.createdAt;
        const usageFrequency = item._count.workOrderParts;
        
        const reorderPoint = item.reorderPoint || item.minStockLevel || 1;
        const suggestedQuantity = Math.max(reorderPoint - item.quantity, 1);
        const estimatedCost = suggestedQuantity * Number(item.unitPrice);
        
        let urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        
        if (item.quantity === 0) {
          urgency = 'CRITICAL';
        } else if (item.quantity <= (reorderPoint * 0.25)) {
          urgency = 'HIGH';
        } else if (item.quantity <= (reorderPoint * 0.5)) {
          urgency = 'MEDIUM';
        } else {
          urgency = 'LOW';
        }

        return {
          inventoryItemId: item.id,
          name: item.name,
          sku: item.sku,
          partNumber: item.partNumber,
          currentStock: item.quantity,
          reorderPoint,
          suggestedQuantity,
          estimatedCost,
          urgency,
          lastUsed,
          usageFrequency,
        };
      });
  }

  async getWorkOrderParts(filter: { workOrderId?: string; startDate?: Date; endDate?: Date } = {}): Promise<WorkOrderPartWithDetails[]> {
    const where: any = {};
    
    if (filter.workOrderId) {
      where.workOrderId = filter.workOrderId;
    }
    
    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) where.createdAt.gte = filter.startDate;
      if (filter.endDate) where.createdAt.lte = filter.endDate;
    }

    return await prisma.workOrderPart.findMany({
      where,
      include: {
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
            status: true,
          },
        },
        part: {
          select: {
            id: true,
            name: true,
            sku: true,
            partNumber: true,
          },
        },
        installedBy: {
          select: {
            id: true,
            supabaseUserId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }) as WorkOrderPartWithDetails[];
  }

  async bulkUpdateInventory(items: Array<{ id: string; quantity?: number; unitPrice?: number; location?: string; minStockLevel?: number; maxStockLevel?: number; reorderPoint?: number }>): Promise<InventoryItem[]> {
    const updates = items.map((item) =>
      prisma.inventoryItem.update({
        where: { id: item.id },
        data: {
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          location: item.location,
          minStockLevel: item.minStockLevel,
          maxStockLevel: item.maxStockLevel,
          reorderPoint: item.reorderPoint,
        },
      })
    );

    return await prisma.$transaction(updates);
  }

  async getCategories(): Promise<string[]> {
    const categories = await prisma.inventoryCategory.findMany({
      select: { name: true },
      orderBy: { name: 'asc' },
    });

    return categories.map((c) => c.name);
  }

  async getManufacturers(): Promise<string[]> {
    const manufacturers = await prisma.inventoryItem.findMany({
      select: { manufacturer: true },
      where: { manufacturer: { not: null } },
      distinct: ['manufacturer'],
    });

    return manufacturers.map((m) => m.manufacturer!);
  }

  async getSuppliers(): Promise<string[]> {
    const suppliers = await prisma.inventoryItem.findMany({
      select: { supplier: true },
      where: { supplier: { not: null } },
      distinct: ['supplier'],
    });

    return suppliers.map((s) => s.supplier!);
  }

  async getLocations(): Promise<string[]> {
    const locations = await prisma.inventoryItem.findMany({
      select: { location: true },
      where: { location: { not: null } },
      distinct: ['location'],
    });

    return locations.map((l) => l.location!);
  }
}
