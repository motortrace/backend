import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import {
  validateCreateInventoryItem,
  validateUpdateInventoryItem,
  validateInventoryAdjustment,
  validateInventoryTransfer,
  validateInventoryFilter,
  validateBulkUpdate,
} from './inventory.validation';

const router = Router();
const inventoryController = new InventoryController();

// Basic CRUD operations
router.post('/', validateCreateInventoryItem, inventoryController.createInventoryItem.bind(inventoryController));
router.get('/', validateInventoryFilter, inventoryController.getInventoryItems.bind(inventoryController));
router.get('/summary', inventoryController.getInventorySummary.bind(inventoryController));
router.get('/categories', inventoryController.getCategories.bind(inventoryController));
router.get('/manufacturers', inventoryController.getManufacturers.bind(inventoryController));
router.get('/suppliers', inventoryController.getSuppliers.bind(inventoryController));
router.get('/locations', inventoryController.getLocations.bind(inventoryController));

// Individual item operations
router.get('/:id', inventoryController.getInventoryItem.bind(inventoryController));
router.put('/:id', validateUpdateInventoryItem, inventoryController.updateInventoryItem.bind(inventoryController));
router.delete('/:id', inventoryController.deleteInventoryItem.bind(inventoryController));

// Inventory management operations
router.post('/adjust', validateInventoryAdjustment, inventoryController.adjustInventory.bind(inventoryController));
router.post('/transfer', validateInventoryTransfer, inventoryController.transferInventory.bind(inventoryController));
router.put('/bulk-update', validateBulkUpdate, inventoryController.bulkUpdateInventory.bind(inventoryController));

// Stock monitoring
router.get('/low-stock/items', inventoryController.getLowStockItems.bind(inventoryController));
router.get('/out-of-stock/items', inventoryController.getOutOfStockItems.bind(inventoryController));
router.get('/reorder-suggestions', inventoryController.getReorderSuggestions.bind(inventoryController));

// Reports and analytics
router.get('/report/inventory', inventoryController.getInventoryReport.bind(inventoryController));
router.get('/report/work-order-parts', inventoryController.getWorkOrderParts.bind(inventoryController));

export default router;
