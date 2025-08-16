import { InventoryItem, WorkOrderPart } from '@prisma/client';

// InventoryCategory Types
export interface CreateInventoryCategoryRequest {
  name: string;
}

export interface UpdateInventoryCategoryRequest {
  name?: string;
}

export interface InventoryCategoryWithItems {
  id: string;
  name: string;
  inventoryItems: InventoryItem[];
  _count: {
    inventoryItems: number;
  };
}

export interface CreateInventoryItemRequest {
  name: string;
  sku?: string;
  partNumber?: string;
  manufacturer?: string;
  category?: string;
  location?: string;
  quantity: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  unitPrice: number;
  supplier?: string;
  supplierPartNumber?: string;
  core?: boolean;
  corePrice?: number;
}

export interface UpdateInventoryItemRequest {
  name?: string;
  sku?: string;
  partNumber?: string;
  manufacturer?: string;
  category?: string;
  location?: string;
  quantity?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  unitPrice?: number;
  supplier?: string;
  supplierPartNumber?: string;
  core?: boolean;
  corePrice?: number;
}

export interface InventoryAdjustmentRequest {
  inventoryItemId: string;
  adjustmentType: 'ADD' | 'REMOVE' | 'SET';
  quantity: number;
  reason: string;
  notes?: string;
  workOrderId?: string;
}

export interface InventoryTransferRequest {
  fromLocation: string;
  toLocation: string;
  items: Array<{
    inventoryItemId: string;
    quantity: number;
  }>;
  notes?: string;
}

export interface InventoryItemWithUsage extends InventoryItem {
  _count: {
    workOrderParts: number;
  };
}

export interface WorkOrderPartWithDetails extends WorkOrderPart {
  workOrder: {
    id: string;
    workOrderNumber: string;
    status: string;
  };
  part: {
    id: string;
    name: string;
    sku: string | null;
    partNumber: string | null;
  };
  cannedService: {
    id: string;
    code: string;
    name: string;
  } | null;
  installedBy: {
    id: string;
    supabaseUserId: string;
  } | null;
}

export interface InventorySummary {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  categories: Array<{
    category: string;
    count: number;
    value: number;
  }>;
}

export interface InventoryFilter {
  category?: string;
  manufacturer?: string;
  supplier?: string;
  location?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface InventoryReport {
  itemId: string;
  name: string;
  sku: string | null;
  partNumber: string | null;
  currentStock: number;
  minStockLevel: number | null;
  maxStockLevel: number | null;
  reorderPoint: number | null;
  unitPrice: number;
  totalValue: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK';
  lastUsed?: Date;
  usageCount: number;
}

export interface StockMovement {
  id: string;
  inventoryItemId: string;
  itemName: string;
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  workOrderId?: string;
  workOrderNumber?: string;
  performedBy?: string;
  timestamp: Date;
}

export interface ReorderSuggestion {
  inventoryItemId: string;
  name: string;
  sku: string | null;
  partNumber: string | null;
  currentStock: number;
  reorderPoint: number;
  suggestedQuantity: number;
  estimatedCost: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lastUsed?: Date;
  usageFrequency: number;
}
