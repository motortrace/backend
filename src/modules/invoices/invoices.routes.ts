import { Router } from 'express';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { authenticateSupabaseToken, requireServiceAdvisor, requireManager } from '../auth/supabase/authSupabase.middleware';
import { createInvoiceSchema, updateInvoiceSchema, validateRequest } from './invoices.validation';
import prisma from '../../infrastructure/database/prisma';

const router = Router();

// Dependency Injection: Wire up dependencies
const invoicesService = new InvoicesService(prisma);
const invoicesController = new InvoicesController(invoicesService);

// Invoice Management Routes
router.post('/', authenticateSupabaseToken, requireServiceAdvisor, validateRequest(createInvoiceSchema, 'body'), invoicesController.createInvoice);
router.get('/', invoicesController.getInvoices);
router.get('/statistics', authenticateSupabaseToken, requireManager, invoicesController.getInvoiceStatistics);

// Invoice by ID Routes
router.get('/:id', invoicesController.getInvoiceById);
router.get('/:id/pdf', invoicesController.generateInvoicePDF); // Generate PDF
router.put('/:id', authenticateSupabaseToken, requireServiceAdvisor, validateRequest(updateInvoiceSchema, 'body'), invoicesController.updateInvoice);
router.delete('/:id', authenticateSupabaseToken, requireManager, invoicesController.deleteInvoice);

// Work Order Invoice Routes
router.get('/work-order/:workOrderId', invoicesController.getInvoicesByWorkOrder);

export default router;
