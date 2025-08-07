import { Request, Response } from 'express';
import { LaborService } from './labor.service';
import {
  CreateLaborCatalogRequest,
  UpdateLaborCatalogRequest,
  CreateWorkOrderLabourRequest,
  UpdateWorkOrderLabourRequest,
  LaborCatalogFilter,
  WorkOrderLabourFilter,
} from './labor.types';

export class LaborController {
  private laborService: LaborService;

  constructor() {
    this.laborService = new LaborService();
  }

  async createLaborCatalog(req: Request, res: Response) {
    try {
      const data: CreateLaborCatalogRequest = req.body;
      const laborCatalog = await this.laborService.createLaborCatalog(data);

      res.status(201).json({
        success: true,
        data: laborCatalog,
        message: 'Labor catalog created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getLaborCatalogs(req: Request, res: Response) {
    try {
      const filter: LaborCatalogFilter = {
        category: req.query.category as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        search: req.query.search as string,
      };

      const laborCatalogs = await this.laborService.getLaborCatalogs(filter);

      res.status(200).json({
        success: true,
        data: laborCatalogs,
        message: 'Labor catalogs retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getLaborCatalogById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const laborCatalog = await this.laborService.getLaborCatalogById(id);

      res.status(200).json({
        success: true,
        data: laborCatalog,
        message: 'Labor catalog retrieved successfully',
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateLaborCatalog(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateLaborCatalogRequest = req.body;
      const laborCatalog = await this.laborService.updateLaborCatalog(id, data);

      res.status(200).json({
        success: true,
        data: laborCatalog,
        message: 'Labor catalog updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteLaborCatalog(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.laborService.deleteLaborCatalog(id);

      res.status(200).json({
        success: true,
        message: 'Labor catalog deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async createWorkOrderLabour(req: Request, res: Response) {
    try {
      const data: CreateWorkOrderLabourRequest = req.body;
      const workOrderLabour = await this.laborService.createWorkOrderLabour(data);

      res.status(201).json({
        success: true,
        data: workOrderLabour,
        message: 'Work order labour created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getWorkOrderLabours(req: Request, res: Response) {
    try {
      const filter: WorkOrderLabourFilter = {
        workOrderId: req.query.workOrderId as string,
        technicianId: req.query.technicianId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        category: req.query.category as string,
      };

      const workOrderLabours = await this.laborService.getWorkOrderLabours(filter);

      res.status(200).json({
        success: true,
        data: workOrderLabours,
        message: 'Work order labours retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getWorkOrderLabourById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workOrderLabour = await this.laborService.getWorkOrderLabourById(id);

      res.status(200).json({
        success: true,
        data: workOrderLabour,
        message: 'Work order labour retrieved successfully',
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateWorkOrderLabour(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateWorkOrderLabourRequest = req.body;
      const workOrderLabour = await this.laborService.updateWorkOrderLabour(id, data);

      res.status(200).json({
        success: true,
        data: workOrderLabour,
        message: 'Work order labour updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteWorkOrderLabour(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.laborService.deleteWorkOrderLabour(id);

      res.status(200).json({
        success: true,
        message: 'Work order labour deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getWorkOrderLaborSummary(req: Request, res: Response) {
    try {
      const { workOrderId } = req.params;
      const summary = await this.laborService.getWorkOrderLaborSummary(workOrderId);

      res.status(200).json({
        success: true,
        data: summary,
        message: 'Work order labor summary retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getLaborCategories(req: Request, res: Response) {
    try {
      const categories = await this.laborService.getLaborCategories();

      res.status(200).json({
        success: true,
        data: categories,
        message: 'Labor categories retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getTechnicianLaborSummary(req: Request, res: Response) {
    try {
      const { technicianId } = req.params;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const summary = await this.laborService.getTechnicianLaborSummary(technicianId, startDate, endDate);

      res.status(200).json({
        success: true,
        data: summary,
        message: 'Technician labor summary retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
