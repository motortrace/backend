import { Router } from 'express';
import { WorkOrderController } from './work-orders.controller';
import { WorkOrderService } from './work-orders.service';
import { authenticateSupabaseToken, requireServiceAdvisor, requireTechnician, requireManager } from '../auth/supabase/authSupabase.middleware';
import { assignServiceAdvisorSchema, assignTechnicianToLaborSchema, updateWorkOrderLaborSchema, updateWorkflowStepSchema, validateRequest } from './work-orders.validation';
import prisma from '../../infrastructure/database/prisma';

const router = Router();

// Dependency Injection
const workOrderService = new WorkOrderService(prisma);
const workOrderController = new WorkOrderController(workOrderService);

// Work Order Management Routes
router.post('/', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.createWorkOrder.bind(workOrderController));
router.get('/', workOrderController.getWorkOrders.bind(workOrderController));
router.get('/:id', workOrderController.getWorkOrderById.bind(workOrderController));
router.put('/:id', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.updateWorkOrder.bind(workOrderController));
// router.put('/:id/restore', authenticateSupabaseToken, requireManager, workOrderController.restoreWorkOrder.bind(workOrderController));
// router.get('/cancelled', authenticateSupabaseToken, requireManager, workOrderController.getCancelledWorkOrders.bind(workOrderController));

// Work Order Status Management Routes
router.put('/:id/status', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.updateWorkOrderStatus.bind(workOrderController));
router.put('/:id/workflow-step', authenticateSupabaseToken, requireServiceAdvisor, validateRequest(updateWorkflowStepSchema, 'body'), workOrderController.updateWorkOrderWorkflowStep.bind(workOrderController));
router.put('/:id/assign-advisor', authenticateSupabaseToken, requireServiceAdvisor, validateRequest(assignServiceAdvisorSchema, 'body'), workOrderController.assignServiceAdvisor.bind(workOrderController));

// Labor Assignment Routes
router.put('/services/:serviceId/assign-technician-to-labor', authenticateSupabaseToken, requireServiceAdvisor, validateRequest(assignTechnicianToLaborSchema, 'body'), workOrderController.assignTechnicianToServiceLabor.bind(workOrderController));
router.put('/labor/:laborId/assign-technician', authenticateSupabaseToken, requireServiceAdvisor, validateRequest(assignTechnicianToLaborSchema, 'body'), workOrderController.assignTechnicianToLabor.bind(workOrderController));
router.put('/labor/:laborId', authenticateSupabaseToken, requireServiceAdvisor, validateRequest(updateWorkOrderLaborSchema, 'body'), workOrderController.updateWorkOrderLabor.bind(workOrderController));
router.put('/labor/:laborId/reset-subtotal', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.resetWorkOrderLaborSubtotal.bind(workOrderController));



// Work Order Services Routes
router.post('/:workOrderId/services', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.createWorkOrderService.bind(workOrderController));
router.get('/:workOrderId/services', workOrderController.getWorkOrderServices.bind(workOrderController));
router.delete('/services/:serviceId', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.deleteWorkOrderService.bind(workOrderController));

// Work Order Payments Routes
router.post('/:workOrderId/payments', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.createPayment.bind(workOrderController));
router.get('/:workOrderId/payments', workOrderController.getWorkOrderPayments.bind(workOrderController));

// Work Order Attachments Routes
router.post('/:workOrderId/attachments', authenticateSupabaseToken, requireTechnician, workOrderController.uploadAttachmentMiddleware, workOrderController.uploadWorkOrderAttachment.bind(workOrderController));
router.get('/:workOrderId/attachments', workOrderController.getWorkOrderAttachments.bind(workOrderController));

// Work Order Inspections Routes
router.post('/:workOrderId/inspections', authenticateSupabaseToken, requireTechnician, workOrderController.createWorkOrderInspection.bind(workOrderController));
router.get('/:workOrderId/inspections', workOrderController.getWorkOrderInspections.bind(workOrderController));
router.put('/inspections/:inspectionId', authenticateSupabaseToken, requireTechnician, workOrderController.updateWorkOrderInspection.bind(workOrderController));
router.delete('/inspections/:inspectionId', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.deleteWorkOrderInspection.bind(workOrderController));

// Work Order QC Routes
router.post('/:workOrderId/qc', authenticateSupabaseToken, requireTechnician, workOrderController.createWorkOrderQC.bind(workOrderController));
router.get('/:workOrderId/qc', workOrderController.getWorkOrderQC.bind(workOrderController));

// Misc Charges Routes
router.post('/:workOrderId/misc-charges', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.createWorkOrderMiscCharge.bind(workOrderController));
router.get('/:workOrderId/misc-charges', workOrderController.getWorkOrderMiscCharges.bind(workOrderController));
router.put('/misc-charges/:miscChargeId', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.updateWorkOrderMiscCharge.bind(workOrderController));
router.delete('/misc-charges/:miscChargeId', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.deleteWorkOrderMiscCharge.bind(workOrderController));

// Part Installation Routes (technician workflows)

// Generate estimate PDF and approval entry
router.post('/:workOrderId/generate-estimate', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.generateEstimate.bind(workOrderController));
router.get('/:workOrderId/approvals', workOrderController.getWorkOrderApprovals.bind(workOrderController));

// WorkOrderApproval approval routes (customer accessible)
router.post('/approvals/:approvalId/approve', authenticateSupabaseToken, workOrderController.approveWorkOrderApproval.bind(workOrderController));
router.post('/approvals/:approvalId/reject', authenticateSupabaseToken, workOrderController.rejectWorkOrderApproval.bind(workOrderController));
router.post('/approvals/:approvalId/finalize', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.finalizeEstimate.bind(workOrderController));
router.post('/:workOrderId/generate-invoice', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.generateInvoice.bind(workOrderController));

router.put('/parts/:partId/assign-technician', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.assignTechnicianToPart.bind(workOrderController));
router.put('/parts/:partId/start', authenticateSupabaseToken, requireTechnician, workOrderController.startPartInstallation.bind(workOrderController));
router.put('/parts/:partId/complete', authenticateSupabaseToken, requireTechnician, workOrderController.completePartInstallation.bind(workOrderController));

// Technician Active Work Routes
router.get('/technician/active-work', authenticateSupabaseToken, requireTechnician, workOrderController.getTechnicianActiveWork.bind(workOrderController));
router.get('/technician/:technicianId/active-work', authenticateSupabaseToken, requireServiceAdvisor, workOrderController.checkTechnicianActiveWork.bind(workOrderController));

// Work Order Statistics Routes
router.get('/statistics/overview', authenticateSupabaseToken, requireManager, workOrderController.getWorkOrderStatistics.bind(workOrderController));
router.get('/statistics/creation', authenticateSupabaseToken, requireManager, workOrderController.getWorkOrderCreationStats.bind(workOrderController));
router.get('/statistics/general', authenticateSupabaseToken, requireManager, workOrderController.getGeneralStats.bind(workOrderController));

// Work Order Search Routes
router.post('/search', workOrderController.searchWorkOrders.bind(workOrderController));

export default router;
