import { PrismaClient, Prisma } from '@prisma/client';
import {
  CreateEstimateRequest,
  UpdateEstimateRequest,
  CreateEstimateLaborRequest,
  UpdateEstimateLaborRequest,
  CreateEstimatePartRequest,
  UpdateEstimatePartRequest,
  CreateEstimateApprovalRequest,
  UpdateEstimateApprovalRequest,
  EstimateFilters,
  EstimateWithDetails,
  EstimateStatistics,
} from './estimates.types';

const prisma = new PrismaClient();

// Define a type for the raw estimate object returned by Prisma to use in our helper
type PrismaEstimate = Prisma.WorkOrderEstimateGetPayload<{
  include: {
    workOrder: {
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        vehicle: { select: { id: true, make: true, model: true, year: true, licensePlate: true } },
      },
    },
    createdBy: {
      include: {
        userProfile: { select: { id: true, name: true } },
      },
    },
    approvedBy: {
      include: {
        userProfile: { select: { id: true, name: true } },
      },
    },
    estimateLaborItems: {
      include: {
        laborCatalog: { select: { id: true, code: true, name: true, estimatedHours: true, hourlyRate: true, category: true } },
      },
    },
    estimatePartItems: {
      include: {
        part: { select: { id: true, name: true, sku: true, partNumber: true, manufacturer: true } },
      },
    },
    approvals: true,
  },
}>;


