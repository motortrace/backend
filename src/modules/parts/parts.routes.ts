import { Router } from 'express';
import { WorkOrderPartController } from './parts.controller';
import { WorkOrderPartService } from './parts.service';
import prisma from '../../infrastructure/database/prisma';
import {
  authenticateSupabaseToken,
  requireServiceAdvisor,
  requireTechnician,
} from '../auth/supabase/authSupabase.middleware';
import {
  validateCreateWorkOrderPart,
  validateUpdateWorkOrderPart,
} from './parts.validation';

const router = Router();

// Dependency Injection
const workOrderPartService = new WorkOrderPartService(prisma);
const workOrderPartController = new WorkOrderPartController(workOrderPartService);

// Create work order part
router.post(
  '/',
  authenticateSupabaseToken,
  requireServiceAdvisor,
  validateCreateWorkOrderPart,
  workOrderPartController.createWorkOrderPart.bind(workOrderPartController)
);

// Get work order parts by work order ID
router.get(
  '/work-order/:workOrderId',
  authenticateSupabaseToken,
  requireServiceAdvisor,
  workOrderPartController.getWorkOrderParts.bind(workOrderPartController)
);

// Get work order part by ID
router.get(
  '/:id',
  authenticateSupabaseToken,
  requireServiceAdvisor,
  workOrderPartController.getWorkOrderPartById.bind(workOrderPartController)
);

// Update work order part
router.put(
  '/:id',
  authenticateSupabaseToken,
  requireServiceAdvisor,
  validateUpdateWorkOrderPart,
  workOrderPartController.updateWorkOrderPart.bind(workOrderPartController)
);

// Delete work order part
router.delete(
  '/:id',
  authenticateSupabaseToken,
  requireServiceAdvisor,
  workOrderPartController.deleteWorkOrderPart.bind(workOrderPartController)
);

export default router;