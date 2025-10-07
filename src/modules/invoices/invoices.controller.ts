import { Request, Response } from 'express';
import {
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceFilters,
  IInvoicesService,
} from './invoices.types';
import { asyncHandler } from '../../shared/middleware/async-handler';

export class InvoicesController {
  constructor(private readonly invoicesService: IInvoicesService) {}

  // Create invoice
  createInvoice = asyncHandler(async (req: Request, res: Response) => {
    const invoiceData: CreateInvoiceRequest = req.body;
    const invoice = await this.invoicesService.createInvoice(invoiceData);

    res.status(201).json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully',
    });
  });

  // Get invoice by ID
  getInvoiceById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const invoice = await this.invoicesService.getInvoiceById(id);

    res.json({
      success: true,
      data: invoice,
    });
  });

  // Get invoices with filters
  getInvoices = asyncHandler(async (req: Request, res: Response) => {
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
  });

  // Get invoices for a work order
  getInvoicesByWorkOrder = asyncHandler(async (req: Request, res: Response) => {
    const { workOrderId } = req.params;
    const invoices = await this.invoicesService.getInvoicesByWorkOrder(workOrderId);

    res.json({
      success: true,
      data: invoices,
    });
  });

  // Update invoice
  updateInvoice = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData: UpdateInvoiceRequest = req.body;
    const invoice = await this.invoicesService.updateInvoice(id, updateData);

    res.json({
      success: true,
      data: invoice,
      message: 'Invoice updated successfully',
    });
  });

  // Delete invoice
  deleteInvoice = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.invoicesService.deleteInvoice(id);

    res.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  });

  // Get invoice statistics
  getInvoiceStatistics = asyncHandler(async (req: Request, res: Response) => {
    const statistics = await this.invoicesService.getInvoiceStatistics();

    res.json({
      success: true,
      data: statistics,
    });
  });

  // Generate PDF invoice
  generateInvoicePDF = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pdfUrl = await this.invoicesService.generateInvoicePDF(id);

    // Return the PDF URL
    res.status(200).json({
      success: true,
      message: 'Invoice PDF generated successfully',
      data: {
        url: pdfUrl
      }
    });
  });
}
