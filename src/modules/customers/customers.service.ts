import { PrismaClient } from '@prisma/client';
import { Customer, CreateCustomerDto, UpdateCustomerDto, CustomerFilters } from './customers.types';

const prisma = new PrismaClient();

export class CustomerService {
  async createCustomer(customerData: CreateCustomerDto): Promise<Customer> {
    try {
      const customer = await prisma.customer.create({
        data: customerData,
        include: {
          userProfile: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true,
              role: true,
              isRegistrationComplete: true,
            },
          },
          vehicles: true,
          workOrders: {
            select: {
              id: true,
              workOrderNumber: true,
              status: true,
              jobType: true,
              priority: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          appointments: {
            select: {
              id: true,
              requestedAt: true,
              startTime: true,
              endTime: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      return customer as Customer;
    } catch (error: any) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          userProfile: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true,
              role: true,
              isRegistrationComplete: true,
            },
          },
          vehicles: true,
          workOrders: {
            select: {
              id: true,
              workOrderNumber: true,
              status: true,
              jobType: true,
              priority: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          appointments: {
            select: {
              id: true,
              requestedAt: true,
              startTime: true,
              endTime: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      return customer as Customer | null;
    } catch (error: any) {
      throw new Error(`Failed to get customer: ${error.message}`);
    }
  }

  async getCustomerByUserProfileId(userProfileId: string): Promise<Customer | null> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { userProfileId },
        include: {
          userProfile: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true,
              role: true,
              isRegistrationComplete: true,
            },
          },
          vehicles: true,
          workOrders: {
            select: {
              id: true,
              workOrderNumber: true,
              status: true,
              jobType: true,
              priority: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          appointments: {
            select: {
              id: true,
              requestedAt: true,
              startTime: true,
              endTime: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      return customer as Customer | null;
    } catch (error: any) {
      throw new Error(`Failed to get customer by user profile ID: ${error.message}`);
    }
  }

  async getCustomers(filters: CustomerFilters): Promise<Customer[]> {
    try {
      const where: any = {};
      const andConditions: any[] = [];

      // Handle search filter (creates OR clause)
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { phone: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      // Handle individual filters (creates AND conditions)
      if (filters.email) {
        andConditions.push({ email: { contains: filters.email, mode: 'insensitive' } });
      }

      if (filters.phone) {
        andConditions.push({ phone: { contains: filters.phone, mode: 'insensitive' } });
      }

      if (filters.hasVehicles !== undefined) {
        if (filters.hasVehicles) {
          andConditions.push({ vehicles: { some: {} } });
        } else {
          andConditions.push({ vehicles: { none: {} } });
        }
      }

      if (filters.hasWorkOrders !== undefined) {
        if (filters.hasWorkOrders) {
          andConditions.push({ workOrders: { some: {} } });
        } else {
          andConditions.push({ workOrders: { none: {} } });
        }
      }

      // Combine OR clause with AND conditions
      if (andConditions.length > 0) {
        if (where.OR) {
          // If we have both OR and AND conditions, wrap them properly
          where.AND = [
            { OR: where.OR },
            ...andConditions
          ];
          delete where.OR; // Remove the top-level OR since it's now nested
        } else {
          // If we only have AND conditions, use them directly
          where.AND = andConditions;
        }
      }

      const customers = await prisma.customer.findMany({
        where,
        include: {
          userProfile: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true,
              role: true,
              isRegistrationComplete: true,
            },
          },
          vehicles: true,
          workOrders: {
            select: {
              id: true,
              workOrderNumber: true,
              status: true,
              jobType: true,
              priority: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          appointments: {
            select: {
              id: true,
              requestedAt: true,
              startTime: true,
              endTime: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 20,
        skip: filters.offset || 0,
      });

      return customers as Customer[];
    } catch (error: any) {
      throw new Error(`Failed to get customers: ${error.message}`);
    }
  }

  async updateCustomer(id: string, customerData: UpdateCustomerDto): Promise<Customer> {
    try {
      const customer = await prisma.customer.update({
        where: { id },
        data: customerData,
        include: {
          userProfile: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true,
              role: true,
              isRegistrationComplete: true,
            },
          },
          vehicles: true,
          workOrders: {
            select: {
              id: true,
              workOrderNumber: true,
              status: true,
              jobType: true,
              priority: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          appointments: {
            select: {
              id: true,
              requestedAt: true,
              startTime: true,
              endTime: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      return customer as Customer;
    } catch (error: any) {
      throw new Error(`Failed to update customer: ${error.message}`);
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    try {
      await prisma.customer.delete({
        where: { id },
      });
    } catch (error: any) {
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  }

  async getCustomerVehicles(customerId: string) {
    try {
      const vehicles = await prisma.vehicle.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
      });

      return vehicles;
    } catch (error: any) {
      throw new Error(`Failed to get customer vehicles: ${error.message}`);
    }
  }

  async getCustomerWorkOrders(customerId: string) {
    try {
      const workOrders = await prisma.workOrder.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
      });

      return workOrders;
    } catch (error: any) {
      throw new Error(`Failed to get customer work orders: ${error.message}`);
    }
  }

  async getCustomerAppointments(customerId: string) {
    try {
      const appointments = await prisma.appointment.findMany({
        where: { customerId },
        orderBy: { requestedAt: 'asc' },
      });

      return appointments;
    } catch (error: any) {
      throw new Error(`Failed to get customer appointments: ${error.message}`);
    }
  }
}
