import {
  EmailTemplateData,
  NotificationEventType,
  WorkOrderNotificationData,
  ServiceNotificationData,
  PartNotificationData,
  InspectionNotificationData,
  PaymentNotificationData,
  AppointmentNotificationData,
  NotificationData,
} from './notifications.types';

export class EmailTemplates {
  /**
   * Get template data for specific notification event
   */
  getTemplate(eventType: NotificationEventType, data: NotificationData): EmailTemplateData {
    switch (eventType) {
      // Work Order Events
      case NotificationEventType.WORK_ORDER_CREATED:
        return this.workOrderCreatedTemplate(data as WorkOrderNotificationData);
      case NotificationEventType.WORK_ORDER_STATUS_CHANGED:
        return this.workOrderStatusChangedTemplate(data as WorkOrderNotificationData);
      case NotificationEventType.WORK_ORDER_COMPLETED:
        return this.workOrderCompletedTemplate(data as WorkOrderNotificationData);

      // Service Events
      case NotificationEventType.SERVICE_APPROVAL_REQUIRED:
        return this.serviceApprovalRequiredTemplate(data as ServiceNotificationData);
      case NotificationEventType.SERVICE_APPROVED:
        return this.serviceApprovedTemplate(data as ServiceNotificationData);
      case NotificationEventType.SERVICE_REJECTED:
        return this.serviceRejectedTemplate(data as ServiceNotificationData);

      // Part Events
      case NotificationEventType.PART_APPROVAL_REQUIRED:
        return this.partApprovalRequiredTemplate(data as PartNotificationData);
      case NotificationEventType.PART_APPROVED:
        return this.partApprovedTemplate(data as PartNotificationData);
      case NotificationEventType.PART_REJECTED:
        return this.partRejectedTemplate(data as PartNotificationData);

      // Inspection Events
      case NotificationEventType.INSPECTION_COMPLETED:
        return this.inspectionCompletedTemplate(data as InspectionNotificationData);
      case NotificationEventType.INSPECTION_ISSUE_FOUND:
        return this.inspectionIssueFoundTemplate(data as InspectionNotificationData);

      // Payment Events
      case NotificationEventType.PAYMENT_RECEIVED:
        return this.paymentReceivedTemplate(data as PaymentNotificationData);
      case NotificationEventType.INVOICE_GENERATED:
        return this.invoiceGeneratedTemplate(data as PaymentNotificationData);

      // Appointment Events
      case NotificationEventType.APPOINTMENT_CONFIRMED:
        return this.appointmentConfirmedTemplate(data as AppointmentNotificationData);
      case NotificationEventType.APPOINTMENT_REMINDER:
        return this.appointmentReminderTemplate(data as AppointmentNotificationData);
      case NotificationEventType.APPOINTMENT_CANCELLED:
        return this.appointmentCancelledTemplate(data as AppointmentNotificationData);

      // Vehicle Ready
      case NotificationEventType.VEHICLE_READY_FOR_PICKUP:
        return this.vehicleReadyTemplate(data as WorkOrderNotificationData);

      default:
        return this.genericTemplate(eventType, data);
    }
  }

  // ============================================================================
  // WORK ORDER TEMPLATES
  // ============================================================================

  private workOrderCreatedTemplate(data: WorkOrderNotificationData): EmailTemplateData {
    return {
      subject: `Work Order ${data.workOrderNumber} Created`,
      heading: 'Work Order Created',
      body: `
        <p>Hello ${data.customerName},</p>
        <p>Your work order has been created and is now being processed.</p>
        <p>We'll keep you updated on the progress of your ${data.vehicleMake} ${data.vehicleModel}.</p>
      `,
      additionalInfo: [
        { label: 'Work Order #', value: data.workOrderNumber },
        { label: 'Vehicle', value: `${data.vehicleMake} ${data.vehicleModel} ${data.vehicleYear || ''}` },
        { label: 'Status', value: data.status || 'PENDING' },
      ],
      actionUrl: `${process.env.CLIENT_URL}/work-orders/${data.workOrderId}`,
      actionText: 'View Work Order',
      footerText: 'Thank you for choosing MotorTrace!',
    };
  }

