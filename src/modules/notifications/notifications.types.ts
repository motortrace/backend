import { WorkOrderStatus, PaymentStatus, AppointmentStatus } from '@prisma/client';

// ============================================================================
// NOTIFICATION CHANNELS
// ============================================================================

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// ============================================================================
// NOTIFICATION EVENT TYPES
// ============================================================================

export enum NotificationEventType {
  // Work Order Events
  WORK_ORDER_CREATED = 'WORK_ORDER_CREATED',
  WORK_ORDER_STATUS_CHANGED = 'WORK_ORDER_STATUS_CHANGED',
  WORK_ORDER_ASSIGNED = 'WORK_ORDER_ASSIGNED',
  WORK_ORDER_COMPLETED = 'WORK_ORDER_COMPLETED',
  
  // Service Events
  SERVICE_ADDED = 'SERVICE_ADDED',
  SERVICE_COMPLETED = 'SERVICE_COMPLETED',
  SERVICE_APPROVAL_REQUIRED = 'SERVICE_APPROVAL_REQUIRED',
  SERVICE_APPROVED = 'SERVICE_APPROVED',
  SERVICE_REJECTED = 'SERVICE_REJECTED',
  
  // Part Events
  PART_ADDED = 'PART_ADDED',
  PART_APPROVAL_REQUIRED = 'PART_APPROVAL_REQUIRED',
  PART_APPROVED = 'PART_APPROVED',
  PART_REJECTED = 'PART_REJECTED',
  PART_ORDERED = 'PART_ORDERED',
  PART_RECEIVED = 'PART_RECEIVED',
  
  // Inspection Events
  INSPECTION_STARTED = 'INSPECTION_STARTED',
  INSPECTION_COMPLETED = 'INSPECTION_COMPLETED',
  INSPECTION_ISSUE_FOUND = 'INSPECTION_ISSUE_FOUND',
  
  // Payment Events
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INVOICE_GENERATED = 'INVOICE_GENERATED',
  
  // Appointment Events
  APPOINTMENT_CREATED = 'APPOINTMENT_CREATED',
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_RESCHEDULED = 'APPOINTMENT_RESCHEDULED',
  
  // Approval Events
  ESTIMATE_APPROVAL_REQUIRED = 'ESTIMATE_APPROVAL_REQUIRED',
  ESTIMATE_APPROVED = 'ESTIMATE_APPROVED',
  ESTIMATE_REJECTED = 'ESTIMATE_REJECTED',
  
  // Vehicle Ready Events
  VEHICLE_READY_FOR_PICKUP = 'VEHICLE_READY_FOR_PICKUP',
  
  // QC Events
  QC_PASSED = 'QC_PASSED',
  QC_FAILED = 'QC_FAILED',
}

// ============================================================================
// NOTIFICATION DATA INTERFACES
// ============================================================================

export interface NotificationRecipient {
  customerId?: string;
  userId?: string;
  email?: string;
  phone?: string;
  name?: string;
}

export interface WorkOrderNotificationData {
  workOrderId: string;
  workOrderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear?: number;
  status?: WorkOrderStatus;
  oldStatus?: WorkOrderStatus;
  estimatedTotal?: number;
  promisedDate?: Date;
}

export interface ServiceNotificationData {
  serviceId: string;
  workOrderId: string;
  workOrderNumber: string;
  serviceName: string;
  serviceDescription: string;
  price: number;
  customerName: string;
  customerEmail?: string;
}

export interface PartNotificationData {
  partId: string;
  workOrderId: string;
  workOrderNumber: string;
  partName: string;
  partDescription?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  customerName: string;
  customerEmail?: string;
}

export interface InspectionNotificationData {
  inspectionId: string;
  workOrderId: string;
  workOrderNumber: string;
  templateName?: string;
  issuesFound?: number;
  criticalIssues?: number;
  customerName: string;
  customerEmail?: string;
  vehicleMake: string;
  vehicleModel: string;
}

export interface PaymentNotificationData {
  paymentId: string;
  workOrderId: string;
  workOrderNumber: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  customerName: string;
  customerEmail?: string;
  invoiceNumber?: string;
}

export interface AppointmentNotificationData {
  appointmentId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  vehicleMake: string;
  vehicleModel: string;
  appointmentDate: Date;
  startTime?: Date;
  endTime?: Date;
  status: AppointmentStatus;
  services?: string[];
  notes?: string;
}

// Union type for all notification data
export type NotificationData =
  | WorkOrderNotificationData
  | ServiceNotificationData
  | PartNotificationData
  | InspectionNotificationData
  | PaymentNotificationData
  | AppointmentNotificationData;

// ============================================================================
// NOTIFICATION PAYLOAD
// ============================================================================

export interface NotificationPayload {
  eventType: NotificationEventType;
  recipient: NotificationRecipient;
  data: NotificationData;
  channels?: NotificationChannel[];
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
}

// ============================================================================
// EMAIL TEMPLATE DATA
// ============================================================================

export interface EmailTemplateData {
  subject: string;
  heading: string;
  body: string;
  actionUrl?: string;
  actionText?: string;
  footerText?: string;
  additionalInfo?: Array<{ label: string; value: string }>;
}

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

export interface NotificationPreferences {
  customerId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  
  // Event-specific preferences
  workOrderStatusChanges: boolean;
  serviceApprovals: boolean;
  partApprovals: boolean;
  inspectionReports: boolean;
  paymentConfirmations: boolean;
  appointmentReminders: boolean;
  vehicleReadyAlerts: boolean;
  
  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // Format: "22:00"
  quietHoursEnd?: string;   // Format: "08:00"
}

// ============================================================================
// NOTIFICATION HISTORY
// ============================================================================

export interface NotificationHistory {
  id: string;
  customerId: string;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  status: 'SENT' | 'FAILED' | 'PENDING';
  recipient: string; // email or phone
  subject?: string;
  sentAt?: Date;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// NOTIFICATION SERVICE METHODS
// ============================================================================

export interface INotificationService {
  // Send notifications
  sendNotification(payload: NotificationPayload): Promise<void>;
  sendEmail(recipient: string, templateData: EmailTemplateData): Promise<void>;
  
  // Get preferences
  getPreferences(customerId: string): Promise<NotificationPreferences | null>;
  updatePreferences(customerId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences>;
  
  // History
  getHistory(customerId: string, limit?: number): Promise<NotificationHistory[]>;
  
  // Helper methods
  shouldSendNotification(customerId: string, eventType: NotificationEventType): Promise<boolean>;
}

// ============================================================================
// EVENT EMITTER TYPES
// ============================================================================

export interface NotificationEvent {
  type: NotificationEventType;
  payload: NotificationPayload;
  timestamp: Date;
}

export type NotificationEventHandler = (event: NotificationEvent) => Promise<void> | void;
