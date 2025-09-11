import { Request, Response } from 'express';
import { TechnicianService } from './technicians.service';
import { CreateTechnicianDto, UpdateTechnicianDto, TechnicianFilters } from './technicians.types';

export class TechnicianController {
  private technicianService = new TechnicianService();

  // Get all technicians with optional filtering
  async getTechnicians(req: Request, res: Response) {
    try {
      const filters: TechnicianFilters = {
        search: req.query.search as string ?? undefined,
        employeeId: req.query.employeeId as string ?? undefined,
        specialization: req.query.specialization as string ?? undefined,
        hasInspections: req.query.hasInspections !== undefined ? req.query.hasInspections === 'true' : undefined,
        hasLaborItems: req.query.hasLaborItems !== undefined ? req.query.hasLaborItems === 'true' : undefined,
        limit: parseInt(req.query.limit as string) || 20,
        offset: parseInt(req.query.offset as string) || 0,
      };

      const technicians = await this.technicianService.getTechnicians(filters);

      res.json({
        success: true,
        data: technicians,
        message: 'Technicians retrieved successfully',
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          count: technicians.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to get technicians',
        message: error.message,
      });
    }
  }

  // Get technician by ID
  async getTechnicianById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const technician = await this.technicianService.getTechnicianById(id);

      if (!technician) {
        return res.status(404).json({
          success: false,
          error: 'Technician not found',
        });
      }

      res.json({
        success: true,
        data: technician,
        message: 'Technician retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to get technician',
        message: error.message,
      });
    }
  }

  // Get technician by employee ID
  async getTechnicianByEmployeeId(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;
      const technician = await this.technicianService.getTechnicianByEmployeeId(employeeId);

      if (!technician) {
        return res.status(404).json({
          success: false,
          error: 'Technician not found',
        });
      }

      res.json({
        success: true,
        data: technician,
        message: 'Technician retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to get technician',
        message: error.message,
      });
    }
  }

  // Create a new technician
  async createTechnician(req: Request, res: Response) {
    try {
      const data: CreateTechnicianDto = req.body;
      const technician = await this.technicianService.createTechnician(data);

      res.status(201).json({
        success: true,
        data: technician,
        message: 'Technician created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: 'Failed to create technician',
        message: error.message,
      });
    }
  }

  // Update technician
  async updateTechnician(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateTechnicianDto = req.body;
      const technician = await this.technicianService.updateTechnician(id, data);

      res.json({
        success: true,
        data: technician,
        message: 'Technician updated successfully',
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Technician not found',
          message: error.message,
        });
      }

      res.status(400).json({
        success: false,
        error: 'Failed to update technician',
        message: error.message,
      });
    }
  }

  // Delete technician
  async deleteTechnician(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.technicianService.deleteTechnician(id);

      res.json({
        success: true,
        message: 'Technician deleted successfully',
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Technician not found',
          message: error.message,
        });
      }

      if (error.message.includes('existing inspections') || 
          error.message.includes('existing labor items') || 
          error.message.includes('existing QC checks') || 
          error.message.includes('existing part installations')) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete technician',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to delete technician',
        message: error.message,
      });
    }
  }

  // Get technician statistics
  async getTechnicianStats(req: Request, res: Response) {
    try {
      const stats = await this.technicianService.getTechnicianStats();

      res.json({
        success: true,
        data: stats,
        message: 'Technician statistics retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to get technician statistics',
        message: error.message,
      });
    }
  }

  // Search technicians
  async searchTechnicians(req: Request, res: Response) {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Search query is required',
        });
      }

      const technicians = await this.technicianService.searchTechnicians(q);

      res.json({
        success: true,
        data: technicians,
        message: 'Technician search completed successfully',
        count: technicians.length,
        query: q,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to search technicians',
        message: error.message,
      });
    }
  }

  // Get work orders for a specific technician
  async getWorkOrdersByTechnician(req: Request, res: Response) {
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

      const workOrders = await this.technicianService.getWorkOrdersByTechnician(id, filters);

      res.json({
        success: true,
        data: workOrders,
        message: 'Technician work orders retrieved successfully',
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
          error: 'Technician not found',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get technician work orders',
        message: error.message,
      });
    }
  }
}
