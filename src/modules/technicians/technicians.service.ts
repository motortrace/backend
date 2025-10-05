import { CreateTechnicianDto, UpdateTechnicianDto, TechnicianFilters, TechnicianResponse, TechnicianStats, WorkOrderResponse } from './technicians.types';
import { PrismaClient } from '@prisma/client';

export class TechnicianService {
  constructor(private readonly prisma: PrismaClient) {}
  // Create a new technician
  async createTechnician(data: CreateTechnicianDto): Promise<TechnicianResponse> {
    try {
      // Check if user profile exists and has TECHNICIAN role
      const userProfile = await this.prisma.userProfile.findUnique({
        where: { id: data.userProfileId },
        select: { id: true, role: true }
      });

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      if (userProfile.role !== 'TECHNICIAN') {
        throw new Error('User profile must have TECHNICIAN role');
      }

      // Check if employee ID is unique (if provided)
      if (data.employeeId) {
        const existingTechnician = await this.prisma.technician.findUnique({
          where: { employeeId: data.employeeId }
        });

        if (existingTechnician) {
          throw new Error('Employee ID already exists');
        }
      }

      const technician = await this.prisma.technician.create({
        data: {
          userProfileId: data.userProfileId,
          employeeId: data.employeeId,
          specialization: data.specialization,
          certifications: data.certifications || [],
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

      return this.formatTechnicianResponse(technician);
    } catch (error: any) {
      throw new Error(`Failed to create technician: ${error.message}`);
    }
  }

  // Get all technicians with optional filtering
  async getTechnicians(filters: TechnicianFilters): Promise<TechnicianResponse[]> {
    try {
      const where: any = {};

      // Apply filters
      if (filters.search) {
        where.OR = [
          { employeeId: { contains: filters.search, mode: 'insensitive' } },
          { specialization: { contains: filters.search, mode: 'insensitive' } },
          { userProfile: { name: { contains: filters.search, mode: 'insensitive' } } },
        ];
      }

      if (filters.employeeId) {
        where.employeeId = { contains: filters.employeeId, mode: 'insensitive' };
      }

      if (filters.specialization) {
        where.specialization = { contains: filters.specialization, mode: 'insensitive' };
      }

      if (filters.hasInspections !== undefined) {
        if (filters.hasInspections) {
          where.inspections = { some: {} };
        } else {
          where.inspections = { none: {} };
        }
      }

      if (filters.hasLaborItems !== undefined) {
        if (filters.hasLaborItems) {
          where.laborItems = { some: {} };
        } else {
          where.laborItems = { none: {} };
        }
      }

      const technicians = await this.prisma.technician.findMany({
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
              inspections: true,
              qcChecks: true,
              laborItems: true,
              partInstallations: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit,
        skip: filters.offset,
      });

      return technicians.map(technician => this.formatTechnicianResponse(technician));
    } catch (error: any) {
      throw new Error(`Failed to get technicians: ${error.message}`);
    }
  }

  // Get technician by ID
  async getTechnicianById(id: string): Promise<TechnicianResponse | null> {
    try {
      const technician = await this.prisma.technician.findUnique({
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
              inspections: true,
              qcChecks: true,
              laborItems: true,
              partInstallations: true,
            },
          },
        },
      });

      if (!technician) {
        return null;
      }

      return this.formatTechnicianResponse(technician);
    } catch (error: any) {
      throw new Error(`Failed to get technician: ${error.message}`);
    }
  }

