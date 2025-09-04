import { Request, Response } from 'express';
import { CustomerService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerFilters } from './customers.types';

export class CustomerController {
  private customerService = new CustomerService();

  // Get all customers with optional filtering
  async getCustomers(req: Request, res: Response) {
    try {
      const filters: CustomerFilters = {
        search: req.query.search as string ?? undefined,
        email: req.query.email as string ?? undefined,
        phone: req.query.phone as string ?? undefined,
        hasVehicles: req.query.hasVehicles !== undefined ? req.query.hasVehicles === 'true' : undefined,
        hasWorkOrders: req.query.hasWorkOrders !== undefined ? req.query.hasWorkOrders === 'true' : undefined,
        limit: parseInt(req.query.limit as string) || 20,
        offset: parseInt(req.query.offset as string) || 0,
      };

      const customers = await this.customerService.getCustomers(filters);

      res.json({
        success: true,
        data: customers,
        message: 'Customers retrieved successfully',
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          count: customers.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to get customers',
        message: error.message,
      });
    }
  }

  // Get customer by ID
  async getCustomerById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const customer = await this.customerService.getCustomerById(id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found',
          message: 'No customer found with the provided ID',
        });
      }

      res.json({
        success: true,
        data: customer,
        message: 'Customer retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to get customer',
        message: error.message,
      });
    }
  }

  // Get customer by user profile ID
  async getCustomerByUserProfileId(req: Request, res: Response) {
    try {
      const { userProfileId } = req.params;
      const customer = await this.customerService.getCustomerByUserProfileId(userProfileId);

      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found',
          message: 'No customer found with the provided user profile ID',
        });
      }

      res.json({
        success: true,
        data: customer,
        message: 'Customer retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to get customer',
        message: error.message,
      });
    }
  }

  // Create new customer
  async createCustomer(req: Request, res: Response) {
    try {
      const customerData: CreateCustomerDto = req.body;
      const customer = await this.customerService.createCustomer(customerData);

      res.status(201).json({
        success: true,
        data: customer,
        message: 'Customer created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: 'Failed to create customer',
        message: error.message,
      });
    }
  }

  // Update customer
  async updateCustomer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const customerData: UpdateCustomerDto = req.body;
      const customer = await this.customerService.updateCustomer(id, customerData);

      res.json({
        success: true,
        data: customer,
        message: 'Customer updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: 'Failed to update customer',
        message: error.message,
      });
    }
  }

  // Delete customer
  async deleteCustomer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.customerService.deleteCustomer(id);

      res.json({
        success: true,
        message: 'Customer deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: 'Failed to delete customer',
        message: error.message,
      });
    }
  }

  // Get customer vehicles
  async getCustomerVehicles(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const vehicles = await this.customerService.getCustomerVehicles(customerId);

      res.json({
        success: true,
        data: vehicles,
        message: 'Customer vehicles retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to get customer vehicles',
        message: error.message,
      });
    }
  }

  // Get customer work orders
  async getCustomerWorkOrders(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const workOrders = await this.customerService.getCustomerWorkOrders(customerId);

      res.json({
        success: true,
        data: workOrders,
        message: 'Customer work orders retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to get customer work orders',
        message: error.message,
      });
    }
  }

  // Get customer appointments
  async getCustomerAppointments(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const appointments = await this.customerService.getCustomerAppointments(customerId);

      res.json({
        success: true,
        data: appointments,
        message: 'Customer appointments retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to get customer appointments',
        message: error.message,
      });
    }
  }
}
