import { Request, Response } from 'express';
import { WorkOrderService } from './work-orders.service';
import {
  CreateWorkOrderRequest,
  UpdateWorkOrderRequest,
  WorkOrderFilters,
  CreateWorkOrderServiceRequest,
  CreatePaymentRequest,
} from './work-orders.types';

export class WorkOrderController {
  private workOrderService = new WorkOrderService();

  // Work Order Management
  async createWorkOrder(req: any, res: Response) {
    try {
      const workOrderData: CreateWorkOrderRequest = req.body;

      const workOrder = await this.workOrderService.createWorkOrder(workOrderData);

      res.status(201).json({
        success: true,
        data: workOrder,
        message: 'Work order created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getWorkOrders(req: Request, res: Response) {
    try {
      const filters: WorkOrderFilters = {
        status: req.query.status as any,
        jobType: req.query.jobType as any,
        priority: req.query.priority as any,
        source: req.query.source as any,
        customerId: req.query.customerId as string,
        vehicleId: req.query.vehicleId as string,
        advisorId: req.query.advisorId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        workflowStep: req.query.workflowStep as any,
        paymentStatus: req.query.paymentStatus as any,
      };

      const workOrders = await this.workOrderService.getWorkOrders(filters);

      res.json({
        success: true,
        data: workOrders,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getWorkOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workOrder = await this.workOrderService.getWorkOrderById(id);

      if (!workOrder) {
        return res.status(404).json({
          success: false,
          error: 'Work order not found',
        });
      }

      res.json({
        success: true,
        data: workOrder,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateWorkOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateWorkOrderRequest = req.body;

      const workOrder = await this.workOrderService.updateWorkOrder(id, updateData);

      res.json({
        success: true,
        data: workOrder,
        message: 'Work order updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteWorkOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.workOrderService.deleteWorkOrder(id);

      res.json({
        success: true,
        message: 'Work order deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Work Order Services
  async createWorkOrderService(req: Request, res: Response) {
    try {
      const { workOrderId } = req.params;
      const serviceData: CreateWorkOrderServiceRequest = req.body;
      serviceData.workOrderId = workOrderId;

      const service = await this.workOrderService.createWorkOrderService(serviceData);

      res.status(201).json({
        success: true,
        data: service,
        message: 'Work order service created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getWorkOrderServices(req: Request, res: Response) {
    try {
      const { workOrderId } = req.params;
      const services = await this.workOrderService.getWorkOrderServices(workOrderId);

      res.json({
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

  // Work Order Payments
  async createPayment(req: Request, res: Response) {
    try {
      const { workOrderId } = req.params;
      const paymentData: CreatePaymentRequest = req.body;
      paymentData.workOrderId = workOrderId;

      const payment = await this.workOrderService.createPayment(paymentData);

      res.status(201).json({
        success: true,
        data: payment,
        message: 'Payment created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getWorkOrderPayments(req: Request, res: Response) {
    try {
      const { workOrderId } = req.params;
      const payments = await this.workOrderService.getWorkOrderPayments(workOrderId);

      res.json({
        success: true,
        data: payments,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Work Order Status Management
  async updateWorkOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, workflowStep } = req.body;

      const workOrder = await this.workOrderService.updateWorkOrderStatus(id, status, workflowStep);

      res.json({
        success: true,
        data: workOrder,
        message: 'Work order status updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async assignWorkOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { advisorId, technicianId } = req.body;

      const workOrder = await this.workOrderService.assignWorkOrder(id, advisorId, technicianId);

      res.json({
        success: true,
        data: workOrder,
        message: 'Work order assigned successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Work Order Statistics
  async getWorkOrderStatistics(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const statistics = await this.workOrderService.getWorkOrderStatistics(filters);

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Work Order Search
  async searchWorkOrders(req: Request, res: Response) {
    try {
      const { query, filters } = req.body;
      const workOrders = await this.workOrderService.searchWorkOrders(query, filters);

      res.json({
        success: true,
        data: workOrders,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Work Order Attachments
  async uploadWorkOrderAttachment(req: Request, res: Response) {
    try {
      const { workOrderId } = req.params;
      const { fileUrl, fileName, fileType, fileSize, description, category } = req.body;
      const { uploadedById } = req.body;

      const attachment = await this.workOrderService.uploadWorkOrderAttachment(
        workOrderId,
        {
          fileUrl,
          fileName,
          fileType,
          fileSize,
          description,
          category,
          uploadedById,
        }
      );

      res.status(201).json({
        success: true,
        data: attachment,
        message: 'Work order attachment uploaded successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getWorkOrderAttachments(req: Request, res: Response) {
    try {
      const { workOrderId } = req.params;
      const { category } = req.query;

      const attachments = await this.workOrderService.getWorkOrderAttachments(
        workOrderId,
        category as string
      );

      res.json({
        success: true,
        data: attachments,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Work Order Inspections
  async createWorkOrderInspection(req: Request, res: Response) {
    try {
      const { workOrderId } = req.params;
      const { inspectorId, notes } = req.body;

      const inspection = await this.workOrderService.createWorkOrderInspection(
        workOrderId,
        inspectorId,
        notes
      );

      res.status(201).json({
        success: true,
        data: inspection,
        message: 'Work order inspection created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getWorkOrderInspections(req: Request, res: Response) {
    try {
      const { workOrderId } = req.params;
      const inspections = await this.workOrderService.getWorkOrderInspections(workOrderId);

      res.json({
        success: true,
        data: inspections,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Work Order QC
  async createWorkOrderQC(req: Request, res: Response) {
    try {
      const { workOrderId } = req.params;
      const { passed, inspectorId, notes, reworkRequired, reworkNotes } = req.body;

      const qc = await this.workOrderService.createWorkOrderQC(
        workOrderId,
        {
          passed,
          inspectorId,
          notes,
          reworkRequired,
          reworkNotes,
        }
      );

      res.status(201).json({
        success: true,
        data: qc,
        message: 'Work order QC created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getWorkOrderQC(req: Request, res: Response) {
    try {
      const { workOrderId } = req.params;
      const qc = await this.workOrderService.getWorkOrderQC(workOrderId);

      res.json({
        success: true,
        data: qc,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Generate estimate from labor and parts
  async generateEstimateFromLaborAndParts(req: Request, res: Response) {
    try {
      const { workOrderId } = req.params;
      const supabaseUserId = (req as any).user?.id; // Get Supabase user ID from auth middleware

      if (!supabaseUserId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Find the ServiceAdvisor ID that corresponds to this Supabase user
      const serviceAdvisor = await this.workOrderService.findServiceAdvisorBySupabaseUserId(supabaseUserId);
      
      if (!serviceAdvisor) {
        return res.status(403).json({
          success: false,
          error: 'Service advisor not found for this user'
        });
      }

      const result = await this.workOrderService.generateEstimateFromLaborAndParts(workOrderId, serviceAdvisor.id);

      res.json({
        success: true,
        data: result,
        message: 'Estimate generated successfully and work order status updated to APPROVAL',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
