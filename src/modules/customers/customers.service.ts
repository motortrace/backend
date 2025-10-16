import { PrismaClient } from '@prisma/client';
import { Customer, CreateCustomerDto, UpdateCustomerDto, CustomerFilters, ICustomerService } from './customers.types';

export class CustomerService implements ICustomerService {
  constructor(private readonly prisma: PrismaClient) {}
  async createCustomer(customerData: CreateCustomerDto): Promise<Customer> {
    try {
      const customer = await this.prisma.customer.create({
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
      const customer = await this.prisma.customer.findUnique({
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
          vehicles: {
            include: {
              workOrders: {
                select: {
                  id: true,
                  workOrderNumber: true,
                  status: true,
                  jobType: true,
                },
              },
            },
          },
          workOrders: {
            include: {
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
              serviceAdvisor: {
                select: {
                  id: true,
                  userProfile: {
                    select: {
                      name: true,
                      phone: true,
                    },
                  },
                },
              },
              services: {
                include: {
                  cannedService: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                    },
                  },
                },
              },
              laborItems: {
                include: {
                  service: {
                    select: {
                      id: true,
                      cannedService: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
              partsUsed: {
                include: {
                  part: {
                    select: {
                      id: true,
                      partNumber: true,
                      name: true,
                      manufacturer: true,
                    },
                  },
                },
              },
              inspections: {
                include: {
                  template: {
                    select: {
                      id: true,
                      name: true,
                      category: true,
                    },
                  },
                  inspector: {
                    select: {
                      id: true,
                      userProfile: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                  checklistItems: true,
                  tireChecks: true,
                  attachments: true,
                },
              },
              invoices: {
                include: {
                  lineItems: true,
                },
              },
              payments: {
                select: {
                  id: true,
                  amount: true,
                  method: true,
                  status: true,
                  reference: true,
                  paidAt: true,
                  createdAt: true,
                },
              },
              attachments: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          appointments: {
            include: {
              vehicle: {
                select: {
                  id: true,
                  make: true,
                  model: true,
                  year: true,
                  licensePlate: true,
                },
              },
              assignedTo: {
                select: {
                  id: true,
                  userProfile: {
                    select: {
                      name: true,
                      phone: true,
                    },
                  },
                },
              },
              workOrder: {
                select: {
                  id: true,
                  workOrderNumber: true,
                  status: true,
                },
              },
            },
            orderBy: {
              requestedAt: 'desc',
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
      const customer = await this.prisma.customer.findUnique({
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
      if (filters.search && filters.search.trim().length > 0) {
        where.OR = [
          { name: { contains: filters.search.trim(), mode: 'insensitive' } },
          { email: { contains: filters.search.trim(), mode: 'insensitive' } },
          { phone: { contains: filters.search.trim(), mode: 'insensitive' } },
        ];
      }

      // Handle individual filters (creates AND conditions)
      if (filters.email && filters.email.trim().length > 0) {
        andConditions.push({ email: { contains: filters.email.trim(), mode: 'insensitive' } });
      }

      if (filters.phone && filters.phone.trim().length > 0) {
        andConditions.push({ phone: { contains: filters.phone.trim(), mode: 'insensitive' } });
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

      const customers = await this.prisma.customer.findMany({
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
      const customer = await this.prisma.customer.update({
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
      await this.prisma.customer.delete({
        where: { id },
      });
    } catch (error: any) {
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  }

  async getCustomerVehicles(customerId: string) {
    try {
      const vehicles = await this.prisma.vehicle.findMany({
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
      const workOrders = await this.prisma.workOrder.findMany({
        where: { customerId },
        include: {
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              vin: true,
              licensePlate: true,
              color: true,
            },
          },
          serviceAdvisor: {
            select: {
              id: true,
              userProfile: {
                select: {
                  name: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return workOrders;
    } catch (error: any) {
      throw new Error(`Failed to get customer work orders: ${error.message}`);
    }
  }

  async getCustomerAppointments(customerId: string) {
    try {
      const appointments = await this.prisma.appointment.findMany({
        where: { customerId },
        orderBy: { requestedAt: 'asc' },
      });

      return appointments;
    } catch (error: any) {
      throw new Error(`Failed to get customer appointments: ${error.message}`);
    }
  }

  async getCustomerStatistics(customerId: string) {
    try {
      // Get customer to verify existence
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Get all work orders with details
      const workOrders = await this.prisma.workOrder.findMany({
        where: { customerId },
        include: {
          vehicle: {
            select: {
              make: true,
              model: true,
              year: true,
            },
          },
          invoices: {
            select: {
              totalAmount: true,
              paidAmount: true,
              status: true,
            },
          },
          payments: {
            select: {
              amount: true,
              status: true,
              paidAt: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Get all vehicles
      const vehicles = await this.prisma.vehicle.findMany({
        where: { customerId },
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          createdAt: true,
        },
      });

      // Get all appointments
      const appointments = await this.prisma.appointment.findMany({
        where: { customerId },
        select: {
          id: true,
          status: true,
          requestedAt: true,
          createdAt: true,
        },
      });

      // Calculate statistics
      const now = new Date();
      const totalWorkOrders = workOrders.length;
      const totalVehicles = vehicles.length;
      const totalAppointments = appointments.length;

      // Financial metrics
      let totalSpent = 0;
      let totalPaid = 0;
      let outstandingBalance = 0;

      workOrders.forEach(wo => {
        wo.invoices.forEach(invoice => {
          totalSpent += Number(invoice.totalAmount);
          totalPaid += Number(invoice.paidAmount);
          outstandingBalance += Number(invoice.totalAmount) - Number(invoice.paidAmount);
        });
      });

      const averageTicket = totalWorkOrders > 0 ? totalSpent / totalWorkOrders : 0;

      // Visit frequency analysis
      const completedWorkOrders = workOrders.filter(wo => 
        wo.status === 'COMPLETED'
      );

      const lastVisit = completedWorkOrders.length > 0 
        ? completedWorkOrders[completedWorkOrders.length - 1].createdAt 
        : null;

      const daysSinceLastVisit = lastVisit 
        ? Math.floor((now.getTime() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      // Calculate visit gaps (days between visits)
      const visitGaps: number[] = [];
      for (let i = 1; i < completedWorkOrders.length; i++) {
        const prevVisit = new Date(completedWorkOrders[i - 1].createdAt);
        const currentVisit = new Date(completedWorkOrders[i].createdAt);
        const gap = Math.floor((currentVisit.getTime() - prevVisit.getTime()) / (1000 * 60 * 60 * 24));
        visitGaps.push(gap);
      }

      const averageVisitGap = visitGaps.length > 0 
        ? visitGaps.reduce((sum, gap) => sum + gap, 0) / visitGaps.length 
        : null;

      // Calculate customer lifetime (days since first visit)
      const firstVisit = workOrders.length > 0 ? workOrders[0].createdAt : customer.createdAt;
      const customerLifetimeDays = Math.floor((now.getTime() - new Date(firstVisit).getTime()) / (1000 * 60 * 60 * 24));

      // Work order status breakdown
      const statusBreakdown = workOrders.reduce((acc, wo) => {
        acc[wo.status] = (acc[wo.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Job type breakdown
      const jobTypeBreakdown = workOrders.reduce((acc, wo) => {
        acc[wo.jobType] = (acc[wo.jobType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Vehicle distribution
      const vehicleBreakdown = workOrders.reduce((acc, wo) => {
        if (wo.vehicle) {
          const vehicleKey = `${wo.vehicle.year} ${wo.vehicle.make} ${wo.vehicle.model}`;
          acc[vehicleKey] = (acc[vehicleKey] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Monthly visit trend (last 12 months)
      const monthlyVisits: Record<string, number> = {};
      const last12Months = new Date();
      last12Months.setMonth(last12Months.getMonth() - 12);

      workOrders
        .filter(wo => new Date(wo.createdAt) >= last12Months)
        .forEach(wo => {
          const month = new Date(wo.createdAt).toISOString().substring(0, 7); // YYYY-MM
          monthlyVisits[month] = (monthlyVisits[month] || 0) + 1;
        });

      // Appointment statistics
      const appointmentStatusBreakdown = appointments.reduce((acc, apt) => {
        acc[apt.status] = (acc[apt.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const completedAppointments = appointments.filter(apt => apt.status === 'COMPLETED').length;
      const appointmentShowRate = totalAppointments > 0 
        ? (completedAppointments / totalAppointments) * 100 
        : 0;

      // Payment behavior
      const totalPayments = workOrders.reduce((sum, wo) => sum + wo.payments.length, 0);
      const completedPayments = workOrders.reduce((sum, wo) => 
        sum + wo.payments.filter(p => p.status === 'PAID' || p.status === 'COMPLETED').length, 0
      );
      const paymentCompletionRate = totalPayments > 0 
        ? (completedPayments / totalPayments) * 100 
        : 0;

      // Customer loyalty indicators
      const isReturningCustomer = totalWorkOrders > 1;
      const isActiveCustomer = daysSinceLastVisit !== null && daysSinceLastVisit <= 180; // Active if visited in last 6 months
      const isAtRisk = daysSinceLastVisit !== null && daysSinceLastVisit > 365; // At risk if no visit in 1 year

      // Predict next visit (based on average gap)
      const predictedNextVisit = lastVisit && averageVisitGap 
        ? new Date(new Date(lastVisit).getTime() + averageVisitGap * 24 * 60 * 60 * 1000)
        : null;

      return {
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email ?? undefined,
          phone: customer.phone ?? undefined,
          customerSince: customer.createdAt,
          customerLifetimeDays,
        },
        financials: {
          totalSpent: Number(totalSpent.toFixed(2)),
          totalPaid: Number(totalPaid.toFixed(2)),
          outstandingBalance: Number(outstandingBalance.toFixed(2)),
          averageTicket: Number(averageTicket.toFixed(2)),
          currency: 'USD', // You can make this configurable
        },
        visits: {
          totalWorkOrders,
          completedWorkOrders: completedWorkOrders.length,
          lastVisit,
          daysSinceLastVisit,
          averageVisitGapDays: averageVisitGap ? Math.round(averageVisitGap) : null,
          predictedNextVisit,
          firstVisit,
          monthlyVisitTrend: monthlyVisits,
        },
        vehicles: {
          totalVehicles,
          vehicleList: vehicles.map(v => ({
            id: v.id,
            display: `${v.year} ${v.make} ${v.model}`,
            addedOn: v.createdAt,
          })),
          mostServicedVehicle: Object.entries(vehicleBreakdown).sort((a, b) => b[1] - a[1])[0] || null,
        },
        appointments: {
          totalAppointments,
          completedAppointments,
          appointmentShowRate: Number(appointmentShowRate.toFixed(2)),
          statusBreakdown: appointmentStatusBreakdown,
        },
        workOrderBreakdown: {
          byStatus: statusBreakdown,
          byJobType: jobTypeBreakdown,
          byVehicle: vehicleBreakdown,
        },
        customerProfile: {
          isReturningCustomer,
          isActiveCustomer,
          isAtRisk,
          loyaltyScore: this.calculateLoyaltyScore({
            totalWorkOrders,
            customerLifetimeDays,
            averageVisitGap,
            paymentCompletionRate,
          }),
        },
        paymentBehavior: {
          totalPayments,
          completedPayments,
          paymentCompletionRate: Number(paymentCompletionRate.toFixed(2)),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get customer statistics: ${error.message}`);
    }
  }

  private calculateLoyaltyScore(params: {
    totalWorkOrders: number;
    customerLifetimeDays: number;
    averageVisitGap: number | null;
    paymentCompletionRate: number;
  }): number {
    let score = 0;

    // Points for number of visits (max 40 points)
    score += Math.min(params.totalWorkOrders * 5, 40);

    // Points for customer tenure (max 20 points)
    score += Math.min(params.customerLifetimeDays / 36.5, 20); // 1 point per ~37 days

    // Points for visit frequency (max 20 points)
    if (params.averageVisitGap) {
      const frequencyScore = Math.max(0, 20 - params.averageVisitGap / 18); // Lose 1 point per 18 days
      score += Math.max(0, frequencyScore);
    }

    // Points for payment completion (max 20 points)
    score += (params.paymentCompletionRate / 100) * 20;

    return Math.min(100, Math.round(score));
  }
}
