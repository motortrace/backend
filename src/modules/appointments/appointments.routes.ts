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
  validateAdvisorAvailability,
} from './appointments.validation';

import prisma from '../../infrastructure/database/prisma';
import { AppointmentService } from './appointments.service';

const router = Router();

// Dependency Injection
const appointmentService = new AppointmentService(prisma);
const appointmentController = new AppointmentController(appointmentService);

// Appointment Management Routes
router.post('/', validateCreateAppointment, appointmentController.createAppointment.bind(appointmentController));
router.get('/', appointmentController.getAppointments.bind(appointmentController));

// Unassigned Appointments Routes (must come before /:id)
router.get('/unassigned', authenticateSupabaseToken, requireServiceAdvisor, appointmentController.getUnassignedAppointments.bind(appointmentController));

// Confirmed appointments without active work orders
router.get('/assigned-without-work-orders', appointmentController.getConfirmedAppointmentsWithoutWorkOrders.bind(appointmentController));

// Calendar appointments (PENDING and CONFIRMED)
router.get('/calendar', appointmentController.getCalendarAppointments.bind(appointmentController));

// Status-specific routes
router.get('/pending', appointmentController.getPendingAppointments.bind(appointmentController));
router.get('/confirmed', appointmentController.getConfirmedAppointments.bind(appointmentController));
router.get('/completed', appointmentController.getCompletedAppointments.bind(appointmentController));

// Advisor availability for scheduling
router.get('/advisors/availability', validateAdvisorAvailability, appointmentController.getAdvisorsAvailability.bind(appointmentController));

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



// Shop Settings Management Routes
router.put('/shop/operating-hours', validateShopOperatingHours, appointmentController.updateOperatingHours.bind(appointmentController));
router.get('/shop/operating-hours', appointmentController.getOperatingHours.bind(appointmentController));
router.put('/shop/capacity-settings', validateShopCapacitySettings, appointmentController.updateCapacitySettings.bind(appointmentController));
router.get('/shop/capacity-settings', appointmentController.getCapacitySettings.bind(appointmentController));

export default router;