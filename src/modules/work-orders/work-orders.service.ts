import { WorkOrderStatus, JobType, JobPriority, JobSource, WarrantyStatus, WorkflowStep, PaymentStatus, ServiceStatus, PartSource, PaymentMethod, ApprovalStatus, ApprovalMethod, ChecklistStatus, TirePosition, AttachmentCategory, Prisma } from '@prisma/client';
import {
  CreateWorkOrderRequest,
  UpdateWorkOrderRequest,
  WorkOrderFilters,
  CreateWorkOrderServiceRequest,
  UpdateWorkOrderLaborRequest,
  CreatePaymentRequest,
  WorkOrderStatistics,
  WorkOrderCreationStats,
  GeneralStats,
} from './work-orders.types';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../notifications/notifications.service';
import { NotificationEventType, NotificationChannel, NotificationPriority } from '../notifications/notifications.types';

// Type alias for work order with all includes
type WorkOrderWithDetails = Prisma.WorkOrderGetPayload<{
  include: {
    customer: { select: { id: true; name: true; email: true; phone: true } };
    vehicle: { select: { id: true; make: true; model: true; year: true; licensePlate: true; vin: true; imageUrl: true } };
    appointment: { select: { id: true; requestedAt: true; startTime: true; endTime: true } };
    serviceAdvisor: { select: { id: true; employeeId: true; department: true; userProfile: { select: { id: true; name: true; phone: true; profileImage: true } } } };
    services: { include: { cannedService: { select: { id: true; code: true; name: true; description: true; duration: true; price: true } } } };
    inspections: { include: { inspector: { select: { id: true; userProfile: { select: { id: true; name: true; profileImage: true } } } } } };
    laborItems: { include: { laborCatalog: { select: { id: true; code: true; name: true; estimatedMinutes: true } }; technician: { select: { id: true; userProfile: { select: { id: true; name: true } } } } } };
    partsUsed: { include: { part: { select: { id: true; name: true; sku: true; partNumber: true; manufacturer: true } }; installedBy: { select: { id: true; userProfile: { select: { id: true; name: true } } } } } };
    payments: { include: { processedBy: { select: { id: true; userProfile: { select: { id: true; name: true } } } } } };
    attachments: { include: { uploadedBy: { select: { id: true; name: true } } } };
    approvals: {
      include: {
        approvedBy: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    };
  },
}>;


export class WorkOrderService {
  private notificationService: NotificationService;

  constructor(private readonly prisma: PrismaClient) {
    this.notificationService = new NotificationService(prisma);
  }

    // Expire previous WorkOrderApproval entries for a work order and status
    async expirePreviousApprovals(workOrderId: string, status: ApprovalStatus) {
      await this.prisma.workOrderApproval.updateMany({
        where: {
          workOrderId,
          status,
          pdfUrl: { not: null },
        },
        data: { status: ApprovalStatus.EXPIRED },
      });
    }

    // Create WorkOrderApproval entry
    async createWorkOrderApproval(data: { workOrderId: string; status: ApprovalStatus; approvedById: string; pdfUrl: string }) {
      // Generate inspection PDF if inspections exist
      let inspectionPdfUrl: string | undefined;
      try {
        // Check if work order has inspections
        const workOrder = await this.prisma.workOrder.findUnique({
          where: { id: data.workOrderId },
          include: {
            inspections: {
              take: 1, // Just check if any exist
            },
          },
        });

        if (workOrder && workOrder.inspections && workOrder.inspections.length > 0) {
          inspectionPdfUrl = await this.generateInspectionPDF(data.workOrderId);
        }
      } catch (error) {
        console.warn('Failed to generate inspection PDF:', error);
        // Continue without inspection PDF - don't fail the approval
      }

      return await this.prisma.workOrderApproval.create({
        data: {
          ...data,
          inspectionPdfUrl,
        },
      });
    }

    // Get WorkOrderApproval entries for a work order
    async getWorkOrderApprovals(workOrderId: string) {
      return await this.prisma.workOrderApproval.findMany({
        where: { workOrderId },
        include: {
          approvedBy: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

  // Approve WorkOrderApproval entry and auto-approve all services and parts
  async approveWorkOrderApproval(approvalId: string, customerId: string | null, notes?: string) {
      // Get the WorkOrderApproval entry
      const approval = await this.prisma.workOrderApproval.findUnique({
        where: { id: approvalId },
        include: { workOrder: true },
      });

      if (!approval) {
        throw new Error('WorkOrderApproval entry not found');
      }

      if (approval.status !== ApprovalStatus.PENDING) {
        throw new Error('WorkOrderApproval entry is not in PENDING status');
      }

      const workOrderId = approval.workOrderId;

      // If customerId is provided (not a manager approval), validate that the customer owns this work order
      if (customerId) {
        if (approval.workOrder.customerId !== customerId) {
          throw new Error('Unauthorized: You can only approve work order approvals for your own work orders');
        }
      }

      // Update WorkOrderApproval status
      await this.prisma.workOrderApproval.update({
        where: { id: approvalId },
        data: {
          status: ApprovalStatus.APPROVED,
          approvedAt: new Date(),
          approvedById: customerId || undefined, // Allow null for manager approvals
          method: ApprovalMethod.APP,
          notes,
        },
      });

      // Auto-approve all WorkOrderService entries
      await this.prisma.workOrderService.updateMany({
        where: {
          workOrderId,
          customerApproved: false,
          customerRejected: false,
          status: ServiceStatus.ESTIMATED,
        },
        data: {
          customerApproved: true,
          customerRejected: false,
          approvedAt: new Date(),
          status: ServiceStatus.PENDING, // Ready to start work
        },
      });

      // Auto-approve all WorkOrderPart entries
      await this.prisma.workOrderPart.updateMany({
        where: {
          workOrderId,
          customerApproved: false,
          customerRejected: false,
        },
        data: {
          customerApproved: true,
          customerRejected: false,
          approvedAt: new Date(),
        },
      });

      // Recalculate work order totals
      await this.updateWorkOrderTotals(workOrderId);

      // Auto-update work order status (should become APPROVED)
      await this.autoUpdateWorkOrderStatus(workOrderId);

      return { message: 'WorkOrderApproval approved and all services/parts auto-approved successfully' };
    }

  // Reject WorkOrderApproval entry
  async rejectWorkOrderApproval(approvalId: string, customerId: string | null, reason?: string) {
      // Get the WorkOrderApproval entry
      const approval = await this.prisma.workOrderApproval.findUnique({
        where: { id: approvalId },
        include: { workOrder: true },
      });

      if (!approval) {
        throw new Error('WorkOrderApproval entry not found');
      }

      if (approval.status !== ApprovalStatus.PENDING) {
        throw new Error('WorkOrderApproval entry is not in PENDING status');
      }

      const workOrderId = approval.workOrderId;

      // If customerId is provided (not a manager approval), validate that the customer owns this work order
      if (customerId) {
        if (approval.workOrder.customerId !== customerId) {
          throw new Error('Unauthorized: You can only reject work order approvals for your own work orders');
        }
      }

      // Update WorkOrderApproval status
      await this.prisma.workOrderApproval.update({
        where: { id: approvalId },
        data: {
          status: ApprovalStatus.DECLINED,
          approvedAt: new Date(),
          approvedById: customerId || undefined, // Allow null for manager approvals
          notes: reason,
        },
      });

      return { message: 'WorkOrderApproval rejected' };
    }

  // Generate PDF estimate for a work order
  async generateEstimatePDF(workOrderId: string): Promise<string> {
    // Get work order with all details
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        customer: true,
        vehicle: true,
        services: {
          include: { cannedService: true }
        },
        laborItems: {
          include: { laborCatalog: true }
        },
        partsUsed: {
          include: { part: true }
        }
      }
    });

    if (!workOrder) throw new Error('WorkOrder not found');

    // Generate file name for storage
    const fileName = `estimate-${workOrder.workOrderNumber}-${Date.now()}.pdf`;

    // Format currency for Sri Lanka
    const formatCurrency = (amount: number) => `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Build table rows: Type | Description | Qty | Unit Price | Total
    const tableBody: any[][] = [
      [
        { text: 'Type', style: 'tableHeader', bold: true },
        { text: 'Description', style: 'tableHeader', bold: true },
        { text: 'Qty', style: 'tableHeader', bold: true, alignment: 'center' },
        { text: 'Unit Price', style: 'tableHeader', bold: true, alignment: 'right' },
        { text: 'Total', style: 'tableHeader', bold: true, alignment: 'right' },
      ],
    ];

    // Add services
    workOrder.services.forEach(service => {
      tableBody.push([
        { text: 'Service', style: 'tableCell' },
        { text: service.cannedService?.name || service.description, style: 'tableCell' },
        { text: service.quantity?.toString() || '1', style: 'tableCell', alignment: 'center' },
        { text: formatCurrency(Number(service.unitPrice)), style: 'tableCell', alignment: 'right' },
        { text: formatCurrency(Number(service.subtotal)), style: 'tableCell', alignment: 'right' },
      ]);
    });

    // Add parts
    workOrder.partsUsed.forEach(part => {
      tableBody.push([
        { text: 'Part', style: 'tableCell' },
        { text: part.part?.name || '', style: 'tableCell' },
        { text: part.quantity?.toString() || '1', style: 'tableCell', alignment: 'center' },
        { text: formatCurrency(Number(part.unitPrice)), style: 'tableCell', alignment: 'right' },
        { text: formatCurrency(Number(part.subtotal)), style: 'tableCell', alignment: 'right' },
      ]);
    });

    // Add labor (for reference, not billed)
    workOrder.laborItems.forEach(labor => {
      tableBody.push([
        { text: 'Labor', style: 'tableCell' },
        { text: labor.laborCatalog?.name || labor.description, style: 'tableCell' },
        { text: '1', style: 'tableCell', alignment: 'center' },
        { text: '-', style: 'tableCell', alignment: 'right' },
        { text: '-', style: 'tableCell', alignment: 'right' },
      ]);
    });

    // Vehicle info
    const vehicle = workOrder.vehicle;
    const vehicleInfo = [
      `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      vehicle.licensePlate ? `License: ${vehicle.licensePlate}` : '',
      vehicle.vin ? `VIN: ${vehicle.vin}` : '',
      workOrder.odometerReading ? `Odometer: ${workOrder.odometerReading.toLocaleString()} km` : '',
    ].filter(line => line).join('\n');

    // Calculate totals
    const subtotalServices = workOrder.services.reduce((sum, s) => sum + Number(s.subtotal), 0);
    const subtotalParts = workOrder.partsUsed.reduce((sum, p) => sum + Number(p.subtotal), 0);
    const subtotal = subtotalServices + subtotalParts;
    let discountAmount = 0;
    if (workOrder.discountAmount && Number(workOrder.discountAmount) > 0) {
      if (workOrder.discountType === 'PERCENTAGE') {
        discountAmount = subtotal * (Number(workOrder.discountAmount) / 100);
      } else {
        discountAmount = Number(workOrder.discountAmount);
      }
    }
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxRate = 0.18;
    const taxAmount = subtotalAfterDiscount * taxRate;
    const totalAmount = subtotalAfterDiscount + taxAmount;

    // Build PDF document definition
    const pdfMake = require('pdfmake/build/pdfmake');
    const pdfFonts = require('pdfmake/build/vfs_fonts');
    if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
    }
    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
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
                { text: 'ESTIMATE', style: 'invoiceTitle', fontSize: 24, bold: true, alignment: 'right' },
                { text: `#${workOrder.workOrderNumber}`, style: 'invoiceNumber', fontSize: 14, alignment: 'right' },
                { text: `Date: ${formatDate(workOrder.createdAt)}`, style: 'invoiceInfo', alignment: 'right' },
                { text: `Status: ${workOrder.status}`, style: 'invoiceInfo', alignment: 'right' },
              ],
            },
          ],
        },
        { text: '', margin: [0, 20, 0, 0] },
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'CUSTOMER:', style: 'sectionTitle', bold: true, fontSize: 11 },
                { text: workOrder.customer.name, style: 'customerInfo', bold: true },
                ...(workOrder.customer.email ? [{ text: workOrder.customer.email, style: 'customerInfo' }] : []),
                ...(workOrder.customer.phone ? [{ text: workOrder.customer.phone, style: 'customerInfo' }] : []),
              ],
            },
            {
              width: '50%',
              stack: [
                { text: 'VEHICLE:', style: 'sectionTitle', bold: true, fontSize: 11 },
                { text: vehicleInfo, style: 'customerInfo' },
                { text: `Work Order: ${workOrder.workOrderNumber}`, style: 'customerInfo', marginTop: 5 },
              ],
            },
          ],
        },
        { text: '', margin: [0, 20, 0, 0] },
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
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 200,
              stack: [
                {
                  columns: [
                    { width: '*', text: 'Subtotal:', alignment: 'right', bold: true },
                    { width: 100, text: formatCurrency(subtotal), alignment: 'right' },
                  ],
                  margin: [0, 0, 0, 5],
                },
                ...(discountAmount > 0 ? [{
                  columns: [
                    { width: '*', text: 'Discount:', alignment: 'right', bold: true },
                    { width: 100, text: `-${formatCurrency(discountAmount)}`, alignment: 'right', color: '#cc0000' },
                  ],
                  margin: [0, 0, 0, 5],
                }] : []),
                {
                  columns: [
                    { width: '*', text: 'VAT (18%):', alignment: 'right', bold: true },
                    { width: 100, text: formatCurrency(taxAmount), alignment: 'right' },
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
                    { width: 100, text: formatCurrency(totalAmount), alignment: 'right', bold: true, fontSize: 14 },
                  ],
                },
              ],
            },
          ],
        },
        { text: '', margin: [0, 20, 0, 0] },
        ...(workOrder.estimateNotes ? [{
          stack: [
            { text: 'NOTES:', style: 'sectionTitle', bold: true, fontSize: 11 },
            { text: workOrder.estimateNotes, style: 'notes' },
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
      defaultStyle: { font: 'Roboto' },
    };

    // Generate PDF buffer using pdfMake
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    const pdfBuffer = await new Promise((resolve, reject) => {
      pdfDocGenerator.getBuffer((buffer: Buffer) => {
        resolve(buffer);
      });
    });

    // Upload to Supabase Storage
    const { StorageService } = require('../storage/storage.service');
    const uploadResult = await StorageService.uploadEstimatePDF(
      pdfBuffer,
      fileName,
      workOrderId
    );
    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Failed to upload PDF to storage');
    }
    return uploadResult.url!;
  }

  // Generate PDF inspection report for a work order
  async generateInspectionPDF(workOrderId: string): Promise<string> {
    // Get work order with inspection details
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        customer: true,
        vehicle: true,
        inspections: {
          include: {
            inspector: {
              include: {
                userProfile: true
              }
            },
            template: true,
            checklistItems: {
              include: {
                templateItem: true
              },
              orderBy: { createdAt: 'asc' }
            },
            attachments: {
              orderBy: { uploadedAt: 'desc' }
            },
            tireChecks: {
              orderBy: { position: 'asc' }
            }
          },
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!workOrder) throw new Error('WorkOrder not found');
    if (!workOrder.inspections || workOrder.inspections.length === 0) {
      throw new Error('No inspections found for this work order');
    }

    // Generate file name for storage
    const fileName = `inspection-${workOrder.workOrderNumber}-${Date.now()}.pdf`;

    // Format date
    const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Vehicle info
    const vehicle = workOrder.vehicle;
    const vehicleInfo = [
      `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      vehicle.licensePlate ? `License: ${vehicle.licensePlate}` : '',
      vehicle.vin ? `VIN: ${vehicle.vin}` : '',
      workOrder.odometerReading ? `Odometer: ${workOrder.odometerReading.toLocaleString()} km` : '',
    ].filter(line => line).join('\n');

    // Build PDF document definition
    const pdfMake = require('pdfmake/build/pdfmake');
    const pdfFonts = require('pdfmake/build/vfs_fonts');
    if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
    }

    const content: any[] = [
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
            ],
          },
          {
            width: 'auto',
            stack: [
              { text: 'INSPECTION REPORT', style: 'reportTitle', fontSize: 24, bold: true, alignment: 'right' },
              { text: `#${workOrder.workOrderNumber}`, style: 'reportNumber', fontSize: 14, alignment: 'right' },
              { text: `Date: ${formatDate(new Date())}`, style: 'reportInfo', alignment: 'right' },
            ],
          },
        ],
      },
      { text: '', margin: [0, 20, 0, 0] },
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'CUSTOMER:', style: 'sectionTitle', bold: true, fontSize: 11 },
              { text: workOrder.customer.name, style: 'customerInfo', bold: true },
              ...(workOrder.customer.email ? [{ text: workOrder.customer.email, style: 'customerInfo' }] : []),
              ...(workOrder.customer.phone ? [{ text: workOrder.customer.phone, style: 'customerInfo' }] : []),
            ],
          },
          {
            width: '50%',
            stack: [
              { text: 'VEHICLE:', style: 'sectionTitle', bold: true, fontSize: 11 },
              { text: vehicleInfo, style: 'customerInfo' },
            ],
          },
        ],
      },
      { text: '', margin: [0, 20, 0, 0] },
    ];

    // Add each inspection
    for (const [index, inspection] of workOrder.inspections.entries()) {
      if (index > 0) {
        content.push({ text: '', pageBreak: 'before' });
      }

      content.push(
        { text: `Inspection ${index + 1}`, style: 'inspectionTitle', fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'Template:', style: 'fieldLabel', bold: true },
                { text: inspection.template?.name || 'Custom Inspection', style: 'fieldValue', margin: [0, 0, 0, 5] },
              ],
            },
            {
              width: '50%',
              stack: [
                { text: 'Inspector:', style: 'fieldLabel', bold: true },
                { text: inspection.inspector?.userProfile?.name || 'Not Assigned', style: 'fieldValue', margin: [0, 0, 0, 5] },
                { text: 'Date:', style: 'fieldLabel', bold: true },
                { text: formatDate(inspection.date), style: 'fieldValue', margin: [0, 0, 0, 5] },
              ],
            },
          ],
        },
        ...(inspection.notes ? [
          { text: 'Notes:', style: 'fieldLabel', bold: true, margin: [0, 10, 0, 5] },
          { text: inspection.notes, style: 'notes' },
        ] : []),
        { text: '', margin: [0, 15, 0, 0] },
        { text: 'Checklist Items', style: 'sectionTitle', fontSize: 14, bold: true, margin: [0, 0, 0, 10] }
      );

      // Checklist items table
      const checklistTableBody: any[][] = [
        [
          { text: 'Category', style: 'tableHeader', bold: true },
          { text: 'Item', style: 'tableHeader', bold: true },
          { text: 'Status', style: 'tableHeader', bold: true, alignment: 'center' },
          { text: 'Notes', style: 'tableHeader', bold: true },
        ],
      ];

      inspection.checklistItems.forEach(item => {
        const statusColor = item.status === 'RED' ? '#ff0000' : item.status === 'YELLOW' ? '#ffa500' : '#008000';
        checklistTableBody.push([
          { text: item.category || '', style: 'tableCell' },
          { text: item.item, style: 'tableCell' },
          { text: item.status, style: 'tableCell', alignment: 'center', color: statusColor, bold: true },
          { text: item.notes || '', style: 'tableCell' },
        ]);
      });

      content.push({
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', '*'],
          body: checklistTableBody,
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? '#0066cc' : null),
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#cccccc',
          vLineColor: () => '#cccccc',
        },
      });

      // Attachments section
      if (inspection.attachments && inspection.attachments.length > 0) {
        content.push(
          { text: '', margin: [0, 15, 0, 0] },
          { text: 'Attachments', style: 'sectionTitle', fontSize: 14, bold: true, margin: [0, 0, 0, 10] }
        );

        // Process attachments - embed images, show text for other files
        for (const attachment of inspection.attachments) {
          if (attachment.fileType?.startsWith('image/')) {
            try {
              // Fetch image from Supabase storage (follow redirects)
              const fetchBuffer = async (url: string, redirectLimit = 5): Promise<Buffer> => {
                const { URL } = require('url');
                const http = require('http');
                const https = require('https');

                return new Promise((resolve, reject) => {
                  try {
                    const parsed = new URL(url);
                    const lib = parsed.protocol === 'http:' ? http : https;
                    const req = lib.get(parsed.href, (res: any) => {
                      // Follow redirects (3xx)
                      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers && res.headers.location) {
                        if (redirectLimit === 0) {
                          reject(new Error('Too many redirects while fetching image'));
                          return;
                        }
                        // Some Location headers are relative; construct absolute URL
                        const location = res.headers.location.startsWith('http') ? res.headers.location : `${parsed.protocol}//${parsed.host}${res.headers.location}`;
                        resolve(fetchBuffer(location, redirectLimit - 1));
                        return;
                      }

                      if (res.statusCode !== 200) {
                        reject(new Error(`Failed to fetch image: ${res.statusCode}`));
                        return;
                      }

                      const chunks: Buffer[] = [];
                      res.on('data', (chunk: Buffer) => chunks.push(chunk));
                      res.on('end', () => resolve(Buffer.concat(chunks)));
                    });
                    req.on('error', reject);
                  } catch (err) {
                    reject(err);
                  }
                });
              };

              const imageBuffer = await fetchBuffer(attachment.fileUrl);

              // Convert to base64
              const base64Image = (imageBuffer as Buffer).toString('base64');

              // Add image to PDF
              content.push({
                image: `data:${attachment.fileType};base64,${base64Image}`,
                width: 200, // Fixed width for consistency
                margin: [0, 0, 0, 10],
              });

              // Add description below image if available
              if (attachment.description) {
                content.push({
                  text: attachment.description,
                  style: 'imageCaption',
                  margin: [0, 0, 0, 15],
                });
              }
            } catch (error) {
              console.warn(`Failed to embed image ${attachment.fileName}:`, error);
              // Fallback to text description
              content.push({
                text: `${attachment.fileName || 'Unnamed file'} ${attachment.description ? ` - ${attachment.description}` : ''}`,
                style: 'attachmentItem',
                margin: [0, 0, 0, 5]
              });
            }
          } else {
            // Non-image attachment - show as text
            content.push({
              text: `${attachment.fileName || 'Unnamed file'} ${attachment.description ? ` - ${attachment.description}` : ''}`,
              style: 'attachmentItem',
              margin: [0, 0, 0, 5]
            });
          }
        }
      }

      // Tire checks section
      if (inspection.tireChecks && inspection.tireChecks.length > 0) {
        content.push(
          { text: '', margin: [0, 15, 0, 0] },
          { text: 'Tire Inspection', style: 'sectionTitle', fontSize: 14, bold: true, margin: [0, 0, 0, 10] }
        );

        const tireTableBody: any[][] = [
          [
            { text: 'Position', style: 'tableHeader', bold: true },
            { text: 'Brand/Model', style: 'tableHeader', bold: true },
            { text: 'Size', style: 'tableHeader', bold: true },
            { text: 'PSI', style: 'tableHeader', bold: true, alignment: 'center' },
            { text: 'Tread Depth (mm)', style: 'tableHeader', bold: true, alignment: 'center' },
            { text: 'Notes', style: 'tableHeader', bold: true },
          ],
        ];

        inspection.tireChecks.forEach(tire => {
          tireTableBody.push([
            { text: tire.position, style: 'tableCell' },
            { text: `${tire.brand || ''} ${tire.model || ''}`.trim() || '-', style: 'tableCell' },
            { text: tire.size || '-', style: 'tableCell' },
            { text: tire.psi?.toString() || '-', style: 'tableCell', alignment: 'center' },
            { text: tire.treadDepth?.toString() || '-', style: 'tableCell', alignment: 'center' },
            { text: tire.damageNotes || '-', style: 'tableCell' },
          ]);
        });

        content.push({
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto', '*'],
            body: tireTableBody,
          },
          layout: {
            fillColor: (rowIndex: number) => (rowIndex === 0 ? '#0066cc' : null),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#cccccc',
            vLineColor: () => '#cccccc',
          },
        });
      }
    }

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content,
      styles: {
        companyName: { fontSize: 20, bold: true, color: '#0066cc' },
        companyInfo: { fontSize: 9, color: '#666666', marginTop: 2 },
        reportTitle: { fontSize: 24, bold: true, color: '#0066cc' },
        reportNumber: { fontSize: 14, marginTop: 5 },
        reportInfo: { fontSize: 9, color: '#666666', marginTop: 2 },
        sectionTitle: { fontSize: 11, bold: true, marginBottom: 5 },
        inspectionTitle: { fontSize: 16, bold: true, color: '#0066cc' },
        fieldLabel: { fontSize: 10, bold: true, marginBottom: 2 },
        fieldValue: { fontSize: 10, marginBottom: 2 },
        customerInfo: { fontSize: 10, marginTop: 2 },
        tableHeader: { fontSize: 10, bold: true, color: 'white', fillColor: '#0066cc', margin: [5, 5, 5, 5] },
        tableCell: { fontSize: 9, margin: [5, 5, 5, 5] },
        notes: { fontSize: 9, color: '#666666', marginTop: 5 },
        attachmentItem: { fontSize: 9, margin: [0, 0, 0, 3] },
        imageCaption: { fontSize: 8, color: '#666666', margin: [0, 0, 0, 5], italics: true },
      },
      defaultStyle: { font: 'Roboto' },
    };

    // Generate PDF buffer using pdfMake
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    const pdfBuffer = await new Promise((resolve, reject) => {
      pdfDocGenerator.getBuffer((buffer: Buffer) => {
        resolve(buffer);
      });
    });

    // Upload to Supabase Storage
    const { StorageService } = require('../storage/storage.service');
    const uploadResult = await StorageService.uploadInspectionPDF(
      pdfBuffer,
      fileName,
      workOrderId
    );
    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Failed to upload PDF to storage');
    }
    return uploadResult.url!;
  }
  
  // Get UserProfile by Supabase ID
  async getUserProfileBySupabaseId(supabaseUserId: string) {
    return await this.prisma.userProfile.findUnique({
      where: { supabaseUserId },
      select: { id: true, name: true }
    });
  }

  // Generate unique work order number
  private async generateWorkOrderNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    // Get count of work orders for today
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    const todayCount = await this.prisma.workOrder.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
    
    const sequence = String(todayCount + 1).padStart(3, '0');
    return `WO-${year}${month}${day}-${sequence}`;
  }

  // Create a new work order
  async createWorkOrder(data: CreateWorkOrderRequest): Promise<any> {
    const { cannedServiceIds = [], quantities = [], prices = [], serviceNotes = [], ...workOrderData } = data;

    // Generate unique work order number
    const workOrderNumber = await this.generateWorkOrderNumber();

    // Validate customer and vehicle exist
    const customer = await this.prisma.customer.findUnique({
      where: { id: workOrderData.customerId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: workOrderData.vehicleId },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    // Validate appointment if provided
    if (workOrderData.appointmentId) {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: workOrderData.appointmentId },
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }
    }

    // Validate service advisor if provided
    if (workOrderData.advisorId) {
      const advisor = await this.prisma.serviceAdvisor.findUnique({
        where: { id: workOrderData.advisorId },
      });

      if (!advisor) {
        throw new Error('Service advisor not found');
      }
    }



    // Determine initial status: AWAITING_APPROVAL if services are added, otherwise PENDING
    const hasServices = cannedServiceIds && cannedServiceIds.length > 0;
    const initialStatus = hasServices ? WorkOrderStatus.AWAITING_APPROVAL : WorkOrderStatus.PENDING;

    // Create work order with services
    const workOrder = await this.prisma.workOrder.create({
      data: {
        workOrderNumber,
        customerId: workOrderData.customerId,
        vehicleId: workOrderData.vehicleId,
        appointmentId: workOrderData.appointmentId,
        advisorId: workOrderData.advisorId,
        status: workOrderData.status || initialStatus,
        jobType: workOrderData.jobType || JobType.REPAIR,
        priority: workOrderData.priority || JobPriority.NORMAL,
        source: workOrderData.source || JobSource.WALK_IN,
        complaint: workOrderData.complaint,
        odometerReading: workOrderData.odometerReading,
        warrantyStatus: workOrderData.warrantyStatus || WarrantyStatus.NONE,
        estimatedTotal: workOrderData.estimatedTotal,
        estimateNotes: workOrderData.estimateNotes,
        promisedAt: workOrderData.promisedAt ? new Date(workOrderData.promisedAt) : undefined,
        internalNotes: workOrderData.internalNotes,
        customerNotes: workOrderData.customerNotes,
        workflowStep: WorkflowStep.RECEIVED,
        paymentStatus: PaymentStatus.PENDING,
        services: {
          create: cannedServiceIds.map((serviceId, index) => ({
            cannedServiceId: serviceId,
            description: `Service ${index + 1}`, // Placeholder - should fetch from canned service
            quantity: quantities[index] || 1,
            unitPrice: prices[index] || 0,
            subtotal: (quantities[index] || 1) * (prices[index] || 0),
            notes: serviceNotes[index],
          })),
        },
      },
    });

    return workOrder.id;
  }

  // Get work orders with filters
  async getWorkOrders(filters: WorkOrderFilters): Promise<WorkOrderWithDetails[]> {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.jobType) where.jobType = filters.jobType;
    if (filters.priority) where.priority = filters.priority;
    if (filters.source) where.source = filters.source;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters.advisorId) where.advisorId = filters.advisorId;
    if (filters.workflowStep) where.workflowStep = filters.workflowStep;
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const workOrders = await this.prisma.workOrder.findMany({
      where,
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
            vin: true,
            imageUrl: true,
          },
        },
        appointment: {
          select: {
            id: true,
            requestedAt: true,
            startTime: true,
            endTime: true,
          },
        },
        serviceAdvisor: {
          select: {
            id: true,
            employeeId: true,
            department: true,
            userProfile: {
              select: {
                id: true,
                name: true,
                phone: true,
                profileImage: true,
              },
            },
          },
        },
        services: {
          include: {
            cannedService: {
              select: {
                id: true,
                code: true,
                name: true,
                description: true,
                duration: true,
                price: true,
              },
            },
          },
        },
        inspections: {
          include: {
            inspector: {
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
        },
        laborItems: {
          include: {
            laborCatalog: {
              select: {
                id: true,
                code: true,
                name: true,
                estimatedMinutes: true,
              },
            },
            technician: {
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
        },
        partsUsed: {
          include: {
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
        },
        payments: {
          include: {
            processedBy: {
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
        },
        attachments: {
          include: {
            uploadedBy: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return workOrders.map(workOrder => this.transformWorkOrderForFrontend(workOrder));
  }

  // Helper method to transform work order data for frontend compatibility
  private transformWorkOrderForFrontend(workOrder: any): any {
    const transformed = { ...workOrder };

    // Transform customer name
    if (transformed.customer && transformed.customer.name) {
      const nameParts = transformed.customer.name.split(' ');
      transformed.customer.firstName = nameParts[0] || '';
      transformed.customer.lastName = nameParts.slice(1).join(' ') || '';
      delete transformed.customer.name;
    }

    // Transform service advisor name
    if (transformed.serviceAdvisor && transformed.serviceAdvisor.userProfile && transformed.serviceAdvisor.userProfile.name) {
      const nameParts = transformed.serviceAdvisor.userProfile.name.split(' ');
      transformed.serviceAdvisor.userProfile.firstName = nameParts[0] || '';
      transformed.serviceAdvisor.userProfile.lastName = nameParts.slice(1).join(' ') || '';
      delete transformed.serviceAdvisor.userProfile.name;
    }

    // Transform technician names in labor items
    if (transformed.laborItems) {
      transformed.laborItems = transformed.laborItems.map((laborItem: any) => {
        if (laborItem.technician && laborItem.technician.userProfile && laborItem.technician.userProfile.name) {
          const nameParts = laborItem.technician.userProfile.name.split(' ');
          laborItem.technician.userProfile.firstName = nameParts[0] || '';
          laborItem.technician.userProfile.lastName = nameParts.slice(1).join(' ') || '';
          delete laborItem.technician.userProfile.name;
        }
        return laborItem;
      });
    }

    // Transform technician names in inspections
    if (transformed.inspections) {
      transformed.inspections = transformed.inspections.map((inspection: any) => {
        if (inspection.inspector && inspection.inspector.userProfile && inspection.inspector.userProfile.name) {
          const nameParts = inspection.inspector.userProfile.name.split(' ');
          inspection.inspector.userProfile.firstName = nameParts[0] || '';
          inspection.inspector.userProfile.lastName = nameParts.slice(1).join(' ') || '';
          delete inspection.inspector.userProfile.name;
        }
        return inspection;
      });
    }

    // Transform technician names in parts used
    if (transformed.partsUsed) {
      transformed.partsUsed = transformed.partsUsed.map((part: any) => {
        if (part.installedBy && part.installedBy.userProfile && part.installedBy.userProfile.name) {
          const nameParts = part.installedBy.userProfile.name.split(' ');
          part.installedBy.userProfile.firstName = nameParts[0] || '';
          part.installedBy.userProfile.lastName = nameParts.slice(1).join(' ') || '';
          delete part.installedBy.userProfile.name;
        }
        return part;
      });
    }

    // Transform technician names in payments
    if (transformed.payments) {
      transformed.payments = transformed.payments.map((payment: any) => {
        if (payment.processedBy && payment.processedBy.userProfile && payment.processedBy.userProfile.name) {
          const nameParts = payment.processedBy.userProfile.name.split(' ');
          payment.processedBy.userProfile.firstName = nameParts[0] || '';
          payment.processedBy.userProfile.lastName = nameParts.slice(1).join(' ') || '';
          delete payment.processedBy.userProfile.name;
        }
        return payment;
      });
    }

    // Transform technician names in attachments
    if (transformed.attachments) {
      transformed.attachments = transformed.attachments.map((attachment: any) => {
        if (attachment.uploadedBy && attachment.uploadedBy.name) {
          const nameParts = attachment.uploadedBy.name.split(' ');
          attachment.uploadedBy.firstName = nameParts[0] || '';
          attachment.uploadedBy.lastName = nameParts.slice(1).join(' ') || '';
          delete attachment.uploadedBy.name;
        }
        return attachment;
      });
    }

    return transformed;
  }

  // Get work order by ID
  async getWorkOrderById(id: string): Promise<WorkOrderWithDetails | null> {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id },
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
            vin: true,
            imageUrl: true,
          },
        },
        appointment: {
          select: {
            id: true,
            requestedAt: true,
            startTime: true,
            endTime: true,
          },
        },
        serviceAdvisor: {
          select: {
            id: true,
            employeeId: true,
            department: true,
            userProfile: {
              select: {
                id: true,
                name: true,
                phone: true,
                profileImage: true,
              },
            },
          },
        },
        services: {
          include: {
            cannedService: {
              select: {
                id: true,
                code: true,
                name: true,
                description: true,
                duration: true,
                price: true,
              },
            },
          },
        },
        inspections: {
          include: {
            inspector: {
              select: {
                id: true,
                userProfile: {
                  select: {
                    id: true,
                    name: true,
                    profileImage: true,
                  },
                },
              },
            },
          },
        },
        laborItems: {
          include: {
            laborCatalog: {
              select: {
                id: true,
                code: true,
                name: true,
                estimatedMinutes: true,
              },
            },
            technician: {
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
        },
        partsUsed: {
          include: {
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
        },
        payments: {
          include: {
            processedBy: {
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
        },
        attachments: {
          include: {
            uploadedBy: { select: { id: true, name: true } },
          },
        },
        approvals: {
          include: {
            approvedBy: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (workOrder) {
      // Check if work order has inspections and generate inspection PDF URL if it does
      let inspectionPdfUrl: string | undefined;
      if (workOrder.inspections && workOrder.inspections.length > 0) {
        try {
          inspectionPdfUrl = await this.generateInspectionPDF(workOrder.id);
        } catch (error) {
          console.warn('Failed to generate inspection PDF URL:', error);
          // Continue without inspection PDF - don't fail the work order retrieval
        }
      }

      // Add inspectionPdfUrl to the work order object before transformation
      const workOrderWithPdf = {
        ...workOrder,
        inspectionPdfUrl,
      };

      return this.transformWorkOrderForFrontend(workOrderWithPdf);
    }

    return null;
  }

  // Update work order
  async updateWorkOrder(id: string, data: UpdateWorkOrderRequest): Promise<any> {
    const updateData: any = { ...data };

    // Convert date strings to Date objects
    if (data.promisedAt) updateData.promisedAt = new Date(data.promisedAt);
    if (data.openedAt) updateData.openedAt = new Date(data.openedAt);
    if (data.closedAt) updateData.closedAt = new Date(data.closedAt);
    if (data.finalizedAt) updateData.finalizedAt = new Date(data.finalizedAt);

    const workOrder = await this.prisma.workOrder.update({
      where: { id },
      data: updateData,
    });

    return workOrder.id;
  }

  // Soft delete work order (change status to CANCELLED instead of deleting)
  async deleteWorkOrder(id: string): Promise<any> {
    // First check if work order exists
    const existingWorkOrder = await this.prisma.workOrder.findUnique({
      where: { id },
    });

    if (!existingWorkOrder) {
      throw new Error('Work order not found');
    }

    // Check if work order is already cancelled
    if (existingWorkOrder.status === WorkOrderStatus.CANCELLED) {
      throw new Error('Work order is already cancelled');
    }

    // Soft delete by changing status to CANCELLED and updating workflow step
    const cancelledWorkOrder = await this.prisma.workOrder.update({
      where: { id },
      data: {
        status: WorkOrderStatus.CANCELLED,
        workflowStep: WorkflowStep.CLOSED,
        closedAt: new Date(),
        internalNotes: existingWorkOrder.internalNotes 
          ? `${existingWorkOrder.internalNotes}\n\n[CANCELLED] Work order cancelled on ${new Date().toISOString()}`
          : `[CANCELLED] Work order cancelled on ${new Date().toISOString()}`,
      }
    });

    return cancelledWorkOrder;
  }

  async createWorkOrderService(data: CreateWorkOrderServiceRequest) {
    // Validate the canned service exists
    const cannedService = await this.prisma.cannedService.findUnique({
      where: { id: data.cannedServiceId },
      include: {
        laborOperations: {
          include: {
            laborCatalog: true,
          },
        },
      },
    });

    if (!cannedService) {
      throw new Error(`Canned service with ID '${data.cannedServiceId}' not found`);
    }

    // Create the work order service (this is what the customer pays for)
    const service = await this.prisma.workOrderService.create({
      data: {
        ...data,
        quantity: data.quantity || 1,
        unitPrice: data.unitPrice || Number(cannedService.price),
        subtotal: (data.quantity || 1) * Number(data.unitPrice || cannedService.price),
      },
    });

    // Automatically create labor entries for this service (for tracking work, not billing)
    if (cannedService.laborOperations.length > 0) {
      await Promise.all(
        cannedService.laborOperations.map(async (laborOp) => {
          return await this.prisma.workOrderLabor.create({
            data: {
              workOrderId: data.workOrderId,
              serviceId: service.id,  // Link to parent service (REQUIRED)
              laborCatalogId: laborOp.laborCatalogId,
              description: laborOp.laborCatalog.name,
              estimatedMinutes: laborOp.estimatedMinutes || laborOp.laborCatalog.estimatedMinutes,
              notes: laborOp.notes || `Auto-generated from canned service: ${cannedService.name}`,
            },
          });
        })
      );

      return {
        serviceId: service.id,
        message: `Created service and ${cannedService.laborOperations.length} labor entries automatically`,
      };
    }

    return {
      serviceId: service.id,
      message: 'Created service (no labor entries found for this canned service)',
    };
  }

  // Get work order services
  async getWorkOrderServices(workOrderId: string) {
    const services = await this.prisma.workOrderService.findMany({
      where: { workOrderId },
      include: {
        cannedService: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            duration: true,
            price: true,
          },
        },
        laborItems: {
          include: {
            laborCatalog: {
              select: {
                id: true,
                code: true,
                name: true,
                description: true,
                estimatedMinutes: true,
              },
            },
            technician: {
              select: {
                id: true,
                employeeId: true,
                userProfile: {
                  select: {
                    id: true,
                    name: true,
                    profileImage: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return services;
  }

  // Create payment
  async createPayment(data: CreatePaymentRequest) {
    const payment = await this.prisma.payment.create({
      data: {
        ...data,
        status: PaymentStatus.PAID,
      },
      include: {
        processedBy: {
          select: {
            id: true,
            employeeId: true,
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

    // Update work order payment status
    await this.updateWorkOrderPaymentStatus(data.workOrderId);

    return payment;
  }

  // Get work order payments
  async getWorkOrderPayments(workOrderId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { workOrderId },
      include: {
        processedBy: {
          select: {
            id: true,
            employeeId: true,
            userProfile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        paidAt: 'desc',
      },
    });

    return payments;
  }

  // Update work order status
  async updateWorkOrderStatus(id: string, status: WorkOrderStatus, workflowStep?: WorkflowStep) {
    // Get the current work order with customer and vehicle details (needed for notification)
    const existingWorkOrder = await this.prisma.workOrder.findUnique({
      where: { id },
      include: {
        customer: { 
          select: { 
            id: true, 
            name: true, 
            email: true, 
            phone: true,
            userProfile: { select: { id: true } }
          } 
        },
        vehicle: { select: { make: true, model: true, year: true } },
      },
    });

    if (!existingWorkOrder) {
      throw new Error('Work order not found');
    }

    const oldStatus = existingWorkOrder.status; // Store old status for comparison

    const updateData: any = { status };

    if (workflowStep) {
      updateData.workflowStep = workflowStep;
    }

    // Set openedAt when status changes to IN_PROGRESS
    if (status === WorkOrderStatus.IN_PROGRESS) {
      updateData.openedAt = new Date();
    }

    // Set closedAt when status changes to COMPLETED
    if (status === WorkOrderStatus.COMPLETED) {
      updateData.closedAt = new Date();
    }

    // Update the work order status
    const workOrder = await this.prisma.workOrder.update({
      where: { id },
      data: updateData,
    });

    // Send notification if status actually changed
    if (oldStatus !== status && existingWorkOrder.customer.email) {
      try {
        // Determine the event type based on the new status
        let eventType = NotificationEventType.WORK_ORDER_STATUS_CHANGED;
        let priority = NotificationPriority.NORMAL;

        if (status === WorkOrderStatus.COMPLETED) {
          eventType = NotificationEventType.WORK_ORDER_COMPLETED;
          priority = NotificationPriority.HIGH;
        }

        // Send the notification
        await this.notificationService.sendNotification({
          eventType,
          recipient: {
            userProfileId: existingWorkOrder.customer.userProfile?.id,
            email: existingWorkOrder.customer.email,
            name: existingWorkOrder.customer.name,
            phone: existingWorkOrder.customer.phone || undefined,
          },
          data: {
            workOrderId: workOrder.id,
            workOrderNumber: workOrder.workOrderNumber,
            customerName: existingWorkOrder.customer.name,
            customerEmail: existingWorkOrder.customer.email || undefined,
            customerPhone: existingWorkOrder.customer.phone || undefined,
            vehicleMake: existingWorkOrder.vehicle.make,
            vehicleModel: existingWorkOrder.vehicle.model,
            vehicleYear: existingWorkOrder.vehicle.year || undefined,
            status: status,
            oldStatus: oldStatus,
            estimatedTotal: workOrder.estimatedTotal ? Number(workOrder.estimatedTotal) : undefined,
            promisedDate: workOrder.promisedAt || undefined,
          },
          channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
          priority,
        });

        console.log(`✅ Notification sent: Work order ${workOrder.workOrderNumber} status changed from ${oldStatus} to ${status}`);
      } catch (notificationError) {
        // Log error but don't fail the status update
        console.error('Failed to send notification:', notificationError);
      }
    }

    return workOrder;
  }

  // Update work order workflow step only
  async updateWorkOrderWorkflowStep(id: string, workflowStep: WorkflowStep) {
    // Verify work order exists
    const existingWorkOrder = await this.prisma.workOrder.findUnique({
      where: { id },
    });

    if (!existingWorkOrder) {
      throw new Error('Work order not found');
    }

    // Update only the workflow step
    const workOrder = await this.prisma.workOrder.update({
      where: { id },
      data: { workflowStep },
    });

    return workOrder;
  }

  // Assign service advisor to work order
  async assignServiceAdvisor(id: string, advisorId: string) {
    const workOrder = await this.prisma.workOrder.update({
      where: { id },
      data: { advisorId },
    });

    return workOrder;
  }

  // Assign technician to specific labor item
  async assignTechnicianToLabor(laborId: string, technicianId: string) {
    const laborItem = await this.prisma.workOrderLabor.update({
      where: { id: laborId },
      data: { technicianId },
      include: {
        technician: {
          select: {
            id: true,
            employeeId: true,
            userProfile: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
          },
        },
      },
    });

    return laborItem;
  }

  // Assign technician to all labor items of a service (bulk assignment)
  async assignTechnicianToServiceLabor(serviceId: string, technicianId: string) {
    // Verify service exists
    const service = await this.prisma.workOrderService.findUnique({
      where: { id: serviceId },
      include: {
        laborItems: true,
      },
    });

    if (!service) {
      throw new Error(`WorkOrderService with id ${serviceId} not found`);
    }

    // Verify technician exists
    const technician = await this.prisma.technician.findUnique({
      where: { id: technicianId },
    });

    if (!technician) {
      throw new Error(`Technician with id ${technicianId} not found`);
    }

    // Update all labor items for this service
    await this.prisma.workOrderLabor.updateMany({
      where: { serviceId },
      data: { technicianId },
    });

    // Fetch updated labor items with technician details
    const updatedLaborItems = await this.prisma.workOrderLabor.findMany({
      where: { serviceId },
      include: {
        technician: {
          select: {
            id: true,
            employeeId: true,
            userProfile: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
        laborCatalog: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return {
      serviceId,
      technicianId,
      assignedCount: updatedLaborItems.length,
      laborItems: updatedLaborItems,
    };
  }

  // Update work order labor item
  async updateWorkOrderLabor(laborId: string, data: UpdateWorkOrderLaborRequest) {
    // Update the labor item (no subtotal - labor is for tracking only)
    const updatedLabor = await this.prisma.workOrderLabor.update({
      where: { id: laborId },
      data: {
        ...data,
      },
      include: {
        service: { select: { id: true, status: true } },
        workOrder: { select: { id: true } },
      },
    });

    // If labor status changed to IN_PROGRESS or COMPLETED, update parent service status
    if (data.status) {
      const serviceId = updatedLabor.service.id;
      
      // Get all labor items for this service
      const serviceLaborItems = await this.prisma.workOrderLabor.findMany({
        where: { serviceId },
        select: { status: true },
      });

      // Determine service status based on labor statuses
      const allLaborsCompleted = serviceLaborItems.every(l => l.status === ServiceStatus.COMPLETED);
      const anyLaborInProgress = serviceLaborItems.some(l => l.status === ServiceStatus.IN_PROGRESS);

      let newServiceStatus: ServiceStatus | null = null;
      if (allLaborsCompleted) {
        newServiceStatus = ServiceStatus.COMPLETED;
      } else if (anyLaborInProgress && updatedLabor.service.status !== ServiceStatus.IN_PROGRESS) {
        newServiceStatus = ServiceStatus.IN_PROGRESS;
      }

      // Update service status if it changed
      if (newServiceStatus) {
        await this.prisma.workOrderService.update({
          where: { id: serviceId },
          data: { status: newServiceStatus },
        });
      }

      // Auto-update work order status
      await this.autoUpdateWorkOrderStatus(updatedLabor.workOrder.id);
    }

    return { id: laborId };
  }

  // REMOVED: updateWorkOrderServiceSubtotal()
  // Services have fixed prices (unitPrice × quantity), not calculated from labor
  // Labor is for tracking work only, not for billing

  // Helper method to update work order totals
  // NOTE: Only services and parts are billable. Labor is for tracking only.
  private async updateWorkOrderTotals(workOrderId: string) {
    const [partItems, serviceItems] = await Promise.all([
      this.prisma.workOrderPart.findMany({
        where: { workOrderId },
        select: { subtotal: true },
      }),
      this.prisma.workOrderService.findMany({
        where: { workOrderId },
        select: { subtotal: true },
      }),
    ]);

    const subtotalParts = partItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
    const subtotalServices = serviceItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
    const subtotal = subtotalParts + subtotalServices;

    // Get existing tax and discount amounts
    const existingWorkOrder = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
      select: { taxAmount: true, discountAmount: true },
    });

    const taxAmount = Number(existingWorkOrder?.taxAmount || 0);
    const discountAmount = Number(existingWorkOrder?.discountAmount || 0);
    const totalAmount = subtotal + taxAmount - discountAmount;

    await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        subtotalServices,
        subtotalParts,
        subtotal,
        totalAmount,
      },
    });
  }

  /**
   * Auto-update work order status based on services and parts state
   * Called after service/part approval, work start/completion
   */
  private async autoUpdateWorkOrderStatus(workOrderId: string) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        services: { select: { customerApproved: true, customerRejected: true, status: true } },
        partsUsed: { select: { customerApproved: true, customerRejected: true, installedAt: true } },
      },
    });

    if (!workOrder) return;

    // Don't auto-update if status is CANCELLED, INVOICED, or PAID
    const finalStatuses: WorkOrderStatus[] = [WorkOrderStatus.CANCELLED, WorkOrderStatus.INVOICED, WorkOrderStatus.PAID];
    if (finalStatuses.includes(workOrder.status)) {
      return;
    }

    const hasServices = workOrder.services.length > 0;
    const hasParts = workOrder.partsUsed.length > 0;
    const hasItems = hasServices || hasParts;

    if (!hasItems) {
      // No items yet - keep as PENDING
      if (workOrder.status !== WorkOrderStatus.PENDING) {
        await this.prisma.workOrder.update({
          where: { id: workOrderId },
          data: { status: WorkOrderStatus.PENDING },
        });
      }
      return;
    }

    // Check if all non-rejected services are approved
    const nonRejectedServices = workOrder.services.filter(s => !s.customerRejected);
    const allServicesApproved = nonRejectedServices.every(s => s.customerApproved);

    // Check if all non-rejected parts are approved
    const nonRejectedParts = workOrder.partsUsed.filter(p => !p.customerRejected);
    const allPartsApproved = nonRejectedParts.every(p => p.customerApproved);

    // Check if any work has started
    const anyServiceInProgress = workOrder.services.some(s => 
      s.status === ServiceStatus.IN_PROGRESS || s.status === ServiceStatus.COMPLETED
    );
    const anyPartInstalled = workOrder.partsUsed.some(p => p.installedAt !== null);
    const workStarted = anyServiceInProgress || anyPartInstalled;

    // Check if all work is completed
    const allServicesCompleted = nonRejectedServices.every(s => 
      s.status === ServiceStatus.COMPLETED || s.status === ServiceStatus.CANCELLED
    );
    const allPartsInstalled = nonRejectedParts.every(p => p.installedAt !== null);
    const allWorkCompleted = (nonRejectedServices.length === 0 || allServicesCompleted) && 
                             (nonRejectedParts.length === 0 || allPartsInstalled);

    // Determine new status
    let newStatus: WorkOrderStatus | null = null;

    if (allWorkCompleted && workOrder.status === WorkOrderStatus.IN_PROGRESS) {
      newStatus = WorkOrderStatus.COMPLETED;
    } else if (workStarted && workOrder.status === WorkOrderStatus.APPROVED) {
      newStatus = WorkOrderStatus.IN_PROGRESS;
    } else if (allServicesApproved && allPartsApproved && workOrder.status === WorkOrderStatus.AWAITING_APPROVAL) {
      newStatus = WorkOrderStatus.APPROVED;
    } else if (hasItems && workOrder.status === WorkOrderStatus.PENDING) {
      newStatus = WorkOrderStatus.AWAITING_APPROVAL;
    }

    // Update status if it changed
    if (newStatus && newStatus !== workOrder.status) {
      await this.prisma.workOrder.update({
        where: { id: workOrderId },
        data: { 
          status: newStatus,
          ...(newStatus === WorkOrderStatus.IN_PROGRESS && { openedAt: new Date() }),
          ...(newStatus === WorkOrderStatus.COMPLETED && { closedAt: new Date() }),
        },
      });
      
      console.log(`✅ Auto-updated work order ${workOrderId} status: ${workOrder.status} → ${newStatus}`);
    }
  }

  // REMOVED: resetWorkOrderLaborSubtotal()
  // Labor items don't have subtotals in the new architecture
  // Labor is for tracking work only, not for billing
  async resetWorkOrderLaborSubtotal(laborId: string) {
    throw new Error('Method not supported: Labor items no longer have subtotals. Services have the pricing.');
  }

  // STUB KEPT: Method exists in interface/controller but should not be used
  // TODO: Remove from interface and controller in future cleanup
  private __resetWorkOrderLaborSubtotal_REMOVED__() {
    // Original implementation removed - labor has no subtotals anymore
    return {
      message: 'This method has been deprecated. Labor items no longer have subtotals in the service-based pricing model.',
    };
  }

  // Get work order statistics
  async getWorkOrderStatistics(filters: { startDate?: Date; endDate?: Date }): Promise<WorkOrderStatistics> {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [
      totalWorkOrders,
      pendingWorkOrders,
      inProgressWorkOrders,
      completedWorkOrders,
      cancelledWorkOrders,
      totalRevenue,
      topTechnicians,
      topServices,
    ] = await Promise.all([
      this.prisma.workOrder.count({ where }),
      this.prisma.workOrder.count({ where: { ...where, status: WorkOrderStatus.PENDING } }),
      this.prisma.workOrder.count({ where: { ...where, status: WorkOrderStatus.IN_PROGRESS } }),
      this.prisma.workOrder.count({ where: { ...where, status: WorkOrderStatus.COMPLETED } }),
      this.prisma.workOrder.count({ where: { ...where, status: WorkOrderStatus.CANCELLED } }),
      this.prisma.workOrder.aggregate({
        where: { ...where, status: WorkOrderStatus.COMPLETED },
        _sum: { totalAmount: true },
      }),
      this.prisma.workOrderLabor.groupBy({
        by: ['technicianId'],
        where: { workOrder: where },
        _sum: { estimatedMinutes: true, actualMinutes: true },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      this.prisma.workOrderService.groupBy({
        by: ['cannedServiceId'],
        where: { workOrder: where },
        _sum: { subtotal: true },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    // Get technician names
    const technicianIds = topTechnicians.map(t => t.technicianId).filter(Boolean) as string[];
    const technicians = await this.prisma.technician.findMany({
      where: { id: { in: technicianIds } },
      select: {
        id: true,
        userProfile: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get service names
    const serviceIds = topServices.map(s => s.cannedServiceId).filter(Boolean) as string[];
    const services = await this.prisma.cannedService.findMany({
      where: { id: { in: serviceIds } },
      select: {
        id: true,
        name: true,
      },
    });

    const statistics: WorkOrderStatistics = {
      totalWorkOrders,
      pendingWorkOrders,
      inProgressWorkOrders,
      completedWorkOrders,
      cancelledWorkOrders,
      totalRevenue: Number(totalRevenue._sum.totalAmount) || 0,
      averageCompletionTime: 0, // TODO: Calculate average completion time
      topTechnicians: topTechnicians.map(t => {
        const technician = technicians.find(tech => tech.id === t.technicianId);
        const estimatedMins = Number(t._sum?.estimatedMinutes || 0);
        const actualMins = Number(t._sum?.actualMinutes || 0);
        const totalMinutes = actualMins > 0 ? actualMins : estimatedMins;
        const totalHours = Math.round((totalMinutes / 60) * 100) / 100;  // Convert to hours with 2 decimals
        return {
          technicianId: t.technicianId || '',
          technicianName: technician?.userProfile?.name || 'Unknown',
          completedWorkOrders: t._count?.id || 0,
          totalHours,
        };
      }),
      topServices: topServices.map(s => {
        const service = services.find(serv => serv.id === s.cannedServiceId);
        return {
          serviceId: s.cannedServiceId || '',
          serviceName: service?.name || 'Unknown',
          usageCount: s._count.id,
          totalRevenue: Number(s._sum.subtotal) || 0,
        };
      }),
    };

    return statistics;
  }

  // Get work order creation statistics for the last 7 days
  async getWorkOrderCreationStats(): Promise<WorkOrderCreationStats> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all work orders created in the last 7 days
    const workOrders = await this.prisma.workOrder.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const dailyCounts: { [date: string]: number } = {};
    workOrders.forEach(workOrder => {
      const date = workOrder.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD format
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    // Calculate statistics
    const totalWorkOrders = workOrders.length;
    const averageDaily = Math.round((totalWorkOrders / 7) * 100) / 100; // Round to 2 decimal places
    const peakDaily = Math.max(...Object.values(dailyCounts), 0);

    // Create daily breakdown array
    const dailyBreakdown = Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count,
    }));

    // Fill in missing dates with 0
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      if (!dailyCounts[dateStr]) {
        dailyBreakdown.push({ date: dateStr, count: 0 });
      }
    }

    // Sort by date
    dailyBreakdown.sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalWorkOrders,
      averageDaily,
      peakDaily,
      dailyBreakdown,
    };
  }

  // Get general statistics (customers, vehicles, technicians)
  async getGeneralStats(): Promise<GeneralStats> {
    const [totalCustomers, totalVehicles, totalTechnicians] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.vehicle.count(),
      this.prisma.technician.count(),
    ]);

    return {
      totalCustomers,
      totalVehicles,
      totalTechnicians,
    };
  }

  // Search work orders
  async searchWorkOrders(query: string, filters: WorkOrderFilters) {
    const where: any = {
      OR: [
        { workOrderNumber: { contains: query, mode: 'insensitive' } },
        { complaint: { contains: query, mode: 'insensitive' } },
        { internalNotes: { contains: query, mode: 'insensitive' } },
        { customerNotes: { contains: query, mode: 'insensitive' } },
        {
          customer: {
            name: { contains: query, mode: 'insensitive' },
          },
        },
        {
          vehicle: {
            make: { contains: query, mode: 'insensitive' },
          },
        },
        {
          vehicle: {
            model: { contains: query, mode: 'insensitive' },
          },
        },
        {
          vehicle: {
            licensePlate: { contains: query, mode: 'insensitive' },
          },
        },
      ],
    };

    // Apply additional filters
    if (filters.status) where.status = filters.status;
    if (filters.jobType) where.jobType = filters.jobType;
    if (filters.priority) where.priority = filters.priority;
    if (filters.source) where.source = filters.source;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters.advisorId) where.advisorId = filters.advisorId;
    if (filters.workflowStep) where.workflowStep = filters.workflowStep;
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const workOrders = await this.prisma.workOrder.findMany({
      where,
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
            vin: true,
          },
        },
        serviceAdvisor: {
          select: {
            id: true,
            employeeId: true,
            userProfile: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return workOrders;
  }

  // Upload work order attachment
  async uploadWorkOrderAttachment(workOrderId: string, data: {
    fileUrl: string;
    fileName?: string;
    fileType: string;
    fileSize?: number;
    description?: string;
    category: AttachmentCategory;
    uploadedById?: string;
  }) {
    const attachment = await this.prisma.workOrderAttachment.create({
      data: {
        workOrderId,
        ...data,
      },
    });

    return attachment;
  }

  // Get work order attachments
  async getWorkOrderAttachments(workOrderId: string, category?: string) {
    const where: any = { workOrderId };

    if (category) {
      where.category = category;
    }

    const attachments = await this.prisma.workOrderAttachment.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return attachments;
  }

  // Create work order inspection
  async createWorkOrderInspection(workOrderId: string, inspectorId: string, notes?: string) {
    const inspection = await this.prisma.workOrderInspection.create({
      data: {
        workOrderId,
        inspectorId,
        notes,
      },
      include: {
        inspector: {
          select: {
            id: true,
            employeeId: true,
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

    return inspection;
  }

  // Get work order inspections
  async getWorkOrderInspections(workOrderId: string) {
    const inspections = await this.prisma.workOrderInspection.findMany({
      where: { workOrderId },
      include: {
        inspector: {
          select: {
            id: true,
            employeeId: true,
            userProfile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        checklistItems: true,
        tireChecks: true,
        attachments: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return inspections;
  }

  // Create work order QC
  async createWorkOrderQC(workOrderId: string, data: {
    passed: boolean;
    inspectorId?: string;
    notes?: string;
    reworkRequired?: boolean;
    reworkNotes?: string;
  }) {
    const qc = await this.prisma.workOrderQC.create({
      data: {
        workOrderId,
        ...data,
      },
      include: {
        inspector: {
          select: {
            id: true,
            employeeId: true,
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

    return qc;
  }

  // Get work order QC
  async getWorkOrderQC(workOrderId: string) {
    const qc = await this.prisma.workOrderQC.findMany({
      where: { workOrderId },
      include: {
        inspector: {
          select: {
            id: true,
            employeeId: true,
            userProfile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        qcDate: 'desc',
      },
    });

    return qc;
  }

  // Customer Approval Methods

  // Approve a service (and all its labor items)
  async approveService(serviceId: string, customerId: string, notes?: string) {
    const service = await this.prisma.workOrderService.findUnique({
      where: { id: serviceId },
      include: { workOrder: true },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    // Verify customer owns this work order
    if (service.workOrder.customerId !== customerId) {
      throw new Error('Unauthorized: This service does not belong to your work order');
    }

    // Update service approval
    await this.prisma.workOrderService.update({
      where: { id: serviceId },
      data: {
        customerApproved: true,
        customerRejected: false,
        approvedAt: new Date(),
        customerNotes: notes,
        status: ServiceStatus.PENDING, // Ready to start work
      },
    });

    // Recalculate work order totals
    await this.updateWorkOrderTotals(service.workOrderId);

    // Auto-update work order status if all items approved
    await this.autoUpdateWorkOrderStatus(service.workOrderId);

    return { message: 'Service approved successfully' };
  }

  // Reject a service
  async rejectService(serviceId: string, customerId: string, reason?: string) {
    const service = await this.prisma.workOrderService.findUnique({
      where: { id: serviceId },
      include: { workOrder: true },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    // Verify customer owns this work order
    if (service.workOrder.customerId !== customerId) {
      throw new Error('Unauthorized: This service does not belong to your work order');
    }

    // Update service rejection
    await this.prisma.workOrderService.update({
      where: { id: serviceId },
      data: {
        customerApproved: false,
        customerRejected: true,
        rejectedAt: new Date(),
        customerNotes: reason,
        status: ServiceStatus.CANCELLED,
      },
    });

    // Recalculate work order totals
    await this.updateWorkOrderTotals(service.workOrderId);

    return { message: 'Service rejected' };
  }

  // Approve a part
  async approvePart(partId: string, customerId: string, notes?: string) {
    const part = await this.prisma.workOrderPart.findUnique({
      where: { id: partId },
      include: { workOrder: true },
    });

    if (!part) {
      throw new Error('Part not found');
    }

    // Verify customer owns this work order
    if (part.workOrder.customerId !== customerId) {
      throw new Error('Unauthorized: This part does not belong to your work order');
    }

    // Update part approval
    await this.prisma.workOrderPart.update({
      where: { id: partId },
      data: {
        customerApproved: true,
        customerRejected: false,
        approvedAt: new Date(),
        customerNotes: notes,
      },
    });

    // Recalculate work order totals
    await this.updateWorkOrderTotals(part.workOrderId);

    // Auto-update work order status if all items approved
    await this.autoUpdateWorkOrderStatus(part.workOrderId);

    return { message: 'Part approved successfully' };
  }

  // Reject a part
  async rejectPart(partId: string, customerId: string, reason?: string) {
    const part = await this.prisma.workOrderPart.findUnique({
      where: { id: partId },
      include: { workOrder: true },
    });

    if (!part) {
      throw new Error('Part not found');
    }

    // Verify customer owns this work order
    if (part.workOrder.customerId !== customerId) {
      throw new Error('Unauthorized: This part does not belong to your work order');
    }

    // Update part rejection
    await this.prisma.workOrderPart.update({
      where: { id: partId },
      data: {
        customerApproved: false,
        customerRejected: true,
        rejectedAt: new Date(),
        customerNotes: reason,
      },
    });

    // Recalculate work order totals
    await this.updateWorkOrderTotals(part.workOrderId);

    return { message: 'Part rejected' };
  }

  // Get pending items (services and parts) awaiting customer approval
  async getPendingApprovals(workOrderId: string, customerId: string) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
    });

    if (!workOrder) {
      throw new Error('Work order not found');
    }

    // Verify customer owns this work order
    if (workOrder.customerId !== customerId) {
      throw new Error('Unauthorized: This work order does not belong to you');
    }

    const [services, parts] = await Promise.all([
      this.prisma.workOrderService.findMany({
        where: {
          workOrderId,
          customerApproved: false,
          customerRejected: false,
          status: ServiceStatus.ESTIMATED,
        },
        include: {
          cannedService: true,
          laborItems: {
            include: {
              laborCatalog: true,
            },
          },
        },
      }),
      this.prisma.workOrderPart.findMany({
        where: {
          workOrderId,
          customerApproved: false,
          customerRejected: false,
        },
        include: {
          part: true,
        },
      }),
    ]);

    return {
      services,
      parts,
      totalPending: services.length + parts.length,
    };
  }

  // Part Installation Management

  // Assign technician to a part
  async assignTechnicianToPart(partId: string, technicianId: string) {
    const part = await this.prisma.workOrderPart.findUnique({
      where: { id: partId },
      include: { workOrder: true },
    });

    if (!part) {
      throw new Error('Part not found');
    }

    // Update part with technician assignment
    const updatedPart = await this.prisma.workOrderPart.update({
      where: { id: partId },
      data: { installedById: technicianId },
      include: {
        installedBy: {
          select: {
            id: true,
            employeeId: true,
            userProfile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
          },
        },
      },
    });

    return updatedPart;
  }

  // Start part installation (technician marks work started)
  async startPartInstallation(partId: string, technicianId: string) {
    const part = await this.prisma.workOrderPart.findUnique({
      where: { id: partId },
    });

    if (!part) {
      throw new Error('Part not found');
    }

    // Verify technician is assigned to this part
    if (part.installedById !== technicianId) {
      throw new Error('Unauthorized: You are not assigned to install this part');
    }

    // Update part to mark installation started
    await this.prisma.workOrderPart.update({
      where: { id: partId },
      data: {
        // You could add a status field if needed, for now just confirm assignment
      },
    });

    return { message: 'Part installation started' };
  }

  // Complete part installation
  async completePartInstallation(partId: string, technicianId: string, data: { notes?: string; warrantyInfo?: string }) {
    const part = await this.prisma.workOrderPart.findUnique({
      where: { id: partId },
    });

    if (!part) {
      throw new Error('Part not found');
    }

    // Verify technician is assigned to this part
    if (part.installedById !== technicianId) {
      throw new Error('Unauthorized: You are not assigned to install this part');
    }

    // Update part to mark installation complete
    const updatedPart = await this.prisma.workOrderPart.update({
      where: { id: partId },
      data: {
        installedAt: new Date(),
        notes: data.notes,
        warrantyInfo: data.warrantyInfo,
      },
      select: { workOrderId: true },
    });

    // Auto-update work order status when part is installed
    await this.autoUpdateWorkOrderStatus(updatedPart.workOrderId);

    return { message: 'Part installation completed successfully' };
  }

  // Get technician's active work (started but not finished)
  async getTechnicianActiveWork(technicianId: string) {
    // Get active labor items (started but not completed)
    const activeLabor = await this.prisma.workOrderLabor.findMany({
      where: {
        technicianId,
        OR: [
          {
            // Labor that has been started (has start time) but not ended
            startTime: { not: null },
            endTime: null,
          },
          {
            // Labor that is marked as IN_PROGRESS
            status: 'IN_PROGRESS',
          },
        ],
      },
      include: {
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
            status: true,
            customer: {
              select: {
                id: true,
                name: true,
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
        service: {
          select: {
            id: true,
            description: true,
            cannedService: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        laborCatalog: {
          select: {
            id: true,
            name: true,
            code: true,
            estimatedMinutes: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    // Get active parts (assigned and started but not installed)
    const activeParts = await this.prisma.workOrderPart.findMany({
      where: {
        installedById: technicianId,
        installedAt: null, // Not yet completed
      },
      include: {
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
            status: true,
            customer: {
              select: {
                id: true,
                name: true,
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
        part: {
          select: {
            id: true,
            name: true,
            sku: true,
            partNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      technicianId,
      activeLabor,
      activeParts,
      totalActiveTasks: activeLabor.length + activeParts.length,
      summary: {
        activeLaborCount: activeLabor.length,
        activePartsCount: activeParts.length,
      },
    };
  }

  // Helper method to find ServiceAdvisor by Supabase user ID
  async findServiceAdvisorBySupabaseUserId(supabaseUserId: string) {
    const serviceAdvisor = await this.prisma.serviceAdvisor.findFirst({
      where: {
        userProfile: {
          supabaseUserId: supabaseUserId
        }
      }
    });

    return serviceAdvisor;
  }

  // Helper method to find Technician by Supabase user ID
  async findTechnicianBySupabaseUserId(supabaseUserId: string) {
    const technician = await this.prisma.technician.findFirst({
      where: {
        userProfile: {
          supabaseUserId: supabaseUserId
        }
      }
    });

    return technician;
  }

  // Helper method to update work order payment status
  private async updateWorkOrderPaymentStatus(workOrderId: string) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        payments: true,
      },
    });

    if (!workOrder) return;

    const totalPaid = workOrder.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const totalAmount = Number(workOrder.totalAmount || 0);

    let paymentStatus: PaymentStatus;
    if (totalPaid >= totalAmount) {
      paymentStatus = PaymentStatus.PAID;
    } else if (totalPaid > 0) {
      paymentStatus = PaymentStatus.PARTIALLY_PAID;
    } else {
      paymentStatus = PaymentStatus.PENDING;
    }

    await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: { paymentStatus },
    });
  }
}



