import { InventoryItem, WorkOrderPart } from '@prisma/client';
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
import { PrismaClient } from '@prisma/client';

export class InventoryService {
  constructor(private readonly prisma: PrismaClient) {}
  // InventoryCategory Methods
  async createInventoryCategory(data: CreateInventoryCategoryRequest) {
    return await this.prisma.inventoryCategory.create({
      data: {
        name: data.name,
      },
    });
  }

  async getInventoryCategory(id: string): Promise<InventoryCategoryWithItems | null> {
    return await this.prisma.inventoryCategory.findUnique({
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
    return await this.prisma.inventoryCategory.findMany({
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
    return await this.prisma.inventoryCategory.update({
      where: { id },
      data: {
        name: data.name,
      },
    });
  }

  async deleteInventoryCategory(id: string): Promise<boolean> {
    try {
      // Check if category has any inventory items
      const category = await this.prisma.inventoryCategory.findUnique({
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

      await this.prisma.inventoryCategory.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  async createInventoryItem(data: CreateInventoryItemRequest): Promise<InventoryItem> {
    return await (this.prisma as any).inventoryItem.create({
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
    return await this.prisma.inventoryItem.findUnique({
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
      this.prisma.inventoryItem.findMany({
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
      this.prisma.inventoryItem.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateInventoryItem(id: string, data: UpdateInventoryItemRequest): Promise<InventoryItem> {
    return await this.prisma.inventoryItem.update({
      where: { id },
      data,
    });
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await this.prisma.inventoryItem.delete({
      where: { id },
    });
  }

  async adjustInventory(data: InventoryAdjustmentRequest): Promise<InventoryItem> {
    const item = await this.prisma.inventoryItem.findUnique({
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

    return await this.prisma.inventoryItem.update({
      where: { id: data.inventoryItemId },
      data: { quantity: newQuantity },
    });
  }

  async transferInventory(data: InventoryTransferRequest): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
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
      this.prisma.inventoryItem.count(),
      this.prisma.inventoryItem.aggregate({
        _sum: {
          quantity: true,
        },
      }),
      this.prisma.inventoryItem.count({
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
      this.prisma.inventoryItem.count({
        where: { quantity: 0 },
      }),
      this.prisma.inventoryItem.groupBy({
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
    const items = await this.prisma.inventoryItem.findMany({
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
    return await this.prisma.inventoryItem.findMany({
      where: { quantity: 0 },
      orderBy: { name: 'asc' },
    });
  }

  // Create an issuance (transactional): create issuance header, parts, and update product quantities
  async createIssuance(data: any) {
    const parts = data.parts || [];
    if (!data.issuance_number || !data.technician_name || !Array.isArray(parts) || parts.length === 0) {
      throw new Error('Issuance number, technician name, and at least one part are required');
    }

    const totalQuantity = parts.reduce((s: number, p: any) => s + (p.quantity || 0), 0);

    // Use a transaction to ensure consistency
  const result = await this.prisma.$transaction(async (tx: any) => {
      // Create issuance header
      const issuance = await tx.issuance.create({
        data: {
          issuanceNumber: data.issuance_number,
          dateIssued: data.date_issued ? new Date(data.date_issued) : undefined,
          technicianName: data.technician_name,
          recipient: data.recipient,
          issuedBy: data.issued_by,
          serviceJob: data.service_job,
          carDetails: data.car_details,
          notes: data.notes,
          totalQuantity: totalQuantity,
        },
      });

      // For each part: validate product exists, sufficient quantity, insert part and update product
      for (const p of parts) {
        const productId = p.product_id;
        const requestedQty = Number(p.quantity || 0);

        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product) throw new Error(`Product with ID ${productId} not found`);

        const currentQty = product.quantity || 0;
        const minQty = product.minquantity || 0;

        if (currentQty < requestedQty) {
          throw new Error(`Insufficient quantity for ${product.productname}. Available: ${currentQty}, Requested: ${requestedQty}`);
        }

        const newQty = currentQty - requestedQty;

        // Create issuance part row
        await tx.issuancePart.create({
          data: {
            issuanceId: issuance.id,
            productId: productId,
            quantity: requestedQty,
            notes: p.notes || null,
          },
        });

        // Update product quantity and availability
        const availability = newQty === 0 ? 'Out of Stock' : (newQty < minQty ? 'Low Stock' : 'In Stock');

        await tx.product.update({
          where: { id: productId },
          data: {
            quantity: newQty,
            availability,
            updated_at: new Date(),
          },
        });
      }

      return issuance;
    });

    // return issuance with parts included
    return this.getIssuanceWithParts(result.id);
  }

  async getIssuanceWithParts(issuanceId: number) {
    // `this.prisma` types may be out-of-date until `npx prisma generate` is run.
    // Cast to any here to avoid TypeScript errors while preserving runtime behavior.
    return await (this.prisma as any).issuance.findUnique({
      where: { id: issuanceId },
      include: {
        parts: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  // Get issuances with their parts (optional date filtering)
  async getIssuances(filter: { dateFrom?: string; dateTo?: string } = {}) {
    const { dateFrom, dateTo } = filter;
    // Build parameterized query
    const params: any[] = [];
    let whereClauses: string[] = [];

    if (dateFrom) {
      params.push(dateFrom);
      // Cast the parameter to date to avoid text/date comparison errors
      whereClauses.push(`i.date_issued >= $${params.length}::date`);
    }
    if (dateTo) {
      params.push(dateTo);
      // Cast the parameter to date to avoid text/date comparison errors
      whereClauses.push(`i.date_issued <= $${params.length}::date`);
    }

    let query = `
      SELECT
        i.*,
        COALESCE(json_agg(json_build_object(
          'id', ip.id,
          'product_id', ip.product_id,
          'product_name', p.productname,
          'quantity', ip.quantity,
          'notes', ip.notes,
          'image', p.image,
          'price', p.price
        )) FILTER (WHERE ip.id IS NOT NULL), '[]') AS parts
      FROM issuances i
      LEFT JOIN issuance_parts ip ON i.id = ip.issuance_id
      LEFT JOIN products p ON ip.product_id = p.id
    `;

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    query += ` GROUP BY i.id ORDER BY i.date_issued DESC, i.issuance_number DESC`;

    // Use prisma's raw query; cast prisma to any in case types are not yet generated
    const rows = await (this.prisma as any).$queryRawUnsafe(query, ...params);
    return rows;
  }

  // Parts usage analytics: summary, top parts, and category distribution
  async getPartsUsageAnalytics(filter: { dateFrom?: string; dateTo?: string; limit?: number } = {}) {
    const dateFrom = filter.dateFrom || null;
    const dateTo = filter.dateTo || null;
    const limit = filter.limit || 10;

    // Use NULL-safe filters so callers can omit dates.
    const query = `
      WITH issuance_stats AS (
        SELECT 
          COUNT(DISTINCT i.id) as total_issuances,
          COUNT(ip.id) as total_parts_issued,
          COUNT(DISTINCT ip.product_id) as unique_parts,
          CASE 
            WHEN COUNT(DISTINCT i.id) > 0 THEN COUNT(ip.id)::DECIMAL / COUNT(DISTINCT i.id)
            ELSE 0 
          END as avg_parts_per_issuance
        FROM issuances i
        LEFT JOIN issuance_parts ip ON i.id = ip.issuance_id
        WHERE ($1::date IS NULL OR i.date_issued >= $1::date) AND ($2::date IS NULL OR i.date_issued <= $2::date)
      ),
      top_parts AS (
        SELECT 
          p.id as product_id,
          p.productname as product_name,
          p.category,
          SUM(ip.quantity) as total_quantity,
          COUNT(DISTINCT ip.issuance_id) as frequency,
          CASE 
            WHEN COUNT(DISTINCT ip.issuance_id) > 0 THEN SUM(ip.quantity)::DECIMAL / COUNT(DISTINCT ip.issuance_id)
            ELSE 0 
          END as average_per_issuance
        FROM issuance_parts ip
        JOIN products p ON ip.product_id = p.id
        JOIN issuances i ON ip.issuance_id = i.id
        WHERE ($1::date IS NULL OR i.date_issued >= $1::date) AND ($2::date IS NULL OR i.date_issued <= $2::date)
        GROUP BY p.id, p.productname, p.category
        ORDER BY total_quantity DESC
        LIMIT $3
      ),
      category_stats AS (
        SELECT 
          p.category,
          SUM(ip.quantity) as quantity,
          CASE 
            WHEN (SELECT total_parts_issued FROM issuance_stats) > 0 
            THEN (SUM(ip.quantity)::DECIMAL / (SELECT total_parts_issued FROM issuance_stats)) * 100
            ELSE 0 
          END as percentage
        FROM issuance_parts ip
        JOIN products p ON ip.product_id = p.id
        JOIN issuances i ON ip.issuance_id = i.id
        WHERE ($1::date IS NULL OR i.date_issued >= $1::date) AND ($2::date IS NULL OR i.date_issued <= $2::date)
        GROUP BY p.category
        ORDER BY quantity DESC
      )
      SELECT 
        (SELECT total_issuances FROM issuance_stats) as total_issuances,
        (SELECT total_parts_issued FROM issuance_stats) as total_parts_issued,
        (SELECT unique_parts FROM issuance_stats) as unique_parts,
        (SELECT avg_parts_per_issuance FROM issuance_stats) as avg_parts_per_issuance,
        (SELECT json_agg(json_build_object(
          'product_id', product_id,
          'product_name', product_name,
          'category', category,
          'total_quantity', total_quantity,
          'frequency', frequency,
          'average_per_issuance', average_per_issuance
        )) FROM top_parts) as top_parts,
        (SELECT json_agg(json_build_object(
          'category', category,
          'quantity', quantity,
          'percentage', ROUND(percentage, 1)
        )) FROM category_stats) as category_distribution
    `;

    const rows = await (this.prisma as any).$queryRawUnsafe(query, dateFrom, dateTo, limit);
    return rows[0] || { total_issuances: 0, total_parts_issued: 0, unique_parts: 0, avg_parts_per_issuance: 0, top_parts: [], category_distribution: [] };
  }

  // Cost summary analytics: total cost, monthly trend, and category breakdown
  async getCostSummaryAnalytics(filter: { dateFrom?: string; dateTo?: string } = {}) {
    const dateFrom = filter.dateFrom || null;
    const dateTo = filter.dateTo || null;

    const query = `
      WITH issuance_costs AS (
        SELECT 
          i.id,
          i.date_issued,
          TO_CHAR(i.date_issued, 'Mon YYYY') as month_display,
          TO_CHAR(i.date_issued, 'YYYY-MM') as month_key,
          SUM(
            CASE 
              WHEN p.price ~ '^[0-9]+(\\.[0-9]+)?$' THEN CAST(p.price AS NUMERIC) * ip.quantity
              ELSE 0
            END
          ) as issuance_cost
        FROM issuances i
        JOIN issuance_parts ip ON i.id = ip.issuance_id
        JOIN products p ON ip.product_id = p.id
        WHERE ($1::date IS NULL OR i.date_issued >= $1::date) AND ($2::date IS NULL OR i.date_issued <= $2::date)
        GROUP BY i.id, i.date_issued
      ),
      monthly_costs AS (
        SELECT 
          month_display,
          month_key,
          SUM(issuance_cost) as monthly_cost,
          COUNT(DISTINCT id) as monthly_issuances
        FROM issuance_costs
        GROUP BY month_display, month_key
        ORDER BY month_key
      ),
      category_costs AS (
        SELECT 
          p.category,
          SUM(
            CASE 
              WHEN p.price ~ '^[0-9]+(\\.[0-9]+)?$' THEN CAST(p.price AS NUMERIC) * ip.quantity
              ELSE 0
            END
          ) as category_cost
        FROM issuances i
        JOIN issuance_parts ip ON i.id = ip.issuance_id
        JOIN products p ON ip.product_id = p.id
        WHERE ($1::date IS NULL OR i.date_issued >= $1::date) AND ($2::date IS NULL OR i.date_issued <= $2::date)
        GROUP BY p.category
      ),
      summary_stats AS (
        SELECT 
          COUNT(DISTINCT i.id) as total_issuances,
          SUM(
            CASE 
              WHEN p.price ~ '^[0-9]+(\\.[0-9]+)?$' THEN CAST(p.price AS NUMERIC) * ip.quantity
              ELSE 0
            END
          ) as total_cost,
          CASE 
            WHEN COUNT(DISTINCT i.id) > 0 THEN 
              SUM(
                CASE 
                  WHEN p.price ~ '^[0-9]+(\\.[0-9]+)?$' THEN CAST(p.price AS NUMERIC) * ip.quantity
                  ELSE 0
                END
              ) / COUNT(DISTINCT i.id)
            ELSE 0 
          END as avg_cost_per_issuance,
          (SELECT MAX(monthly_cost) FROM monthly_costs) as highest_monthly_cost
        FROM issuances i
        JOIN issuance_parts ip ON i.id = ip.issuance_id
        JOIN products p ON ip.product_id = p.id
        WHERE ($1::date IS NULL OR i.date_issued >= $1::date) AND ($2::date IS NULL OR i.date_issued <= $2::date)
      )
      SELECT 
        (SELECT total_cost FROM summary_stats) as total_cost,
        (SELECT total_issuances FROM summary_stats) as total_issuances,
        (SELECT avg_cost_per_issuance FROM summary_stats) as avg_cost_per_issuance,
        (SELECT highest_monthly_cost FROM summary_stats) as highest_monthly_cost,
        (SELECT json_agg(json_build_object(
          'month', month_display,
          'cost', ROUND(monthly_cost, 2),
          'issuances', monthly_issuances
        )) FROM monthly_costs) as monthly_trend,
        (SELECT json_agg(json_build_object(
          'category', category,
          'cost', ROUND(category_cost, 2),
          'percentage', CASE 
            WHEN (SELECT total_cost FROM summary_stats) > 0 
            THEN ROUND((category_cost / (SELECT total_cost FROM summary_stats)) * 100, 1)
            ELSE 0 
          END
        )) FROM category_costs) as category_breakdown
    `;

    const row = await (this.prisma as any).$queryRawUnsafe(query, dateFrom, dateTo);
    return row[0] || { total_cost: 0, total_issuances: 0, avg_cost_per_issuance: 0, highest_monthly_cost: 0, monthly_trend: [], category_breakdown: [] };
  }

  // Order metrics: total issuances, total issued parts, total sales
  async getOrderMetrics() {
    const query = `
      SELECT 
        COUNT(DISTINCT i.id) as total_issuances,
        COALESCE(SUM(ip.quantity), 0) as total_issued_parts,
        COALESCE(SUM(
          CASE 
            WHEN p.price ~ '^[0-9]+(\\.[0-9]+)?$' THEN CAST(p.price AS NUMERIC) * ip.quantity
            ELSE 0
          END
        ), 0) as total_sales
      FROM issuances i
      LEFT JOIN issuance_parts ip ON i.id = ip.issuance_id
      LEFT JOIN products p ON ip.product_id = p.id
    `;

    const rows = await (this.prisma as any).$queryRawUnsafe(query);
    return rows[0] || { total_issuances: 0, total_issued_parts: 0, total_sales: 0 };
  }

  async getInventoryReport(): Promise<InventoryReport[]> {
    const items = await this.prisma.inventoryItem.findMany({
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

  // Fetch products from the products table
  // Note: The `Product` type is generated by `prisma generate`. If you see TS errors
  // about `Product` not existing, run `npx prisma generate` and restart the TS server.
  // Use `any` here until the generated types are available.
  async getProducts(): Promise<any[]> {
    return await (this.prisma as any).product.findMany({
      orderBy: { id: 'asc' },
    });
  }

  // Add a new product to the products table
  async addProduct(data: any): Promise<any> {
    // Map incoming camelCase request fields to Prisma model fields
    const payload: any = {
      productname: data.productName,
      category: data.category,
      subcategory: data.subcategory,
      description: data.description,
      price: data.price,
      rating: data.rating ?? 0,
      reviewcount: data.reviewCount ?? 0,
      availability: data.availability ?? 'Out of Stock',
      image: data.image,
      stock: data.stock ?? 0,
      compatibility: data.compatibility,
      position: data.position,
      brand: data.brand,
      finish: data.finish,
      material: data.material,
      surfaceuse: data.surfaceUse,
      type: data.type,
      color: data.color,
      volume: data.volume,
      mountingfeatures: data.mountingFeatures,
      colorcode: data.colorCode,
      quantity: data.quantity ?? 0,
      minquantity: data.minQuantity ?? 0,
      discounttype: data.discountType,
      discountvalue: data.discountValue ?? 0,
      warranty: data.warranty,
      manufacturer: data.manufacturer,
      manufactureddate: data.manufacturedDate ? new Date(data.manufacturedDate) : undefined,
      expirydate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      notes: data.notes,
      resistance: data.resistance,
      drytime: data.dryTime,
      applicationmethod: data.applicationMethod,
      voltage: data.voltage,
      amprating: data.ampRating,
      connectortype: data.connectorType,
      size: data.size,
    };

    // Remove undefined keys so Prisma/DB defaults apply
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    return await (this.prisma as any).product.create({ data: payload });
  }

  // Update existing product by id with provided fields
  async updateProduct(id: number | string, data: any): Promise<any> {
    // Ensure product exists
    const existing = await (this.prisma as any).product.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      throw new Error('Product not found');
    }

    // Build update payload by mapping known camelCase fields to DB columns
    const fieldMap: Record<string, string> = {
      productName: 'productname', category: 'category', subcategory: 'subcategory', description: 'description',
      price: 'price', rating: 'rating', reviewCount: 'reviewcount', availability: 'availability', image: 'image',
      stock: 'stock', compatibility: 'compatibility', position: 'position', brand: 'brand', finish: 'finish',
      material: 'material', surfaceUse: 'surfaceuse', type: 'type', color: 'color', volume: 'volume',
      mountingFeatures: 'mountingfeatures', colorCode: 'colorcode', quantity: 'quantity', minQuantity: 'minquantity',
      discountType: 'discounttype', discountValue: 'discountvalue', warranty: 'warranty', manufacturer: 'manufacturer',
      manufacturedDate: 'manufactureddate', expiryDate: 'expirydate', notes: 'notes', resistance: 'resistance',
      dryTime: 'drytime', applicationMethod: 'applicationmethod', voltage: 'voltage', ampRating: 'amprating',
      connectorType: 'connectortype', size: 'size'
    };

    const payload: any = {};
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        // parse dates
        if (key === 'manufacturedDate' || key === 'expiryDate') {
          payload[col] = data[key] ? new Date(data[key]) : null;
        } else {
          payload[col] = data[key];
        }
      }
    }

    if (Object.keys(payload).length === 0) {
      throw new Error('No valid fields provided for update');
    }

    // updated_at handled by Prisma @updatedAt if configured; otherwise set explicitly
    const updated = await (this.prisma as any).product.update({ where: { id: Number(id) }, data: payload });
    return updated;
  }

  // Delete product by id
  async deleteProduct(id: number | string): Promise<any> {
    const existing = await (this.prisma as any).product.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      throw new Error('Product not found');
    }

    const deleted = await (this.prisma as any).product.delete({ where: { id: Number(id) } });
    return deleted;
  }

  // Inventory analytics aggregated from products table
  async getInventoryAnalytics(): Promise<any> {
    const prismaAny = this.prisma as any;

    const totalProductsRes: any = await prismaAny.$queryRaw`SELECT COUNT(*)::int as count FROM products`;
    const totalProducts = Number(totalProductsRes[0]?.count ?? 0);

    const lowStockRes: any = await prismaAny.$queryRaw`SELECT COUNT(*)::int as count FROM products WHERE stock < 10 AND stock > 0`;
    const lowStockItems = Number(lowStockRes[0]?.count ?? 0);

    const outOfStockRes: any = await prismaAny.$queryRaw`SELECT COUNT(*)::int as count FROM products WHERE stock = 0`;
    const outOfStockItems = Number(outOfStockRes[0]?.count ?? 0);

    const inStockRes: any = await prismaAny.$queryRaw`SELECT COUNT(*)::int as count FROM products WHERE stock > 0`;
    const inStockItems = Number(inStockRes[0]?.count ?? 0);

    const inventoryValueRes: any = await prismaAny.$queryRaw`
      SELECT SUM(
        CASE WHEN price ~ '^[0-9]+(\\.[0-9]+)?$' THEN CAST(price AS NUMERIC) * COALESCE(stock,0) ELSE 0 END
      ) AS total_value FROM products`;
    const inventoryValue = Number(inventoryValueRes[0]?.total_value ?? 0);

    const categoryDistribution: any = await prismaAny.$queryRaw`
      SELECT category, COUNT(*)::int as count FROM products GROUP BY category ORDER BY count DESC`;

    const availabilityDistribution: any = await prismaAny.$queryRaw`
      SELECT availability, COUNT(*)::int as count FROM products GROUP BY availability ORDER BY count DESC`;

    return {
      totalProducts,
      lowStockItems,
      outOfStockItems,
      inStockItems,
      inventoryValue: Math.round(inventoryValue * 100) / 100,
      categoryDistribution,
      availabilityDistribution,
      timestamp: new Date().toISOString(),
    };
  }

  // Get low stock products (stock < 10 and stock > 0), optional category filter
  async getLowStockProducts(category?: string): Promise<any[]> {
    const prismaAny = this.prisma as any;

    // Only use the availability flag 'Low Stock' (case-insensitive) to find low-stock items.
    // We removed the column-to-column comparison (quantity < minquantity) to avoid including
    // 'Out of Stock' items that were being matched by that check.
    if (category && category !== 'All Categories') {
      const rows = await prismaAny.$queryRawUnsafe(
        `SELECT * FROM products WHERE lower(availability) = 'low stock' AND category = $1 ORDER BY COALESCE(quantity, 999999) ASC, productname ASC`,
        category,
      );
      return rows;
    }

    const rows = await prismaAny.$queryRawUnsafe(
      `SELECT * FROM products WHERE lower(availability) = 'low stock' ORDER BY COALESCE(quantity, 999999) ASC, productname ASC`,
    );

    return rows;
  }

  // Get out-of-stock products (stock = 0), optional category filter
  async getOutOfStockProducts(category?: string): Promise<any[]> {
    const prismaAny = this.prisma as any;

    // Include products that are explicitly marked 'Out of Stock' OR have quantity/stock = 0
    if (category && category !== 'All Categories') {
      const rows = await prismaAny.$queryRawUnsafe(
        `SELECT * FROM products WHERE (lower(availability) = 'out of stock' OR quantity = 0 OR stock = 0) AND category = $1 ORDER BY productname ASC`,
        category,
      );
      return rows;
    }

    const rows = await prismaAny.$queryRawUnsafe(
      `SELECT * FROM products WHERE (lower(availability) = 'out of stock' OR quantity = 0 OR stock = 0) ORDER BY productname ASC`,
    );

    return rows;
  }

  // Update product quantity and minquantity (also updates stock and availability)
  async updateProductQuantity(id: number | string, fields: { quantity?: number; minquantity?: number }): Promise<any> {
    const prismaAny = this.prisma as any;

    // Ensure product exists
    const existing = await prismaAny.product.findUnique({ where: { id: Number(id) } });
    if (!existing) throw new Error('Product not found');

    const updateData: any = {};
    if (fields.quantity !== undefined) {
      updateData.quantity = fields.quantity;
      updateData.stock = fields.quantity; // assume stock mirrors quantity

      // Set availability string based on new quantity
      if (fields.quantity === 0) updateData.availability = 'Out of Stock';
      else if (fields.quantity < 10) updateData.availability = 'Low Stock';
      else updateData.availability = 'In Stock';
    }

    if (fields.minquantity !== undefined) {
      updateData.minquantity = fields.minquantity;
    }

    if (Object.keys(updateData).length === 0) throw new Error('At least one field (quantity or minquantity) is required for update');

    const updated = await prismaAny.product.update({ where: { id: Number(id) }, data: updateData });
    return updated;
  }

  async getReorderSuggestions(): Promise<ReorderSuggestion[]> {
    const items = await this.prisma.inventoryItem.findMany({
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

    return await this.prisma.workOrderPart.findMany({
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
            userProfile: {
              select: {
                supabaseUserId: true,
              }
            }
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    }) as WorkOrderPartWithDetails[];
  }

  async bulkUpdateInventory(items: Array<{ id: string; quantity?: number; unitPrice?: number; location?: string; minStockLevel?: number; maxStockLevel?: number; reorderPoint?: number }>): Promise<InventoryItem[]> {
    const updates = items.map((item) =>
      this.prisma.inventoryItem.update({
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

    return await this.prisma.$transaction(updates);
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.prisma.inventoryCategory.findMany({
      select: { name: true },
      orderBy: { name: 'asc' },
    });

    return categories.map((c) => c.name);
  }

  async getManufacturers(): Promise<string[]> {
    const manufacturers = await this.prisma.inventoryItem.findMany({
      select: { manufacturer: true },
      where: { manufacturer: { not: null } },
      distinct: ['manufacturer'],
    });

    return manufacturers.map((m) => m.manufacturer!);
  }

  async getSuppliers(): Promise<string[]> {
    const suppliers = await this.prisma.inventoryItem.findMany({
      select: { supplier: true },
      where: { supplier: { not: null } },
      distinct: ['supplier'],
    });

    return suppliers.map((s) => s.supplier!);
  }

  async getLocations(): Promise<string[]> {
    const locations = await this.prisma.inventoryItem.findMany({
      select: { location: true },
      where: { location: { not: null } },
      distinct: ['location'],
    });

    return locations.map((l) => l.location!);
  }
}

