import { Request, Response } from 'express';
import { AppointmentService } from './appointments.service';
import {
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AppointmentSlotRequest,
  TimeBlockAvailabilityRequest,
  DailyCapacityRequest,
} from './appointments.types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AppointmentController {
  private appointmentService = new AppointmentService();

  // Appointment Management
  async createAppointment(req: any, res: Response) {
    try {
      const appointmentData: CreateAppointmentRequest = req.body;

      const appointment = await this.appointmentService.createAppointment(appointmentData);

      res.status(201).json({
        success: true,
        data: appointment,
        message: 'Appointment created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getAppointments(req: Request, res: Response) {
    try {
      const filters = {
        status: req.query.status as any,
        assignedToId: req.query.assignedToId as string,
        customerId: req.query.customerId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      };

      const appointments = await this.appointmentService.getAppointments(filters);

      res.json({
        success: true,
        data: appointments,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getAppointmentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const appointment = await this.appointmentService.getAppointmentById(id);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found',
        });
      }

      res.json({
        success: true,
        data: appointment,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateAppointment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateAppointmentRequest = req.body;

      const appointment = await this.appointmentService.updateAppointment(id, updateData);

      res.json({
        success: true,
        data: appointment,
        message: 'Appointment updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteAppointment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.appointmentService.deleteAppointment(id);

      res.json({
        success: true,
        message: 'Appointment deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Customer-specific methods for rescheduling and canceling their own appointments
  async rescheduleAppointment(req: any, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateAppointmentRequest = req.body;
      const supabaseUserId = req.user.id;

      console.log('🔄 Reschedule appointment request:', { appointmentId: id, supabaseUserId, updateData });

      // Get the UserProfile for the authenticated user
      const userProfile = await prisma.userProfile.findUnique({
        where: { supabaseUserId: supabaseUserId }
      });

      console.log('👤 UserProfile found for reschedule:', userProfile ? { id: userProfile.id, supabaseUserId: userProfile.supabaseUserId } : 'NOT FOUND');

      if (!userProfile) {
        return res.status(404).json({
          success: false,
          error: 'User profile not found',
        });
      }

      // Verify the appointment belongs to the authenticated customer
      const appointment = await this.appointmentService.getAppointmentById(id);
      console.log('📅 Appointment found for reschedule:', appointment ? {
        id: appointment.id,
        customerId: appointment.customerId,
        customerUserProfileId: appointment.customer?.userProfileId
      } : 'NOT FOUND');

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found',
        });
      }

      // Check if the appointment belongs to the authenticated user
      const appointmentUserProfileId = appointment.customer?.userProfileId;
      const authenticatedUserProfileId = userProfile.id;

      console.log('🔐 Reschedule authorization check:', {
        appointmentUserProfileId,
        authenticatedUserProfileId,
        isAuthorized: appointmentUserProfileId === authenticatedUserProfileId
      });

      if (appointmentUserProfileId !== authenticatedUserProfileId) {
        return res.status(403).json({
          success: false,
          error: 'You can only reschedule your own appointments',
        });
      }

      console.log('📅 Appointment status for reschedule:', appointment.status);

      // Only allow rescheduling if appointment is in PENDING or CONFIRMED status
      if (appointment.status !== 'PENDING' && appointment.status !== 'CONFIRMED') {
        console.log('❌ Cannot reschedule appointment with status:', appointment.status);
        return res.status(400).json({
          success: false,
          error: 'Cannot reschedule appointment that is already in progress or completed',
        });
      }

      console.log('✅ Status check passed, appointment can be rescheduled');

      console.log('🔄 Calling updateAppointment service...');
      const updatedAppointment = await this.appointmentService.updateAppointment(id, updateData);
      console.log('✅ Appointment rescheduled successfully');

      res.json({
        success: true,
        data: updatedAppointment,
        message: 'Appointment rescheduled successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async cancelAppointment(req: any, res: Response) {
    try {
      const { id } = req.params;
      const supabaseUserId = req.user.id;

      console.log('🔍 Cancel appointment request:', { appointmentId: id, supabaseUserId });

      // Get the UserProfile for the authenticated user
      const userProfile = await prisma.userProfile.findUnique({
        where: { supabaseUserId: supabaseUserId }
      });

      console.log('👤 UserProfile found:', userProfile ? { id: userProfile.id, supabaseUserId: userProfile.supabaseUserId } : 'NOT FOUND');

      if (!userProfile) {
        return res.status(404).json({
          success: false,
          error: 'User profile not found',
        });
      }

      // Verify the appointment belongs to the authenticated customer
      const appointment = await this.appointmentService.getAppointmentById(id);
      console.log('📅 Appointment found:', appointment ? {
        id: appointment.id,
        customerId: appointment.customerId,
        customerUserProfileId: appointment.customer?.userProfileId
      } : 'NOT FOUND');

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found',
        });
      }

      // Check if the appointment belongs to the authenticated user
      const appointmentUserProfileId = appointment.customer?.userProfileId;
      const authenticatedUserProfileId = userProfile.id;

      console.log('🔐 Authorization check:', {
        appointmentUserProfileId,
        authenticatedUserProfileId,
        isAuthorized: appointmentUserProfileId === authenticatedUserProfileId
      });

      if (appointmentUserProfileId !== authenticatedUserProfileId) {
        return res.status(403).json({
          success: false,
          error: 'You can only cancel your own appointments',
        });
      }

      console.log('✅ Authorization passed, proceeding with cancellation...');

      console.log('📅 Appointment status:', appointment.status);

      // Only allow canceling if appointment is in PENDING or CONFIRMED status
      if (appointment.status !== 'PENDING' && appointment.status !== 'CONFIRMED') {
        console.log('❌ Cannot cancel appointment with status:', appointment.status);
        return res.status(400).json({
          success: false,
          error: 'Cannot cancel appointment that is already in progress or completed',
        });
      }

      console.log('✅ Status check passed, appointment can be cancelled');

      console.log('🗑️ Calling deleteAppointment service...');
      await this.appointmentService.deleteAppointment(id);
      console.log('✅ Appointment deleted successfully');

      res.json({
        success: true,
        message: 'Appointment cancelled successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Available Slots
  async getAvailableSlots(req: Request, res: Response) {
    try {
      const slotRequest: AppointmentSlotRequest = {
        date: new Date(req.query.date as string),
        serviceIds: req.query.serviceIds ? (req.query.serviceIds as string).split(',') : [], // Make serviceIds optional
      };

      const slots = await this.appointmentService.getAvailableSlots(slotRequest);

      res.json({
        success: true,
        data: slots,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // New: Check time block availability
  async checkTimeBlockAvailability(req: Request, res: Response) {
    try {
      const timeBlockRequest: TimeBlockAvailabilityRequest = {
        date: new Date(req.query.date as string),
        timeBlock: req.query.timeBlock as string,
      };

      const availability = await this.appointmentService.checkTimeBlockAvailability(timeBlockRequest);

      res.json({
        success: true,
        data: availability,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // New: Check daily capacity
  async checkDailyCapacity(req: Request, res: Response) {
    try {
      const dailyCapacityRequest: DailyCapacityRequest = {
        date: new Date(req.query.date as string),
      };

      const capacity = await this.appointmentService.checkDailyCapacity(dailyCapacityRequest);

      res.json({
        success: true,
        data: capacity,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Unassigned Appointments
  async getUnassignedAppointments(req: Request, res: Response) {
    try {
      const appointments = await this.appointmentService.getUnassignedAppointments();

      res.json({
        success: true,
        data: appointments,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async assignAppointment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { assignedToId } = req.body;

      const appointment = await this.appointmentService.assignAppointment(id, assignedToId);

      res.json({
        success: true,
        data: appointment,
        message: 'Appointment assigned successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }



  // Shop Settings Management
  async updateOperatingHours(req: Request, res: Response) {
    try {
      const operatingHours = await this.appointmentService.updateOperatingHours(req.body);

      res.json({
        success: true,
        data: operatingHours,
        message: 'Operating hours updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getOperatingHours(req: Request, res: Response) {
    try {
      const operatingHours = await this.appointmentService.getOperatingHours();

      res.json({
        success: true,
        data: operatingHours,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateCapacitySettings(req: Request, res: Response) {
    try {
      const capacitySettings = await this.appointmentService.updateCapacitySettings(req.body);

      res.json({
        success: true,
        data: capacitySettings,
        message: 'Capacity settings updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getCapacitySettings(req: Request, res: Response) {
    try {
      const capacitySettings = await this.appointmentService.getCapacitySettings();

      res.json({
        success: true,
        data: capacitySettings,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get first service advisor for contact purposes
  async getServiceAdvisor(req: Request, res: Response) {
    try {
      const serviceAdvisor = await prisma.serviceAdvisor.findFirst({
        include: {
          userProfile: true,
        },
      });

      if (!serviceAdvisor) {
        return res.status(404).json({
          success: false,
          error: 'No service advisor found',
        });
      }

      res.json({
        success: true,
        data: {
          id: serviceAdvisor.id,
          name: serviceAdvisor.userProfile?.name,
          phone: serviceAdvisor.mobile || serviceAdvisor.userProfile?.phone,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}