import { Router } from 'express';
import { LaborController } from './labor.controller';
import { 
  authenticateSupabaseToken, 
  requireTechnician, 
  requireManager, 
  requireServiceAdvisor,
  requireAdmin 
} from '../auth/supabase/authSupabase.middleware';
import {
  validateCreateLaborCatalog,
  validateUpdateLaborCatalog,
  validateCreateWorkOrderLabor,
  validateUpdateWorkOrderLabor,
  validateLaborCatalogFilter,
  validateWorkOrderLaborFilter,
} from './labor.validation';

const router = Router();
const laborController = new LaborController();

// Simple Labor Creation Route (following appointments pattern)
router.post('/', authenticateSupabaseToken, requireTechnician, laborController.createLabor.bind(laborController));

// Labor Catalog Management Routes
router.post('/catalog', authenticateSupabaseToken, requireServiceAdvisor, validateCreateLaborCatalog, laborController.createLaborCatalog.bind(laborController));
router.get('/catalog', authenticateSupabaseToken, validateLaborCatalogFilter, laborController.getLaborCatalogs.bind(laborController));
router.get('/catalog/:id', authenticateSupabaseToken, laborController.getLaborCatalogById.bind(laborController));
router.put('/catalog/:id', authenticateSupabaseToken, requireManager, validateUpdateLaborCatalog, laborController.updateLaborCatalog.bind(laborController));
router.delete('/catalog/:id', authenticateSupabaseToken, requireManager, laborController.deleteLaborCatalog.bind(laborController));

// Work Order Labor Management Routes
router.post('/work-order', authenticateSupabaseToken, requireTechnician, validateCreateWorkOrderLabor, laborController.createWorkOrderLabor.bind(laborController));
router.get('/work-order', validateWorkOrderLaborFilter, laborController.getWorkOrderLabors.bind(laborController));
router.get('/work-order/:id', authenticateSupabaseToken, requireServiceAdvisor, laborController.getWorkOrderLaborById.bind(laborController));
router.put('/work-order/:id', authenticateSupabaseToken, requireTechnician, validateUpdateWorkOrderLabor, laborController.updateWorkOrderLabor.bind(laborController));
router.delete('/work-order/:id', authenticateSupabaseToken, requireManager, laborController.deleteWorkOrderLabor.bind(laborController));

// Summary and Analytics Routes
router.get('/work-order/:workOrderId/summary', authenticateSupabaseToken, requireServiceAdvisor, laborController.getWorkOrderLaborSummary.bind(laborController));
router.get('/categories', authenticateSupabaseToken, laborController.getLaborCategories.bind(laborController));
router.get('/technician/:technicianId/summary', authenticateSupabaseToken, requireManager, laborController.getTechnicianLaborSummary.bind(laborController));

export default router;
