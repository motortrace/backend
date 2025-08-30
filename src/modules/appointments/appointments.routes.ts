import { Router } from 'express';
import { AppointmentController } from './appointments.controller';
import { authenticateSupabaseToken, requireServiceAdvisor } from '../auth/supabase/authSupabase.middleware';
import {
  validateCreateAppointment,
  validateUpdateAppointment,
  validateAppointmentSlotRequest,
  validateAssignAppointment,
  validateShopOperatingHours,
  validateShopCapacitySettings,
  validateTimeBlockAvailability,
} from './appointments.validation';

const router = Router();
const appointmentController = new AppointmentController();

// Appointment Management Routes
router.post('/', validateCreateAppointment, appointmentController.createAppointment.bind(appointmentController));
router.get('/', appointmentController.getAppointments.bind(appointmentController));
router.get('/:id', appointmentController.getAppointmentById.bind(appointmentController));
router.put('/:id', authenticateSupabaseToken, requireServiceAdvisor, validateUpdateAppointment, appointmentController.updateAppointment.bind(appointmentController));
router.delete('/:id', authenticateSupabaseToken, requireServiceAdvisor, appointmentController.deleteAppointment.bind(appointmentController));

// Available Slots Routes
router.get('/slots/available', validateAppointmentSlotRequest, appointmentController.getAvailableSlots.bind(appointmentController));

// New: Time Block Availability Routes
router.get('/slots/timeblock', validateTimeBlockAvailability, appointmentController.checkTimeBlockAvailability.bind(appointmentController));

// New: Daily Capacity Routes
router.get('/capacity/daily', appointmentController.checkDailyCapacity.bind(appointmentController));

// Unassigned Appointments Routes
router.get('/unassigned', authenticateSupabaseToken, requireServiceAdvisor, appointmentController.getUnassignedAppointments.bind(appointmentController));
router.post('/:id/assign', authenticateSupabaseToken, requireServiceAdvisor, validateAssignAppointment, appointmentController.assignAppointment.bind(appointmentController));



// Shop Settings Management Routes
router.put('/shop/operating-hours', validateShopOperatingHours, appointmentController.updateOperatingHours.bind(appointmentController));
router.get('/shop/operating-hours', appointmentController.getOperatingHours.bind(appointmentController));
router.put('/shop/capacity-settings', validateShopCapacitySettings, appointmentController.updateCapacitySettings.bind(appointmentController));
router.get('/shop/capacity-settings', appointmentController.getCapacitySettings.bind(appointmentController));

export default router; 