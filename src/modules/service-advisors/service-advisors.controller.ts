import { Request, Response } from 'express';
import { ServiceAdvisorService } from './service-advisors.service';
import { CreateServiceAdvisorDto, UpdateServiceAdvisorDto, ServiceAdvisorFilters } from './service-advisors.types';

export class ServiceAdvisorController {
  constructor(private readonly serviceAdvisorService: ServiceAdvisorService) {}

  // Get all service advisors with optional filtering
  async getServiceAdvisors(req: Request, res: Response) {
    try {
      const filters: ServiceAdvisorFilters = {
        search: req.query.search as string ?? undefined,
        employeeId: req.query.employeeId as string ?? undefined,
        department: req.query.department as string ?? undefined,
        hasWorkOrders: req.query.hasWorkOrders !== undefined ? req.query.hasWorkOrders === 'true' : undefined,
        hasAppointments: req.query.hasAppointments !== undefined ? req.query.hasAppointments === 'true' : undefined,
        limit: parseInt(req.query.limit as string) || 20,
        offset: parseInt(req.query.offset as string) || 0,
      };

      const serviceAdvisors = await this.serviceAdvisorService.getServiceAdvisors(filters);

      res.json({
        success: true,
        data: serviceAdvisors,
        message: 'Service advisors retrieved successfully',
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          count: serviceAdvisors.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to get service advisors',
        message: error.message,
      });
    }
  }

  // Get service advisor by ID
  async getServiceAdvisorById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const serviceAdvisor = await this.serviceAdvisorService.getServiceAdvisorById(id);

      if (!serviceAdvisor) {
        return res.status(404).json({
          success: false,
          error: 'Service advisor not found',
        });
      }

      res.json({
        success: true,
        data: serviceAdvisor,
        message: 'Service advisor retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to get service advisor',
        message: error.message,
      });
    }
  }

  // Get service advisor by employee ID
  async getServiceAdvisorByEmployeeId(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;
      const serviceAdvisor = await this.serviceAdvisorService.getServiceAdvisorByEmployeeId(employeeId);

      if (!serviceAdvisor) {
        return res.status(404).json({
          success: false,
          error: 'Service advisor not found',
        });
      }

      res.json({
        success: true,
        data: serviceAdvisor,
        message: 'Service advisor retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to get service advisor',
        message: error.message,
      });
    }
  }

  // Create a new service advisor
  async createServiceAdvisor(req: Request, res: Response) {
    try {
      const data: CreateServiceAdvisorDto = req.body;
      const serviceAdvisor = await this.serviceAdvisorService.createServiceAdvisor(data);

      res.status(201).json({
        success: true,
        data: serviceAdvisor,
        message: 'Service advisor created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: 'Failed to create service advisor',
        message: error.message,
      });
    }
  }

  // Update service advisor
  async updateServiceAdvisor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateServiceAdvisorDto = req.body;
      const serviceAdvisor = await this.serviceAdvisorService.updateServiceAdvisor(id, data);

      res.json({
        success: true,
        data: serviceAdvisor,
        message: 'Service advisor updated successfully',
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Service advisor not found',
          message: error.message,
        });
      }

      res.status(400).json({
        success: false,
        error: 'Failed to update service advisor',
        message: error.message,
      });
    }
  }

  // Delete service advisor
  async deleteServiceAdvisor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.serviceAdvisorService.deleteServiceAdvisor(id);

      res.json({
        success: true,
        message: 'Service advisor deleted successfully',
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Service advisor not found',
          message: error.message,
        });
      }

      if (error.message.includes('existing work orders') || error.message.includes('existing appointments')) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete service advisor',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to delete service advisor',
        message: error.message,
      });
    }
  }

  // Get service advisor statistics
  async getServiceAdvisorStats(req: Request, res: Response) {
    try {
      const stats = await this.serviceAdvisorService.getServiceAdvisorStats();

      res.json({
        success: true,
        data: stats,
        message: 'Service advisor statistics retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to get service advisor statistics',
        message: error.message,
      });
    }
  }

  // Search service advisors
  async searchServiceAdvisors(req: Request, res: Response) {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Search query is required',
        });
      }

      const serviceAdvisors = await this.serviceAdvisorService.searchServiceAdvisors(q);

      res.json({
        success: true,
        data: serviceAdvisors,
        message: 'Service advisor search completed successfully',
        count: serviceAdvisors.length,
        query: q,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to search service advisors',
        message: error.message,
      });
    }
  }

  // Get work orders for a specific service advisor
  async getWorkOrdersByServiceAdvisor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const status = req.query.status as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const filters = {
        status: status || undefined,
        limit,
        offset,
      };

      const workOrders = await this.serviceAdvisorService.getWorkOrdersByServiceAdvisor(id, filters);

      res.json({
        success: true,
        data: workOrders,
        message: 'Service advisor work orders retrieved successfully',
        pagination: {
          limit,
          offset,
          count: workOrders.length,
        },
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Service advisor not found',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get service advisor work orders',
        message: error.message,
      });
    }
  }
}

