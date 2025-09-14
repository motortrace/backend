import { Router } from 'express';
import { InvoicesController } from './invoices.controller';
import { authenticateSupabaseToken, requireServiceAdvisor, requireManager } from '../auth/supabase/authSupabase.middleware';
import { createInvoiceSchema, updateInvoiceSchema, validateRequest } from './invoices.validation';

const router = Router();
const invoicesController = new InvoicesController();

// Invoice Management Routes
router.post('/', authenticateSupabaseToken, requireServiceAdvisor, validateRequest(createInvoiceSchema, 'body'), invoicesController.createInvoice.bind(invoicesController));
router.get('/', invoicesController.getInvoices.bind(invoicesController));
router.get('/statistics', authenticateSupabaseToken, requireManager, invoicesController.getInvoiceStatistics.bind(invoicesController));

// Invoice by ID Routes
router.get('/:id', invoicesController.getInvoiceById.bind(invoicesController));
router.put('/:id', authenticateSupabaseToken, requireServiceAdvisor, validateRequest(updateInvoiceSchema, 'body'), invoicesController.updateInvoice.bind(invoicesController));
router.delete('/:id', authenticateSupabaseToken, requireManager, invoicesController.deleteInvoice.bind(invoicesController));

// Work Order Invoice Routes
router.get('/work-order/:workOrderId', invoicesController.getInvoicesByWorkOrder.bind(invoicesController));

export default router;
