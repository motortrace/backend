import { Router } from 'express';
import { ServiceAdvisorController } from './service-advisors.controller';
import { ServiceAdvisorService } from './service-advisors.service';
import {
  validateRequest,
  createServiceAdvisorSchema,
  updateServiceAdvisorSchema,
  serviceAdvisorIdSchema,
  serviceAdvisorFiltersSchema,
} from './service-advisors.validation';
import prisma from '../../infrastructure/database/prisma';

const router = Router();
const serviceAdvisorService = new ServiceAdvisorService(prisma);
const serviceAdvisorController = new ServiceAdvisorController(serviceAdvisorService);

// Get all service advisors with optional filtering
router.get(
  '/',
  validateRequest(serviceAdvisorFiltersSchema, 'query'),
  serviceAdvisorController.getServiceAdvisors.bind(serviceAdvisorController)
);

// Get service advisor statistics
router.get(
  '/statistics',
  serviceAdvisorController.getServiceAdvisorStats.bind(serviceAdvisorController)
);

// Search service advisors
router.get(
  '/search',
  serviceAdvisorController.searchServiceAdvisors.bind(serviceAdvisorController)
);

// Get service advisor by employee ID (static route first)
router.get(
  '/employee/:employeeId',
  serviceAdvisorController.getServiceAdvisorByEmployeeId.bind(serviceAdvisorController)
);

// Get work orders for a service advisor (static route before param routes)
router.get(
  '/:id/work-orders',
  validateRequest(serviceAdvisorIdSchema, 'params'),
  serviceAdvisorController.getWorkOrdersByServiceAdvisor.bind(serviceAdvisorController)
);

// Create service advisor
router.post(
  '/',
  validateRequest(createServiceAdvisorSchema),
  serviceAdvisorController.createServiceAdvisor.bind(serviceAdvisorController)
);

// Get service advisor by ID (param route last)
router.get(
  '/:id',
  validateRequest(serviceAdvisorIdSchema, 'params'),
  serviceAdvisorController.getServiceAdvisorById.bind(serviceAdvisorController)
);

// Update service advisor
router.put(
  '/:id',
  validateRequest(serviceAdvisorIdSchema, 'params'),
  validateRequest(updateServiceAdvisorSchema),
  serviceAdvisorController.updateServiceAdvisor.bind(serviceAdvisorController)
);

// Delete service advisor
router.delete(
  '/:id',
  validateRequest(serviceAdvisorIdSchema, 'params'),
  serviceAdvisorController.deleteServiceAdvisor.bind(serviceAdvisorController)
);

export default router;