  private workOrderStatusChangedTemplate(data: WorkOrderNotificationData): EmailTemplateData {
    const statusMessages: Record<string, string> = {
      PENDING: 'Your work order is awaiting processing.',
      ESTIMATE: 'We\'re preparing an estimate for your approval.',
      IN_PROGRESS: 'Work has begun on your vehicle!',
      WAITING_FOR_PARTS: 'We\'re waiting for parts to arrive.',
      QC_PENDING: 'Your vehicle is undergoing quality control inspection.',
      COMPLETED: 'Your vehicle service is complete!',
      CANCELLED: 'Your work order has been cancelled.',
    };

    return {
      subject: `Work Order ${data.workOrderNumber} Status Update: ${data.status}`,
      heading: 'Status Update',
      body: `
        <p>Hello ${data.customerName},</p>
        <p>${statusMessages[data.status || 'PENDING'] || 'Your work order status has been updated.'}</p>
      `,
      additionalInfo: [
        { label: 'Work Order #', value: data.workOrderNumber },
        { label: 'Vehicle', value: `${data.vehicleMake} ${data.vehicleModel}` },
        { label: 'Previous Status', value: data.oldStatus || 'N/A' },
        { label: 'Current Status', value: data.status || 'PENDING' },
      ],
      actionUrl: `${process.env.CLIENT_URL}/work-orders/${data.workOrderId}`,
      actionText: 'View Details',
    };
  }

  private workOrderCompletedTemplate(data: WorkOrderNotificationData): EmailTemplateData {
    return {
      subject: `Your Vehicle is Ready! - Work Order ${data.workOrderNumber}`,
      heading: '✅ Service Complete',
      body: `
        <p>Hello ${data.customerName},</p>
        <p>Great news! We've completed the work on your ${data.vehicleMake} ${data.vehicleModel}.</p>
        <p>Your vehicle has passed our quality control inspection and is ready for pickup.</p>
      `,
      additionalInfo: [
        { label: 'Work Order #', value: data.workOrderNumber },
        { label: 'Vehicle', value: `${data.vehicleMake} ${data.vehicleModel}` },
        { label: 'Total Amount', value: data.estimatedTotal ? `$${data.estimatedTotal.toFixed(2)}` : 'Pending' },
      ],
      actionUrl: `${process.env.CLIENT_URL}/work-orders/${data.workOrderId}`,
      actionText: 'View Invoice',
      footerText: 'Please bring a valid ID when picking up your vehicle.',
    };
  }

  private vehicleReadyTemplate(data: WorkOrderNotificationData): EmailTemplateData {
    return {
      subject: `🚗 Your ${data.vehicleMake} ${data.vehicleModel} is Ready for Pickup!`,
      heading: 'Vehicle Ready for Pickup',
      body: `
        <p>Hello ${data.customerName},</p>
        <p>Your ${data.vehicleMake} ${data.vehicleModel} has been serviced and is ready to go!</p>
        <p>You can pick it up during our business hours. Please bring a valid ID.</p>
      `,
      additionalInfo: [
        { label: 'Work Order #', value: data.workOrderNumber },
        { label: 'Vehicle', value: `${data.vehicleMake} ${data.vehicleModel}` },
        { label: 'Total Amount', value: data.estimatedTotal ? `$${data.estimatedTotal.toFixed(2)}` : 'Pending' },
      ],
      actionUrl: `${process.env.CLIENT_URL}/work-orders/${data.workOrderId}`,
      actionText: 'View Details',
    };
  }

  // ============================================================================
  // SERVICE TEMPLATES
  // ============================================================================

  private serviceApprovalRequiredTemplate(data: ServiceNotificationData): EmailTemplateData {
    return {
      subject: `⚠️ Approval Needed - Work Order ${data.workOrderNumber}`,
      heading: 'Approval Required',
      body: `
        <p>Hello ${data.customerName},</p>
        <p>We need your approval before proceeding with the following service:</p>
        <p><strong>${data.serviceName}</strong></p>
        <p>${data.serviceDescription}</p>
      `,
      additionalInfo: [
        { label: 'Work Order #', value: data.workOrderNumber },
        { label: 'Service', value: data.serviceName },
        { label: 'Price', value: `$${data.price.toFixed(2)}` },
      ],
      actionUrl: `${process.env.CLIENT_URL}/work-orders/${data.workOrderId}/approve`,
      actionText: 'Approve or Decline',
      footerText: 'Please respond as soon as possible to avoid delays.',
    };
  }

