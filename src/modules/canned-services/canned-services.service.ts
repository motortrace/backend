import { PrismaClient, CannedService } from '@prisma/client';
import {
  CreateCannedServiceRequest,
  UpdateCannedServiceRequest,
  CannedServiceFilters,
} from './canned-services.types';

const prisma = new PrismaClient();

export class CannedServiceService {
  // Create a new canned service
  async createCannedService(data: CreateCannedServiceRequest): Promise<CannedService> {
    // Check if code already exists
    const existingService = await prisma.cannedService.findUnique({
      where: { code: data.code },
    });

    if (existingService) {
      throw new Error(`Canned service with code '${data.code}' already exists`);
    }

    const cannedService = await prisma.cannedService.create({
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

  // Get all canned services with optional filters
  async getCannedServices(filters: CannedServiceFilters = {}): Promise<CannedService[]> {
    const where: any = {};

    if (filters.isAvailable !== undefined) {
      where.isAvailable = filters.isAvailable;
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
      ];
    }

    const cannedServices = await prisma.cannedService.findMany({
      where,
      orderBy: [
        { isAvailable: 'desc' },
        { name: 'asc' },
      ],
    });

    return cannedServices;
  }

  // Get canned service by ID
  async getCannedServiceById(id: string): Promise<CannedService | null> {
    const cannedService = await prisma.cannedService.findUnique({
      where: { id },
    });

    return cannedService;
  }

  // Get canned service by code
  async getCannedServiceByCode(code: string): Promise<CannedService | null> {
    const cannedService = await prisma.cannedService.findUnique({
      where: { code },
    });

    return cannedService;
  }

  // Update canned service
  async updateCannedService(id: string, data: UpdateCannedServiceRequest): Promise<CannedService> {
    // Check if code is being updated and if it already exists
    if (data.code) {
      const existingService = await prisma.cannedService.findFirst({
        where: {
          code: data.code,
          id: { not: id },
        },
      });

      if (existingService) {
        throw new Error(`Canned service with code '${data.code}' already exists`);
      }
    }

    const cannedService = await prisma.cannedService.update({
      where: { id },
      data,
    });

    return cannedService;
  }

  // Delete canned service
  async deleteCannedService(id: string): Promise<void> {
    // Check if the service is being used in any work orders
    const workOrderServices = await prisma.workOrderService.findFirst({
      where: { cannedServiceId: id },
    });

    if (workOrderServices) {
      throw new Error('Cannot delete canned service that is being used in work orders');
    }

    // Check if the service is being used in any appointments
    const appointmentServices = await prisma.appointmentCannedService.findFirst({
      where: { cannedServiceId: id },
    });

    if (appointmentServices) {
      throw new Error('Cannot delete canned service that is being used in appointments');
    }

    await prisma.cannedService.delete({
      where: { id },
    });
  }

  // Get available canned services (isAvailable = true)
  async getAvailableCannedServices(): Promise<CannedService[]> {
    return this.getCannedServices({ isAvailable: true });
  }

  // Toggle availability of a canned service
  async toggleAvailability(id: string): Promise<CannedService> {
    const currentService = await prisma.cannedService.findUnique({
      where: { id },
    });

    if (!currentService) {
      throw new Error('Canned service not found');
    }

    const updatedService = await prisma.cannedService.update({
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

    const result = await prisma.cannedService.updateMany({
      data: {
        price: {
          multiply: multiplier,
        },
      },
    });

    return result.count;
  }
}
