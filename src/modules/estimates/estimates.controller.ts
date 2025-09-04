import { Request, Response } from 'express';
import { EstimatesService } from './estimates.service';
import {
  CreateEstimateRequest,
  UpdateEstimateRequest,
  CreateEstimateLaborRequest,
  UpdateEstimateLaborRequest,
  CreateEstimatePartRequest,
  UpdateEstimatePartRequest,
  CreateEstimateApprovalRequest,
  UpdateEstimateApprovalRequest,
  EstimateFilters,
} from './estimates.types';

const estimatesService = new EstimatesService();

export class EstimatesController {
  // Create a new estimate
  async createEstimate(req: Request, res: Response) {
    try {
      const data: CreateEstimateRequest = req.body;
      const estimate = await estimatesService.createEstimate(data);
      
      res.status(201).json({
        success: true,
        data: estimate,
        message: 'Estimate created successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create estimate',
      });
    }
  }

  // Get estimate by ID
  async getEstimateById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const estimate = await estimatesService.getEstimateById(id);
      
      res.status(200).json({
        success: true,
        data: estimate,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : 'Estimate not found',
      });
    }
  }

  // Get estimates with filters
  async getEstimates(req: Request, res: Response) {
    try {
      const filters: EstimateFilters = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await estimatesService.getEstimates(filters, page, limit);
      
      res.status(200).json({
        success: true,
        data: result.estimates,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch estimates',
      });
    }
  }

  // Update estimate
  async updateEstimate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateEstimateRequest = req.body;
      const estimate = await estimatesService.updateEstimate(id, data);
      
      res.status(200).json({
        success: true,
        data: estimate,
        message: 'Estimate updated successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update estimate',
      });
    }
  }

  // Delete estimate
  async deleteEstimate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await estimatesService.deleteEstimate(id);
      
      res.status(200).json({
        success: true,
        message: 'Estimate deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete estimate',
      });
    }
  }

  // Create estimate labor item
  async createEstimateLabor(req: Request, res: Response) {
    try {
      const data: CreateEstimateLaborRequest = req.body;
      const estimateLabor = await estimatesService.createEstimateLabor(data);
      
      res.status(201).json({
        success: true,
        data: estimateLabor,
        message: 'Estimate labor item created successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create estimate labor item',
      });
    }
  }

  // Update estimate labor item
  async updateEstimateLabor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateEstimateLaborRequest = req.body;
      const estimateLabor = await estimatesService.updateEstimateLabor(id, data);
      
      res.status(200).json({
        success: true,
        data: estimateLabor,
        message: 'Estimate labor item updated successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update estimate labor item',
      });
    }
  }

  // Delete estimate labor item
  async deleteEstimateLabor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await estimatesService.deleteEstimateLabor(id);
      
      res.status(200).json({
        success: true,
        message: 'Estimate labor item deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete estimate labor item',
      });
    }
  }

  // Create estimate part item
  async createEstimatePart(req: Request, res: Response) {
    try {
      const data: CreateEstimatePartRequest = req.body;
      const estimatePart = await estimatesService.createEstimatePart(data);
      
      res.status(201).json({
        success: true,
        data: estimatePart,
        message: 'Estimate part item created successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create estimate part item',
      });
    }
  }

  // Update estimate part item
  async updateEstimatePart(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateEstimatePartRequest = req.body;
      const estimatePart = await estimatesService.updateEstimatePart(id, data);
      
      res.status(200).json({
        success: true,
        data: estimatePart,
        message: 'Estimate part item updated successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update estimate part item',
      });
    }
  }

  // Delete estimate part item
  async deleteEstimatePart(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await estimatesService.deleteEstimatePart(id);
      
      res.status(200).json({
        success: true,
        message: 'Estimate part item deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete estimate part item',
      });
    }
  }

  // Create estimate approval
  async createEstimateApproval(req: Request, res: Response) {
    try {
      const data: CreateEstimateApprovalRequest = req.body;
      const approval = await estimatesService.createEstimateApproval(data);
      
      res.status(201).json({
        success: true,
        data: approval,
        message: 'Estimate approval created successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create estimate approval',
      });
    }
  }

  // Update estimate approval
  async updateEstimateApproval(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateEstimateApprovalRequest = req.body;
      const approval = await estimatesService.updateEstimateApproval(id, data);
      
      res.status(200).json({
        success: true,
        data: approval,
        message: 'Estimate approval updated successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update estimate approval',
      });
    }
  }

  // Get estimate statistics
  async getEstimateStatistics(req: Request, res: Response) {
    try {
      const statistics = await estimatesService.getEstimateStatistics();
      
      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch estimate statistics',
      });
    }
  }

  // Approve estimate and create work order items
  async approveEstimate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { approvedById } = req.body;
      
      if (!approvedById) {
        return res.status(400).json({
          success: false,
          message: 'approvedById is required',
        });
      }
      
      await estimatesService.approveEstimate(id, approvedById);
      
      res.status(200).json({
        success: true,
        message: 'Estimate approved and work order items created successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to approve estimate',
      });
    }
  }

  // Customer approve estimate labor item
  async customerApproveEstimateLabor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { customerApproved, customerNotes } = req.body;
      
      const data: UpdateEstimateLaborRequest = {
        customerApproved,
        customerNotes,
      };
      
      const estimateLabor = await estimatesService.updateEstimateLabor(id, data);
      
      res.status(200).json({
        success: true,
        data: estimateLabor,
        message: 'Estimate labor item customer approval updated successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update customer approval',
      });
    }
  }

  // Customer approve estimate part item
  async customerApproveEstimatePart(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { customerApproved, customerNotes } = req.body;
      
      const data: UpdateEstimatePartRequest = {
        customerApproved,
        customerNotes,
      };
      
      const estimatePart = await estimatesService.updateEstimatePart(id, data);
      
      res.status(200).json({
        success: true,
        data: estimatePart,
        message: 'Estimate part item customer approval updated successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update customer approval',
      });
    }
  }

  // Add canned service to estimate
  async addCannedServiceToEstimate(req: Request, res: Response) {
    try {
      const { estimateId } = req.params;
      const { cannedServiceId } = req.body;
      
      const estimate = await estimatesService.addCannedServiceToEstimate(estimateId, cannedServiceId);
      
      res.status(200).json({
        success: true,
        data: estimate,
        message: 'Canned service added to estimate successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add canned service to estimate',
      });
    }
  }
}
