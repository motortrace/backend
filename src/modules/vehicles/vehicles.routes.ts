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

export default router;