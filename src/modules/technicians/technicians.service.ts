import { CreateTechnicianDto, UpdateTechnicianDto, TechnicianFilters, TechnicianResponse, TechnicianStats, WorkOrderResponse, TechnicianDetailedResponse } from './technicians.types';
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

  // Get currently working technicians with detailed stats
  async getCurrentlyWorkingTechnicians(): Promise<Array<{
    technician: TechnicianResponse;
    currentWork: {
      activeLaborItems: Array<{
        id: string;
        description: string;
        workOrderNumber: string;
        startTime: Date | null;
        estimatedMinutes: number | null;
        actualMinutes: number | null;
        timeWorked: number | null; // minutes since start
        status: string;
      }>;
      activeInspections: Array<{
        id: string;
        workOrderNumber: string;
        templateName: string | null;
        date: Date;
        isCompleted: boolean;
        timeSinceStarted: number; // minutes since inspection started
      }>;
      activeParts: Array<{
        id: string;
        description: string | null;
        workOrderNumber: string;
        installedAt: Date | null;
        timeSinceInstallation: number | null; // minutes since installation started
      }>;
    };
    workSummary: {
      totalActiveTasks: number;
      totalTimeWorkedToday: number; // minutes
      currentWorkOrderIds: string[];
    };
  }>> {
    try {
      // Get technicians with active work
      const techniciansWithWork = await this.prisma.technician.findMany({
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
          // Active labor items (in progress)
          laborItems: {
            where: {
              status: 'IN_PROGRESS',
              workOrder: {
                status: {
                  in: ['IN_PROGRESS', 'APPROVED']
                }
              }
            },
            include: {
              workOrder: {
                select: {
                  workOrderNumber: true,
                }
              }
            },
            orderBy: { startTime: 'desc' }
          },
          // Active inspections (not completed)
          inspections: {
            where: {
              status: 'ONGOING',
              workOrder: {
                status: {
                  in: ['IN_PROGRESS', 'APPROVED']
                }
              }
            },
            include: {
              template: {
                select: {
                  name: true,
                }
              },
              workOrder: {
                select: {
                  workOrderNumber: true,
                }
              }
            },
            orderBy: { date: 'desc' }
          },
          // Parts being installed (no installedAt date)
          partInstallations: {
            where: {
              installedAt: null,
              workOrder: {
                status: {
                  in: ['IN_PROGRESS', 'APPROVED']
                }
              }
            },
            include: {
              workOrder: {
                select: {
                  workOrderNumber: true,
                }
              }
            },
            orderBy: { createdAt: 'desc' }
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

      // Filter to only technicians with active work
      const activeTechnicians = techniciansWithWork.filter(tech =>
        tech.laborItems.length > 0 ||
        tech.inspections.length > 0 ||
        tech.partInstallations.length > 0
      );

      // Process each technician's current work
      const result = await Promise.all(activeTechnicians.map(async (tech) => {
        const now = new Date();

        // Process active labor items
        const activeLaborItems = tech.laborItems.map(labor => {
          const timeWorked = labor.startTime
            ? Math.floor((now.getTime() - labor.startTime.getTime()) / (1000 * 60))
            : null;

          return {
            id: labor.id,
            description: labor.description,
            workOrderNumber: labor.workOrder.workOrderNumber,
            startTime: labor.startTime,
            estimatedMinutes: labor.estimatedMinutes,
            actualMinutes: labor.actualMinutes,
            timeWorked,
            status: labor.status,
          };
        });

        // Process active inspections
        const activeInspections = tech.inspections.map(inspection => {
          const timeSinceStarted = Math.floor((now.getTime() - inspection.date.getTime()) / (1000 * 60));

          return {
            id: inspection.id,
            workOrderNumber: inspection.workOrder.workOrderNumber,
            templateName: inspection.template?.name || null,
            date: inspection.date,
            isCompleted: inspection.isCompleted,
            timeSinceStarted,
          };
        });

        // Process active parts
        const activeParts = tech.partInstallations.map(part => {
          const timeSinceInstallation = part.createdAt
            ? Math.floor((now.getTime() - part.createdAt.getTime()) / (1000 * 60))
            : null;

          return {
            id: part.id,
            description: part.description,
            workOrderNumber: part.workOrder.workOrderNumber,
            installedAt: part.installedAt,
            timeSinceInstallation,
          };
        });

        // Calculate work summary
        const totalActiveTasks = activeLaborItems.length + activeInspections.length + activeParts.length;

        // Get today's work time (simplified - sum of current active work times)
        const totalTimeWorkedToday = activeLaborItems.reduce((sum, labor) =>
          sum + (labor.timeWorked || 0), 0
        ) + activeInspections.reduce((sum, inspection) =>
          sum + inspection.timeSinceStarted, 0
        ) + activeParts.reduce((sum, part) =>
          sum + (part.timeSinceInstallation || 0), 0
        );

        // Get unique work order IDs
        const currentWorkOrderIds = [
          ...new Set([
            ...activeLaborItems.map(l => l.workOrderNumber),
            ...activeInspections.map(i => i.workOrderNumber),
            ...activeParts.map(p => p.workOrderNumber),
          ])
        ];

        return {
          technician: this.formatTechnicianResponse(tech),
          currentWork: {
            activeLaborItems,
            activeInspections,
            activeParts,
          },
          workSummary: {
            totalActiveTasks,
            totalTimeWorkedToday,
            currentWorkOrderIds,
          },
        };
      }));

      return result;
    } catch (error: any) {
      throw new Error(`Failed to get currently working technicians: ${error.message}`);
    }
  }

  // Get simplified currently working technicians endpoint
  async getWorkingTechniciansSimple(): Promise<Array<{
    technicianName: string;
    technicianImage: string | null;
    workOrderNumber: string;
    taskType: 'Labor' | 'Part' | 'Inspection';
    taskDescription: string;
    timeWorkedMinutes: number;
    expectedMinutes: number | null;
  }>> {
    const now = new Date();
    // Get all technicians with active labor, part, or inspection tasks
    const technicians = await this.prisma.technician.findMany({
      include: {
        userProfile: {
          select: {
            name: true,
            profileImage: true,
          },
        },
        laborItems: {
          where: {
            status: 'IN_PROGRESS',
            workOrder: {
              status: {
                in: ['IN_PROGRESS', 'APPROVED']
              }
            }
          },
          include: {
            workOrder: {
              select: {
                workOrderNumber: true,
              }
            }
          },
        },
        partInstallations: {
          where: {
            installedAt: null,
            workOrder: {
              status: {
                in: ['IN_PROGRESS', 'APPROVED']
              }
            }
          },
          include: {
            workOrder: {
              select: {
                workOrderNumber: true,
              }
            }
          },
        },
        inspections: {
          where: {
            status: 'ONGOING',
            workOrder: {
              status: {
                in: ['IN_PROGRESS', 'APPROVED']
              }
            }
          },
          include: {
            template: {
              select: {
                name: true,
              }
            },
            workOrder: {
              select: {
                workOrderNumber: true,
              }
            }
          },
        },
      },
    });

    // Flatten to simple array
    const result: Array<{
      technicianName: string;
      technicianImage: string | null;
      workOrderNumber: string;
      taskType: 'Labor' | 'Part' | 'Inspection';
      taskDescription: string;
      timeWorkedMinutes: number;
      expectedMinutes: number | null;
    }> = [];

    technicians.forEach(tech => {
      // Active labor items
      tech.laborItems.forEach(labor => {
        const timeWorked = labor.startTime
          ? Math.floor((now.getTime() - labor.startTime.getTime()) / (1000 * 60))
          : 0;
        result.push({
          technicianName: tech.userProfile?.name || 'Unknown',
          technicianImage: tech.userProfile?.profileImage || null,
          workOrderNumber: labor.workOrder.workOrderNumber,
          taskType: 'Labor',
          taskDescription: labor.description,
          timeWorkedMinutes: timeWorked,
          expectedMinutes: labor.estimatedMinutes || null,
        });
      });
      // Active part installations
      tech.partInstallations.forEach(part => {
        const timeWorked = part.createdAt
          ? Math.floor((now.getTime() - part.createdAt.getTime()) / (1000 * 60))
          : 0;
        result.push({
          technicianName: tech.userProfile?.name || 'Unknown',
          technicianImage: tech.userProfile?.profileImage || null,
          workOrderNumber: part.workOrder.workOrderNumber,
          taskType: 'Part',
          taskDescription: part.description || '',
          timeWorkedMinutes: timeWorked,
          expectedMinutes: null,
        });
      });
      // Active inspections
      tech.inspections.forEach(inspection => {
        const timeWorked = inspection.date
          ? Math.floor((now.getTime() - inspection.date.getTime()) / (1000 * 60))
          : 0;
        result.push({
          technicianName: tech.userProfile?.name || 'Unknown',
          technicianImage: tech.userProfile?.profileImage || null,
          workOrderNumber: inspection.workOrder.workOrderNumber,
          taskType: 'Inspection',
          taskDescription: inspection.template?.name || 'Inspection',
          timeWorkedMinutes: timeWorked,
          expectedMinutes: null,
        });
      });
    });

    return result;
  }

  // Get technician performance data for last 30 days (bar chart data)
  async getTechnicianMonthlyPerformance(): Promise<Array<{
    technicianId: string;
    technicianName: string;
    employeeId: string | null;
    totalHoursWorked: number;
    inspectionsCompleted: number;
    laborTasksCompleted: number;
    partsInstalled: number;
    totalTasks: number;
  }>> {
    try {
      // Calculate date range for last 60 days (more inclusive for performance tracking)
      const now = new Date();
      const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

      // Get all technicians who had activity in last 60 days
      const technicians = await this.prisma.technician.findMany({
        include: {
          userProfile: {
            select: {
              name: true,
            },
          },
        },
      });

      // Process and calculate hours worked and task counts
      const result = await Promise.all(technicians.map(async (tech) => {
        // Count inspections completed in last 60 days
        const inspectionsCount = await this.prisma.workOrderInspection.count({
          where: {
            inspectorId: tech.id,
            isCompleted: true,
            date: {
              gte: sixtyDaysAgo,
              lte: now,
            },
          },
        });

        // Count labor tasks completed in last 60 days
        const laborTasksCount = await this.prisma.workOrderLabor.count({
          where: {
            technicianId: tech.id,
            status: 'COMPLETED',
            OR: [
              {
                endTime: {
                  gte: sixtyDaysAgo,
                  lte: now,
                },
              },
              {
                updatedAt: {
                  gte: sixtyDaysAgo,
                  lte: now,
                },
              },
            ],
          },
        });

        // Count parts installed in last 60 days
        const partsInstalledCount = await this.prisma.workOrderPart.count({
          where: {
            installedById: tech.id,
            OR: [
              {
                installedAt: {
                  gte: sixtyDaysAgo,
                  lte: now,
                },
              },
              {
                updatedAt: {
                  gte: sixtyDaysAgo,
                  lte: now,
                },
              },
            ],
          },
        });

        // Calculate total hours from completed labor tasks
        const laborWithTime = await this.prisma.workOrderLabor.findMany({
          where: {
            technicianId: tech.id,
            status: 'COMPLETED',
            OR: [
              {
                endTime: {
                  gte: sixtyDaysAgo,
                  lte: now,
                },
              },
              {
                updatedAt: {
                  gte: sixtyDaysAgo,
                  lte: now,
                },
              },
            ],
          },
          select: {
            actualMinutes: true,
          },
        });

        const totalMinutes = laborWithTime.reduce((sum, labor) => sum + (labor.actualMinutes || 0), 0);
        const totalHours = Math.round((totalMinutes / 60) * 100) / 100; // Round to 2 decimal places

        return {
          technicianId: tech.id,
          technicianName: tech.userProfile?.name || 'Unknown',
          employeeId: tech.employeeId,
          totalHoursWorked: totalHours,
          inspectionsCompleted: inspectionsCount,
          laborTasksCompleted: laborTasksCount,
          partsInstalled: partsInstalledCount,
          totalTasks: inspectionsCount + laborTasksCount + partsInstalledCount,
        };
      }));

      // Filter out technicians with no activity and sort by total hours worked
      return result
        .filter(tech => tech.totalTasks > 0)
        .sort((a, b) => b.totalHoursWorked - a.totalHoursWorked);

    } catch (error: any) {
      throw new Error(`Failed to get technician monthly performance: ${error.message}`);
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

  // Get technician working status counts (working vs not working)
  async getTechnicianWorkingStatusCounts(): Promise<{
    totalTechnicians: number;
    currentlyWorking: number;
    notWorking: number;
  }> {
    try {
      // Get total technicians
      const totalTechnicians = await this.prisma.technician.count();

      // Get technicians currently working (have active tasks)
      const currentlyWorking = await this.prisma.technician.count({
        where: {
          OR: [
            {
              laborItems: {
                some: {
                  status: 'IN_PROGRESS',
                  workOrder: {
                    status: {
                      in: ['IN_PROGRESS', 'APPROVED']
                    }
                  }
                }
              }
            },
            {
              inspections: {
                some: {
                  status: 'ONGOING',
                  workOrder: {
                    status: {
                      in: ['IN_PROGRESS', 'APPROVED']
                    }
                  }
                }
              }
            },
            {
              partInstallations: {
                some: {
                  installedAt: null,
                  workOrder: {
                    status: {
                      in: ['IN_PROGRESS', 'APPROVED']
                    }
                  }
                }
              }
            }
          ]
        }
      });

      const notWorking = totalTechnicians - currentlyWorking;

      return {
        totalTechnicians,
        currentlyWorking,
        notWorking,
      };
    } catch (error: any) {
      throw new Error(`Failed to get technician working status counts: ${error.message}`);
    }
  }

  // Get detailed technician information with comprehensive stats
  async getTechnicianDetailedInfo(id: string): Promise<TechnicianDetailedResponse | null> {
    try {
      // Get basic technician info
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

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

      // Get all completed labor items for hours calculation
      const allLaborItems = await this.prisma.workOrderLabor.findMany({
        where: {
          technicianId: id,
          status: 'COMPLETED',
        },
        select: {
          actualMinutes: true,
          createdAt: true,
        },
      });

      // Get labor items from last 30 days
      const recentLaborItems = allLaborItems.filter(item => item.createdAt >= thirtyDaysAgo);

      // Calculate total hours worked
      const totalMinutes = allLaborItems.reduce((sum, labor) => sum + (labor.actualMinutes || 0), 0);
      const totalHours = Math.round((totalMinutes / 60) * 100) / 100;

      // Calculate last 30 days hours
      const recentMinutes = recentLaborItems.reduce((sum, labor) => sum + (labor.actualMinutes || 0), 0);
      const last30DaysHours = Math.round((recentMinutes / 60) * 100) / 100;

      // Count total tasks completed
      const totalTasksCompleted = await this.prisma.$queryRaw<number>`
        SELECT COUNT(*)::int as count FROM (
          SELECT id FROM "WorkOrderInspection" WHERE "inspectorId" = ${id} AND "isCompleted" = true
          UNION ALL
          SELECT id FROM "WorkOrderLabor" WHERE "technicianId" = ${id} AND status = 'COMPLETED'
          UNION ALL
          SELECT id FROM "WorkOrderPart" WHERE "installedById" = ${id} AND "installedAt" IS NOT NULL
        ) as tasks
      `;

      // Count tasks from last 30 days
      const last30DaysTasks = await this.prisma.$queryRaw<number>`
        SELECT COUNT(*)::int as count FROM (
          SELECT id FROM "WorkOrderInspection" WHERE "inspectorId" = ${id} AND "isCompleted" = true AND date >= ${thirtyDaysAgo}
          UNION ALL
          SELECT id FROM "WorkOrderLabor" WHERE "technicianId" = ${id} AND status = 'COMPLETED' AND "updatedAt" >= ${thirtyDaysAgo}
          UNION ALL
          SELECT id FROM "WorkOrderPart" WHERE "installedById" = ${id} AND "installedAt" >= ${thirtyDaysAgo}
        ) as tasks
      `;

      // Calculate total revenue generated (from work orders where technician worked)
      const revenueResult = await this.prisma.$queryRaw<{ total: number }[]>`
        SELECT COALESCE(SUM(wo."totalAmount"), 0) as total
        FROM "WorkOrder" wo
        WHERE wo.id IN (
          SELECT DISTINCT wol."workOrderId" FROM "WorkOrderLabor" wol WHERE wol."technicianId" = ${id}
          UNION
          SELECT DISTINCT woi."workOrderId" FROM "WorkOrderInspection" woi WHERE woi."inspectorId" = ${id}
          UNION
          SELECT DISTINCT wop."workOrderId" FROM "WorkOrderPart" wop WHERE wop."installedById" = ${id}
        )
        AND wo.status = 'COMPLETED'
      `;

      const totalRevenueGenerated = Number(revenueResult[0]?.total || 0);

      // Calculate last 30 days revenue
      const recentRevenueResult = await this.prisma.$queryRaw<{ total: number }[]>`
        SELECT COALESCE(SUM(wo."totalAmount"), 0) as total
        FROM "WorkOrder" wo
        WHERE wo.id IN (
          SELECT DISTINCT wol."workOrderId" FROM "WorkOrderLabor" wol WHERE wol."technicianId" = ${id}
          UNION
          SELECT DISTINCT woi."workOrderId" FROM "WorkOrderInspection" woi WHERE woi."inspectorId" = ${id}
          UNION
          SELECT DISTINCT wop."workOrderId" FROM "WorkOrderPart" wop WHERE wop."installedById" = ${id}
        )
        AND wo.status = 'COMPLETED'
        AND wo."closedAt" >= ${thirtyDaysAgo}
      `;

      const last30DaysRevenue = Number(recentRevenueResult[0]?.total || 0);

      // Calculate average task time and efficiency
      const averageTaskTime = totalTasksCompleted > 0 ? Math.round(totalMinutes / totalTasksCompleted) : 0;
      const efficiencyRating = totalHours > 0 ? Math.round((totalTasksCompleted / totalHours) * 100) / 100 : 0;

      // Check current working status
      const currentWorkingStatus = await this.prisma.technician.count({
        where: {
          id,
          OR: [
            {
              laborItems: {
                some: {
                  status: 'IN_PROGRESS',
                  workOrder: {
                    status: {
                      in: ['IN_PROGRESS', 'APPROVED']
                    }
                  }
                }
              }
            },
            {
              inspections: {
                some: {
                  status: 'ONGOING',
                  workOrder: {
                    status: {
                      in: ['IN_PROGRESS', 'APPROVED']
                    }
                  }
                }
              }
            },
            {
              partInstallations: {
                some: {
                  installedAt: null,
                  workOrder: {
                    status: {
                      in: ['IN_PROGRESS', 'APPROVED']
                    }
                  }
                }
              }
            }
          ]
        }
      }) > 0;

      // Get active tasks count
      const activeTasksCount = await this.prisma.$queryRaw<number>`
        SELECT COUNT(*)::int as count FROM (
          SELECT id FROM "WorkOrderLabor" WHERE "technicianId" = ${id} AND status = 'IN_PROGRESS'
          UNION ALL
          SELECT id FROM "WorkOrderInspection" WHERE "inspectorId" = ${id} AND status = 'ONGOING'
          UNION ALL
          SELECT id FROM "WorkOrderPart" WHERE "installedById" = ${id} AND "installedAt" IS NULL
        ) as active_tasks
      `;

      // Get current work details
      const activeLaborItems = await this.prisma.workOrderLabor.findMany({
        where: {
          technicianId: id,
          status: 'IN_PROGRESS',
          workOrder: {
            status: {
              in: ['IN_PROGRESS', 'APPROVED']
            }
          }
        },
        include: {
          workOrder: {
            select: {
              workOrderNumber: true,
            }
          }
        },
        orderBy: { startTime: 'desc' }
      });

      const activeInspections = await this.prisma.workOrderInspection.findMany({
        where: {
          inspectorId: id,
          status: 'ONGOING',
          workOrder: {
            status: {
              in: ['IN_PROGRESS', 'APPROVED']
            }
          }
        },
        include: {
          template: {
            select: {
              name: true,
            }
          },
          workOrder: {
            select: {
              workOrderNumber: true,
            }
          }
        },
        orderBy: { date: 'desc' }
      });

      const activeParts = await this.prisma.workOrderPart.findMany({
        where: {
          installedById: id,
          installedAt: null,
          workOrder: {
            status: {
              in: ['IN_PROGRESS', 'APPROVED']
            }
          }
        },
        include: {
          workOrder: {
            select: {
              workOrderNumber: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Process current work
      const currentWork = {
        activeLaborItems: activeLaborItems.map(labor => ({
          id: labor.id,
          description: labor.description,
          workOrderNumber: labor.workOrder.workOrderNumber,
          startTime: labor.startTime,
          estimatedMinutes: labor.estimatedMinutes,
          actualMinutes: labor.actualMinutes,
          timeWorked: labor.startTime ? Math.floor((now.getTime() - labor.startTime.getTime()) / (1000 * 60)) : null,
          status: labor.status,
        })),
        activeInspections: activeInspections.map(inspection => ({
          id: inspection.id,
          workOrderNumber: inspection.workOrder.workOrderNumber,
          templateName: inspection.template?.name || null,
          date: inspection.date,
          isCompleted: inspection.isCompleted,
          timeSinceStarted: Math.floor((now.getTime() - inspection.date.getTime()) / (1000 * 60)),
        })),
        activeParts: activeParts.map(part => ({
          id: part.id,
          description: part.description,
          workOrderNumber: part.workOrder.workOrderNumber,
          installedAt: part.installedAt,
          timeSinceInstallation: part.createdAt ? Math.floor((now.getTime() - part.createdAt.getTime()) / (1000 * 60)) : null,
        })),
      };

      // Get recent work orders (last 10)
      const recentWorkOrders = await this.getWorkOrdersByTechnician(id, { limit: 10, offset: 0 });

      return {
        ...this.formatTechnicianResponse(technician),
        stats: {
          totalTasksCompleted,
          totalHoursWorked: totalHours,
          totalRevenueGenerated,
          averageTaskTime,
          efficiencyRating,
          currentWorkingStatus,
          activeTasksCount,
          last30DaysTasks,
          last30DaysHours,
          last30DaysRevenue,
        },
        currentWork,
        recentWorkOrders,
      };
    } catch (error: any) {
      throw new Error(`Failed to get detailed technician info: ${error.message}`);
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

