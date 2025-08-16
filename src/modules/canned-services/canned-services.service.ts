import { PrismaClient, CannedService } from '@prisma/client';
import {
  CreateCannedServiceRequest,
  UpdateCannedServiceRequest,
  CannedServiceWithDetails,
  CannedServiceFilter,
  CannedServiceSummary,
} from './canned-services.types';

const prisma = new PrismaClient();

export class CannedServiceService {
  async createCannedService(data: CreateCannedServiceRequest): Promise<CannedServiceWithDetails> {
    return await prisma.$transaction(async (tx) => {
      const cannedService = await tx.cannedService.create({
        data: {
          code: data.code,
          name: data.name,
          description: data.description,
          duration: data.duration,
          price: data.price,
          isAvailable: data.isAvailable,
        },
      });

      if (data.laborOperations && data.laborOperations.length > 0) {
        await tx.cannedServiceLabor.createMany({
          data: data.laborOperations.map((op) => ({
            cannedServiceId: cannedService.id,
            laborCatalogId: op.laborCatalogId,
            sequence: op.sequence,
            notes: op.notes,
          })),
        });
      }

      if (data.partsCategories && data.partsCategories.length > 0) {
        await tx.cannedServicePartsCategory.createMany({
          data: data.partsCategories.map((cat) => ({
            cannedServiceId: cannedService.id,
            categoryId: cat.categoryId,
            isRequired: cat.isRequired,
            notes: cat.notes,
          })),
        });
      }

      return await this.getCannedServiceById(cannedService.id);
    });
  }

  async getCannedServiceById(id: string): Promise<CannedServiceWithDetails | null> {
    return await prisma.cannedService.findUnique({
      where: { id },
      include: {
        laborOperations: {
          include: {
            laborCatalog: {
              select: {
                id: true,
                name: true,
                description: true,
                estimatedHours: true,
                hourlyRate: true,
              },
            },
          },
          orderBy: {
            sequence: 'asc',
          },
        },
        partsCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            isRequired: 'desc',
          },
        },
        _count: {
          select: {
            appointmentServices: true,
            services: true,
          },
        },
      },
    });
  }

  async getCannedServices(filter: CannedServiceFilter = {}, page = 1, limit = 20): Promise<{
    services: CannedServiceWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { code: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    
    if (filter.isAvailable !== undefined) {
      where.isAvailable = filter.isAvailable;
    }
    
    if (filter.minPrice !== undefined) {
      where.price = { gte: filter.minPrice };
    }
    
    if (filter.maxPrice !== undefined) {
      where.price = { ...where.price, lte: filter.maxPrice };
    }
    
    if (filter.minDuration !== undefined) {
      where.duration = { gte: filter.minDuration };
    }
    
    if (filter.maxDuration !== undefined) {
      where.duration = { ...where.duration, lte: filter.maxDuration };
    }

    const [services, total] = await Promise.all([
      prisma.cannedService.findMany({
        where,
        include: {
          laborOperations: {
            include: {
              laborCatalog: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  estimatedHours: true,
                  hourlyRate: true,
                },
              },
            },
            orderBy: {
              sequence: 'asc',
            },
          },
          partsCategories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              isRequired: 'desc',
            },
          },
          _count: {
            select: {
              appointmentServices: true,
              services: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.cannedService.count({ where }),
    ]);

    return {
      services,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateCannedService(id: string, data: UpdateCannedServiceRequest): Promise<CannedServiceWithDetails> {
    return await prisma.$transaction(async (tx) => {
      const updateData: any = {};
      
      if (data.code !== undefined) updateData.code = data.code;
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.duration !== undefined) updateData.duration = data.duration;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;

      await tx.cannedService.update({
        where: { id },
        data: updateData,
      });

      if (data.laborOperations !== undefined) {
        await tx.cannedServiceLabor.deleteMany({
          where: { cannedServiceId: id },
        });

        if (data.laborOperations.length > 0) {
          await tx.cannedServiceLabor.createMany({
            data: data.laborOperations.map((op) => ({
              cannedServiceId: id,
              laborCatalogId: op.laborCatalogId,
              sequence: op.sequence,
              notes: op.notes,
            })),
          });
        }
      }

      if (data.partsCategories !== undefined) {
        await tx.cannedServicePartsCategory.deleteMany({
          where: { cannedServiceId: id },
        });

        if (data.partsCategories.length > 0) {
          await tx.cannedServicePartsCategory.createMany({
            data: data.partsCategories.map((cat) => ({
              cannedServiceId: id,
              categoryId: cat.categoryId,
              isRequired: cat.isRequired,
              notes: cat.notes,
            })),
          });
        }
      }

      return await this.getCannedServiceById(id);
    });
  }

  async deleteCannedService(id: string): Promise<boolean> {
    try {
      const service = await prisma.cannedService.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              appointmentServices: true,
              services: true,
            },
          },
        },
      });

      if (!service) {
        throw new Error('Canned service not found');
      }

      if (service._count.appointmentServices > 0 || service._count.services > 0) {
        throw new Error(`Cannot delete service that has ${service._count.appointmentServices} appointments and ${service._count.services} work orders`);
      }

      await prisma.cannedService.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  async getCannedServiceSummary(): Promise<CannedServiceSummary> {
    const [
      totalServices,
      availableServices,
      priceStats,
      durationStats,
    ] = await Promise.all([
      prisma.cannedService.count(),
      prisma.cannedService.count({ where: { isAvailable: true } }),
      prisma.cannedService.aggregate({
        _avg: { price: true },
        _sum: { price: true },
      }),
      prisma.cannedService.aggregate({
        _avg: { duration: true },
      }),
    ]);

    return {
      totalServices,
      availableServices,
      totalValue: Number(priceStats._sum.price) || 0,
      averagePrice: Number(priceStats._avg.price) || 0,
      averageDuration: Number(durationStats._avg.duration) || 0,
    };
  }

  async getAvailableCannedServices(): Promise<CannedServiceWithDetails[]> {
    return await prisma.cannedService.findMany({
      where: { isAvailable: true },
      include: {
        laborOperations: {
          include: {
            laborCatalog: {
              select: {
                id: true,
                name: true,
                description: true,
                estimatedHours: true,
                hourlyRate: true,
              },
            },
          },
          orderBy: {
            sequence: 'asc',
          },
        },
        partsCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            isRequired: 'desc',
          },
        },
        _count: {
          select: {
            appointmentServices: true,
            services: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
