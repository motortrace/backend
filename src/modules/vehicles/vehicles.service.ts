import { PrismaClient } from '@prisma/client';
import { CreateVehicleRequest, UpdateVehicleRequest, VehicleResponse, VehicleFilters, VehicleStatistics } from './vehicles.types';

const prisma = new PrismaClient();

export class VehiclesService {
  // Create a new vehicle
  async createVehicle(data: CreateVehicleRequest): Promise<VehicleResponse> {
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Check if VIN is unique (if provided)
    if (data.vin) {
      const existingVehicle = await prisma.vehicle.findUnique({
        where: { vin: data.vin },
      });
      if (existingVehicle) {
        throw new Error('Vehicle with this VIN already exists');
      }
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        customerId: data.customerId,
        make: data.make,
        model: data.model,
        year: data.year,
        vin: data.vin,
        licensePlate: data.licensePlate,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return vehicle as VehicleResponse;
  }

  // Get vehicle by ID
  async getVehicleById(id: string): Promise<VehicleResponse> {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    return vehicle as VehicleResponse;
  }

  // Get all vehicles with filters
  async getVehicles(filters: VehicleFilters): Promise<VehicleResponse[]> {
    const where: any = {};

    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.make) where.make = { contains: filters.make, mode: 'insensitive' };
    if (filters.model) where.model = { contains: filters.model, mode: 'insensitive' };
    if (filters.year) where.year = filters.year;
    if (filters.vin) where.vin = { contains: filters.vin, mode: 'insensitive' };
    if (filters.licensePlate) where.licensePlate = { contains: filters.licensePlate, mode: 'insensitive' };

    // Search across multiple fields
    if (filters.search) {
      where.OR = [
        { make: { contains: filters.search, mode: 'insensitive' } },
        { model: { contains: filters.search, mode: 'insensitive' } },
        { vin: { contains: filters.search, mode: 'insensitive' } },
        { licensePlate: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return vehicles as VehicleResponse[];
  }

  // Update vehicle
  async updateVehicle(id: string, data: UpdateVehicleRequest): Promise<VehicleResponse> {
    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id },
    });
    if (!existingVehicle) {
      throw new Error('Vehicle not found');
    }

    // Check if VIN is unique (if being updated)
    if (data.vin && data.vin !== existingVehicle.vin) {
      const duplicateVin = await prisma.vehicle.findUnique({
        where: { vin: data.vin },
      });
      if (duplicateVin) {
        throw new Error('Vehicle with this VIN already exists');
      }
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return vehicle as VehicleResponse;
  }

  // Delete vehicle
  async deleteVehicle(id: string): Promise<void> {
    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    // Check if vehicle has associated work orders
    const workOrders = await prisma.workOrder.findMany({
      where: { vehicleId: id },
    });
    if (workOrders.length > 0) {
      throw new Error('Cannot delete vehicle with associated work orders');
    }

    await prisma.vehicle.delete({
      where: { id },
    });
  }

  // Get vehicles by customer
  async getVehiclesByCustomer(customerId: string): Promise<VehicleResponse[]> {
    const vehicles = await prisma.vehicle.findMany({
      where: { customerId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return vehicles as VehicleResponse[];
  }

  // Get vehicle statistics
  async getVehicleStatistics(): Promise<VehicleStatistics> {
    const [totalVehicles, vehiclesByMake, vehiclesByYear, recentAdditions] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.groupBy({
        by: ['make'],
        _count: { make: true },
        orderBy: { _count: { make: 'desc' } },
        take: 10,
      }),
      prisma.vehicle.groupBy({
        by: ['year'],
        _count: { year: true },
        orderBy: { year: 'desc' },
        take: 10,
      }),
      prisma.vehicle.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      totalVehicles,
      vehiclesByMake: vehiclesByMake.map(item => ({
        make: item.make,
        count: item._count.make,
      })),
      vehiclesByYear: vehiclesByYear.map(item => ({
        year: item.year || 0,
        count: item._count.year,
      })),
      recentAdditions: recentAdditions as VehicleResponse[],
    };
  }

  // Search vehicles
  async searchVehicles(query: string): Promise<VehicleResponse[]> {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        OR: [
          { make: { contains: query, mode: 'insensitive' } },
          { model: { contains: query, mode: 'insensitive' } },
          { vin: { contains: query, mode: 'insensitive' } },
          { licensePlate: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return vehicles as VehicleResponse[];
  }
}