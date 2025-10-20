import { Request, Response } from 'express';
import { WorkOrderPartService } from './parts.service';
import { CreateWorkOrderPartRequest, UpdateWorkOrderPartRequest } from './parts.types';

export class WorkOrderPartController {
  constructor(private readonly workOrderPartService: WorkOrderPartService) {}

  async createWorkOrderPart(req: Request, res: Response) {
    try {
      const data: CreateWorkOrderPartRequest = req.body;
      const workOrderPart = await this.workOrderPartService.createWorkOrderPart(data);

      res.status(201).json({
        success: true,
        data: workOrderPart,
        message: 'Work order part created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getWorkOrderParts(req: Request, res: Response) {
    try {
      const { workOrderId } = req.params;
      const workOrderParts = await this.workOrderPartService.getWorkOrderParts(workOrderId);

      res.status(200).json({
        success: true,
        data: workOrderParts,
        message: 'Work order parts retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getWorkOrderPartById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workOrderPart = await this.workOrderPartService.getWorkOrderPartById(id);

      if (!workOrderPart) {
        return res.status(404).json({
          success: false,
          error: 'Work order part not found',
        });
      }

      res.status(200).json({
        success: true,
        data: workOrderPart,
        message: 'Work order part retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateWorkOrderPart(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateWorkOrderPartRequest = req.body;
      const workOrderPart = await this.workOrderPartService.updateWorkOrderPart(id, data);

      res.status(200).json({
        success: true,
        data: workOrderPart,
        message: 'Work order part updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteWorkOrderPart(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.workOrderPartService.deleteWorkOrderPart(id);

      res.status(200).json({
        success: true,
        message: 'Work order part deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}