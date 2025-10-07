import { Router } from 'express';
import { EstimatesController } from './estimates.controller';
import { EstimatesService } from './estimates.service';
import {
  createEstimateSchema,
  updateEstimateSchema,
  createEstimateLaborSchema,
  updateEstimateLaborSchema,
  createEstimatePartSchema,
  updateEstimatePartSchema,
  createEstimateApprovalSchema,
  updateEstimateApprovalSchema,
  estimateFiltersSchema,
  estimateIdSchema,
  estimateIdParamSchema,
  estimateLaborIdSchema,
  estimatePartIdSchema,
  estimateApprovalIdSchema,
  validateRequest,
} from './estimates.validation';
import prisma from '../../infrastructure/database/prisma';

const router = Router();

// Dependency Injection
const estimatesService = new EstimatesService(prisma);
const estimatesController = new EstimatesController(estimatesService);

// Estimate routes
router.post(
  '/',
  validateRequest(createEstimateSchema),
  estimatesController.createEstimate.bind(estimatesController)
);

router.get(
  '/',
  validateRequest(estimateFiltersSchema, 'query'),
  estimatesController.getEstimates.bind(estimatesController)
);

router.get(
  '/statistics',
  estimatesController.getEstimateStatistics.bind(estimatesController)
);

router.get(
  '/:id',
  validateRequest(estimateIdSchema, 'params'),
  estimatesController.getEstimateById.bind(estimatesController)
);

router.put(
  '/:id',
  validateRequest(estimateIdSchema, 'params'),
  validateRequest(updateEstimateSchema),
  estimatesController.updateEstimate.bind(estimatesController)
);

router.delete(
  '/:id',
  validateRequest(estimateIdSchema, 'params'),
  estimatesController.deleteEstimate.bind(estimatesController)
);

router.post(
  '/:id/approve',
  validateRequest(estimateIdSchema, 'params'),
  estimatesController.approveEstimate.bind(estimatesController)
);

router.post(
  '/:estimateId/add-canned-service',
  validateRequest(estimateIdParamSchema, 'params'),
  estimatesController.addCannedServiceToEstimate.bind(estimatesController)
);

// Toggle estimate visibility to customer
router.patch(
  '/:estimateId/toggle-visibility',
  validateRequest(estimateIdParamSchema, 'params'),
  estimatesController.toggleEstimateVisibility.bind(estimatesController)
);

// Get estimates visible to customer for a work order
router.get(
  '/customer-visible/:workOrderId',
  estimatesController.getCustomerVisibleEstimates.bind(estimatesController)
);

// Estimate labor routes
router.post(
  '/labor',
  validateRequest(createEstimateLaborSchema),
  estimatesController.createEstimateLabor.bind(estimatesController)
);

router.put(
  '/labor/:id',
  validateRequest(estimateLaborIdSchema, 'params'),
  validateRequest(updateEstimateLaborSchema),
  estimatesController.updateEstimateLabor.bind(estimatesController)
);

router.delete(
  '/labor/:id',
  validateRequest(estimateLaborIdSchema, 'params'),
  estimatesController.deleteEstimateLabor.bind(estimatesController)
);

router.put(
  '/labor/:id/customer-approval',
  validateRequest(estimateLaborIdSchema, 'params'),
  estimatesController.customerApproveEstimateLabor.bind(estimatesController)
);

// Estimate parts routes
router.post(
  '/parts',
  validateRequest(createEstimatePartSchema),
  estimatesController.createEstimatePart.bind(estimatesController)
);

router.put(
  '/parts/:id',
  validateRequest(estimatePartIdSchema, 'params'),
  validateRequest(updateEstimatePartSchema),
  estimatesController.updateEstimatePart.bind(estimatesController)
);

router.delete(
  '/parts/:id',
  validateRequest(estimatePartIdSchema, 'params'),
  estimatesController.deleteEstimatePart.bind(estimatesController)
);

router.put(
  '/parts/:id/customer-approval',
  validateRequest(estimatePartIdSchema, 'params'),
  estimatesController.customerApproveEstimatePart.bind(estimatesController)
);

// Estimate approval routes
router.post(
  '/approvals',
  validateRequest(createEstimateApprovalSchema),
  estimatesController.createEstimateApproval.bind(estimatesController)
);

router.put(
  '/approvals/:id',
  validateRequest(estimateApprovalIdSchema, 'params'),
  validateRequest(updateEstimateApprovalSchema),
  estimatesController.updateEstimateApproval.bind(estimatesController)
);

export default router;
