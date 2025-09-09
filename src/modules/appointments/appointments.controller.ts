import { Request, Response } from 'express';
import { AppointmentService } from './appointments.service';
import {
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AppointmentSlotRequest,
  TimeBlockAvailabilityRequest,
  DailyCapacityRequest,
} from './appointments.types';

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
} 