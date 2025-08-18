import { Router } from 'express';
import { WorkOrderController } from './work-orders.controller';
import { authenticateSupabaseToken, requireServiceAdvisor, requireTechnician, requireManager } from '../auth/supabase/authSupabase.middleware';
import { validateAssignTechnicianToLabor } from './work-orders.validation';

const router = Router();
const workOrderController = new WorkOrderController();

// Work Order Management Routes
router.post('/', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.createWorkOrder.bind(workOrderController));
router.get('/', workOrderController.getWorkOrders.bind(workOrderController));
router.get('/:id', workOrderController.getWorkOrderById.bind(workOrderController));
router.put('/:id', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.updateWorkOrder.bind(workOrderController));
router.delete('/:id', authenticateSupabaseToken, requireManager, workOrderController.deleteWorkOrder.bind(workOrderController));

// Work Order Status Management Routes
router.put('/:id/status', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.updateWorkOrderStatus.bind(workOrderController));
router.put('/:id/assign', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.assignWorkOrder.bind(workOrderController));

// Work Order Estimates Routes
router.post('/:workOrderId/estimates', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.createWorkOrderEstimate.bind(workOrderController));
router.post('/:workOrderId/generate-estimate', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.generateEstimateFromLaborAndParts.bind(workOrderController));
router.get('/:workOrderId/estimates', workOrderController.getWorkOrderEstimates.bind(workOrderController));
router.put('/:workOrderId/estimates/:estimateId/approve', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.approveWorkOrderEstimate.bind(workOrderController));

// Work Order Labour Routes
router.post('/:workOrderId/labour', authenticateSupabaseToken, requireTechnician, workOrderController.createWorkOrderLabour.bind(workOrderController));
router.get('/:workOrderId/labour', workOrderController.getWorkOrderLabour.bind(workOrderController));
router.put('/labour/:laborId/assign-technician', authenticateSupabaseToken, requireServiceAdvisor, validateAssignTechnicianToLabor, workOrderController.assignTechnicianToLabor.bind(workOrderController));

// Work Order Parts Routes
router.post('/:workOrderId/parts', authenticateSupabaseToken, requireTechnician, workOrderController.createWorkOrderPart.bind(workOrderController));
router.get('/:workOrderId/parts', workOrderController.getWorkOrderParts.bind(workOrderController));

// Work Order Services Routes
router.post('/:workOrderId/services', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.createWorkOrderService.bind(workOrderController));
router.get('/:workOrderId/services', workOrderController.getWorkOrderServices.bind(workOrderController));

// Work Order Payments Routes
router.post('/:workOrderId/payments', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.createPayment.bind(workOrderController));
router.get('/:workOrderId/payments', workOrderController.getWorkOrderPayments.bind(workOrderController));

// Work Order Attachments Routes
router.post('/:workOrderId/attachments', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.uploadWorkOrderAttachment.bind(workOrderController));
router.get('/:workOrderId/attachments', workOrderController.getWorkOrderAttachments.bind(workOrderController));

// Work Order Inspections Routes
router.post('/:workOrderId/inspections', authenticateSupabaseToken, requireTechnician, workOrderController.createWorkOrderInspection.bind(workOrderController));
router.get('/:workOrderId/inspections', workOrderController.getWorkOrderInspections.bind(workOrderController));

// Work Order QC Routes
router.post('/:workOrderId/qc', authenticateSupabaseToken, requireTechnician, workOrderController.createWorkOrderQC.bind(workOrderController));
router.get('/:workOrderId/qc', workOrderController.getWorkOrderQC.bind(workOrderController));

// Work Order Statistics Routes
router.get('/statistics/overview', authenticateSupabaseToken, requireManager, workOrderController.getWorkOrderStatistics.bind(workOrderController));

// Work Order Search Routes
router.post('/search', workOrderController.searchWorkOrders.bind(workOrderController));

export default router;
