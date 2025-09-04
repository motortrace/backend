import { PrismaClient } from '@prisma/client';
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

const prisma = new PrismaClient();

export class LaborService {

  // Simple Labor Creation (following appointments pattern)
  async createLabor(data: CreateLaborRequest): Promise<WorkOrderLaborWithDetails> {
    // Validate work order exists
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: data.workOrderId },
    });

    if (!workOrder) {
      throw new Error(`Work order with ID '${data.workOrderId}' not found`);
    }

    // Validate technician exists if provided
    if (data.technicianId) {
      const technician = await prisma.technician.findUnique({
        where: { id: data.technicianId },
      });

      if (!technician) {
        throw new Error(`Technician with ID '${data.technicianId}' not found`);
      }
    }

    // Calculate subtotal
    const subtotal = data.hours * data.rate;

    // Create labor record
    const labor = await prisma.workOrderLabor.create({
      data: {
        workOrderId: data.workOrderId,
        description: data.description,
        hours: data.hours,
        rate: data.rate,
        subtotal,
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
    const existingCatalog = await prisma.laborCatalog.findUnique({
      where: { code: data.code },
    });

    if (existingCatalog) {
      throw new Error(`Labor catalog with code '${data.code}' already exists`);
    }

    return await prisma.laborCatalog.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        estimatedHours: data.estimatedHours,
        hourlyRate: data.hourlyRate,
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

    return await prisma.laborCatalog.findMany({
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
    const catalog = await prisma.laborCatalog.findUnique({
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
    const existingCatalog = await prisma.laborCatalog.findUnique({
      where: { id },
    });

    if (!existingCatalog) {
      throw new Error(`Labor catalog with ID '${id}' not found`);
    }

    if (data.code && data.code !== existingCatalog.code) {
      const codeExists = await prisma.laborCatalog.findUnique({
        where: { code: data.code },
      });

      if (codeExists) {
        throw new Error(`Labor catalog with code '${data.code}' already exists`);
      }
    }

    return await prisma.laborCatalog.update({
      where: { id },
      data,
    });
  }

  async deleteLaborCatalog(id: string) {
    const catalog = await prisma.laborCatalog.findUnique({
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

    return await prisma.laborCatalog.delete({
      where: { id },
    });
  }

  async createWorkOrderLabor(data: CreateWorkOrderLaborRequest) {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: data.workOrderId },
    });

    if (!workOrder) {
      throw new Error(`Work order with ID '${data.workOrderId}' not found`);
    }

    if (data.laborCatalogId) {
      const laborCatalog = await prisma.laborCatalog.findUnique({
        where: { id: data.laborCatalogId },
      });

      if (!laborCatalog) {
        throw new Error(`Labor catalog with ID '${data.laborCatalogId}' not found`);
      }
    }

    if (data.cannedServiceId) {
      const cannedService = await prisma.cannedService.findUnique({
        where: { id: data.cannedServiceId },
      });

      if (!cannedService) {
        throw new Error(`Canned service with ID '${data.cannedServiceId}' not found`);
      }
    }

    if (data.technicianId) {
      const technician = await prisma.technician.findUnique({
        where: { id: data.technicianId },
      });

      if (!technician) {
        throw new Error(`Technician with ID '${data.technicianId}' not found`);
      }
    }

    const subtotal = data.hours * data.rate;

    return await prisma.workOrderLabor.create({
      data: {
        workOrderId: data.workOrderId,
        laborCatalogId: data.laborCatalogId,
        description: data.description,
        hours: data.hours,
        rate: data.rate,
        subtotal,
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

    return await prisma.workOrderLabor.findMany({
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWorkOrderLaborById(id: string) {
    const labor = await prisma.workOrderLabor.findUnique({
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
    const existingLabor = await prisma.workOrderLabor.findUnique({
      where: { id },
    });

    if (!existingLabor) {
      throw new Error(`Work order labor with ID '${id}' not found`);
    }

    if (data.laborCatalogId) {
      const laborCatalog = await prisma.laborCatalog.findUnique({
        where: { id: data.laborCatalogId },
      });

      if (!laborCatalog) {
        throw new Error(`Labor catalog with ID '${data.laborCatalogId}' not found`);
      }
    }

    if (data.cannedServiceId) {
      const cannedService = await prisma.cannedService.findUnique({
        where: { id: data.cannedServiceId },
      });

      if (!cannedService) {
        throw new Error(`Canned service with ID '${data.cannedServiceId}' not found`);
      }
    }

    if (data.technicianId) {
      const technician = await prisma.technician.findUnique({
        where: { id: data.technicianId },
      });

      if (!technician) {
        throw new Error(`Technician with ID '${data.technicianId}' not found`);
      }
    }

    const updateData: any = { ...data };

    if (data.hours !== undefined || data.rate !== undefined) {
      const hours = data.hours ?? Number(existingLabor.hours);
      const rate = data.rate ?? Number(existingLabor.rate);
      updateData.subtotal = hours * rate;
    }

    return await prisma.workOrderLabor.update({
      where: { id },
      data: updateData,
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
    const labor = await prisma.workOrderLabor.findUnique({
      where: { id },
    });

    if (!labor) {
      throw new Error(`Work order labor with ID '${id}' not found`);
    }

    return await prisma.workOrderLabor.delete({
      where: { id },
    });
  }

  async getWorkOrderLaborSummary(workOrderId: string): Promise<LaborSummary> {
    const laborItems = await prisma.workOrderLabor.findMany({
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

    const totalHours = laborItems.reduce((sum: number, item: any) => sum + Number(item.hours), 0);
    const totalCost = laborItems.reduce((sum: number, item: any) => sum + Number(item.subtotal), 0);

    return {
      totalHours,
      totalCost,
      laborItems,
    };
  }

  async getLaborCategories() {
    const categories = await prisma.laborCatalog.findMany({
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

    const laborItems = await prisma.workOrderLabor.findMany({
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

    const totalHours = laborItems.reduce((sum, item) => sum + Number(item.hours), 0);
    const totalCost = laborItems.reduce((sum, item) => sum + Number(item.subtotal), 0);

    return {
      totalHours,
      totalCost,
      laborItems,
    };
  }
}
