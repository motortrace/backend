import { Router } from 'express';
import { AppointmentController } from './appointments.controller';
import {
  validateCreateAppointment,
  validateUpdateAppointment,
  validateAppointmentSlotRequest,
  validateAssignAppointment,
  validateCreateCannedService,
  validateUpdateCannedService,
  validateShopOperatingHours,
  validateShopCapacitySettings,
} from './appointments.validation';

const router = Router();
const appointmentController = new AppointmentController();

// Appointment Management Routes
router.post('/appointments', validateCreateAppointment, appointmentController.createAppointment.bind(appointmentController));
router.get('/appointments', appointmentController.getAppointments.bind(appointmentController));
router.get('/appointments/:id', appointmentController.getAppointmentById.bind(appointmentController));
router.put('/appointments/:id', validateUpdateAppointment, appointmentController.updateAppointment.bind(appointmentController));
router.delete('/appointments/:id', appointmentController.deleteAppointment.bind(appointmentController));

// Available Slots Routes
router.get('/appointments/slots/available', validateAppointmentSlotRequest, appointmentController.getAvailableSlots.bind(appointmentController));

// Unassigned Appointments Routes
router.get('/appointments/unassigned', appointmentController.getUnassignedAppointments.bind(appointmentController));
router.post('/appointments/:id/assign', validateAssignAppointment, appointmentController.assignAppointment.bind(appointmentController));

// Canned Service Management Routes
router.post('/canned-services', validateCreateCannedService, appointmentController.createCannedService.bind(appointmentController));
router.get('/canned-services/available', appointmentController.getAvailableCannedServices.bind(appointmentController));
router.put('/canned-services/:id', validateUpdateCannedService, appointmentController.updateCannedService.bind(appointmentController));
router.delete('/canned-services/:id', appointmentController.deleteCannedService.bind(appointmentController));

// Shop Settings Management Routes
router.put('/shop/operating-hours', validateShopOperatingHours, appointmentController.updateOperatingHours.bind(appointmentController));
router.get('/shop/operating-hours', appointmentController.getOperatingHours.bind(appointmentController));
router.put('/shop/capacity-settings', validateShopCapacitySettings, appointmentController.updateCapacitySettings.bind(appointmentController));
router.get('/shop/capacity-settings', appointmentController.getCapacitySettings.bind(appointmentController));

export default router; 