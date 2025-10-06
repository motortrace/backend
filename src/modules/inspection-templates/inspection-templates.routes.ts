import { Router } from 'express';
import { InspectionTemplatesController } from './inspection-templates.controller';
import { InspectionTemplatesService } from './inspection-templates.service';
import prisma from '../../infrastructure/database/prisma';
import { authenticateSupabaseToken, requireTechnician } from '../auth/supabase/authSupabase.middleware';

const router = Router();
const service = new InspectionTemplatesService(prisma);
const controller = new InspectionTemplatesController(service);

// Template Management Routes
router.post('/templates', controller.createInspectionTemplate.bind(controller));
router.get('/templates', controller.getInspectionTemplates.bind(controller));
router.get('/templates/available', controller.getAvailableTemplates.bind(controller));
router.get('/templates/category/:category', controller.getTemplatesByCategory.bind(controller));
router.get('/templates/:id', controller.getInspectionTemplate.bind(controller));
router.put('/templates/:id', controller.updateInspectionTemplate.bind(controller));
router.delete('/templates/:id', controller.deleteInspectionTemplate.bind(controller));

// Template Image Management Routes
router.post('/templates/:id/image', 
  InspectionTemplatesController.getUploadMiddleware(),
  controller.uploadTemplateImage.bind(controller)
);
router.delete('/templates/:id/image', controller.deleteTemplateImage.bind(controller));

// Work Order Inspection Management Routes
router.post('/work-orders/assign-template', controller.assignTemplateToWorkOrder.bind(controller));
router.post('/work-orders/create-inspection', controller.createInspectionFromTemplate.bind(controller));
router.get('/work-orders/inspections', controller.getWorkOrderInspections.bind(controller));
router.get('/work-orders/:workOrderId/inspections', controller.getWorkOrderInspectionsByWorkOrder.bind(controller));
router.get('/inspectors/:inspectorId/inspections', controller.getWorkOrderInspectionsByInspector.bind(controller));
router.get('/inspections/:id', controller.getWorkOrderInspection.bind(controller));
router.put('/inspections/:id', controller.updateWorkOrderInspection.bind(controller));

// Checklist Item Management Routes
router.post('/inspections/:inspectionId/checklist-items', controller.addChecklistItem.bind(controller));
router.put('/checklist-items/:id', controller.updateChecklistItem.bind(controller));
router.delete('/checklist-items/:id', controller.deleteChecklistItem.bind(controller));

// Inspection Attachment Management Routes
router.post('/inspections/:inspectionId/attachments', 
  authenticateSupabaseToken, 
  requireTechnician,
  InspectionTemplatesController.getAttachmentUploadMiddleware(),
  controller.createInspectionAttachment.bind(controller)
);
router.get('/inspections/:inspectionId/attachments', controller.getInspectionAttachments.bind(controller));
router.delete('/attachments/:attachmentId', controller.deleteInspectionAttachment.bind(controller));

// Work Order Inspection Status Routes
router.get('/work-orders/:workOrderId/inspection-status', controller.getWorkOrderInspectionStatus.bind(controller));
router.get('/work-orders/:workOrderId/can-proceed-to-estimate', controller.canProceedToEstimate.bind(controller));

export default router;
