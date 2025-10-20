import { EventEmitter } from 'events';
import {
  NotificationEvent,
  NotificationEventType,
  NotificationEventHandler,
  NotificationPayload,
  NotificationChannel,
  NotificationPriority,
} from './notifications.types';
import { notificationService } from './notifications.service';

/**
 * Event-driven notification system
 * Allows decoupled notification triggering from business logic
 */
class NotificationEventEmitter extends EventEmitter {
  private static instance: NotificationEventEmitter;

  private constructor() {
    super();
    this.setupEventHandlers();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): NotificationEventEmitter {
    if (!NotificationEventEmitter.instance) {
      NotificationEventEmitter.instance = new NotificationEventEmitter();
    }
    return NotificationEventEmitter.instance;
  }

  /**
   * Setup default event handlers
   */
  private setupEventHandlers(): void {
    // Auto-send notifications for all events
    this.on('*', async (event: NotificationEvent) => {
      try {
        await notificationService.sendNotification(event.payload);
      } catch (error) {
        console.error('[NotificationEmitter] Failed to send notification:', error);
      }
    });
  }

  /**
   * Emit a notification event
   */
  emitNotification(payload: NotificationPayload): void {
    const event: NotificationEvent = {
      type: payload.eventType,
      payload,
      timestamp: new Date(),
    };

    // Emit both specific event type and wildcard
    this.emit(payload.eventType, event);
    this.emit('*', event);

    console.log(`[NotificationEmitter] Emitted ${payload.eventType} for ${payload.recipient.email || payload.recipient.phone}`);
  }

  /**
   * Register a handler for specific event type
   */
  onEvent(eventType: NotificationEventType, handler: NotificationEventHandler): void {
    this.on(eventType, handler);
  }

  /**
   * Register a handler for all events
   */
  onAnyEvent(handler: NotificationEventHandler): void {
    this.on('*', handler);
  }

  /**
   * Remove a handler
   */
  offEvent(eventType: NotificationEventType, handler: NotificationEventHandler): void {
    this.off(eventType, handler);
  }
}

// Export singleton instance
export const notificationEmitter = NotificationEventEmitter.getInstance();

// ============================================================================
// HELPER FUNCTIONS FOR COMMON NOTIFICATION SCENARIOS
// ============================================================================

/**
 * Notify about work order status change
 */
export function notifyWorkOrderStatusChange(data: {
  workOrderId: string;
  workOrderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear?: number;
  oldStatus: string;
  newStatus: string;
  estimatedTotal?: number;
}): void {
  notificationEmitter.emitNotification({
    eventType: NotificationEventType.WORK_ORDER_STATUS_CHANGED,
    recipient: {
      customerId: data.customerId,
      email: data.customerEmail,
      phone: data.customerPhone,
      name: data.customerName,
    },
    data: {
      workOrderId: data.workOrderId,
      workOrderNumber: data.workOrderNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      vehicleMake: data.vehicleMake,
      vehicleModel: data.vehicleModel,
      vehicleYear: data.vehicleYear,
      oldStatus: data.oldStatus as any,
      status: data.newStatus as any,
      estimatedTotal: data.estimatedTotal,
    },
    channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    priority: NotificationPriority.NORMAL,
  });
}

/**
 * Notify about vehicle ready for pickup
 */
export function notifyVehicleReady(data: {
  workOrderId: string;
  workOrderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  vehicleMake: string;
  vehicleModel: string;
  estimatedTotal?: number;
}): void {
  notificationEmitter.emitNotification({
    eventType: NotificationEventType.VEHICLE_READY_FOR_PICKUP,
    recipient: {
      customerId: data.customerId,
      email: data.customerEmail,
      phone: data.customerPhone,
      name: data.customerName,
    },
    data: {
      workOrderId: data.workOrderId,
      workOrderNumber: data.workOrderNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      vehicleMake: data.vehicleMake,
      vehicleModel: data.vehicleModel,
      estimatedTotal: data.estimatedTotal,
    },
    channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    priority: NotificationPriority.HIGH,
  });
}

/**
 * Notify about part approval required
 */
