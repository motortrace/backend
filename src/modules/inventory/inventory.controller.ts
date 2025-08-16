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

const inventoryService = new InventoryService();

export class InventoryController {
  // InventoryCategory Methods
  async createInventoryCategory(req: Request, res: Response) {
    try {
      const data: CreateInventoryCategoryRequest = req.body;
      const category = await inventoryService.createInventoryCategory(data);
      
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
      const category = await inventoryService.getInventoryCategory(id);
      
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
      const categories = await inventoryService.getInventoryCategories();
      
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
      
      const category = await inventoryService.updateInventoryCategory(id, data);
      
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
      
      await inventoryService.deleteInventoryCategory(id);
      
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
      const item = await inventoryService.createInventoryItem(data);
      
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
      const item = await inventoryService.getInventoryItem(id);
      
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
      
      const result = await inventoryService.getInventoryItems(filter, page, limit);
      
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
      
      const item = await inventoryService.updateInventoryItem(id, data);
      
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
      await inventoryService.deleteInventoryItem(id);
      
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
      const item = await inventoryService.adjustInventory(data);
      
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
      await inventoryService.transferInventory(data);
      
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
      const summary = await inventoryService.getInventorySummary();
      
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
      const items = await inventoryService.getLowStockItems();
      
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
      const items = await inventoryService.getOutOfStockItems();
      
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
      const report = await inventoryService.getInventoryReport();
      
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
      const suggestions = await inventoryService.getReorderSuggestions();
      
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
      
      const parts = await inventoryService.getWorkOrderParts(filter);
      
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

  async bulkUpdateInventory(req: Request, res: Response) {
    try {
      const { items } = req.body;
      const updatedItems = await inventoryService.bulkUpdateInventory(items);
      
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
      const categories = await inventoryService.getCategories();
      
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
      const manufacturers = await inventoryService.getManufacturers();
      
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
      const suppliers = await inventoryService.getSuppliers();
      
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
      const locations = await inventoryService.getLocations();
      
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
}