  // Get technician by employee ID
  async getTechnicianByEmployeeId(employeeId: string): Promise<TechnicianResponse | null> {
    try {
      const technician = await this.prisma.technician.findUnique({
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
              inspections: true,
              qcChecks: true,
              laborItems: true,
              partInstallations: true,
            },
          },
        },
      });

      if (!technician) {
        return null;
      }

      return this.formatTechnicianResponse(technician);
    } catch (error: any) {
      throw new Error(`Failed to get technician by employee ID: ${error.message}`);
    }
  }

  // Update technician
  async updateTechnician(id: string, data: UpdateTechnicianDto): Promise<TechnicianResponse> {
    try {
      // Check if employee ID is unique (if provided and different)
      if (data.employeeId) {
        const existingTechnician = await this.prisma.technician.findFirst({
          where: {
            employeeId: data.employeeId,
            id: { not: id }
          }
        });

        if (existingTechnician) {
          throw new Error('Employee ID already exists');
        }
      }

      const technician = await this.prisma.technician.update({
        where: { id },
        data: {
          employeeId: data.employeeId,
          specialization: data.specialization,
          certifications: data.certifications,
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
              inspections: true,
              qcChecks: true,
              laborItems: true,
              partInstallations: true,
            },
          },
        },
      });

      return this.formatTechnicianResponse(technician);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('Technician not found');
      }
      throw new Error(`Failed to update technician: ${error.message}`);
    }
  }

  // Delete technician
  async deleteTechnician(id: string): Promise<void> {
    try {
      // Check if technician has any inspections, labor items, or QC checks
      const technician = await this.prisma.technician.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              inspections: true,
              laborItems: true,
              qcChecks: true,
              partInstallations: true,
            },
          },
        },
      });

      if (!technician) {
        throw new Error('Technician not found');
      }

      if (technician._count.inspections > 0) {
        throw new Error('Cannot delete technician with existing inspections');
      }

      if (technician._count.laborItems > 0) {
        throw new Error('Cannot delete technician with existing labor items');
      }

      if (technician._count.qcChecks > 0) {
        throw new Error('Cannot delete technician with existing QC checks');
      }

      if (technician._count.partInstallations > 0) {
        throw new Error('Cannot delete technician with existing part installations');
      }

      await this.prisma.technician.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('Technician not found');
      }
      throw new Error(`Failed to delete technician: ${error.message}`);
    }
  }

  // Get technician statistics
  async getTechnicianStats(): Promise<TechnicianStats> {
    try {
      const [
        totalTechnicians,
        specializationStats,
        activeTechnicians,
        recentHires,
      ] = await Promise.all([
        this.prisma.technician.count(),
        this.prisma.technician.groupBy({
          by: ['specialization'],
          _count: { specialization: true },
          where: { specialization: { not: null } },
        }),
        this.prisma.technician.count({
          where: {
            OR: [
              { inspections: { some: {} } },
              { laborItems: { some: {} } },
              { qcChecks: { some: {} } },
            ],
          },
        }),
        this.prisma.technician.findMany({
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
        totalTechnicians,
        techniciansBySpecialization: specializationStats.map(stat => ({
          specialization: stat.specialization || 'Unassigned',
          count: stat._count.specialization,
        })),
        activeTechnicians,
        recentHires: recentHires.map(technician => this.formatTechnicianResponse(technician)),
      };
    } catch (error: any) {
      throw new Error(`Failed to get technician statistics: ${error.message}`);
    }
  }

  // Search technicians
  async searchTechnicians(query: string): Promise<TechnicianResponse[]> {
    try {
      const technicians = await this.prisma.technician.findMany({
        where: {
          OR: [
            { employeeId: { contains: query, mode: 'insensitive' } },
            { specialization: { contains: query, mode: 'insensitive' } },
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
              inspections: true,
              qcChecks: true,
              laborItems: true,
              partInstallations: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      return technicians.map(technician => this.formatTechnicianResponse(technician));
    } catch (error: any) {
      throw new Error(`Failed to search technicians: ${error.message}`);
    }
  }

  // Get work orders for a specific technician (through labor items)
  async getWorkOrdersByTechnician(technicianId: string, filters?: { status?: string; limit?: number; offset?: number }): Promise<WorkOrderResponse[]> {
    try {
      // First verify the technician exists
      const technician = await this.prisma.technician.findUnique({
        where: { id: technicianId }
      });

      if (!technician) {
        throw new Error('Technician not found');
      }

      // Get work orders through labor items
      const laborItems = await this.prisma.workOrderLabor.findMany({
        where: { technicianId },
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
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      });

      // Filter by status if provided
      let workOrders = laborItems.map(item => item.workOrder);
      if (filters?.status) {
        workOrders = workOrders.filter(wo => wo.status === filters.status);
      }

      // Remove duplicates (same work order might have multiple labor items)
      const uniqueWorkOrders = workOrders.filter((workOrder, index, self) => 
        index === self.findIndex(wo => wo.id === workOrder.id)
      );

      return uniqueWorkOrders.map(workOrder => this.formatWorkOrderResponse(workOrder));
    } catch (error: any) {
      throw new Error(`Failed to get work orders for technician: ${error.message}`);
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

  // Helper method to format technician response
  private formatTechnicianResponse(technician: any): TechnicianResponse {
    return {
      id: technician.id,
      userProfileId: technician.userProfileId,
      employeeId: technician.employeeId,
      specialization: technician.specialization,
      certifications: technician.certifications,
      createdAt: technician.createdAt,
      updatedAt: technician.updatedAt,
      userProfile: technician.userProfile,
      inspectionsCount: technician._count?.inspections || 0,
      qcChecksCount: technician._count?.qcChecks || 0,
      laborItemsCount: technician._count?.laborItems || 0,
      partInstallationsCount: technician._count?.partInstallations || 0,
    };
  }
}

