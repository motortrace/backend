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
import * as pdfMake from 'pdfmake/build/pdfmake';
import { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces';

// Load fonts for pdfMake
const pdfFonts = require('pdfmake/build/vfs_fonts');
if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
}
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
    // NOTE: Labor is tracking-only, NOT billable - only services and parts are invoiced
    const subtotalServices = workOrder.services.reduce((sum, s) => sum + Number(s.subtotal), 0);
    const subtotalParts = workOrder.partsUsed.reduce((sum, p) => sum + Number(p.subtotal), 0);
    const subtotal = subtotalServices + subtotalParts;
    
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
        subtotalLabor: 0, // Labor is tracking-only, not billable
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
          description: service.description || service.cannedService?.name || 'Service',
          quantity: service.quantity,
          unitPrice: service.unitPrice,
          subtotal: service.subtotal,
          workOrderServiceId: service.id,
          notes: service.notes,
        },
      });
    }

    // NOTE: Labor items are NOT invoiced separately - they are for tracking work only
    // Customer pays for SERVICES (which may include labor operations), not individual labor items

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

    // Generate file name for storage
    const fileName = `invoice-${invoice.invoiceNumber}-${Date.now()}.pdf`;

    // Format currency for Sri Lanka
    const formatCurrency = (amount: number) => {
      return `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Format dates for Sri Lanka
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    };

    // Filter out TAX and DISCOUNT items (handled separately in totals)
    const displayItems = invoice.lineItems.filter(item => 
      item.type !== 'TAX' && item.type !== 'DISCOUNT'
    );

    // Build table rows with custom columns: Type | Name | Qty | Unit Price | Total
    // Note: subtotal is the final amount charged (not unitPrice - discount)
    // subtotal can be manually adjusted, negotiated price, special rate, etc.
    const tableBody: any[][] = [
      // Header row
      [
        { text: 'Type', style: 'tableHeader', bold: true },
        { text: 'Description', style: 'tableHeader', bold: true },
        { text: 'Qty', style: 'tableHeader', bold: true, alignment: 'center' },
        { text: 'Unit Price', style: 'tableHeader', bold: true, alignment: 'right' },
        { text: 'Total', style: 'tableHeader', bold: true, alignment: 'right' },
      ],
    ];

    // Add data rows
    displayItems.forEach(item => {
      const unitPrice = Number(item.unitPrice);
      const quantity = Number(item.quantity);
      const subtotal = Number(item.subtotal);

      tableBody.push([
        { text: item.type, style: 'tableCell' },
        { text: item.description, style: 'tableCell' },
        { text: quantity.toString(), style: 'tableCell', alignment: 'center' },
        { text: formatCurrency(unitPrice), style: 'tableCell', alignment: 'right' },
        { text: formatCurrency(subtotal), style: 'tableCell', alignment: 'right' },
      ]);
    });

    // Vehicle information
    const vehicle = invoice.workOrder.vehicle;
    const vehicleInfo = [
      `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      vehicle.licensePlate ? `License: ${vehicle.licensePlate}` : '',
      vehicle.vin ? `VIN: ${vehicle.vin}` : '',
      invoice.workOrder.odometerReading ? `Odometer: ${invoice.workOrder.odometerReading.toLocaleString()} km` : '',
    ].filter(line => line).join('\n');

    // Build PDF document definition
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        // Company header
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: 'MotorTrace Auto Service', style: 'companyName', fontSize: 20, bold: true },
                { text: 'No. 123, Service Center Road', style: 'companyInfo' },
                { text: 'Colombo 00500, Sri Lanka', style: 'companyInfo' },
                { text: 'Tel: +94 11 234 5678', style: 'companyInfo' },
                { text: 'Email: service@motortrace.lk', style: 'companyInfo' },
                { text: 'VAT Reg No: 123456789-7000', style: 'companyInfo' },
              ],
            },
            {
              width: 'auto',
              stack: [
                { text: 'INVOICE', style: 'invoiceTitle', fontSize: 24, bold: true, alignment: 'right' },
                { text: `#${invoice.invoiceNumber}`, style: 'invoiceNumber', fontSize: 14, alignment: 'right' },
                { text: `Date: ${formatDate(invoice.createdAt)}`, style: 'invoiceInfo', alignment: 'right' },
                { text: `Due: ${invoice.dueDate ? formatDate(invoice.dueDate) : formatDate(new Date())}`, style: 'invoiceInfo', alignment: 'right' },
                { text: `Status: ${this.getInvoiceStatusLabel(invoice.status)}`, style: 'invoiceInfo', alignment: 'right' },
              ],
            },
          ],
        },
        { text: '', margin: [0, 20, 0, 0] },

        // Customer and Vehicle info
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'BILL TO:', style: 'sectionTitle', bold: true, fontSize: 11 },
                { text: invoice.workOrder.customer.name, style: 'customerInfo', bold: true },
                ...(invoice.workOrder.customer.email ? [{ text: invoice.workOrder.customer.email, style: 'customerInfo' }] : []),
                ...(invoice.workOrder.customer.phone ? [{ text: invoice.workOrder.customer.phone, style: 'customerInfo' }] : []),
              ],
            },
            {
              width: '50%',
              stack: [
                { text: 'VEHICLE:', style: 'sectionTitle', bold: true, fontSize: 11 },
                { text: vehicleInfo, style: 'customerInfo' },
                { text: `Work Order: ${invoice.workOrder.workOrderNumber}`, style: 'customerInfo', marginTop: 5 },
              ],
            },
          ],
        },
        { text: '', margin: [0, 20, 0, 0] },

        // Items table
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto'],
            body: tableBody,
          },
          layout: {
            fillColor: (rowIndex: number) => (rowIndex === 0 ? '#0066cc' : null),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#cccccc',
            vLineColor: () => '#cccccc',
          },
        },
        { text: '', margin: [0, 20, 0, 0] },

        // Totals section
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 200,
              stack: [
                {
                  columns: [
                    { width: '*', text: 'Subtotal:', alignment: 'right', bold: true },
                    { width: 100, text: formatCurrency(Number(invoice.subtotal)), alignment: 'right' },
                  ],
                  margin: [0, 0, 0, 5],
                },
                {
                  columns: [
                    { width: '*', text: 'Discount:', alignment: 'right', bold: true },
                    { width: 100, text: formatCurrency(Number(invoice.discountAmount || 0)), alignment: 'right' },
                  ],
                  margin: [0, 0, 0, 5],
                },
                {
                  columns: [
                    { width: '*', text: 'VAT (18%):', alignment: 'right', bold: true },
                    { width: 100, text: formatCurrency(Number(invoice.taxAmount)), alignment: 'right' },
                  ],
                  margin: [0, 0, 0, 5],
                },
                {
                  canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }],
                  margin: [0, 5, 0, 5],
                },
                {
                  columns: [
                    { width: '*', text: 'TOTAL:', alignment: 'right', bold: true, fontSize: 14 },
                    { width: 100, text: formatCurrency(Number(invoice.totalAmount)), alignment: 'right', bold: true, fontSize: 14 },
                  ],
                },
              ],
            },
          ],
        },
        { text: '', margin: [0, 20, 0, 0] },

        // Notes section
        ...(invoice.notes ? [{
          stack: [
            { text: 'NOTES:', style: 'sectionTitle', bold: true, fontSize: 11 },
            { text: invoice.notes, style: 'notes' },
          ],
        }] : []),
        ...(invoice.terms ? [{
          stack: [
            { text: 'TERMS:', style: 'sectionTitle', bold: true, fontSize: 11, marginTop: 10 },
            { text: invoice.terms, style: 'notes' },
          ],
        }] : []),
      ],
      styles: {
        companyName: { fontSize: 20, bold: true, color: '#0066cc' },
        companyInfo: { fontSize: 9, color: '#666666', marginTop: 2 },
        invoiceTitle: { fontSize: 24, bold: true, color: '#0066cc' },
        invoiceNumber: { fontSize: 14, marginTop: 5 },
        invoiceInfo: { fontSize: 9, color: '#666666', marginTop: 2 },
        sectionTitle: { fontSize: 11, bold: true, marginBottom: 5 },
        customerInfo: { fontSize: 10, marginTop: 2 },
        tableHeader: { fontSize: 10, bold: true, color: 'white', fillColor: '#0066cc', margin: [5, 5, 5, 5] },
        tableCell: { fontSize: 9, margin: [5, 5, 5, 5] },
        notes: { fontSize: 9, color: '#666666', marginTop: 5 },
      },
      defaultStyle: {
        font: 'Roboto',
      },
    };

    // Generate PDF buffer using pdfMake
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    
    // Generate PDF to buffer
    const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
      pdfDocGenerator.getBuffer((buffer: Buffer) => {
        resolve(buffer);
      });
    });

    console.log(`PDF generated in memory, size: ${pdfBuffer.length} bytes`);

    // Upload to Supabase Storage
    const { StorageService } = require('../storage/storage.service');
    const uploadResult = await StorageService.uploadInvoicePDF(
      pdfBuffer,
      fileName,
      invoiceId
    );

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
