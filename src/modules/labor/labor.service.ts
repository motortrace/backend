import {
  CreateLaborCatalogRequest,
  UpdateLaborCatalogRequest,
  CreateWorkOrderLaborRequest,
  UpdateWorkOrderLaborRequest,
  LaborCatalogWithUsage,
  WorkOrderLaborWithDetails,
  LaborSummary,
  LaborCatalogFilter,
  WorkOrderLaborFilter,
  CreateLaborRequest,
} from './labor.types';
import { PrismaClient } from '@prisma/client';

export class LaborService {
  constructor(private readonly prisma: PrismaClient) {}

  // Simple Labor Creation (for tracking work only - no pricing)
  async createLabor(data: CreateLaborRequest): Promise<WorkOrderLaborWithDetails> {
    // Validate work order exists
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: data.workOrderId },
    });

    if (!workOrder) {
      throw new Error(`Work order with ID '${data.workOrderId}' not found`);
    }

    // Validate service exists and belongs to this work order
    const service = await this.prisma.workOrderService.findFirst({
      where: {
        id: data.serviceId,
        workOrderId: data.workOrderId,
      },
    });

    if (!service) {
      throw new Error(`Service with ID '${data.serviceId}' not found in this work order`);
    }

    // Validate technician exists if provided
    if (data.technicianId) {
      const technician = await this.prisma.technician.findUnique({
        where: { id: data.technicianId },
      });

      if (!technician) {
        throw new Error(`Technician with ID '${data.technicianId}' not found`);
      }
    }

    // Create labor record (no pricing - just tracking)
    const labor = await this.prisma.workOrderLabor.create({
      data: {
        workOrderId: data.workOrderId,
        serviceId: data.serviceId,
        laborCatalogId: data.laborCatalogId,
        description: data.description,
        estimatedMinutes: data.estimatedMinutes,
        technicianId: data.technicianId,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
      },
      include: {
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
            status: true,
          },
        },
        laborCatalog: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
          },
        },
        technician: {
          select: {
            id: true,
            userProfileId: true,
          },
        },
      },
    });

    return labor as WorkOrderLaborWithDetails;
  }

  async createLaborCatalog(data: CreateLaborCatalogRequest) {
    const existingCatalog = await this.prisma.laborCatalog.findUnique({
      where: { code: data.code },
    });

    if (existingCatalog) {
      throw new Error(`Labor catalog with code '${data.code}' already exists`);
    }

    return await this.prisma.laborCatalog.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        estimatedMinutes: data.estimatedMinutes,
        skillLevel: data.skillLevel,
        category: data.category,
        isActive: data.isActive ?? true,
      },
    });
  }

  async getLaborCatalogs(filter?: LaborCatalogFilter) {
    const where: any = {};

    if (filter?.category) {
      where.category = filter.category;
    }

    if (filter?.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { code: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return await this.prisma.laborCatalog.findMany({
      where,
      include: {
        _count: {
          select: { laborItems: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getLaborCatalogById(id: string) {
    const catalog = await this.prisma.laborCatalog.findUnique({
      where: { id },
      include: {
        _count: {
          select: { laborItems: true },
        },
      },
    });

    if (!catalog) {
      throw new Error(`Labor catalog with ID '${id}' not found`);
    }

    return catalog;
  }

  async updateLaborCatalog(id: string, data: UpdateLaborCatalogRequest) {
    const existingCatalog = await this.prisma.laborCatalog.findUnique({
      where: { id },
    });

    if (!existingCatalog) {
      throw new Error(`Labor catalog with ID '${id}' not found`);
    }

    if (data.code && data.code !== existingCatalog.code) {
      const codeExists = await this.prisma.laborCatalog.findUnique({
        where: { code: data.code },
      });

      if (codeExists) {
        throw new Error(`Labor catalog with code '${data.code}' already exists`);
      }
    }

    return await this.prisma.laborCatalog.update({
      where: { id },
      data,
    });
  }

  async deleteLaborCatalog(id: string) {
    const catalog = await this.prisma.laborCatalog.findUnique({
      where: { id },
      include: {
        _count: {
          select: { laborItems: true },
        },
      },
    });

    if (!catalog) {
      throw new Error(`Labor catalog with ID '${id}' not found`);
    }

    if (catalog._count.laborItems > 0) {
      throw new Error(`Cannot delete labor catalog that is being used in ${catalog._count.laborItems} work orders`);
    }

    return await this.prisma.laborCatalog.delete({
      where: { id },
    });
  }

  async createWorkOrderLabor(data: CreateWorkOrderLaborRequest) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: data.workOrderId },
    });

    if (!workOrder) {
      throw new Error(`Work order with ID '${data.workOrderId}' not found`);
    }

    // Validate service exists and belongs to this work order
    const service = await this.prisma.workOrderService.findFirst({
      where: {
        id: data.serviceId,
        workOrderId: data.workOrderId,
      },
    });

    if (!service) {
      throw new Error(`Service with ID '${data.serviceId}' not found in this work order`);
    }

    if (data.laborCatalogId) {
      const laborCatalog = await this.prisma.laborCatalog.findUnique({
        where: { id: data.laborCatalogId },
      });

      if (!laborCatalog) {
        throw new Error(`Labor catalog with ID '${data.laborCatalogId}' not found`);
      }
    }

    if (data.technicianId) {
      const technician = await this.prisma.technician.findUnique({
        where: { id: data.technicianId },
      });

      if (!technician) {
        throw new Error(`Technician with ID '${data.technicianId}' not found`);
      }
    }

    return await this.prisma.workOrderLabor.create({
      data: {
        workOrderId: data.workOrderId,
        serviceId: data.serviceId,
        laborCatalogId: data.laborCatalogId,
        description: data.description,
        estimatedMinutes: data.estimatedMinutes,
        technicianId: data.technicianId,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
      },
      include: {
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
            status: true,
          },
        },
        laborCatalog: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
          },
        },
        technician: {
          select: {
            id: true,
            userProfileId: true,
          },
        },
      },
    });
  }

  async getWorkOrderLabors(filter?: WorkOrderLaborFilter) {
    const where: any = {};

    if (filter?.workOrderId) {
      where.workOrderId = filter.workOrderId;
    }

    if (filter?.technicianId) {
      where.technicianId = filter.technicianId;
    }

    if (filter?.startDate || filter?.endDate) {
      where.createdAt = {};
      if (filter.startDate) {
        where.createdAt.gte = filter.startDate;
      }
      if (filter.endDate) {
        where.createdAt.lte = filter.endDate;
      }
    }

    if (filter?.category) {
      where.laborCatalog = {
        category: filter.category,
      };
    }

    return await this.prisma.workOrderLabor.findMany({
      where,
      include: {
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
            status: true,
          },
        },
        laborCatalog: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
          },
        },
        technician: {
          select: {
            id: true,
            userProfileId: true,
            employeeId: true,
            specialization: true,
            certifications: true,
            userProfile: {
              select: {
                id: true,
                name: true,
                profileImage: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWorkOrderLaborById(id: string) {
    const labor = await this.prisma.workOrderLabor.findUnique({
      where: { id },
      include: {
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
            status: true,
          },
        },
        laborCatalog: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
          },
        },
        technician: {
          select: {
            id: true,
            userProfileId: true,
            employeeId: true,
            specialization: true,
            certifications: true,
            userProfile: {
              select: {
                id: true,
                name: true,
                profileImage: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!labor) {
      throw new Error(`Work order labor with ID '${id}' not found`);
    }

    return labor;
  }

  async updateWorkOrderLabor(id: string, data: UpdateWorkOrderLaborRequest) {
    const existingLabor = await this.prisma.workOrderLabor.findUnique({
      where: { id },
    });

    if (!existingLabor) {
      throw new Error(`Work order labor with ID '${id}' not found`);
    }

    if (data.serviceId) {
      const service = await this.prisma.workOrderService.findFirst({
        where: {
          id: data.serviceId,
          workOrderId: existingLabor.workOrderId,
        },
      });

      if (!service) {
        throw new Error(`Service with ID '${data.serviceId}' not found in this work order`);
      }
    }

    if (data.laborCatalogId) {
      const laborCatalog = await this.prisma.laborCatalog.findUnique({
        where: { id: data.laborCatalogId },
      });

      if (!laborCatalog) {
        throw new Error(`Labor catalog with ID '${data.laborCatalogId}' not found`);
      }
    }

    if (data.technicianId) {
      const technician = await this.prisma.technician.findUnique({
        where: { id: data.technicianId },
      });

      if (!technician) {
        throw new Error(`Technician with ID '${data.technicianId}' not found`);
      }
    }

    return await this.prisma.workOrderLabor.update({
      where: { id },
      data,
      include: {
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
            status: true,
          },
        },
        laborCatalog: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
          },
        },
        technician: {
          select: {
            id: true,
            userProfileId: true,
          },
        },
      },
    });
  }

  async deleteWorkOrderLabor(id: string) {
    const labor = await this.prisma.workOrderLabor.findUnique({
      where: { id },
    });

    if (!labor) {
      throw new Error(`Work order labor with ID '${id}' not found`);
    }

    return await this.prisma.workOrderLabor.delete({
      where: { id },
    });
  }

  async getWorkOrderLaborSummary(workOrderId: string): Promise<LaborSummary> {
    const laborItems = await this.prisma.workOrderLabor.findMany({
      where: { workOrderId },
      include: {
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
            status: true,
          },
        },
        laborCatalog: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
          },
        },
        technician: {
          select: {
            id: true,
            userProfileId: true,
          },
        },
      },
    });

    const totalMinutes = laborItems.reduce((sum: number, item: any) => sum + Number(item.actualMinutes || 0), 0);
    const totalEstimatedMinutes = laborItems.reduce((sum: number, item: any) => sum + Number(item.estimatedMinutes || 0), 0);

    return {
      totalMinutes,
      totalEstimatedMinutes,
      laborItems,
    };
  }

  async getLaborCategories() {
    const categories = await this.prisma.laborCatalog.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });

    return categories
      .map((cat: any) => cat.category)
      .filter((category: any) => category !== null) as string[];
  }

  async getTechnicianLaborSummary(technicianId: string, startDate?: Date, endDate?: Date) {
    const where: any = { technicianId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const laborItems = await this.prisma.workOrderLabor.findMany({
      where,
      include: {
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
            status: true,
          },
        },
        laborCatalog: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
          },
        },
      },
    });

    const totalMinutes = laborItems.reduce((sum, item) => sum + Number(item.actualMinutes || 0), 0);
    const totalEstimatedMinutes = laborItems.reduce((sum, item) => sum + Number(item.estimatedMinutes || 0), 0);

    return {
      totalMinutes,
      totalEstimatedMinutes,
      laborItems,
    };
  }
}

