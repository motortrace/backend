import { Router } from 'express';
import { CannedServiceController } from './canned-services.controller';
import {
  validateCreateCannedService,
  validateUpdateCannedService,
  validateCannedServiceFilter,
} from './canned-services.validation';

const router = Router();
const cannedServiceController = new CannedServiceController();

// Basic CRUD operations
router.post('/', validateCreateCannedService, cannedServiceController.createCannedService.bind(cannedServiceController));
router.get('/', validateCannedServiceFilter, cannedServiceController.getCannedServices.bind(cannedServiceController));
router.get('/summary', cannedServiceController.getCannedServiceSummary.bind(cannedServiceController));
router.get('/available', cannedServiceController.getAvailableCannedServices.bind(cannedServiceController));

// Individual service operations
router.get('/:id', cannedServiceController.getCannedService.bind(cannedServiceController));
router.put('/:id', validateUpdateCannedService, cannedServiceController.updateCannedService.bind(cannedServiceController));
router.delete('/:id', cannedServiceController.deleteCannedService.bind(cannedServiceController));

export default router;
