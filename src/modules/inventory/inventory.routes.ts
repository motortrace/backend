import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import {
  validateCreateInventoryItem,
  validateUpdateInventoryItem,
  validateInventoryAdjustment,
  validateInventoryTransfer,
  validateInventoryFilter,
  validateBulkUpdate,
  validateCreateInventoryCategory,
  validateUpdateInventoryCategory,
} from './inventory.validation';
import prisma from '../../infrastructure/database/prisma';

const router = Router();
const inventoryService = new InventoryService(prisma);
const inventoryController = new InventoryController(inventoryService);

// InventoryCategory CRUD operations
router.post('/categories', validateCreateInventoryCategory, inventoryController.createInventoryCategory.bind(inventoryController));
router.get('/categories', inventoryController.getInventoryCategories.bind(inventoryController));
router.get('/categories/:id', inventoryController.getInventoryCategory.bind(inventoryController));
router.put('/categories/:id', validateUpdateInventoryCategory, inventoryController.updateInventoryCategory.bind(inventoryController));
router.delete('/categories/:id', inventoryController.deleteInventoryCategory.bind(inventoryController));

// Basic CRUD operations
router.post('/', validateCreateInventoryItem, inventoryController.createInventoryItem.bind(inventoryController));
router.get('/', validateInventoryFilter, inventoryController.getInventoryItems.bind(inventoryController));
router.get('/summary', inventoryController.getInventorySummary.bind(inventoryController));
router.get('/item-categories', inventoryController.getCategories.bind(inventoryController));
router.get('/manufacturers', inventoryController.getManufacturers.bind(inventoryController));
router.get('/suppliers', inventoryController.getSuppliers.bind(inventoryController));
router.get('/locations', inventoryController.getLocations.bind(inventoryController));

// Inventory management operations
router.post('/adjust', validateInventoryAdjustment, inventoryController.adjustInventory.bind(inventoryController));
router.post('/transfer', validateInventoryTransfer, inventoryController.transferInventory.bind(inventoryController));
router.put('/bulk-update', validateBulkUpdate, inventoryController.bulkUpdateInventory.bind(inventoryController));
router.put('/update/:id', inventoryController.updateProductQuantity.bind(inventoryController));

// Issuances
router.post('/issuances', inventoryController.createIssuance.bind(inventoryController));
router.get('/issuances', inventoryController.getIssuances.bind(inventoryController));
router.get('/issuances/:id', inventoryController.getIssuanceById.bind(inventoryController));

// Stock monitoring (static routes placed before dynamic '/:id' to avoid route shadowing)
router.get('/low-stock/items', inventoryController.getLowStockItems.bind(inventoryController));
router.get('/out-of-stock/items', inventoryController.getOutOfStockItems.bind(inventoryController));
router.get('/reorder-suggestions', inventoryController.getReorderSuggestions.bind(inventoryController));

// Reports and analytics
router.get('/report/inventory', inventoryController.getInventoryReport.bind(inventoryController));
router.get('/report/work-order-parts', inventoryController.getWorkOrderParts.bind(inventoryController));
// Inventory analytics summary
router.get('/analytics', inventoryController.getInventoryAnalytics.bind(inventoryController));
router.get('/analytics/low-stock', inventoryController.getLowStockProducts.bind(inventoryController));
router.get('/analytics/out-of-stock', inventoryController.getOutOfStockProducts.bind(inventoryController));
// Parts usage analytics
router.get('/analytics/parts-usage', inventoryController.getPartsUsageAnalytics.bind(inventoryController));
router.get('/analytics/cost-summary', inventoryController.getCostSummaryAnalytics.bind(inventoryController));
router.get('/analytics/order-metrics', inventoryController.getOrderMetrics.bind(inventoryController));

// Products (from products table)
router.get('/products', inventoryController.getProducts.bind(inventoryController));
router.post('/products', inventoryController.addProduct.bind(inventoryController));
router.put('/products/:id', inventoryController.updateProduct.bind(inventoryController));
router.delete('/products/:id', inventoryController.deleteProduct.bind(inventoryController));

// Individual item operations (dynamic route should come last)
router.get('/:id', inventoryController.getInventoryItem.bind(inventoryController));
router.put('/:id', inventoryController.updateInventoryItem.bind(inventoryController));
router.delete('/:id', inventoryController.deleteInventoryItem.bind(inventoryController));

export default router;
