import { Router } from 'express';
import { InvoicesController } from './invoices.controller';
import { authenticateSupabaseToken, requireServiceAdvisor, requireManager } from '../auth/supabase/authSupabase.middleware';
import { createInvoiceSchema, updateInvoiceSchema, validateRequest } from './invoices.validation';

const router = Router();
const invoicesController = new InvoicesController();

// Invoice Management Routes
router.post('/', authenticateSupabaseToken, requireServiceAdvisor, validateRequest(createInvoiceSchema, 'body'), invoicesController.createInvoice);
router.get('/', invoicesController.getInvoices);
router.get('/statistics', authenticateSupabaseToken, requireManager, invoicesController.getInvoiceStatistics);

// Invoice by ID Routes
router.get('/:id', invoicesController.getInvoiceById);
router.put('/:id', authenticateSupabaseToken, requireServiceAdvisor, validateRequest(updateInvoiceSchema, 'body'), invoicesController.updateInvoice);
router.delete('/:id', authenticateSupabaseToken, requireManager, invoicesController.deleteInvoice);

// Work Order Invoice Routes
router.get('/work-order/:workOrderId', invoicesController.getInvoicesByWorkOrder);

export default router;
