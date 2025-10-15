import { Router } from 'express';
import { TechnicianController } from './technicians.controller';
import { TechnicianService } from './technicians.service';
import {
  validateRequest,
  createTechnicianSchema,
  updateTechnicianSchema,
  technicianIdSchema,
  technicianFiltersSchema,
} from './technicians.validation';
import prisma from '../../infrastructure/database/prisma';

const router = Router();
const technicianService = new TechnicianService(prisma);
const technicianController = new TechnicianController(technicianService);

// Get all technicians with optional filtering
router.get(
  '/',
  validateRequest(technicianFiltersSchema, 'query'),
  technicianController.getTechnicians.bind(technicianController)
);

// Get technician statistics
router.get(
  '/statistics',
  technicianController.getTechnicianStats.bind(technicianController)
);

// Get currently working technicians
router.get(
  '/working',
  technicianController.getCurrentlyWorkingTechnicians.bind(technicianController)
);

// Get simple currently working technicians
router.get(
  '/working-simple',
  technicianController.getWorkingTechniciansSimple.bind(technicianController)
);

// Get technician monthly performance
router.get(
  '/performance/monthly',
  technicianController.getTechnicianMonthlyPerformance.bind(technicianController)
);

// Get technician working status counts
router.get(
  '/working-status',
  technicianController.getTechnicianWorkingStatusCounts.bind(technicianController)
);

// Search technicians
router.get(
  '/search',
  technicianController.searchTechnicians.bind(technicianController)
);

// Get technician by employee ID (static route first)
router.get(
  '/employee/:employeeId',
  technicianController.getTechnicianByEmployeeId.bind(technicianController)
);

// Get work orders for a technician (static route before param routes)
router.get(
  '/:id/work-orders',
  validateRequest(technicianIdSchema, 'params'),
  technicianController.getWorkOrdersByTechnician.bind(technicianController)
);

// Create technician
router.post(
  '/',
  validateRequest(createTechnicianSchema),
  technicianController.createTechnician.bind(technicianController)
);

// Get technician by ID (param route last)
router.get(
  '/:id',
  validateRequest(technicianIdSchema, 'params'),
  technicianController.getTechnicianById.bind(technicianController)
);

// Update technician
router.put(
  '/:id',
  validateRequest(technicianIdSchema, 'params'),
  validateRequest(updateTechnicianSchema),
  technicianController.updateTechnician.bind(technicianController)
);

// Delete technician
router.delete(
  '/:id',
  validateRequest(technicianIdSchema, 'params'),
  technicianController.deleteTechnician.bind(technicianController)
);

export default router;
