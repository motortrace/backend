import { PrismaClient } from '@prisma/client';
import { CreateServiceAdvisorDto, UpdateServiceAdvisorDto, ServiceAdvisorFilters, ServiceAdvisorResponse, ServiceAdvisorStats, WorkOrderResponse } from './service-advisors.types';

const prisma = new PrismaClient();

export class ServiceAdvisorService {
  // Create a new service advisor
  async createServiceAdvisor(data: CreateServiceAdvisorDto): Promise<ServiceAdvisorResponse> {
    try {
      // Check if user profile exists and has SERVICE_ADVISOR role
      const userProfile = await prisma.userProfile.findUnique({
        where: { id: data.userProfileId },
        select: { id: true, role: true }
      });

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      if (userProfile.role !== 'SERVICE_ADVISOR') {
        throw new Error('User profile must have SERVICE_ADVISOR role');
      }

      // Check if employee ID is unique (if provided)
      if (data.employeeId) {
        const existingAdvisor = await prisma.serviceAdvisor.findUnique({
          where: { employeeId: data.employeeId }
        });

        if (existingAdvisor) {
          throw new Error('Employee ID already exists');
        }
      }

      const serviceAdvisor = await prisma.serviceAdvisor.create({
        data: {
          userProfileId: data.userProfileId,
          employeeId: data.employeeId,
          department: data.department,
        },
        include: {
          userProfile: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true,
              role: true,
            },
          },
        },
      });