export function notifyPartApprovalRequired(data: {
  partId: string;
  workOrderId: string;
  workOrderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  partName: string;
  partDescription?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}): void {
  notificationEmitter.emitNotification({
    eventType: NotificationEventType.PART_APPROVAL_REQUIRED,
    recipient: {
      customerId: data.customerId,
      email: data.customerEmail,
      name: data.customerName,
    },
    data: {
      partId: data.partId,
      workOrderId: data.workOrderId,
      workOrderNumber: data.workOrderNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      partName: data.partName,
      partDescription: data.partDescription,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      subtotal: data.subtotal,
    },
    channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    priority: NotificationPriority.HIGH,
  });
}

/**
 * Notify about service approval required
 */
export function notifyServiceApprovalRequired(data: {
  serviceId: string;
  workOrderId: string;
  workOrderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  serviceName: string;
  serviceDescription: string;
  price: number;
}): void {
  notificationEmitter.emitNotification({
    eventType: NotificationEventType.SERVICE_APPROVAL_REQUIRED,
    recipient: {
      customerId: data.customerId,
      email: data.customerEmail,
      name: data.customerName,
    },
    data: {
      serviceId: data.serviceId,
      workOrderId: data.workOrderId,
      workOrderNumber: data.workOrderNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      serviceName: data.serviceName,
      serviceDescription: data.serviceDescription,
      price: data.price,
    },
    channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    priority: NotificationPriority.HIGH,
  });
}

/**
 * Notify about payment received
 */
export function notifyPaymentReceived(data: {
  paymentId: string;
  workOrderId: string;
  workOrderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  amount: number;
  method: string;
}): void {
  notificationEmitter.emitNotification({
    eventType: NotificationEventType.PAYMENT_RECEIVED,
    recipient: {
      customerId: data.customerId,
      email: data.customerEmail,
      name: data.customerName,
    },
    data: {
      paymentId: data.paymentId,
      workOrderId: data.workOrderId,
      workOrderNumber: data.workOrderNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      amount: data.amount,
      method: data.method,
      status: 'PAID' as any,
    },
    channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    priority: NotificationPriority.NORMAL,
  });
}

/**
 * Notify about inspection completed
 */
export function notifyInspectionCompleted(data: {
  inspectionId: string;
  workOrderId: string;
  workOrderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  vehicleMake: string;
  vehicleModel: string;
  issuesFound?: number;
  criticalIssues?: number;
}): void {
  notificationEmitter.emitNotification({
    eventType: data.criticalIssues && data.criticalIssues > 0
      ? NotificationEventType.INSPECTION_ISSUE_FOUND
      : NotificationEventType.INSPECTION_COMPLETED,
    recipient: {
      customerId: data.customerId,
      email: data.customerEmail,
      name: data.customerName,
    },
    data: {
      inspectionId: data.inspectionId,
      workOrderId: data.workOrderId,
      workOrderNumber: data.workOrderNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      vehicleMake: data.vehicleMake,
      vehicleModel: data.vehicleModel,
      issuesFound: data.issuesFound,
      criticalIssues: data.criticalIssues,
    },
    channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    priority: data.criticalIssues && data.criticalIssues > 0
      ? NotificationPriority.HIGH
      : NotificationPriority.NORMAL,
  });
}

/**
 * Notify about appointment confirmation
 */
export function notifyAppointmentConfirmed(data: {
  appointmentId: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  vehicleMake: string;
  vehicleModel: string;
  appointmentDate: Date;
  startTime?: Date;
  services?: string[];
}): void {
  notificationEmitter.emitNotification({
    eventType: NotificationEventType.APPOINTMENT_CONFIRMED,
    recipient: {
      customerId: data.customerId,
      email: data.customerEmail,
      phone: data.customerPhone,
      name: data.customerName,
    },
    data: {
      appointmentId: data.appointmentId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      vehicleMake: data.vehicleMake,
      vehicleModel: data.vehicleModel,
      appointmentDate: data.appointmentDate,
      startTime: data.startTime,
      status: 'CONFIRMED' as any,
      services: data.services,
    },
    channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    priority: NotificationPriority.NORMAL,
  });
}
