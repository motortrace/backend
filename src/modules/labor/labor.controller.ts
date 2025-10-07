import { Request, Response } from 'express';
import { LaborService } from './labor.service';
import {
  CreateLaborCatalogRequest,
  UpdateLaborCatalogRequest,
  CreateWorkOrderLaborRequest,
  UpdateWorkOrderLaborRequest,
  LaborCatalogFilter,
  WorkOrderLaborFilter,
  CreateLaborRequest,
} from './labor.types';

export class LaborController {
  constructor(private readonly laborService: LaborService) {}

  // Simple Labor Creation (following appointments pattern)
  async createLabor(req: any, res: Response) {
    try {
      const laborData: CreateLaborRequest = req.body;

      const labor = await this.laborService.createLabor(laborData);

      res.status(201).json({
        success: true,
        data: labor,
        message: 'Labor created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
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

  async createWorkOrderLabor(req: Request, res: Response) {
    try {
      const data: CreateWorkOrderLaborRequest = req.body;
      const workOrderLabor = await this.laborService.createWorkOrderLabor(data);

      res.status(201).json({
        success: true,
        data: workOrderLabor,
        message: 'Work order labor created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getWorkOrderLabors(req: Request, res: Response) {
    try {
      const filter: WorkOrderLaborFilter = {
        workOrderId: req.query.workOrderId as string,
        technicianId: req.query.technicianId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        category: req.query.category as string,
      };

      const workOrderLabors = await this.laborService.getWorkOrderLabors(filter);

      res.status(200).json({
        success: true,
        data: workOrderLabors,
        message: 'Work order labors retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getWorkOrderLaborById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workOrderLabor = await this.laborService.getWorkOrderLaborById(id);

      res.status(200).json({
        success: true,
        data: workOrderLabor,
        message: 'Work order labor retrieved successfully',
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateWorkOrderLabor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateWorkOrderLaborRequest = req.body;
      const workOrderLabor = await this.laborService.updateWorkOrderLabor(id, data);

      res.status(200).json({
        success: true,
        data: workOrderLabor,
        message: 'Work order labor updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteWorkOrderLabor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.laborService.deleteWorkOrderLabor(id);

      res.status(200).json({
        success: true,
        message: 'Work order labor deleted successfully',
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
