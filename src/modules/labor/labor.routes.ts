import { Router } from 'express';
import { LaborController } from './labor.controller';
import { authenticateSupabaseToken, requireTechnician } from '../auth/supabase/authSupabase.middleware';
import {
  validateCreateLaborCatalog,
  validateUpdateLaborCatalog,
  validateCreateWorkOrderLabour,
  validateUpdateWorkOrderLabour,
  validateLaborCatalogFilter,
  validateWorkOrderLabourFilter,
} from './labor.validation';

const router = Router();
const laborController = new LaborController();

// Labor Catalog Management Routes
router.post('/catalog', validateCreateLaborCatalog, laborController.createLaborCatalog.bind(laborController));
router.get('/catalog', validateLaborCatalogFilter, laborController.getLaborCatalogs.bind(laborController));
router.get('/catalog/:id', laborController.getLaborCatalogById.bind(laborController));
router.put('/catalog/:id', validateUpdateLaborCatalog, laborController.updateLaborCatalog.bind(laborController));
router.delete('/catalog/:id', laborController.deleteLaborCatalog.bind(laborController));

// Work Order Labour Management Routes
router.post('/work-order', validateCreateWorkOrderLabour, laborController.createWorkOrderLabour.bind(laborController));
router.get('/work-order', validateWorkOrderLabourFilter, laborController.getWorkOrderLabours.bind(laborController));
router.get('/work-order/:id', laborController.getWorkOrderLabourById.bind(laborController));
router.put('/work-order/:id', validateUpdateWorkOrderLabour, laborController.updateWorkOrderLabour.bind(laborController));
router.delete('/work-order/:id', laborController.deleteWorkOrderLabour.bind(laborController));

// Summary and Analytics Routes
router.get('/work-order/:workOrderId/summary', laborController.getWorkOrderLaborSummary.bind(laborController));
router.get('/categories', laborController.getLaborCategories.bind(laborController));
router.get('/technician/:technicianId/summary', laborController.getTechnicianLaborSummary.bind(laborController));

export default router;
