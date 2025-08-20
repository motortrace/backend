import { Router } from 'express';
import { VehiclesController } from './vehicles.controller';
import {
  validateRequest,
  createVehicleSchema,
  updateVehicleSchema,
  vehicleIdSchema,
  vehicleFiltersSchema,
} from './vehicles.validation';

const router = Router();
const vehiclesController = new VehiclesController();

// Basic CRUD operations
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

// Customer-specific routes
router.get(
  '/customer/:customerId',
  vehiclesController.getVehiclesByCustomer.bind(vehiclesController)
);

// Statistics and analytics
router.get(
  '/statistics',
  vehiclesController.getVehicleStatistics.bind(vehiclesController)
);

// Search functionality
router.get(
  '/search',
  vehiclesController.searchVehicles.bind(vehiclesController)
);

export default router;