export class EstimatesService {
  /**
   * Private helper to format Prisma estimate object, converting Decimal fields to numbers.
   * @param estimate - The raw estimate object from Prisma.
   * @returns An estimate object compliant with the EstimateWithDetails type.
   */
  private _formatEstimateForOutput(estimate: PrismaEstimate): EstimateWithDetails {
    return {
      ...estimate,
      description: estimate.description || undefined,
      notes: estimate.notes || undefined,
      createdById: estimate.createdById || undefined,
      approvedAt: estimate.approvedAt || undefined,
      approvedById: estimate.approvedById || undefined,
      totalAmount: Number(estimate.totalAmount),
      laborAmount: estimate.laborAmount ? Number(estimate.laborAmount) : undefined,
      partsAmount: estimate.partsAmount ? Number(estimate.partsAmount) : undefined,
      taxAmount: estimate.taxAmount ? Number(estimate.taxAmount) : undefined,
      discountAmount: estimate.discountAmount ? Number(estimate.discountAmount) : undefined,
      workOrder: {
        ...estimate.workOrder,
        customer: {
          ...estimate.workOrder.customer,
          email: estimate.workOrder.customer.email || undefined,
          phone: estimate.workOrder.customer.phone || undefined,
        },
        vehicle: {
          ...estimate.workOrder.vehicle,
          year: estimate.workOrder.vehicle.year || undefined,
          licensePlate: estimate.workOrder.vehicle.licensePlate || undefined,
        },
      },
      createdBy: estimate.createdBy ? {
        ...estimate.createdBy,
        employeeId: estimate.createdBy.employeeId || undefined,
        userProfile: {
          ...estimate.createdBy.userProfile,
          name: estimate.createdBy.userProfile.name || undefined,
        },
      } : undefined,
      approvedBy: estimate.approvedBy ? {
        ...estimate.approvedBy,
        employeeId: estimate.approvedBy.employeeId || undefined,
        userProfile: {
          ...estimate.approvedBy.userProfile,
          name: estimate.approvedBy.userProfile.name || undefined,
        },
      } : undefined,
      estimateLaborItems: estimate.estimateLaborItems.map(item => ({
        ...item,
        hours: Number(item.hours),
        rate: Number(item.rate),
        subtotal: Number(item.subtotal),
        serviceDiscountAmount: item.serviceDiscountAmount ? Number(item.serviceDiscountAmount) : undefined,
        laborCatalog: item.laborCatalog ? {
          ...item.laborCatalog,
          estimatedHours: Number(item.laborCatalog.estimatedHours),
          hourlyRate: Number(item.laborCatalog.hourlyRate),
          category: item.laborCatalog.category || undefined,
        } : undefined,
      })),
      estimatePartItems: estimate.estimatePartItems.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        serviceDiscountAmount: item.serviceDiscountAmount ? Number(item.serviceDiscountAmount) : undefined,
        part: item.part || undefined,
      })),
    };
  }

  // Create a new estimate
  async createEstimate(data: CreateEstimateRequest): Promise<EstimateWithDetails> {
    // Validate work order exists
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: data.workOrderId },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        vehicle: { select: { id: true, make: true, model: true, year: true, licensePlate: true } },
      },
    });

    if (!workOrder) {
      throw new Error('Work order not found');
    }

    // Validate service advisor if provided
    if (data.createdById) {
      const advisor = await prisma.serviceAdvisor.findUnique({
        where: { id: data.createdById },
      });

      if (!advisor) {
        throw new Error('Service advisor not found');
      }
    }

    // Calculate subtotals if not provided
    const laborAmount = data.laborAmount || 0;
    const partsAmount = data.partsAmount || 0;
    const taxAmount = data.taxAmount || 0;
    const discountAmount = data.discountAmount || 0;
    const calculatedTotal = laborAmount + partsAmount + taxAmount - discountAmount;

    // Only validate total if it's not zero (initial estimate)
    if (data.totalAmount > 0 && Math.abs(calculatedTotal - data.totalAmount) > 0.01) {
      throw new Error('Total amount does not match calculated subtotals');
    }

    const estimate = await prisma.workOrderEstimate.create({
      data: {
        workOrderId: data.workOrderId,
        description: data.description,
        totalAmount: data.totalAmount,
        laborAmount: data.laborAmount,
        partsAmount: data.partsAmount,
        taxAmount: data.taxAmount,
        discountAmount: data.discountAmount,
        notes: data.notes,
        createdById: data.createdById,
      },
      include: {
        workOrder: {
          include: {
            customer: { select: { id: true, name: true, email: true, phone: true } },
            vehicle: { select: { id: true, make: true, model: true, year: true, licensePlate: true } },
          },
        },
        createdBy: {
          include: {
            userProfile: { select: { id: true, name: true } },
          },
        },
        approvedBy: {
          include: {
            userProfile: { select: { id: true, name: true } },
          },
        },
        estimateLaborItems: {
          include: {
            laborCatalog: { select: { id: true, code: true, name: true, estimatedHours: true, hourlyRate: true, category: true } },
          },
        },
        estimatePartItems: {
          include: {
            part: { select: { id: true, name: true, sku: true, partNumber: true, manufacturer: true } },
          },
        },
        approvals: true,
      },
    });

    return this._formatEstimateForOutput(estimate);
  }

  // Get estimate by ID
  async getEstimateById(id: string): Promise<EstimateWithDetails> {
    const estimate = await prisma.workOrderEstimate.findUnique({
      where: { id },
      include: {
        workOrder: {
          include: {
            customer: { select: { id: true, name: true, email: true, phone: true } },
            vehicle: { select: { id: true, make: true, model: true, year: true, licensePlate: true } },
          },
        },
        createdBy: {
          include: {
            userProfile: { select: { id: true, name: true } },
          },
        },
        approvedBy: {
          include: {
            userProfile: { select: { id: true, name: true } },
          },
        },
        estimateLaborItems: {
          include: {
            laborCatalog: { select: { id: true, code: true, name: true, estimatedHours: true, hourlyRate: true, category: true } },
          },
        },
        estimatePartItems: {
          include: {
            part: { select: { id: true, name: true, sku: true, partNumber: true, manufacturer: true } },
          },
        },
        approvals: true,
      },
    });

    if (!estimate) {
      throw new Error('Estimate not found');
    }

    return this._formatEstimateForOutput(estimate);
  }

  // Get estimates with filters
  async getEstimates(filters: EstimateFilters = {}, page = 1, limit = 10): Promise<{ estimates: EstimateWithDetails[]; total: number }> {
    const where: Prisma.WorkOrderEstimateWhereInput = {};

    if (filters.workOrderId) {
      where.workOrderId = filters.workOrderId;
    }

    if (filters.createdById) {
      where.createdById = filters.createdById;
    }

    if (filters.approved !== undefined) {
      where.approved = filters.approved;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [estimates, total] = await Promise.all([
      prisma.workOrderEstimate.findMany({
        where,
        include: {
          workOrder: {
            include: {
              customer: { select: { id: true, name: true, email: true, phone: true } },
              vehicle: { select: { id: true, make: true, model: true, year: true, licensePlate: true } },
            },
          },
          createdBy: {
            include: {
              userProfile: { select: { id: true, name: true } },
            },
          },
          approvedBy: {
            include: {
              userProfile: { select: { id: true, name: true } },
            },
          },
          estimateLaborItems: {
            include: {
              laborCatalog: { select: { id: true, code: true, name: true, estimatedHours: true, hourlyRate: true, category: true } },
            },
          },
          estimatePartItems: {
            include: {
              part: { select: { id: true, name: true, sku: true, partNumber: true, manufacturer: true } },
            },
          },
          approvals: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.workOrderEstimate.count({ where }),
    ]);

    return {
      estimates: estimates.map(estimate => this._formatEstimateForOutput(estimate)),
      total,
    };
  }

  // Update estimate
  async updateEstimate(id: string, data: UpdateEstimateRequest): Promise<EstimateWithDetails> {
    // Validate estimate exists
    const existingEstimate = await prisma.workOrderEstimate.findUnique({
      where: { id },
    });

    if (!existingEstimate) {
      throw new Error('Estimate not found');
    }

    // Validate service advisor if provided for approval
    if (data.approvedById) {
      const advisor = await prisma.serviceAdvisor.findUnique({
        where: { id: data.approvedById },
      });

      if (!advisor) {
        throw new Error('Service advisor not found');
      }
    }

    // Calculate subtotals if amounts are being updated
    if (data.laborAmount !== undefined || data.partsAmount !== undefined || data.taxAmount !== undefined || data.discountAmount !== undefined) {
      const laborAmount = data.laborAmount ?? Number(existingEstimate.laborAmount) ?? 0;
      const partsAmount = data.partsAmount ?? Number(existingEstimate.partsAmount) ?? 0;
      const taxAmount = data.taxAmount ?? Number(existingEstimate.taxAmount) ?? 0;
      const discountAmount = data.discountAmount ?? Number(existingEstimate.discountAmount) ?? 0;
      const calculatedTotal = laborAmount + partsAmount + taxAmount - discountAmount;

      if (data.totalAmount && Math.abs(calculatedTotal - data.totalAmount) > 0.01) {
        throw new Error('Total amount does not match calculated subtotals');
      }

      data.totalAmount = calculatedTotal;
    }

    const estimate = await prisma.workOrderEstimate.update({
      where: { id },
      data: {
        ...data,
        approvedAt: data.approved ? new Date() : data.approvedAt,
      },
      include: {
        workOrder: {
          include: {
            customer: { select: { id: true, name: true, email: true, phone: true } },
            vehicle: { select: { id: true, make: true, model: true, year: true, licensePlate: true } },
          },
        },
        createdBy: {
          include: {
            userProfile: { select: { id: true, name: true } },
          },
        },
        approvedBy: {
          include: {
            userProfile: { select: { id: true, name: true } },
          },
        },
        estimateLaborItems: {
          include: {
            laborCatalog: { select: { id: true, code: true, name: true, estimatedHours: true, hourlyRate: true, category: true } },
          },
        },
        estimatePartItems: {
          include: {
            part: { select: { id: true, name: true, sku: true, partNumber: true, manufacturer: true } },
          },
        },
        approvals: true,
      },
    });

    return this._formatEstimateForOutput(estimate);
  }

  // Delete estimate
  async deleteEstimate(id: string): Promise<void> {
    const estimate = await prisma.workOrderEstimate.findUnique({
      where: { id },
    });

    if (!estimate) {
      throw new Error('Estimate not found');
    }

    if (estimate.approved) {
      throw new Error('Cannot delete an approved estimate');
    }

    await prisma.workOrderEstimate.delete({
      where: { id },
    });
  }

  // Create estimate labor item
  async createEstimateLabor(data: CreateEstimateLaborRequest) {
    // Validate estimate exists
    const estimate = await prisma.workOrderEstimate.findUnique({
      where: { id: data.estimateId },
    });

    if (!estimate) {
      throw new Error('Estimate not found');
    }

    if (estimate.approved) {
      throw new Error('Cannot modify an approved estimate');
    }

    // Validate labor catalog if provided
    if (data.laborCatalogId) {
      const laborCatalog = await prisma.laborCatalog.findUnique({
        where: { id: data.laborCatalogId },
      });

      if (!laborCatalog) {
        throw new Error('Labor catalog item not found');
      }
    }

    const subtotal = data.hours * data.rate;

    const estimateLabor = await prisma.estimateLabor.create({
      data: {
        estimateId: data.estimateId,
        laborCatalogId: data.laborCatalogId,
        description: data.description,
        hours: data.hours,
        rate: data.rate,
        subtotal,
        notes: data.notes,
      },
      include: {
        laborCatalog: { select: { id: true, code: true, name: true, estimatedHours: true, hourlyRate: true, category: true } },
      },
    });

    // Update estimate totals
    await this.updateEstimateTotals(data.estimateId);

    // Return formatted labor item with Decimal converted to number
    return {
      ...estimateLabor,
      hours: Number(estimateLabor.hours),
      rate: Number(estimateLabor.rate),
      subtotal: Number(estimateLabor.subtotal),
      laborCatalog: estimateLabor.laborCatalog ? {
        ...estimateLabor.laborCatalog,
        estimatedHours: Number(estimateLabor.laborCatalog.estimatedHours),
        hourlyRate: Number(estimateLabor.laborCatalog.hourlyRate),
        category: estimateLabor.laborCatalog.category || undefined,
      } : undefined,
    };
  }

  // Update estimate labor item
  async updateEstimateLabor(id: string, data: UpdateEstimateLaborRequest) {
    const estimateLabor = await prisma.estimateLabor.findUnique({
      where: { id },
      include: { estimate: true },
    });

    if (!estimateLabor) {
      throw new Error('Estimate labor item not found');
    }

    if (estimateLabor.estimate.approved) {
      throw new Error('Cannot modify an approved estimate');
    }

    // Validate labor catalog if provided
    if (data.laborCatalogId) {
      const laborCatalog = await prisma.laborCatalog.findUnique({
        where: { id: data.laborCatalogId },
      });

      if (!laborCatalog) {
        throw new Error('Labor catalog item not found');
      }
    }

    const updateData: any = { ...data };
    
    // Recalculate subtotal if hours or rate changed
    if (data.hours !== undefined || data.rate !== undefined) {
      const hours = data.hours ?? Number(estimateLabor.hours);
      const rate = data.rate ?? Number(estimateLabor.rate);
      updateData.subtotal = hours * rate;
    }

    const updatedEstimateLabor = await prisma.estimateLabor.update({
      where: { id },
      data: updateData,
      include: {
        laborCatalog: { select: { id: true, code: true, name: true, estimatedHours: true, hourlyRate: true, category: true } },
      },
    });

    // Update estimate totals
    await this.updateEstimateTotals(estimateLabor.estimateId);

    // Return formatted labor item with Decimal converted to number
    return {
      ...updatedEstimateLabor,
      hours: Number(updatedEstimateLabor.hours),
      rate: Number(updatedEstimateLabor.rate),
      subtotal: Number(updatedEstimateLabor.subtotal),
      laborCatalog: updatedEstimateLabor.laborCatalog ? {
        ...updatedEstimateLabor.laborCatalog,
        estimatedHours: Number(updatedEstimateLabor.laborCatalog.estimatedHours),
        hourlyRate: Number(updatedEstimateLabor.laborCatalog.hourlyRate),
        category: updatedEstimateLabor.laborCatalog.category || undefined,
      } : undefined,
    };
  }

  // Delete estimate labor item
  async deleteEstimateLabor(id: string): Promise<void> {
    const estimateLabor = await prisma.estimateLabor.findUnique({
      where: { id },
      include: { estimate: true },
    });

    if (!estimateLabor) {
      throw new Error('Estimate labor item not found');
    }

    if (estimateLabor.estimate.approved) {
      throw new Error('Cannot modify an approved estimate');
    }

    await prisma.estimateLabor.delete({
      where: { id },
    });

    // Update estimate totals
    await this.updateEstimateTotals(estimateLabor.estimateId);
  }

  // Create estimate part item
  async createEstimatePart(data: CreateEstimatePartRequest) {
    // Validate estimate exists
    const estimate = await prisma.workOrderEstimate.findUnique({
      where: { id: data.estimateId },
    });

    if (!estimate) {
      throw new Error('Estimate not found');
    }

    if (estimate.approved) {
      throw new Error('Cannot modify an approved estimate');
    }

    // Validate inventory item exists
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { id: data.inventoryItemId },
    });

    if (!inventoryItem) {
      throw new Error('Inventory item not found');
    }

    const subtotal = data.quantity * data.unitPrice;

    const estimatePart = await prisma.estimatePart.create({
      data: {
        estimateId: data.estimateId,
        inventoryItemId: data.inventoryItemId,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        subtotal,
        source: data.source,
        supplierName: data.supplierName,
        warrantyInfo: data.warrantyInfo,
        notes: data.notes,
      },
      include: {
        part: { select: { id: true, name: true, sku: true, partNumber: true, manufacturer: true } },
      },
    });

    // Update estimate totals
    await this.updateEstimateTotals(data.estimateId);

    // Return formatted part item with Decimal converted to number
    return {
      ...estimatePart,
      quantity: Number(estimatePart.quantity),
      unitPrice: Number(estimatePart.unitPrice),
      subtotal: Number(estimatePart.subtotal),
      part: estimatePart.part || undefined,
    };
  }

  // Update estimate part item
  async updateEstimatePart(id: string, data: UpdateEstimatePartRequest) {
    const estimatePart = await prisma.estimatePart.findUnique({
      where: { id },
      include: { estimate: true },
    });

    if (!estimatePart) {
      throw new Error('Estimate part item not found');
    }

    if (estimatePart.estimate.approved) {
      throw new Error('Cannot modify an approved estimate');
    }

    // Validate inventory item if provided
    if (data.inventoryItemId) {
      const inventoryItem = await prisma.inventoryItem.findUnique({
        where: { id: data.inventoryItemId },
      });

      if (!inventoryItem) {
        throw new Error('Inventory item not found');
      }
    }

    const updateData: any = { ...data };
    
    // Recalculate subtotal if quantity or unitPrice changed
    if (data.quantity !== undefined || data.unitPrice !== undefined) {
      const quantity = data.quantity ?? Number(estimatePart.quantity);
      const unitPrice = data.unitPrice ?? Number(estimatePart.unitPrice);
      updateData.subtotal = quantity * unitPrice;
    }

    const updatedEstimatePart = await prisma.estimatePart.update({
      where: { id },
      data: updateData,
      include: {
        part: { select: { id: true, name: true, sku: true, partNumber: true, manufacturer: true } },
      },
    });

    // Update estimate totals
    await this.updateEstimateTotals(estimatePart.estimateId);

    // Return formatted part item with Decimal converted to number
    return {
      ...updatedEstimatePart,
      quantity: Number(updatedEstimatePart.quantity),
      unitPrice: Number(updatedEstimatePart.unitPrice),
      subtotal: Number(updatedEstimatePart.subtotal),
      part: updatedEstimatePart.part || undefined,
    };
  }

  // Delete estimate part item
  async deleteEstimatePart(id: string): Promise<void> {
    const estimatePart = await prisma.estimatePart.findUnique({
      where: { id },
      include: { estimate: true },
    });

    if (!estimatePart) {
      throw new Error('Estimate part item not found');
    }

    if (estimatePart.estimate.approved) {
      throw new Error('Cannot modify an approved estimate');
    }

    await prisma.estimatePart.delete({
      where: { id },
    });

    // Update estimate totals
    await this.updateEstimateTotals(estimatePart.estimateId);
  }

  // Create estimate approval
  async createEstimateApproval(data: CreateEstimateApprovalRequest) {
    // Validate work order exists
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: data.workOrderId },
    });

    if (!workOrder) {
      throw new Error('Work order not found');
    }

    // Validate estimate if provided
    if (data.estimateId) {
      const estimate = await prisma.workOrderEstimate.findUnique({
        where: { id: data.estimateId },
      });

      if (!estimate) {
        throw new Error('Estimate not found');
      }
    }

    const approval = await prisma.workOrderApproval.create({
      data: {
        workOrderId: data.workOrderId,
        estimateId: data.estimateId,
        status: data.status,
        method: data.method,
        notes: data.notes,
        customerSignature: data.customerSignature,
      },
    });

    return approval;
  }

  // Update estimate approval
  async updateEstimateApproval(id: string, data: UpdateEstimateApprovalRequest) {
    const approval = await prisma.workOrderApproval.findUnique({
      where: { id },
    });

    if (!approval) {
      throw new Error('Estimate approval not found');
    }

    // Validate service advisor if provided
    if (data.approvedById) {
      const advisor = await prisma.serviceAdvisor.findUnique({
        where: { id: data.approvedById },
      });

      if (!advisor) {
        throw new Error('Service advisor not found');
      }
    }

    const updatedApproval = await prisma.workOrderApproval.update({
      where: { id },
      data: {
        ...data,
        approvedAt: data.status === 'APPROVED' ? new Date() : data.approvedAt,
      },
    });

    return updatedApproval;
  }

  // Get estimate statistics
  async getEstimateStatistics(): Promise<EstimateStatistics> {
    const [
      totalEstimates,
      approvedEstimates,
      pendingEstimates,
      totalValue,
    ] = await Promise.all([
      prisma.workOrderEstimate.count(),
      prisma.workOrderEstimate.count({ where: { approved: true } }),
      prisma.workOrderEstimate.count({ where: { approved: false } }),
      prisma.workOrderEstimate.aggregate({
        _sum: { totalAmount: true },
      }),
    ]);

    const averageEstimateAmount = totalEstimates > 0 ? Number(totalValue._sum.totalAmount || 0) / totalEstimates : 0;

    return {
      totalEstimates,
      approvedEstimates,
      pendingEstimates,
      averageEstimateAmount,
      totalEstimatedValue: Number(totalValue._sum.totalAmount || 0),
    };
  }

  // Helper method to update estimate totals
  private async updateEstimateTotals(estimateId: string): Promise<void> {
    const [laborItems, partItems] = await Promise.all([
      prisma.estimateLabor.findMany({
        where: { estimateId },
        select: { subtotal: true },
      }),
      prisma.estimatePart.findMany({
        where: { estimateId },
        select: { subtotal: true },
      }),
    ]);

    const laborAmount = laborItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
    const partsAmount = partItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
    // Note: This helper only updates labor and parts. Tax and discount are preserved.
    const existingEstimate = await prisma.workOrderEstimate.findUnique({ where: { id: estimateId }, select: { taxAmount: true, discountAmount: true } });
    const taxAmount = Number(existingEstimate?.taxAmount || 0);
    const discountAmount = Number(existingEstimate?.discountAmount || 0);
    const totalAmount = laborAmount + partsAmount + taxAmount - discountAmount;

    await prisma.workOrderEstimate.update({
      where: { id: estimateId },
      data: {
        laborAmount,
        partsAmount,
        totalAmount,
      },
    });
  }

  // Approve estimate and create work order labor/parts
  async approveEstimate(estimateId: string, approvedById: string): Promise<void> {
    const estimate = await prisma.workOrderEstimate.findUnique({
      where: { id: estimateId },
      include: {
        estimateLaborItems: true,
        estimatePartItems: true,
        workOrder: true,
      },
    });

    if (!estimate) {
      throw new Error('Estimate not found');
    }

    if (estimate.approved) {
      throw new Error('Estimate is already approved');
    }

    // Validate service advisor
    const advisor = await prisma.serviceAdvisor.findUnique({
      where: { id: approvedById },
    });

    if (!advisor) {
      throw new Error('Service advisor not found');
    }

    // Start transaction to approve estimate and create work order items
    await prisma.$transaction(async (tx) => {
      // Approve the estimate
      await tx.workOrderEstimate.update({
        where: { id: estimateId },
        data: {
          approved: true,
          approvedAt: new Date(),
          approvedById,
        },
      });

      // Create work order labor items from estimate labor items
      for (const laborItem of estimate.estimateLaborItems) {
        await tx.workOrderLabor.create({
          data: {
            workOrderId: estimate.workOrderId,
            laborCatalogId: laborItem.laborCatalogId,
            description: laborItem.description,
            hours: laborItem.hours,
            rate: laborItem.rate,
            subtotal: laborItem.subtotal,
            notes: laborItem.notes,
          },
        });
      }

      // Create work order part items from estimate part items
      for (const partItem of estimate.estimatePartItems) {
        await tx.workOrderPart.create({
          data: {
            workOrderId: estimate.workOrderId,
            inventoryItemId: partItem.inventoryItemId,
            quantity: partItem.quantity,
            unitPrice: partItem.unitPrice,
            subtotal: partItem.subtotal,
            source: partItem.source,
            supplierName: partItem.supplierName,
            warrantyInfo: partItem.warrantyInfo,
            notes: partItem.notes,
          },
        });
      }

      // Update work order totals
      const workOrderLaborItems = await tx.workOrderLabor.findMany({
        where: { workOrderId: estimate.workOrderId },
        select: { subtotal: true },
      });

      const workOrderPartItems = await tx.workOrderPart.findMany({
        where: { workOrderId: estimate.workOrderId },
        select: { subtotal: true },
      });
      
      const existingWorkOrder = await tx.workOrder.findUnique({ where: { id: estimate.workOrderId }, select: { taxAmount: true, discountAmount: true } });
      
      const subtotalLabor = workOrderLaborItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
      const subtotalParts = workOrderPartItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
      const taxAmount = Number(existingWorkOrder?.taxAmount || 0);
      const discountAmount = Number(existingWorkOrder?.discountAmount || 0);
      const totalAmount = subtotalLabor + subtotalParts + taxAmount - discountAmount;

      await tx.workOrder.update({
        where: { id: estimate.workOrderId },
        data: {
          subtotalLabor,
          subtotalParts,
          totalAmount,
          estimateApproved: true,
        },
      });
    });
  }

  // Add canned service labor to estimate
  async addCannedServiceToEstimate(estimateId: string, cannedServiceId: string): Promise<EstimateWithDetails> {
    // Validate estimate exists
    const estimate = await prisma.workOrderEstimate.findUnique({
      where: { id: estimateId },
      include: {
        estimateLaborItems: true,
        estimatePartItems: true,
      },
    });

    if (!estimate) {
      throw new Error('Estimate not found');
    }

    // Validate canned service exists and get its labor operations
    const cannedService = await prisma.cannedService.findUnique({
      where: { id: cannedServiceId },
      include: {
        laborOperations: {
          include: {
            laborCatalog: true,
          },
          orderBy: {
            sequence: 'asc',
          },
        },
      },
    });

    if (!cannedService) {
      throw new Error('Canned service not found');
    }

    if (!cannedService.laborOperations || cannedService.laborOperations.length === 0) {
      throw new Error('Canned service has no labor operations defined');
    }

    // Add each labor operation from the canned service to the estimate
    for (const laborOp of cannedService.laborOperations) {
      if(laborOp.laborCatalog) { // Ensure labor catalog item exists
          await prisma.estimateLabor.create({
            data: {
              estimateId: estimateId,
              laborCatalogId: laborOp.laborCatalogId,
              description: laborOp.laborCatalog.name,
              hours: Number(laborOp.laborCatalog.estimatedHours),
              rate: Number(laborOp.laborCatalog.hourlyRate),
              subtotal: Number(laborOp.laborCatalog.estimatedHours) * Number(laborOp.laborCatalog.hourlyRate),
              notes: laborOp.notes || `From canned service: ${cannedService.name}`,
              customerApproved: false,
              customerNotes: null,
            },
          });
      }
    }

    // Update estimate totals
    await this.updateEstimateTotals(estimateId);

    // Return updated estimate
    return await this.getEstimateById(estimateId);
  }
}