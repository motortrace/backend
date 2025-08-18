import { PrismaClient, WorkOrderStatus, JobType, JobPriority, JobSource, WarrantyStatus, WorkflowStep, PaymentStatus, ServiceStatus, PartSource, PaymentMethod, ApprovalStatus, ApprovalMethod, EstimateItemType, ChecklistStatus, TirePosition, AttachmentCategory, Prisma } from '@prisma/client';
import {
  CreateWorkOrderRequest,
  UpdateWorkOrderRequest,
  WorkOrderFilters,
  CreateWorkOrderEstimateRequest,
  CreateWorkOrderLabourRequest,
  CreateWorkOrderPartRequest,
  CreateWorkOrderServiceRequest,
  CreatePaymentRequest,
  WorkOrderStatistics,
} from './work-orders.types';

const prisma = new PrismaClient();

// Type alias for work order with all includes
type WorkOrderWithDetails = Prisma.WorkOrderGetPayload<{
  include: {
    customer: { select: { id: true; name: true; email: true; phone: true } };
    vehicle: { select: { id: true; make: true; model: true; year: true; licensePlate: true; vin: true } };
    appointment: { select: { id: true; requestedAt: true; startTime: true; endTime: true } };
    serviceAdvisor: { select: { id: true; employeeId: true; department: true; userProfile: { select: { id: true; name: true; phone: true } } } };
    services: { include: { cannedService: { select: { id: true; code: true; name: true; description: true; duration: true; price: true } } } };
    inspections: { include: { inspector: { select: { id: true; employeeId: true; userProfile: { select: { id: true; name: true } } } } } };
    labourItems: { include: { laborCatalog: { select: { id: true; code: true; name: true; estimatedHours: true; hourlyRate: true } }; technician: { select: { id: true; employeeId: true; userProfile: { select: { id: true; name: true } } } } } };
    partsUsed: { include: { part: { select: { id: true; name: true; sku: true; partNumber: true; manufacturer: true } }; installedBy: { select: { id: true; employeeId: true; userProfile: { select: { id: true; name: true } } } } } };
    payments: { include: { processedBy: { select: { id: true; employeeId: true; userProfile: { select: { id: true; name: true } } } } } };
    estimates: { include: { createdBy: { select: { id: true; employeeId: true; userProfile: { select: { id: true; name: true } } } }; approvedBy: { select: { id: true; employeeId: true; userProfile: { select: { id: true; name: true } } } } } };
    attachments: { include: { uploadedBy: { select: { id: true; employeeId: true; userProfile: { select: { id: true; name: true } } } } } };
  };
}>;

export class WorkOrderService {
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
    
