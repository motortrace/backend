import { Request, Response } from 'express';
import multer from 'multer';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleRequest, UpdateVehicleRequest, VehicleFilters } from './vehicles.types';
import { StorageService } from '../storage/storage.service';
import { AuthenticatedRequest } from '../../shared/types/auth.types';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export class VehiclesController {
  private vehiclesService: VehiclesService;

  constructor() {
    this.vehiclesService = new VehiclesService();
  }

  // Helper to normalize image URLs for mobile clients
  private static normalizeImageUrl(imagePath: string | null | undefined, req: Request): string | null {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) {
      // For mobile clients, replace 127.0.0.1 with the API host IP so they can access Supabase storage
      const isMobileClient = req.headers['x-client-type'] === 'mobile';
      if (isMobileClient && imagePath.includes('127.0.0.1')) {
        const host = req.get('host')?.split(':')[0] || '10.0.2.2';
        return imagePath.replace('127.0.0.1', host);
      }
      return imagePath;
    }
    return imagePath;
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

      // Normalize image URL for mobile clients
      if (vehicle.imageUrl) {
        vehicle.imageUrl = VehiclesController.normalizeImageUrl(vehicle.imageUrl, req);
      }

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

      // Normalize image URLs for mobile clients
      vehicles.forEach(vehicle => {
        if (vehicle.imageUrl) {
          vehicle.imageUrl = VehiclesController.normalizeImageUrl(vehicle.imageUrl, req);
        }
      });

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

      // Normalize image URLs for mobile clients
      vehicles.forEach(vehicle => {
        if (vehicle.imageUrl) {
          vehicle.imageUrl = VehiclesController.normalizeImageUrl(vehicle.imageUrl, req);
        }
      });

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

  // Get vehicle mileage
  async getVehicleMileage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const mileage = await this.vehiclesService.getVehicleMileage(id);

      res.json({
        message: 'Vehicle mileage retrieved successfully',
        data: mileage,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to retrieve vehicle mileage',
        message: error.message,
      });
    }
  }

  // Get vehicle service recommendations
  async getVehicleRecommendations(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.query;
      const recommendations = await this.vehiclesService.getVehicleRecommendations(id, status as string);

      res.json({
        message: 'Vehicle recommendations retrieved successfully',
        data: recommendations,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to retrieve vehicle recommendations',
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

  // Upload vehicle image
  static uploadVehicleImage = [
    upload.single('vehicleImage'),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!req.file) {
          return res.status(400).json({ error: 'No image file provided' });
        }

        const { vehicleId } = req.params;

        if (!vehicleId) {
          return res.status(400).json({ error: 'Vehicle ID is required' });
        }

        console.log('📤 Uploading vehicle image for vehicle:', vehicleId);

        // Upload to Supabase Storage car-images bucket
        const result = await StorageService.uploadCarImage(
          req.file.buffer,
          `vehicle-${vehicleId}-${req.file.originalname}`,
          req.file.mimetype,
          req.user.id
        );

        if (!result.success) {
          return res.status(400).json({ 
            error: result.error || 'Failed to upload image' 
          });
        }

        // Update vehicle with image URL
        const updatedVehicle = await new VehiclesService().updateVehicle(vehicleId, {
          imageUrl: result.url
        });

        // Normalize image URL for mobile clients
        const normalizedImageUrl = VehiclesController.normalizeImageUrl(result.url, req);

        console.log('✅ Vehicle image uploaded successfully:', result.url);

        res.json({
          success: true,
          data: {
            vehicle: {
              ...updatedVehicle,
              imageUrl: normalizedImageUrl
            },
            imageUrl: normalizedImageUrl,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype
          },
          message: 'Vehicle image uploaded successfully'
        });

      } catch (error: any) {
        console.error('❌ Vehicle image upload error:', error);
        res.status(500).json({ 
          error: 'Internal server error',
          message: error.message 
        });
      }
    }
  ];

  // Delete vehicle image
  async deleteVehicleImage(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { vehicleId } = req.params;

      if (!vehicleId) {
        return res.status(400).json({ error: 'Vehicle ID is required' });
      }

      // Get current vehicle to find image URL
      const vehicle = await this.vehiclesService.getVehicleById(vehicleId);
      
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      if (!vehicle.imageUrl) {
        return res.status(400).json({ error: 'Vehicle has no image to delete' });
      }

      console.log('🗑️ Deleting vehicle image:', vehicle.imageUrl);

      // Delete from Supabase Storage
      const result = await StorageService.deleteProfileImage(vehicle.imageUrl);

      if (!result.success) {
        return res.status(400).json({ 
          error: result.error || 'Failed to delete image' 
        });
      }

      // Update vehicle to remove image URL
      const updatedVehicle = await this.vehiclesService.updateVehicle(vehicleId, {
        imageUrl: null
      });

      console.log('✅ Vehicle image deleted successfully');

      res.json({
        success: true,
        data: updatedVehicle,
        message: 'Vehicle image deleted successfully'
      });

    } catch (error: any) {
      console.error('❌ Vehicle image delete error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
}