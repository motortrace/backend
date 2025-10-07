import { InvoiceStatus, LineItemType, Prisma, PrismaClient } from '@prisma/client';
import {
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceWithDetails,
  InvoiceFilters,
  InvoiceStatistics,
  IInvoicesService,
} from './invoices.types';
import { NotFoundError, ConflictError, BadRequestError } from '../../shared/errors/custom-errors';
import { PDFInvoice } from '@h1dd3nsn1p3r/pdf-invoice';
import * as path from 'path';
import * as fs from 'fs';

export class InvoicesService implements IInvoicesService {
  constructor(private readonly prisma: PrismaClient) {}

  // Generate unique invoice number
  private async generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    // Get the count of invoices created this month
    const startOfMonth = new Date(year, today.getMonth(), 1);
    const endOfMonth = new Date(year, today.getMonth() + 1, 0);
    
    const invoiceCount = await this.prisma.invoice.count({
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
    const workOrder = await this.prisma.workOrder.findUnique({
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
      throw new NotFoundError('WorkOrder', data.workOrderId);
    }

    // Check if invoice already exists
    const existingInvoice = await this.prisma.invoice.findFirst({
      where: { workOrderId: data.workOrderId },
    });

    if (existingInvoice) {
      throw new ConflictError('Invoice already exists for this work order');
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
    const invoice = await this.prisma.invoice.create({
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
      await this.prisma.invoiceLineItem.create({
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

    // Create line items ONLY for standalone labor (not part of a canned service)
    // Labor items that belong to a service (have cannedServiceId) are already included in the service price
    const standaloneLabor = workOrder.laborItems.filter(labor => !labor.cannedServiceId);
    for (const labor of standaloneLabor) {
      await this.prisma.invoiceLineItem.create({
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
      await this.prisma.invoiceLineItem.create({
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

    // Add tax line item for record-keeping (18% VAT on subtotal - Sri Lankan standard)
    // This is calculated as: subtotal * 0.18
    if (taxAmount > 0) {
      await this.prisma.invoiceLineItem.create({
        data: {
          invoiceId: invoice.id,
          type: LineItemType.TAX,
          description: 'VAT (18%)',
          quantity: 1,
          unitPrice: taxAmount,
          subtotal: taxAmount,
        },
      });
    }

    // Add discount line item if applicable
    if (discountAmount > 0) {
      await this.prisma.invoiceLineItem.create({
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

    // Automatically generate PDF and store in Supabase Storage
    let pdfUrl: string | null = null;
    try {
      pdfUrl = await this.generateInvoicePDF(invoice.id);
      console.log(`✅ Invoice PDF generated automatically: ${pdfUrl}`);
      
      // Update the invoice record with the PDF URL
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { pdfUrl }
      });
      console.log(`✅ Invoice PDF URL saved to database`);
    } catch (pdfError) {
      console.error('⚠️ Failed to generate PDF during invoice creation:', pdfError);
      // Don't fail invoice creation if PDF generation fails
      // PDF can be regenerated later via GET endpoint
    }

    // Return the complete invoice with line items
    return await this.getInvoiceById(invoice.id);
  }

  // Get invoice by ID with all details
  async getInvoiceById(invoiceId: string): Promise<InvoiceWithDetails> {
    const invoice = await this.prisma.invoice.findUnique({
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
      throw new NotFoundError('Invoice', invoiceId);
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
      this.prisma.invoice.findMany({
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
      this.prisma.invoice.count({ where }),
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
    const invoices = await this.prisma.invoice.findMany({
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
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundError('Invoice', invoiceId);
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ...data,
      },
    });

    return await this.getInvoiceById(invoiceId);
  }

  // Delete invoice
  async deleteInvoice(invoiceId: string): Promise<void> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundError('Invoice', invoiceId);
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestError('Cannot delete a paid invoice');
    }

    await this.prisma.invoice.delete({
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
      this.prisma.invoice.count(),
      this.prisma.invoice.count({ where: { status: InvoiceStatus.DRAFT } }),
      this.prisma.invoice.count({ where: { status: InvoiceStatus.SENT } }),
      this.prisma.invoice.count({ where: { status: InvoiceStatus.CANCELLED } }),
      this.prisma.invoice.count({ where: { status: InvoiceStatus.OVERDUE } }),
      this.prisma.invoice.aggregate({
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

  // Generate PDF invoice
  async generateInvoicePDF(invoiceId: string): Promise<string> {
    // Get invoice with all details
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        workOrder: {
          include: {
            customer: true,
            vehicle: true,
          },
        },
        lineItems: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundError('Invoice', invoiceId);
    }

    // Create temporary directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate file path
    const fileName = `invoice-${invoice.invoiceNumber}-${Date.now()}.pdf`;
    const tempFilePath = path.join(tempDir, fileName);

    // Separate line items by type (exclude TAX and DISCOUNT as they're handled separately)
    const serviceItems = invoice.lineItems.filter(item => item.type === 'SERVICE');
    const laborItems = invoice.lineItems.filter(item => item.type === 'LABOR');
    const partItems = invoice.lineItems.filter(item => item.type === 'PART');
    const taxItem = invoice.lineItems.find(item => item.type === 'TAX');
    const discountItem = invoice.lineItems.find(item => item.type === 'DISCOUNT');

    // Map line items - USE SUBTOTAL AS PRICE (that's what we actually charge)
    // The library displays 'price' field, so we pass subtotal there
    const allItems = [
      ...serviceItems.map(item => {
        return {
          name: item.description,
          quantity: Number(item.quantity),
          price: Number(item.subtotal) / Number(item.quantity), // Price per unit after discount
        };
      }),
      ...laborItems.map(item => {
        return {
          name: item.description,
          quantity: Number(item.quantity),
          price: Number(item.subtotal) / Number(item.quantity),
        };
      }),
      ...partItems.map(item => {
        return {
          name: item.description,
          quantity: Number(item.quantity),
          price: Number(item.subtotal) / Number(item.quantity),
        };
      }),
    ];

    // Format dates for Sri Lanka
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    };

    // Build vehicle header for top of invoice
    let vehicleHeader = `Work Order: ${invoice.workOrder.workOrderNumber}\n`;
    vehicleHeader += `Vehicle: ${invoice.workOrder.vehicle.year} ${invoice.workOrder.vehicle.make} ${invoice.workOrder.vehicle.model}\n`;
    if (invoice.workOrder.vehicle.licensePlate) {
      vehicleHeader += `License Plate: ${invoice.workOrder.vehicle.licensePlate}\n`;
    }
    if (invoice.workOrder.vehicle.vin) {
      vehicleHeader += `VIN: ${invoice.workOrder.vehicle.vin}\n`;
    }
    if (invoice.workOrder.odometerReading) {
      vehicleHeader += `Odometer: ${invoice.workOrder.odometerReading.toLocaleString()} km`;
    }

    // Build detailed notes for footer
    let detailedNotes = invoice.notes || "Thank you for your business!";
    if (invoice.terms) {
      detailedNotes += `\n\nTerms: ${invoice.terms}`;
    }

    // Transform data to PDF invoice format - USE INVOICE TABLE VALUES DIRECTLY
    const payload: any = {
      company: {
        name: "MotorTrace Auto Service",
        address: `${vehicleHeader}\n\n` + "No. 123, Service Center Road\nColombo 00500\nSri Lanka",
        phone: "Tel: +94 11 234 5678",
        email: "Email: service@motortrace.lk",
        website: "Web: https://www.motortrace.lk",
        taxId: "VAT Reg No: 123456789-7000",
      },
      customer: {
        name: invoice.workOrder.customer.name,
        email: invoice.workOrder.customer.email || undefined,
        phone: invoice.workOrder.customer.phone || undefined,
        address: undefined,
      },
      invoice: {
        number: invoice.invoiceNumber,
        date: formatDate(invoice.createdAt),
        dueDate: invoice.dueDate ? formatDate(invoice.dueDate) : formatDate(new Date()),
        status: this.getInvoiceStatusLabel(invoice.status),
        locale: "en-LK",
        currency: "LKR",
        path: tempFilePath,
      },
      items: allItems,
      // USE EXACT VALUES FROM INVOICE TABLE
      subtotal: Number(invoice.subtotal),
      tax: Number(invoice.taxAmount),
      taxLabel: "VAT (18%)",
      discount: Number(invoice.discountAmount || 0),
      total: Number(invoice.totalAmount),
      note: {
        text: detailedNotes,
        italic: false,
      },
    };

    // Generate PDF
    const pdfInvoice = new PDFInvoice(payload);
    const generatedPath = await pdfInvoice.create();

    // Wait a bit to ensure file is fully written
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify the file exists and has content
    if (!fs.existsSync(generatedPath)) {
      throw new Error('PDF file was not generated');
    }

    const stats = fs.statSync(generatedPath);
    if (stats.size === 0) {
      throw new Error('Generated PDF is empty');
    }

    console.log(`PDF generated at: ${generatedPath}, size: ${stats.size} bytes`);

    // Read the generated PDF file
    const pdfBuffer = fs.readFileSync(generatedPath);

    // Upload to Supabase Storage
    const { StorageService } = require('../storage/storage.service');
    const uploadResult = await StorageService.uploadInvoicePDF(
      pdfBuffer,
      fileName,
      invoiceId
    );

    // Delete the temporary file
    fs.unlinkSync(generatedPath);

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Failed to upload PDF to storage');
    }

    return uploadResult.url!;
  }

  // Helper to get readable invoice status
  private getInvoiceStatusLabel(status: InvoiceStatus): string {
    const statusMap: Record<InvoiceStatus, string> = {
      [InvoiceStatus.DRAFT]: 'Draft',
      [InvoiceStatus.SENT]: 'Sent',
      [InvoiceStatus.PAID]: 'Paid',
      [InvoiceStatus.OVERDUE]: 'Overdue',
      [InvoiceStatus.CANCELLED]: 'Cancelled',
    };
    return statusMap[status] || 'Draft';
  }
}
