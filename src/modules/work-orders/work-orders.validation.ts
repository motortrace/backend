import Joi from 'joi';
import { 
  WorkOrderStatus, 
  JobType, 
  JobPriority, 
  JobSource, 
  WarrantyStatus, 
  WorkflowStep, 
  PaymentStatus,
  ServiceStatus,
  PartSource,
  PaymentMethod,
  ApprovalStatus,
  ApprovalMethod,
  ChecklistStatus,
  TirePosition,
  AttachmentCategory
} from '@prisma/client';

// Work Order Creation Schema
export const createWorkOrderSchema = Joi.object({
  customerId: Joi.string().required(),
  vehicleId: Joi.string().required(),
  appointmentId: Joi.string().optional(),
  advisorId: Joi.string().optional(),
  technicianId: Joi.string().optional(),
  status: Joi.string().valid(...Object.values(WorkOrderStatus)).optional(),
  jobType: Joi.string().valid(...Object.values(JobType)).optional(),
  priority: Joi.string().valid(...Object.values(JobPriority)).optional(),
  source: Joi.string().valid(...Object.values(JobSource)).optional(),
  complaint: Joi.string().optional(),
  odometerReading: Joi.number().min(0).optional(),
  warrantyStatus: Joi.string().valid(...Object.values(WarrantyStatus)).optional(),
  estimatedTotal: Joi.number().min(0).optional(),
  estimateNotes: Joi.string().optional(),
  promisedAt: Joi.date().optional(),
  internalNotes: Joi.string().optional(),
  customerNotes: Joi.string().optional(),
  cannedServiceIds: Joi.array().items(Joi.string()).optional(),
  quantities: Joi.array().items(Joi.number().min(1)).optional(),
  prices: Joi.array().items(Joi.number().min(0)).optional(),
  serviceNotes: Joi.array().items(Joi.string()).optional(),
});

// Work Order Update Schema
export const updateWorkOrderSchema = Joi.object({
  status: Joi.string().valid(...Object.values(WorkOrderStatus)).optional(),
  jobType: Joi.string().valid(...Object.values(JobType)).optional(),
  priority: Joi.string().valid(...Object.values(JobPriority)).optional(),
  complaint: Joi.string().optional(),
  odometerReading: Joi.number().min(0).optional(),
  warrantyStatus: Joi.string().valid(...Object.values(WarrantyStatus)).optional(),
  estimatedTotal: Joi.number().min(0).optional(),
  estimateNotes: Joi.string().optional(),
  promisedAt: Joi.date().optional(),
  internalNotes: Joi.string().optional(),
  customerNotes: Joi.string().optional(),
  advisorId: Joi.string().optional(),
  technicianId: Joi.string().optional(),
  openedAt: Joi.date().optional(),
  closedAt: Joi.date().optional(),
  workflowStep: Joi.string().valid(...Object.values(WorkflowStep)).optional(),
  invoiceNumber: Joi.string().optional(),
  finalizedAt: Joi.date().optional(),
  paymentStatus: Joi.string().valid(...Object.values(PaymentStatus)).optional(),
  warrantyClaimNumber: Joi.string().optional(),
  thirdPartyApprovalCode: Joi.string().optional(),
  customerSignature: Joi.string().optional(),
  customerFeedback: Joi.string().optional(),
});

// Work Order Status Update Schema
export const updateWorkOrderStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(WorkOrderStatus)).required(),
  workflowStep: Joi.string().valid(...Object.values(WorkflowStep)).optional(),
});

// Service Advisor Assignment Schema
export const assignServiceAdvisorSchema = Joi.object({
  advisorId: Joi.string().required(),
});

// Technician to Labor Assignment Schema
export const assignTechnicianToLaborSchema = Joi.object({
  technicianId: Joi.string().required(),
});

// Work Order Labor Update Schema
export const updateWorkOrderLaborSchema = Joi.object({
  description: Joi.string().optional(),
  hours: Joi.number().min(0).optional(),
  rate: Joi.number().min(0).optional(),
  subtotal: Joi.number().min(0).optional(),
  technicianId: Joi.string().optional(),
  startTime: Joi.date().optional(),
  endTime: Joi.date().optional(),
  status: Joi.string().valid(...Object.values(ServiceStatus)).optional(),
  notes: Joi.string().optional(),
});

// Validation middleware
export const validateRequest = (schema: Joi.ObjectSchema, location: 'body' | 'query' | 'params' = 'body') => {
  return (req: any, res: any, next: any) => {
    try {
      const data = req[location];
      const { error } = schema.validate(data);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.details,
        });
      }
      next();
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.message,
      });
    }
  };
};



// Work Order Service Creation Schema
export const createWorkOrderServiceSchema = Joi.object({
  cannedServiceId: Joi.string().required(),
  description: Joi.string().optional(),
  quantity: Joi.number().min(1).optional(),
  unitPrice: Joi.number().min(0).optional(),
  notes: Joi.string().optional(),
});

// Payment Creation Schema
export const createPaymentSchema = Joi.object({
  method: Joi.string().valid(...Object.values(PaymentMethod)).required(),
  amount: Joi.number().min(0).required(),
  reference: Joi.string().optional(),
  notes: Joi.string().optional(),
  processedById: Joi.string().optional(),
});

// Work Order Attachment Upload Schema
export const uploadWorkOrderAttachmentSchema = Joi.object({
  fileUrl: Joi.string().required(),
  fileName: Joi.string().optional(),
  fileType: Joi.string().required(),
  fileSize: Joi.number().min(0).optional(),
  description: Joi.string().optional(),
  category: Joi.string().valid(...Object.values(AttachmentCategory)).required(),
  uploadedById: Joi.string().optional(),
});

// Work Order Inspection Creation Schema
export const createWorkOrderInspectionSchema = Joi.object({
  inspectorId: Joi.string().required(),
  notes: Joi.string().optional(),
});

// Work Order QC Creation Schema
export const createWorkOrderQCSchema = Joi.object({
  passed: Joi.boolean().required(),
  inspectorId: Joi.string().optional(),
  notes: Joi.string().optional(),
  reworkRequired: Joi.boolean().optional(),
  reworkNotes: Joi.string().optional(),
});

// Work Order Search Schema
export const searchWorkOrdersSchema = Joi.object({
  query: Joi.string().required(),
  filters: Joi.object().optional(),
});

// Validation middleware functions
export const validateCreateWorkOrder = (req: any, res: any, next: any) => {
  const { error } = createWorkOrderSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateUpdateWorkOrder = (req: any, res: any, next: any) => {
  const { error } = updateWorkOrderSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateUpdateWorkOrderStatus = (req: any, res: any, next: any) => {
  const { error } = updateWorkOrderStatusSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};


export const validateCreateWorkOrderService = (req: any, res: any, next: any) => {
  const { error } = createWorkOrderServiceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateCreatePayment = (req: any, res: any, next: any) => {
  const { error } = createPaymentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateUploadWorkOrderAttachment = (req: any, res: any, next: any) => {
  const { error } = uploadWorkOrderAttachmentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateCreateWorkOrderInspection = (req: any, res: any, next: any) => {
  const { error } = createWorkOrderInspectionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateCreateWorkOrderQC = (req: any, res: any, next: any) => {
  const { error } = createWorkOrderQCSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

export const validateSearchWorkOrders = (req: any, res: any, next: any) => {
  const { error } = searchWorkOrdersSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};
