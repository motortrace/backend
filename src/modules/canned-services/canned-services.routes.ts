import { Router } from 'express';
import { CannedServiceController } from './canned-services.controller';
import { CannedServiceService } from './canned-services.service';
import { validateRequest } from './canned-services.types';
import {
  createCannedServiceSchema,
  updateCannedServiceSchema,
  cannedServiceFiltersSchema,
} from './canned-services.types';
import prisma from '../../infrastructure/database/prisma';

const router = Router();
const cannedServiceService = new CannedServiceService(prisma);
const cannedServiceController = new CannedServiceController(cannedServiceService);

// Create a new canned service
router.post(
  '/',
  validateRequest(createCannedServiceSchema),
  cannedServiceController.createCannedService.bind(cannedServiceController)
);

// Get all canned services with optional filters
router.get(
  '/',
  validateRequest(cannedServiceFiltersSchema, 'query'),
  cannedServiceController.getCannedServices.bind(cannedServiceController)
);

// Get available canned services only
router.get(
  '/available',
  cannedServiceController.getAvailableCannedServices.bind(cannedServiceController)
);

// Search canned services
router.get(
  '/search',
  validateRequest(cannedServiceFiltersSchema, 'query'),
  cannedServiceController.searchCannedServices.bind(cannedServiceController)
);

// Get canned service by ID
router.get(
  '/:id',
  cannedServiceController.getCannedServiceById.bind(cannedServiceController)
);

// Get canned service by code
router.get(
  '/code/:code',
  cannedServiceController.getCannedServiceByCode.bind(cannedServiceController)
);

// Get canned service with detailed information including labor and parts
router.get(
  '/:id/details',
  cannedServiceController.getCannedServiceDetails.bind(cannedServiceController)
);

// Update canned service
router.put(
  '/:id',
  validateRequest(updateCannedServiceSchema),
  cannedServiceController.updateCannedService.bind(cannedServiceController)
);

// Toggle availability
router.patch(
  '/:id/toggle-availability',
  cannedServiceController.toggleAvailability.bind(cannedServiceController)
);

// Bulk update prices
router.patch(
  '/bulk-update-prices',
  cannedServiceController.bulkUpdatePrices.bind(cannedServiceController)
);

// Delete canned service
router.delete(
  '/:id',
  cannedServiceController.deleteCannedService.bind(cannedServiceController)
);

// Analytics endpoints
router.get(
  '/analytics/popularity',
  cannedServiceController.getServicePopularity.bind(cannedServiceController)
);

router.get(
  '/analytics/revenue',
  cannedServiceController.getRevenueByService.bind(cannedServiceController)
);

router.get(
  '/analytics/categories',
  cannedServiceController.getServiceCategories.bind(cannedServiceController)
);

// Get inspection template recommendations for work order services
router.get(
  '/work-orders/:workOrderId/inspection-templates',
  cannedServiceController.getInspectionTemplatesForWorkOrder.bind(cannedServiceController)
);

export default router;
