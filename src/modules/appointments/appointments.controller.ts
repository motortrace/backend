import { Request, Response } from 'express';
import { AppointmentService } from './appointments.service';
import {
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AppointmentSlotRequest,
  ShopOperatingHoursRequest,
  ShopCapacitySettingsRequest,
  CannedServiceRequest,
} from './appointments.types';

export class AppointmentController {
  private appointmentService: AppointmentService;

  constructor() {
    this.appointmentService = new AppointmentService();
  }

  // Appointment Management
  async createAppointment(req: Request, res: Response) {
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
      
      res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (error: any) {
      res.status(500).json({
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

      res.status(200).json({
        success: true,
        data: appointment,
      });
    } catch (error: any) {
      res.status(500).json({
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
      
      res.status(200).json({
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
      
      res.status(200).json({
        success: true,
        message: 'Appointment deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
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
        serviceIds: (req.query.serviceIds as string).split(','),
      };

      const slots = await this.appointmentService.getAvailableSlots(slotRequest);
      
      res.status(200).json({
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

  // Unassigned Appointments
  async getUnassignedAppointments(req: Request, res: Response) {
    try {
      const appointments = await this.appointmentService.getUnassignedAppointments();
      
      res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (error: any) {
      res.status(500).json({
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
      
      res.status(200).json({
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

  // Canned Service Management
  async createCannedService(req: Request, res: Response) {
    try {
      const serviceData: CannedServiceRequest = req.body;
      const service = await this.appointmentService.createCannedService(serviceData);
      
      res.status(201).json({
        success: true,
        data: service,
        message: 'Canned service created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getAvailableCannedServices(req: Request, res: Response) {
    try {
      const services = await this.appointmentService.getAvailableCannedServices();
      
      res.status(200).json({
        success: true,
        data: services,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateCannedService(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: Partial<CannedServiceRequest> = req.body;
      
      const service = await this.appointmentService.updateCannedService(id, updateData);
      
      res.status(200).json({
        success: true,
        data: service,
        message: 'Canned service updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteCannedService(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.appointmentService.deleteCannedService(id);
      
      res.status(200).json({
        success: true,
        message: 'Canned service deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Shop Settings Management
  async updateOperatingHours(req: Request, res: Response) {
    try {
      const hoursData: ShopOperatingHoursRequest = req.body;
      const hours = await this.appointmentService.updateOperatingHours(hoursData);
      
      res.status(200).json({
        success: true,
        data: hours,
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
      const hours = await this.appointmentService.getOperatingHours();
      
      res.status(200).json({
        success: true,
        data: hours,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateCapacitySettings(req: Request, res: Response) {
    try {
      const settingsData: ShopCapacitySettingsRequest = req.body;
      const settings = await this.appointmentService.updateCapacitySettings(settingsData);
      
      res.status(200).json({
        success: true,
        data: settings,
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
      const settings = await this.appointmentService.getCapacitySettings();
      
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
} 