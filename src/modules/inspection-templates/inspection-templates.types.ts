import { ChecklistStatus, TirePosition } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Base types for inspection templates
export interface InspectionTemplate {
  id: string;
  name: string;
  description: string | null; // Changed from string | undefined
  category: string | null; // Changed from string | undefined
  imageUrl: string | null; // URL to template image stored in Supabase bucket
  isActive: boolean;
  sortOrder: number | null; // Changed from number | undefined
  createdAt: Date;
  updatedAt: Date;
  templateItems?: InspectionTemplateItem[];
}

export interface InspectionTemplateItem {
  id: string;
  templateId: string;
  name: string;
  description: string | null; // Changed from string | undefined
  category: string | null; // Changed from string | undefined
  sortOrder: number | null; // Changed from number | undefined
  isRequired: boolean;
  allowsNotes: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Work order inspection with template assignment
export interface WorkOrderInspectionWithTemplate {
  id: string;
  workOrderId: string;
  workOrderNumber: string | null; // Direct field for work order number
  inspectorId: string | null; // Now optional to allow creation without inspector
  templateId: string | null; // Changed from string | undefined
  date: Date;
  notes: string | null; // Changed from string | undefined
  isCompleted: boolean;
  template?: InspectionTemplate | null;
  checklistItems?: InspectionChecklistItem[] | null;
  tireChecks?: TireInspection[] | null;
  attachments?: WorkOrderInspectionAttachment[] | null;
  workOrder?: {
    id: string;
    workOrderNumber: string;
  } | null;
}

export interface InspectionChecklistItem {
  id: string;
  inspectionId: string;
  templateItemId: string | null; // Changed from string | undefined
  category: string | null; // Changed from string | undefined
  item: string;
  status: ChecklistStatus;
  notes: string | null; // Changed from string | undefined
  requiresFollowUp: boolean;
  createdAt: Date;
  templateItem?: InspectionTemplateItem | null;
}

export interface TireInspection {
  id: string;
  inspectionId: string;
  position: TirePosition;
  brand: string | null;
  model: string | null;
  size: string | null;
  psi: number | null;
  treadDepth: Decimal | null;
  damageNotes: string | null;
  createdAt: Date;
}

export interface WorkOrderInspectionAttachment {
  id: string;
  inspectionId: string;
  fileUrl: string;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  description: string | null;
  uploadedAt: Date;
}

// Request/Response types
export interface CreateInspectionTemplateRequest {
  name: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  sortOrder?: number;
  templateItems?: CreateTemplateItemRequest[];
}

export interface CreateTemplateItemRequest {
  name: string;
  description?: string;
  category?: string;
  sortOrder?: number;
  isRequired?: boolean;
  allowsNotes?: boolean;
}

export interface UpdateInspectionTemplateRequest {
  name?: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface AssignTemplateToWorkOrderRequest {
  workOrderId: string;
  templateId: string;
  inspectorId?: string;
  notes?: string;
}

export interface CreateInspectionFromTemplateRequest {
  workOrderId: string;
  templateId: string;
  inspectorId: string;
  notes?: string;
  checklistItems?: CreateChecklistItemRequest[];
}

export interface CreateChecklistItemRequest {
  templateItemId?: string;
  category?: string;
  item: string;
  status: ChecklistStatus;
  notes?: string;
  requiresFollowUp?: boolean;
}

export interface UpdateChecklistItemRequest {
  status?: ChecklistStatus;
  notes?: string;
  requiresFollowUp?: boolean;
}

// Query types
export interface InspectionTemplateFilters {
  category?: string;
  isActive?: boolean;
  search?: string;
}

export interface WorkOrderInspectionFilters {
  workOrderId?: string;
  inspectorId?: string;
  templateId?: string;
  isCompleted?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

// Response types
export interface InspectionTemplateResponse {
  success: boolean;
  data?: InspectionTemplate;
  message?: string;
  error?: string;
}

export interface InspectionTemplatesResponse {
  success: boolean;
  data?: InspectionTemplate[];
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface WorkOrderInspectionResponse {
  success: boolean;
  data?: WorkOrderInspectionWithTemplate;
  message?: string;
  error?: string;
}

export interface WorkOrderInspectionsResponse {
  success: boolean;
  data?: WorkOrderInspectionWithTemplate[];
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Template assignment response
export interface TemplateAssignmentResponse {
  success: boolean;
  data?: {
    inspection: WorkOrderInspectionWithTemplate;
    template: InspectionTemplate;
    checklistItems: InspectionChecklistItem[];
  };
  message?: string;
  error?: string;
}