  private serviceApprovedTemplate(data: ServiceNotificationData): EmailTemplateData {
    return {
      subject: `Service Approved - Work Order ${data.workOrderNumber}`,
      heading: '✅ Service Approved',
      body: `
        <p>Hello ${data.customerName},</p>
        <p>Thank you for approving the following service:</p>
        <p><strong>${data.serviceName}</strong></p>
        <p>Our technicians will begin work shortly.</p>
      `,
      additionalInfo: [
        { label: 'Work Order #', value: data.workOrderNumber },
        { label: 'Service', value: data.serviceName },
        { label: 'Price', value: `$${data.price.toFixed(2)}` },
      ],
    };
  }

  private serviceRejectedTemplate(data: ServiceNotificationData): EmailTemplateData {
    return {
      subject: `Service Declined - Work Order ${data.workOrderNumber}`,
      heading: 'Service Declined',
      body: `
        <p>Hello ${data.customerName},</p>
        <p>We've noted that you declined the following service:</p>
        <p><strong>${data.serviceName}</strong></p>
        <p>We'll proceed with the remaining work on your vehicle.</p>
      `,
      additionalInfo: [
        { label: 'Work Order #', value: data.workOrderNumber },
        { label: 'Service', value: data.serviceName },
      ],
    };
  }

  // ============================================================================
  // PART TEMPLATES
  // ============================================================================

  private partApprovalRequiredTemplate(data: PartNotificationData): EmailTemplateData {
    return {
      subject: `⚠️ Part Approval Needed - Work Order ${data.workOrderNumber}`,
      heading: 'Part Approval Required',
      body: `
        <p>Hello ${data.customerName},</p>
        <p>We need your approval to proceed with the following part:</p>
        <p><strong>${data.partName}</strong></p>
        ${data.partDescription ? `<p>${data.partDescription}</p>` : ''}
      `,
      additionalInfo: [
        { label: 'Work Order #', value: data.workOrderNumber },
        { label: 'Part', value: data.partName },
        { label: 'Quantity', value: data.quantity.toString() },
        { label: 'Unit Price', value: `$${data.unitPrice.toFixed(2)}` },
        { label: 'Total', value: `$${data.subtotal.toFixed(2)}` },
      ],
      actionUrl: `${process.env.CLIENT_URL}/work-orders/${data.workOrderId}/approve`,
      actionText: 'Approve or Decline',
      footerText: 'Part approval is required before we can proceed.',
    };
  }

  private partApprovedTemplate(data: PartNotificationData): EmailTemplateData {
    return {
      subject: `Part Approved - Work Order ${data.workOrderNumber}`,
      heading: '✅ Part Approved',
      body: `
        <p>Hello ${data.customerName},</p>
        <p>Thank you for approving the part:</p>
        <p><strong>${data.partName}</strong></p>
        <p>We'll proceed with the installation.</p>
      `,
      additionalInfo: [
        { label: 'Work Order #', value: data.workOrderNumber },
        { label: 'Part', value: data.partName },
        { label: 'Total', value: `$${data.subtotal.toFixed(2)}` },
      ],
    };
  }

  private partRejectedTemplate(data: PartNotificationData): EmailTemplateData {
    return {
      subject: `Part Declined - Work Order ${data.workOrderNumber}`,
      heading: 'Part Declined',
      body: `
        <p>Hello ${data.customerName},</p>
        <p>We've noted that you declined the following part:</p>
        <p><strong>${data.partName}</strong></p>
        <p>Please contact us if you'd like to discuss alternative options.</p>
      `,
      additionalInfo: [
        { label: 'Work Order #', value: data.workOrderNumber },
        { label: 'Part', value: data.partName },
      ],
    };
  }

  // ============================================================================
  // INSPECTION TEMPLATES
  // ============================================================================

