import { Router } from 'express';
import { MileageTrackingController } from './mileage-tracking.controller';

const router = Router();
const mileageController = new MileageTrackingController();

// Mileage Entry Management
router.post('/entries', (req, res) => mileageController.createMileageEntry(req, res));
router.put('/entries/:entryId', (req, res) => mileageController.updateMileageEntry(req, res));
router.delete('/entries/:entryId', (req, res) => mileageController.deleteMileageEntry(req, res));

// Mileage Data Retrieval
router.get('/vehicles/:vehicleId/entries', (req, res) => mileageController.getMileageEntries(req, res));
router.get('/vehicles/:vehicleId/summary', (req, res) => mileageController.getVehicleMileageSummary(req, res));
router.get('/vehicles/:vehicleId/current', (req, res) => mileageController.getCurrentMileage(req, res));

// Analytics
router.post('/analytics', (req, res) => mileageController.getMileageAnalytics(req, res));

// Bulk Operations
router.post('/bulk', (req, res) => mileageController.bulkUpdateMileage(req, res));

export default router;