import { Router } from 'express';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import {
  validateRequest,
  createVehicleSchema,
  updateVehicleSchema,
  vehicleIdSchema,
  vehicleImageIdSchema,
  vehicleFiltersSchema,
} from './vehicles.validation';
import { authenticateSupabaseToken } from '../auth/supabase/authSupabase.middleware';
import prisma from '../../infrastructure/database/prisma';

const router = Router();
const vehiclesService = new VehiclesService(prisma);
const vehiclesController = new VehiclesController(vehiclesService);

// Create + list
router.post(
  '/',
  validateRequest(createVehicleSchema),
  vehiclesController.createVehicle.bind(vehiclesController)
);

router.get(
  '/',
  validateRequest(vehicleFiltersSchema, 'query'),
  vehiclesController.getVehicles.bind(vehiclesController)
);

// Static/specific routes FIRST
router.get(
  '/search',
  vehiclesController.searchVehicles.bind(vehiclesController)
);

router.get(
  '/statistics',
  vehiclesController.getVehicleStatistics.bind(vehiclesController)
);

router.get(
  '/customer/:customerId',
  vehiclesController.getVehiclesByCustomer.bind(vehiclesController)
);

// Mileage and recommendations routes
router.get(
  '/:id/mileage',
  validateRequest(vehicleIdSchema, 'params'),
  vehiclesController.getVehicleMileage.bind(vehiclesController)
);

router.get(
  '/:id/recommendations',
  validateRequest(vehicleIdSchema, 'params'),
  vehiclesController.getVehicleRecommendations.bind(vehiclesController)
);

// Param routes LAST
router.get(
  '/:id',
  validateRequest(vehicleIdSchema, 'params'),
  vehiclesController.getVehicleById.bind(vehiclesController)
);

router.put(
  '/:id',
  validateRequest(vehicleIdSchema, 'params'),
  validateRequest(updateVehicleSchema),
  vehiclesController.updateVehicle.bind(vehiclesController)
);

router.delete(
  '/:id',
  validateRequest(vehicleIdSchema, 'params'),
  vehiclesController.deleteVehicle.bind(vehiclesController)
);

// Vehicle image routes (authenticated)
router.post(
  '/:vehicleId/image',
  authenticateSupabaseToken,
  validateRequest(vehicleImageIdSchema, 'params'),
  VehiclesController.uploadVehicleImage
);

router.delete(
  '/:vehicleId/image',
  authenticateSupabaseToken,
  validateRequest(vehicleImageIdSchema, 'params'),
  vehiclesController.deleteVehicleImage.bind(vehiclesController)
);

export default router;