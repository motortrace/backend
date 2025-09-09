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
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    year?: number;
    licensePlate?: string;
  };

  assignedTo?: {
    id: string;
    supabaseUserId: string;
  };
} 