  private inspectionCompletedTemplate(data: InspectionNotificationData): EmailTemplateData {
    return {
      subject: `Inspection Complete - Work Order ${data.workOrderNumber}`,
      heading: '🔍 Inspection Complete',
      body: `
        <p>Hello ${data.customerName},</p>
        <p>We've completed the inspection of your ${data.vehicleMake} ${data.vehicleModel}.</p>
        ${data.issuesFound ? `<p><strong>${data.issuesFound} issue(s) found</strong> during inspection.</p>` : '<p>No major issues found!</p>'}
      `,
      additionalInfo: [
        { label: 'Work Order #', value: data.workOrderNumber },
        { label: 'Vehicle', value: `${data.vehicleMake} ${data.vehicleModel}` },
        { label: 'Issues Found', value: data.issuesFound?.toString() || '0' },
        ...(data.criticalIssues ? [{ label: 'Critical Issues', value: data.criticalIssues.toString() }] : []),
      ],
      actionUrl: `${process.env.CLIENT_URL}/work-orders/${data.workOrderId}/inspection`,
      actionText: 'View Inspection Report',
    };
  }

  private inspectionIssueFoundTemplate(data: InspectionNotificationData): EmailTemplateData {
    return {
      subject: `⚠️ Issues Found During Inspection - Work Order ${data.workOrderNumber}`,
      heading: 'Inspection Issues Found',
      body: `
        <p>Hello ${data.customerName},</p>
        <p>During the inspection of your ${data.vehicleMake} ${data.vehicleModel}, we found some issues that need attention.</p>
        ${data.criticalIssues && data.criticalIssues > 0 ? `<p><strong>⚠️ ${data.criticalIssues} critical issue(s) require immediate attention.</strong></p>` : ''}
        <p>Please review the inspection report and approve the necessary repairs.</p>
      `,
      additionalInfo: [
        { label: 'Work Order #', value: data.workOrderNumber },
        { label: 'Vehicle', value: `${data.vehicleMake} ${data.vehicleModel}` },
        { label: 'Total Issues', value: data.issuesFound?.toString() || '0' },
        ...(data.criticalIssues ? [{ label: 'Critical Issues', value: data.criticalIssues.toString() }] : []),
      ],
      actionUrl: `${process.env.CLIENT_URL}/work-orders/${data.workOrderId}/inspection`,
      actionText: 'View Full Report',
      footerText: 'Our service advisor will contact you to discuss the findings.',
    };
  }

  // ============================================================================
  // PAYMENT TEMPLATES
  // ============================================================================

  private paymentReceivedTemplate(data: PaymentNotificationData): EmailTemplateData {
    return {
      subject: `Payment Received - Work Order ${data.workOrderNumber}`,
      heading: '✅ Payment Received',
      body: `
        <p>Hello ${data.customerName},</p>
        <p>We've received your payment of <strong>$${data.amount.toFixed(2)}</strong> for work order ${data.workOrderNumber}.</p>
        <p>Thank you for your business!</p>
      `,
      additionalInfo: [
        { label: 'Work Order #', value: data.workOrderNumber },
        { label: 'Amount', value: `$${data.amount.toFixed(2)}` },
        { label: 'Payment Method', value: data.method },
        { label: 'Status', value: data.status },
      ],
      actionUrl: `${process.env.CLIENT_URL}/work-orders/${data.workOrderId}`,
      actionText: 'View Receipt',
    };
  }

  private invoiceGeneratedTemplate(data: PaymentNotificationData): EmailTemplateData {
    return {
      subject: `Invoice Ready - Work Order ${data.workOrderNumber}`,
      heading: 'Invoice Generated',
      body: `
        <p>Hello ${data.customerName},</p>
        <p>Your invoice for work order ${data.workOrderNumber} is now ready.</p>
        <p><strong>Total Amount: $${data.amount.toFixed(2)}</strong></p>
      `,
      additionalInfo: [
        { label: 'Work Order #', value: data.workOrderNumber },
        { label: 'Invoice #', value: data.invoiceNumber || 'Pending' },
        { label: 'Amount', value: `$${data.amount.toFixed(2)}` },
      ],
      actionUrl: `${process.env.CLIENT_URL}/invoices/${data.invoiceNumber || data.workOrderId}`,
      actionText: 'View Invoice',
    };
  }

  // ============================================================================
  // APPOINTMENT TEMPLATES
  // ============================================================================

