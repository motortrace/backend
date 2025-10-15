import { Request, Response } from 'express';
import { CannedServiceService } from './canned-services.service';
import {
  CreateCannedServiceRequest,
  UpdateCannedServiceRequest,
  CannedServiceFilters,
} from './canned-services.types';

export class CannedServiceController {
  constructor(private readonly cannedServiceService: CannedServiceService) {}

  // Simak's method for Create a new canned service 
  // async createCannedService(req: Request, res: Response): Promise<void> {
  //   try {
  //     const data: CreateCannedServiceRequest = req.body;
  //     const cannedService = await this.cannedServiceService.createCannedService(data);

  //     res.status(201).json({
  //       success: true,
  //       data: cannedService,
  //       message: 'Canned service created successfully',
  //     });
  //   } catch (error: any) {
  //     res.status(400).json({
  //       success: false,
  //       error: error.message,
  //       message: 'Failed to create canned service',
  //     });
  //   }
  // }




  // Jabir's updated method for Create a new canned service
  async createCannedService(req: Request, res: Response): Promise<void> {
    try {
      const data: any = req.body;

      // Check if labor operations are provided
      const laborOperations = data.laborOperations || [];
      delete data.laborOperations; // Remove from main data

      const cannedService = await this.cannedServiceService.createCannedServiceWithLabor(
        data,
        laborOperations
      );

      res.status(201).json({
        success: true,
        data: cannedService,
        message: 'Canned service created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        message: 'Failed to create canned service',
      });
    }
  }

  // Get all canned services with optional filters
  async getCannedServices(req: Request, res: Response): Promise<void> {
    try {
      const filters: CannedServiceFilters = {
        isAvailable: req.query.isAvailable === 'true' ? true :
          req.query.isAvailable === 'false' ? false : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        search: req.query.search as string,
      };

      const cannedServices = await this.cannedServiceService.getCannedServices(filters);

      res.status(200).json({
        success: true,
        data: cannedServices,
        count: cannedServices.length,
        message: 'Canned services retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve canned services',
      });
    }
  }

  // Get canned service by ID
  async getCannedServiceById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cannedService = await this.cannedServiceService.getCannedServiceById(id);

      if (!cannedService) {
        res.status(404).json({
          success: false,
          error: 'Canned service not found',
          message: 'The requested canned service does not exist',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: cannedService,
        message: 'Canned service retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve canned service',
      });
    }
  }

  // Get canned service by code
  async getCannedServiceByCode(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      const cannedService = await this.cannedServiceService.getCannedServiceByCode(code);

      if (!cannedService) {
        res.status(404).json({
          success: false,
          error: 'Canned service not found',
          message: 'The requested canned service code does not exist',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: cannedService,
        message: 'Canned service retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve canned service',
      });
    }
  }

  // Get canned service with detailed information including labor and parts
  async getCannedServiceDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cannedService = await this.cannedServiceService.getCannedServiceDetails(id);

      if (!cannedService) {
        res.status(404).json({
          success: false,
          error: 'Canned service not found',
          message: 'The requested canned service does not exist',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: cannedService,
        message: 'Canned service details retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve canned service details',
      });
    }
  }

  // Update canned service
  async updateCannedService(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateCannedServiceRequest = req.body;
      const cannedService = await this.cannedServiceService.updateCannedService(id, data);

      res.status(200).json({
        success: true,
        data: cannedService,
        message: 'Canned service updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        message: 'Failed to update canned service',
      });
    }
  }

  // Delete canned service
  async deleteCannedService(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.cannedServiceService.deleteCannedService(id);

      res.status(200).json({
        success: true,
        message: 'Canned service deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        message: 'Failed to delete canned service',
      });
    }
  }

  // Get available canned services
  async getAvailableCannedServices(req: Request, res: Response): Promise<void> {
    try {
      const cannedServices = await this.cannedServiceService.getAvailableCannedServices();

      res.status(200).json({
        success: true,
        data: cannedServices,
        count: cannedServices.length,
        message: 'Available canned services retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve available canned services',
      });
    }
  }

  // Toggle availability of a canned service
  async toggleAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cannedService = await this.cannedServiceService.toggleAvailability(id);

      res.status(200).json({
        success: true,
        data: cannedService,
        message: `Canned service ${cannedService.isAvailable ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        message: 'Failed to toggle canned service availability',
      });
    }
  }

  // Search canned services
  async searchCannedServices(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query;
      const filters: CannedServiceFilters = {
        isAvailable: req.query.isAvailable === 'true' ? true :
          req.query.isAvailable === 'false' ? false : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      };

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Search query is required',
          message: 'Please provide a search query',
        });
        return;
      }

      const cannedServices = await this.cannedServiceService.searchCannedServices(query, filters);

      res.status(200).json({
        success: true,
        data: cannedServices,
        count: cannedServices.length,
        query,
        message: 'Canned services search completed successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to search canned services',
      });
    }
  }

  // Bulk update prices
  async bulkUpdatePrices(req: Request, res: Response): Promise<void> {
    try {
      const { percentageIncrease } = req.body;

      if (typeof percentageIncrease !== 'number') {
        res.status(400).json({
          success: false,
          error: 'Percentage increase must be a number',
          message: 'Please provide a valid percentage increase value',
        });
        return;
      }

      const updatedCount = await this.cannedServiceService.bulkUpdatePrices(percentageIncrease);

      res.status(200).json({
        success: true,
        data: { updatedCount, percentageIncrease },
        message: `Successfully updated prices for ${updatedCount} canned services`,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        message: 'Failed to bulk update prices',
      });
    }
  }

  // Analytics: Get service popularity data
  async getServicePopularity(req: Request, res: Response): Promise<void> {
    try {
      const popularityData = await this.cannedServiceService.getServicePopularity();

      res.status(200).json({
        success: true,
        data: popularityData,
        count: popularityData.length,
        message: 'Service popularity data retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve service popularity data',
      });
    }
  }

  // Analytics: Get revenue by service data
  async getRevenueByService(req: Request, res: Response): Promise<void> {
    try {
      const revenueData = await this.cannedServiceService.getRevenueByService();

      res.status(200).json({
        success: true,
        data: revenueData,
        count: revenueData.length,
        message: 'Revenue by service data retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve revenue by service data',
      });
    }
  }

  // Analytics: Get service categories data
  async getServiceCategories(req: Request, res: Response): Promise<void> {
    try {
      const categoriesData = await this.cannedServiceService.getServiceCategories();

      res.status(200).json({
        success: true,
        data: categoriesData,
        count: categoriesData.length,
        message: 'Service categories data retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve service categories data',
      });
    }
  }
}