    const todayCount = await prisma.workOrder.count({
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
  async createWorkOrder(data: CreateWorkOrderRequest): Promise<WorkOrderWithDetails> {
    const { cannedServiceIds = [], quantities = [], prices = [], serviceNotes = [], ...workOrderData } = data;

    // Generate unique work order number
    const workOrderNumber = await this.generateWorkOrderNumber();

    // Validate customer and vehicle exist
    const customer = await prisma.customer.findUnique({
      where: { id: workOrderData.customerId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: workOrderData.vehicleId },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    // Validate appointment if provided
    if (workOrderData.appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: workOrderData.appointmentId },
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }
    }

    // Validate service advisor if provided
    if (workOrderData.advisorId) {
      const advisor = await prisma.serviceAdvisor.findUnique({
        where: { id: workOrderData.advisorId },
      });

      if (!advisor) {
        throw new Error('Service advisor not found');
      }
    }



    // Create work order with services
    const workOrder = await prisma.workOrder.create({
      data: {
        workOrderNumber,
        customerId: workOrderData.customerId,
        vehicleId: workOrderData.vehicleId,
        appointmentId: workOrderData.appointmentId,
        advisorId: workOrderData.advisorId,
        status: workOrderData.status || WorkOrderStatus.PENDING,
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
            quantity: quantities[index] || 1,
            unitPrice: prices[index] || 0,
            subtotal: (quantities[index] || 1) * (prices[index] || 0),
            notes: serviceNotes[index],
          })),
        },
      },
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
        },
        labourItems: {
          include: {
            laborCatalog: {
              select: {
                id: true,
                code: true,
                name: true,
                estimatedHours: true,
                hourlyRate: true,
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
        },
        payments: {
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
        },
        estimates: {
          include: {
            createdBy: {
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
            approvedBy: {
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
        },
        attachments: {
          include: {
            uploadedBy: {
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
        },
      },
    });

    return workOrder;
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

    const workOrders = await prisma.workOrder.findMany({
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
        },
        labourItems: {
          include: {
            laborCatalog: {
              select: {
                id: true,
                code: true,
                name: true,
                estimatedHours: true,
                hourlyRate: true,
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
        },
        payments: {
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
        },
        estimates: {
          include: {
            createdBy: {
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
            approvedBy: {
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
        },
        attachments: {
          include: {
            uploadedBy: {
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

         return workOrders;
  }

  // Get work order by ID
  async getWorkOrderById(id: string): Promise<WorkOrderWithDetails | null> {
    const workOrder = await prisma.workOrder.findUnique({
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
        },
        labourItems: {
          include: {
            laborCatalog: {
              select: {
                id: true,
                code: true,
                name: true,
                estimatedHours: true,
                hourlyRate: true,
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
        },
        payments: {
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
        },
        estimates: {
          include: {
            createdBy: {
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
            approvedBy: {
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
        },
        attachments: {
          include: {
            uploadedBy: {
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
        },
      },
    });

         return workOrder;
  }

  // Update work order
  async updateWorkOrder(id: string, data: UpdateWorkOrderRequest): Promise<WorkOrderWithDetails> {
    const updateData: any = { ...data };

    // Convert date strings to Date objects
    if (data.promisedAt) updateData.promisedAt = new Date(data.promisedAt);
    if (data.openedAt) updateData.openedAt = new Date(data.openedAt);
    if (data.closedAt) updateData.closedAt = new Date(data.closedAt);
    if (data.finalizedAt) updateData.finalizedAt = new Date(data.finalizedAt);

    const workOrder = await prisma.workOrder.update({
      where: { id },
      data: updateData,
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
        },
        labourItems: {
          include: {
            laborCatalog: {
              select: {
                id: true,
                code: true,
                name: true,
                estimatedHours: true,
                hourlyRate: true,
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
        },
        payments: {
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
        },
        estimates: {
          include: {
            createdBy: {
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
            approvedBy: {
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
        },
        attachments: {
          include: {
            uploadedBy: {
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
        },
      },
    });

    return workOrder;
  }

  // Delete work order
  async deleteWorkOrder(id: string): Promise<void> {
    await prisma.workOrder.delete({
      where: { id },
    });
  }

  // Create work order estimate
  async createWorkOrderEstimate(data: CreateWorkOrderEstimateRequest) {
    const { items, ...estimateData } = data;

    const estimate = await prisma.workOrderEstimate.create({
      data: {
        ...estimateData,
        estimateItems: {
          create: items,
        },
      },
      include: {
        estimateItems: true,
        createdBy: {
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
        approvedBy: {
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

    return estimate;
  }

  // Get work order estimates
  async getWorkOrderEstimates(workOrderId: string) {
    const estimates = await prisma.workOrderEstimate.findMany({
      where: { workOrderId },
      include: {
        estimateItems: true,
        createdBy: {
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
        approvedBy: {
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
        version: 'desc',
      },
    });

    return estimates;
  }

  // Approve work order estimate
  async approveWorkOrderEstimate(workOrderId: string, estimateId: string, approvedById: string) {
    const estimate = await prisma.workOrderEstimate.update({
      where: { id: estimateId },
      data: {
        approved: true,
        approvedAt: new Date(),
        approvedById,
      },
      include: {
        estimateItems: true,
        createdBy: {
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
        approvedBy: {
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

    // Update work order estimate approval status
    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        estimateApproved: true,
      },
    });

    return estimate;
  }

  // Create work order labour
  async createWorkOrderLabour(data: CreateWorkOrderLabourRequest) {
    const labour = await prisma.workOrderLabour.create({
      data: {
        ...data,
        subtotal: data.hours * data.rate,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
      },
      include: {
        laborCatalog: {
          select: {
            id: true,
            code: true,
            name: true,
            estimatedHours: true,
            hourlyRate: true,
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
              },
            },
          },
        },
      },
    });

    return labour;
  }

  // Get work order labour
  async getWorkOrderLabour(workOrderId: string) {
    const labourItems = await prisma.workOrderLabour.findMany({
      where: { workOrderId },
      include: {
        laborCatalog: {
          select: {
            id: true,
            code: true,
            name: true,
            estimatedHours: true,
            hourlyRate: true,
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
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return labourItems;
  }

  // Assign technician to labor entry
  async assignTechnicianToLabor(laborId: string, technicianId: string) {
    // Validate the labor entry exists
    const labor = await prisma.workOrderLabour.findUnique({
      where: { id: laborId },
    });

    if (!labor) {
      throw new Error(`Labor entry with ID '${laborId}' not found`);
    }

    // Validate the technician exists
    const technician = await prisma.technician.findUnique({
      where: { id: technicianId },
    });

    if (!technician) {
      throw new Error(`Technician with ID '${technicianId}' not found`);
    }

    // Update the labor entry with the technician
    const updatedLabor = await prisma.workOrderLabour.update({
      where: { id: laborId },
      data: {
        technicianId,
      },
      include: {
        laborCatalog: {
          select: {
            id: true,
            code: true,
            name: true,
            estimatedHours: true,
            hourlyRate: true,
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
              },
            },
          },
        },
      },
    });

    return updatedLabor;
  }

  // Create work order part
  async createWorkOrderPart(data: CreateWorkOrderPartRequest) {
    const part = await prisma.workOrderPart.create({
      data: {
        ...data,
        subtotal: data.quantity * data.unitPrice,
        installedAt: data.installedAt ? new Date(data.installedAt) : undefined,
      },
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

    return part;
  }

  // Get work order parts
  async getWorkOrderParts(workOrderId: string) {
    const parts = await prisma.workOrderPart.findMany({
      where: { workOrderId },
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
        createdAt: 'desc',
      },
    });

    return parts;
  }

  // Create work order service
  async createWorkOrderService(data: CreateWorkOrderServiceRequest) {
    // Validate the canned service exists
    const cannedService = await prisma.cannedService.findUnique({
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

    // Create the work order service
    const service = await prisma.workOrderService.create({
      data: {
        ...data,
        quantity: data.quantity || 1,
        unitPrice: data.unitPrice || Number(cannedService.price),
        subtotal: (data.quantity || 1) * Number(data.unitPrice || cannedService.price),
      },
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
    });

    // Automatically create labor entries for this canned service
    if (cannedService.laborOperations.length > 0) {
      const laborEntries = await Promise.all(
        cannedService.laborOperations.map(async (laborOp) => {
          return await prisma.workOrderLabour.create({
            data: {
              workOrderId: data.workOrderId,
              laborCatalogId: laborOp.laborCatalogId,
              description: laborOp.laborCatalog.name,
              hours: Number(laborOp.laborCatalog.estimatedHours),
              rate: Number(laborOp.laborCatalog.hourlyRate),
              subtotal: Number(laborOp.laborCatalog.estimatedHours) * Number(laborOp.laborCatalog.hourlyRate),
              notes: laborOp.notes || `Auto-generated from canned service: ${cannedService.name}`,
            },
            include: {
              laborCatalog: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  estimatedHours: true,
                  hourlyRate: true,
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
                    },
                  },
                },
              },
            },
          });
        })
      );

      // Return both the service and the created labor entries
      return {
        service,
        laborEntries,
        message: `Created service and ${laborEntries.length} labor entries automatically`,
      };
    }

    return {
      service,
      laborEntries: [],
      message: 'Created service (no labor entries found for this canned service)',
    };
  }

  // Get work order services
  async getWorkOrderServices(workOrderId: string) {
    const services = await prisma.workOrderService.findMany({
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return services;
  }

  // Create payment
  async createPayment(data: CreatePaymentRequest) {
    const payment = await prisma.payment.create({
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
    const payments = await prisma.payment.findMany({
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

    const workOrder = await prisma.workOrder.update({
      where: { id },
      data: updateData,
    });

    return workOrder;
  }

  // Assign work order
  async assignWorkOrder(id: string, advisorId?: string, technicianId?: string) {
    const updateData: any = {};

    if (advisorId) {
      updateData.advisorId = advisorId;
    }

    if (technicianId) {
      updateData.technicianId = technicianId;
    }

    const workOrder = await prisma.workOrder.update({
      where: { id },
      data: updateData,
    });

    return workOrder;
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
      prisma.workOrder.count({ where }),
      prisma.workOrder.count({ where: { ...where, status: WorkOrderStatus.PENDING } }),
      prisma.workOrder.count({ where: { ...where, status: WorkOrderStatus.IN_PROGRESS } }),
      prisma.workOrder.count({ where: { ...where, status: WorkOrderStatus.COMPLETED } }),
      prisma.workOrder.count({ where: { ...where, status: WorkOrderStatus.CANCELLED } }),
      prisma.workOrder.aggregate({
        where: { ...where, status: WorkOrderStatus.COMPLETED },
        _sum: { totalAmount: true },
      }),
      prisma.workOrderLabour.groupBy({
        by: ['technicianId'],
        where: { workOrder: where },
        _sum: { hours: true },
        _count: { workOrderId: true },
        orderBy: { _count: { workOrderId: 'desc' } },
        take: 5,
      }),
      prisma.workOrderService.groupBy({
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
    const technicians = await prisma.technician.findMany({
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
    const serviceIds = topServices.map(s => s.cannedServiceId);
    const services = await prisma.cannedService.findMany({
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
        return {
          technicianId: t.technicianId || '',
          technicianName: technician?.userProfile?.name || 'Unknown',
          completedWorkOrders: t._count.workOrderId,
          totalHours: Number(t._sum.hours) || 0,
        };
      }),
      topServices: topServices.map(s => {
        const service = services.find(serv => serv.id === s.cannedServiceId);
        return {
          serviceId: s.cannedServiceId,
          serviceName: service?.name || 'Unknown',
          usageCount: s._count.id,
          totalRevenue: Number(s._sum.subtotal) || 0,
        };
      }),
    };

    return statistics;
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

    const workOrders = await prisma.workOrder.findMany({
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
    const attachment = await prisma.workOrderAttachment.create({
      data: {
        workOrderId,
        ...data,
      },
      include: {
        uploadedBy: {
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

    return attachment;
  }

  // Get work order attachments
  async getWorkOrderAttachments(workOrderId: string, category?: string) {
    const where: any = { workOrderId };

    if (category) {
      where.category = category;
    }

    const attachments = await prisma.workOrderAttachment.findMany({
      where,
      include: {
        uploadedBy: {
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
        uploadedAt: 'desc',
      },
    });

    return attachments;
  }

  // Create work order inspection
  async createWorkOrderInspection(workOrderId: string, inspectorId: string, notes?: string) {
    const inspection = await prisma.workOrderInspection.create({
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
    const inspections = await prisma.workOrderInspection.findMany({
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
    const qc = await prisma.workOrderQC.create({
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
    const qc = await prisma.workOrderQC.findMany({
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

  // Generate estimate from existing labor and parts
  async generateEstimateFromLaborAndParts(workOrderId: string, createdById: string) {
    // Get the work order with all labor and parts
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        labourItems: {
          include: {
            laborCatalog: true,
            technician: {
              include: {
                userProfile: true
              }
            }
          }
        },
        partsUsed: {
          include: {
            part: true,
            installedBy: {
              include: {
                userProfile: true
              }
            }
          }
        }
      }
    });

    if (!workOrder) {
      throw new Error('Work order not found');
    }

    // Calculate totals (only labor and parts, no services)
    const labourTotal = workOrder.labourItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
    const partsTotal = workOrder.partsUsed.reduce((sum, item) => sum + Number(item.subtotal), 0);
    
    const subtotal = labourTotal + partsTotal;
    const taxAmount = subtotal * 0.1; // 10% tax - you can make this configurable
    const totalAmount = subtotal + taxAmount;

    // Create estimate items from labor
    const estimateItems: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      itemType: EstimateItemType;
      notes?: string | null;
    }> = [];

    // Add labor items
    workOrder.labourItems.forEach(labor => {
      estimateItems.push({
        description: labor.description,
        quantity: Number(labor.hours),
        unitPrice: Number(labor.rate),
        totalPrice: Number(labor.subtotal),
        itemType: 'LABOUR' as EstimateItemType,
        notes: labor.notes ? labor.notes : `Performed by ${labor.technician?.userProfile?.name || 'Technician'}`
      });
    });

    // Add parts items
    workOrder.partsUsed.forEach(part => {
      estimateItems.push({
        description: part.part.name,
        quantity: part.quantity,
        unitPrice: Number(part.unitPrice),
        totalPrice: Number(part.subtotal),
        itemType: 'PART' as EstimateItemType,
        notes: part.notes || `Installed by ${part.installedBy?.userProfile?.name || 'Technician'}`
      });
    });



    // Create the estimate
    const estimate = await prisma.workOrderEstimate.create({
      data: {
        workOrderId,
        version: 1,
        description: `Estimate generated from labor and parts for ${workOrder.workOrderNumber}`,
        totalAmount,
        labourAmount: labourTotal,
        partsAmount: partsTotal,
        taxAmount,
        discountAmount: 0,
        notes: 'Estimate automatically generated from recorded labor and parts',
        createdById,
        approved: true, // Auto-approve since it's based on actual work
        approvedAt: new Date(),
        approvedById: createdById,
        estimateItems: {
          create: estimateItems
        }
      },
      include: {
        estimateItems: true,
        createdBy: {
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
        approvedBy: {
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

    // Update work order status to APPROVAL and update totals
    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        status: 'IN_PROGRESS' as WorkOrderStatus,
        workflowStep: 'APPROVAL' as WorkflowStep,
        estimatedTotal: totalAmount,
        subtotalLabour: labourTotal,
        subtotalParts: partsTotal,
        totalAmount: totalAmount,
        taxAmount: taxAmount,
        estimateApproved: true
      }
    });

    return {
      estimate,
      workOrderUpdate: {
        status: 'IN_PROGRESS',
        workflowStep: 'APPROVAL',
        estimatedTotal: totalAmount,
        subtotalLabour: labourTotal,
        subtotalParts: partsTotal,
        totalAmount: totalAmount,
        taxAmount: taxAmount
      }
    };
  }

  // Helper method to find ServiceAdvisor by Supabase user ID
  async findServiceAdvisorBySupabaseUserId(supabaseUserId: string) {
    const serviceAdvisor = await prisma.serviceAdvisor.findFirst({
      where: {
        userProfile: {
          supabaseUserId: supabaseUserId
        }
      }
    });

    return serviceAdvisor;
  }

  // Helper method to update work order payment status
  private async updateWorkOrderPaymentStatus(workOrderId: string) {
    const workOrder = await prisma.workOrder.findUnique({
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

    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: { paymentStatus },
    });
  }
}