  private appointmentConfirmedTemplate(data: AppointmentNotificationData): EmailTemplateData {
    return {
      subject: `Appointment Confirmed - ${new Date(data.appointmentDate).toLocaleDateString()}`,
      heading: '✅ Appointment Confirmed',
      body: `
        <p>Hello ${data.customerName},</p>
        <p>Your appointment has been confirmed!</p>
        <p>We look forward to servicing your ${data.vehicleMake} ${data.vehicleModel}.</p>
      `,
      additionalInfo: [
        { label: 'Date', value: new Date(data.appointmentDate).toLocaleDateString() },
        { label: 'Time', value: data.startTime ? new Date(data.startTime).toLocaleTimeString() : 'TBD' },
        { label: 'Vehicle', value: `${data.vehicleMake} ${data.vehicleModel}` },
        ...(data.services ? [{ label: 'Services', value: data.services.join(', ') }] : []),
      ],
      actionUrl: `${process.env.CLIENT_URL}/appointments/${data.appointmentId}`,
      actionText: 'View Appointment',
      footerText: 'Please arrive 5-10 minutes early for check-in.',
    };
  }

  private appointmentReminderTemplate(data: AppointmentNotificationData): EmailTemplateData {
    return {
      subject: `Reminder: Appointment Tomorrow at ${data.startTime ? new Date(data.startTime).toLocaleTimeString() : 'scheduled time'}`,
      heading: '⏰ Appointment Reminder',
      body: `
        <p>Hello ${data.customerName},</p>
        <p>This is a friendly reminder that your appointment is tomorrow!</p>
        <p>We'll be servicing your ${data.vehicleMake} ${data.vehicleModel}.</p>
      `,
      additionalInfo: [
        { label: 'Date', value: new Date(data.appointmentDate).toLocaleDateString() },
        { label: 'Time', value: data.startTime ? new Date(data.startTime).toLocaleTimeString() : 'TBD' },
        { label: 'Vehicle', value: `${data.vehicleMake} ${data.vehicleModel}` },
      ],
      actionUrl: `${process.env.CLIENT_URL}/appointments/${data.appointmentId}`,
      actionText: 'View Appointment',
      footerText: 'Need to reschedule? Contact us as soon as possible.',
    };
  }

  private appointmentCancelledTemplate(data: AppointmentNotificationData): EmailTemplateData {
    return {
      subject: `Appointment Cancelled`,
      heading: 'Appointment Cancelled',
      body: `
        <p>Hello ${data.customerName},</p>
        <p>Your appointment scheduled for ${new Date(data.appointmentDate).toLocaleDateString()} has been cancelled.</p>
        <p>If you'd like to reschedule, please contact us or book online.</p>
      `,
      actionUrl: `${process.env.CLIENT_URL}/appointments/book`,
      actionText: 'Book New Appointment',
    };
  }

  // ============================================================================
  // GENERIC TEMPLATE
  // ============================================================================

  private genericTemplate(eventType: NotificationEventType, data: any): EmailTemplateData {
    return {
      subject: `Update: ${eventType}`,
      heading: 'Service Update',
      body: `
        <p>You have a new update regarding your service.</p>
        <p>Please log in to view the details.</p>
      `,
      actionUrl: process.env.CLIENT_URL || '#',
      actionText: 'View Details',
    };
  }

  // ============================================================================
  // HTML RENDERER
  // ============================================================================

  /**
   * Render email template to HTML
   */
  renderHTML(data: EmailTemplateData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
    }
    .info-table {
      width: 100%;
      margin: 20px 0;
      border-collapse: collapse;
    }
    .info-table tr {
      border-bottom: 1px solid #eee;
    }
    .info-table td {
      padding: 12px 0;
    }
    .info-table td:first-child {
      font-weight: 600;
      color: #666;
      width: 40%;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #667eea;
      color: white !important;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      background: #f8f8f8;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${data.heading}</h1>
    </div>
    <div class="content">
      ${data.body}
      
      ${data.additionalInfo && data.additionalInfo.length > 0 ? `
        <table class="info-table">
          ${data.additionalInfo.map(info => `
            <tr>
              <td>${info.label}</td>
              <td><strong>${info.value}</strong></td>
            </tr>
          `).join('')}
        </table>
      ` : ''}
      
      ${data.actionUrl && data.actionText ? `
        <div style="text-align: center;">
          <a href="${data.actionUrl}" class="button">${data.actionText}</a>
        </div>
      ` : ''}
      
      ${data.footerText ? `
        <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #666;">
          ${data.footerText}
        </p>
      ` : ''}
    </div>
    <div class="footer">
      <p>This is an automated message from MotorTrace.</p>
      <p>If you have any questions, please contact us.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}
