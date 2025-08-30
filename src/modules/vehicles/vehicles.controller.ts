import { Request, Response } from 'express';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleRequest, UpdateVehicleRequest, VehicleFilters } from './vehicles.types';

export class VehiclesController {
  private vehiclesService: VehiclesService;

  constructor() {
    this.vehiclesService = new VehiclesService();
  }

  // Create vehicle
  async createVehicle(req: Request, res: Response) {
    try {
      const vehicleData: CreateVehicleRequest = req.body;
      const vehicle = await this.vehiclesService.createVehicle(vehicleData);
      
      res.status(201).json({
        message: 'Vehicle created successfully',
        data: vehicle,
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Failed to create vehicle',
        message: error.message,
      });
    }
  }

  // Get vehicle by ID
  async getVehicleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const vehicle = await this.vehiclesService.getVehicleById(id);
      
      res.json({
        message: 'Vehicle retrieved successfully',
        data: vehicle,
      });
    } catch (error: any) {
      res.status(404).json({
        error: 'Vehicle not found',
        message: error.message,
      });
    }
  }

  // Get all vehicles
  async getVehicles(req: Request, res: Response) {
    try {
      const filters: VehicleFilters = req.query;
      const vehicles = await this.vehiclesService.getVehicles(filters);
      
      res.json({
        message: 'Vehicles retrieved successfully',
        data: vehicles,
        count: vehicles.length,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to retrieve vehicles',
        message: error.message,
      });
    }
  }

  // Update vehicle
  async updateVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateVehicleRequest = req.body;
      const vehicle = await this.vehiclesService.updateVehicle(id, updateData);
      
      res.json({
        message: 'Vehicle updated successfully',
        data: vehicle,
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Failed to update vehicle',
        message: error.message,
      });
    }
  }

  // Delete vehicle
  async deleteVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.vehiclesService.deleteVehicle(id);
      
      res.json({
        message: 'Vehicle deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Failed to delete vehicle',
        message: error.message,
      });
    }
  }

  // Get vehicles by customer
  async getVehiclesByCustomer(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const vehicles = await this.vehiclesService.getVehiclesByCustomer(customerId);
      
      res.json({
        message: 'Customer vehicles retrieved successfully',
        data: vehicles,
        count: vehicles.length,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to retrieve customer vehicles',
        message: error.message,
      });
    }
  }

  // Get vehicle statistics
  async getVehicleStatistics(req: Request, res: Response) {
    try {
      const statistics = await this.vehiclesService.getVehicleStatistics();
      
      res.json({
        message: 'Vehicle statistics retrieved successfully',
        data: statistics,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to retrieve vehicle statistics',
        message: error.message,
      });
    }
  }

  // Search vehicles
  async searchVehicles(req: Request, res: Response) {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          error: 'Search query is required',
        });
      }

      const vehicles = await this.vehiclesService.searchVehicles(q);
      
      res.json({
        message: 'Vehicle search completed successfully',
        data: vehicles,
        count: vehicles.length,
        query: q,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to search vehicles',
        message: error.message,
      });
    }
  }
}