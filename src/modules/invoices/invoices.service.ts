import { InvoiceStatus, LineItemType, Prisma } from '@prisma/client';
import {
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceWithDetails,
  InvoiceFilters,
  InvoiceStatistics,
} from './invoices.types';
import prisma from '../../infrastructure/database/prisma';

export class InvoicesService {
  // Generate unique invoice number
  private async generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    // Get the count of invoices created this month
    const startOfMonth = new Date(year, today.getMonth(), 1);
    const endOfMonth = new Date(year, today.getMonth() + 1, 0);
    
    const invoiceCount = await prisma.invoice.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });
    
    const sequence = String(invoiceCount + 1).padStart(4, '0');
    return `INV-${year}${month}-${sequence}`;
  }

  // Create detailed invoice with line items
  async createInvoice(data: CreateInvoiceRequest): Promise<InvoiceWithDetails> {
    // Get work order with all related data
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: data.workOrderId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            licensePlate: true,
          },
        },
        services: {
          include: {
            cannedService: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        laborItems: {
          include: {
            laborCatalog: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        partsUsed: {
          include: {
            part: {
              select: {
                id: true,
                name: true,
                sku: true,
                partNumber: true,
              },
            },
          },
        },
      },
    });

    if (!workOrder) {
      throw new Error('Work order not found');
    }

    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findFirst({
      where: { workOrderId: data.workOrderId },
    });

    if (existingInvoice) {
      throw new Error('Invoice already exists for this work order');
    }

    // Calculate totals
    const subtotalServices = workOrder.services.reduce((sum, s) => sum + Number(s.subtotal), 0);
    const subtotalLabor = workOrder.laborItems.reduce((sum, l) => sum + Number(l.subtotal), 0);
    const subtotalParts = workOrder.partsUsed.reduce((sum, p) => sum + Number(p.subtotal), 0);
    const subtotal = subtotalServices + subtotalLabor + subtotalParts;
    
    // Calculate tax on the final subtotal (not on individual services)
    const taxRate = 0.18; // 18% tax rate - you can make this configurable
    const taxAmount = subtotal * taxRate;
    const discountAmount = Number(workOrder.discountAmount || 0);
    const totalAmount = subtotal + taxAmount - discountAmount;

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: await this.generateInvoiceNumber(),
        workOrderId: data.workOrderId,
        dueDate: data.dueDate,
        subtotalServices,
        subtotalLabor,
        subtotalParts,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        notes: data.notes,
        terms: data.terms,
      },
    });

    // Create line items for services
    for (const service of workOrder.services) {
      await prisma.invoiceLineItem.create({
        data: {
          invoiceId: invoice.id,
          type: LineItemType.SERVICE,
          description: service.description || service.cannedService.name,
          quantity: service.quantity,
          unitPrice: service.unitPrice,
          subtotal: service.subtotal,
          workOrderServiceId: service.id,
          notes: service.notes,
        },
      });
    }

    // Create line items for labor
    for (const labor of workOrder.laborItems) {
      await prisma.invoiceLineItem.create({
        data: {
          invoiceId: invoice.id,
          type: LineItemType.LABOR,
          description: labor.description,
          quantity: 1,
          unitPrice: labor.subtotal, // Flat rate
          subtotal: labor.subtotal,
          workOrderLaborId: labor.id,
          notes: labor.notes,
        },
      });
    }

    // Create line items for parts
    for (const part of workOrder.partsUsed) {
      await prisma.invoiceLineItem.create({
        data: {
          invoiceId: invoice.id,
          type: LineItemType.PART,
          description: part.part.name,
          quantity: part.quantity,
          unitPrice: part.unitPrice,
          subtotal: part.subtotal,
          workOrderPartId: part.id,
          notes: part.notes,
        },
      });
    }

    // Add tax line item if applicable
    if (taxAmount > 0) {
      await prisma.invoiceLineItem.create({
        data: {
          invoiceId: invoice.id,
          type: LineItemType.TAX,
          description: 'Tax',
          quantity: 1,
          unitPrice: taxAmount,
          subtotal: taxAmount,
        },
      });
    }

    // Add discount line item if applicable
    if (discountAmount > 0) {
      await prisma.invoiceLineItem.create({
        data: {
          invoiceId: invoice.id,
          type: LineItemType.DISCOUNT,
          description: 'Discount',
          quantity: 1,
          unitPrice: -discountAmount,
          subtotal: -discountAmount,
        },
      });
    }

    // Return the complete invoice with line items
    return await this.getInvoiceById(invoice.id);
  }

  // Get invoice by ID with all details
  async getInvoiceById(invoiceId: string): Promise<InvoiceWithDetails> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        workOrder: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            vehicle: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                licensePlate: true,
              },
            },
          },
        },
        lineItems: {
          orderBy: [
            { type: 'asc' }, // SERVICE, LABOR, PART, TAX, DISCOUNT
            { createdAt: 'asc' },
          ],
        },
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return {
      ...invoice,
      dueDate: invoice.dueDate || undefined,
      notes: invoice.notes || undefined,
      terms: invoice.terms || undefined,
      subtotalServices: Number(invoice.subtotalServices),
      subtotalLabor: Number(invoice.subtotalLabor),
      subtotalParts: Number(invoice.subtotalParts),
      subtotal: Number(invoice.subtotal),
      taxAmount: Number(invoice.taxAmount),
      discountAmount: Number(invoice.discountAmount),
      totalAmount: Number(invoice.totalAmount),
      workOrder: {
        ...invoice.workOrder,
        customer: {
          ...invoice.workOrder.customer,
          email: invoice.workOrder.customer.email || undefined,
          phone: invoice.workOrder.customer.phone || undefined,
        },
        vehicle: {
          ...invoice.workOrder.vehicle,
          year: invoice.workOrder.vehicle.year || undefined,
          licensePlate: invoice.workOrder.vehicle.licensePlate || undefined,
        },
      },
      lineItems: invoice.lineItems.map((item: any) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        notes: item.notes || undefined,
      })),
    };
  }

  // Get invoices with filters
  async getInvoices(filters: InvoiceFilters = {}, page = 1, limit = 10): Promise<{ invoices: InvoiceWithDetails[]; total: number }> {
    const where: Prisma.InvoiceWhereInput = {};

    if (filters.workOrderId) {
      where.workOrderId = filters.workOrderId;
    }

    if (filters.status) {
      where.status = filters.status;
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

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          workOrder: {
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
              vehicle: {
                select: {
                  id: true,
                  make: true,
                  model: true,
                  year: true,
                  licensePlate: true,
                },
              },
            },
          },
          lineItems: {
            orderBy: [
              { type: 'asc' },
              { createdAt: 'asc' },
            ],
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      invoices: invoices.map((invoice: any) => ({
        ...invoice,
        dueDate: invoice.dueDate || undefined,
        notes: invoice.notes || undefined,
        terms: invoice.terms || undefined,
        subtotalServices: Number(invoice.subtotalServices),
        subtotalLabor: Number(invoice.subtotalLabor),
        subtotalParts: Number(invoice.subtotalParts),
        subtotal: Number(invoice.subtotal),
        taxAmount: Number(invoice.taxAmount),
        discountAmount: Number(invoice.discountAmount),
        totalAmount: Number(invoice.totalAmount),
        paidAmount: Number(invoice.paidAmount),
        balanceDue: Number(invoice.balanceDue),
        workOrder: {
          ...invoice.workOrder,
          customer: {
            ...invoice.workOrder.customer,
            email: invoice.workOrder.customer.email || undefined,
            phone: invoice.workOrder.customer.phone || undefined,
          },
          vehicle: {
            ...invoice.workOrder.vehicle,
            year: invoice.workOrder.vehicle.year || undefined,
            licensePlate: invoice.workOrder.vehicle.licensePlate || undefined,
          },
        },
        lineItems: invoice.lineItems.map((item: any) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.subtotal),
          notes: item.notes || undefined,
        })),
      })),
      total,
    };
  }

  // Get invoices for a work order
  async getInvoicesByWorkOrder(workOrderId: string): Promise<InvoiceWithDetails[]> {
    const invoices = await prisma.invoice.findMany({
      where: { workOrderId },
      include: {
        workOrder: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            vehicle: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                licensePlate: true,
              },
            },
          },
        },
        lineItems: {
          orderBy: [
            { type: 'asc' },
            { createdAt: 'asc' },
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map((invoice: any) => ({
      ...invoice,
      dueDate: invoice.dueDate || undefined,
      notes: invoice.notes || undefined,
      terms: invoice.terms || undefined,
      subtotalServices: Number(invoice.subtotalServices),
      subtotalLabor: Number(invoice.subtotalLabor),
      subtotalParts: Number(invoice.subtotalParts),
      subtotal: Number(invoice.subtotal),
      taxAmount: Number(invoice.taxAmount),
      discountAmount: Number(invoice.discountAmount),
      totalAmount: Number(invoice.totalAmount),
      workOrder: {
        ...invoice.workOrder,
        customer: {
          ...invoice.workOrder.customer,
          email: invoice.workOrder.customer.email || undefined,
          phone: invoice.workOrder.customer.phone || undefined,
        },
        vehicle: {
          ...invoice.workOrder.vehicle,
          year: invoice.workOrder.vehicle.year || undefined,
          licensePlate: invoice.workOrder.vehicle.licensePlate || undefined,
        },
      },
      lineItems: invoice.lineItems.map((item: any) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        notes: item.notes || undefined,
      })),
    }));
  }

  // Update invoice
  async updateInvoice(invoiceId: string, data: UpdateInvoiceRequest): Promise<InvoiceWithDetails> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ...data,
      },
    });

    return await this.getInvoiceById(invoiceId);
  }

  // Delete invoice
  async deleteInvoice(invoiceId: string): Promise<void> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error('Cannot delete a paid invoice');
    }

    await prisma.invoice.delete({
      where: { id: invoiceId },
    });
  }

  // Get invoice statistics
  async getInvoiceStatistics(): Promise<InvoiceStatistics> {
    const [
      totalInvoices,
      draftInvoices,
      sentInvoices,
      cancelledInvoices,
      overdueInvoices,
      totalRevenue,
    ] = await Promise.all([
      prisma.invoice.count(),
      prisma.invoice.count({ where: { status: InvoiceStatus.DRAFT } }),
      prisma.invoice.count({ where: { status: InvoiceStatus.SENT } }),
      prisma.invoice.count({ where: { status: InvoiceStatus.CANCELLED } }),
      prisma.invoice.count({ where: { status: InvoiceStatus.OVERDUE } }),
      prisma.invoice.aggregate({
        _sum: { totalAmount: true },
        where: { 
          status: { in: [InvoiceStatus.SENT, InvoiceStatus.OVERDUE] }
        },
      }),
    ]);

    const averageInvoiceAmount = totalInvoices > 0 ? 
      Number(totalRevenue._sum.totalAmount || 0) / totalInvoices : 0;

    return {
      totalInvoices,
      draftInvoices,
      sentInvoices,
      cancelledInvoices,
      overdueInvoices,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      averageInvoiceAmount,
    };
  }
}
