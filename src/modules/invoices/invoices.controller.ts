import { Request, Response } from 'express';
import { InvoicesService } from './invoices.service';
import {
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceFilters,
} from './invoices.types';

export class InvoicesController {
  private invoicesService = new InvoicesService();

  // Create invoice
  async createInvoice(req: Request, res: Response) {
    try {
      const invoiceData: CreateInvoiceRequest = req.body;
      const invoice = await this.invoicesService.createInvoice(invoiceData);

      res.status(201).json({
        success: true,
        data: invoice,
        message: 'Invoice created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get invoice by ID
  async getInvoiceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const invoice = await this.invoicesService.getInvoiceById(id);

      res.json({
        success: true,
        data: invoice,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get invoices with filters
  async getInvoices(req: Request, res: Response) {
    try {
      const { 
        workOrderId, 
        status, 
        startDate, 
        endDate, 
        page = 1, 
        limit = 10 
      } = req.query;

      const filters: InvoiceFilters = {};
      
      if (workOrderId) filters.workOrderId = workOrderId as string;
      if (status) filters.status = status as any;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const result = await this.invoicesService.getInvoices(
        filters, 
        Number(page), 
        Number(limit)
      );

      res.json({
        success: true,
        data: result.invoices,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: result.total,
          pages: Math.ceil(result.total / Number(limit)),
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get invoices for a work order
  async getInvoicesByWorkOrder(req: Request, res: Response) {
    try {
      const { workOrderId } = req.params;
      const invoices = await this.invoicesService.getInvoicesByWorkOrder(workOrderId);

      res.json({
        success: true,
        data: invoices,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Update invoice
  async updateInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateInvoiceRequest = req.body;
      const invoice = await this.invoicesService.updateInvoice(id, updateData);

      res.json({
        success: true,
        data: invoice,
        message: 'Invoice updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Delete invoice
  async deleteInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.invoicesService.deleteInvoice(id);

      res.json({
        success: true,
        message: 'Invoice deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get invoice statistics
  async getInvoiceStatistics(req: Request, res: Response) {
    try {
      const statistics = await this.invoicesService.getInvoiceStatistics();

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
}
