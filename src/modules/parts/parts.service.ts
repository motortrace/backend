import { WorkOrderPart, PartSource, ServiceStatus } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import {
  CreateWorkOrderPartRequest,
  WorkOrderPartWithDetails,
  UpdateWorkOrderPartRequest,
  IWorkOrderPartService,
} from './parts.types';

export class WorkOrderPartService implements IWorkOrderPartService {
  constructor(private readonly prisma: PrismaClient) {}

  async createWorkOrderPart(data: CreateWorkOrderPartRequest): Promise<WorkOrderPartWithDetails> {
    // Validate work order exists
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: data.workOrderId },
    });

    if (!workOrder) {
      throw new Error('Work order not found');
    }

    // Validate inventory item exists
    const inventoryItem = await this.prisma.inventoryItem.findUnique({
      where: { id: data.inventoryItemId },
    });

    if (!inventoryItem) {
      throw new Error('Inventory item not found');
    }

    // Create the work order part
    const quantity = data.quantity || 1;
    const unitPrice = data.unitPrice || Number(inventoryItem.unitPrice);

    const workOrderPart = await this.prisma.workOrderPart.create({
      data: {
        workOrderId: data.workOrderId,
        inventoryItemId: data.inventoryItemId,
        description: data.description,
        quantity: quantity,
        unitPrice: unitPrice,
        subtotal: quantity * unitPrice,
        source: data.source || PartSource.INVENTORY,
        supplierName: data.supplierName,
        supplierInvoice: data.supplierInvoice,
        warrantyInfo: data.warrantyInfo,
        notes: data.notes,
        status: ServiceStatus.PENDING,
      },
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
            manufacturer: true,
          },
        },
        installedBy: {
          select: {
            id: true,
            userProfile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return workOrderPart as WorkOrderPartWithDetails;
  }

  async getWorkOrderParts(workOrderId: string): Promise<WorkOrderPartWithDetails[]> {
    const workOrderParts = await this.prisma.workOrderPart.findMany({
      where: { workOrderId },
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
            manufacturer: true,
          },
        },
        installedBy: {
          select: {
            id: true,
            userProfile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return workOrderParts as WorkOrderPartWithDetails[];
  }

  async getWorkOrderPartById(id: string): Promise<WorkOrderPartWithDetails | null> {
    const workOrderPart = await this.prisma.workOrderPart.findUnique({
      where: { id },
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
            manufacturer: true,
          },
        },
        installedBy: {
          select: {
            id: true,
            userProfile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return workOrderPart as WorkOrderPartWithDetails | null;
  }

  async updateWorkOrderPart(id: string, data: UpdateWorkOrderPartRequest): Promise<WorkOrderPartWithDetails> {
    // Calculate subtotal if quantity or unitPrice is being updated
    let subtotal: number | undefined;
    if (data.quantity !== undefined || data.unitPrice !== undefined) {
      const existingPart = await this.prisma.workOrderPart.findUnique({
        where: { id },
      });

      if (existingPart) {
        const newQuantity = data.quantity ?? existingPart.quantity;
        const newUnitPrice = data.unitPrice ?? existingPart.unitPrice;
        subtotal = Number(newQuantity) * Number(newUnitPrice);
      }
    }

    const workOrderPart = await this.prisma.workOrderPart.update({
      where: { id },
      data: {
        ...data,
        subtotal,
      },
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
            manufacturer: true,
          },
        },
        installedBy: {
          select: {
            id: true,
            userProfile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return workOrderPart as WorkOrderPartWithDetails;
  }

  async deleteWorkOrderPart(id: string): Promise<void> {
    // Check if part exists
    const existingPart = await this.prisma.workOrderPart.findUnique({
      where: { id },
    });

    if (!existingPart) {
      throw new Error('Work order part not found');
    }

    // Check if work order is in a status that allows deletion
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: existingPart.workOrderId },
      select: { status: true },
    });

    // Allow deletion only if work order is not completed or invoiced
    if (workOrder?.status === 'COMPLETED' || workOrder?.status === 'INVOICED') {
      throw new Error('Cannot delete parts from completed or invoiced work orders');
    }

    await this.prisma.workOrderPart.delete({
      where: { id },
    });
  }
}