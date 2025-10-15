import { Request, Response } from 'express';
import { MileageTrackingService } from './mileage-tracking.service';
import {
  CreateMileageEntryRequest,
  UpdateMileageEntryRequest,
  MileageAnalyticsRequest,
  BulkMileageUpdateRequest
} from './mileage-tracking.types';

const mileageService = new MileageTrackingService();

export class MileageTrackingController {

  /**
   * Create a new mileage entry
   */
  async createMileageEntry(req: any, res: Response) {
    try {
      const entryData: CreateMileageEntryRequest = req.body;
      const userId = req.user?.id;

      const entry = await mileageService.createMileageEntry(entryData, userId);

      res.status(201).json({
        success: true,
        data: entry,
        message: 'Mileage entry created successfully'
      });
    } catch (error) {
      console.error('Error creating mileage entry:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create mileage entry'
      });
    }
  }

  /**
   * Update a mileage entry
   */
  async updateMileageEntry(req: Request, res: Response) {
    try {
      const { entryId } = req.params;
      const updateData: UpdateMileageEntryRequest = req.body;

      const entry = await mileageService.updateMileageEntry(entryId, updateData);

      res.json({
        success: true,
        data: entry,
        message: 'Mileage entry updated successfully'
      });
    } catch (error) {
      console.error('Error updating mileage entry:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update mileage entry'
      });
    }
  }

  /**
   * Get mileage entries for a vehicle
   */
  async getMileageEntries(req: Request, res: Response) {
    try {
      const { vehicleId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const entries = await mileageService.getMileageEntries(vehicleId, limit, offset);

      res.json({
        success: true,
        data: entries,
        pagination: {
          limit,
          offset,
          count: entries.length
        }
      });
    } catch (error) {
      console.error('Error fetching mileage entries:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch mileage entries'
      });
    }
  }

  /**
   * Get vehicle mileage summary
   */
  async getVehicleMileageSummary(req: Request, res: Response) {
    try {
      const { vehicleId } = req.params;

      const summary = await mileageService.getVehicleMileageSummary(vehicleId);

      if (!summary) {
        return res.status(404).json({
          success: false,
          message: 'No mileage data found for this vehicle'
        });
      }

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error fetching vehicle mileage summary:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch mileage summary'
      });
    }
  }

  /**
   * Get mileage analytics
   */
  async getMileageAnalytics(req: Request, res: Response) {
    try {
      const analyticsData: MileageAnalyticsRequest = req.body;

      const analytics = await mileageService.getMileageAnalytics(analyticsData);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error fetching mileage analytics:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch mileage analytics'
      });
    }
  }

  /**
   * Bulk update mileage entries
   */
  async bulkUpdateMileage(req: any, res: Response) {
    try {
      const bulkData: BulkMileageUpdateRequest = req.body;
      const userId = req.user?.id;

      const entries = await mileageService.bulkUpdateMileage(bulkData, userId);

      res.status(201).json({
        success: true,
        data: entries,
        message: `Successfully created ${entries.length} mileage entries`
      });
    } catch (error) {
      console.error('Error bulk updating mileage:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to bulk update mileage'
      });
    }
  }

  /**
   * Delete a mileage entry
   */
  async deleteMileageEntry(req: Request, res: Response) {
    try {
      const { entryId } = req.params;

      await mileageService.deleteMileageEntry(entryId);

      res.json({
        success: true,
        message: 'Mileage entry deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting mileage entry:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete mileage entry'
      });
    }
  }

  /**
   * Get current mileage for a vehicle
   */
  async getCurrentMileage(req: Request, res: Response) {
    try {
      const { vehicleId } = req.params;

      const summary = await mileageService.getVehicleMileageSummary(vehicleId);

      res.json({
        success: true,
        data: {
          vehicleId,
          currentMileage: summary?.currentMileage || 0,
          lastUpdated: summary?.lastUpdated
        }
      });
    } catch (error) {
      console.error('Error fetching current mileage:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch current mileage'
      });
    }
  }
}