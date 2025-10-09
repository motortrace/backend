import { WorkOrderStatus, JobType, JobPriority, JobSource, WarrantyStatus, WorkflowStep, PaymentStatus, ServiceStatus, PartSource, PaymentMethod, ApprovalStatus, ApprovalMethod, ChecklistStatus, TirePosition, AttachmentCategory, Prisma } from '@prisma/client';
import {
  CreateWorkOrderRequest,
  UpdateWorkOrderRequest,
  WorkOrderFilters,
  CreateWorkOrderServiceRequest,
  UpdateWorkOrderLaborRequest,
  CreatePaymentRequest,
  WorkOrderStatistics,
} from './work-orders.types';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../notifications/notifications.service';
import { NotificationEventType, NotificationChannel, NotificationPriority } from '../notifications/notifications.types';

// Type alias for work order with all includes
type WorkOrderWithDetails = Prisma.WorkOrderGetPayload<{
  include: {
    customer: { select: { id: true; name: true; email: true; phone: true } };
    vehicle: { select: { id: true; make: true; model: true; year: true; licensePlate: true; vin: true } };
    appointment: { select: { id: true; requestedAt: true; startTime: true; endTime: true } };
    serviceAdvisor: { select: { id: true; employeeId: true; department: true; userProfile: { select: { id: true; name: true; phone: true } } } };
    services: { include: { cannedService: { select: { id: true; code: true; name: true; description: true; duration: true; price: true } } } };
    inspections: { include: { inspector: { select: { id: true; employeeId: true; userProfile: { select: { id: true; name: true } } } } } };
    laborItems: { include: { laborCatalog: { select: { id: true; code: true; name: true; estimatedMinutes: true } }; technician: { select: { id: true; employeeId: true; userProfile: { select: { id: true; name: true } } } } } };
    partsUsed: { include: { part: { select: { id: true; name: true; sku: true; partNumber: true; manufacturer: true } }; installedBy: { select: { id: true; employeeId: true; userProfile: { select: { id: true; name: true } } } } } };
    payments: { include: { processedBy: { select: { id: true; employeeId: true; userProfile: { select: { id: true; name: true } } } } } };
    attachments: { include: { uploadedBy: { select: { id: true; name: true } } } };
  };
}>;

export class WorkOrderService {
  private notificationService: NotificationService;

  constructor(private readonly prisma: PrismaClient) {
    this.notificationService = new NotificationService(prisma);
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



    // Create work order with services
    const workOrder = await this.prisma.workOrder.create({
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
    });

    return workOrder ? this.transformWorkOrderForFrontend(workOrder) : null;
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
        customer: { select: { id: true, name: true, email: true, phone: true } },
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
            customerId: existingWorkOrder.customer.id,
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
    await this.prisma.workOrderLabor.update({
      where: { id: laborId },
      data: {
        ...data,
      },
    });

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
    await this.prisma.workOrderPart.update({
      where: { id: partId },
      data: {
        installedAt: new Date(),
        notes: data.notes,
        warrantyInfo: data.warrantyInfo,
      },
    });

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



