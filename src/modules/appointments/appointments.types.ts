import { AppointmentStatus, AppointmentPriority, DayOfWeek } from '@prisma/client';

export interface CreateAppointmentRequest {
  customerId: string;
  vehicleId: string;
  requestedAt: Date;
  startTime: Date; 
  endTime?: Date;
  notes?: string;
  cannedServiceIds: string[];
  serviceNotes?: string[];
}

export interface UpdateAppointmentRequest {
  startTime?: Date;
  endTime?: Date;
  status?: AppointmentStatus;
  priority?: AppointmentPriority;
  notes?: string;
  assignedToId?: string;
}

export interface AvailableSlot {
  startTime: Date;
  endTime: Date;
  availableCapacity: number;
  totalCapacity: number;
}

export interface AppointmentSlotRequest {
  date: Date;
  serviceIds?: string[]; // Make serviceIds optional
}


export interface TimeBlockAvailabilityRequest {
  date: Date;
  timeBlock: string;
}

export interface TimeBlockAvailability {
  timeBlock: string;
  isAvailable: boolean;
  currentBookings: number;
  maxCapacity: number;
  suggestedAlternatives?: string[];
}

// New interface for daily capacity check
export interface DailyCapacityRequest {
  date: Date;
}

export interface DailyCapacity {
  date: Date;
  totalBookings: number;
  maxDailyBookings: number;
  isAvailable: boolean;
  timeBlocks: TimeBlockAvailability[];
}

export interface ShopOperatingHoursRequest {
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface ShopCapacitySettingsRequest {
  appointmentsPerDay: number;
  appointmentsPerTimeBlock: number;
  timeBlockIntervalMinutes: number;
  minimumNoticeHours: number;
  futureSchedulingCutoffYears: number;
}



export interface AppointmentWithServices {
  id: string;
  customerId: string;
  vehicleId: string;
  requestedAt: Date;
  startTime?: Date;
  endTime?: Date;
  status: AppointmentStatus;
  priority: AppointmentPriority;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  assignedToId?: string;
  cannedServices: {
    id: string;
    code: string;
    name: string;
    duration: number;
    price: number;
    quantity: number;
    notes?: string;
  }[];
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    profileImage?: string | null;
    userProfileId?: string;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    year?: number;
    licensePlate?: string | null;
    imageUrl?: string | null;
  };

  assignedTo?: {
    id: string;
    employeeId: string | null;
    supabaseUserId: string;
    name: string;
    phone?: string | null;
    profileImage?: string | null;
  };
}

export interface CalendarAppointment {
  id: string;
  title: string;
  startTime: Date;
  status: AppointmentStatus;
  priority: AppointmentPriority;
  customer: {
    id: string;
    name: string;
  };
  vehicle: {
    make: string;
    model: string;
    licensePlate?: string | null;
  };
}

export interface AdvisorAvailability {
  advisorId: string;
  employeeId: string | null;
  name: string;
  phone?: string | null;
  profileImage?: string | null;
  isAvailable: boolean;
  currentAppointment: {
    id: string;
    startTime: Date | null;
    endTime: Date | null;
    status: AppointmentStatus;
  } | null;
  lastAssignedAt: Date | null;
  lastAppointmentStatus: AppointmentStatus | null;
  hasNeverBeenAssigned: boolean;
}

// Service Interface (for Dependency Injection)
export interface IAppointmentsService {
  createAppointment(data: CreateAppointmentRequest): Promise<AppointmentWithServices>;
  getAppointments(filters: any): Promise<AppointmentWithServices[]>;
  getAppointmentById(id: string): Promise<AppointmentWithServices | null>;
  updateAppointment(id: string, data: UpdateAppointmentRequest): Promise<AppointmentWithServices>;
  deleteAppointment(id: string): Promise<void>;
  assignAppointment(id: string, advisorId: string): Promise<AppointmentWithServices>;
  getAvailableSlots(request: AppointmentSlotRequest): Promise<AvailableSlot[]>;
  checkTimeBlockAvailability(request: TimeBlockAvailabilityRequest): Promise<TimeBlockAvailability>;
  checkDailyCapacity(request: DailyCapacityRequest): Promise<DailyCapacity>;
  getUnassignedAppointments(): Promise<any>;
  getConfirmedAppointmentsWithoutWorkOrders(): Promise<any>;
  getCalendarAppointments(): Promise<CalendarAppointment[]>;
  getAdvisorsAvailability(dateTime: Date): Promise<AdvisorAvailability[]>;
  updateOperatingHours(data: ShopOperatingHoursRequest): Promise<any>;
  getOperatingHours(): Promise<any>;
  updateCapacitySettings(data: ShopCapacitySettingsRequest): Promise<any>;
  getCapacitySettings(): Promise<any>;
}