      return this.formatServiceAdvisorResponse(serviceAdvisor);
    } catch (error: any) {
      throw new Error(`Failed to create service advisor: ${error.message}`);
    }
  }

  // Get all service advisors with optional filtering
  async getServiceAdvisors(filters: ServiceAdvisorFilters): Promise<ServiceAdvisorResponse[]> {
    try {
      const where: any = {};

      // Apply filters
      if (filters.search) {
        where.OR = [
          { employeeId: { contains: filters.search, mode: 'insensitive' } },
          { department: { contains: filters.search, mode: 'insensitive' } },
          { userProfile: { name: { contains: filters.search, mode: 'insensitive' } } },
        ];
      }

      if (filters.employeeId) {
        where.employeeId = { contains: filters.employeeId, mode: 'insensitive' };
      }

      if (filters.department) {
        where.department = { contains: filters.department, mode: 'insensitive' };
      }

      if (filters.hasWorkOrders !== undefined) {
        if (filters.hasWorkOrders) {
          where.advisorWorkOrders = { some: {} };
        } else {
          where.advisorWorkOrders = { none: {} };
        }
      }

      if (filters.hasAppointments !== undefined) {
        if (filters.hasAppointments) {
          where.assignedAppointments = { some: {} };
        } else {
          where.assignedAppointments = { none: {} };
        }
      }

      const serviceAdvisors = await prisma.serviceAdvisor.findMany({
        where,
        include: {
          userProfile: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true,
              role: true,
            },
          },
          _count: {
            select: {
              advisorWorkOrders: true,
              assignedAppointments: true,
              createdEstimates: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit,
        skip: filters.offset,
      });

      return serviceAdvisors.map(advisor => this.formatServiceAdvisorResponse(advisor));
    } catch (error: any) {
      throw new Error(`Failed to get service advisors: ${error.message}`);
    }
  }

  // Get service advisor by ID
  async getServiceAdvisorById(id: string): Promise<ServiceAdvisorResponse | null> {
    try {
      const serviceAdvisor = await prisma.serviceAdvisor.findUnique({
        where: { id },
        include: {
          userProfile: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true,
              role: true,
            },
          },
          _count: {
            select: {
              advisorWorkOrders: true,
              assignedAppointments: true,
              createdEstimates: true,
            },
          },
        },
      });

      if (!serviceAdvisor) {
        return null;
      }

      return this.formatServiceAdvisorResponse(serviceAdvisor);
    } catch (error: any) {
      throw new Error(`Failed to get service advisor: ${error.message}`);
    }
  }

  // Get service advisor by employee ID
  async getServiceAdvisorByEmployeeId(employeeId: string): Promise<ServiceAdvisorResponse | null> {
    try {
      const serviceAdvisor = await prisma.serviceAdvisor.findUnique({
        where: { employeeId },
        include: {
          userProfile: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true,
              role: true,
            },
          },
          _count: {
            select: {
              advisorWorkOrders: true,
              assignedAppointments: true,
              createdEstimates: true,
            },
          },
        },
      });

      if (!serviceAdvisor) {
        return null;
      }

      return this.formatServiceAdvisorResponse(serviceAdvisor);
    } catch (error: any) {
      throw new Error(`Failed to get service advisor by employee ID: ${error.message}`);
    }
  }

  // Update service advisor
  async updateServiceAdvisor(id: string, data: UpdateServiceAdvisorDto): Promise<ServiceAdvisorResponse> {
    try {
      // Check if employee ID is unique (if provided and different)
      if (data.employeeId) {
        const existingAdvisor = await prisma.serviceAdvisor.findFirst({
          where: {
            employeeId: data.employeeId,
            id: { not: id }
          }
        });

        if (existingAdvisor) {
          throw new Error('Employee ID already exists');
        }
      }

      const serviceAdvisor = await prisma.serviceAdvisor.update({
        where: { id },
        data: {
          employeeId: data.employeeId,
          department: data.department,
        },
        include: {
          userProfile: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true,
              role: true,
            },
          },
          _count: {
            select: {
              advisorWorkOrders: true,
              assignedAppointments: true,
              createdEstimates: true,
            },
          },
        },
      });

      return this.formatServiceAdvisorResponse(serviceAdvisor);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('Service advisor not found');
      }
      throw new Error(`Failed to update service advisor: ${error.message}`);
    }
  }

  // Delete service advisor
  async deleteServiceAdvisor(id: string): Promise<void> {
    try {
      // Check if service advisor has any work orders or appointments
      const serviceAdvisor = await prisma.serviceAdvisor.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              advisorWorkOrders: true,
              assignedAppointments: true,
            },
          },
        },
      });

      if (!serviceAdvisor) {
        throw new Error('Service advisor not found');
      }

      if (serviceAdvisor._count.advisorWorkOrders > 0) {
        throw new Error('Cannot delete service advisor with existing work orders');
      }

      if (serviceAdvisor._count.assignedAppointments > 0) {
        throw new Error('Cannot delete service advisor with existing appointments');
      }

      await prisma.serviceAdvisor.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('Service advisor not found');
      }
      throw new Error(`Failed to delete service advisor: ${error.message}`);
    }
  }

  // Get service advisor statistics
  async getServiceAdvisorStats(): Promise<ServiceAdvisorStats> {
    try {
      const [
        totalServiceAdvisors,
        departmentStats,
        activeServiceAdvisors,
        recentHires,
      ] = await Promise.all([
        prisma.serviceAdvisor.count(),
        prisma.serviceAdvisor.groupBy({
          by: ['department'],
          _count: { department: true },
          where: { department: { not: null } },
        }),
        prisma.serviceAdvisor.count({
          where: {
            OR: [
              { advisorWorkOrders: { some: {} } },
              { assignedAppointments: { some: {} } },
            ],
          },
        }),
        prisma.serviceAdvisor.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            userProfile: {
              select: {
                id: true,
                name: true,
                phone: true,
                profileImage: true,
                role: true,
              },
            },
          },
        }),
      ]);

      return {
        totalServiceAdvisors,
        serviceAdvisorsByDepartment: departmentStats.map(stat => ({
          department: stat.department || 'Unassigned',
          count: stat._count.department,
        })),
        activeServiceAdvisors,
        recentHires: recentHires.map(advisor => this.formatServiceAdvisorResponse(advisor)),
      };
    } catch (error: any) {
      throw new Error(`Failed to get service advisor statistics: ${error.message}`);
    }
  }

  // Search service advisors
  async searchServiceAdvisors(query: string): Promise<ServiceAdvisorResponse[]> {
    try {
      const serviceAdvisors = await prisma.serviceAdvisor.findMany({
        where: {
          OR: [
            { employeeId: { contains: query, mode: 'insensitive' } },
            { department: { contains: query, mode: 'insensitive' } },
            { userProfile: { name: { contains: query, mode: 'insensitive' } } },
            { userProfile: { phone: { contains: query, mode: 'insensitive' } } },
          ],
        },
        include: {
          userProfile: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true,
              role: true,
            },
          },
          _count: {
            select: {
              advisorWorkOrders: true,
              assignedAppointments: true,
              createdEstimates: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      return serviceAdvisors.map(advisor => this.formatServiceAdvisorResponse(advisor));
    } catch (error: any) {
      throw new Error(`Failed to search service advisors: ${error.message}`);
    }
  }

  // Get work orders for a specific service advisor
  async getWorkOrdersByServiceAdvisor(serviceAdvisorId: string, filters?: { status?: string; limit?: number; offset?: number }): Promise<WorkOrderResponse[]> {
    try {
      // First verify the service advisor exists
      const serviceAdvisor = await prisma.serviceAdvisor.findUnique({
        where: { id: serviceAdvisorId }
      });

      if (!serviceAdvisor) {
        throw new Error('Service advisor not found');
      }

      const where: any = {
        advisorId: serviceAdvisorId
      };

      // Apply status filter if provided
      if (filters?.status) {
        where.status = filters.status;
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
              vin: true,
              licensePlate: true,
            },
          },
          appointment: {
            select: {
              id: true,
              requestedAt: true,
              startTime: true,
              endTime: true,
              status: true,
              priority: true,
              notes: true,
            },
          },
          laborItems: {
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
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      });

      return workOrders.map(workOrder => this.formatWorkOrderResponse(workOrder));
    } catch (error: any) {
      throw new Error(`Failed to get work orders for service advisor: ${error.message}`);
    }
  }

  // Helper method to format work order response
  private formatWorkOrderResponse(workOrder: any): WorkOrderResponse {
    return {
      id: workOrder.id,
      workOrderNumber: workOrder.workOrderNumber,
      createdAt: workOrder.createdAt,
      updatedAt: workOrder.updatedAt,
      customerId: workOrder.customerId,
      vehicleId: workOrder.vehicleId,
      appointmentId: workOrder.appointmentId,
      advisorId: workOrder.advisorId,
      status: workOrder.status,
      jobType: workOrder.jobType,
      priority: workOrder.priority,
      source: workOrder.source,
      complaint: workOrder.complaint,
      odometerReading: workOrder.odometerReading,
      warrantyStatus: workOrder.warrantyStatus,
      estimatedTotal: workOrder.estimatedTotal ? Number(workOrder.estimatedTotal) : undefined,
      estimateNotes: workOrder.estimateNotes,
      estimateApproved: workOrder.estimateApproved,
      subtotalLabor: workOrder.subtotalLabor ? Number(workOrder.subtotalLabor) : undefined,
      subtotalParts: workOrder.subtotalParts ? Number(workOrder.subtotalParts) : undefined,
      discountAmount: workOrder.discountAmount ? Number(workOrder.discountAmount) : undefined,
      taxAmount: workOrder.taxAmount ? Number(workOrder.taxAmount) : undefined,
      totalAmount: workOrder.totalAmount ? Number(workOrder.totalAmount) : undefined,
      paidAmount: Number(workOrder.paidAmount),
      openedAt: workOrder.openedAt,
      promisedAt: workOrder.promisedAt,
      closedAt: workOrder.closedAt,
      workflowStep: workOrder.workflowStep,
      internalNotes: workOrder.internalNotes,
      customerNotes: workOrder.customerNotes,
      invoiceNumber: workOrder.invoiceNumber,
      finalizedAt: workOrder.finalizedAt,
      paymentStatus: workOrder.paymentStatus,
      warrantyClaimNumber: workOrder.warrantyClaimNumber,
      thirdPartyApprovalCode: workOrder.thirdPartyApprovalCode,
      campaignId: workOrder.campaignId,
      servicePackageId: workOrder.servicePackageId,
      customerSignature: workOrder.customerSignature,
      customerFeedback: workOrder.customerFeedback,
      customer: workOrder.customer,
      vehicle: workOrder.vehicle,
      appointment: workOrder.appointment,
      technicians: workOrder.laborItems
        ?.filter((labor: any) => labor.technician)
        ?.map((labor: any) => labor.technician) || [],
    };
  }

  // Helper method to format service advisor response
  private formatServiceAdvisorResponse(advisor: any): ServiceAdvisorResponse {
    return {
      id: advisor.id,
      userProfileId: advisor.userProfileId,
      employeeId: advisor.employeeId,
      department: advisor.department,
      createdAt: advisor.createdAt,
      updatedAt: advisor.updatedAt,
      userProfile: advisor.userProfile,
      workOrdersCount: advisor._count?.advisorWorkOrders || 0,
      appointmentsCount: advisor._count?.assignedAppointments || 0,
      estimatesCount: advisor._count?.createdEstimates || 0,
    };
  }
}
