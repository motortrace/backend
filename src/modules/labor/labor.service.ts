import { PrismaClient } from '@prisma/client';
import {
  CreateLaborCatalogRequest,
  UpdateLaborCatalogRequest,
  CreateWorkOrderLabourRequest,
  UpdateWorkOrderLabourRequest,
  LaborCatalogWithUsage,
  WorkOrderLabourWithDetails,
  LaborSummary,
  LaborCatalogFilter,
  WorkOrderLabourFilter,
} from './labor.types';

const prisma = new PrismaClient();

export class LaborService {

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
          select: { labourItems: true },
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
          select: { labourItems: true },
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
          select: { labourItems: true },
        },
      },
    });

    if (!catalog) {
      throw new Error(`Labor catalog with ID '${id}' not found`);
    }

    if (catalog._count.labourItems > 0) {
      throw new Error(`Cannot delete labor catalog that is being used in ${catalog._count.labourItems} work orders`);
    }

    return await prisma.laborCatalog.delete({
      where: { id },
    });
  }

  async createWorkOrderLabour(data: CreateWorkOrderLabourRequest) {
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
      const technician = await prisma.staffMember.findUnique({
        where: { id: data.technicianId },
      });

      if (!technician) {
        throw new Error(`Technician with ID '${data.technicianId}' not found`);
      }
    }

    const subtotal = data.hours * data.rate;

    return await prisma.workOrderLabour.create({
      data: {
        workOrderId: data.workOrderId,
        cannedServiceId: data.cannedServiceId,
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
        cannedService: {
          select: {
            id: true,
            code: true,
            name: true,
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
            supabaseUserId: true,
          },
        },
      },
    });
  }

  async getWorkOrderLabours(filter?: WorkOrderLabourFilter) {
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

    return await prisma.workOrderLabour.findMany({
      where,
      include: {
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
            status: true,
          },
        },
        cannedService: {
          select: {
            id: true,
            code: true,
            name: true,
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
            supabaseUserId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWorkOrderLabourById(id: string) {
    const labour = await prisma.workOrderLabour.findUnique({
      where: { id },
      include: {
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
            status: true,
          },
        },
        cannedService: {
          select: {
            id: true,
            code: true,
            name: true,
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
            supabaseUserId: true,
          },
        },
      },
    });

    if (!labour) {
      throw new Error(`Work order labour with ID '${id}' not found`);
    }

    return labour;
  }

  async updateWorkOrderLabour(id: string, data: UpdateWorkOrderLabourRequest) {
    const existingLabour = await prisma.workOrderLabour.findUnique({
      where: { id },
    });

    if (!existingLabour) {
      throw new Error(`Work order labour with ID '${id}' not found`);
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
      const technician = await prisma.staffMember.findUnique({
        where: { id: data.technicianId },
      });

      if (!technician) {
        throw new Error(`Technician with ID '${data.technicianId}' not found`);
      }
    }

    const updateData: any = { ...data };

    if (data.hours !== undefined || data.rate !== undefined) {
      const hours = data.hours ?? Number(existingLabour.hours);
      const rate = data.rate ?? Number(existingLabour.rate);
      updateData.subtotal = hours * rate;
    }

    return await prisma.workOrderLabour.update({
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
        cannedService: {
          select: {
            id: true,
            code: true,
            name: true,
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
            supabaseUserId: true,
          },
        },
      },
    });
  }

  async deleteWorkOrderLabour(id: string) {
    const labour = await prisma.workOrderLabour.findUnique({
      where: { id },
    });

    if (!labour) {
      throw new Error(`Work order labour with ID '${id}' not found`);
    }

    return await prisma.workOrderLabour.delete({
      where: { id },
    });
  }

  async getWorkOrderLaborSummary(workOrderId: string): Promise<LaborSummary> {
    const laborItems = await prisma.workOrderLabour.findMany({
      where: { workOrderId },
      include: {
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
            status: true,
          },
        },
        cannedService: {
          select: {
            id: true,
            code: true,
            name: true,
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
            supabaseUserId: true,
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

    const laborItems = await prisma.workOrderLabour.findMany({
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
