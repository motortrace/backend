import { Router } from 'express';
import { ServiceRecommendationsController } from './service-recommendations.controller';

const router = Router();
const controller = new ServiceRecommendationsController();

// Get recommendations for a vehicle
router.get('/vehicles/:vehicleId/recommendations', (req, res) =>
  controller.getRecommendations(req, res)
);

// Refresh recommendations for a vehicle
router.post('/vehicles/:vehicleId/recommendations/refresh', (req, res) =>
  controller.refreshRecommendations(req, res)
);

// Update recommendation status
router.put('/recommendations/:recommendationId/status', (req, res) =>
  controller.updateRecommendationStatus(req, res)
);

// Bulk update recommendation statuses
router.put('/recommendations/bulk-update', (req, res) =>
  controller.bulkUpdateRecommendationStatuses(req, res)
);

// Get recommendation analytics
router.get('/vehicles/:vehicleId/analytics', (req, res) =>
  controller.getRecommendationAnalytics(req, res)
);

export default router;