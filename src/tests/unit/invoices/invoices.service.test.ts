import { InvoicesService } from '../../../modules/invoices/invoices.service';
import { PrismaClient, InvoiceStatus, LineItemType } from '@prisma/client';
import { CreateInvoiceRequest, UpdateInvoiceRequest, InvoiceFilters } from '../../../modules/invoices/invoices.types';

// Mock Prisma Client
jest.mock('@prisma/client');

// Mock pdfMake
jest.mock('pdfmake/build/pdfmake', () => ({
  createPdf: jest.fn().mockReturnValue({
    getBuffer: jest.fn((callback) => callback(Buffer.from('mock-pdf-content')))
  })
}));

// Mock pdfmake vfs_fonts
jest.mock('pdfmake/build/vfs_fonts', () => ({
  pdfMake: {
    vfs: {}
  }
}));

// Mock StorageService
jest.mock('../../../modules/storage/storage.service', () => ({
  StorageService: {
    uploadInvoicePDF: jest.fn().mockResolvedValue({
      success: true,
      url: 'https://storage.example.com/invoice.pdf'
    })
  }
}));

describe('InvoicesService', () => {
  let invoicesService: InvoicesService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    invoicesService = new InvoicesService(mockPrisma);
  });

  describe('generateInvoiceNumber', () => {
    it('should generate unique invoice number', async () => {
      // Mock current date
      const mockDate = new Date('2024-01-15T10:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      mockPrisma.invoice.count.mockResolvedValue(5);

      const result = await (invoicesService as any).generateInvoiceNumber();

      expect(result).toBe('INV-202401-0006');
      expect(mockPrisma.invoice.count).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: expect.any(Date),
            lte: expect.any(Date)
          }
        }
      });
    });
  });

  describe('createInvoice', () => {
    it('should create invoice successfully', async () => {
      // Arrange
      const invoiceData: CreateInvoiceRequest = {
        workOrderId: 'wo123',
        dueDate: new Date('2024-02-15'),
        notes: 'Test invoice',
        terms: 'Payment due within 30 days'
      };

      const mockWorkOrder = {
        id: 'wo123',
        workOrderNumber: 'WO-001',
        discountAmount: 10,
        discountType: 'FIXED',
        services: [
          { id: 's1', description: 'Oil Change', quantity: 1, unitPrice: 50, subtotal: 50, cannedService: { name: 'Oil Change' } }
        ],
        laborItems: [],
        partsUsed: [
          { id: 'p1', part: { name: 'Oil Filter', sku: 'OF001' }, quantity: 1, unitPrice: 25, subtotal: 25 }
        ],
        customer: { id: 'c1', name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
        vehicle: { id: 'v1', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' }
      };

      const mockInvoice = {
        id: 'inv123',
        invoiceNumber: 'INV-202401-0001',
        workOrderId: 'wo123',
        subtotalServices: 50,
        subtotalParts: 25,
        subtotal: 75,
        taxAmount: 13.5,
        discountAmount: 10,
        totalAmount: 78.5,
        status: InvoiceStatus.DRAFT
      };

      mockPrisma.workOrder.findUnique.mockResolvedValue(mockWorkOrder as any);
      mockPrisma.invoice.findFirst.mockResolvedValue(null);
      mockPrisma.invoice.count.mockResolvedValue(0);
      mockPrisma.invoice.create.mockResolvedValue(mockInvoice as any);
      mockPrisma.invoiceLineItem.create.mockResolvedValue({} as any);
      mockPrisma.workOrder.update.mockResolvedValue({} as any);
      mockPrisma.invoice.update.mockResolvedValue({} as any);

      // Act
      const result = await invoicesService.createInvoice(invoiceData);

      // Assert
      expect(mockPrisma.workOrder.findUnique).toHaveBeenCalledWith({
        where: { id: 'wo123' },
        include: expect.any(Object)
      });
      expect(mockPrisma.invoice.create).toHaveBeenCalled();
      expect(mockPrisma.invoiceLineItem.create).toHaveBeenCalledTimes(3); // Service, part, tax
      expect(mockPrisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: 'wo123' },
        data: { status: 'INVOICED' }
      });
      expect(result.id).toBe('inv123');
    });

    it('should throw error when work order not found', async () => {
      // Arrange
      const invoiceData: CreateInvoiceRequest = {
        workOrderId: 'nonexistent'
      };

      mockPrisma.workOrder.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(invoicesService.createInvoice(invoiceData)).rejects.toThrow('WorkOrder with ID nonexistent not found');
    });

    it('should throw error when invoice already exists', async () => {
      // Arrange
      const invoiceData: CreateInvoiceRequest = {
        workOrderId: 'wo123'
      };

      const mockWorkOrder = { id: 'wo123' };
      const existingInvoice = { id: 'inv123' };

      mockPrisma.workOrder.findUnique.mockResolvedValue(mockWorkOrder as any);
      mockPrisma.invoice.findFirst.mockResolvedValue(existingInvoice as any);

      // Act & Assert
      await expect(invoicesService.createInvoice(invoiceData)).rejects.toThrow('Invoice already exists for this work order');
    });

    it('should handle percentage discount correctly', async () => {
      // Arrange
      const invoiceData: CreateInvoiceRequest = {
        workOrderId: 'wo123'
      };

      const mockWorkOrder = {
        id: 'wo123',
        discountAmount: 10, // 10% discount
        discountType: 'PERCENTAGE',
        services: [
          { id: 's1', description: 'Service', quantity: 1, unitPrice: 100, subtotal: 100 }
        ],
        laborItems: [],
        partsUsed: [],
        customer: { id: 'c1', name: 'John Doe' },
        vehicle: { id: 'v1', make: 'Toyota', model: 'Camry' }
      };

      mockPrisma.workOrder.findUnique.mockResolvedValue(mockWorkOrder as any);
      mockPrisma.invoice.findFirst.mockResolvedValue(null);
      mockPrisma.invoice.count.mockResolvedValue(0);
      mockPrisma.invoice.create.mockResolvedValue({
        id: 'inv123',
        invoiceNumber: 'INV-202401-0001',
        subtotalServices: 100,
        subtotalParts: 0,
        subtotal: 100,
        taxAmount: 16.2, // 18% of 90 (after 10% discount)
        discountAmount: 10,
        totalAmount: 96.2
      } as any);
      mockPrisma.invoiceLineItem.create.mockResolvedValue({} as any);
      mockPrisma.workOrder.update.mockResolvedValue({} as any);
      mockPrisma.invoice.update.mockResolvedValue({} as any);

      // Act
      await invoicesService.createInvoice(invoiceData);

      // Assert
      expect(mockPrisma.invoice.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          subtotal: 100,
          discountAmount: 10,
          taxAmount: 16.2, // 18% of 90
          totalAmount: 96.2
        })
      });
    });
  });

  describe('getInvoiceById', () => {
    it('should return invoice with details', async () => {
      // Arrange
      const invoiceId = 'inv123';
      const mockInvoice = {
        id: invoiceId,
        invoiceNumber: 'INV-202401-0001',
        workOrderId: 'wo123',
        subtotalServices: 50,
        subtotalParts: 25,
        subtotal: 75,
        taxAmount: 13.5,
        discountAmount: 10,
        totalAmount: 78.5,
        workOrder: {
          id: 'wo123',
          customer: { id: 'c1', name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
          vehicle: { id: 'v1', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' }
        },
        lineItems: [
          { id: 'li1', type: LineItemType.SERVICE, description: 'Oil Change', quantity: 1, unitPrice: 50, subtotal: 50 }
        ]
      };

      mockPrisma.invoice.findUnique.mockResolvedValue(mockInvoice as any);

      // Act
      const result = await invoicesService.getInvoiceById(invoiceId);

      // Assert
      expect(mockPrisma.invoice.findUnique).toHaveBeenCalledWith({
        where: { id: invoiceId },
        include: expect.any(Object)
      });
      expect(result.id).toBe(invoiceId);
      expect(result.subtotalServices).toBe(50);
      expect(result.lineItems).toHaveLength(1);
    });

    it('should throw error when invoice not found', async () => {
      // Arrange
      const invoiceId = 'nonexistent';
      mockPrisma.invoice.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(invoicesService.getInvoiceById(invoiceId)).rejects.toThrow('Invoice with ID nonexistent not found');
    });
  });

  describe('getInvoices', () => {
    it('should return invoices with filters and pagination', async () => {
      // Arrange
      const filters: InvoiceFilters = {
        workOrderId: 'wo123',
        status: InvoiceStatus.SENT,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };

      const mockInvoices = [
        {
          id: 'inv1',
          invoiceNumber: 'INV-202401-0001',
          status: InvoiceStatus.SENT,
          workOrder: {
            customer: { id: 'c1', name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
            vehicle: { id: 'v1', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' }
          },
          lineItems: []
        }
      ];

      mockPrisma.invoice.findMany.mockResolvedValue(mockInvoices as any);
      mockPrisma.invoice.count.mockResolvedValue(1);

      // Act
      const result = await invoicesService.getInvoices(filters, 1, 10);

      // Assert
      expect(mockPrisma.invoice.findMany).toHaveBeenCalledWith({
        where: {
          workOrderId: 'wo123',
          status: InvoiceStatus.SENT,
          createdAt: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-12-31')
          }
        },
        include: expect.any(Object),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
      expect(result.invoices).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('getInvoicesByWorkOrder', () => {
    it('should return invoices for work order', async () => {
      // Arrange
      const workOrderId = 'wo123';
      const mockInvoices = [
        {
          id: 'inv1',
          invoiceNumber: 'INV-202401-0001',
          workOrder: {
            customer: { id: 'c1', name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
            vehicle: { id: 'v1', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' }
          },
          lineItems: []
        }
      ];

      mockPrisma.invoice.findMany.mockResolvedValue(mockInvoices as any);

      // Act
      const result = await invoicesService.getInvoicesByWorkOrder(workOrderId);

      // Assert
      expect(mockPrisma.invoice.findMany).toHaveBeenCalledWith({
        where: { workOrderId },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' }
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('updateInvoice', () => {
    it('should update invoice successfully', async () => {
      // Arrange
      const invoiceId = 'inv123';
      const updateData: UpdateInvoiceRequest = {
        notes: 'Updated notes',
        terms: 'Updated terms'
      };

      const mockInvoice = { id: invoiceId, invoiceNumber: 'INV-202401-0001' };

      mockPrisma.invoice.findUnique.mockResolvedValue(mockInvoice as any);
      mockPrisma.invoice.update.mockResolvedValue({ ...mockInvoice, ...updateData } as any);

      // Act
      const result = await invoicesService.updateInvoice(invoiceId, updateData);

      // Assert
      expect(mockPrisma.invoice.update).toHaveBeenCalledWith({
        where: { id: invoiceId },
        data: updateData
      });
      expect(result.id).toBe(invoiceId);
    });

    it('should throw error when invoice not found', async () => {
      // Arrange
      const invoiceId = 'nonexistent';
      const updateData: UpdateInvoiceRequest = { notes: 'Test' };

      mockPrisma.invoice.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(invoicesService.updateInvoice(invoiceId, updateData)).rejects.toThrow('Invoice with ID nonexistent not found');
    });
  });

  describe('deleteInvoice', () => {
    it('should delete invoice successfully', async () => {
      // Arrange
      const invoiceId = 'inv123';
      const mockInvoice = { id: invoiceId, status: InvoiceStatus.DRAFT };

      mockPrisma.invoice.findUnique.mockResolvedValue(mockInvoice as any);

      // Act
      await invoicesService.deleteInvoice(invoiceId);

      // Assert
      expect(mockPrisma.invoice.delete).toHaveBeenCalledWith({
        where: { id: invoiceId }
      });
    });

    it('should throw error when trying to delete paid invoice', async () => {
      // Arrange
      const invoiceId = 'inv123';
      const mockInvoice = { id: invoiceId, status: InvoiceStatus.PAID };

      mockPrisma.invoice.findUnique.mockResolvedValue(mockInvoice as any);

      // Act & Assert
      await expect(invoicesService.deleteInvoice(invoiceId)).rejects.toThrow('Cannot delete a paid invoice');
    });
  });

  describe('getInvoiceStatistics', () => {
    it('should return invoice statistics', async () => {
      // Arrange
      mockPrisma.invoice.count
        .mockResolvedValueOnce(100) // totalInvoices
        .mockResolvedValueOnce(10)  // draftInvoices
        .mockResolvedValueOnce(70)  // sentInvoices
        .mockResolvedValueOnce(5)   // cancelledInvoices
        .mockResolvedValueOnce(15); // overdueInvoices

      mockPrisma.invoice.aggregate.mockResolvedValue({
        _sum: { totalAmount: { toNumber: () => 50000 } }
      } as any);

      // Act
      const result = await invoicesService.getInvoiceStatistics();

      // Assert
      expect(result.totalInvoices).toBe(100);
      expect(result.draftInvoices).toBe(10);
      expect(result.sentInvoices).toBe(70);
      expect(result.cancelledInvoices).toBe(5);
      expect(result.overdueInvoices).toBe(15);
      expect(result.totalRevenue).toBe(50000);
      expect(result.averageInvoiceAmount).toBe(500);
    });
  });

  describe('generateInvoicePDF', () => {
    it('should generate PDF successfully', async () => {
      // Arrange
      const invoiceId = 'inv123';
      const mockInvoice = {
        id: invoiceId,
        invoiceNumber: 'INV-202401-0001',
        createdAt: new Date('2024-01-15'),
        dueDate: new Date('2024-02-15'),
        status: InvoiceStatus.SENT,
        subtotal: 100,
        taxAmount: 18,
        discountAmount: 0,
        totalAmount: 118,
        notes: 'Test notes',
        terms: 'Payment terms',
        workOrder: {
          workOrderNumber: 'WO-001',
          odometerReading: 50000,
          customer: { name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
          vehicle: {
            year: 2020,
            make: 'Toyota',
            model: 'Camry',
            licensePlate: 'ABC123',
            vin: '1HGBH41JXMN109186'
          }
        },
        lineItems: [
          {
            type: LineItemType.SERVICE,
            description: 'Oil Change',
            quantity: 1,
            unitPrice: 50,
            subtotal: 50
          },
          {
            type: LineItemType.TAX,
            description: 'VAT (18%)',
            quantity: 1,
            unitPrice: 18,
            subtotal: 18
          }
        ]
      };

      mockPrisma.invoice.findUnique.mockResolvedValue(mockInvoice as any);

      // Act
      const result = await invoicesService.generateInvoicePDF(invoiceId);

      // Assert
      expect(mockPrisma.invoice.findUnique).toHaveBeenCalledWith({
        where: { id: invoiceId },
        include: expect.any(Object)
      });
      expect(result).toBe('https://storage.example.com/invoice.pdf');
    });

    it('should throw error when invoice not found', async () => {
      // Arrange
      const invoiceId = 'nonexistent';
      mockPrisma.invoice.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(invoicesService.generateInvoicePDF(invoiceId)).rejects.toThrow('Invoice with ID nonexistent not found');
    });
  });

  describe('getInvoiceStatusLabel', () => {
    it('should return correct status labels', () => {
      // Test all status types
      expect((invoicesService as any).getInvoiceStatusLabel(InvoiceStatus.DRAFT)).toBe('Draft');
      expect((invoicesService as any).getInvoiceStatusLabel(InvoiceStatus.SENT)).toBe('Sent');
      expect((invoicesService as any).getInvoiceStatusLabel(InvoiceStatus.PAID)).toBe('Paid');
      expect((invoicesService as any).getInvoiceStatusLabel(InvoiceStatus.OVERDUE)).toBe('Overdue');
      expect((invoicesService as any).getInvoiceStatusLabel(InvoiceStatus.CANCELLED)).toBe('Cancelled');
    });

    it('should return Draft for unknown status', () => {
      expect((invoicesService as any).getInvoiceStatusLabel('UNKNOWN' as InvoiceStatus)).toBe('Draft');
    });
  });
});