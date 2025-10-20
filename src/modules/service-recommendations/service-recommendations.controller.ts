import { Request, Response } from 'express';
import { ServiceRecommendationsService } from './service-recommendations.service';
import {
  GetRecommendationsRequest,
  UpdateRecommendationStatusRequest,
  BulkUpdateRecommendationsRequest
} from './service-recommendations.types';

const serviceRecommendationsService = new ServiceRecommendationsService();

export class ServiceRecommendationsController {

  /**
   * Get service recommendations for a vehicle
   */
  async getRecommendations(req: Request, res: Response) {
    try {
      const { vehicleId } = req.params;
      const includeCompleted = req.query.includeCompleted === 'true';
      const includeDismissed = req.query.includeDismissed === 'true';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

      const request: GetRecommendationsRequest = {
        vehicleId,
        includeCompleted,
        includeDismissed,
        limit,
        offset
      };

      const result = await serviceRecommendationsService.generateRecommendations(request);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting service recommendations:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get service recommendations'
      });
    }
  }

  /**
   * Update recommendation status
   */
  async updateRecommendationStatus(req: Request, res: Response) {
    try {
      const { recommendationId } = req.params;
      const updateData: UpdateRecommendationStatusRequest = {
        recommendationId,
        ...req.body
      };

      await serviceRecommendationsService.updateRecommendationStatus(updateData);

      res.json({
        success: true,
        message: 'Recommendation status updated successfully'
      });
    } catch (error) {
      console.error('Error updating recommendation status:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update recommendation status'
      });
    }
  }

  /**
   * Bulk update recommendation statuses
   */
  async bulkUpdateRecommendationStatuses(req: Request, res: Response) {
    try {
      const bulkData: BulkUpdateRecommendationsRequest = req.body;

      await serviceRecommendationsService.bulkUpdateRecommendationStatuses(bulkData);

      res.json({
        success: true,
        message: 'Recommendations updated successfully'
      });
    } catch (error) {
      console.error('Error bulk updating recommendations:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to bulk update recommendations'
      });
    }
  }

  /**
   * Get recommendation analytics
   */
  async getRecommendationAnalytics(req: Request, res: Response) {
    try {
      const { vehicleId } = req.params;

      // This would provide analytics about recommendations
      // For now, return basic stats
      const recommendations = await serviceRecommendationsService.generateRecommendations({
        vehicleId,
        includeCompleted: true,
        includeDismissed: true
      });

      const stats = {
        totalRecommendations: recommendations.totalCount,
        pendingRecommendations: recommendations.recommendations.filter(r => r.priority === 'CRITICAL' || r.priority === 'HIGH').length,
        completedThisMonth: 0, // Would need to calculate from history
        averageResponseTime: 0, // Would need to calculate from history
        topServiceTypes: [] // Would need to aggregate from data
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting recommendation analytics:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get recommendation analytics'
      });
    }
  }

  /**
   * Refresh recommendations for a vehicle
   */
  async refreshRecommendations(req: Request, res: Response) {
    try {
      const { vehicleId } = req.params;

      // Force regeneration of recommendations
      const result = await serviceRecommendationsService.generateRecommendations({
        vehicleId,
        includeCompleted: false,
        includeDismissed: false
      });

      res.json({
        success: true,
        data: result,
        message: 'Recommendations refreshed successfully'
      });
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to refresh recommendations'
      });
    }
  }
}