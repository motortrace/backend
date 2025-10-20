import { Request, Response } from 'express';
import { InventoryService } from './inventory.service';
import {
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  InventoryAdjustmentRequest,
  InventoryTransferRequest,
  InventoryFilter,
  CreateInventoryCategoryRequest,
  UpdateInventoryCategoryRequest,
} from './inventory.types';

export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}
  // InventoryCategory Methods
  async createInventoryCategory(req: Request, res: Response) {
    try {
      const data: CreateInventoryCategoryRequest = req.body;
      const category = await this.inventoryService.createInventoryCategory(data);
      
      res.status(201).json({
        success: true,
        data: category,
        message: 'Inventory category created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getInventoryCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await this.inventoryService.getInventoryCategory(id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Inventory category not found',
        });
      }
      
      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getInventoryCategories(req: Request, res: Response) {
    try {
      const categories = await this.inventoryService.getInventoryCategories();
      
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateInventoryCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateInventoryCategoryRequest = req.body;
      
      const category = await this.inventoryService.updateInventoryCategory(id, data);
      
      res.status(200).json({
        success: true,
        data: category,
        message: 'Inventory category updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteInventoryCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await this.inventoryService.deleteInventoryCategory(id);
      
      res.status(200).json({
        success: true,
        message: 'Inventory category deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async createInventoryItem(req: Request, res: Response) {
    try {
      const data: CreateInventoryItemRequest = req.body;
      const item = await this.inventoryService.createInventoryItem(data);
      
      res.status(201).json({
        success: true,
        data: item,
        message: 'Inventory item created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getInventoryItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await this.inventoryService.getInventoryItem(id);
      
      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Inventory item not found',
        });
      }
      
      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getInventoryItems(req: Request, res: Response) {
    try {
      const filter: InventoryFilter = req.query as any;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await this.inventoryService.getInventoryItems(filter, page, limit);
      
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: {
          page: result.page,
          total: result.total,
          totalPages: result.totalPages,
          limit,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateInventoryItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateInventoryItemRequest = req.body;
      
      const item = await this.inventoryService.updateInventoryItem(id, data);
      
      res.status(200).json({
        success: true,
        data: item,
        message: 'Inventory item updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteInventoryItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.inventoryService.deleteInventoryItem(id);
      
      res.status(200).json({
        success: true,
        message: 'Inventory item deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async adjustInventory(req: Request, res: Response) {
    try {
      const data: InventoryAdjustmentRequest = req.body;
      const item = await this.inventoryService.adjustInventory(data);
      
      res.status(200).json({
        success: true,
        data: item,
        message: 'Inventory adjusted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async transferInventory(req: Request, res: Response) {
    try {
      const data: InventoryTransferRequest = req.body;
      await this.inventoryService.transferInventory(data);
      
      res.status(200).json({
        success: true,
        message: 'Inventory transferred successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getInventorySummary(req: Request, res: Response) {
    try {
      const summary = await this.inventoryService.getInventorySummary();
      
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getLowStockItems(req: Request, res: Response) {
    try {
      const items = await this.inventoryService.getLowStockItems();
      
      res.status(200).json({
        success: true,
        data: items,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getOutOfStockItems(req: Request, res: Response) {
    try {
      const items = await this.inventoryService.getOutOfStockItems();
      
      res.status(200).json({
        success: true,
        data: items,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getInventoryReport(req: Request, res: Response) {
    try {
      const report = await this.inventoryService.getInventoryReport();
      
      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getReorderSuggestions(req: Request, res: Response) {
    try {
      const suggestions = await this.inventoryService.getReorderSuggestions();
      
      res.status(200).json({
        success: true,
        data: suggestions,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getWorkOrderParts(req: Request, res: Response) {
    try {
      const { workOrderId, startDate, endDate } = req.query;
      const filter = {
        workOrderId: workOrderId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };
      
      const parts = await this.inventoryService.getWorkOrderParts(filter);
      
      res.status(200).json({
        success: true,
        data: parts,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // New: get products from products table
  async getProducts(req: Request, res: Response) {
    try {
      const products = await this.inventoryService.getProducts();
      res.status(200).json({ success: true, data: products });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async addProduct(req: Request, res: Response) {
    try {
      const data = req.body;

      // Basic validation
      if (!data.productName || !data.category || !data.price) {
        return res.status(400).json({ success: false, error: 'Missing required fields: productName, category, and price are required' });
      }

      const product = await this.inventoryService.addProduct(data);
      res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const updated = await this.inventoryService.updateProduct(id, data);
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      if (error.message === 'Product not found') {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      if (error.message === 'No valid fields provided for update') {
        return res.status(400).json({ success: false, error: error.message });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await this.inventoryService.deleteProduct(id);
      res.status(200).json({ success: true, message: 'Product deleted successfully', deletedProduct: deleted });
    } catch (error: any) {
      if (error.message === 'Product not found') {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getInventoryAnalytics(req: Request, res: Response) {
    try {
      const analytics = await this.inventoryService.getInventoryAnalytics();
      res.status(200).json(analytics);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getLowStockProducts(req: Request, res: Response) {
    try {
      const category = (req.query.category as string) || undefined;
      const products = await this.inventoryService.getLowStockProducts(category);
      res.status(200).json({ lowStockProducts: products, count: products.length, category: category || 'All Categories' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getOutOfStockProducts(req: Request, res: Response) {
    try {
      const category = (req.query.category as string) || undefined;
      const products = await this.inventoryService.getOutOfStockProducts(category);
      res.status(200).json({ outOfStockProducts: products, count: products.length, category: category || 'All Categories' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateProductQuantity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { quantity, minquantity } = req.body;

      if (quantity === undefined && minquantity === undefined) {
        return res.status(400).json({ success: false, error: 'At least one field (quantity or minquantity) is required for update' });
      }

      const updated = await this.inventoryService.updateProductQuantity(id, { quantity, minquantity });
      res.status(200).json({ message: 'Product quantity updated successfully', product: updated });
    } catch (error: any) {
      if (error.message === 'Product not found') return res.status(404).json({ success: false, error: 'Product not found' });
      if (error.message === 'At least one field (quantity or minquantity) is required for update') return res.status(400).json({ success: false, error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async bulkUpdateInventory(req: Request, res: Response) {
    try {
      const { items } = req.body;
      const updatedItems = await this.inventoryService.bulkUpdateInventory(items);
      
      res.status(200).json({
        success: true,
        data: updatedItems,
        message: 'Inventory items updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await this.inventoryService.getCategories();
      
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getManufacturers(req: Request, res: Response) {
    try {
      const manufacturers = await this.inventoryService.getManufacturers();
      
      res.status(200).json({
        success: true,
        data: manufacturers,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getSuppliers(req: Request, res: Response) {
    try {
      const suppliers = await this.inventoryService.getSuppliers();
      
      res.status(200).json({
        success: true,
        data: suppliers,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getLocations(req: Request, res: Response) {
    try {
      const locations = await this.inventoryService.getLocations();
      
      res.status(200).json({
        success: true,
        data: locations,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Create a new issuance (transactional)
  async createIssuance(req: Request, res: Response) {
    try {
      const data = req.body;
      const issuance = await this.inventoryService.createIssuance(data as any);

      res.status(201).json({
        success: true,
        message: 'Issuance created successfully',
        data: issuance,
      });
    } catch (error: any) {
      // Match existing error handling style
      if (error.message && error.message.startsWith('Insufficient quantity')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      if (error.message && error.message.includes('not found')) {
        return res.status(404).json({ success: false, error: error.message });
      }
      console.error('createIssuance error:', error.message);
      res.status(500).json({ success: false, error: 'Internal server error', details: error.message });
    }
  }

  // Get all issuances with optional dateFrom and dateTo filters
  async getIssuances(req: Request, res: Response) {
    try {
      const { dateFrom, dateTo } = req.query as any;
      const rows = await this.inventoryService.getIssuances({ dateFrom, dateTo });
      res.status(200).json({ success: true, data: rows });
    } catch (error: any) {
      console.error('getIssuances error:', error.message);
      res.status(500).json({ success: false, error: 'Internal server error', details: error.message });
    }
  }

  // Get a single issuance by ID with its parts
  async getIssuanceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const issuanceId = Number(id);
      if (isNaN(issuanceId)) return res.status(400).json({ success: false, error: 'Invalid issuance id' });

      const issuance = await this.inventoryService.getIssuanceWithParts(issuanceId);

      if (!issuance) return res.status(404).json({ success: false, error: 'Issuance not found' });

      res.status(200).json({ success: true, data: issuance });
    } catch (error: any) {
      console.error('getIssuanceById error:', error.message);
      res.status(500).json({ success: false, error: 'Internal server error', details: error.message });
    }
  }

  // Parts usage analytics
  async getPartsUsageAnalytics(req: Request, res: Response) {
    try {
      const { dateFrom, dateTo, limit } = req.query as any;
      const data = await this.inventoryService.getPartsUsageAnalytics({ dateFrom, dateTo, limit: limit ? Number(limit) : undefined });

      const analyticsData = {
        summary: {
          totalPartsIssued: parseInt(data.total_parts_issued) || 0,
          totalIssuances: parseInt(data.total_issuances) || 0,
          uniqueParts: parseInt(data.unique_parts) || 0,
          averagePartsPerIssuance: parseFloat(data.avg_parts_per_issuance) || 0,
        },
        topParts: data.top_parts || [],
        categoryDistribution: data.category_distribution || [],
      };

      res.status(200).json({ success: true, data: analyticsData });
    } catch (error: any) {
      console.error('getPartsUsageAnalytics error:', error.message);
      res.status(500).json({ success: false, error: 'Internal server error', details: error.message });
    }
  }

  // Cost summary analytics
  async getCostSummaryAnalytics(req: Request, res: Response) {
    try {
      const { dateFrom, dateTo } = req.query as any;
      const row = await this.inventoryService.getCostSummaryAnalytics({ dateFrom, dateTo });

      const costSummary = {
        summary: {
          totalCost: parseFloat(row.total_cost) || 0,
          totalIssuances: parseInt(row.total_issuances) || 0,
          averageCostPerIssuance: parseFloat(row.avg_cost_per_issuance) || 0,
          highestMonthlyCost: parseFloat(row.highest_monthly_cost) || 0,
        },
        monthlyTrend: row.monthly_trend || [],
        categoryBreakdown: row.category_breakdown || [],
      };

      res.status(200).json({ success: true, data: costSummary });
    } catch (error: any) {
      console.error('getCostSummaryAnalytics error:', error.message);
      res.status(500).json({ success: false, error: 'Internal server error', details: error.message });
    }
  }

  // Order metrics analytics
  async getOrderMetrics(req: Request, res: Response) {
    try {
      const row = await this.inventoryService.getOrderMetrics();

      const orderMetrics = {
        metrics: {
          totalIssuances: parseInt(row.total_issuances) || 0,
          totalIssuedParts: parseInt(row.total_issued_parts) || 0,
          totalSales: parseFloat(parseFloat(row.total_sales).toFixed(2)) || 0,
        },
        // Placeholder: you can replace with real delta calculations
        changes: {
          totalIssuances: 12.5,
          totalIssuedParts: 8.2,
          totalSales: -3.1,
        },
      };

      res.status(200).json({ success: true, data: orderMetrics });
    } catch (error: any) {
      console.error('getOrderMetrics error:', error.message);
      res.status(500).json({ success: false, error: 'Internal server error', details: error.message });
    }
  }
}


