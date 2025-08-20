import { ChecklistStatus } from '@prisma/client';

// Base types for inspection templates
export interface InspectionTemplate {
  id: string;
  name: string;
  description: string | null; // Changed from string | undefined
  category: string | null; // Changed from string | undefined
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
  inspectorId: string;
  templateId: string | null; // Changed from string | undefined
  date: Date;
  notes: string | null; // Changed from string | undefined
  isCompleted: boolean;
  template?: InspectionTemplate | null;
  checklistItems?: InspectionChecklistItem[] | null;
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

// Request/Response types
export interface CreateInspectionTemplateRequest {
  name: string;
  description?: string;
  category?: string;
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
  isActive?: boolean;
  sortOrder?: number;
}

export interface AssignTemplateToWorkOrderRequest {
  workOrderId: string;
  templateId: string;
  inspectorId: string;
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
