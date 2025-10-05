import { ChecklistStatus } from '@prisma/client';
import {
  InspectionTemplate,
  InspectionTemplateItem,
  WorkOrderInspectionWithTemplate,
  InspectionChecklistItem,
  CreateInspectionTemplateRequest,
  UpdateInspectionTemplateRequest,
  AssignTemplateToWorkOrderRequest,
  CreateInspectionFromTemplateRequest,
  CreateChecklistItemRequest,
  UpdateChecklistItemRequest,
  InspectionTemplateFilters,
  WorkOrderInspectionFilters,
  InspectionTemplateResponse,
  InspectionTemplatesResponse,
  WorkOrderInspectionResponse,
  WorkOrderInspectionsResponse,
  TemplateAssignmentResponse
} from './inspection-templates.types';
import prisma from '../../infrastructure/database/prisma';

export class InspectionTemplatesService {
  // Template Management
  async createInspectionTemplate(
    data: CreateInspectionTemplateRequest
  ): Promise<InspectionTemplateResponse> {
    try {
      const { templateItems, ...templateData } = data;

      const template = await prisma.inspectionTemplate.create({
        data: {
          ...templateData,
          templateItems: templateItems ? {
            create: templateItems.map(item => ({
              ...item,
              isRequired: item.isRequired ?? true,
              allowsNotes: item.allowsNotes ?? true
            }))
          } : undefined
        },
        include: {
          templateItems: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      });

      return {
        success: true,
        data: template,
        message: 'Inspection template created successfully'
      };
    } catch (error) {
      console.error('Error creating inspection template:', error);
      return {
        success: false,
        error: 'Failed to create inspection template'
      };
    }
  }

  async getInspectionTemplate(id: string): Promise<InspectionTemplateResponse> {
    try {
      const template = await prisma.inspectionTemplate.findUnique({
        where: { id },
        include: {
          templateItems: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      });

      if (!template) {
        return {
          success: false,
          error: 'Inspection template not found'
        };
      }

      return {
        success: true,
        data: template
      };
    } catch (error) {
      console.error('Error fetching inspection template:', error);
      return {
        success: false,
        error: 'Failed to fetch inspection template'
      };
    }
  }

  async getInspectionTemplates(
    filters: InspectionTemplateFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<InspectionTemplatesResponse> {
    try {
      const where: any = {};

      if (filters.category) {
        where.category = filters.category;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { category: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const skip = (page - 1) * limit;

      const [templates, total] = await Promise.all([
        prisma.inspectionTemplate.findMany({
          where,
          include: {
            templateItems: {
              orderBy: { sortOrder: 'asc' }
            }
          },
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' }
          ],
          skip,
          take: limit
        }),
        prisma.inspectionTemplate.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: templates,
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching inspection templates:', error);
      return {
        success: false,
        error: 'Failed to fetch inspection templates'
      };
    }
  }

  async updateInspectionTemplate(
    id: string,
    data: UpdateInspectionTemplateRequest
  ): Promise<InspectionTemplateResponse> {
    try {
      const template = await prisma.inspectionTemplate.update({
        where: { id },
        data,
        include: {
          templateItems: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      });

      return {
        success: true,
        data: template,
        message: 'Inspection template updated successfully'
      };
    } catch (error) {
      console.error('Error updating inspection template:', error);
      return {
        success: false,
        error: 'Failed to update inspection template'
      };
    }
  }

  async deleteInspectionTemplate(id: string): Promise<InspectionTemplateResponse> {
    try {
      // Check if template is being used in any inspections
      const usageCount = await prisma.workOrderInspection.count({
        where: { templateId: id }
      });

      if (usageCount > 0) {
        return {
          success: false,
          error: `Cannot delete template. It is being used in ${usageCount} inspection(s).`
        };
      }

      await prisma.inspectionTemplate.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Inspection template deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting inspection template:', error);
      return {
        success: false,
        error: 'Failed to delete inspection template'
      };
    }
  }

  // Work Order Inspection Management
  async assignTemplateToWorkOrder(
    data: AssignTemplateToWorkOrderRequest
  ): Promise<TemplateAssignmentResponse> {
    try {
      const { workOrderId, templateId, inspectorId, notes } = data;

      // Verify work order exists
      const workOrder = await prisma.workOrder.findUnique({
        where: { id: workOrderId }
      });

      if (!workOrder) {
        return {
          success: false,
          error: 'Work order not found'
        };
      }

      // Verify template exists and is active
      const template = await prisma.inspectionTemplate.findFirst({
        where: { id: templateId, isActive: true },
        include: {
          templateItems: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      });

      if (!template) {
        return {
          success: false,
          error: 'Inspection template not found or inactive'
        };
      }

      // Verify inspector exists only if provided
      if (inspectorId) {
        const inspector = await prisma.technician.findUnique({
          where: { id: inspectorId }
        });

        if (!inspector) {
          return {
            success: false,
            error: 'Inspector not found'
          };
        }
      }

      // Create inspection with template
      const inspection = await prisma.workOrderInspection.create({
        data: {
          workOrderId,
          inspectorId: inspectorId || undefined,
          templateId,
          notes,
          isCompleted: false
        },
        include: {
          template: {
            include: {
              templateItems: {
                orderBy: { sortOrder: 'asc' }
              }
            }
          },
          workOrder: {
            select: {
              id: true,
              workOrderNumber: true
            }
          }
        }
      });

      // Create checklist items from template
      const checklistItems = await Promise.all(
        template.templateItems.map(async (templateItem) => {
          return await prisma.inspectionChecklistItem.create({
            data: {
              inspectionId: inspection.id,
              templateItemId: templateItem.id,
              category: templateItem.category,
              item: templateItem.name,
              status: ChecklistStatus.GREEN, // Default status
              requiresFollowUp: false
            },
            include: {
              templateItem: true
            }
          });
        })
      );

      return {
        success: true,
        data: {
          inspection: {
            ...inspection,
            workOrderNumber: (inspection as any).workOrder?.workOrderNumber || null
          },
          template,
          checklistItems
        },
        message: 'Template assigned to work order successfully'
      };
    } catch (error) {
      console.error('Error assigning template to work order:', error);
      return {
        success: false,
        error: 'Failed to assign template to work order'
      };
    }
  }

  async createInspectionFromTemplate(
    data: CreateInspectionFromTemplateRequest
  ): Promise<TemplateAssignmentResponse> {
    try {
      const { workOrderId, templateId, inspectorId, notes, checklistItems } = data;

      // Verify work order exists
      const workOrder = await prisma.workOrder.findUnique({
        where: { id: workOrderId }
      });

      if (!workOrder) {
        return {
          success: false,
          error: 'Work order not found'
        };
      }

      // Verify template exists and is active
      const template = await prisma.inspectionTemplate.findFirst({
        where: { id: templateId, isActive: true },
        include: {
          templateItems: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      });

      if (!template) {
        return {
          success: false,
          error: 'Inspection template not found or inactive'
        };
      }

      // Verify inspector exists only if provided
      if (inspectorId) {
        const inspector = await prisma.technician.findUnique({
          where: { id: inspectorId }
        });

        if (!inspector) {
          return {
            success: false,
            error: 'Inspector not found'
          };
        }
      }

      // Create inspection with template
      const inspection = await prisma.workOrderInspection.create({
        data: {
          workOrderId,
          inspectorId: inspectorId || undefined,
          templateId,
          notes,
          isCompleted: false
        },
        include: {
          template: {
            include: {
              templateItems: {
                orderBy: { sortOrder: 'asc' }
              }
            }
          },
          workOrder: {
            select: {
              id: true,
              workOrderNumber: true
            }
          }
        }
      });

      // Create checklist items (from template or custom)
      const createdChecklistItems = await Promise.all(
        (checklistItems || template.templateItems).map(async (item) => {
          const isTemplateItem = 'templateItemId' in item;
          
          // Type-safe property access
          const templateItemId = isTemplateItem ? (item as CreateChecklistItemRequest).templateItemId : null;
          const category = item.category || null;
          const itemName = isTemplateItem ? 
            template.templateItems.find(ti => ti.id === templateItemId)?.name || (item as CreateChecklistItemRequest).item :
            (item as any).name || (item as CreateChecklistItemRequest).item;
          const status = (item as CreateChecklistItemRequest).status;
          const notes = (item as CreateChecklistItemRequest).notes || null;
          const requiresFollowUp = (item as CreateChecklistItemRequest).requiresFollowUp || false;
          
          return await prisma.inspectionChecklistItem.create({
            data: {
              inspectionId: inspection.id,
              templateItemId,
              category,
              item: itemName,
              status,
              notes,
              requiresFollowUp
            },
            include: {
              templateItem: true
            }
          });
        })
      );

      return {
        success: true,
        data: {
          inspection: {
            ...inspection,
            workOrderNumber: (inspection as any).workOrder?.workOrderNumber || null
          },
          template,
          checklistItems: createdChecklistItems
        },
        message: 'Inspection created from template successfully'
      };
    } catch (error) {
      console.error('Error creating inspection from template:', error);
      return {
        success: false,
        error: 'Failed to create inspection from template'
      };
    }
  }

  async getWorkOrderInspection(id: string): Promise<WorkOrderInspectionResponse> {
    try {
      const inspection = await prisma.workOrderInspection.findUnique({
        where: { id },
        include: {
          template: {
            include: {
              templateItems: {
                orderBy: { sortOrder: 'asc' }
              }
            }
          },
          checklistItems: {
            include: {
              templateItem: true
            },
            orderBy: { createdAt: 'asc' }
          },
          inspector: {
            include: {
              userProfile: true
            }
          },
          workOrder: {
            select: {
              id: true,
              workOrderNumber: true
            }
          },
          tireChecks: {
            orderBy: { position: 'asc' }
          },
          attachments: {
            orderBy: { uploadedAt: 'desc' }
          }
        }
      });

      if (!inspection) {
        return {
          success: false,
          error: 'Work order inspection not found'
        };
      }

      return {
        success: true,
        data: {
          ...inspection,
          workOrderNumber: inspection.workOrder?.workOrderNumber || null
        }
      };
    } catch (error) {
      console.error('Error fetching work order inspection:', error);
      return {
        success: false,
        error: 'Failed to fetch work order inspection'
      };
    }
  }

  async getWorkOrderInspections(
    filters: WorkOrderInspectionFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<WorkOrderInspectionsResponse> {
    try {
      const where: any = {};

      if (filters.workOrderId) {
        where.workOrderId = filters.workOrderId;
      }

      if (filters.inspectorId) {
        where.inspectorId = filters.inspectorId;
      }

      if (filters.templateId) {
        where.templateId = filters.templateId;
      }

      if (filters.isCompleted !== undefined) {
        where.isCompleted = filters.isCompleted;
      }

      if (filters.dateFrom || filters.dateTo) {
        where.date = {};
        if (filters.dateFrom) {
          where.date.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.date.lte = filters.dateTo;
        }
      }

      const skip = (page - 1) * limit;

      const [inspections, total] = await Promise.all([
        prisma.workOrderInspection.findMany({
          where,
          include: {
            template: {
              include: {
                templateItems: {
                  orderBy: { sortOrder: 'asc' }
                }
              }
            },
            checklistItems: {
              include: {
                templateItem: true
              },
              orderBy: { createdAt: 'asc' }
            },
            inspector: {
              include: {
                userProfile: true
              }
            },
            workOrder: {
              select: {
                id: true,
                workOrderNumber: true
              }
            },
            tireChecks: {
              orderBy: { position: 'asc' }
            },
            attachments: {
              orderBy: { uploadedAt: 'desc' }
            }
          },
          orderBy: { date: 'desc' },
          skip,
          take: limit
        }),
        prisma.workOrderInspection.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: inspections.map(inspection => ({
          ...inspection,
          workOrderNumber: inspection.workOrder?.workOrderNumber || null
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching work order inspections:', error);
      return {
        success: false,
        error: 'Failed to fetch work order inspections'
      };
    }
  }

  async updateWorkOrderInspection(
    id: string,
    data: { notes?: string; isCompleted?: boolean; inspectorId?: string }
  ): Promise<WorkOrderInspectionResponse> {
    try {
      const inspection = await prisma.workOrderInspection.update({
        where: { id },
        data,
        include: {
          template: {
            include: {
              templateItems: {
                orderBy: { sortOrder: 'asc' }
              }
            }
          },
          checklistItems: {
            include: {
              templateItem: true
            },
            orderBy: { createdAt: 'asc' }
          },
          inspector: {
            include: {
              userProfile: true
            }
          },
          workOrder: {
            select: {
              id: true,
              workOrderNumber: true
            }
          },
          tireChecks: {
            orderBy: { position: 'asc' }
          },
          attachments: {
            orderBy: { uploadedAt: 'desc' }
          }
        }
      });

      return {
        success: true,
        data: {
          ...inspection,
          workOrderNumber: inspection.workOrder?.workOrderNumber || null
        },
        message: 'Work order inspection updated successfully'
      };
    } catch (error) {
      console.error('Error updating work order inspection:', error);
      return {
        success: false,
        error: 'Failed to update work order inspection'
      };
    }
  }

  // Checklist Item Management
  async updateChecklistItem(
    id: string,
    data: UpdateChecklistItemRequest
  ): Promise<WorkOrderInspectionResponse> {
    try {
      const checklistItem = await prisma.inspectionChecklistItem.update({
        where: { id },
        data,
        include: {
          inspection: {
            include: {
              template: {
                include: {
                  templateItems: {
                    orderBy: { sortOrder: 'asc' }
                  }
                }
              },
              checklistItems: {
                include: {
                  templateItem: true
                },
                orderBy: { createdAt: 'asc' }
              },
              inspector: {
                include: {
                  userProfile: true
                }
              },
              workOrder: {
                select: {
                  id: true,
                  workOrderNumber: true
                }
              },
              tireChecks: {
                orderBy: { position: 'asc' }
              },
              attachments: {
                orderBy: { uploadedAt: 'desc' }
              }
            }
          }
        }
      });

      return {
        success: true,
        data: {
          ...checklistItem.inspection,
          workOrderNumber: (checklistItem.inspection as any).workOrder?.workOrderNumber || null
        },
        message: 'Checklist item updated successfully'
      };
    } catch (error) {
      console.error('Error updating checklist item:', error);
      return {
        success: false,
        error: 'Failed to update checklist item'
      };
    }
  }

  async addChecklistItem(
    inspectionId: string,
    data: CreateChecklistItemRequest
  ): Promise<WorkOrderInspectionResponse> {
    try {
      await prisma.inspectionChecklistItem.create({
        data: {
          inspectionId,
          templateItemId: data.templateItemId,
          category: data.category,
          item: data.item,
          status: data.status,
          notes: data.notes,
          requiresFollowUp: data.requiresFollowUp || false
        }
      });

      // Return updated inspection
      return await this.getWorkOrderInspection(inspectionId);
    } catch (error) {
      console.error('Error adding checklist item:', error);
      return {
        success: false,
        error: 'Failed to add checklist item'
      };
    }
  }

  async deleteChecklistItem(id: string): Promise<WorkOrderInspectionResponse> {
    try {
      const checklistItem = await prisma.inspectionChecklistItem.findUnique({
        where: { id },
        include: { inspection: true }
      });

      if (!checklistItem) {
        return {
          success: false,
          error: 'Checklist item not found'
        };
      }

      await prisma.inspectionChecklistItem.delete({
        where: { id }
      });

      // Return updated inspection
      return await this.getWorkOrderInspection(checklistItem.inspectionId);
    } catch (error) {
      console.error('Error deleting checklist item:', error);
      return {
        success: false,
        error: 'Failed to delete checklist item'
      };
    }
  }

  // Utility Methods
  async getAvailableTemplates(): Promise<InspectionTemplatesResponse> {
    return this.getInspectionTemplates({ isActive: true });
  }

  async getTemplatesByCategory(category: string): Promise<InspectionTemplatesResponse> {
    return this.getInspectionTemplates({ category, isActive: true });
  }

  async getWorkOrderInspectionsByWorkOrder(workOrderId: string): Promise<WorkOrderInspectionsResponse> {
    return this.getWorkOrderInspections({ workOrderId });
  }

  async getWorkOrderInspectionsByInspector(inspectorId: string): Promise<WorkOrderInspectionsResponse> {
    return this.getWorkOrderInspections({ inspectorId });
  }

  // Work Order Inspection Status Methods
  async getWorkOrderInspectionStatus(workOrderId: string): Promise<{
    success: boolean;
    data?: {
      totalInspections: number;
      completedInspections: number;
      pendingInspections: number;
      allCompleted: boolean;
      inspections: Array<{
        id: string;
        templateName: string;
        inspectorName: string;
        isCompleted: boolean;
        completedAt?: Date;
                 checklistItems: Array<{
           id: string;
           item: string;
           status: ChecklistStatus;
           requiresFollowUp: boolean;
           notes?: string;
         }>;
      }>;
    };
    error?: string;
  }> {
    try {
      // Get all inspections for the work order
      const inspections = await prisma.workOrderInspection.findMany({
        where: { workOrderId },
        include: {
          template: true,
          inspector: {
            include: {
              userProfile: true
            }
          },
          checklistItems: {
            orderBy: { createdAt: 'asc' }
          },
          workOrder: {
            select: {
              id: true,
              workOrderNumber: true
            }
          },
          tireChecks: {
            orderBy: { position: 'asc' }
          },
          attachments: {
            orderBy: { uploadedAt: 'desc' }
          }
        },
        orderBy: { date: 'asc' }
      });

      if (inspections.length === 0) {
        return {
          success: true,
          data: {
            totalInspections: 0,
            completedInspections: 0,
            pendingInspections: 0,
            allCompleted: false,
            inspections: []
          }
        };
      }

      const totalInspections = inspections.length;
      const completedInspections = inspections.filter(inspection => inspection.isCompleted).length;
      const pendingInspections = totalInspections - completedInspections;
      const allCompleted = completedInspections === totalInspections;

              const inspectionDetails = inspections.map(inspection => ({
          id: inspection.id,
          templateName: inspection.template?.name || 'Custom Inspection',
          inspectorName: inspection.inspector?.userProfile?.name || 'No Inspector Assigned',
          isCompleted: inspection.isCompleted,
          completedAt: inspection.isCompleted ? inspection.date : undefined,
          checklistItems: inspection.checklistItems.map(item => ({
            id: item.id,
            item: item.item,
            status: item.status,
            requiresFollowUp: item.requiresFollowUp,
            notes: item.notes || undefined
          }))
        }));

      return {
        success: true,
        data: {
          totalInspections,
          completedInspections,
          pendingInspections,
          allCompleted,
          inspections: inspectionDetails
        }
      };
    } catch (error) {
      console.error('Error getting work order inspection status:', error);
      return {
        success: false,
        error: 'Failed to get work order inspection status'
      };
    }
  }

  async canProceedToEstimate(workOrderId: string): Promise<{
    success: boolean;
    data?: {
      canProceed: boolean;
      reason?: string;
      inspectionStatus: {
        totalInspections: number;
        completedInspections: number;
        pendingInspections: number;
        allCompleted: boolean;
      };
      followUpItems: Array<{
        inspectionId: string;
        templateName: string;
        itemName: string;
        status: ChecklistStatus;
        notes?: string;
      }>;
    };
    error?: string;
  }> {
    try {
      const statusResult = await this.getWorkOrderInspectionStatus(workOrderId);
      
      if (!statusResult.success) {
        return {
          success: false,
          error: statusResult.error || 'Failed to get inspection status'
        };
      }

      const { data: status } = statusResult;
      
      if (!status) {
        return {
          success: false,
          error: 'Failed to get inspection status'
        };
      }

      // Check if all inspections are completed
      if (!status.allCompleted) {
        return {
          success: true,
          data: {
            canProceed: false,
            reason: `${status.pendingInspections} inspection(s) still pending`,
            inspectionStatus: {
              totalInspections: status.totalInspections,
              completedInspections: status.completedInspections,
              pendingInspections: status.pendingInspections,
              allCompleted: status.allCompleted
            },
            followUpItems: []
          }
        };
      }

      // Check for items requiring follow-up
      const followUpItems: Array<{
        inspectionId: string;
        templateName: string;
        itemName: string;
        status: ChecklistStatus;
        notes?: string;
      }> = [];

      status.inspections.forEach((inspection: any) => {
        inspection.checklistItems.forEach((item: any) => {
          if (item.requiresFollowUp) {
            followUpItems.push({
              inspectionId: inspection.id,
              templateName: inspection.templateName,
              itemName: item.item,
              status: item.status,
              notes: item.notes
            });
          }
        });
      });

      const canProceed = followUpItems.length === 0;
      const reason = canProceed 
        ? 'All inspections completed successfully'
        : `${followUpItems.length} item(s) require follow-up before proceeding`;

      return {
        success: true,
        data: {
          canProceed,
          reason,
          inspectionStatus: {
            totalInspections: status.totalInspections,
            completedInspections: status.completedInspections,
            pendingInspections: status.pendingInspections,
            allCompleted: status.allCompleted
          },
          followUpItems
        }
      };
    } catch (error) {
      console.error('Error checking if can proceed to estimate:', error);
      return {
        success: false,
        error: 'Failed to check estimate readiness'
      };
    }
  }

  // Inspection Attachment Management
  async createInspectionAttachment(
    inspectionId: string,
    data: {
      fileUrl: string;
      fileName?: string;
      fileType?: string;
      fileSize?: number;
      description?: string;
    }
  ) {
    try {
      const attachment = await prisma.workOrderInspectionAttachment.create({
        data: {
          inspectionId,
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileType: data.fileType,
          fileSize: data.fileSize,
          description: data.description,
        },
        include: {
          inspection: {
            select: {
              id: true,
              workOrderId: true,
            },
          },
        },
      });

      return {
        success: true,
        data: attachment,
      };
    } catch (error) {
      console.error('Error creating inspection attachment:', error);
      return {
        success: false,
        error: 'Failed to create inspection attachment',
      };
    }
  }

  async getInspectionAttachments(inspectionId: string) {
    try {
      const attachments = await prisma.workOrderInspectionAttachment.findMany({
        where: { inspectionId },
        orderBy: { uploadedAt: 'desc' },
      });

      return {
        success: true,
        data: attachments,
      };
    } catch (error) {
      console.error('Error fetching inspection attachments:', error);
      return {
        success: false,
        error: 'Failed to fetch inspection attachments',
      };
    }
  }

  async deleteInspectionAttachment(attachmentId: string) {
    try {
      await prisma.workOrderInspectionAttachment.delete({
        where: { id: attachmentId },
      });

      return {
        success: true,
        message: 'Inspection attachment deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting inspection attachment:', error);
      return {
        success: false,
        error: 'Failed to delete inspection attachment',
      };
    }
  }

  // Get all templates for the templates page (no pagination, includes all items)
  async getAllTemplatesForPage(): Promise<InspectionTemplatesResponse> {
    try {
      const templates = await prisma.inspectionTemplate.findMany({
        include: {
          templateItems: {
            orderBy: { sortOrder: 'asc' }
          },
          _count: {
            select: {
              workOrderInspections: true
            }
          }
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ]
      });

      return {
        success: true,
        data: templates,
        pagination: {
          page: 1,
          limit: templates.length,
          total: templates.length,
          totalPages: 1
        }
      };
    } catch (error) {
      console.error('Error fetching all templates for page:', error);
      return {
        success: false,
        error: 'Failed to fetch templates',
        data: [],
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          totalPages: 0
        }
      };
    }
  }
}
