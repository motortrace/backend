import { WorkOrderService } from '../../../modules/work-orders/work-orders.service';
import { PrismaClient, WorkOrderStatus, JobType, JobPriority, JobSource, WorkflowStep, PaymentStatus, ServiceStatus } from '@prisma/client';
import { CreateWorkOrderRequest, UpdateWorkOrderRequest, WorkOrderFilters, CreateWorkOrderServiceRequest, UpdateWorkOrderLaborRequest, CreatePaymentRequest } from '../../../modules/work-orders/work-orders.types';
import { NotificationService } from '../../../modules/notifications/notifications.service';

// Mock dependencies
jest.mock('@prisma/client');
jest.mock('../../../modules/notifications/notifications.service');

describe('WorkOrderService', () => {
  let workOrderService: WorkOrderService;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let mockNotificationService: jest.Mocked<NotificationService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    mockNotificationService = new NotificationService(mockPrisma) as jest.Mocked<NotificationService>;
    workOrderService = new WorkOrderService(mockPrisma);
  });

  describe('createWorkOrder', () => {
    it('should create a work order successfully', async () => {
      // Arrange
      const workOrderData: CreateWorkOrderRequest = {
        customerId: 'customer123',
        vehicleId: 'vehicle123',
        complaint: 'Engine making strange noise',
        jobType: JobType.REPAIR,
        priority: JobPriority.NORMAL,
        source: JobSource.WALK_IN
      };

      const mockCustomer = { id: 'customer123', name: 'John Doe' };
      const mockVehicle = { id: 'vehicle123', make: 'Toyota', model: 'Camry' };
      const mockWorkOrder = {
        id: 'workorder123',
        workOrderNumber: 'WO-20241016-001',
        ...workOrderData,
        status: WorkOrderStatus.PENDING
      };

      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.workOrder.create.mockResolvedValue(mockWorkOrder as any);

      // Act
      const result = await workOrderService.createWorkOrder(workOrderData);

      // Assert
      expect(mockPrisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 'customer123' }
      });
      expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: 'vehicle123' }
      });
      expect(mockPrisma.workOrder.create).toHaveBeenCalled();
      expect(result).toBe('workorder123');
    });

    it('should throw error when customer not found', async () => {
      // Arrange
      const workOrderData: CreateWorkOrderRequest = {
        customerId: 'nonexistent',
        vehicleId: 'vehicle123'
      };

      mockPrisma.customer.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(workOrderService.createWorkOrder(workOrderData)).rejects.toThrow('Customer not found');
    });

    it('should throw error when vehicle not found', async () => {
      // Arrange
      const workOrderData: CreateWorkOrderRequest = {
        customerId: 'customer123',
        vehicleId: 'nonexistent'
      };

      mockPrisma.customer.findUnique.mockResolvedValue({ id: 'customer123' } as any);
      mockPrisma.vehicle.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(workOrderService.createWorkOrder(workOrderData)).rejects.toThrow('Vehicle not found');
    });
  });

  describe('getWorkOrderById', () => {
    it('should return work order when found', async () => {
      // Arrange
      const workOrderId = 'workorder123';
      const mockWorkOrder = {
        id: workOrderId,
        workOrderNumber: 'WO-20241016-001',
        customer: { id: 'customer123', name: 'John Doe' },
        vehicle: { id: 'vehicle123', make: 'Toyota', model: 'Camry' }
      };

      mockPrisma.workOrder.findUnique.mockResolvedValue(mockWorkOrder as any);

      // Act
      const result = await workOrderService.getWorkOrderById(workOrderId);

      // Assert
      expect(mockPrisma.workOrder.findUnique).toHaveBeenCalledWith({
        where: { id: workOrderId },
        include: expect.any(Object)
      });
      expect(result).toEqual(mockWorkOrder);
    });

    it('should return null when work order not found', async () => {
      // Arrange
      const workOrderId = 'nonexistent';
      mockPrisma.workOrder.findUnique.mockResolvedValue(null);

      // Act
      const result = await workOrderService.getWorkOrderById(workOrderId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getWorkOrders', () => {
    it('should return work orders with filters', async () => {
      // Arrange
      const filters: WorkOrderFilters = {
        status: WorkOrderStatus.PENDING,
        customerId: 'customer123'
      };

      const mockWorkOrders = [
        {
          id: 'workorder1',
          workOrderNumber: 'WO-001',
          status: WorkOrderStatus.PENDING,
          customer: { id: 'customer123', name: 'John Doe' },
          vehicle: { id: 'vehicle123', make: 'Toyota' }
        }
      ];

      mockPrisma.workOrder.findMany.mockResolvedValue(mockWorkOrders as any);

      // Act
      const result = await workOrderService.getWorkOrders(filters);

      // Assert
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith({
        where: {
          status: WorkOrderStatus.PENDING,
          customerId: 'customer123'
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' }
      });
      expect(result).toEqual(mockWorkOrders);
    });
  });

  describe('updateWorkOrder', () => {
    it('should update work order successfully', async () => {
      // Arrange
      const workOrderId = 'workorder123';
      const updateData: UpdateWorkOrderRequest = {
        complaint: 'Updated complaint',
        priority: JobPriority.HIGH
      };

      const mockUpdatedWorkOrder = {
        id: workOrderId,
        ...updateData
      };

      mockPrisma.workOrder.update.mockResolvedValue(mockUpdatedWorkOrder as any);

      // Act
      const result = await workOrderService.updateWorkOrder(workOrderId, updateData);

      // Assert
      expect(mockPrisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: workOrderId },
        data: expect.objectContaining(updateData)
      });
      expect(result).toBe(workOrderId);
    });
  });

  describe('deleteWorkOrder', () => {
    it('should soft delete work order successfully', async () => {
      // Arrange
      const workOrderId = 'workorder123';
      const existingWorkOrder = {
        id: workOrderId,
        status: WorkOrderStatus.PENDING,
        internalNotes: 'Original notes'
      };

      mockPrisma.workOrder.findUnique.mockResolvedValue(existingWorkOrder as any);
      mockPrisma.workOrder.update.mockResolvedValue({
        ...existingWorkOrder,
        status: WorkOrderStatus.CANCELLED
      } as any);

      // Act
      const result = await workOrderService.deleteWorkOrder(workOrderId);

      // Assert
      expect(mockPrisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: workOrderId },
        data: expect.objectContaining({
          status: WorkOrderStatus.CANCELLED,
          workflowStep: WorkflowStep.CLOSED,
          closedAt: expect.any(Date)
        })
      });
      expect(result.status).toBe(WorkOrderStatus.CANCELLED);
    });

    it('should throw error when work order not found', async () => {
      // Arrange
      const workOrderId = 'nonexistent';
      mockPrisma.workOrder.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(workOrderService.deleteWorkOrder(workOrderId)).rejects.toThrow('Work order not found');
    });

    it('should throw error when work order already cancelled', async () => {
      // Arrange
      const workOrderId = 'workorder123';
      const existingWorkOrder = {
        id: workOrderId,
        status: WorkOrderStatus.CANCELLED
      };

      mockPrisma.workOrder.findUnique.mockResolvedValue(existingWorkOrder as any);

      // Act & Assert
      await expect(workOrderService.deleteWorkOrder(workOrderId)).rejects.toThrow('Work order is already cancelled');
    });
  });

  describe('updateWorkOrderStatus', () => {
    it('should update work order status and send notification', async () => {
      // Arrange
      const workOrderId = 'workorder123';
      const newStatus = WorkOrderStatus.IN_PROGRESS;
      const existingWorkOrder = {
        id: workOrderId,
        status: WorkOrderStatus.PENDING,
        workOrderNumber: 'WO-001',
        customer: {
          id: 'customer123',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          userProfile: { id: 'profile123' }
        },
        vehicle: { make: 'Toyota', model: 'Camry', year: 2020 }
      };

      mockPrisma.workOrder.findUnique.mockResolvedValue(existingWorkOrder as any);
      mockPrisma.workOrder.update.mockResolvedValue({
        ...existingWorkOrder,
        status: newStatus,
        openedAt: new Date()
      } as any);

      // Act
      const result = await workOrderService.updateWorkOrderStatus(workOrderId, newStatus);

      // Assert
      expect(mockPrisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: workOrderId },
        data: expect.objectContaining({
          status: newStatus,
          openedAt: expect.any(Date)
        })
      });
      expect(result.status).toBe(newStatus);
    });
  });

  describe('createWorkOrderService', () => {
    it('should create work order service successfully', async () => {
      // Arrange
      const serviceData: CreateWorkOrderServiceRequest = {
        workOrderId: 'workorder123',
        cannedServiceId: 'service123',
        quantity: 1,
        unitPrice: 100
      };

      const mockCannedService = {
        id: 'service123',
        name: 'Oil Change',
        price: 100,
        laborOperations: [
          {
            laborCatalogId: 'labor123',
            estimatedMinutes: 60,
            laborCatalog: { name: 'Oil Change Labor' }
          }
        ]
      };

      const mockService = {
        id: 'service123',
        subtotal: 100
      };

      mockPrisma.cannedService.findUnique.mockResolvedValue(mockCannedService as any);
      mockPrisma.workOrderService.create.mockResolvedValue(mockService as any);
      mockPrisma.workOrderLabor.create.mockResolvedValue({} as any);

      // Act
      const result = await workOrderService.createWorkOrderService(serviceData);

      // Assert
      expect(mockPrisma.workOrderService.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workOrderId: 'workorder123',
          cannedServiceId: 'service123',
          quantity: 1,
          unitPrice: 100,
          subtotal: 100
        })
      });
      expect(mockPrisma.workOrderLabor.create).toHaveBeenCalled();
      expect(result.serviceId).toBe('service123');
    });

    it('should throw error when canned service not found', async () => {
      // Arrange
      const serviceData: CreateWorkOrderServiceRequest = {
        workOrderId: 'workorder123',
        cannedServiceId: 'nonexistent'
      };

      mockPrisma.cannedService.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(workOrderService.createWorkOrderService(serviceData)).rejects.toThrow('Canned service with ID \'nonexistent\' not found');
    });
  });

  describe('createPayment', () => {
    it('should create payment successfully', async () => {
      // Arrange
      const paymentData: CreatePaymentRequest = {
        workOrderId: 'workorder123',
        amount: 500,
        method: 'CASH' as any,
        processedById: 'user123'
      };

      const mockPayment = {
        id: 'payment123',
        ...paymentData,
        status: PaymentStatus.PAID
      };

      mockPrisma.payment.create.mockResolvedValue(mockPayment as any);

      // Act
      const result = await workOrderService.createPayment(paymentData);

      // Assert
      expect(mockPrisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...paymentData,
          status: PaymentStatus.PAID
        }),
        include: expect.any(Object)
      });
      expect(result).toEqual(mockPayment);
    });
  });

  describe('approveService', () => {
    it('should approve service successfully', async () => {
      // Arrange
      const serviceId = 'service123';
      const customerId = 'customer123';
      const mockService = {
        id: serviceId,
        workOrder: {
          id: 'workorder123',
          customerId: 'customer123'
        }
      };

      mockPrisma.workOrderService.findUnique.mockResolvedValue(mockService as any);

      // Act
      const result = await workOrderService.approveService(serviceId, customerId);

      // Assert
      expect(mockPrisma.workOrderService.update).toHaveBeenCalledWith({
        where: { id: serviceId },
        data: expect.objectContaining({
          customerApproved: true,
          customerRejected: false,
          approvedAt: expect.any(Date),
          status: ServiceStatus.PENDING
        })
      });
      expect(result.message).toBe('Service approved successfully');
    });

    it('should throw error when service not found', async () => {
      // Arrange
      const serviceId = 'nonexistent';
      const customerId = 'customer123';

      mockPrisma.workOrderService.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(workOrderService.approveService(serviceId, customerId)).rejects.toThrow('Service not found');
    });

    it('should throw error when customer does not own the work order', async () => {
      // Arrange
      const serviceId = 'service123';
      const customerId = 'customer123';
      const mockService = {
        id: serviceId,
        workOrder: {
          id: 'workorder123',
          customerId: 'different-customer'
        }
      };

      mockPrisma.workOrderService.findUnique.mockResolvedValue(mockService as any);

      // Act & Assert
      await expect(workOrderService.approveService(serviceId, customerId)).rejects.toThrow('Unauthorized: This service does not belong to your work order');
    });
  });

  describe('rejectService', () => {
    it('should reject service successfully', async () => {
      // Arrange
      const serviceId = 'service123';
      const customerId = 'customer123';
      const reason = 'Too expensive';
      const mockService = {
        id: serviceId,
        workOrder: {
          id: 'workorder123',
          customerId: 'customer123'
        }
      };

      mockPrisma.workOrderService.findUnique.mockResolvedValue(mockService as any);

      // Act
      const result = await workOrderService.rejectService(serviceId, customerId, reason);

      // Assert
      expect(mockPrisma.workOrderService.update).toHaveBeenCalledWith({
        where: { id: serviceId },
        data: expect.objectContaining({
          customerApproved: false,
          customerRejected: true,
          rejectedAt: expect.any(Date),
          customerNotes: reason,
          status: ServiceStatus.CANCELLED
        })
      });
      expect(result.message).toBe('Service rejected');
    });
  });

  describe('assignTechnicianToLabor', () => {
    it('should assign technician to labor successfully', async () => {
      // Arrange
      const laborId = 'labor123';
      const technicianId = 'technician123';
      const mockLabor = {
        id: laborId,
        technician: {
          id: technicianId,
          employeeId: 'EMP001',
          userProfile: {
            id: 'profile123',
            name: 'John Smith',
            phone: '1234567890'
          }
        },
        workOrder: {
          id: 'workorder123',
          workOrderNumber: 'WO-001'
        }
      };

      mockPrisma.workOrderLabor.update.mockResolvedValue(mockLabor as any);

      // Act
      const result = await workOrderService.assignTechnicianToLabor(laborId, technicianId);

      // Assert
      expect(mockPrisma.workOrderLabor.update).toHaveBeenCalledWith({
        where: { id: laborId },
        data: { technicianId },
        include: expect.any(Object)
      });
      expect(result).toEqual(mockLabor);
    });
  });

  describe('getWorkOrderStatistics', () => {
    it('should return work order statistics', async () => {
      // Arrange
      const filters = { startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31') };

      mockPrisma.workOrder.count
        .mockResolvedValueOnce(100) // totalWorkOrders
        .mockResolvedValueOnce(20)  // pendingWorkOrders
        .mockResolvedValueOnce(30)  // inProgressWorkOrders
        .mockResolvedValueOnce(40)  // completedWorkOrders
        .mockResolvedValueOnce(10); // cancelledWorkOrders

      mockPrisma.workOrder.aggregate.mockResolvedValue({
        _sum: { totalAmount: 50000 }
      } as any);

      mockPrisma.workOrderLabor.groupBy.mockResolvedValue([
        {
          technicianId: 'tech1',
          _count: { id: 25 },
          _sum: { estimatedMinutes: 1500, actualMinutes: 1800 }
        }
      ] as any);

      mockPrisma.workOrderService.groupBy.mockResolvedValue([
        {
          cannedServiceId: 'service1',
          _count: { id: 35 },
          _sum: { subtotal: 25000 }
        }
      ] as any);

      mockPrisma.technician.findMany.mockResolvedValue([
        {
          id: 'tech1',
          userProfile: { name: 'John Smith' }
        }
      ] as any);

      mockPrisma.cannedService.findMany.mockResolvedValue([
        {
          id: 'service1',
          name: 'Oil Change'
        }
      ] as any);

      // Act
      const result = await workOrderService.getWorkOrderStatistics(filters);

      // Assert
      expect(result.totalWorkOrders).toBe(100);
      expect(result.completedWorkOrders).toBe(40);
      expect(result.totalRevenue).toBe(50000);
      expect(result.topTechnicians).toHaveLength(1);
      expect(result.topServices).toHaveLength(1);
    });
  });

  describe('getWorkOrderCreationStats', () => {
    it('should return work order creation statistics', async () => {
      // Arrange
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const mockWorkOrders = [
        { createdAt: new Date(sevenDaysAgo.getTime() + 86400000) }, // Day 1
        { createdAt: new Date(sevenDaysAgo.getTime() + 86400000 * 2) }, // Day 2
        { createdAt: new Date(sevenDaysAgo.getTime() + 86400000 * 2) }, // Day 2
      ];

      mockPrisma.workOrder.findMany.mockResolvedValue(mockWorkOrders as any);

      // Act
      const result = await workOrderService.getWorkOrderCreationStats();

      // Assert
      expect(result.totalWorkOrders).toBe(3);
      expect(result.peakDaily).toBe(2);
      expect(result.dailyBreakdown).toHaveLength(7);
    });
  });

  describe('getGeneralStats', () => {
    it('should return general statistics', async () => {
      // Arrange
      mockPrisma.customer.count.mockResolvedValue(150);
      mockPrisma.vehicle.count.mockResolvedValue(200);
      mockPrisma.technician.count.mockResolvedValue(25);

      // Act
      const result = await workOrderService.getGeneralStats();

      // Assert
      expect(result.totalCustomers).toBe(150);
      expect(result.totalVehicles).toBe(200);
      expect(result.totalTechnicians).toBe(25);
    });
  });

  describe('generateEstimatePDF', () => {
    it('should generate estimate PDF successfully', async () => {
      // Arrange
      const workOrderId = 'workorder123';
      const mockWorkOrder = {
        id: workOrderId,
        workOrderNumber: 'WO-001',
        customer: { name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
        vehicle: { year: 2020, make: 'Toyota', model: 'Camry', licensePlate: 'ABC123', vin: 'VIN123' },
        services: [
          {
            unitPrice: 50,
            quantity: 1,
            subtotal: 50,
            cannedService: { name: 'Oil Change' },
            description: 'Oil Change Service'
          }
        ],
        laborItems: [
          {
            laborCatalog: { name: 'Labor' },
            description: 'Labor description'
          }
        ],
        partsUsed: [
          {
            unitPrice: 100,
            quantity: 1,
            subtotal: 100,
            part: { name: 'Oil Filter' }
          }
        ],
        createdAt: new Date(),
        estimateNotes: 'Test notes'
      };

      mockPrisma.workOrder.findUnique.mockResolvedValue(mockWorkOrder as any);

      // Mock pdfMake and StorageService
      const mockPdfMake = {
        createPdf: jest.fn().mockReturnValue({
          getBuffer: jest.fn().mockResolvedValue(Buffer.from('pdf-content'))
        })
      };

      const mockStorageService = {
        uploadEstimatePDF: jest.fn().mockResolvedValue({ success: true, url: 'https://example.com/estimate.pdf' })
      };

      // Mock the require calls
      jest.doMock('pdfmake/build/pdfmake', () => mockPdfMake);
      jest.doMock('../../../modules/storage/storage.service', () => ({ StorageService: mockStorageService }));

      // Act
      const result = await workOrderService.generateEstimatePDF(workOrderId);

      // Assert
      expect(result).toBe('https://example.com/estimate.pdf');
    });

    it('should throw error when work order not found', async () => {
      // Arrange
      const workOrderId = 'nonexistent';
      mockPrisma.workOrder.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(workOrderService.generateEstimatePDF(workOrderId)).rejects.toThrow('WorkOrder not found');
    });
  });

  describe('generateInspectionPDF', () => {
    it('should generate inspection PDF successfully', async () => {
      // Arrange
      const workOrderId = 'workorder123';
      const mockWorkOrder = {
        id: workOrderId,
        workOrderNumber: 'WO-001',
        customer: { name: 'John Doe' },
        vehicle: { year: 2020, make: 'Toyota', model: 'Camry' },
        inspections: [
          {
            template: { name: 'Full Inspection' },
            inspector: {
              userProfile: { name: 'Jane Inspector' }
            },
            date: new Date(),
            checklistItems: [
              {
                category: 'Engine',
                item: 'Oil Level',
                status: 'GREEN',
                notes: 'Good'
              }
            ],
            tireChecks: [],
            attachments: []
          }
        ]
      };

      mockPrisma.workOrder.findUnique.mockResolvedValue(mockWorkOrder as any);

      // Mock pdfMake and StorageService similar to estimate PDF test
      const mockPdfMake = {
        createPdf: jest.fn().mockReturnValue({
          getBuffer: jest.fn().mockResolvedValue(Buffer.from('pdf-content'))
        })
      };

      const mockStorageService = {
        uploadInspectionPDF: jest.fn().mockResolvedValue({ success: true, url: 'https://example.com/inspection.pdf' })
      };

      jest.doMock('pdfmake/build/pdfmake', () => mockPdfMake);
      jest.doMock('../../../modules/storage/storage.service', () => ({ StorageService: mockStorageService }));

      // Act
      const result = await workOrderService.generateInspectionPDF(workOrderId);

      // Assert
      expect(result).toBe('https://example.com/inspection.pdf');
    });
  });

  describe('getTechnicianActiveWork', () => {
    it('should return technician active work', async () => {
      // Arrange
      const technicianId = 'technician123';

      const mockActiveLabor = [
        {
          id: 'labor1',
          startTime: new Date(),
          endTime: null,
          status: 'IN_PROGRESS',
          workOrder: {
            id: 'wo1',
            workOrderNumber: 'WO-001',
            status: WorkOrderStatus.IN_PROGRESS,
            customer: { id: 'cust1', name: 'John Doe', phone: '1234567890' },
            vehicle: { id: 'veh1', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' }
          },
          service: {
            id: 'service1',
            description: 'Oil Change',
            cannedService: { id: 'cs1', name: 'Oil Change Service', code: 'OC001' }
          },
          laborCatalog: {
            id: 'lc1',
            name: 'Oil Change Labor',
            code: 'OCL001',
            estimatedMinutes: 60
          }
        }
      ];

      const mockActiveParts = [
        {
          id: 'part1',
          installedAt: null,
          workOrder: {
            id: 'wo1',
            workOrderNumber: 'WO-001',
            status: WorkOrderStatus.IN_PROGRESS,
            customer: { id: 'cust1', name: 'John Doe', phone: '1234567890' },
            vehicle: { id: 'veh1', make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC123' }
          },
          part: {
            id: 'p1',
            name: 'Oil Filter',
            sku: 'OF001',
            partNumber: '12345'
          }
        }
      ];

      mockPrisma.workOrderLabor.findMany.mockResolvedValue(mockActiveLabor as any);
      mockPrisma.workOrderPart.findMany.mockResolvedValue(mockActiveParts as any);

      // Act
      const result = await workOrderService.getTechnicianActiveWork(technicianId);

      // Assert
      expect(result.technicianId).toBe(technicianId);
      expect(result.activeLabor).toEqual(mockActiveLabor);
      expect(result.activeParts).toEqual(mockActiveParts);
      expect(result.totalActiveTasks).toBe(2);
      expect(result.summary.activeLaborCount).toBe(1);
      expect(result.summary.activePartsCount).toBe(1);
    });
  });
});