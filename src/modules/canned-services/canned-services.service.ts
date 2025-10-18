import { CannedService } from '@prisma/client';
import {
  CreateCannedServiceRequest,
  UpdateCannedServiceRequest,
  CannedServiceFilters,
  CannedServiceDetails,
} from './canned-services.types';
import { PrismaClient } from '@prisma/client';

export class CannedServiceService {
  constructor(private readonly prisma: PrismaClient) {}

  // Create a new canned service
  async createCannedService(data: CreateCannedServiceRequest): Promise<CannedService> {
    // Check if code already exists
    const existingService = await this.prisma.cannedService.findFirst({
      where: { code: data.code },
    });

    if (existingService) {
      throw new Error(`Canned service with code '${data.code}' already exists`);
    }

    const cannedService = await this.prisma.cannedService.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
        isAvailable: data.isAvailable ?? true,
      },
    });

    return cannedService;
  }

  // New method added by Jabir to support canned service creation with labors functionality
  async createCannedServiceWithLabor(
    data: CreateCannedServiceRequest,
    laborOperations: Array<{ laborCatalogId: string; sequence: number; notes?: string }>
  ): Promise<any> {
    // Check if code already exists
    const existingService = await this.prisma.cannedService.findFirst({
      where: { code: data.code },
    });

    if (existingService) {
      throw new Error(`Canned service with code '${data.code}' already exists`);
    }

    // Verify all labor catalog IDs exist
    const laborCatalogIds = laborOperations.map(op => op.laborCatalogId);
    const laborCatalogs = await this.prisma.laborCatalog.findMany({
      where: {
        id: { in: laborCatalogIds },
        isActive: true
      },
    });

    if (laborCatalogs.length !== laborCatalogIds.length) {
      const invalidIds = laborCatalogIds.filter(id =>
        !laborCatalogs.some(lc => lc.id === id)
      );
      throw new Error(`Invalid or inactive labor catalog IDs: ${invalidIds.join(', ')}`);
    }

    // Create the canned service with labor operations
    const cannedService = await this.prisma.cannedService.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
        isAvailable: data.isAvailable ?? true,
        variantLabel: data.variantLabel,
        vehicleType: data.vehicleType,
        hasOptionalParts: data.hasOptionalParts ?? false,
        hasOptionalLabor: data.hasOptionalLabor ?? false,
        category: data.category,
        minVehicleAge: data.minVehicleAge,
        maxVehicleMileage: data.maxVehicleMileage,
        isArchived: data.isArchived ?? false,
        laborOperations: {
          create: laborOperations.map(op => ({
            laborCatalogId: op.laborCatalogId,
            sequence: op.sequence,
            notes: op.notes
          }))
        }
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        duration: true,
        price: true,
        isAvailable: true,
        variantLabel: true,
        vehicleType: true,
        hasOptionalParts: true,
        hasOptionalLabor: true,
        category: true,
        minVehicleAge: true,
        maxVehicleMileage: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
        laborOperations: {
          include: {
            laborCatalog: true
          }
        },
        partsCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Transform the data to be more user-friendly
    return {
      ...cannedService,
      description: cannedService.description || undefined, // Convert null to undefined
      laborOperations: cannedService.laborOperations.map((op: any) => ({
        id: op.id,
        sequence: op.sequence,
        notes: op.notes || undefined, // Convert null to undefined
        labor: op.laborCatalog
      })),
      partsCategories: cannedService.partsCategories.map((pc: any) => ({
        id: pc.id,
        isRequired: pc.isRequired,
        notes: pc.notes || undefined, // Convert null to undefined
        category: pc.category
      })),
      hasOptionalParts: cannedService.hasOptionalParts,
      hasOptionalLabor: cannedService.hasOptionalLabor,
      isArchived: cannedService.isArchived
    };
  }

  // Simak's method to get all canned services with optional filters
  // async getCannedServices(filters: CannedServiceFilters = {}): Promise<CannedService[]> {
  //   const where: any = {};

  //   if (filters.isAvailable !== undefined) {
  //     where.isAvailable = filters.isAvailable;
  //   }

  //   if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
  //     where.price = {};
  //     if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
  //     if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  //   }

  //   if (filters.search) {
  //     where.OR = [
  //       { name: { contains: filters.search, mode: 'insensitive' } },
  //       { description: { contains: filters.search, mode: 'insensitive' } },
  //       { code: { contains: filters.search, mode: 'insensitive' } },
  //     ];
  //   }

  //   const cannedServices = await this.prisma.cannedService.findMany({
  //     where,
  //     orderBy: [
  //       { isAvailable: 'desc' },
  //       { name: 'asc' },
  //     ],
  //   });

  //   return cannedServices;
  // }

  // // Get canned service by ID
  // async getCannedServiceById(id: string): Promise<CannedService | null> {
  //   const cannedService = await this.prisma.cannedService.findUnique({
  //     where: { id },
  //   });

  //   return cannedService;
  // }

  // // Get canned service by code
  // async getCannedServiceByCode(code: string): Promise<CannedService | null> {
  //   const cannedService = await this.prisma.cannedService.findUnique({
  //     where: { code },
  //   });

  //   return cannedService;
  // }



  // Jabir's updated method to get all canned services with optional filters
  async getCannedServices(filters: CannedServiceFilters = {}): Promise<CannedService[]> {
    const where: any = {};

    if (filters.isAvailable !== undefined) {
      where.isAvailable = filters.isAvailable;
      where.isArchived = false; // Don't show archived services by default
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.vehicleType) {
      where.vehicleType = filters.vehicleType;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
        { variantLabel: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const cannedServices = await this.prisma.cannedService.findMany({
      where,
      include: {
        laborOperations: {
          include: {
            laborCatalog: {
              select: {
                id: true,
                code: true,
                name: true,
                estimatedMinutes: true,
                
                isActive: true
              }
            }
          },
          orderBy: {
            sequence: 'asc'
          }
        }
      },
      orderBy: [
        { isAvailable: 'desc' },
        { name: 'asc' },
      ],
    });

    // Transform to include serviceIds array for frontend compatibility
    return cannedServices.map(service => ({
      ...service,
      serviceIds: service.laborOperations.map(op => op.laborCatalog.id)
    }));

    return cannedServices;
  }

  // Simak's method to get a canned service by ID
  // async getCannedServiceById(id: string): Promise<CannedService | null> {
  //   const cannedService = await this.prisma.cannedService.findUnique({
  //     where: { id },
  //   });

  //   return cannedService;
  // }




  // Jabir's updated method to get a canned service by ID
  async getCannedServiceById(id: string): Promise<any> {
    const cannedService = await this.prisma.cannedService.findUnique({
      where: { id },
      include: {
        laborOperations: {
          include: {
            laborCatalog: {
              select: {
                id: true,
                code: true,
                name: true,
                estimatedMinutes: true,
                
                isActive: true
              }
            }
          },
          orderBy: {
            sequence: 'asc'
          }
        }
      }
    });

    if (!cannedService) return null;

    // Transform for frontend
    return {
      ...cannedService,
      serviceIds: cannedService.laborOperations.map(op => op.laborCatalog.id)
    };
  }


  // Simak's method to get a canned service by code
  // async getCannedServiceByCode(code: string): Promise<CannedService | null> {
  //   const cannedService = await this.prisma.cannedService.findUnique({
  //     where: { code },
  //   });

  //   return cannedService;
  // }


  // Jabir's updated method to get a canned service by code
  async getCannedServiceByCode(code: string): Promise<any> {
    const cannedService = await this.prisma.cannedService.findFirst({
      where: { code },
      include: {
        laborOperations: {
          include: {
            laborCatalog: {
              select: {
                id: true,
                code: true,
                name: true,
                estimatedMinutes: true,
                
                isActive: true
              }
            }
          },
          orderBy: {
            sequence: 'asc'
          }
        }
      }
    });

    if (!cannedService) return null;

    return {
      ...cannedService,
      serviceIds: cannedService.laborOperations.map(op => op.laborCatalog.id)
    };
  }

  // Get canned service with detailed information including labor and parts
  async getCannedServiceDetails(id: string): Promise<CannedServiceDetails | null> {
    const cannedService = await this.prisma.cannedService.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        duration: true,
        price: true,
        isAvailable: true,
        variantLabel: true,
        vehicleType: true,
        hasOptionalParts: true,
        hasOptionalLabor: true,
        category: true,
        minVehicleAge: true,
        maxVehicleMileage: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
        laborOperations: {
          include: {
            laborCatalog: {
              select: {
                id: true,
                code: true,
                name: true,
                description: true,
                estimatedMinutes: true,
                
                category: true,
                isActive: true
              }
            }
          },
          orderBy: {
            sequence: 'asc'
          }
        },
        partsCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!cannedService) {
      return null;
    }

    // Transform the data to be more user-friendly
    return {
      ...cannedService,
      description: cannedService.description || undefined, // Convert null to undefined
      variantLabel: cannedService.variantLabel || undefined, // Convert null to undefined
      vehicleType: cannedService.vehicleType || undefined, // Convert null to undefined
      category: cannedService.category || undefined, // Convert null to undefined
      minVehicleAge: cannedService.minVehicleAge || undefined, // Convert null to undefined
      maxVehicleMileage: cannedService.maxVehicleMileage || undefined, // Convert null to undefined
      laborOperations: cannedService.laborOperations.map((op: any) => ({
        id: op.id,
        sequence: op.sequence,
        notes: op.notes || undefined, // Convert null to undefined
        labor: op.laborCatalog
      })),
      partsCategories: cannedService.partsCategories.map((pc: any) => ({
        id: pc.id,
        isRequired: pc.isRequired,
        notes: pc.notes || undefined, // Convert null to undefined
        category: pc.category
      })),
      hasOptionalParts: cannedService.hasOptionalParts,
      hasOptionalLabor: cannedService.hasOptionalLabor,
      isArchived: cannedService.isArchived
    };
  }

  // Jabir introducing this new private method to support updateCannedService
  private transformCannedServiceResponse(cannedService: any): any {
    if (!cannedService) return null;

    return {
      id: cannedService.id,
      code: cannedService.code,
      name: cannedService.name,
      description: cannedService.description,
      duration: cannedService.duration,
      price: cannedService.price,
      isAvailable: cannedService.isAvailable,
      createdAt: cannedService.createdAt,
      updatedAt: cannedService.updatedAt,
      serviceIds: cannedService.laborOperations?.map((op: any) => op.laborCatalog.id) || [],
      laborOperations: cannedService.laborOperations?.map((op: any) => ({
        id: op.id,
        sequence: op.sequence,
        notes: op.notes,
        laborCatalog: {
          id: op.laborCatalog.id,
          code: op.laborCatalog.code,
          name: op.laborCatalog.name,
          estimatedMinutes: op.laborCatalog.estimatedMinutes,
          isActive: op.laborCatalog.isActive
        }
      })) || []
    };
  }


  // Simak's method to update a canned service
  // async updateCannedService(id: string, data: UpdateCannedServiceRequest): Promise<CannedService> {
  //   // Check if code is being updated and if it already exists
  //   if (data.code) {
  //     const existingService = await this.prisma.cannedService.findFirst({
  //       where: {
  //         code: data.code,
  //         id: { not: id },
  //       },
  //     });

  //     if (existingService) {
  //       throw new Error(`Canned service with code '${data.code}' already exists`);
  //     }
  //   }

  //   const cannedService = await this.prisma.cannedService.update({
  //     where: { id },
  //     data,
  //   });

  //   return cannedService;
  // }

  // Jabirs updated method to update a canned service
  async updateCannedService(id: string, data: UpdateCannedServiceRequest): Promise<any> {
    // Check if code is being updated and if it already exists
    if (data.code) {
      const existingService = await this.prisma.cannedService.findFirst({
        where: {
          code: data.code,
          id: { not: id },
        },
      });

      if (existingService) {
        throw new Error(`Canned service with code '${data.code}' already exists`);
      }
    }

    // Extract labor operations first and create a clean data object for Prisma
    const laborOperations = data.laborOperations;

    // Create a Prisma-compatible data object without laborOperations
    const prismaData: any = {
      code: data.code,
      name: data.name,
      description: data.description,
      duration: data.duration,
      price: data.price,
      isAvailable: data.isAvailable,
    };

    // Remove undefined properties to avoid Prisma errors
    Object.keys(prismaData).forEach(key => {
      if (prismaData[key] === undefined) {
        delete prismaData[key];
      }
    });

    // Handle labor operations if provided
    if (laborOperations !== undefined) {
      // First, delete existing labor operations
      await this.prisma.cannedServiceLabor.deleteMany({
        where: { cannedServiceId: id }
      });

      // Then create new ones if provided
      if (laborOperations.length > 0) {
        // Validate labor catalog IDs
        const laborCatalogIds = laborOperations.map(op => op.laborCatalogId);
        const laborCatalogs = await this.prisma.laborCatalog.findMany({
          where: {
            id: { in: laborCatalogIds },
            isActive: true
          },
        });

        if (laborCatalogs.length !== laborCatalogIds.length) {
          const invalidIds = laborCatalogIds.filter(id =>
            !laborCatalogs.some(lc => lc.id === id)
          );
          throw new Error(`Invalid or inactive labor catalog IDs: ${invalidIds.join(', ')}`);
        }

        // Create new labor operations
        await this.prisma.cannedServiceLabor.createMany({
          data: laborOperations.map(op => ({
            cannedServiceId: id,
            laborCatalogId: op.laborCatalogId,
            sequence: op.sequence,
            notes: op.notes
          }))
        });
      }
    }

    // Only update if there are actual fields to update (excluding laborOperations)
    let cannedService;
    if (Object.keys(prismaData).length > 0) {
      cannedService = await this.prisma.cannedService.update({
        where: { id },
        data: prismaData,
        include: {
          laborOperations: {
            include: {
              laborCatalog: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  estimatedMinutes: true,
                  
                  isActive: true
                }
              }
            }
          }
        }
      });
    } else {
      // If only laborOperations were updated, fetch the updated service
      cannedService = await this.prisma.cannedService.findUnique({
        where: { id },
        include: {
          laborOperations: {
            include: {
              laborCatalog: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  estimatedMinutes: true,
                  
                  isActive: true
                }
              }
            }
          }
        }
      });
    }

    return this.transformCannedServiceResponse(cannedService);
  }

  // Delete canned service
  async deleteCannedService(id: string): Promise<void> {
    // Check if the service is being used in any work orders
    const workOrderServices = await this.prisma.workOrderService.findFirst({
      where: { cannedServiceId: id },
    });

    if (workOrderServices) {
      throw new Error('Cannot delete canned service that is being used in work orders');
    }

    // Check if the service is being used in any appointments
    const appointmentServices = await this.prisma.appointmentCannedService.findFirst({
      where: { cannedServiceId: id },
    });

    if (appointmentServices) {
      throw new Error('Cannot delete canned service that is being used in appointments');
    }

    await this.prisma.cannedService.delete({
      where: { id },
    });
  }

  // Get available canned services (isAvailable = true)
  async getAvailableCannedServices(): Promise<CannedService[]> {
    return this.getCannedServices({ isAvailable: true });
  }

  // Toggle availability of a canned service
  async toggleAvailability(id: string): Promise<CannedService> {
    const currentService = await this.prisma.cannedService.findUnique({
      where: { id },
    });

    if (!currentService) {
      throw new Error('Canned service not found');
    }

    const updatedService = await this.prisma.cannedService.update({
      where: { id },
      data: { isAvailable: !currentService.isAvailable },
    });

    return updatedService;
  }

  // Search canned services
  async searchCannedServices(query: string, filters: CannedServiceFilters = {}): Promise<CannedService[]> {
    const searchFilters: CannedServiceFilters = {
      ...filters,
      search: query,
    };

    return this.getCannedServices(searchFilters);
  }

  // Get canned services by category (if you add category field later)
  async getCannedServicesByCategory(category: string): Promise<CannedService[]> {
    // This would require adding a category field to the CannedService model
    // For now, we'll return all services
    return this.getCannedServices();
  }

  // Bulk update canned service prices (e.g., for annual price increases)
  async bulkUpdatePrices(percentageIncrease: number): Promise<number> {
    if (percentageIncrease < -100) {
      throw new Error('Percentage decrease cannot exceed 100%');
    }

    const multiplier = 1 + (percentageIncrease / 100);

    const result = await this.prisma.cannedService.updateMany({
      data: {
        price: {
          multiply: multiplier,
        },
      },
    });

    return result.count;
  }

  // Analytics: Get service popularity (booking counts)
  async getServicePopularity(): Promise<Array<{
    serviceId: string;
    serviceName: string;
    serviceCode: string;
    bookingCount: number;
  }>> {
    const result = await this.prisma.appointmentCannedService.groupBy({
      by: ['cannedServiceId'],
      _count: {
        cannedServiceId: true,
      },
      orderBy: {
        _count: {
          cannedServiceId: 'desc',
        },
      },
    });

    // Get service details for each result
    const servicesWithDetails = await Promise.all(
      result.map(async (item) => {
        const service = await this.prisma.cannedService.findUnique({
          where: { id: item.cannedServiceId },
          select: {
            id: true,
            name: true,
            code: true,
          },
        });

        return {
          serviceId: item.cannedServiceId,
          serviceName: service?.name || 'Unknown Service',
          serviceCode: service?.code || 'Unknown',
          bookingCount: item._count.cannedServiceId,
        };
      })
    );

    return servicesWithDetails;
  }

  // Analytics: Get revenue by service
  async getRevenueByService(): Promise<Array<{
    serviceId: string;
    serviceName: string;
    serviceCode: string;
    totalRevenue: number;
    bookingCount: number;
    averageRevenue: number;
  }>> {
    // Get revenue data from work order services
    const revenueData = await this.prisma.workOrderService.groupBy({
      by: ['cannedServiceId'],
      where: {
        cannedServiceId: {
          not: null,
        },
        workOrder: {
          paymentStatus: {
            in: ['PAID', 'COMPLETED'],
          },
        },
      },
      _sum: {
        subtotal: true,
      },
      _count: {
        cannedServiceId: true,
      },
      orderBy: {
        _sum: {
          subtotal: 'desc',
        },
      },
    });

    // Get service details for each result
    const servicesWithRevenue = await Promise.all(
      revenueData.map(async (item) => {
        const service = await this.prisma.cannedService.findUnique({
          where: { id: item.cannedServiceId! },
          select: {
            id: true,
            name: true,
            code: true,
          },
        });

        const totalRevenue = Number(item._sum.subtotal) || 0;
        const bookingCount = item._count.cannedServiceId;

        return {
          serviceId: item.cannedServiceId!,
          serviceName: service?.name || 'Unknown Service',
          serviceCode: service?.code || 'Unknown',
          totalRevenue,
          bookingCount,
          averageRevenue: bookingCount > 0 ? totalRevenue / bookingCount : 0,
        };
      })
    );

    return servicesWithRevenue;
  }

  // Analytics: Get service categories distribution
  async getServiceCategories(): Promise<Array<{
    category: string;
    serviceCount: number;
    totalRevenue: number;
  }>> {
    // Get all services with categories
    const services = await this.prisma.cannedService.findMany({
      where: {
        category: {
          not: null,
        },
        isAvailable: true,
        isArchived: false,
      },
      select: {
        id: true,
        category: true,
      },
    });

    // Group by category and count
    const categoryMap = new Map<string, { serviceIds: string[]; count: number }>();

    services.forEach(service => {
      if (service.category) {
        const existing = categoryMap.get(service.category) || { serviceIds: [], count: 0 };
        existing.serviceIds.push(service.id);
        existing.count += 1;
        categoryMap.set(service.category, existing);
      }
    });

    // Calculate revenue for each category
    const categoriesWithRevenue = await Promise.all(
      Array.from(categoryMap.entries()).map(async ([category, data]) => {
        // Calculate total revenue from work orders for services in this category
        const revenueResult = await this.prisma.workOrderService.aggregate({
          where: {
            cannedServiceId: {
              in: data.serviceIds,
            },
            workOrder: {
              paymentStatus: {
                in: ['PAID', 'COMPLETED'],
              },
            },
          },
          _sum: {
            subtotal: true,
          },
        });

        return {
          category,
          serviceCount: data.count,
          totalRevenue: Number(revenueResult._sum.subtotal) || 0,
        };
      })
    );

    // Sort by service count descending
    return categoriesWithRevenue.sort((a, b) => b.serviceCount - a.serviceCount);
  }
}

