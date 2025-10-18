import Joi from 'joi';
import { AppointmentStatus, AppointmentPriority, DayOfWeek } from '@prisma/client';

export const createAppointmentSchema = Joi.object({
  customerId: Joi.string().required(),
  vehicleId: Joi.string().required(),
  requestedAt: Joi.date().required(),
  startTime: Joi.date().required(), // Now required for time block booking
  endTime: Joi.date().optional(),
  notes: Joi.string().optional(),
  cannedServiceIds: Joi.array().items(Joi.string()).min(1).optional(), // Made optional for diagnostic appointments
  serviceNotes: Joi.array().items(Joi.string()).optional(),
});

export const updateAppointmentSchema = Joi.object({
  startTime: Joi.date().optional(),
  endTime: Joi.date().optional(),
  status: Joi.string().valid(...Object.values(AppointmentStatus)).optional(),
  priority: Joi.string().valid(...Object.values(AppointmentPriority)).optional(),
  notes: Joi.string().optional(),
  assignedToId: Joi.string().optional(),
});

export const appointmentSlotRequestSchema = Joi.object({
  date: Joi.date().required(),
  serviceIds: Joi.array().items(Joi.string()).optional(), // Make serviceIds optional
});

// New schema for time block availability check
export const timeBlockAvailabilitySchema = Joi.object({
  date: Joi.date().required(),
  timeBlock: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), // Format: "08:00", "08:30", etc.
});

// New schema for advisor availability check
export const advisorAvailabilitySchema = Joi.object({
  dateTime: Joi.date().required(),
});

export const assignAppointmentSchema = Joi.object({
  assignedToId: Joi.string().required(),
});



export const shopOperatingHoursSchema = Joi.object({
  dayOfWeek: Joi.string().valid(...Object.values(DayOfWeek)).required(),
  isOpen: Joi.boolean().required(),
  openTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  closeTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
});

export const shopCapacitySettingsSchema = Joi.object({
  appointmentsPerDay: Joi.number().min(1).max(100).required(),
  appointmentsPerTimeBlock: Joi.number().min(1).max(10).required(),
  timeBlockIntervalMinutes: Joi.number().min(15).max(120).required(),
  minimumNoticeHours: Joi.number().min(0).max(168).required(), // 0 to 7 days
  futureSchedulingCutoffYears: Joi.number().min(1).max(10).required(),
});

// Validation middleware
export const validateCreateAppointment = (req: any, res: any, next: any) => {
  const { error } = createAppointmentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateUpdateAppointment = (req: any, res: any, next: any) => {
  const { error } = updateAppointmentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateAppointmentSlotRequest = (req: any, res: any, next: any) => {
  const slotRequest = {
    date: new Date(req.query.date as string),
    serviceIds: req.query.serviceIds ? (req.query.serviceIds as string).split(',') : [], // Handle optional serviceIds
  };
  
  const { error } = appointmentSlotRequestSchema.validate(slotRequest);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

// New validation for time block availability
export const validateTimeBlockAvailability = (req: any, res: any, next: any) => {
  const timeBlockRequest = {
    date: new Date(req.query.date as string),
    timeBlock: req.query.timeBlock as string,
  };
  
  const { error } = timeBlockAvailabilitySchema.validate(timeBlockRequest);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

// New validation for advisor availability
export const validateAdvisorAvailability = (req: any, res: any, next: any) => {
  const advisorRequest = {
    dateTime: new Date(req.query.dateTime as string),
  };
  
  const { error } = advisorAvailabilitySchema.validate(advisorRequest);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateAssignAppointment = (req: any, res: any, next: any) => {
  const { error } = assignAppointmentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};



export const validateShopOperatingHours = (req: any, res: any, next: any) => {
  const { error } = shopOperatingHoursSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateShopCapacitySettings = (req: any, res: any, next: any) => {
  const { error } = shopCapacitySettingsSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
}; 