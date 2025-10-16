import { InventoryService } from '../../../modules/inventory/inventory.service';
import { PrismaClient } from '@prisma/client';
import { CreateInventoryItemRequest, UpdateInventoryItemRequest, InventoryAdjustmentRequest, InventoryTransferRequest, InventoryFilter, CreateInventoryCategoryRequest, UpdateInventoryCategoryRequest } from '../../../modules/inventory/inventory.types';

// Mock Prisma Client
jest.mock('@prisma/client');

describe('InventoryService', () => {
  let inventoryService: InventoryService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    inventoryService = new InventoryService(mockPrisma);
  });

  describe('createInventoryCategory', () => {
    it('should create an inventory category successfully', async () => {
      // Arrange
      const categoryData: CreateInventoryCategoryRequest = {
        name: 'Engine Parts'
      };

      const mockCategory = {
        id: 'category123',
        name: 'Engine Parts',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.inventoryCategory.create.mockResolvedValue(mockCategory as any);

      // Act
      const result = await inventoryService.createInventoryCategory(categoryData);

      // Assert
      expect(mockPrisma.inventoryCategory.create).toHaveBeenCalledWith({
        data: { name: 'Engine Parts' }
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('getInventoryCategory', () => {
    it('should return inventory category with items', async () => {
      // Arrange
      const categoryId = 'category123';
      const mockCategory = {
        id: categoryId,
        name: 'Engine Parts',
        inventoryItems: [
          { id: 'item1', name: 'Oil Filter', quantity: 10 },
          { id: 'item2', name: 'Air Filter', quantity: 5 }
        ],
        _count: { inventoryItems: 2 }
      };

      mockPrisma.inventoryCategory.findUnique.mockResolvedValue(mockCategory as any);

      // Act
      const result = await inventoryService.getInventoryCategory(categoryId);

      // Assert
      expect(mockPrisma.inventoryCategory.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId },
        include: {
          inventoryItems: true,
          _count: { select: { inventoryItems: true } }
        }
      });
      expect(result?.id).toBe(categoryId);
      expect(result?.inventoryItems).toHaveLength(2);
      expect(result?._count.inventoryItems).toBe(2);
    });

    it('should return null when category not found', async () => {
      // Arrange
      const categoryId = 'nonexistent';
      mockPrisma.inventoryCategory.findUnique.mockResolvedValue(null);

      // Act
      const result = await inventoryService.getInventoryCategory(categoryId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getInventoryCategories', () => {
    it('should return all inventory categories with items', async () => {
      // Arrange
      const mockCategories = [
        {
          id: 'category1',
          name: 'Engine Parts',
          inventoryItems: [{ id: 'item1', name: 'Oil Filter' }],
          _count: { inventoryItems: 1 }
        },
        {
          id: 'category2',
          name: 'Brake Parts',
          inventoryItems: [],
          _count: { inventoryItems: 0 }
        }
      ];

      mockPrisma.inventoryCategory.findMany.mockResolvedValue(mockCategories as any);

      // Act
      const result = await inventoryService.getInventoryCategories();

      // Assert
      expect(mockPrisma.inventoryCategory.findMany).toHaveBeenCalledWith({
        include: {
          inventoryItems: true,
          _count: { select: { inventoryItems: true } }
        },
        orderBy: { name: 'asc' }
      });
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Engine Parts');
      expect(result[1].name).toBe('Brake Parts');
    });
  });

  describe('updateInventoryCategory', () => {
    it('should update inventory category successfully', async () => {
      // Arrange
      const categoryId = 'category123';
      const updateData: UpdateInventoryCategoryRequest = {
        name: 'Updated Engine Parts'
      };

      const mockUpdatedCategory = {
        id: categoryId,
        name: 'Updated Engine Parts',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.inventoryCategory.update.mockResolvedValue(mockUpdatedCategory as any);

      // Act
      const result = await inventoryService.updateInventoryCategory(categoryId, updateData);

      // Assert
      expect(mockPrisma.inventoryCategory.update).toHaveBeenCalledWith({
        where: { id: categoryId },
        data: { name: 'Updated Engine Parts' }
      });
      expect(result.name).toBe('Updated Engine Parts');
    });
  });

  describe('deleteInventoryCategory', () => {
    it('should delete inventory category successfully', async () => {
      // Arrange
      const categoryId = 'category123';
      const mockCategory = {
        id: categoryId,
        name: 'Engine Parts',
        _count: { inventoryItems: 0 }
      };

      mockPrisma.inventoryCategory.findUnique.mockResolvedValue(mockCategory as any);

      // Act
      const result = await inventoryService.deleteInventoryCategory(categoryId);

      // Assert
      expect(mockPrisma.inventoryCategory.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId },
        include: { _count: { select: { inventoryItems: true } } }
      });
      expect(mockPrisma.inventoryCategory.delete).toHaveBeenCalledWith({
        where: { id: categoryId }
      });
      expect(result).toBe(true);
    });

    it('should throw error when category has inventory items', async () => {
      // Arrange
      const categoryId = 'category123';
      const mockCategory = {
        id: categoryId,
        name: 'Engine Parts',
        _count: { inventoryItems: 5 }
      };

      mockPrisma.inventoryCategory.findUnique.mockResolvedValue(mockCategory as any);

      // Act & Assert
      await expect(inventoryService.deleteInventoryCategory(categoryId)).rejects.toThrow('Cannot delete category that has 5 inventory items');
    });

    it('should throw error when category not found', async () => {
      // Arrange
      const categoryId = 'nonexistent';
      mockPrisma.inventoryCategory.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(inventoryService.deleteInventoryCategory(categoryId)).rejects.toThrow('Inventory category not found');
    });
  });

  describe('createInventoryItem', () => {
    it('should create an inventory item successfully', async () => {
      // Arrange
      const itemData: CreateInventoryItemRequest = {
        name: 'Oil Filter',
        sku: 'OIL-001',
        partNumber: 'OF123',
        manufacturer: 'Bosch',
        categoryId: 'category123',
        location: 'Shelf A1',
        quantity: 50,
        minStockLevel: 10,
        maxStockLevel: 100,
        reorderPoint: 15,
        unitPrice: 25.99,
        supplier: 'AutoParts Inc',
        supplierPartNumber: 'SUP-OF123',
        core: false,
        corePrice: 0
      };

      const mockItem = {
        id: 'item123',
        ...itemData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (mockPrisma as any).inventoryItem.create.mockResolvedValue(mockItem);

      // Act
      const result = await inventoryService.createInventoryItem(itemData);

      // Assert
      expect((mockPrisma as any).inventoryItem.create).toHaveBeenCalledWith({
        data: itemData
      });
      expect(result.id).toBe('item123');
      expect(result.name).toBe('Oil Filter');
    });
  });

  describe('getInventoryItem', () => {
    it('should return inventory item with usage count', async () => {
      // Arrange
      const itemId = 'item123';
      const mockItem = {
        id: itemId,
        name: 'Oil Filter',
        sku: 'OIL-001',
        quantity: 50,
        _count: { workOrderParts: 5 }
      };

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(mockItem as any);

      // Act
      const result = await inventoryService.getInventoryItem(itemId);

      // Assert
      expect(mockPrisma.inventoryItem.findUnique).toHaveBeenCalledWith({
        where: { id: itemId },
        include: {
          _count: { select: { workOrderParts: true } }
        }
      });
      expect(result?.id).toBe(itemId);
      expect(result?._count.workOrderParts).toBe(5);
    });

    it('should return null when item not found', async () => {
      // Arrange
      const itemId = 'nonexistent';
      mockPrisma.inventoryItem.findUnique.mockResolvedValue(null);

      // Act
      const result = await inventoryService.getInventoryItem(itemId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getInventoryItems', () => {
    it('should return paginated inventory items with filters', async () => {
      // Arrange
      const filter: InventoryFilter = {
        category: 'category123',
        manufacturer: 'Bosch',
        search: 'oil',
        lowStock: true
      };

      const mockItems = [
        {
          id: 'item1',
          name: 'Oil Filter',
          sku: 'OIL-001',
          quantity: 5,
          _count: { workOrderParts: 10 }
        },
        {
          id: 'item2',
          name: 'Air Filter',
          sku: 'AIR-001',
          quantity: 8,
          _count: { workOrderParts: 3 }
        }
      ];

      mockPrisma.inventoryItem.findMany.mockResolvedValue(mockItems as any);
      mockPrisma.inventoryItem.count.mockResolvedValue(2);

      // Act
      const result = await inventoryService.getInventoryItems(filter, 1, 20);

      // Assert
      expect(mockPrisma.inventoryItem.findMany).toHaveBeenCalledWith({
        where: {
          categoryId: 'category123',
          manufacturer: 'Bosch',
          OR: [
            { name: { contains: 'oil', mode: 'insensitive' } },
            { sku: { contains: 'oil', mode: 'insensitive' } },
            { partNumber: { contains: 'oil', mode: 'insensitive' } },
            { manufacturer: { contains: 'oil', mode: 'insensitive' } }
          ],
          AND: [
            { quantity: { gt: 0 } },
            {
              OR: [
                { reorderPoint: { not: null } },
                { minStockLevel: { not: null } }
              ]
            }
          ]
        },
        include: {
          _count: { select: { workOrderParts: true } }
        },
        skip: 0,
        take: 20,
        orderBy: { name: 'asc' }
      });
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should filter out of stock items', async () => {
      // Arrange
      const filter: InventoryFilter = { outOfStock: true };

      const mockItems = [
        { id: 'item1', name: 'Out of Stock Item', quantity: 0, _count: { workOrderParts: 0 } }
      ];

      mockPrisma.inventoryItem.findMany.mockResolvedValue(mockItems as any);
      mockPrisma.inventoryItem.count.mockResolvedValue(1);

      // Act
      const result = await inventoryService.getInventoryItems(filter);

      // Assert
      expect(mockPrisma.inventoryItem.findMany).toHaveBeenCalledWith({
        where: { quantity: 0 },
        include: expect.any(Object),
        skip: 0,
        take: 20,
        orderBy: { name: 'asc' }
      });
      expect(result.items).toHaveLength(1);
    });
  });

  describe('updateInventoryItem', () => {
    it('should update inventory item successfully', async () => {
      // Arrange
      const itemId = 'item123';
      const updateData: UpdateInventoryItemRequest = {
        name: 'Updated Oil Filter',
        quantity: 75,
        unitPrice: 29.99
      };

      const mockUpdatedItem = {
        id: itemId,
        name: 'Updated Oil Filter',
        quantity: 75,
        unitPrice: 29.99,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.inventoryItem.update.mockResolvedValue(mockUpdatedItem as any);

      // Act
      const result = await inventoryService.updateInventoryItem(itemId, updateData);

      // Assert
      expect(mockPrisma.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: itemId },
        data: updateData
      });
      expect(result.name).toBe('Updated Oil Filter');
      expect(result.quantity).toBe(75);
    });
  });

  describe('deleteInventoryItem', () => {
    it('should delete inventory item successfully', async () => {
      // Arrange
      const itemId = 'item123';

      // Act
      await inventoryService.deleteInventoryItem(itemId);

      // Assert
      expect(mockPrisma.inventoryItem.delete).toHaveBeenCalledWith({
        where: { id: itemId }
      });
    });
  });

  describe('adjustInventory', () => {
    it('should add quantity successfully', async () => {
      // Arrange
      const adjustmentData: InventoryAdjustmentRequest = {
        inventoryItemId: 'item123',
        adjustmentType: 'ADD',
        quantity: 10,
        reason: 'Stock replenishment'
      };

      const mockItem = {
        id: 'item123',
        name: 'Oil Filter',
        quantity: 50
      };

      const mockUpdatedItem = {
        ...mockItem,
        quantity: 60
      };

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(mockItem as any);
      mockPrisma.inventoryItem.update.mockResolvedValue(mockUpdatedItem as any);

      // Act
      const result = await inventoryService.adjustInventory(adjustmentData);

      // Assert
      expect(mockPrisma.inventoryItem.findUnique).toHaveBeenCalledWith({
        where: { id: 'item123' }
      });
      expect(mockPrisma.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: 'item123' },
        data: { quantity: 60 }
      });
      expect(result.quantity).toBe(60);
    });

    it('should remove quantity successfully', async () => {
      // Arrange
      const adjustmentData: InventoryAdjustmentRequest = {
        inventoryItemId: 'item123',
        adjustmentType: 'REMOVE',
        quantity: 10,
        reason: 'Used in work order'
      };

      const mockItem = {
        id: 'item123',
        name: 'Oil Filter',
        quantity: 50
      };

      const mockUpdatedItem = {
        ...mockItem,
        quantity: 40
      };

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(mockItem as any);
      mockPrisma.inventoryItem.update.mockResolvedValue(mockUpdatedItem as any);

      // Act
      const result = await inventoryService.adjustInventory(adjustmentData);

      // Assert
      expect(result.quantity).toBe(40);
    });

    it('should set quantity successfully', async () => {
      // Arrange
      const adjustmentData: InventoryAdjustmentRequest = {
        inventoryItemId: 'item123',
        adjustmentType: 'SET',
        quantity: 25,
        reason: 'Stock count correction'
      };

      const mockItem = {
        id: 'item123',
        name: 'Oil Filter',
        quantity: 50
      };

      const mockUpdatedItem = {
        ...mockItem,
        quantity: 25
      };

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(mockItem as any);
      mockPrisma.inventoryItem.update.mockResolvedValue(mockUpdatedItem as any);

      // Act
      const result = await inventoryService.adjustInventory(adjustmentData);

      // Assert
      expect(result.quantity).toBe(25);
    });

    it('should throw error when item not found', async () => {
      // Arrange
      const adjustmentData: InventoryAdjustmentRequest = {
        inventoryItemId: 'nonexistent',
        adjustmentType: 'ADD',
        quantity: 10
      };

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(inventoryService.adjustInventory(adjustmentData)).rejects.toThrow('Inventory item not found');
    });

    it('should throw error when removing more than available stock', async () => {
      // Arrange
      const adjustmentData: InventoryAdjustmentRequest = {
        inventoryItemId: 'item123',
        adjustmentType: 'REMOVE',
        quantity: 60
      };

      const mockItem = {
        id: 'item123',
        name: 'Oil Filter',
        quantity: 50
      };

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(mockItem as any);

      // Act & Assert
      await expect(inventoryService.adjustInventory(adjustmentData)).rejects.toThrow('Insufficient stock for removal');
    });

    it('should throw error for invalid adjustment type', async () => {
      // Arrange
      const adjustmentData: InventoryAdjustmentRequest = {
        inventoryItemId: 'item123',
        adjustmentType: 'INVALID' as any,
        quantity: 10
      };

      const mockItem = {
        id: 'item123',
        name: 'Oil Filter',
        quantity: 50
      };

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(mockItem as any);

      // Act & Assert
      await expect(inventoryService.adjustInventory(adjustmentData)).rejects.toThrow('Invalid adjustment type');
    });
  });

  describe('transferInventory', () => {
    it('should transfer inventory successfully', async () => {
      // Arrange
      const transferData: InventoryTransferRequest = {
        fromLocation: 'Shelf A1',
        toLocation: 'Shelf B2',
        items: [
          { inventoryItemId: 'item1', quantity: 5 },
          { inventoryItemId: 'item2', quantity: 3 }
        ],
        reason: 'Reorganization'
      };

      const mockItems = [
        { id: 'item1', name: 'Oil Filter', quantity: 20, location: 'Shelf A1' },
        { id: 'item2', name: 'Air Filter', quantity: 15, location: 'Shelf A1' }
      ];

      mockPrisma.inventoryItem.findUnique
        .mockResolvedValueOnce(mockItems[0] as any)
        .mockResolvedValueOnce(mockItems[1] as any);

      // Act
      await inventoryService.transferInventory(transferData);

      // Assert
      expect(mockPrisma.inventoryItem.update).toHaveBeenCalledTimes(2);
      expect(mockPrisma.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: 'item1' },
        data: { quantity: 15, location: 'Shelf B2' }
      });
      expect(mockPrisma.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: 'item2' },
        data: { quantity: 12, location: 'Shelf B2' }
      });
    });

    it('should throw error when item not found', async () => {
      // Arrange
      const transferData: InventoryTransferRequest = {
        fromLocation: 'Shelf A1',
        toLocation: 'Shelf B2',
        items: [{ inventoryItemId: 'nonexistent', quantity: 5 }]
      };

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(inventoryService.transferInventory(transferData)).rejects.toThrow('Inventory item nonexistent not found');
    });

    it('should throw error when insufficient stock', async () => {
      // Arrange
      const transferData: InventoryTransferRequest = {
        fromLocation: 'Shelf A1',
        toLocation: 'Shelf B2',
        items: [{ inventoryItemId: 'item1', quantity: 30 }]
      };

      const mockItem = { id: 'item1', name: 'Oil Filter', quantity: 20, location: 'Shelf A1' };

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(mockItem as any);

      // Act & Assert
      await expect(inventoryService.transferInventory(transferData)).rejects.toThrow('Insufficient stock for item Oil Filter');
    });

    it('should throw error when item not in from location', async () => {
      // Arrange
      const transferData: InventoryTransferRequest = {
        fromLocation: 'Shelf A1',
        toLocation: 'Shelf B2',
        items: [{ inventoryItemId: 'item1', quantity: 5 }]
      };

      const mockItem = { id: 'item1', name: 'Oil Filter', quantity: 20, location: 'Shelf C3' };

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(mockItem as any);

      // Act & Assert
      await expect(inventoryService.transferInventory(transferData)).rejects.toThrow('Item Oil Filter is not in location Shelf A1');
    });
  });

  describe('getInventorySummary', () => {
    it('should return inventory summary', async () => {
      // Arrange
      const mockCategoryStats = [
        { categoryId: 'cat1', _count: { id: 5 }, _sum: { quantity: 150 } },
        { categoryId: 'cat2', _count: { id: 3 }, _sum: { quantity: 75 } }
      ];

      mockPrisma.inventoryItem.count.mockResolvedValue(8);
      mockPrisma.inventoryItem.aggregate.mockResolvedValue({ _sum: { quantity: 225 } } as any);
      mockPrisma.inventoryItem.count
        .mockResolvedValueOnce(2) // low stock
        .mockResolvedValueOnce(1); // out of stock
      mockPrisma.inventoryItem.groupBy.mockResolvedValue(mockCategoryStats as any);

      // Act
      const result = await inventoryService.getInventorySummary();

      // Assert
      expect(result.totalItems).toBe(8);
      expect(result.totalValue).toBe(225);
      expect(result.lowStockItems).toBe(2);
      expect(result.outOfStockItems).toBe(1);
      expect(result.categories).toHaveLength(2);
      expect(result.categories[0]).toEqual({
        category: 'cat1',
        count: 5,
        value: 150
      });
    });
  });

  describe('getLowStockItems', () => {
    it('should return items that are low on stock', async () => {
      // Arrange
      const mockItems = [
        { id: 'item1', name: 'Low Stock Item', quantity: 5, reorderPoint: 10, minStockLevel: null },
        { id: 'item2', name: 'Normal Stock Item', quantity: 20, reorderPoint: 10, minStockLevel: null },
        { id: 'item3', name: 'Min Level Item', quantity: 3, reorderPoint: null, minStockLevel: 5 }
      ];

      mockPrisma.inventoryItem.findMany.mockResolvedValue(mockItems as any);

      // Act
      const result = await inventoryService.getLowStockItems();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('item1');
      expect(result[1].id).toBe('item3');
    });
  });

  describe('getOutOfStockItems', () => {
    it('should return items that are out of stock', async () => {
      // Arrange
      const mockItems = [
        { id: 'item1', name: 'Out of Stock', quantity: 0 },
        { id: 'item2', name: 'In Stock', quantity: 10 }
      ];

      mockPrisma.inventoryItem.findMany.mockResolvedValue(mockItems as any);

      // Act
      const result = await inventoryService.getOutOfStockItems();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('item1');
      expect(result[0].quantity).toBe(0);
    });
  });

  describe('getInventoryReport', () => {
    it('should return inventory report with status', async () => {
      // Arrange
      const mockItems = [
        {
          id: 'item1',
          name: 'Oil Filter',
          sku: 'OIL-001',
          partNumber: 'OF123',
          quantity: 25,
          minStockLevel: 10,
          maxStockLevel: 50,
          reorderPoint: 15,
          unitPrice: 25.99,
          workOrderParts: [{ createdAt: new Date('2024-01-15') }],
          _count: { workOrderParts: 5 }
        },
        {
          id: 'item2',
          name: 'Out of Stock Item',
          sku: 'OUT-001',
          partNumber: 'OUT123',
          quantity: 0,
          minStockLevel: 5,
          maxStockLevel: 20,
          reorderPoint: 5,
          unitPrice: 15.50,
          workOrderParts: [],
          _count: { workOrderParts: 0 }
        }
      ];

      mockPrisma.inventoryItem.findMany.mockResolvedValue(mockItems as any);

      // Act
      const result = await inventoryService.getInventoryReport();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        itemId: 'item1',
        name: 'Oil Filter',
        sku: 'OIL-001',
        partNumber: 'OF123',
        currentStock: 25,
        minStockLevel: 10,
        maxStockLevel: 50,
        reorderPoint: 15,
        unitPrice: 25.99,
        totalValue: 649.75, // 25 * 25.99
        status: 'IN_STOCK',
        lastUsed: new Date('2024-01-15'),
        usageCount: 5
      });
      expect(result[1].status).toBe('OUT_OF_STOCK');
    });
  });

  describe('getReorderSuggestions', () => {
    it('should return reorder suggestions with urgency levels', async () => {
      // Arrange
      const mockItems = [
        {
          id: 'item1',
          name: 'Critical Item',
          sku: 'CRIT-001',
          partNumber: 'CRIT123',
          quantity: 0,
          reorderPoint: 5,
          unitPrice: 10.00,
          workOrderParts: [],
          _count: { workOrderParts: 10 }
        },
        {
          id: 'item2',
          name: 'Low Stock Item',
          sku: 'LOW-001',
          partNumber: 'LOW123',
          quantity: 2,
          reorderPoint: 10,
          unitPrice: 20.00,
          workOrderParts: [{ createdAt: new Date('2024-01-10') }],
          _count: { workOrderParts: 3 }
        }
      ];

      mockPrisma.inventoryItem.findMany.mockResolvedValue(mockItems as any);

      // Act
      const result = await inventoryService.getReorderSuggestions();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        inventoryItemId: 'item1',
        name: 'Critical Item',
        sku: 'CRIT-001',
        partNumber: 'CRIT123',
        currentStock: 0,
        reorderPoint: 5,
        suggestedQuantity: 5,
        estimatedCost: 50.00, // 5 * 10.00
        urgency: 'CRITICAL',
        lastUsed: undefined,
        usageFrequency: 10
      });
      expect(result[1].urgency).toBe('HIGH'); // quantity 2 <= reorderPoint 10 * 0.25
    });
  });

  describe('getWorkOrderParts', () => {
    it('should return work order parts with filters', async () => {
      // Arrange
      const filter = {
        workOrderId: 'wo123',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };

      const mockParts = [
        {
          id: 'part1',
          workOrderId: 'wo123',
          workOrder: { id: 'wo123', workOrderNumber: 'WO-001', status: 'COMPLETED' },
          part: { id: 'item1', name: 'Oil Filter', sku: 'OIL-001', partNumber: 'OF123' },
          installedBy: { userProfile: { supabaseUserId: 'user123' } },
          createdAt: new Date('2024-01-15')
        }
      ];

      mockPrisma.workOrderPart.findMany.mockResolvedValue(mockParts as any);

      // Act
      const result = await inventoryService.getWorkOrderParts(filter);

      // Assert
      expect(mockPrisma.workOrderPart.findMany).toHaveBeenCalledWith({
        where: {
          workOrderId: 'wo123',
          createdAt: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-12-31')
          }
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' }
      });
      expect(result).toHaveLength(1);
      expect(result[0].workOrder.workOrderNumber).toBe('WO-001');
    });
  });

  describe('bulkUpdateInventory', () => {
    it('should update multiple inventory items', async () => {
      // Arrange
      const items = [
        { id: 'item1', quantity: 100, unitPrice: 30.00 },
        { id: 'item2', quantity: 50, location: 'Shelf C1' }
      ];

      const mockUpdatedItems = [
        { id: 'item1', name: 'Item 1', quantity: 100, unitPrice: 30.00 },
        { id: 'item2', name: 'Item 2', quantity: 50, location: 'Shelf C1' }
      ];

      mockPrisma.inventoryItem.update
        .mockResolvedValueOnce(mockUpdatedItems[0] as any)
        .mockResolvedValueOnce(mockUpdatedItems[1] as any);

      // Act
      const result = await inventoryService.bulkUpdateInventory(items);

      // Assert
      expect(mockPrisma.inventoryItem.update).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });
  });

  describe('getCategories', () => {
    it('should return list of categories', async () => {
      // Arrange
      const mockCategories = [
        { name: 'Engine Parts' },
        { name: 'Brake Parts' },
        { name: 'Electrical' }
      ];

      mockPrisma.inventoryCategory.findMany.mockResolvedValue(mockCategories as any);

      // Act
      const result = await inventoryService.getCategories();

      // Assert
      expect(result).toEqual(['Engine Parts', 'Brake Parts', 'Electrical']);
    });
  });

  describe('getManufacturers', () => {
    it('should return list of manufacturers', async () => {
      // Arrange
      const mockManufacturers = [
        { manufacturer: 'Bosch' },
        { manufacturer: 'ACDelco' },
        { manufacturer: 'Bosch' } // duplicate
      ];

      mockPrisma.inventoryItem.findMany.mockResolvedValue(mockManufacturers as any);

      // Act
      const result = await inventoryService.getManufacturers();

      // Assert
      expect(result).toEqual(['Bosch', 'ACDelco', 'Bosch']);
    });
  });

  describe('getSuppliers', () => {
    it('should return list of suppliers', async () => {
      // Arrange
      const mockSuppliers = [
        { supplier: 'AutoParts Inc' },
        { supplier: 'Parts Plus' }
      ];

      mockPrisma.inventoryItem.findMany.mockResolvedValue(mockSuppliers as any);

      // Act
      const result = await inventoryService.getSuppliers();

      // Assert
      expect(result).toEqual(['AutoParts Inc', 'Parts Plus']);
    });
  });

  describe('getLocations', () => {
    it('should return list of locations', async () => {
      // Arrange
      const mockLocations = [
        { location: 'Shelf A1' },
        { location: 'Shelf B2' },
        { location: 'Warehouse' }
      ];

      mockPrisma.inventoryItem.findMany.mockResolvedValue(mockLocations as any);

      // Act
      const result = await inventoryService.getLocations();

      // Assert
      expect(result).toEqual(['Shelf A1', 'Shelf B2', 'Warehouse']);
    });
  });
});