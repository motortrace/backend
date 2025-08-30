import { Router } from 'express';
import { CannedServiceController } from './canned-services.controller';
import { validateRequest } from './canned-services.types';
import {
  createCannedServiceSchema,
  updateCannedServiceSchema,
  cannedServiceFiltersSchema,
} from './canned-services.types';

const router = Router();
const cannedServiceController = new CannedServiceController();

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

export default router;
