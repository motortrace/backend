export * from './notifications.types';
export * from './notifications.service';
export * from './notification-emitter';
export * from './email-templates';

// Re-export commonly used items
export {
  NotificationService,
  notificationService,
  initializeNotificationService,
} from './notifications.service';

export {
  notificationEmitter,
  notifyWorkOrderStatusChange,
  notifyVehicleReady,
  notifyPartApprovalRequired,
  notifyServiceApprovalRequired,
  notifyPaymentReceived,
  notifyInspectionCompleted,
  notifyAppointmentConfirmed,
} from './notification-emitter';
