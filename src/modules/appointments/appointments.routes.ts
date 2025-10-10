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

console.log('📋 Registering appointment routes...');

// Appointment Management Routes
router.post('/', validateCreateAppointment, appointmentController.createAppointment.bind(appointmentController));
router.get('/', appointmentController.getAppointments.bind(appointmentController));

// Unassigned Appointments Routes (must come before /:id)
router.get('/unassigned', authenticateSupabaseToken, requireServiceAdvisor, appointmentController.getUnassignedAppointments.bind(appointmentController));

// Available Slots Routes
router.get('/slots/available', validateAppointmentSlotRequest, appointmentController.getAvailableSlots.bind(appointmentController));

// New: Time Block Availability Routes
router.get('/slots/timeblock', validateTimeBlockAvailability, appointmentController.checkTimeBlockAvailability.bind(appointmentController));

// New: Daily Capacity Routes
router.get('/capacity/daily', appointmentController.checkDailyCapacity.bind(appointmentController));

// Individual appointment routes (must come after specific routes)
router.get('/:id', appointmentController.getAppointmentById.bind(appointmentController));
router.put('/:id', authenticateSupabaseToken, requireServiceAdvisor, validateUpdateAppointment, appointmentController.updateAppointment.bind(appointmentController));
router.delete('/:id', authenticateSupabaseToken, requireServiceAdvisor, appointmentController.deleteAppointment.bind(appointmentController));
router.post('/:id/assign', authenticateSupabaseToken, requireServiceAdvisor, validateAssignAppointment, appointmentController.assignAppointment.bind(appointmentController));

// Customer-specific routes for rescheduling and canceling their own appointments
router.put('/:id/reschedule', authenticateSupabaseToken, validateUpdateAppointment, (req, res) => {
  console.log('🔄 Reschedule route hit:', req.params.id);
  appointmentController.rescheduleAppointment(req, res);
});
router.delete('/:id/cancel', authenticateSupabaseToken, (req, res) => {
  console.log('🗑️ Cancel route hit:', req.params.id);
  appointmentController.cancelAppointment(req, res);
});



// Shop Settings Management Routes
router.put('/shop/operating-hours', validateShopOperatingHours, appointmentController.updateOperatingHours.bind(appointmentController));
router.get('/shop/operating-hours', appointmentController.getOperatingHours.bind(appointmentController));
router.put('/shop/capacity-settings', validateShopCapacitySettings, appointmentController.updateCapacitySettings.bind(appointmentController));
router.get('/shop/capacity-settings', appointmentController.getCapacitySettings.bind(appointmentController));

// Service Advisor Contact
router.get('/service-advisor', appointmentController.getServiceAdvisor.bind(appointmentController));

export default router; 