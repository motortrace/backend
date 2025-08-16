import { Request, Response } from 'express';
import { CannedServiceService } from './canned-services.service';
import {
  CreateCannedServiceRequest,
  UpdateCannedServiceRequest,
  CannedServiceFilter,
} from './canned-services.types';

const cannedServiceService = new CannedServiceService();

export class CannedServiceController {
  async createCannedService(req: Request, res: Response) {
    try {
      const data: CreateCannedServiceRequest = req.body;
      const service = await cannedServiceService.createCannedService(data);
      
      res.status(201).json({
        success: true,
        data: service,
        message: 'Canned service created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getCannedService(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = await cannedServiceService.getCannedServiceById(id);
      
      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Canned service not found',
        });
      }
      
      res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getCannedServices(req: Request, res: Response) {
    try {
      const filter: CannedServiceFilter = req.query as any;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await cannedServiceService.getCannedServices(filter, page, limit);
      
      res.status(200).json({
        success: true,
        data: result.services,
        pagination: {
          page: result.page,
          total: result.total,
          totalPages: result.totalPages,
          limit,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateCannedService(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateCannedServiceRequest = req.body;
      
      const service = await cannedServiceService.updateCannedService(id, data);
      
      res.status(200).json({
        success: true,
        data: service,
        message: 'Canned service updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteCannedService(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await cannedServiceService.deleteCannedService(id);
      
      res.status(200).json({
        success: true,
        message: 'Canned service deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getCannedServiceSummary(req: Request, res: Response) {
    try {
      const summary = await cannedServiceService.getCannedServiceSummary();
      
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getAvailableCannedServices(req: Request, res: Response) {
    try {
      const services = await cannedServiceService.getAvailableCannedServices();
      
      res.status(200).json({
        success: true,
        data: services,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
